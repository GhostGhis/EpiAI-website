import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMembershipAdmin } from '@/lib/admission/admin';

export async function GET() {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const reviewers = await prisma.admissionReviewer.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    reviewers: reviewers.map((r) => ({
      id: r.id,
      clerkUserId: r.clerkUserId,
      email: r.email,
      displayName: r.displayName,
      addedBy: r.addedBy,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const body = (await request.json()) as {
    clerkUserId?: string;
    email?: string;
    displayName?: string;
  };

  const clerkUserId = body.clerkUserId?.trim();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Membre requis' }, { status: 400 });
  }

  if (clerkUserId === perm.userId) {
    return NextResponse.json(
      { error: 'Tu as déjà accès via ton rôle admin.' },
      { status: 400 },
    );
  }

  const existing = await prisma.admissionReviewer.findUnique({ where: { clerkUserId } });
  if (existing) {
    return NextResponse.json({
      reviewer: {
        id: existing.id,
        clerkUserId: existing.clerkUserId,
        email: existing.email,
        displayName: existing.displayName,
        addedBy: existing.addedBy,
        createdAt: existing.createdAt.toISOString(),
      },
    });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { email: true, firstName: true, lastName: true },
  });

  const displayName =
    body.displayName?.trim() ||
    (dbUser ? `${dbUser.firstName} ${dbUser.lastName}`.trim() : '') ||
    body.email?.trim() ||
    clerkUserId;
  const email = body.email?.trim() || dbUser?.email || '';

  const reviewer = await prisma.admissionReviewer.create({
    data: {
      clerkUserId,
      email,
      displayName,
      addedBy: perm.userId,
    },
  });

  return NextResponse.json(
    {
      reviewer: {
        id: reviewer.id,
        clerkUserId: reviewer.clerkUserId,
        email: reviewer.email,
        displayName: reviewer.displayName,
        addedBy: reviewer.addedBy,
        createdAt: reviewer.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function DELETE(request: NextRequest) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const id = request.nextUrl.searchParams.get('id');
  const clerkUserId = request.nextUrl.searchParams.get('clerkUserId');
  if (!id && !clerkUserId) {
    return NextResponse.json({ error: 'id ou clerkUserId requis' }, { status: 400 });
  }

  if (id) {
    await prisma.admissionReviewer.deleteMany({ where: { id } });
  } else if (clerkUserId) {
    await prisma.admissionReviewer.deleteMany({ where: { clerkUserId } });
  }

  return NextResponse.json({ success: true });
}
