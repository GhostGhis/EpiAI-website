'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const empty = {
  titleFr: '',
  titleEn: '',
  excerptFr: '',
  excerptEn: '',
  contentFr: '',
  contentEn: '',
  category: 'Research',
  imageUrl: '',
  authorName: '',
  status: 'draft' as 'draft' | 'published',
};

export default function NewBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error');
        return;
      }
      router.push(`/${locale}/admin/blog`);
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof empty, label: string, multiline = false) => (
    <div>
      <label className="block text-sm text-white/70 mb-1">{label}</label>
      {multiline ? (
        <textarea
          required={name.includes('title') || name.includes('content')}
          rows={name.includes('content') ? 8 : 3}
          value={form[name] as string}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50"
        />
      ) : (
        <input
          required={name.includes('title') || name === 'authorName'}
          value={form[name] as string}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/admin/blog`}
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {locale === 'fr' ? 'Nouvel article' : 'New post'}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {field('titleFr', 'Titre (FR)')}
        {field('titleEn', 'Title (EN)')}
        {field('excerptFr', 'Extrait (FR)', true)}
        {field('excerptEn', 'Excerpt (EN)', true)}
        {field('contentFr', 'Contenu (FR)', true)}
        {field('contentEn', 'Content (EN)', true)}
        {field('category', 'Catégorie')}
        {field('authorName', locale === 'fr' ? 'Auteur' : 'Author')}
        {field('imageUrl', 'URL image (optionnel)')}

        <div>
          <label className="block text-sm text-white/70 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as 'draft' | 'published' })
            }
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-50"
        >
          {loading ? '…' : locale === 'fr' ? 'Publier' : 'Save'}
        </button>
      </form>
    </div>
  );
}
