import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getEventById,
  updateEvent,
  deleteEvent,
  togglePublishEvent,
  toggleFeaturedEvent,
} from '@/lib/events/repository';
import type { CreateEventInput } from '@/lib/events/types';

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    const event = await getEventById(id, userId || undefined);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isPublished) {
      const permCheck = await checkUserPermission('dashboard.admin');
      if ('error' in permCheck) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const body = await request.json();
    const { action, ...updates } = body;

    let event;

    switch (action) {
      case 'publish':
        event = await togglePublishEvent(id);
        break;
      case 'feature':
        event = await toggleFeaturedEvent(id);
        break;
      case 'update':
        event = await updateEvent(id, updates as CreateEventInput);
        break;
      default:
        event = await updateEvent(id, updates as CreateEventInput);
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const success = await deleteEvent(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
