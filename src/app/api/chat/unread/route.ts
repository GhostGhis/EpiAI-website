import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StreamChat } from 'stream-chat';
import { CHAT_CHANNEL_IDS } from '@/lib/chat/channels';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

/** GET /api/chat/unread — nombre de messages non lus par canal (Stream). */
export async function GET() {
  try {
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ total: 0, channels: {} });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const channels = await serverClient.queryChannels(
      {
        type: 'messaging',
        id: { $in: [...CHAT_CHANNEL_IDS] },
        members: { $in: [userId] },
      },
      { last_message_at: -1 },
      { user_id: userId, state: true, watch: false, presence: false, limit: 20 }
    );

    const byChannel: Record<string, number> = {};
    let total = 0;

    for (const ch of channels) {
      const unread =
        typeof ch.countUnread === 'function'
          ? ch.countUnread()
          : (ch.state?.unreadCount ?? 0);
      if (ch.id) {
        byChannel[ch.id] = unread;
        total += unread;
      }
    }

    return NextResponse.json({ total, channels: byChannel });
  } catch (error: unknown) {
    console.error('[chat/unread]', error);
    return NextResponse.json({ total: 0, channels: {} });
  }
}
