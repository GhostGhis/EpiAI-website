'use client';

import { useState, useTransition } from 'react';
import { normalizeImageUrl } from '@/lib/utils/image-url';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/lib/events/categories';
import { Calendar, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { FormPageShell, EmptyState, Button, Input, Textarea } from '@/components/ui';
import { EventMediaPicker } from '@/components/events/EventMediaPicker';
import { EventVisibilitySettings } from '@/components/events/EventVisibilitySettings';

export default function CreateEventPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const { hasPermission } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: CATEGORIES[0]?.id || 'workshop',
    date: '',
    endDate: '',
    location: '',
    isOnline: false,
    onlineLink: '',
    capacity: 50,
    imageUrl: '',
    gallery: [] as string[],
    videoUrls: [] as string[],
    isPublished: false,
    isFeatured: false,
    generateBlog: true,
  });

  const canCreate = hasPermission('dashboard.admin');

  if (!canCreate) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title={
          locale === 'fr'
            ? "Vous n'avez pas la permission de créer des événements."
            : "You don't have permission to create events."
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.date || !form.location || !form.categoryId) {
      setError(locale === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields');
      return;
    }

    if (!form.content) {
      setError(locale === 'fr' ? 'Le contenu détaillé est requis' : 'Detailed content is required');
      return;
    }

    if (form.capacity < 1) {
      setError(locale === 'fr' ? 'La capacité doit être au moins 1' : 'Capacity must be at least 1');
      return;
    }

    const eventDate = new Date(form.date);
    if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      setError(locale === 'fr' ? 'La date doit être dans le futur' : 'Date must be in the future');
      return;
    }

    if (form.endDate) {
      const endDate = new Date(form.endDate);
      if (isNaN(endDate.getTime()) || endDate <= eventDate) {
        setError(locale === 'fr' ? 'La date de fin doit être après la date de début' : 'End date must be after start date');
        return;
      }
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            content: form.content,
            categoryId: form.categoryId,
            date: form.date,
            endDate: form.endDate || undefined,
            location: form.location,
            isOnline: form.isOnline,
            onlineLink: form.isOnline ? form.onlineLink : undefined,
            capacity: form.capacity,
            imageUrl: normalizeImageUrl(form.imageUrl) || undefined,
            gallery: form.gallery,
            videoUrls: form.videoUrls,
            isPublished: form.isPublished,
            isFeatured: form.isFeatured,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create event');
        }

        const created = await response.json();

        if (form.generateBlog && created?.id) {
          try {
            const blogRes = await fetch(`/api/events/${created.id}/generate-blog`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });
            if (blogRes.ok) {
              const blog = await blogRes.json();
              router.push(`/${locale}/admin/blog/${blog.slug}/edit`);
              return;
            }
          } catch {
            // Event created; blog optional — fall through to events list
          }
        }

        router.push(`/${locale}/events/${created.id || ''}`);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const updateForm = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <FormPageShell
      backHref={`/${locale}/events`}
      backLabel={locale === 'fr' ? 'Retour aux événements' : 'Back to Events'}
      title={locale === 'fr' ? 'Créer un événement' : 'Create Event'}
      maxWidth="lg"
    >
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={locale === 'fr' ? 'Titre *' : 'Title *'}
          type="text"
          value={form.title}
          onChange={(e) => updateForm('title', e.target.value)}
          placeholder={locale === 'fr' ? "Nom de l'événement" : 'Event name'}
          required
        />

        <div>
          <label className="text-xs font-medium text-secondary mb-1.5 block">
            {locale === 'fr' ? 'Catégorie *' : 'Category *'}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateForm('categoryId', cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                  form.categoryId === cat.id
                    ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                    : 'bg-card text-secondary border-default hover:bg-card-muted'
                )}
              >
                {cat.name[locale as 'en' | 'fr'] || cat.name.en}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label={locale === 'fr' ? 'Description courte *' : 'Short description *'}
          value={form.description}
          onChange={(e) => updateForm('description', e.target.value)}
          placeholder={locale === 'fr' ? "Brève description de l'événement" : 'Brief event description'}
          rows={3}
          required
        />

        <Textarea
          label={locale === 'fr' ? 'Contenu détaillé *' : 'Detailed content *'}
          value={form.content}
          onChange={(e) => updateForm('content', e.target.value)}
          placeholder={locale === 'fr' ? 'Description complète, agenda, prérequis...' : 'Full description, agenda, prerequisites...'}
          rows={6}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={locale === 'fr' ? 'Date de début *' : 'Start date *'}
            type="datetime-local"
            value={form.date}
            onChange={(e) => updateForm('date', e.target.value)}
            required
          />
          <Input
            label={locale === 'fr' ? 'Date de fin' : 'End date'}
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => updateForm('endDate', e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-xs font-medium text-secondary">
              {locale === 'fr' ? 'Lieu *' : 'Location *'}
            </label>
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.isOnline}
                onChange={(e) => updateForm('isOnline', e.target.checked)}
                className="rounded border-default"
              />
              <Globe className="w-3.5 h-3.5" />
              {locale === 'fr' ? 'En ligne' : 'Online'}
            </label>
          </div>
          <Input
            type="text"
            value={form.location}
            onChange={(e) => updateForm('location', e.target.value)}
            placeholder={form.isOnline
              ? (locale === 'fr' ? 'Ex: Discord, Zoom...' : 'E.g. Discord, Zoom...')
              : (locale === 'fr' ? 'Adresse ou salle' : 'Address or room')}
            required
          />
          {form.isOnline && (
            <div className="mt-2">
              <Input
                type="url"
                value={form.onlineLink}
                onChange={(e) => updateForm('onlineLink', e.target.value)}
                placeholder={locale === 'fr' ? 'Lien de la réunion' : 'Meeting link'}
              />
            </div>
          )}
        </div>

        <Input
          label={locale === 'fr' ? 'Capacité *' : 'Capacity *'}
          type="number"
          value={form.capacity}
          onChange={(e) => updateForm('capacity', parseInt(e.target.value) || 1)}
          min={1}
          max={10000}
          required
        />

        <div>
          <EventMediaPicker
            locale={locale}
            imageUrl={form.imageUrl}
            gallery={form.gallery}
            videoUrls={form.videoUrls}
            onChange={({ imageUrl, gallery, videoUrls }) =>
              setForm((prev) => ({ ...prev, imageUrl, gallery, videoUrls }))
            }
          />
        </div>

        <EventVisibilitySettings
          locale={locale}
          isPublished={form.isPublished}
          isFeatured={form.isFeatured}
          onChange={({ isPublished, isFeatured }) =>
            setForm((prev) => ({ ...prev, isPublished, isFeatured }))
          }
        />

        <label className="flex items-start gap-3 p-3 rounded-xl border border-default bg-card-muted cursor-pointer">
          <input
            type="checkbox"
            checked={form.generateBlog}
            onChange={(e) => updateForm('generateBlog', e.target.checked)}
            className="mt-1 rounded border-default"
          />
          <span>
            <span className="block text-sm font-medium text-primary">
              {locale === 'fr'
                ? 'Générer un article blog (brouillon IA)'
                : 'Generate a blog post (AI draft)'}
            </span>
            <span className="block text-xs text-muted mt-0.5">
              {locale === 'fr'
                ? 'Après création, l’IA rédige un article bilingue à partir du contenu et des médias. Tu pourras le relire avant publication.'
                : 'After create, AI drafts a bilingual article from content & media. You can review before publishing.'}
            </span>
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1" size="lg">
            {isPending
              ? (locale === 'fr' ? 'Création...' : 'Creating...')
              : (locale === 'fr' ? "Créer l'événement" : 'Create Event')}
          </Button>
          <Link href={`/${locale}/events`}>
            <Button variant="secondary" size="lg">
              {locale === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
          </Link>
        </div>
      </form>
    </FormPageShell>
  );
}
