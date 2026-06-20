import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getRepliesByThreadId,
  createReply,
  updateReply,
  deleteReply,
  getReplyById,
} from '@/lib/forum/repository';
import type { CreateReplyInput } from '@/lib/forum/types';
import { rateLimit } from '@/lib/rate-limit';
import { getThreadById } from '@/lib/forum/repository';
import { notifyUser } from '@/lib/notifications/service';
import { sendForumReplyEmail } from '@/lib/email/resend';
import { prisma } from '@/lib/prisma';
import { getDisplayNameForClerkId } from '@/lib/users/display-name';

// GET /api/forum/replies?threadId=xxx
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'Missing threadId' },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getRepliesByThreadId(threadId, { page, limit });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

// POST /api/forum/replies - Create reply
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const limited = rateLimit(`forum-reply:${userId}`, 20, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
      );
    }

    const body: CreateReplyInput & { threadId: string } = await request.json();

    if (!body.threadId || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const authorName = await getDisplayNameForClerkId(userId);

    const reply = await createReply(body, body.threadId, userId, authorName);

    const thread = await getThreadById(body.threadId);
    if (thread && thread.authorId !== userId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';
      const threadLink = `${siteUrl}/fr/forum/${thread.id}`;
      await notifyUser({
        clerkId: thread.authorId,
        type: 'forum',
        title: 'Nouvelle réponse',
        message: `${authorName} a répondu à « ${thread.title} »`,
        link: `/forum/${thread.id}`,
      });
      const authorDb = await prisma.user.findUnique({ where: { clerkId: thread.authorId } });
      if (authorDb?.email) {
        sendForumReplyEmail(authorDb.email, thread.title, authorName, threadLink).catch(() => {});
      }
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reply' },
      { status: 500 }
    );
  }
}

// PATCH /api/forum/replies - Update reply
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { replyId, content } = body;

    if (!replyId || !content) {
      return NextResponse.json(
        { error: 'Missing replyId or content' },
        { status: 400 }
      );
    }

    const existing = await getReplyById(replyId);
    if (!existing) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck && existing.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reply = await updateReply(replyId, content);

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reply);
  } catch (error: any) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reply' },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/replies?id=xxx
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
    const replyId = searchParams.get('id');

    if (!replyId) {
      return NextResponse.json(
        { error: 'Missing reply id' },
        { status: 400 }
      );
    }

    // Vérifier: admin ou auteur de la réponse
    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      const reply = await getReplyById(replyId);
      if (!reply || reply.authorId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const success = await deleteReply(replyId);

    if (!success) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reply' },
      { status: 500 }
    );
  }
}
