'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/lib/events/categories';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto text-center py-16 text-white">
        {locale === 'fr' ? 'Accès refusé' : 'Access denied'}
      </div>
    );
  }

  if (loading) {
    return <div className="animate-pulse h-64 rounded-2xl bg-white/5" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', ...form }),
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
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/${locale}/events/${eventId}`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {locale === 'fr' ? 'Retour' : 'Back'}
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        {locale === 'fr' ? 'Modifier l\'événement' : 'Edit event'}
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Titre"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <textarea
          required
          rows={5}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Contenu"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <select
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name[locale as 'fr' | 'en'] || c.name.fr}</option>
          ))}
        </select>
        <input
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <input
          required
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          placeholder="Lieu"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <input
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
        >
          {isPending ? '...' : locale === 'fr' ? 'Enregistrer' : 'Save'}
        </button>
      </form>
    </div>
  );
}
