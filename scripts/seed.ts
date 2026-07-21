import { PrismaClient } from '@prisma/client';
import { buildDefaultTeamMembers } from '../src/lib/team/seed-data';
import { seedProjects } from './seed-projects';
import { seedResources } from './seed-resources';

const prisma = new PrismaClient();

async function seedPartners() {
  const count = await prisma.partner.count();
  if (count > 0) {
    console.log('Partners already seeded, skipping.');
    return;
  }

  await prisma.partner.createMany({
    data: [
      {
        name: 'Epitech Bénin',
        description: 'École d\'informatique à Cotonou — premier campus Epitech en Afrique, au sein de Sèmè City.',
        type: 'school',
        websiteUrl: 'https://epitech.bj',
        displayOrder: 1,
      },
      {
        name: 'EPI\'AI Alumni',
        description: 'Réseau des anciens membres de l\'association.',
        type: 'alumni',
        displayOrder: 2,
      },
    ],
  });

  console.log('Partners seeded.');
}

async function seedTeam() {
  const count = await prisma.teamMember.count();
  if (count > 0) {
    console.log(`Team already has ${count} members, skipping.`);
    return;
  }

  const members = buildDefaultTeamMembers();
  for (const member of members) {
    await prisma.teamMember.create({
      data: {
        name: member.name,
        role: member.role,
        title: member.title,
        section: member.section,
        poleKey: member.poleKey,
        description: member.description,
        photoUrl: member.photoUrl,
        displayOrder: member.displayOrder,
        isActive: member.isActive,
      },
    });
  }

  console.log(`Team seeded (${members.length} entries).`);
}

async function main() {
  await seedPartners();
  await seedTeam();
  await seedProjects(prisma);
  await seedResources(prisma);
  const { seedTalks } = await import('./seed-talks');
  await seedTalks();
  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
