import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getUserByClerkId } from '@/lib/users/repository';

export function isPlaceholderAuthorName(name: string): boolean {
  return /^User_/i.test(name);
}

export function formatUserDisplayName(parts: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  clerkId?: string;
}): string {
  const full = `${parts.firstName || ''} ${parts.lastName || ''}`.trim();
  if (full) return full;
  if (parts.email) {
    const local = parts.email.split('@')[0]?.trim();
    if (local) return local;
  }
  if (parts.clerkId) return `User_${parts.clerkId.slice(0, 8)}`;
  return 'Membre';
}

/** Resolve a Clerk user id to a human-readable display name (DB first, then Clerk). */
export async function getDisplayNameForClerkId(clerkId: string): Promise<string> {
  const dbUser = await getUserByClerkId(clerkId);
  if (dbUser) {
    const name = formatUserDisplayName({
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      clerkId,
    });
    if (!isPlaceholderAuthorName(name)) return name;
  }

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    return formatUserDisplayName({
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      clerkId,
    });
  } catch {
    return formatUserDisplayName({ clerkId });
  }
}

/** Replace placeholder author names (User_xxx) with real names from DB / Clerk. */
export async function resolveAuthorNames<T extends { authorId: string; authorName: string }>(
  items: T[]
): Promise<T[]> {
  const needsFix = items.filter((i) => isPlaceholderAuthorName(i.authorName));
  if (needsFix.length === 0) return items;

  const clerkIds = [...new Set(needsFix.map((i) => i.authorId))];
  const dbUsers = await prisma.user.findMany({
    where: { clerkId: { in: clerkIds } },
    select: { clerkId: true, firstName: true, lastName: true, email: true },
  });

  const resolved = new Map<string, string>();
  for (const u of dbUsers) {
    const name = formatUserDisplayName({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      clerkId: u.clerkId,
    });
    if (!isPlaceholderAuthorName(name)) {
      resolved.set(u.clerkId, name);
    }
  }

  for (const clerkId of clerkIds) {
    if (!resolved.has(clerkId)) {
      resolved.set(clerkId, await getDisplayNameForClerkId(clerkId));
    }
  }

  return items.map((item) =>
    isPlaceholderAuthorName(item.authorName) && resolved.has(item.authorId)
      ? { ...item, authorName: resolved.get(item.authorId)! }
      : item
  );
}
