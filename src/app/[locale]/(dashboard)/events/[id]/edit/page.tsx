'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/lib/events/categories';
import { Calendar, AlertCircle } from 'lucide-react';
import { FormPageShell, EmptyState, Button, Input, Textarea, Select } from '@/components/ui';
import { EventMediaPicker } from '@/components/events/EventMediaPicker';
import { GenerateEventBlogButton } from '@/components/events/GenerateEventBlogButton';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const eventId = params.id as string;
  const { hasPermission } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: 'workshop',
    date: '',
    location: '',
    capacity: 50,
    imageUrl: '',
    gallery: [] as string[],
    videoUrls: [] as string[],
  });

  const canEdit = hasPermission('dashboard.admin');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error('Event not found');
        const event = await res.json();
        setForm({
          title: event.title || '',
          description: event.description || '',
          content: event.content || '',
          categoryId: event.categoryId || 'workshop',
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          location: event.location || '',
          capacity: event.capacity || 50,
          imageUrl: event.imageUrl || '',
          gallery: event.gallery || [],
          videoUrls: event.videoUrls || [],
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  if (!canEdit) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title={locale === 'fr' ? 'Accès refusé' : 'Access denied'}
        action={
          <Link href={`/${locale}/events`}>
            <Button variant="secondary">
              {locale === 'fr' ? 'Retour aux événements' : 'Back to Events'}
            </Button>
          </Link>
        }
      />
    );
  }

  if (loading) {
    return <div className="animate-pulse h-64 rounded-xl bg-card" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            title: form.title,
            description: form.description,
            content: form.content,
            categoryId: form.categoryId,
            date: form.date,
            location: form.location,
            capacity: form.capacity,
            imageUrl: form.imageUrl || undefined,
            gallery: form.gallery,
            videoUrls: form.videoUrls,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Update failed');
        }
        router.push(`/${locale}/events/${eventId}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur');
      }
    });
  };

  return (
    <FormPageShell
      backHref={`/${locale}/events/${eventId}`}
      backLabel={locale === 'fr' ? 'Retour' : 'Back'}
      title={locale === 'fr' ? "Modifier l'événement" : 'Edit event'}
      maxWidth="lg"
    >
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="mb-5">
        <GenerateEventBlogButton eventId={eventId} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={locale === 'fr' ? 'Titre' : 'Title'}
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Titre"
        />
        <Textarea
          label={locale === 'fr' ? 'Description' : 'Description'}
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description"
        />
        <Textarea
          label={locale === 'fr' ? 'Contenu' : 'Content'}
          required
          rows={5}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Contenu"
        />
        <Select
          label={locale === 'fr' ? 'Catégorie' : 'Category'}
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name[locale as 'fr' | 'en'] || c.name.fr}</option>
          ))}
        </Select>
        <Input
          label={locale === 'fr' ? 'Date' : 'Date'}
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <Input
          label={locale === 'fr' ? 'Lieu' : 'Location'}
          required
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          placeholder="Lieu"
        />
        <Input
          label={locale === 'fr' ? 'Capacité' : 'Capacity'}
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
        />

        <EventMediaPicker
          locale={locale}
          imageUrl={form.imageUrl}
          gallery={form.gallery}
          videoUrls={form.videoUrls}
          onChange={({ imageUrl, gallery, videoUrls }) =>
            setForm((f) => ({ ...f, imageUrl, gallery, videoUrls }))
          }
        />

        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? '...' : locale === 'fr' ? 'Enregistrer' : 'Save'}
        </Button>
      </form>
    </FormPageShell>
  );
}
