'use client';

import type { EventWithDetails } from '@/lib/events/types';
import { formatDate, getSpotsPercentage, getProgressColor } from '@/lib/events/utils';
import { cn } from '@/lib/utils/cn';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  Wrench,
  Mic2,
  Code2,
  Users2,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { EventCoverImage } from './EventCoverImage';

const iconComponents: Record<string, any> = {
  Wrench,
  Mic2,
  Code2,
  Users: Users2,
  GraduationCap,
};

interface EventDetailProps {
  event: EventWithDetails;
  className?: string;
}

export function EventDetail({ event, className }: EventDetailProps) {
  const Icon = iconComponents[event.categoryIcon] || Calendar;
  const spotsPercentage = getSpotsPercentage(event.registeredCount, event.capacity);
  const isFull = event.spotsLeft <= 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Image */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        <EventCoverImage
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full rounded-2xl"
        />

        <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/20">
          <Icon className={cn('w-5 h-5', event.categoryColor)} />
          <span className="text-white font-medium">{event.categoryName}</span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{event.title}</h1>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-4 md:gap-6">
        <div className="flex items-center gap-2 text-white/70">
          <Calendar className="w-5 h-5" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <MapPin className="w-5 h-5" />
          <span>{event.isOnline ? 'Online Event' : event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <Users className="w-5 h-5" />
          <span>{event.registeredCount} / {event.capacity} registered</span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70">Availability</span>
          <span className={cn(
            'font-medium',
            isFull ? 'text-red-400' : 'text-brand-400'
          )}>
            {event.spotsLeft} spots remaining
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              getProgressColor(spotsPercentage)
            )}
            style={{ width: `${100 - spotsPercentage}%` }}
          />
        </div>
      </div>

      {/* Online Link */}
      {event.isOnline && event.onlineLink && (
        <a
          href={event.onlineLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all border border-purple-500/30"
        >
          <Globe className="w-5 h-5" />
          <span>Join Online</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {/* Description */}
      <div className="prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold text-white mb-3">About this event</h2>
        <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Full Content */}
      {event.content && (
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-semibold text-white mb-3">Details</h2>
          <div className="text-white/70 whitespace-pre-wrap leading-relaxed">
            {event.content}
          </div>
        </div>
      )}

      {/* Gallery */}
      {event.gallery && event.gallery.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.gallery.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
