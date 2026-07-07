'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { SearchBar } from '@/components/resources/SearchBar';
import { CategoryFilter } from '@/components/resources/CategoryFilter';
import { TypeFilter } from '@/components/resources/TypeFilter';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, FilterBar, Panel, Pagination } from '@/components/ui';
import type { ResourceWithDetails, PaginatedResponse } from '@/lib/resources/types';

export default function ResourcesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('Resources');

  const { isSignedIn, hasPermission } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const selectedType = searchParams.get('type') || '';
  const selectedDifficulty = searchParams.get('difficulty') || '';
  const searchQuery = searchParams.get('search') || '';

  // Fetch resources
  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '12');
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (selectedType) queryParams.set('type', selectedType);
        if (selectedDifficulty) queryParams.set('difficulty', selectedDifficulty);
        if (searchQuery) queryParams.set('search', searchQuery);

        const response = await fetch(`/api/resources?${queryParams.toString()}`);
        const data: PaginatedResponse<ResourceWithDetails> = await response.json();

        setResources(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, [currentPage, selectedCategory, selectedType, selectedDifficulty, searchQuery]);

  const canCreateResource = hasPermission('resources.create');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Library"
        title={t('title')}
        description={`${total} ${total === 1 ? 'resource' : 'resources'}`}
        actions={
          canCreateResource ? (
            <Link href={`/${locale}/resources/new`}>
              <Button>
                <Plus className="w-4 h-4" />
                {t('addResource')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Panel noPadding bodyClassName="p-4 space-y-3">
        <SearchBar placeholder={t('searchPlaceholder')} />
        <FilterBar>
          <CategoryFilter />
          <TypeFilter />
        </FilterBar>
      </Panel>

      <ResourceGrid resources={resources} isLoading={isLoading} />

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          startTransition(() => {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('page', page.toString());
            router.push(`/${locale}/resources?${newParams.toString()}`);
          });
        }}
      />
    </div>
  );
}
