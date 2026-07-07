'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const slug = params.slug as string;
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((post) => {
        if (post) {
          setForm({
            titleFr: post.titleFr,
            titleEn: post.titleEn,
            excerptFr: post.excerptFr,
            excerptEn: post.excerptEn,
            contentFr: post.contentFr,
            contentEn: post.contentEn,
            category: post.category,
            authorName: post.authorName,
            imageUrl: post.imageUrl || '',
            status: post.status,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/blog/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) router.push(`/${locale}/admin/blog`);
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;
  }

  const fields = [
    ['titleFr', 'Titre FR'],
    ['titleEn', 'Title EN'],
    ['excerptFr', 'Extrait FR'],
    ['excerptEn', 'Excerpt EN'],
    ['contentFr', 'Contenu FR'],
    ['contentEn', 'Content EN'],
    ['category', 'Catégorie'],
    ['authorName', 'Auteur'],
    ['imageUrl', 'Image URL'],
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/blog`} className="p-2 rounded-lg bg-white/5 text-white/70">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {locale === 'fr' ? 'Modifier l\'article' : 'Edit post'}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm text-white/70 mb-1">{label}</label>
            {key.includes('content') || key.includes('excerpt') ? (
              <textarea
                rows={key.includes('content') ? 8 : 3}
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
              />
            ) : (
              <input
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
              />
            )}
          </div>
        ))}
        <select
          value={form.status || 'draft'}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-brand-600 text-white font-medium disabled:opacity-50"
        >
          {saving ? '…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
