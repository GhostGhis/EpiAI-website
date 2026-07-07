import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CATEGORIES as RES_CATEGORIES, TAGS as RES_TAGS } from './categories';
import type {
  ResourceWithDetails,
  CreateResourceInput,
  ResourceFilters,
  PaginationParams,
  PaginatedResponse,
  ICategory,
} from './types';

// Re-export for backwards compatibility
export { CATEGORIES, TAGS } from './categories';

// Difficulté colors
const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-brand-500/20', text: 'text-brand-400', border: 'border-brand-500/30' },
  intermediate: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  advanced: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

// Type icons
const TYPE_ICONS: Record<string, string> = {
  pdf: 'FileText',
  code: 'Code',
  video: 'Play',
  article: 'BookOpen',
  course: 'GraduationCap',
  dataset: 'Database',
};

// Helper pour transformer une resource MongoDB en format API
function transformResource(doc: any): ResourceWithDetails {
  const category = RES_CATEGORIES.find(c => c.id === doc.categoryId);
  const difficultyColors = DIFFICULTY_COLORS[doc.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner;

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    type: doc.type,
    url: doc.url,
    fileUrl: doc.fileUrl,
    fileSize: doc.fileSize,
    fileType: doc.fileType,
    thumbnailUrl: doc.thumbnailUrl,
    isDownloadable: doc.isDownloadable || false,
    categoryId: doc.categoryId,
    categoryName: category?.name.en || 'General',
    categoryColor: category?.color || 'text-gray-400',
    tags: doc.tags || [],
    difficulty: doc.difficulty || 'beginner',
    difficultyColor: `${difficultyColors.bg} ${difficultyColors.text} ${difficultyColors.border}`,
    author: doc.author,
    duration: doc.duration,
    isFeatured: doc.isFeatured || false,
    isPublished: doc.isPublished !== false,
    viewCount: doc.viewCount || 0,
    downloadCount: doc.downloadCount || 0,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// === RESOURCES ===

export async function getResources(
  filters: ResourceFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
): Promise<PaginatedResponse<ResourceWithDetails>> {
  const query: Prisma.ResourceWhereInput = { isPublished: true };

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.type) {
    query.type = filters.type as any;
  }

  if (filters.tag) {
    query.tags = { has: filters.tag };
  }

  if (filters.difficulty) {
    query.difficulty = filters.difficulty as any;
  }

  if (filters.search) {
    query.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { author: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  if (filters.featured) {
    query.isFeatured = true;
  }

  // Tri: featured first, then by date or popularity
  const sort: Prisma.ResourceOrderByWithRelationInput[] = [
    { isFeatured: 'desc' },
    { createdAt: 'desc' },
  ];

  const skip = (pagination.page - 1) * pagination.limit;

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where: query,
      orderBy: sort,
      skip,
      take: pagination.limit,
    }),
    prisma.resource.count({ where: query }),
  ]);

  return {
    data: resources.map(transformResource),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getResourceById(id: string): Promise<ResourceWithDetails | null> {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return null;

  // Incrémenter les vues
  await prisma.resource.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return transformResource(resource);
}

export async function getFeaturedResources(limit: number = 6): Promise<ResourceWithDetails[]> {
  const resources = await prisma.resource.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return resources.map(transformResource);
}

export async function createResource(
  input: CreateResourceInput,
  creatorId: string
): Promise<ResourceWithDetails> {
  const resource = await prisma.resource.create({
    data: {
      ...input,
      viewCount: 0,
      downloadCount: 0,
      isFeatured: false,
      isPublished: true,
      createdBy: creatorId,
    },
  });

  return transformResource(resource);
}

export async function updateResource(
  id: string,
  updates: Partial<CreateResourceInput>
): Promise<ResourceWithDetails | null> {
  const result = await prisma.resource.updateMany({
    where: { id },
    data: updates,
  });

  if (result.count === 0) return null;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return null;

  return transformResource(resource);
}

export async function deleteResource(id: string): Promise<boolean> {
  const result = await prisma.resource.deleteMany({ where: { id } });
  return result.count > 0;
}

export async function toggleFeatureResource(id: string): Promise<ResourceWithDetails | null> {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return null;

  const updated = await prisma.resource.update({
    where: { id },
    data: { isFeatured: !resource.isFeatured },
  });

  return transformResource(updated);
}

export async function incrementDownload(id: string): Promise<void> {
  await prisma.resource.updateMany({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });
}

export async function getUserResources(userId: string): Promise<ResourceWithDetails[]> {
  const resources = await prisma.resource.findMany({
    where: {
      createdBy: userId,
    },
    orderBy: { createdAt: 'desc' },
  });

  return resources.map(transformResource);
}

export async function getPopularResources(limit: number = 6): Promise<ResourceWithDetails[]> {
  const resources = await prisma.resource.findMany({
    where: {
      isPublished: true,
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
  });

  return resources.map(transformResource);
}

export async function getRecentResources(limit: number = 6): Promise<ResourceWithDetails[]> {
  const resources = await prisma.resource.findMany({
    where: {
      isPublished: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return resources.map(transformResource);
}

// === STATS ===

export async function getResourcesStats() {
  const [totalResources, pdfCount, codeCount, videoCount, articleCount, courseCount, datasetCount] = await Promise.all([
    prisma.resource.count({ where: { isPublished: true } }),
    prisma.resource.count({ where: { isPublished: true, type: 'pdf' } }),
    prisma.resource.count({ where: { isPublished: true, type: 'code' } }),
    prisma.resource.count({ where: { isPublished: true, type: 'video' } }),
    prisma.resource.count({ where: { isPublished: true, type: 'article' } }),
    prisma.resource.count({ where: { isPublished: true, type: 'course' } }),
    prisma.resource.count({ where: { isPublished: true, type: 'dataset' } }),
  ]);

  return {
    totalResources,
    byType: {
      pdf: pdfCount,
      code: codeCount,
      video: videoCount,
      article: articleCount,
      course: courseCount,
      dataset: datasetCount,
    },
  };
}
