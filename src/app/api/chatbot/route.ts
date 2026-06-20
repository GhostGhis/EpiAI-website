import { NextRequest, NextResponse } from 'next/server';
import type { FaqId } from '@/lib/faq/catalog';
import { isValidFaqId } from '@/lib/faq/content';
import { handleChatbotRequest, type ChatMessage } from '@/lib/chatbot/assistant';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`chatbot:${ip}`, 30, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
      );
    }

    const body = await request.json();
    const locale = body.locale === 'en' ? 'en' : 'fr';
    const message = typeof body.message === 'string' ? body.message : undefined;
    const faqId = typeof body.faqId === 'string' && isValidFaqId(body.faqId)
      ? (body.faqId as FaqId)
      : undefined;

    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (m: unknown) =>
              m &&
              typeof m === 'object' &&
              'role' in m &&
              'content' in m &&
              ((m as ChatMessage).role === 'user' ||
                (m as ChatMessage).role === 'assistant') &&
              typeof (m as ChatMessage).content === 'string'
          )
          .slice(-8)
          .map((m: ChatMessage) => ({
            role: m.role,
            content: m.content.slice(0, 2000),
          }))
      : [];

    if (!message && !faqId) {
      return NextResponse.json({ error: 'message or faqId required' }, { status: 400 });
    }

    const result = await handleChatbotRequest({
      message,
      faqId,
      locale,
      history,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API chatbot]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
