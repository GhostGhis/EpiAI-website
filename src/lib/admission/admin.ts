import { auth } from '@clerk/nextjs/server';
import { checkUserPermission, getSessionRoleSlug } from '@/lib/auth/checkPermission';
import { hasPermission } from '@/lib/roles/utils';
import { prisma } from '@/lib/prisma';

export async function requireMembershipAdmin() {
  const perm = await checkUserPermission('membership.manage');
  if ('error' in perm) return perm;
  return perm;
}

export async function isListedAdmissionReviewer(clerkUserId: string): Promise<boolean> {
  const row = await prisma.admissionReviewer.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  return Boolean(row);
}

/**
 * Accès correction/évaluation : membership.manage OU membre ajouté comme correcteur.
 * canManage = true uniquement pour les admins membership (peut aussi gérer la liste).
 */
export async function requireAdmissionReviewer(): Promise<
  | { userId: string; allowed: true; canManage: boolean }
  | { error: string; status: 401 | 403 }
> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: 'Unauthorized', status: 401 };

  const roleId = await getSessionRoleSlug(userId, sessionClaims as Record<string, unknown> | null);
  if (hasPermission(roleId, 'membership.manage')) {
    return { userId, allowed: true, canManage: true };
  }

  if (await isListedAdmissionReviewer(userId)) {
    return { userId, allowed: true, canManage: false };
  }

  return { error: 'Forbidden: insufficient permissions', status: 403 };
}

export async function getAdmissionAccess(clerkUserId: string, roleSlug: string | undefined) {
  const canManage = hasPermission(roleSlug, 'membership.manage');
  if (canManage) return { canManage: true, canReview: true };
  const canReview = await isListedAdmissionReviewer(clerkUserId);
  return { canManage: false, canReview };
}
