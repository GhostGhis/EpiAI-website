import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { getActivities, createActivity } from '@/lib/activities/repository';
import type { CreateActivityInput } from '@/lib/activities/types';
import { notifyAllActiveMembers, NOTIFIABLE_MEMBER_STATUSES } from '@/lib/notifications/service';
import { sendMandatoryActivityEmail } from '@/lib/email/resend';
import { prisma } from '@/lib/prisma';

// GET /api/activities - Liste des activités (membres connectés)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const showPast = searchParams.get('past') === 'true';

    const result = await getActivities({ page, limit }, userId || undefined, showPast);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Créer une activité (admin/logistique only)
export async function POST(request: NextRequest) {
  try {
    const permCheck = await checkUserPermission('activities.create');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const body: CreateActivityInput = await request.json();

    if (!body.title || !body.description || !body.date || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, date, location' },
        { status: 400 }
      );
    }

    // Récupérer le nom de l'admin
    const client = await clerkClient();
    const user = await client.users.getUser(permCheck.userId);
    const creatorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';

    const activity = await createActivity(body, permCheck.userId, creatorName);

    if (activity.isMandatory) {
      const dateStr = new Date(activity.date).toLocaleDateString('fr-FR');
      const link = `/intranet/${activity.id}`;
      await notifyAllActiveMembers({
        type: 'activity',
        title: 'Activité obligatoire',
        message: `${activity.title} — ${dateStr}`,
        link,
      });
      const members = await prisma.user.findMany({
        where: { memberStatus: { in: NOTIFIABLE_MEMBER_STATUSES } },
        select: { email: true, firstName: true },
        take: 200,
      });
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';
      for (const m of members) {
        sendMandatoryActivityEmail(
          m.email,
          m.firstName || 'Membre',
          activity.title,
          dateStr,
          `${siteUrl}/fr${link}`
        ).catch(() => {});
      }
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create activity' },
      { status: 500 }
    );
  }
}
