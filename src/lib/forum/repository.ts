import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { resolveAuthorNames } from '@/lib/users/display-name';
import { CATEGORIES as FORUM_CATEGORIES, TAGS as FORUM_TAGS } from './categories';
import type {
  ThreadWithAuthor,
  ReplyWithAuthor,
  CreateThreadInput,
  CreateReplyInput,
  ThreadFilters,
  PaginationParams,
  PaginatedResponse,
  ICategory,
} from './types';

// Re-export for backwards compatibility
export { CATEGORIES, TAGS } from './categories';

// Helper pour transformer un thread MongoDB en format API
function transformThread(doc: any): ThreadWithAuthor {
  const category = FORUM_CATEGORIES.find(c => c.id === doc.categoryId);
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    authorId: doc.authorId,
    authorName: doc.authorName,
    categoryId: doc.categoryId,
    categoryName: category?.name.en || 'Unknown',
    categoryColor: category?.color || 'text-gray-400',
    tags: doc.tags || [],
    views: doc.views || 0,
    isPinned: doc.isPinned || false,
    isLocked: doc.isLocked || false,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    replyCount: doc.replyCount || 0,
  };
}

// Helper pour transformer une réponse
function transformReply(doc: any): ReplyWithAuthor {
  return {
    id: doc.id,
    threadId: doc.threadId,
    authorId: doc.authorId,
    authorName: doc.authorName,
    content: doc.content,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    isEdited: doc.isEdited || false,
  };
}

// === THREADS ===

export async function getThreads(
  filters: ThreadFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<ThreadWithAuthor>> {
  const query: Prisma.ThreadWhereInput = {};

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.tag) {
    query.tags = { has: filters.tag };
  }

  if (filters.search) {
    query.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
      { authorName: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  // Tri
  let sort: Prisma.ThreadOrderByWithRelationInput[] = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
  if (filters.sort === 'oldest') {
    sort = [{ isPinned: 'desc' }, { createdAt: 'asc' }];
  } else if (filters.sort === 'popular') {
    sort = [{ isPinned: 'desc' }, { views: 'desc' }];
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: query,
      orderBy: sort,
      skip,
      take: pagination.limit,
    }),
    prisma.thread.count({ where: query }),
  ]);

  const transformed = threads.map(transformThread);
  const data = await resolveAuthorNames(transformed);

  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getThreadById(id: string): Promise<ThreadWithAuthor | null> {
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return null;

  // Incrémenter les vues
  await prisma.thread.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const [resolved] = await resolveAuthorNames([transformThread(thread)]);
  return resolved;
}

export async function createThread(
  input: CreateThreadInput,
  authorId: string,
  authorName: string
): Promise<ThreadWithAuthor> {
  const thread = await prisma.thread.create({
    data: {
      title: input.title,
      content: input.content,
      authorId,
      authorName,
      categoryId: input.categoryId,
      tags: input.tags,
      views: 0,
      isPinned: false,
      isLocked: false,
      replyCount: 0,
    },
  });

  return transformThread(thread);
}

export async function updateThread(
  id: string,
  updates: Partial<CreateThreadInput>
): Promise<ThreadWithAuthor | null> {
  const result = await prisma.thread.updateMany({
    where: { id },
    data: updates,
  });

  if (result.count === 0) return null;

  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return null;

  return transformThread(thread);
}

export async function deleteThread(id: string): Promise<boolean> {
  const thread = await prisma.thread.findUnique({ where: { id }, select: { id: true } });
  if (!thread) return false;

  // Supprimer aussi les réponses associées
  await prisma.$transaction([
    prisma.reply.deleteMany({ where: { threadId: id } }),
    prisma.thread.delete({ where: { id } }),
  ]);

  return true;
}

export async function togglePinThread(id: string): Promise<ThreadWithAuthor | null> {
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return null;

  const updated = await prisma.thread.update({
    where: { id },
    data: { isPinned: !thread.isPinned },
  });

  return transformThread(updated);
}

export async function toggleLockThread(id: string): Promise<ThreadWithAuthor | null> {
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return null;

  const updated = await prisma.thread.update({
    where: { id },
    data: { isLocked: !thread.isLocked },
  });

  return transformThread(updated);
}

// === REPLIES ===

export async function getRepliesByThreadId(
  threadId: string,
  pagination: PaginationParams = { page: 1, limit: 20 }
): Promise<PaginatedResponse<ReplyWithAuthor>> {
  const skip = (pagination.page - 1) * pagination.limit;

  const [replies, total] = await Promise.all([
    prisma.reply.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: pagination.limit,
    }),
    prisma.reply.count({ where: { threadId } }),
  ]);

  const transformed = replies.map(transformReply);
  const data = await resolveAuthorNames(transformed);

  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function createReply(
  input: CreateReplyInput,
  threadId: string,
  authorId: string,
  authorName: string
): Promise<ReplyWithAuthor> {
  const [reply] = await prisma.$transaction([
    prisma.reply.create({
      data: {
        threadId,
        authorId,
        authorName,
        content: input.content,
      },
    }),
    prisma.thread.update({
      where: { id: threadId },
      data: {
        replyCount: { increment: 1 },
        updatedAt: new Date(),
      },
    }),
  ]);

  return transformReply(reply);
}

export async function updateReply(
  id: string,
  content: string
): Promise<ReplyWithAuthor | null> {
  const result = await prisma.reply.updateMany({
    where: { id },
    data: { content, isEdited: true, updatedAt: new Date() },
  });

  if (result.count === 0) return null;

  const reply = await prisma.reply.findUnique({ where: { id } });
  if (!reply) return null;

  return transformReply(reply);
}

export async function getReplyById(id: string): Promise<ReplyWithAuthor | null> {
  const reply = await prisma.reply.findUnique({ where: { id } });
  return reply ? transformReply(reply) : null;
}

export async function deleteReply(id: string): Promise<boolean> {
  const reply = await prisma.reply.findUnique({ where: { id } });
  if (reply) {
    await prisma.$transaction([
      prisma.reply.delete({ where: { id } }),
      // Décrémenter le compteur de réponses
      prisma.thread.updateMany({
        where: { id: reply.threadId },
        data: {
          replyCount: { decrement: 1 },
        },
      }),
    ]);
  }

  return !!reply;
}

// === STATS ===

export async function getForumStats() {
  const [totalThreads, totalReplies, categoryStatsRaw] = await Promise.all([
    prisma.thread.count(),
    prisma.reply.count(),
    prisma.thread.groupBy({
      by: ['categoryId'],
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    totalThreads,
    totalReplies,
    categoryStats: categoryStatsRaw.reduce((acc: Record<string, number>, item) => {
      acc[item.categoryId] = item._count._all;
      return acc;
    }, {}),
  };
}
