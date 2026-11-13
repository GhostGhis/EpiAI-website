import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer, requireMembershipAdmin } from '@/lib/admission/admin';

export async function GET(request: NextRequest) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const kind = request.nextUrl.searchParams.get('kind') || 'exam';

  if (kind === 'interview') {
    const slots = await prisma.interviewSlot.findMany({
      orderBy: { startsAt: 'asc' },
      include: { _count: { select: { bookings: true } } },
    });
    return NextResponse.json({
      slots: slots.map((s) => ({
        id: s.id,
        startsAt: s.startsAt.toISOString(),
        room: s.room,
        capacity: s.capacity,
        label: s.label,
        booked: s._count.bookings,
      })),
    });
  }

  const examId = request.nextUrl.searchParams.get('examId') || undefined;
  const slots = await prisma.examSlot.findMany({
    where: examId ? { examId } : undefined,
    orderBy: { startsAt: 'asc' },
    include: { exam: { select: { title: true } }, _count: { select: { bookings: true } } },
  });
  return NextResponse.json({
    slots: slots.map((s) => ({
      id: s.id,
      examId: s.examId,
      examTitle: s.exam.title,
      startsAt: s.startsAt.toISOString(),
      capacity: s.capacity,
      label: s.label,
      booked: s._count.bookings,
    })),
  });
}

export async function POST(request: NextRequest) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const body = (await request.json()) as {
    kind?: string;
    examId?: string;
    startsAt?: string;
    capacity?: number;
    room?: string;
    label?: string;
  };
  if (!body.startsAt) return NextResponse.json({ error: 'Date/heure requise' }, { status: 400 });
  const startsAt = new Date(body.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  if (body.kind === 'interview') {
    const slot = await prisma.interviewSlot.create({
      data: {
        startsAt,
        capacity: body.capacity && body.capacity > 0 ? body.capacity : 1,
        room: body.room?.trim() || '',
        label: body.label?.trim() || '',
      },
    });
    return NextResponse.json({ slot });
  }

  if (!body.examId) return NextResponse.json({ error: 'examId requis' }, { status: 400 });
  const slot = await prisma.examSlot.create({
    data: {
      examId: body.examId,
      startsAt,
      capacity: body.capacity && body.capacity > 0 ? body.capacity : 40,
      label: body.label?.trim() || '',
    },
  });
  return NextResponse.json({ slot });
}

export async function DELETE(request: NextRequest) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const id = request.nextUrl.searchParams.get('id');
  const kind = request.nextUrl.searchParams.get('kind') || 'exam';
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  if (kind === 'interview') await prisma.interviewSlot.delete({ where: { id } });
  else await prisma.examSlot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
