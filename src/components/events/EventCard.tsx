'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import type { EventWithDetails } from '@/lib/events/types';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { EventCoverImage } from './EventCoverImage';
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Wrench,
  Mic2,
  Code2,
  Users2,
  GraduationCap,
} from 'lucide-react';

const iconComponents: Record<string, ComponentType<{ className?: string }>> = {
  Wrench,
  Mic2,
  Code2,
  Users: Users2,
  GraduationCap,
};

interface EventCardProps {
  event: EventWithDetails;
  href?: string;
  className?: string;
}

export function EventCard({ event, href, className }: EventCardProps) {
  const Icon = iconComponents[event.categoryIcon] || Calendar;
  const isFull = event.spotsLeft <= 0;
  const spotsPercentage = (event.registeredCount / event.capacity) * 100;

  const card = (
    <div
      className={cn(
        'group relative rounded-xl bg-card border border-default shadow-card overflow-hidden',
        'hover:border-brand-500/20 transition-all duration-300',
        href && 'cursor-pointer',
        className
      )}
    >
      <div className="relative">
        <EventCoverImage
          src={event.imageUrl}
          alt={event.title}
          className="h-40 w-full"
          imgClassName="group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-default">
          <Icon className={cn('w-3.5 h-3.5', event.categoryColor)} />
          <span className="text-primary text-xs font-medium">{event.categoryName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary line-clamp-2 group-hover:text-brand-600 transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-wrap gap-2.5 text-xs text-secondary">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {event.isOnline ? (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </>
            )}
          </div>
        </div>

        <p className="text-muted text-xs line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-secondary">
              <Users className="w-3.5 h-3.5" />
              <span>{event.registeredCount} / {event.capacity}</span>
            </div>
            <span className={cn(
              'font-medium text-xs',
              isFull ? 'text-red-400' : 'text-brand-400'
            )}>
              {event.spotsLeft} spots left
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-card-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                spotsPercentage >= 90 ? 'bg-red-500' :
                spotsPercentage >= 70 ? 'bg-amber-500' : 'bg-brand-500'
              )}
              style={{ width: `${Math.min(100, spotsPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
      {card}
    </Link>
  );
}
