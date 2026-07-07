'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ReplyForm } from '@/components/forum/ReplyForm';
import { ReplyList } from '@/components/forum/ReplyList';
import { formatDate, formatDistanceToNow } from '@/lib/forum/utils';
import type { ThreadWithAuthor, ReplyWithAuthor } from '@/lib/forum/types';
import { ArrowLeft, MessageSquare, Eye, Clock, Pin, Lock, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CATEGORIES, TAGS } from '@/lib/forum/categories';
import { PageHeader, Panel, Button, Badge } from '@/components/ui';
import {
  MessageSquare as MsgIcon,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  MessageSquare: MsgIcon,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
};

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const threadId = params.id as string;

  const { isSignedIn, userId, isAdmin, hasPermission } = useAuth();
  const t = useTranslations('Forum');

  const [isPending, startTransition] = useTransition();
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch thread
  useEffect(() => {
    async function fetchThread() {
      try {
        const response = await fetch(`/api/forum/threads?id=${threadId}`);
        if (!response.ok) {
          throw new Error('Thread not found');
        }
        const data = await response.json();
        setThread(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchThread();
  }, [threadId]);

  // Fetch replies
  useEffect(() => {
    if (!thread) return;

    async function fetchReplies() {
      try {
        const response = await fetch(`/api/forum/replies?threadId=${threadId}`);
        const data = await response.json();
        setReplies(data.data || []);
      } catch (err) {
        console.error('Error fetching replies:', err);
      }
    }

    fetchReplies();
  }, [thread, threadId]);

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/forum/threads?id=${threadId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete');

        router.push(`/${locale}/forum`);
      } catch (err) {
        alert('Failed to delete thread');
      }
    });
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      const response = await fetch(`/api/forum/replies?id=${replyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReplies(replies.filter(r => r.id !== replyId));
      }
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  const handleReplySuccess = () => {
    // Refetch replies
    async function fetchReplies() {
      try {
        const response = await fetch(`/api/forum/replies?threadId=${threadId}`);
        const data = await response.json();
        setReplies(data.data || []);
      } catch (err) {
        console.error('Error fetching replies:', err);
      }
    }
    fetchReplies();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-card-muted rounded" />
          <div className="p-6 rounded-2xl bg-card border border-default">
            <div className="h-6 w-3/4 bg-card-muted rounded mb-4" />
            <div className="h-4 w-full bg-card-muted rounded mb-2" />
            <div className="h-4 w-2/3 bg-card-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Thread Not Found
        </h1>
        <p className="text-secondary mb-6">
          {error || 'This thread does not exist or has been deleted.'}
        </p>
        <Link href={`/${locale}/forum`}>
          <Button>
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = iconComponents[thread.categoryId] || MsgIcon;
  const isAuthor = userId === thread.authorId;
  const canModerate = isAdmin;
  const canDelete = isAuthor || canModerate;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Forum"
        title={thread.title}
        description={formatDistanceToNow(thread.createdAt, locale as 'en' | 'fr')}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/forum`}
              className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToForum')}
            </Link>
            {thread.isPinned && (
              <Badge variant="amber" className="gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="danger" className="gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
          </div>
        }
      />

      <Panel>
        <article>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl bg-card-muted ${thread.categoryColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Author & Stats */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-default">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-card-muted flex items-center justify-center">
              <span className="text-primary text-sm font-medium">
                {(thread.authorName ?? 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-secondary">{thread.authorName ?? 'Unknown user'}</span>
          </div>
          <div className="flex items-center gap-1 text-muted text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>{thread.replyCount} replies</span>
          </div>
          <div className="flex items-center gap-1 text-muted text-sm">
            <Eye className="w-4 h-4" />
            <span>{thread.views} views</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-secondary whitespace-pre-wrap leading-relaxed">
          {thread.content}
        </div>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-default">
            {thread.tags.map((tag) => (
              <Badge key={tag} variant="default">#{tag}</Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {canDelete && (
          <div className="flex justify-end mt-6 pt-4 border-t border-default">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteThread}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4" />
              {isPending ? 'Deleting...' : 'Delete Thread'}
            </Button>
          </div>
        )}
        </article>
      </Panel>

      <Panel title={`${t('replies')} (${thread.replyCount})`}>
        <ReplyList replies={replies} onDeleteReply={handleDeleteReply} />
      </Panel>

      <Panel title={locale === 'fr' ? 'Répondre' : 'Reply'}>
        <ReplyForm
          threadId={threadId}
          threadLocked={thread.isLocked}
          onSuccess={handleReplySuccess}
        />
      </Panel>
    </div>
  );
}
