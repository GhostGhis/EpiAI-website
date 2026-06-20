import { StreamChat } from 'stream-chat';
import { CHAT_CHANNELS } from './channels';

function getServerClient() {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) return null;
  return StreamChat.getInstance(apiKey, apiSecret);
}

/** Crée les canaux si besoin et ajoute l'utilisateur à tous les canaux Epi'AI. */
export async function ensureUserInChatChannels(
  userId: string,
  name: string,
  imageUrl?: string
): Promise<void> {
  const serverClient = getServerClient();
  if (!serverClient) return;

  await serverClient.upsertUser({ id: 'system', role: 'admin', name: 'Epi\'AI' });
  await serverClient.upsertUser({
    id: userId,
    name,
    image: imageUrl,
    role: 'user',
  });

  for (const ch of CHAT_CHANNELS) {
    const channel = serverClient.channel('messaging', ch.id, {
      created_by_id: 'system',
    } as Record<string, unknown>);

    try {
      await channel.create();
    } catch {
      // Canal déjà existant
    }

    try {
      await channel.addMembers([userId]);
    } catch (err) {
      console.warn(`[chat] addMembers failed for ${ch.id}:`, err);
    }
  }
}
