import { NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { StreamChat } from 'stream-chat';
import { CHAT_CHANNELS } from '@/lib/chat/channels';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

/**
 * POST /api/chat/init-channels
 * Initialise les canaux Stream Chat (admin).
 */
export async function POST() {
  try {
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Stream Chat not configured' }, { status: 503 });
    }

    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    await serverClient.upsertUser({ id: 'system', role: 'admin', name: 'Epi\'AI' });

    const results = await Promise.allSettled(
      CHAT_CHANNELS.map(async (ch) => {
        const channel = serverClient.channel('messaging', ch.id, {
          created_by_id: 'system',
        } as Record<string, unknown>);
        try {
          await channel.create();
        } catch {
          // exists
        }
        try {
          await channel.addMembers(['system']);
        } catch {
          // already member
        }
        return ch.id;
      })
    );

    const created = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<string>).value);

    return NextResponse.json({ success: true, channels: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Init failed';
    console.error('[init-channels] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
