'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { EventDetail } from '@/components/events/EventDetail';
import { RegistrationForm } from '@/components/events/RegistrationForm';
import { Countdown } from '@/components/events/Countdown';
import type { EventWithDetails } from '@/lib/events/types';
import { ArrowLeft, Calendar, Users, Clock, ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function EventDetailPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const eventId = params.id as string;

  const { isSignedIn, userId, isAdmin } = useAuth();
  const t = useTranslations('Events');

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event
  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-white/10 rounded" />
          <div className="h-64 bg-white/10 rounded-2xl" />
          <div className="h-8 w-3/4 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Event Not Found
        </h1>
        <p className="text-white/60 mb-6">
          {error || 'This event does not exist or has been deleted.'}
        </p>
        <Link
          href={`/${locale}/events`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/${locale}/events`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToEvents')}
      </Link>

      {/* Countdown for upcoming events */}
      {!event.isPast && (
        <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-center mb-4">
            <p className="text-white/60 text-sm uppercase tracking-wide">
              {t('startsIn')}
            </p>
          </div>
          <Countdown targetDate={event.date} />
        </div>
      )}

      {/* Event Details */}
      <EventDetail event={event} />

      {/* Registration Form */}
      <div className="mt-8">
        <RegistrationForm
          eventId={event.id}
          eventTitle={event.title}
          eventDate={event.date}
          spotsLeft={event.spotsLeft}
          isRegistered={event.isRegistered || false}
          isPast={event.isPast}
          isFull={event.spotsLeft <= 0}
        />
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <h3 className="text-amber-400 font-medium mb-2">Admin Actions</h3>
          <div className="flex gap-2">
            <Link
              href={`/${locale}/events/${event.id}/edit`}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
            >
              Edit Event
            </Link>
            {event.linkedActivityId && (
              <Link
                href={`/${locale}/intranet/${event.linkedActivityId}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors text-sm border border-brand-500/30"
              >
                <ClipboardList className="w-4 h-4" />
                {locale === 'fr' ? 'Gérer présence' : 'Manage Attendance'}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
