import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer } from '@/lib/admission/admin';
import { sendInterviewInviteEmail, sendTestInviteEmail } from '@/lib/admission/emails';
import { admissionStatusLabel } from '@/lib/admission/status';

function person(row: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  pipelineStage: string;
  updatedAt: Date;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: `${row.firstName} ${row.lastName}`,
    email: row.email,
    whatsapp: row.whatsapp,
    stage: row.pipelineStage,
    label: admissionStatusLabel(row.pipelineStage),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const [applications, examSlots, interviewSlots] = await Promise.all([
    prisma.membershipApplication.findMany({
      where: { status: { in: ['testing', 'interviewing', 'approved', 'rejected'] } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.examSlot.findMany({
      orderBy: { startsAt: 'asc' },
      include: {
        exam: { select: { title: true } },
        bookings: {
          include: {
            application: {
              select: { id: true, firstName: true, lastName: true, email: true, whatsapp: true, pipelineStage: true },
            },
            attempt: { select: { submittedAt: true, startedAt: true } },
          },
        },
      },
    }),
    prisma.interviewSlot.findMany({
      orderBy: { startsAt: 'asc' },
      include: {
        bookings: {
          include: {
            application: {
              select: { id: true, firstName: true, lastName: true, email: true, whatsapp: true, pipelineStage: true },
            },
          },
        },
      },
    }),
  ]);

  const tests = applications.filter((a) =>
    ['test_invited', 'test_declined', 'test_scheduled', 'test_live', 'test_submitted', 'test_reviewed', 'testing'].includes(
      a.pipelineStage,
    ) || a.status === 'testing',
  );
  const interviews = applications.filter(
    (a) =>
      a.status === 'interviewing' ||
      a.pipelineStage.startsWith('interview_'),
  );

  const testWaiting = tests.filter((a) => a.pipelineStage === 'test_invited');
  const testConfirmed = tests.filter((a) =>
    ['test_scheduled', 'test_live', 'test_submitted', 'test_reviewed'].includes(a.pipelineStage),
  );
  const testDeclined = tests.filter((a) => a.pipelineStage === 'test_declined');
  const interviewWaiting = interviews.filter((a) => a.pipelineStage === 'interview_invited');
  const interviewConfirmed = interviews.filter((a) =>
    ['interview_scheduled', 'interview_reviewed'].includes(a.pipelineStage),
  );
  const interviewDeclined = interviews.filter((a) => a.pipelineStage === 'interview_declined');

  return NextResponse.json({
    stats: {
      testWaiting: testWaiting.length,
      testConfirmed: testConfirmed.length,
      testDeclined: testDeclined.length,
      interviewWaiting: interviewWaiting.length,
      interviewConfirmed: interviewConfirmed.length,
      interviewDeclined: interviewDeclined.length,
    },
    tests: tests.map(person),
    interviews: interviews.map(person),
    examSlots: examSlots.map((s) => ({
      id: s.id,
      examTitle: s.exam.title,
      startsAt: s.startsAt.toISOString(),
      capacity: s.capacity,
      people: s.bookings.map((b) => ({
        id: b.application.id,
        name: `${b.application.firstName} ${b.application.lastName}`,
        email: b.application.email,
        whatsapp: b.application.whatsapp,
        stage: b.application.pipelineStage,
        started: Boolean(b.attempt?.startedAt),
        submitted: Boolean(b.attempt?.submittedAt),
      })),
    })),
    interviewSlots: interviewSlots.map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      room: s.room,
      capacity: s.capacity,
      people: s.bookings.map((b) => ({
        id: b.application.id,
        name: `${b.application.firstName} ${b.application.lastName}`,
        email: b.application.email,
        whatsapp: b.application.whatsapp,
        stage: b.application.pipelineStage,
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const body = (await request.json()) as { applicationId?: string; kind?: 'test' | 'interview' };
  if (!body.applicationId) return NextResponse.json({ error: 'applicationId requis' }, { status: 400 });

  const application = await prisma.membershipApplication.findUnique({ where: { id: body.applicationId } });
  if (!application) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  if (body.kind === 'interview' || application.status === 'interviewing') {
    await sendInterviewInviteEmail({
      email: application.email,
      firstName: application.firstName,
      token: application.accessToken,
    });
    return NextResponse.json({ success: true });
  }

  const exam = await prisma.entranceExam.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  await sendTestInviteEmail({
    email: application.email,
    firstName: application.firstName,
    token: application.accessToken,
    examTitle: exam?.title || 'test d’entrée',
  });
  return NextResponse.json({ success: true });
}
