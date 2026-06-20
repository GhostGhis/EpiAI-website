import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markNotificationsReadByType,
  getUnreadCount,
} from '@/lib/notifications/repository';
import type { NotificationType } from '@prisma/client';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await import('@/lib/users/repository').then((m) => m.getUserByClerkId(userId));
    if (!dbUser) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(dbUser.id),
      getUnreadCount(dbUser.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('[API] Notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await import('@/lib/users/repository').then((m) => m.getUserByClerkId(userId));
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    if (body.markAll) {
      await markAllNotificationsRead(dbUser.id);
    } else if (body.type) {
      await markNotificationsReadByType(dbUser.id, body.type as NotificationType);
    } else if (body.id) {
      await markNotificationRead(body.id, dbUser.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Notifications patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
