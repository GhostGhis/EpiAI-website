'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { EventDetail } from '@/components/events/EventDetail';
import { RegistrationForm } from '@/components/events/RegistrationForm';
import { Countdown } from '@/components/events/Countdown';
import type { EventWithDetails } from '@/lib/events/types';
import { ArrowLeft, Calendar, ClipboardList, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader, Panel, Button } from '@/components/ui';
import { GenerateEventBlogButton } from '@/components/events/GenerateEventBlogButton';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const eventId = params.id as string;

  const { isAdmin, hasPermission } = useAuth();
  const t = useTranslations('Events');
  const canManage = isAdmin || hasPermission('dashboard.admin');

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  async function togglePublish() {
    if (!event) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });
      if (res.ok) setEvent(await res.json());
    } finally {
      setBusy(false);
    }
  }

  async function toggleFeatured() {
    if (!event) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'feature' }),
      });
      if (res.ok) setEvent(await res.json());
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    const msg =
      locale === 'fr'
        ? `Supprimer définitivement « ${event.title} » ?`
        : `Permanently delete “${event.title}”?`;
    if (!confirm(msg)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push(`/${locale}/admin/events`);
      }
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-card-muted rounded" />
          <div className="h-64 bg-card-muted rounded-2xl" />
          <div className="h-8 w-3/4 bg-card-muted rounded" />
          <div className="h-4 w-full bg-card-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-primary mb-2">
          Event Not Found
        </h1>
        <p className="text-secondary mb-6">
          {error || 'This event does not exist or has been deleted.'}
        </p>
        <Link href={`/${locale}/events`}>
          <Button>
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Events"
        title={event.title}
        description={event.location || undefined}
        actions={
          <Link
            href={`/${locale}/events`}
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToEvents')}
          </Link>
        }
      />

      {!event.isPast && (
        <Panel title={t('startsIn')}>
          <Countdown targetDate={event.date} />
        </Panel>
      )}

      <Panel>
        <EventDetail event={event} />
      </Panel>

      <Panel title={locale === 'fr' ? 'Inscription' : 'Registration'}>
        <RegistrationForm
          eventId={event.id}
          eventTitle={event.title}
          eventDate={event.date}
          spotsLeft={event.spotsLeft}
          isRegistered={event.isRegistered || false}
          isPast={event.isPast}
          isFull={event.spotsLeft <= 0}
        />
      </Panel>

      {canManage && (
        <Panel title={locale === 'fr' ? 'Actions admin' : 'Admin Actions'}>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start">
            <Link href={`/${locale}/events/${event.id}/edit`}>
              <Button variant="secondary" size="sm">
                {locale === 'fr' ? 'Modifier' : 'Edit Event'}
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={togglePublish}
            >
              {event.isPublished ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {event.isPublished
                ? locale === 'fr'
                  ? 'Rendre privé'
                  : 'Unpublish'
                : locale === 'fr'
                  ? 'Rendre public'
                  : 'Publish'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy || !event.isPublished}
              onClick={toggleFeatured}
            >
              <Star className={cnStar(event.isFeatured)} />
              {event.isFeatured
                ? locale === 'fr'
                  ? 'Retirer la mise en avant'
                  : 'Unfeature'
                : locale === 'fr'
                  ? 'Mettre en avant'
                  : 'Feature'}
            </Button>
            {event.linkedActivityId && (
              <Link href={`/${locale}/intranet/${event.linkedActivityId}`}>
                <Button variant="secondary" size="sm">
                  <ClipboardList className="w-4 h-4" />
                  {locale === 'fr' ? 'Gérer présence' : 'Manage Attendance'}
                </Button>
              </Link>
            )}
            <GenerateEventBlogButton eventId={event.id} />
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              {locale === 'fr' ? 'Supprimer' : 'Delete'}
            </Button>
          </div>
        </Panel>
      )}
    </div>
  );
}

function cnStar(featured: boolean) {
  return featured ? 'w-4 h-4 fill-current text-amber-400' : 'w-4 h-4';
}
