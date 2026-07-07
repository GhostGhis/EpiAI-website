'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { EventList } from '@/components/events/EventList';
import { CategoryFilter } from '@/components/events/CategoryFilter';
import type { EventWithDetails, PaginatedResponse } from '@/lib/events/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { PageHeader, Button, Panel, FilterBar, Pagination } from '@/components/ui';

export default function PastEventsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('Events');
  const [, startTransition] = useTransition();

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';

  // Fetch past events
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '9');
        queryParams.set('past', 'true');
        if (selectedCategory) queryParams.set('category', selectedCategory);

        const response = await fetch(`/api/events?${queryParams.toString()}`);
        const data: PaginatedResponse<EventWithDetails> = await response.json();

        setEvents(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [currentPage, selectedCategory]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Calendar"
        title={t('pastEvents')}
        description={`${total} ${total === 1 ? 'event' : 'events'} from the past`}
        actions={
          <Link href={`/${locale}/events`}>
            <Button variant="secondary" size="sm">
              {t('upcoming')}
            </Button>
          </Link>
        }
      />

      <Panel noPadding bodyClassName="p-4">
        <FilterBar>
          <CategoryFilter />
        </FilterBar>
      </Panel>

      <EventList events={events} isLoading={isLoading} />

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          startTransition(() => {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('page', page.toString());
            router.push(`/${locale}/events/past?${newParams.toString()}`);
          });
        }}
      />
    </div>
  );
}
