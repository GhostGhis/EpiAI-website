/**
 * Génère un article de blog bilingue à partir d'un événement + ses médias.
 */
import { chatCompletionJson, isChatbotAiEnabled } from '@/lib/chatbot/openai';
import { createPost, updatePost } from '@/lib/blog/repository';
import { prisma } from '@/lib/prisma';
import type { EventWithDetails } from '@/lib/events/types';

export interface GeneratedBlogPayload {
  titleEn: string;
  titleFr: string;
  excerptEn: string;
  excerptFr: string;
  contentEn: string;
  contentFr: string;
  category: string;
}

function mediaContext(event: EventWithDetails): string {
  const lines: string[] = [];
  if (event.imageUrl) lines.push(`Cover image URL: ${event.imageUrl}`);
  if (event.gallery?.length) {
    lines.push(`Gallery photos (${event.gallery.length}):`);
    event.gallery.forEach((url, i) => lines.push(`  ${i + 1}. ${url}`));
  }
  if (event.videoUrls?.length) {
    lines.push(`Videos (${event.videoUrls.length}):`);
    event.videoUrls.forEach((url, i) => lines.push(`  ${i + 1}. ${url}`));
  }
  return lines.length ? lines.join('\n') : 'No media attached.';
}

export async function generateBlogFromEvent(params: {
  event: EventWithDetails;
  createdBy: string;
  authorName?: string;
  forceRegenerate?: boolean;
}): Promise<{ post: Awaited<ReturnType<typeof createPost>>; generated: GeneratedBlogPayload }> {
  if (!isChatbotAiEnabled()) {
    throw new Error(
      "AI non configurée : ajoute OPENAI_API_KEY (ou GEMINI_API_KEY) dans les variables d'environnement."
    );
  }

  const { event, createdBy, authorName, forceRegenerate } = params;

  const existing = await prisma.blogPost.findUnique({
    where: { linkedEventId: event.id },
  });

  if (existing && !forceRegenerate) {
    return {
      post: existing,
      generated: {
        titleEn: existing.titleEn,
        titleFr: existing.titleFr,
        excerptEn: existing.excerptEn,
        excerptFr: existing.excerptFr,
        contentEn: existing.contentEn,
        contentFr: existing.contentFr,
        category: existing.category,
      },
    };
  }

  const dateStr = new Date(event.date).toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const system = `You are the editorial writer for Epi'AI, an AI & data science student association at Epitech.

Write engaging bilingual blog posts (French + English) about association events.

Rules:
- Tone: warm, professional, energetic — student community, not corporate PR.
- French uses "nous" (association voice).
- Do NOT invent speakers, partners, or facts not present in the event data.
- You MAY reference that photos/videos exist and describe the atmosphere based on title, description, content, location, and category.
- Content must be Markdown (## headings, short paragraphs, bullet lists if useful).
- Embed media when URLs are provided:
  - Images: ![caption](url)
  - Videos: use a Markdown link like [Voir la vidéo](url) (do not invent HTML video tags).
- Include cover as hero mention at the top of content if provided.
- Category should be a short label like "Events", "Workshop", "Meetup", "Hackathon".
- excerpts: max ~160 characters each.
- content: 400–800 words equivalent per language (solid article, not a stub).

Return ONLY valid JSON with keys:
titleEn, titleFr, excerptEn, excerptFr, contentEn, contentFr, category`;

  const user = `Write a blog article about this Epi'AI event.

Title: ${event.title}
Category: ${event.categoryName} (${event.categoryId})
Date: ${dateStr}
Location: ${event.isOnline ? `Online — ${event.location}` : event.location}
${event.onlineLink ? `Online link: ${event.onlineLink}` : ''}
Capacity / registrations: ${event.registeredCount}/${event.capacity}

Short description:
${event.description}

Detailed content:
${event.content}

Media:
${mediaContext(event)}
`;

  const generated = await chatCompletionJson<GeneratedBlogPayload>({
    system,
    messages: [{ role: 'user', content: user }],
    temperature: 0.7,
  });

  const required = [
    'titleEn',
    'titleFr',
    'excerptEn',
    'excerptFr',
    'contentEn',
    'contentFr',
    'category',
  ] as const;

  for (const key of required) {
    if (!generated[key] || typeof generated[key] !== 'string') {
      throw new Error(`Réponse AI invalide (champ manquant: ${key})`);
    }
  }

  if (existing && forceRegenerate) {
    const post = await updatePost(existing.id, {
      titleEn: generated.titleEn,
      titleFr: generated.titleFr,
      excerptEn: generated.excerptEn,
      excerptFr: generated.excerptFr,
      contentEn: generated.contentEn,
      contentFr: generated.contentFr,
      category: generated.category || 'Events',
      imageUrl: event.imageUrl || existing.imageUrl || undefined,
      authorName: authorName || existing.authorName || "Epi'AI",
      status: 'draft',
    });
    return { post, generated };
  }

  const post = await createPost({
    titleEn: generated.titleEn,
    titleFr: generated.titleFr,
    excerptEn: generated.excerptEn,
    excerptFr: generated.excerptFr,
    contentEn: generated.contentEn,
    contentFr: generated.contentFr,
    category: generated.category || 'Events',
    imageUrl: event.imageUrl || undefined,
    authorName: authorName || "Epi'AI",
    status: 'draft',
    createdBy,
    linkedEventId: event.id,
  });

  return { post, generated };
}
