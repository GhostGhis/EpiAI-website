'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { EventList } from '@/components/events/EventList';
import { CategoryFilter } from '@/components/events/CategoryFilter';
import { formatDate } from '@/lib/events/utils';
import type { EventWithDetails, PaginatedResponse } from '@/lib/events/types';
import { Plus, Filter, SortDesc, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, FilterBar, Panel, Pagination } from '@/components/ui';

export default function EventsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, hasPermission } = useAuth();
  const t = useTranslations('Events');

  const [isPending, startTransition] = useTransition();

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const showPast = searchParams.get('past') === 'true';

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '9');
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (showPast) queryParams.set('past', 'true');

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
  }, [currentPage, selectedCategory, showPast]);

  const canCreateEvent = hasPermission('dashboard.admin');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Calendar"
        title={t('title')}
        description={`${total} ${total === 1 ? 'event' : 'events'}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <a
              href="/api/events/calendar"
              download
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-default text-secondary hover:text-primary text-xs font-medium shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden />
              iCal
            </a>
            <Button
              variant={showPast ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                startTransition(() => {
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.set('past', showPast ? 'false' : 'true');
                  router.push(`/${locale}/events?${newParams.toString()}`);
                });
              }}
            >
              {showPast ? t('upcoming') : t('past')}
            </Button>
            {canCreateEvent ? (
              <Link href={`/${locale}/events/new`}>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  {t('createEvent')}
                </Button>
              </Link>
            ) : null}
          </div>
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
            router.push(`/${locale}/events?${newParams.toString()}`);
          });
        }}
      />
    </div>
  );
}
