'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { Plus, FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResourceWithDetails } from '@/lib/resources/types';
import { PageHeader, Button, EmptyState } from '@/components/ui';

export default function MyResourcesPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, userId, hasPermission } = useAuth();
  const t = useTranslations('Resources');

  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/${userId}/resources`);
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        }
      } catch (error) {
        console.error('Error fetching user resources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchResources();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  if (!isSignedIn) {
    return (
      <EmptyState
        icon={<FolderOpen className="w-12 h-12" />}
        title="You need to be signed in to view your resources."
        action={
          <Link href={`/${locale}/sign-in`}>
            <Button>Sign In</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resources"
        title={t('myResources')}
        description={`${resources.length} ${resources.length === 1 ? 'resource' : 'resources'} uploaded`}
        actions={
          hasPermission('resources.create') ? (
            <Link
              href={`/${locale}/resources/new`}
              className="inline-flex items-center justify-center font-semibold transition-colors gap-2 px-5 py-2.5 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-500"
            >
              <Plus className="w-5 h-5" />
              {t('addResource')}
            </Link>
          ) : undefined
        }
      />

      {/* Resources Grid */}
      <ResourceGrid resources={resources} isLoading={isLoading} />
    </div>
  );
}
