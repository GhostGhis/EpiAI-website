'use client';

import { useParams } from 'next/navigation';
import type { EventWithDetails } from '@/lib/events/types';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils/cn';
import { Calendar } from 'lucide-react';

interface EventListProps {
  events: EventWithDetails[];
  isLoading?: boolean;
  className?: string;
  /** Base path for detail links, e.g. /fr/events */
  linkBase?: string;
}

export function EventList({
  events: eventsProp,
  isLoading,
  className,
  linkBase,
}: EventListProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const base = linkBase ?? `/${locale}/events`;
  const events = eventsProp ?? [];
  if (isLoading) {
    return (
      <div className={cn('grid gap-3 md:grid-cols-2 lg:grid-cols-3', className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-card border border-default shadow-card animate-pulse"
          >
            <div className="h-40 bg-card-muted" />
            <div className="p-4 space-y-2.5">
              <div className="h-5 w-3/4 bg-card-muted rounded" />
              <div className="h-4 w-full bg-card-muted rounded" />
              <div className="h-4 w-1/2 bg-card-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'rounded-2xl bg-card border border-default',
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-card-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          No events found
        </h3>
        <p className="text-secondary text-center max-w-sm">
          There are no upcoming events at the moment. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 md:grid-cols-2 lg:grid-cols-3', className)}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} href={`${base}/${event.id}`} />
      ))}
    </div>
  );
}
