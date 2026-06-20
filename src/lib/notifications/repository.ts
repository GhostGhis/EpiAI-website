import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

export type NotificationCounts = {
  total: number;
  forum: number;
  event: number;
  activity: number;
  membership: number;
  system: number;
};

const EMPTY_COUNTS: NotificationCounts = {
  total: 0,
  forum: 0,
  event: 0,
  activity: 0,
  membership: 0,
  system: 0,
};

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({ data });
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function getUnreadCountsByType(userId: string): Promise<NotificationCounts> {
  const rows = await prisma.notification.groupBy({
    by: ['type'],
    where: { userId, isRead: false },
    _count: { _all: true },
  });

  const counts = { ...EMPTY_COUNTS };

  for (const row of rows) {
    const n = row._count._all;
    counts[row.type] = n;
    counts.total += n;
  }

  return counts;
}

export async function markNotificationsReadByType(userId: string, type: NotificationType) {
  return prisma.notification.updateMany({
    where: { userId, type, isRead: false },
    data: { isRead: true },
  });
}
