import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { getEventById } from '@/lib/events/repository';
import { generateBlogFromEvent } from '@/lib/blog/generate-from-event';

/**
 * POST /api/events/[id]/generate-blog
 * Body optional: { force?: boolean }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('content.create');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);

    const { post } = await generateBlogFromEvent({
      event,
      createdBy: permCheck.userId,
      authorName: "Epi'AI",
      forceRegenerate: force,
    });

    return NextResponse.json({
      slug: post.slug,
      id: post.id,
      status: post.status,
      message: force
        ? 'Blog regenerated as draft'
        : 'Blog draft created from event',
    });
  } catch (error) {
    console.error('generate-blog error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    const status = message.includes('AI non configurée') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
