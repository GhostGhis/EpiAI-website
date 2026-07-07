'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormPageShell, Button, Input, Textarea, Select } from '@/components/ui';

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

  return (
    <FormPageShell
      backHref={`/${locale}/admin/blog`}
      backLabel={locale === 'fr' ? 'Retour au blog' : 'Back to blog'}
      title={locale === 'fr' ? 'Nouvel article' : 'New post'}
      maxWidth="lg"
    >
      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Titre (FR)"
          required
          value={form.titleFr}
          onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
        />
        <Input
          label="Title (EN)"
          required
          value={form.titleEn}
          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
        />
        <Textarea
          label="Extrait (FR)"
          rows={3}
          value={form.excerptFr}
          onChange={(e) => setForm({ ...form, excerptFr: e.target.value })}
        />
        <Textarea
          label="Excerpt (EN)"
          rows={3}
          value={form.excerptEn}
          onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
        />
        <Textarea
          label="Contenu (FR)"
          required
          rows={8}
          value={form.contentFr}
          onChange={(e) => setForm({ ...form, contentFr: e.target.value })}
        />
        <Textarea
          label="Content (EN)"
          required
          rows={8}
          value={form.contentEn}
          onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
        />
        <Input
          label="Catégorie"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <Input
          label={locale === 'fr' ? 'Auteur' : 'Author'}
          required
          value={form.authorName}
          onChange={(e) => setForm({ ...form, authorName: e.target.value })}
        />
        <Input
          label="URL image (optionnel)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as 'draft' | 'published' })
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>

        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? '…' : locale === 'fr' ? 'Publier' : 'Save'}
        </Button>
      </form>
    </FormPageShell>
  );
}
