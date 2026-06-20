import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getThreads,
  getThreadById,
  createThread,
  togglePinThread,
  toggleLockThread,
  deleteThread,
} from '@/lib/forum/repository';
import type { ThreadFilters, CreateThreadInput } from '@/lib/forum/types';
import { rateLimit } from '@/lib/rate-limit';
import { getDisplayNameForClerkId } from '@/lib/users/display-name';

// GET /api/forum/threads - List threads or get one by id
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Fetch single thread by id
    const id = searchParams.get('id');
    if (id) {
      const thread = await getThreadById(id);
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }
      return NextResponse.json(thread);
    }

    // List threads with filters
    const filters: ThreadFilters = {
      categoryId: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      search: searchParams.get('search') || undefined,
      sort: (searchParams.get('sort') as ThreadFilters['sort']) || 'latest',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getThreads(filters, { page, limit });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

// POST /api/forum/threads - Create thread
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const permCheck = await checkUserPermission('content.create');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const limited = rateLimit(`forum-thread:${userId}`, 10, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
      );
    }

    const body: CreateThreadInput = await request.json();

    // Validation
    if (!body.title || !body.content || !body.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const authorName = await getDisplayNameForClerkId(userId);

    const thread = await createThread(body, userId, authorName);

    return NextResponse.json(thread, { status: 201 });
  } catch (error: any) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create thread' },
      { status: 500 }
    );
  }
}

// PATCH /api/forum/threads - Toggle pin/lock (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Pin/Lock sont des actions admin
    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const body = await request.json();
    const { action, threadId } = body;

    if (!threadId || !action) {
      return NextResponse.json(
        { error: 'Missing threadId or action' },
        { status: 400 }
      );
    }

    let thread;

    switch (action) {
      case 'pin':
        thread = await togglePinThread(threadId);
        break;
      case 'lock':
        thread = await toggleLockThread(threadId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(thread);
  } catch (error: any) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update thread' },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/threads
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('id');

    if (!threadId) {
      return NextResponse.json(
        { error: 'Missing thread id' },
        { status: 400 }
      );
    }

    // Vérifier: admin peut tout supprimer, sinon vérifier l'auteur
    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      // Si pas admin, vérifier si c'est l'auteur du thread
      const thread = await getThreadById(threadId);
      if (!thread || thread.authorId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const success = await deleteThread(threadId);

    if (!success) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete thread' },
      { status: 500 }
    );
  }
}
