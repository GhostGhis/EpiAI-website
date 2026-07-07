'use client';

import type { ThreadWithAuthor } from '@/lib/forum/types';
import { cn } from '@/lib/utils/cn';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/forum/utils';
import { ListRow } from '@/components/ui/ListRow';
import {
  MessageSquare,
  Eye,
  Pin,
  Lock,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
  MessageCircle,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  MessageSquare,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
};

interface ThreadCardProps {
  thread: ThreadWithAuthor;
  className?: string;
}

export function ThreadCard({ thread, className }: ThreadCardProps) {
  const params = useParams();
  const locale = params.locale as string || 'en';

  const Icon = iconComponents[thread.categoryId] || MessageSquare;

  const timeAgo = formatDistanceToNow(thread.createdAt, locale as 'en' | 'fr');

  return (
    <Link
      href={`/${locale}/forum/${thread.id}`}
      className={cn('block group', className)}
    >
      <ListRow
        leading={
          <div
            className={cn(
              'p-2 rounded-xl bg-card-muted',
              thread.categoryColor
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        }
        actions={
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-secondary">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium tabular-nums">{thread.replyCount}</span>
            </div>
            <div className="flex items-center gap-1 text-muted">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs tabular-nums">{thread.views}</span>
            </div>
          </div>
        }
        className="hover:border-brand-500/20"
      >
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium border border-amber-500/30">
              <Pin className="w-2.5 h-2.5" />
              Pinned
            </span>
          )}
          {thread.isLocked && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-medium border border-red-500/30">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
          <h3 className="text-sm font-semibold text-primary group-hover:text-brand-600 transition-colors line-clamp-1">
            {thread.title}
          </h3>
        </div>

        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {thread.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-md bg-card-muted text-secondary text-[10px] border border-default"
              >
                #{tag}
              </span>
            ))}
            {thread.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-card-muted text-muted text-[10px]">
                +{thread.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-card-muted flex items-center justify-center text-[10px] text-secondary">
              {thread.authorName.charAt(0).toUpperCase()}
            </span>
            <span>{thread.authorName}</span>
          </span>
          <span>·</span>
          <span>{timeAgo}</span>
        </div>
      </ListRow>
    </Link>
  );
}
