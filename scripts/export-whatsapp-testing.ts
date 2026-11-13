import { writeFile } from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(wa: string): string {
  let s = wa.replace(/[^\d+]/g, '').replace(/^00/, '+');
  if (s.startsWith('+229')) return s;
  if (s.startsWith('+')) return s;
  if (s.startsWith('229')) return `+${s}`;
  // Bénin : souvent 01XXXXXXXX — on garde le 0 national
  return `+229${s}`;
}

async function main() {
  const rows = await prisma.membershipApplication.findMany({
    where: { status: { in: ['testing', 'interviewing'] } },
    select: { firstName: true, lastName: true, whatsapp: true, status: true, email: true },
    orderBy: [{ status: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
  });

  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    const key = normalize(r.whatsapp);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const lines = [
    'Prenom;Nom;WhatsApp;WhatsApp_normalise;Statut;Email',
    ...unique.map((r) =>
      [r.firstName, r.lastName, r.whatsapp, normalize(r.whatsapp), r.status, r.email]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ];

  const out = '/home/ghislino/Downloads/EpiAI_inscrits_test_whatsapp.csv';
  await writeFile(out, `\uFEFF${lines.join('\n')}`, 'utf8');
  console.log(`file\t${out}`);
  console.log(`count\t${unique.length}`);
  for (const r of unique) {
    console.log(`${r.firstName} ${r.lastName}\t${normalize(r.whatsapp)}\t${r.status}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
