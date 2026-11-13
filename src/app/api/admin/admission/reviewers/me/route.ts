import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSessionRoleSlug } from '@/lib/auth/checkPermission';
import { getAdmissionAccess } from '@/lib/admission/admin';

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const roleSlug = await getSessionRoleSlug(userId, sessionClaims as Record<string, unknown> | null);
  const access = await getAdmissionAccess(userId, roleSlug);

  return NextResponse.json({
    canManage: access.canManage,
    canReview: access.canReview,
  });
}
