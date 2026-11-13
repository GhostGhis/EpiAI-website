import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer } from '@/lib/admission/admin';
import { sendInterviewInviteEmail, sendAdmissionRejectedEmail } from '@/lib/admission/emails';
import { setApplicationPipeline } from '@/lib/membership/repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const { id } = await params;
  const attempt = await prisma.examAttempt.findUnique({
    where: { id },
    include: {
      application: true,
      exam: true,
      answers: { include: { question: true } },
      events: { orderBy: { createdAt: 'desc' }, take: 200 },
    },
  });
  if (!attempt) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      gradeStatus: attempt.gradeStatus,
      autoScore: attempt.autoScore,
      adminScore: attempt.adminScore,
      maxScore: attempt.maxScore,
      adminNotes: attempt.adminNotes,
      integrityFlag: attempt.integrityFlag,
      timedOut: attempt.timedOut,
      startedAt: attempt.startedAt?.toISOString() || null,
      submittedAt: attempt.submittedAt?.toISOString() || null,
      examTitle: attempt.exam.title,
      examId: attempt.exam.id,
      hasSubjectPdf: Boolean(attempt.exam.examPdfBytes),
      passingScore: attempt.exam.passingScore,
      candidate: {
        id: attempt.application.id,
        name: `${attempt.application.firstName} ${attempt.application.lastName}`,
        email: attempt.application.email,
        whatsapp: attempt.application.whatsapp,
      },
      answers: attempt.answers
        .sort((a, b) => a.question.sortOrder - b.question.sortOrder)
        .map((row) => ({
          id: row.id,
          questionId: row.questionId,
          prompt: row.question.prompt,
          type: row.question.type,
          points: row.question.points,
          officialAnswer: row.question.officialAnswer,
          gradingHint: row.question.gradingHint,
          response: row.response,
          autoScore: row.autoScore,
          adminScore: row.adminScore,
        })),
      events: attempt.events.map((e) => ({
        id: e.id,
        type: e.type,
        detail: e.detail,
        createdAt: e.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const { id } = await params;
  const body = (await request.json()) as {
    adminNotes?: string;
    answers?: Array<{ id: string; adminScore: number }>;
    decision?: 'validated' | 'rejected';
  };

  const attempt = await prisma.examAttempt.findUnique({
    where: { id },
    include: { application: true, answers: true },
  });
  if (!attempt) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  if (body.answers) {
    for (const row of body.answers) {
      await prisma.examAnswer.update({
        where: { id: row.id },
        data: { adminScore: Number(row.adminScore) },
      });
    }
  }

  const fresh = await prisma.examAttempt.findUnique({
    where: { id },
    include: { answers: true, application: true },
  });
  if (!fresh) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const adminScore = fresh.answers.reduce((sum, a) => sum + (a.adminScore ?? a.autoScore ?? 0), 0);

  await prisma.examAttempt.update({
    where: { id },
    data: {
      adminScore,
      adminNotes: body.adminNotes ?? fresh.adminNotes,
      ...(body.decision ? { gradeStatus: body.decision } : {}),
    },
  });

  if (body.decision === 'validated') {
    const updated = await setApplicationPipeline(fresh.applicationId, {
      status: 'interviewing',
      pipelineStage: 'interview_invited',
      reviewedBy: perm.userId,
    });
    await sendInterviewInviteEmail({
      email: fresh.application.email,
      firstName: fresh.application.firstName,
      token: updated.accessToken,
    });
  }

  if (body.decision === 'rejected') {
    await setApplicationPipeline(fresh.applicationId, {
      status: 'rejected',
      pipelineStage: 'rejected',
      reviewedBy: perm.userId,
    });
    await sendAdmissionRejectedEmail(fresh.application.email, fresh.application.firstName, 'test d’entrée');
  }

  return NextResponse.json({ success: true, adminScore });
}
