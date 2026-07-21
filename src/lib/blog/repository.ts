import { prisma } from '@/lib/prisma';
import type { BlogPostStatus } from '@prisma/client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getPublishedPosts(limit = 20) {
  return prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function getAllPosts(admin = false) {
  return prisma.blogPost.findMany({
    where: admin ? {} : { status: 'published' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createPost(data: {
  titleEn: string;
  titleFr: string;
  excerptEn: string;
  excerptFr: string;
  contentEn: string;
  contentFr: string;
  category: string;
  imageUrl?: string;
  authorName: string;
  status?: BlogPostStatus;
  createdBy: string;
  linkedEventId?: string;
}) {
  const baseSlug = slugify(data.titleEn || data.titleFr);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  return prisma.blogPost.create({
    data: {
      slug,
      titleEn: data.titleEn,
      titleFr: data.titleFr,
      excerptEn: data.excerptEn,
      excerptFr: data.excerptFr,
      contentEn: data.contentEn,
      contentFr: data.contentFr,
      category: data.category,
      imageUrl: data.imageUrl,
      authorName: data.authorName,
      createdBy: data.createdBy,
      linkedEventId: data.linkedEventId,
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  });
}

export async function updatePost(
  id: string,
  data: Partial<{
    titleEn: string;
    titleFr: string;
    excerptEn: string;
    excerptFr: string;
    contentEn: string;
    contentFr: string;
    category: string;
    imageUrl: string;
    authorName: string;
    status: BlogPostStatus;
  }>
) {
  const update = { ...data };
  if (data.status === 'published') {
    return prisma.blogPost.update({
      where: { id },
      data: { ...update, publishedAt: new Date() },
    });
  }
  return prisma.blogPost.update({ where: { id }, data: update });
}

export async function deletePost(id: string) {
  try {
    await prisma.blogPost.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
