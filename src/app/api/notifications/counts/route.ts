import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/users/repository';
import { getUnreadCountsByType } from '@/lib/notifications/repository';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) {
      return NextResponse.json({
        total: 0,
        forum: 0,
        event: 0,
        activity: 0,
        membership: 0,
        system: 0,
      });
    }

    const counts = await getUnreadCountsByType(dbUser.id);
    return NextResponse.json(counts);
  } catch (error) {
    console.error('[API] Notification counts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
