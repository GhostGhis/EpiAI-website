import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ensureUserInChatChannels } from '@/lib/chat/server';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

/**
 * GET /api/chat/token
 * Génère un token Stream Chat et ajoute l'utilisateur à tous les canaux.
 */
export async function GET() {
  try {
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Stream Chat not configured. Add NEXT_PUBLIC_STREAM_API_KEY and STREAM_API_SECRET on Vercel.' },
        { status: 503 }
      );
    }

    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let name = 'User';
    let imageUrl: string | undefined;

    const claimsAny = sessionClaims as Record<string, unknown> | null;
    if (claimsAny?.firstName || claimsAny?.lastName) {
      name = `${claimsAny?.firstName || ''} ${claimsAny?.lastName || ''}`.trim() || 'User';
    } else {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
        imageUrl = user.imageUrl || undefined;
      } catch {
        console.warn('[chat/token] Clerk API unavailable, using defaults');
      }
    }

    await ensureUserInChatChannels(userId, name, imageUrl);

    const { StreamChat } = await import('stream-chat');
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const token = serverClient.createToken(userId);

    return NextResponse.json({ token, userId, name, imageUrl, apiKey });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate token';
    console.error('[chat/token] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
