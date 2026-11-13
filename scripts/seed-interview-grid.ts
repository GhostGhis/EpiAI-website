import { readFile } from 'fs/promises';
import { installOfficialInterviewTemplate } from '../src/lib/admission/install-interview-grid';

async function main() {
  const pdf = await readFile('./public/admission/EpiAI_Grille_Entretien_Admission.pdf');
  const t = await installOfficialInterviewTemplate({
    createdBy: 'system-seed',
    pdfBytes: pdf,
    pdfName: 'EpiAI_Grille_Entretien_Admission.pdf',
  });
  console.log(JSON.stringify({ id: t.id, questions: t.questions.length, official: t.official }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
