import { prisma } from '@/lib/prisma';
import { normalizeImageUrl } from '@/lib/utils/image-url';
import { CATEGORIES as EVENT_CATEGORIES } from './categories';
import type {
  EventWithDetails,
  RegistrationWithUser,
  CreateEventInput,
  EventFilters,
  PaginationParams,
  PaginatedResponse,
} from './types';

// Re-export for backwards compatibility
export { CATEGORIES } from './categories';

// Helper pour transformer un event MongoDB en format API
function transformEvent(doc: any, isRegistered: boolean = false): EventWithDetails {
  const category = EVENT_CATEGORIES.find(c => c.id === doc.categoryId);
  const now = new Date();
  const eventDate = new Date(doc.date);
  const isPast = eventDate < now;

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    content: doc.content,
    categoryId: doc.categoryId,
    categoryName: category?.name.en || 'Event',
    categoryColor: category?.color || 'text-gray-400',
    categoryIcon: category?.icon || 'Calendar',
    date: doc.date.toISOString(),
    endDate: doc.endDate?.toISOString(),
    location: doc.location,
    isOnline: doc.isOnline || false,
    onlineLink: doc.onlineLink,
    capacity: doc.capacity,
    registeredCount: doc.registeredCount || 0,
    spotsLeft: Math.max(0, doc.capacity - (doc.registeredCount || 0)),
    imageUrl: normalizeImageUrl(doc.imageUrl),
    gallery: (doc.gallery || []).map((u: string) => normalizeImageUrl(u) || u).filter(Boolean),
    videoUrls: doc.videoUrls || [],
    isPublished: doc.isPublished || false,
    isFeatured: doc.isFeatured || false,
    isRegistered,
    isPast,
    linkedActivityId: doc.linkedActivityId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// Helper pour transformer une registration
function transformRegistration(doc: any): RegistrationWithUser {
  return {
    id: doc.id,
    eventId: doc.eventId,
    userId: doc.userId,
    userName: doc.userName,
    userEmail: doc.userEmail,
    status: doc.status,
    registeredAt: doc.registeredAt.toISOString(),
  };
}

// === EVENTS ===

export async function getEvents(
  filters: EventFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 },
  userId?: string
): Promise<PaginatedResponse<EventWithDetails>> {
  const where: any = { isPublished: true };

  if (filters.categoryId) where.categoryId = filters.categoryId;

  const now = new Date();
  if (filters.upcoming) {
    where.date = { gte: now };
  } else if (filters.past) {
    where.date = { lt: now };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ date: filters.past ? 'desc' : 'asc' }, { isFeatured: 'desc' }],
      skip,
      take: pagination.limit,
    }),
    prisma.event.count({ where }),
  ]);

  let registeredEventIds: Set<string> = new Set();
  if (userId && events.length > 0) {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId,
        eventId: { in: events.map(e => e.id) },
        status: 'registered',
      },
      select: { eventId: true },
    });
    registeredEventIds = new Set(registrations.map(r => r.eventId));
  }

  return {
    data: events.map(e => transformEvent(e, registeredEventIds.has(e.id))),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getEventById(id: string, userId?: string): Promise<EventWithDetails | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return null;

  let isRegistered = false;
  if (userId) {
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });
    isRegistered = !!registration && registration.status === 'registered';
  }

  return transformEvent(event, isRegistered);
}

export async function getFeaturedEvents(limit: number = 3): Promise<EventWithDetails[]> {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
      date: { gte: now },
    },
    orderBy: { date: 'asc' },
    take: limit,
  });

  return events.map(e => transformEvent(e));
}

export async function createEvent(
  input: CreateEventInput,
  creatorId: string,
  creatorName?: string
): Promise<EventWithDetails> {
  const eventDate = new Date(input.date);
  const registrationDeadline = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

  const event = await prisma.$transaction(async tx => {
    const createdEvent = await tx.event.create({
      data: {
        title: input.title,
        description: input.description,
        content: input.content,
        categoryId: input.categoryId,
        date: eventDate,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        location: input.location,
        isOnline: input.isOnline || false,
        onlineLink: input.onlineLink,
        capacity: input.capacity,
        imageUrl: normalizeImageUrl(input.imageUrl),
        gallery: (input.gallery || [])
          .map((u) => normalizeImageUrl(u) || u)
          .filter(Boolean) as string[],
        videoUrls: input.videoUrls || [],
        isPublished: true,
        isFeatured: false,
        registeredCount: 0,
        createdBy: creatorId,
      },
    });

    const mirrorActivity = await tx.activity.create({
      data: {
        title: input.title,
        description: input.description,
        date: eventDate,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        location: input.location,
        isOnline: input.isOnline || false,
        onlineLink: input.onlineLink,
        registrationDeadline,
        isMandatory: false,
        isActive: true,
        createdBy: creatorId,
        createdByName: creatorName || 'Admin',
        linkedEventId: createdEvent.id,
      },
    });

    return tx.event.update({
      where: { id: createdEvent.id },
      data: { linkedActivityId: mirrorActivity.id },
    });
  });

  return transformEvent(event);
}

