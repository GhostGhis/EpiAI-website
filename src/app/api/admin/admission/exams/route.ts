import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer, requireMembershipAdmin } from '@/lib/admission/admin';
import { parseExamPdfs } from '@/lib/admission/parse-pdf';

const MAX_PDF = 6 * 1024 * 1024;

function examJson(exam: {
  id: string;
  title: string;
  durationMinutes: number;
  passingScore: number | null;
  instructions: string;
  examPdfName: string | null;
  keyPdfName: string | null;
  published: boolean;
  createdAt: Date;
  questions?: Array<unknown>;
  _count?: { questions: number; slots: number; attempts: number };
}) {
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    passingScore: exam.passingScore,
    instructions: exam.instructions,
    examPdfName: exam.examPdfName,
    keyPdfName: exam.keyPdfName,
    published: exam.published,
    createdAt: exam.createdAt.toISOString(),
    questionCount: exam._count?.questions ?? exam.questions?.length ?? 0,
    slotCount: exam._count?.slots ?? 0,
    attemptCount: exam._count?.attempts ?? 0,
  };
}

export async function GET() {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const exams = await prisma.entranceExam.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true, slots: true, attempts: true } } },
  });
  return NextResponse.json({ exams: exams.map(examJson) });
}

export async function POST(request: NextRequest) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const title = String(form.get('title') || '').trim();
    const durationMinutes = Number(form.get('durationMinutes') || 0);
    const passingScore = form.get('passingScore') ? Number(form.get('passingScore')) : null;
    const instructions = String(form.get('instructions') || '').trim();
    if (!title || !durationMinutes || durationMinutes < 5) {
      return NextResponse.json({ error: 'Titre et durée (min. 5 min) requis.' }, { status: 400 });
    }
    const examFile = form.get('examPdf');
    const keyFile = form.get('keyPdf');
    let examPdfBytes: Buffer | null = null;
    let examPdfName: string | null = null;
    let keyPdfBytes: Buffer | null = null;
    let keyPdfName: string | null = null;
    if (examFile instanceof File && examFile.size > 0) {
      if (examFile.size > MAX_PDF) return NextResponse.json({ error: 'PDF sujet trop lourd (6 Mo).' }, { status: 400 });
      examPdfBytes = Buffer.from(await examFile.arrayBuffer());
      examPdfName = examFile.name.slice(0, 180);
    }
    if (keyFile instanceof File && keyFile.size > 0) {
      if (keyFile.size > MAX_PDF) return NextResponse.json({ error: 'PDF corrigé trop lourd (6 Mo).' }, { status: 400 });
      keyPdfBytes = Buffer.from(await keyFile.arrayBuffer());
      keyPdfName = keyFile.name.slice(0, 180);
    }

    const exam = await prisma.entranceExam.create({
      data: {
        title,
        durationMinutes,
        passingScore: passingScore && Number.isFinite(passingScore) ? passingScore : null,
        instructions,
        examPdfBytes,
        examPdfName,
        keyPdfBytes,
        keyPdfName,
        createdBy: perm.userId,
      },
    });

    let parsed = 0;
    let parseError: string | null = null;
    if (examPdfBytes) {
      try {
        const questions = await parseExamPdfs(examPdfBytes, keyPdfBytes);
        if (questions.length) {
          await prisma.entranceExamQuestion.createMany({
            data: questions.map((q) => ({ examId: exam.id, ...q })),
          });
          parsed = questions.length;
        }
      } catch (err) {
        parseError = err instanceof Error ? err.message : 'Parse failed';
      }
    }

    return NextResponse.json({ exam: examJson(exam), parsed, parseError });
  }

  const body = (await request.json()) as {
    title?: string;
    durationMinutes?: number;
    passingScore?: number | null;
    instructions?: string;
  };
  if (!body.title?.trim() || !body.durationMinutes || body.durationMinutes < 5) {
    return NextResponse.json({ error: 'Titre et durée (min. 5 min) requis.' }, { status: 400 });
  }
  const exam = await prisma.entranceExam.create({
    data: {
      title: body.title.trim(),
      durationMinutes: body.durationMinutes,
      passingScore: body.passingScore ?? null,
      instructions: body.instructions?.trim() || '',
      createdBy: perm.userId,
    },
  });
  return NextResponse.json({ exam: examJson(exam), parsed: 0 });
}
