import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer } from '@/lib/admission/admin';
import { parseInterviewPdf } from '@/lib/admission/parse-pdf';
import { sendAdmissionRejectedEmail } from '@/lib/admission/emails';
import { admitApplicationToMembership } from '@/lib/membership/admit';
import { setApplicationPipeline } from '@/lib/membership/repository';
import { installOfficialInterviewTemplate } from '@/lib/admission/install-interview-grid';
import { INTERVIEW_GUIDE, INTERVIEW_SECTIONS, INTERVIEW_TOTAL_MAX } from '@/lib/admission/interview-grid';

const MAX_PDF = 6 * 1024 * 1024;

function mapQuestion(q: {
  id: string;
  code: string;
  section: string;
  prompt: string;
  kind: string;
  maxPoints: number;
  lookingFor: string;
  followUp: string;
  criteriaJson: string;
  isVeto: boolean;
  sortOrder: number;
}) {
  let criteria: unknown[] = [];
  try {
    criteria = JSON.parse(q.criteriaJson || '[]');
  } catch {
    criteria = [];
  }
  return {
    id: q.id,
    code: q.code,
    section: q.section,
    prompt: q.prompt,
    kind: q.kind,
    maxPoints: q.maxPoints,
    lookingFor: q.lookingFor,
    followUp: q.followUp,
    criteria,
    isVeto: q.isVeto,
    sortOrder: q.sortOrder,
  };
}

export async function GET() {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const [template, bookings] = await Promise.all([
    prisma.interviewTemplate.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.interviewBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        slot: true,
        application: {
          select: { id: true, firstName: true, lastName: true, email: true, status: true, pipelineStage: true },
        },
        scores: true,
      },
    }),
  ]);

  const waiting = await prisma.membershipApplication.findMany({
    where: { status: 'interviewing' },
    orderBy: { updatedAt: 'desc' },
  });

  let guide: unknown = null;
  if (template?.guideJson) {
    try {
      guide = JSON.parse(template.guideJson);
    } catch {
      guide = null;
    }
  }
  if (!guide && template?.official) {
    guide = {
      ...INTERVIEW_GUIDE,
      sections: INTERVIEW_SECTIONS.map((s) => ({
        id: s.id,
        title: s.title,
        maxPoints: s.maxPoints,
        intro: s.intro,
      })),
    };
  }

  return NextResponse.json({
    canManage: perm.canManage,
    totalMax: INTERVIEW_TOTAL_MAX,
    template: template
      ? {
          id: template.id,
          title: template.title,
          pdfName: template.pdfName,
          hasPdf: Boolean(template.pdfBytes),
          official: template.official,
          guide,
          questions: template.questions.map(mapQuestion),
        }
      : null,
    bookings: bookings.map((b) => {
      let closure: Record<string, unknown> = {};
      try {
        closure = JSON.parse(b.closureJson || '{}') as Record<string, unknown>;
      } catch {
        closure = {};
      }
      return {
        id: b.id,
        status: b.status,
        totalScore: b.totalScore,
        maxScore: b.maxScore,
        notes: b.notes,
        closure,
        startsAt: b.slot.startsAt.toISOString(),
        room: b.slot.room,
        candidate: {
          id: b.application.id,
          name: `${b.application.firstName} ${b.application.lastName}`,
          email: b.application.email,
        },
        scores: b.scores,
      };
    }),
    waiting: waiting.map((a) => ({
      id: a.id,
      name: `${a.firstName} ${a.lastName}`,
      email: a.email,
      stage: a.pipelineStage,
    })),
  });
}

