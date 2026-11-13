import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmissionReviewer } from '@/lib/admission/admin';

export async function GET() {
  const perm = await requireAdmissionReviewer();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });
  const template = await prisma.interviewTemplate.findFirst({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!template?.pdfBytes) return NextResponse.json({ error: 'Pas de PDF' }, { status: 404 });
  return new NextResponse(new Uint8Array(template.pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${(template.pdfName || 'entretien.pdf').replace(/"/g, '')}"`,
      'Cache-Control': 'no-store',
    },
  });
}
