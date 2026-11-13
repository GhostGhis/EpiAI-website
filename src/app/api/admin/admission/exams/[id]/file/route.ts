import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer } from '@/lib/admission/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const { id } = await params;
  const kind = request.nextUrl.searchParams.get('kind') === 'key' ? 'key' : 'exam';
  const exam = await prisma.entranceExam.findUnique({ where: { id } });
  if (!exam) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const bytes = kind === 'key' ? exam.keyPdfBytes : exam.examPdfBytes;
  const name = kind === 'key' ? exam.keyPdfName : exam.examPdfName;
  if (!bytes) return NextResponse.json({ error: 'Pas de PDF' }, { status: 404 });
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${(name || 'document.pdf').replace(/"/g, '')}"`,
      'Cache-Control': 'no-store',
    },
  });
}
