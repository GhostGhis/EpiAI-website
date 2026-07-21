/**
 * Seed / mise à jour des projets pédagogiques Epi'AI.
 * Usage: npm run db:seed:projects
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROADMAP_HOUSING =
  'https://docs.google.com/document/d/1lKzm-fOpA35XHsKAsSX4RgjgSpp3pJgS/edit?usp=sharing';

const ROADMAP_SPAM =
  'https://docs.google.com/document/d/1kwp2ARzAd53ILGt3-buYjqfOapddW8FEvKt-cM6wwc4/edit?usp=sharing';

const ROADMAP_MOVIES =
  'https://docs.google.com/document/d/1JjZ8Se7oGzQwk4iQaRClK8uw4KrblapVxr5kaY-QRFM/edit?usp=sharing';

const DATASET_SPAM =
  'https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset';

const DATASET_MOVIELENS =
  'https://www.kaggle.com/datasets/trishna8/movielens-100k-dataset';

const PROJECTS = [
  {
    titleFr: 'Prédire les prix de logements',
    data: {
      titleEn: 'Housing Price Prediction',
      titleFr: 'Prédire les prix de logements',
      descEn:
        'Machine learning project to predict real estate prices from housing features (surface, location, rooms, etc.).',
      descFr:
        "Projet de machine learning pour prédire les prix de l'immobilier à partir de caractéristiques des logements (surface, localisation, nombre de pièces, etc.).",
      contentEn: `Goal: build a regression model that estimates housing prices from structured data.

The full roadmap (milestones, deliverables, evaluation criteria) is available in the linked Google Doc.

Dataset (shared pedagogical corpus for projects 1 & 2):
${DATASET_SPAM}`,
      contentFr: `Objectif : construire un modèle de régression capable d'estimer le prix d'un logement à partir de données structurées.

La roadmap complète (jalons, livrables, critères d'évaluation) est disponible via le lien Google Docs.

Dataset (corpus pédagogique partagé projets 1 & 2) :
${DATASET_SPAM}`,
      imageUrl:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      status: 'In Development',
      techStack: ['Python', 'pandas', 'scikit-learn', 'Regression', 'Jupyter'],
      githubUrl: null,
      discoveryUrl: ROADMAP_HOUSING,
      published: true,
      createdBy: 'epiai-admin',
    },
  },
  {
    titleFr: 'Détecteur de spam from scratch',
    data: {
      titleEn: 'Spam Detector from Scratch',
      titleFr: 'Détecteur de spam from scratch',
      descEn:
        'Build a spam classifier from scratch using NLP and classic ML — no black-box APIs, full pipeline from raw text to prediction.',
      descFr:
        'Construire un classifieur de spam from scratch avec NLP et ML classique — sans API boîte noire, pipeline complet du texte brut à la prédiction.',
      contentEn: `Goal: implement a spam detection pipeline (text preprocessing, feature extraction, training, evaluation) entirely from scratch.

Follow the roadmap in the linked Google Doc for step-by-step milestones.

Dataset (UCI SMS Spam Collection on Kaggle):
${DATASET_SPAM}`,
      contentFr: `Objectif : implémenter un pipeline de détection de spam (prétraitement texte, extraction de features, entraînement, évaluation) entièrement from scratch.

Suivre la roadmap du Google Docs lié pour les jalons étape par étape.

Dataset (UCI SMS Spam Collection sur Kaggle) :
${DATASET_SPAM}`,
      imageUrl:
        'https://images.unsplash.com/photo-1555949963-aa79d882987c?w=800&q=80',
      status: 'In Development',
      techStack: ['Python', 'NLP', 'scikit-learn', 'Naive Bayes', 'TF-IDF'],
      githubUrl: null,
      discoveryUrl: ROADMAP_SPAM,
      published: true,
      createdBy: 'epiai-admin',
    },
  },
  {
    titleFr: 'Moteur de recommandation de films',
    data: {
      titleEn: 'Movie Recommendation Engine',
      titleFr: 'Moteur de recommandation de films',
      descEn:
        'Build a movie recommendation system from the MovieLens 100K dataset — collaborative filtering, evaluation, and ranking.',
      descFr:
        'Construire un système de recommandation de films à partir du dataset MovieLens 100K — filtrage collaboratif, évaluation et ranking.',
      contentEn: `Goal: design and evaluate a movie recommender (user–item interactions, collaborative filtering / content-based approaches, metrics).

The full roadmap is available in the linked Google Doc.

Dataset (MovieLens 100K on Kaggle):
${DATASET_MOVIELENS}`,
      contentFr: `Objectif : concevoir et évaluer un moteur de recommandation de films (interactions utilisateur–film, filtrage collaboratif / approches content-based, métriques).

La roadmap complète est disponible via le Google Docs lié.

Dataset (MovieLens 100K sur Kaggle) :
${DATASET_MOVIELENS}`,
      imageUrl:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
      status: 'In Development',
      techStack: [
        'Python',
        'pandas',
        'scikit-learn',
        'Collaborative Filtering',
        'MovieLens',
      ],
      githubUrl: null,
      discoveryUrl: ROADMAP_MOVIES,
      published: true,
      createdBy: 'epiai-admin',
    },
  },
];

export async function seedProjects(client: PrismaClient = prisma) {
  for (const project of PROJECTS) {
    const existing = await client.project.findFirst({
      where: { titleFr: project.titleFr },
    });

    if (existing) {
      await client.project.update({
        where: { id: existing.id },
        data: project.data,
      });
      console.log(`✓ Mis à jour : ${project.titleFr} (${existing.id})`);
    } else {
      const created = await client.project.create({ data: project.data });
      console.log(`✓ Créé : ${project.titleFr} (${created.id})`);
    }
  }
}

async function main() {
  await seedProjects();
}

if (process.argv[1]?.includes('seed-projects')) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
