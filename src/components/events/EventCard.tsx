'use client';

import type { ComponentType } from 'react';
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
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const Icon = iconComponents[event.categoryIcon] || Calendar;
  const isFull = event.spotsLeft <= 0;
  const spotsPercentage = (event.registeredCount / event.capacity) * 100;

  return (
    <div
      className={cn(
        'group rounded-2xl bg-white/5 border border-white/10 overflow-hidden',
        'hover:bg-white/10 hover:border-white/20 transition-all duration-300',
        className
      )}
    >
      <div className="relative">
        <EventCoverImage
          src={event.imageUrl}
          alt={event.title}
          className="h-48 w-full"
          imgClassName="group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20">
          <Icon className={cn('w-4 h-4', event.categoryColor)} />
          <span className="text-white text-sm font-medium">{event.categoryName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-white/90 transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-wrap gap-3 text-sm text-white/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {event.isOnline ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </>
            )}
          </div>
        </div>

        <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-white/60">
              <Users className="w-4 h-4" />
              <span>{event.registeredCount} / {event.capacity}</span>
            </div>
            <span className={cn(
              'font-medium text-sm',
              isFull ? 'text-red-400' : 'text-brand-400'
            )}>
              {event.spotsLeft} spots left
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
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
}
