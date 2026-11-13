import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { resolveRoleSlug } from '@/lib/roles/utils';
import { getAdmissionAccess } from '@/lib/admission/admin';
import MembershipAdminClient from './client-page';

export default async function MembershipAdminPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let roleSlug = resolveRoleSlug(
    ((sessionClaims?.publicMetadata as Record<string, unknown>) || null),
  );

  if (!roleSlug) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      roleSlug = resolveRoleSlug(user.publicMetadata as Record<string, unknown>);
    } catch (err) {
      console.error('[Membership Page Server] Clerk API error:', err);
    }
  }

  const access = await getAdmissionAccess(userId, roleSlug);

  if (!access.canReview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-secondary">You don&apos;t have permission to manage memberships.</p>
          <p className="text-sm text-muted mt-2">Role: {roleSlug || 'none'}</p>
        </div>
      </div>
    );
  }

  return <MembershipAdminClient canManage={access.canManage} />;
}
