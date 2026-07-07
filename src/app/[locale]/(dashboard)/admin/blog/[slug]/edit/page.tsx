'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormPageShell, Button, Input, Textarea, Select } from '@/components/ui';

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
    return <div className="animate-pulse h-64 bg-card rounded-xl" />;
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
    <FormPageShell
      backHref={`/${locale}/admin/blog`}
      backLabel={locale === 'fr' ? 'Retour au blog' : 'Back to blog'}
      title={locale === 'fr' ? "Modifier l'article" : 'Edit post'}
      maxWidth="lg"
    >
      <form onSubmit={submit} className="space-y-5">
        {fields.map(([key, label]) =>
          key.includes('content') || key.includes('excerpt') ? (
            <Textarea
              key={key}
              label={label}
              rows={key.includes('content') ? 8 : 3}
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ) : (
            <Input
              key={key}
              label={label}
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          )
        )}
        <Select
          label="Status"
          value={form.status || 'draft'}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
        <Button type="submit" disabled={saving} className="w-full" size="lg">
          {saving ? '…' : 'Save'}
        </Button>
      </form>
    </FormPageShell>
  );
}
