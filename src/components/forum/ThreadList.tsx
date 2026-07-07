'use client';

import type { ThreadWithAuthor } from '@/lib/forum/types';
import { ThreadCard } from './ThreadCard';
import { cn } from '@/lib/utils/cn';
import { MessageSquare } from 'lucide-react';

interface ThreadListProps {
  threads: ThreadWithAuthor[];
  isLoading?: boolean;
  className?: string;
}

export function ThreadList({ threads: threadsProp, isLoading, className }: ThreadListProps) {
  const threads = threadsProp ?? [];
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-3 sm:p-4 rounded-xl bg-card border border-default shadow-card animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-card-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-card-muted rounded" />
                <div className="h-3 w-1/2 bg-card-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'rounded-2xl bg-card border border-default',
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-card-muted flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          No discussions yet
        </h3>
        <p className="text-secondary text-center max-w-sm">
          Be the first to start a discussion in this category!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