export async function POST(request: NextRequest) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    if (!perm.canManage) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }
    const form = await request.formData();
    const title = String(form.get('title') || 'Entretien de motivation').trim();
    const useOfficial = String(form.get('official') || '') === '1';
    const file = form.get('pdf');
    let pdfBytes: Buffer | null = null;
    let pdfName: string | null = null;
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_PDF) return NextResponse.json({ error: 'PDF trop lourd (6 Mo).' }, { status: 400 });
      pdfBytes = Buffer.from(await file.arrayBuffer());
      pdfName = file.name.slice(0, 180);
    }

    if (useOfficial || (pdfName && /grille.*entretien|entretien.*admission/i.test(pdfName))) {
      const template = await installOfficialInterviewTemplate({
        createdBy: perm.userId,
        pdfBytes,
        pdfName,
      });
      return NextResponse.json({
        templateId: template.id,
        parsed: template.questions.length,
        official: true,
      });
    }

    await prisma.interviewTemplate.updateMany({ data: { active: false }, where: { active: true } });
    const template = await prisma.interviewTemplate.create({
      data: { title, pdfBytes, pdfName, createdBy: perm.userId, active: true },
    });
    let parsed = 0;
    let parseError: string | null = null;
    if (pdfBytes) {
      try {
        const questions = await parseInterviewPdf(pdfBytes);
        if (questions.length) {
          await prisma.interviewQuestion.createMany({
            data: questions.map((q) => ({ templateId: template.id, ...q })),
          });
          parsed = questions.length;
        }
      } catch (err) {
        parseError = err instanceof Error ? err.message : 'Parse failed';
      }
    }
    return NextResponse.json({ templateId: template.id, parsed, parseError });
  }

  const body = (await request.json()) as {
    action?: string;
    bookingId?: string;
    applicationId?: string;
    notes?: string;
    closure?: Record<string, unknown>;
    scores?: Array<{ questionId: string; points: number; remark?: string }>;
    questions?: Array<{ prompt: string; kind: string; maxPoints: number }>;
    templateId?: string;
    decision?: 'validated' | 'rejected';
  };

  if (body.action === 'install-official') {
    if (!perm.canManage) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }
    let pdfBytes: Buffer | null = null;
    const bundled = path.join(process.cwd(), 'public', 'admission', 'EpiAI_Grille_Entretien_Admission.pdf');
    try {
      pdfBytes = await readFile(bundled);
    } catch {
      pdfBytes = null;
    }
    const template = await installOfficialInterviewTemplate({
      createdBy: perm.userId,
      pdfBytes,
      pdfName: 'EpiAI_Grille_Entretien_Admission.pdf',
    });
    return NextResponse.json({
      templateId: template.id,
      parsed: template.questions.length,
      official: true,
    });
  }

  if (body.action === 'save-questions' && body.templateId && body.questions) {
    if (!perm.canManage) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }
    await prisma.interviewQuestion.deleteMany({ where: { templateId: body.templateId } });
    await prisma.interviewQuestion.createMany({
      data: body.questions.map((q, i) => ({
        templateId: body.templateId!,
        prompt: q.prompt.trim(),
        kind: q.kind || 'scale',
        maxPoints: Number(q.maxPoints) || 5,
        sortOrder: i,
      })),
    });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'score' && body.bookingId && body.scores) {
    const booking = await prisma.interviewBooking.findUnique({
      where: { id: body.bookingId },
      include: { application: true },
    });
    if (!booking) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    await prisma.interviewScore.deleteMany({ where: { bookingId: booking.id } });
    await prisma.interviewScore.createMany({
      data: body.scores.map((s) => ({
        bookingId: booking.id,
        questionId: s.questionId,
        points: Number(s.points) || 0,
        remark: s.remark || '',
      })),
    });
    const totalScore = body.scores.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
    const questions = await prisma.interviewQuestion.findMany({
      where: { id: { in: body.scores.map((s) => s.questionId) } },
    });
    const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);

    const vetoQ = questions.find((q) => q.isVeto);
    if (vetoQ && body.decision === 'validated') {
      const vetoScore = body.scores.find((s) => s.questionId === vetoQ.id);
      if (vetoScore && Number(vetoScore.points) <= 1) {
        return NextResponse.json(
          { error: 'Veto D3 (éthique) : note ≤ 1 — admission impossible.' },
          { status: 400 },
        );
      }
    }

    await prisma.interviewBooking.update({
      where: { id: booking.id },
      data: {
        totalScore,
        maxScore,
        notes: body.notes || '',
        closureJson: JSON.stringify(body.closure || {}),
        scoredBy: perm.userId,
        scoredAt: new Date(),
        status: body.decision || 'scored',
      },
    });

    if (body.decision === 'validated') {
      const result = await admitApplicationToMembership({
        applicationId: booking.applicationId,
        reviewerId: perm.userId,
        firstName: booking.application.firstName,
        lastName: booking.application.lastName,
        email: booking.application.email,
      });
      await prisma.interviewBooking.update({
        where: { id: booking.id },
        data: { status: 'validated' },
      });
      return NextResponse.json({ success: true, totalScore, admitted: true, ...result });
    }

    if (body.decision === 'rejected') {
      await setApplicationPipeline(booking.applicationId, {
        status: 'rejected',
        pipelineStage: 'rejected',
        reviewedBy: perm.userId,
      });
      await sendAdmissionRejectedEmail(
        booking.application.email,
        booking.application.firstName,
        'entretien',
      );
      return NextResponse.json({ success: true, totalScore, rejected: true });
    }

    await setApplicationPipeline(booking.applicationId, {
      status: 'interviewing',
      pipelineStage: 'interview_reviewed',
      reviewedBy: perm.userId,
    });
    return NextResponse.json({ success: true, totalScore });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