export async function updateEvent(
  id: string,
  updates: Partial<CreateEventInput>
): Promise<EventWithDetails | null> {
  const existing = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return null;

  const updateData: any = { ...updates };
  if (updates.date) updateData.date = new Date(updates.date);
  if (updates.endDate) updateData.endDate = new Date(updates.endDate);
  if ('imageUrl' in updates) {
    updateData.imageUrl = normalizeImageUrl(updates.imageUrl) ?? null;
  }
  if ('gallery' in updates && updates.gallery) {
    updateData.gallery = updates.gallery
      .map((u) => normalizeImageUrl(u) || u)
      .filter(Boolean);
  }
  if ('videoUrls' in updates && updates.videoUrls) {
    updateData.videoUrls = updates.videoUrls;
  }

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  return transformEvent(event);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return false;

  await prisma.$transaction(async tx => {
    await tx.event.delete({ where: { id } });
    await tx.eventRegistration.deleteMany({ where: { eventId: id } });

    if (event.linkedActivityId) {
      await tx.activity.deleteMany({ where: { id: event.linkedActivityId } });
      await tx.activityRegistration.deleteMany({ where: { activityId: event.linkedActivityId } });
      await tx.attendance.deleteMany({ where: { activityId: event.linkedActivityId } });
    }
  });

  return true;
}

export async function togglePublishEvent(id: string): Promise<EventWithDetails | null> {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return null;

  const updated = await prisma.event.update({
    where: { id },
    data: { isPublished: !event.isPublished },
  });

  return transformEvent(updated);
}

// === REGISTRATIONS ===

export async function registerForEvent(
  eventId: string,
  userId: string,
  userName: string,
  userEmail: string
): Promise<{ success: boolean; event?: EventWithDetails; error?: string }> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  if (!event.isPublished) {
    return { success: false, error: 'Event is not available' };
  }

  if (event.date < new Date()) {
    return { success: false, error: 'Event has already passed' };
  }

  if (event.registeredCount >= event.capacity) {
    return { success: false, error: 'Event is full' };
  }

  const existingReg = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  if (existingReg) {
    if (existingReg.status === 'registered') {
      return { success: false, error: 'Already registered for this event' };
    }
    if (existingReg.status === 'cancelled') {
      await prisma.$transaction(async tx => {
        await tx.eventRegistration.update({
          where: { id: existingReg.id },
          data: {
            status: 'registered',
            registeredAt: new Date(),
          },
        });
        await tx.event.update({
          where: { id: eventId },
          data: { registeredCount: { increment: 1 } },
        });
      });
      return { success: true, event: transformEvent(event) };
    }
  }

  await prisma.$transaction(async tx => {
    await tx.eventRegistration.create({
      data: {
        eventId,
        userId,
        userName,
        userEmail,
        status: 'registered',
        registeredAt: new Date(),
      },
    });
    await tx.event.update({
      where: { id: eventId },
      data: { registeredCount: { increment: 1 } },
    });
  });

  return { success: true, event: transformEvent(event) };
}

export async function cancelRegistration(
  eventId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const activeRegistration = await prisma.eventRegistration.findFirst({
    where: {
      eventId,
      userId,
      status: 'registered',
    },
  });

  if (!activeRegistration) {
    return { success: false, error: 'No registration found' };
  }

  await prisma.$transaction(async tx => {
    await tx.eventRegistration.update({
      where: { id: activeRegistration.id },
      data: { status: 'cancelled' },
    });
    await tx.event.update({
      where: { id: eventId },
      data: { registeredCount: { decrement: 1 } },
    });
  });

  return { success: true };
}

export async function getUserRegistrations(userId: string): Promise<RegistrationWithUser[]> {
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      userId,
      status: 'registered',
    },
    orderBy: { registeredAt: 'desc' },
  });

  return registrations.map(transformRegistration);
}

export async function getEventRegistrations(eventId: string): Promise<RegistrationWithUser[]> {
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      eventId,
      status: 'registered',
    },
    orderBy: { registeredAt: 'desc' },
  });

  return registrations.map(transformRegistration);
}

export async function isUserRegistered(eventId: string, userId: string): Promise<boolean> {
  const registration = await prisma.eventRegistration.findFirst({
    where: {
      eventId,
      userId,
      status: 'registered',
    },
  });

  return !!registration;
}

// === STATS ===

export async function getEventStats() {
  const now = new Date();

  const [upcomingCount, pastCount, totalRegistrations] = await Promise.all([
    prisma.event.count({ where: { isPublished: true, date: { gte: now } } }),
    prisma.event.count({ where: { isPublished: true, date: { lt: now } } }),
    prisma.eventRegistration.count({ where: { status: 'registered' } }),
  ]);

  return {
    upcomingCount,
    pastCount,
    totalRegistrations,
  };
}
