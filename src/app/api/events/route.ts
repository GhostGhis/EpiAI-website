import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  getEvents,
  createEvent,
} from '@/lib/events/repository';
import type { EventFilters, CreateEventInput } from '@/lib/events/types';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { notifyAllActiveMembers } from '@/lib/notifications/service';

// GET /api/events - List events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let includeUnpublished = false;
    if (all) {
      const check = await checkUserPermission('dashboard.admin');
      if (!('allowed' in check)) {
        return NextResponse.json({ error: check.error }, { status: check.status });
      }
      includeUnpublished = true;
    }

    const filters: EventFilters = {
      categoryId: searchParams.get('category') || undefined,
      upcoming: searchParams.get('upcoming') === 'true',
      past: searchParams.get('past') === 'true',
      search: searchParams.get('search') || undefined,
      includeUnpublished,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || (all ? '100' : '9'));

    const { userId } = await auth();

    const result = await getEvents(filters, { page, limit }, userId || undefined);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create event (admins/chefs de pôle uniquement)
export async function POST(request: NextRequest) {
  try {
    const check = await checkUserPermission('dashboard.admin');
    if (!('allowed' in check)) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { userId } = check;

    const body: CreateEventInput = await request.json();

    // Validation
    if (!body.title || !body.description || !body.categoryId || !body.date || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Récupérer le nom du créateur pour l'activité miroir
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const creatorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';

    const event = await createEvent(body, userId, creatorName);

    if (event.isPublished) {
      const link = `/events/${event.id}`;
      await notifyAllActiveMembers({
        type: 'event',
        title: 'Nouvel événement',
        message: event.title,
        link,
        emailActionLabel: "Voir l'événement",
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
