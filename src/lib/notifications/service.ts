import type { MemberStatus, NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createNotification } from './repository';
import { logger } from '@/lib/logger';

/**
 * Statuts d'adhésion qui reçoivent les communications (emails + notifications).
 * On inclut les membres en essai (`pending`) : ils sont connectés et doivent
 * être tenus au courant, pas seulement les membres validés (`active`).
 */
export const NOTIFIABLE_MEMBER_STATUSES: MemberStatus[] = ['active', 'pending'];

export async function notifyUser(params: {
  clerkId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  const user = await prisma.user.findUnique({ where: { clerkId: params.clerkId } });
  if (!user) return null;
  return createNotification({
    userId: user.id,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  });
}

export async function notifyUserByDbId(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return createNotification(params);
}

export async function notifyAllActiveMembers(params: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  const users = await prisma.user.findMany({
    where: { memberStatus: { in: NOTIFIABLE_MEMBER_STATUSES } },
    select: { id: true },
  });

  if (users.length === 0) return 0;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })),
  });

  logger.info('Bulk notifications sent', { count: users.length, type: params.type });
  return users.length;
}

export async function notifyAdmins(params: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['president', 'admin_general', 'chef_pole'] },
    },
    select: { id: true },
  });

  if (admins.length === 0) return 0;

  await prisma.notification.createMany({
    data: admins.map((u) => ({
      userId: u.id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })),
  });

  return admins.length;
}
