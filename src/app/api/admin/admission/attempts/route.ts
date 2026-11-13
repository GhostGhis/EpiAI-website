import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer } from '@/lib/admission/admin';

export async function GET() {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const attempts = await prisma.examAttempt.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      application: {
        select: { id: true, firstName: true, lastName: true, email: true, pipelineStage: true, status: true },
      },
      exam: { select: { title: true, durationMinutes: true, passingScore: true } },
      _count: { select: { events: true } },
    },
  });

  return NextResponse.json({
    attempts: attempts.map((a) => ({
      id: a.id,
      gradeStatus: a.gradeStatus,
      autoScore: a.autoScore,
      adminScore: a.adminScore,
      maxScore: a.maxScore,
      integrityFlag: a.integrityFlag,
      eventCount: a._count.events,
      submittedAt: a.submittedAt?.toISOString() || null,
      startedAt: a.startedAt?.toISOString() || null,
      timedOut: a.timedOut,
      examTitle: a.exam.title,
      passingScore: a.exam.passingScore,
      candidate: {
        id: a.application.id,
        name: `${a.application.firstName} ${a.application.lastName}`,
        email: a.application.email,
        stage: a.application.pipelineStage,
        status: a.application.status,
      },
    })),
  });
}
