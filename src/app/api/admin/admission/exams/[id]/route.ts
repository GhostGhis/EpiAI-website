import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer, requireMembershipAdmin } from '@/lib/admission/admin';
import { parseExamPdfs } from '@/lib/admission/parse-pdf';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const { id } = await params;
  const exam = await prisma.entranceExam.findUnique({
    where: { id },
    include: { questions: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!exam) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      passingScore: exam.passingScore,
      instructions: exam.instructions,
      examPdfName: exam.examPdfName,
      keyPdfName: exam.keyPdfName,
      published: exam.published,
      questions: exam.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        type: q.type,
        points: q.points,
        officialAnswer: q.officialAnswer,
        gradingHint: q.gradingHint,
        sortOrder: q.sortOrder,
      })),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    durationMinutes?: number;
    passingScore?: number | null;
    instructions?: string;
    published?: boolean;
    questions?: Array<{
      id?: string;
      prompt: string;
      type: string;
      points: number;
      officialAnswer: string;
      gradingHint?: string;
    }>;
    parse?: boolean;
  };

  const exam = await prisma.entranceExam.findUnique({ where: { id } });
  if (!exam) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  if (body.parse) {
    if (!exam.examPdfBytes) {
      return NextResponse.json({ error: 'Aucun PDF sujet à transformer.' }, { status: 400 });
    }
    const questions = await parseExamPdfs(Buffer.from(exam.examPdfBytes), exam.keyPdfBytes ? Buffer.from(exam.keyPdfBytes) : null);
    await prisma.entranceExamQuestion.deleteMany({ where: { examId: id } });
    if (questions.length) {
      await prisma.entranceExamQuestion.createMany({
        data: questions.map((q) => ({ examId: id, ...q })),
      });
    }
    return NextResponse.json({ parsed: questions.length });
  }

  await prisma.entranceExam.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.durationMinutes !== undefined ? { durationMinutes: body.durationMinutes } : {}),
      ...(body.passingScore !== undefined ? { passingScore: body.passingScore } : {}),
      ...(body.instructions !== undefined ? { instructions: body.instructions } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
    },
  });

  if (body.questions) {
    await prisma.entranceExamQuestion.deleteMany({ where: { examId: id } });
    if (body.questions.length) {
      await prisma.entranceExamQuestion.createMany({
        data: body.questions.map((q, i) => ({
          examId: id,
          prompt: q.prompt.trim(),
          type: q.type || 'short',
          points: Number(q.points) || 1,
          officialAnswer: q.officialAnswer || '',
          gradingHint: q.gradingHint || '',
          sortOrder: i,
        })),
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const { id } = await params;
  await prisma.entranceExam.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
