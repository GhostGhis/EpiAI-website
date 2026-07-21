'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Shield,
  Calendar,
} from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PageHeader, Button, Panel, ListRow, EmptyState, Badge } from '@/components/ui';
import type { EventWithDetails, PaginatedResponse } from '@/lib/events/types';
import { formatDate } from '@/lib/utils/date';
import { EventCoverImage } from '@/components/events/EventCoverImage';

export default function AdminEventsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const fr = locale === 'fr';
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    void fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setFetchError(null);
      const response = await fetch('/api/events?all=true&limit=100');
      if (response.ok) {
        const data: PaginatedResponse<EventWithDetails> = await response.json();
        setEvents(data.data ?? []);
        return;
      }
      if (response.status === 401) {
        setFetchError(fr ? 'Session expirée — reconnectez-vous.' : 'Session expired — sign in again.');
      } else if (response.status === 403) {
        setFetchError(fr ? 'Permissions insuffisantes.' : 'Insufficient permissions.');
      } else {
        setFetchError(fr ? 'Erreur serveur.' : 'Server error.');
      }
    } catch {
      setFetchError(fr ? 'Impossible de charger les événements.' : 'Could not load events.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string, title: string) {
    const msg = fr
      ? `Supprimer définitivement « ${title} » ?`
      : `Permanently delete “${title}”?`;
    if (!confirm(msg)) return;

    const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function togglePublish(id: string) {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    });
    if (response.ok) {
      const updated: EventWithDetails = await response.json();
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  }

  async function toggleFeatured(id: string) {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feature' }),
    });
    if (response.ok) {
      const updated: EventWithDetails = await response.json();
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  }

  return (
    <PermissionGate
      permission="dashboard.admin"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">
            {fr ? 'Accès refusé' : 'Access Denied'}
          </h2>
          <p className="text-secondary text-center max-w-md">
            {fr
              ? "Vous n'avez pas la permission de gérer les événements."
              : "You don't have permission to manage events."}
          </p>
        </div>
      }
    >
      <div className="space-y-5">
        <PageHeader
          title={fr ? 'Gestion des événements' : 'Events Management'}
          description={
            fr
              ? 'Publier, mettre en avant, modifier ou supprimer les événements'
              : 'Publish, feature, edit or delete association events'
          }
          actions={
            <Link href={`/${locale}/events/new`}>
              <Button>
                <Plus className="w-5 h-5" />
                {fr ? 'Nouvel événement' : 'New Event'}
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-2 border-default border-t-brand-500 rounded-full" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-20 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-300 mb-4">{fetchError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void fetchEvents();
              }}
              className="px-4 py-2 rounded-xl bg-card-muted text-primary text-sm hover:bg-card"
            >
              {fr ? 'Réessayer' : 'Retry'}
            </button>
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title={fr ? 'Aucun événement' : 'No events'}
            action={
              <Link href={`/${locale}/events/new`}>
                <Button>
                  <Plus className="w-5 h-5" />
                  {fr ? 'Créer' : 'Create'}
                </Button>
              </Link>
            }
          />
        ) : (
          <Panel
            title={fr ? 'Tous les événements' : 'All events'}
            description={`${events.length} event${events.length === 1 ? '' : 's'}`}
          >
            <div className="space-y-3">
              {events.map((event) => (
                <ListRow
                  key={event.id}
                  muted={!event.isPublished}
                  leading={
                    <EventCoverImage
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-20 h-16 rounded-lg border border-default"
                      showGradient={false}
                    />
                  }
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => void togglePublish(event.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          event.isPublished
                            ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                            : 'bg-card text-muted hover:bg-card-muted'
                        }`}
                        title={
                          event.isPublished
                            ? fr
                              ? 'Public — cliquer pour rendre privé'
                              : 'Public — click to unpublish'
                            : fr
                              ? 'Privé — cliquer pour rendre public'
                              : 'Private — click to publish'
                        }
                      >
                        {event.isPublished ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={!event.isPublished}
                        onClick={() => void toggleFeatured(event.id)}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                          event.isFeatured
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-card text-muted hover:bg-card-muted'
                        }`}
                        title={fr ? 'Mettre en avant' : 'Feature on homepage'}
                      >
                        <Star
                          className={
                            event.isFeatured
                              ? 'w-5 h-5 fill-current'
                              : 'w-5 h-5'
                          }
                        />
                      </button>
                      <Link
                        href={`/${locale}/events/${event.id}/edit`}
                        className="p-2 rounded-lg bg-card hover:bg-card-muted text-secondary hover:text-primary transition-colors"
                        title={fr ? 'Modifier' : 'Edit'}
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void deleteEvent(event.id, event.title)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        title={fr ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  }
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/${locale}/events/${event.id}`}
                        className="text-sm font-semibold text-primary hover:text-brand-600"
                      >
                        {event.title}
                      </Link>
                      <Badge variant={event.isPublished ? 'success' : 'muted'}>
                        {event.isPublished
                          ? fr
                            ? 'Public'
                            : 'Public'
                          : fr
                            ? 'Privé'
                            : 'Private'}
                      </Badge>
                      {event.isFeatured ? (
                        <Badge variant="amber">{fr ? 'À la une' : 'Featured'}</Badge>
                      ) : null}
                    </div>
                    <p className="text-secondary text-xs">
                      {formatDate(event.date)} · {event.location}
                    </p>
                  </div>
                </ListRow>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </PermissionGate>
  );
}
