/**
 * Seed des ressources liées aux projets pédagogiques (datasets + roadmaps).
 * Usage: npm run db:seed:resources
 * Prod:  npm run db:seed:resources:prod
 */
import { PrismaClient, ResourceType, ResourceDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

const ROADMAP_MOVIES =
  'https://docs.google.com/document/d/1JjZ8Se7oGzQwk4iQaRClK8uw4KrblapVxr5kaY-QRFM/edit?usp=sharing';

const DATASET_SPAM =
  'https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset';

const DATASET_MOVIELENS =
  'https://www.kaggle.com/datasets/trishna8/movielens-100k-dataset';

type SeedResource = {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  categoryId: string;
  tags: string[];
  difficulty: ResourceDifficulty;
  author: string;
  isFeatured: boolean;
};

const RESOURCES: SeedResource[] = [
  {
    title: 'Dataset — SMS Spam Collection (Projets 1 & 2)',
    description:
      'Corpus UCI SMS Spam Collection sur Kaggle, utilisé pour les projets pédagogiques 1 et 2 (logements / détecteur de spam). Messages SMS labellisés spam / ham.',
    type: 'dataset',
    url: DATASET_SPAM,
    categoryId: 'ml',
    tags: ['python', 'nlp', 'projet-1', 'projet-2', 'spam'],
    difficulty: 'beginner',
    author: 'UCI / Kaggle',
    isFeatured: true,
  },
  {
    title: 'Dataset — MovieLens 100K (Projet 3)',
    description:
      'Dataset MovieLens 100K sur Kaggle pour le projet « Moteur de recommandation de films » : notes utilisateurs, films, et interactions pour le filtrage collaboratif.',
    type: 'dataset',
    url: DATASET_MOVIELENS,
    categoryId: 'ml',
    tags: ['python', 'projet-3', 'recommandation', 'movielens'],
    difficulty: 'intermediate',
    author: 'GroupLens / Kaggle',
    isFeatured: true,
  },
  {
    title: 'Roadmap — Moteur de recommandation de films (Projet 3)',
    description:
      'Roadmap Google Docs du projet 3 : jalons, livrables et critères pour construire le moteur de recommandation de films.',
    type: 'article',
    url: ROADMAP_MOVIES,
    categoryId: 'ml',
    tags: ['projet-3', 'recommandation', 'roadmap'],
    difficulty: 'intermediate',
    author: "Epi'AI",
    isFeatured: true,
  },
];

export async function seedResources(client: PrismaClient = prisma) {
  for (const resource of RESOURCES) {
    const existing = await client.resource.findFirst({
      where: { title: resource.title },
    });

    const data = {
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url,
      categoryId: resource.categoryId,
      tags: resource.tags,
      difficulty: resource.difficulty,
      author: resource.author,
      isFeatured: resource.isFeatured,
      isPublished: true,
      isDownloadable: false,
      createdBy: 'epiai-admin',
    };

    if (existing) {
      await client.resource.update({
        where: { id: existing.id },
        data,
      });
      console.log(`✓ Mis à jour : ${resource.title} (${existing.id})`);
    } else {
      const created = await client.resource.create({ data });
      console.log(`✓ Créé : ${resource.title} (${created.id})`);
    }
  }
}

async function main() {
  await seedResources();
}

if (process.argv[1]?.includes('seed-resources')) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
