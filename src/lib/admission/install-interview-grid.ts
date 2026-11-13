import { prisma } from '@/lib/prisma';
import {
  INTERVIEW_GUIDE,
  INTERVIEW_SECTIONS,
  flattenInterviewQuestions,
} from '@/lib/admission/interview-grid';

export async function installOfficialInterviewTemplate(opts: {
  createdBy: string;
  pdfBytes?: Buffer | null;
  pdfName?: string | null;
}) {
  const questions = flattenInterviewQuestions();
  const guideJson = JSON.stringify({
    ...INTERVIEW_GUIDE,
    sections: INTERVIEW_SECTIONS.map((s) => ({
      id: s.id,
      title: s.title,
      maxPoints: s.maxPoints,
      intro: s.intro,
    })),
  });

  await prisma.interviewTemplate.updateMany({ data: { active: false }, where: { active: true } });

  const template = await prisma.interviewTemplate.create({
    data: {
      title: INTERVIEW_GUIDE.title,
      official: true,
      guideJson,
      pdfBytes: opts.pdfBytes ?? undefined,
      pdfName: opts.pdfName ?? 'EpiAI_Grille_Entretien_Admission.pdf',
      createdBy: opts.createdBy,
      active: true,
      questions: {
        create: questions.map((q, i) => ({
          sortOrder: i,
          code: q.code,
          section: q.section,
          prompt: q.prompt,
          kind: 'scale',
          maxPoints: q.maxPoints,
          lookingFor: q.lookingFor,
          followUp: q.followUp,
          criteriaJson: JSON.stringify(q.criteria),
          isVeto: Boolean(q.isVeto),
        })),
      },
    },
    include: { questions: { orderBy: { sortOrder: 'asc' } } },
  });

  return template;
}
