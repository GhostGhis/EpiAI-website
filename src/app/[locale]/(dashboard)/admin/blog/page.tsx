'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';

interface BlogPost {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  status: string;
  category: string;
  publishedAt: string | null;
}

export default function AdminBlogPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog?admin=true')
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const remove = async (slug: string) => {
    if (!confirm(locale === 'fr' ? 'Supprimer cet article ?' : 'Delete this post?')) return;
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
    if (res.ok) setPosts((p) => p.filter((x) => x.slug !== slug));
  };

  return (
    <PermissionGate permission="content.create">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {locale === 'fr' ? 'Gestion du blog' : 'Blog management'}
            </h1>
            <p className="text-white/60">
              {locale === 'fr'
                ? 'Publiez les actualités du pôle Recherche & Com.'
                : 'Publish news from the Research & Com pole.'}
            </p>
          </div>
          <Link
            href={`/${locale}/admin/blog/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {locale === 'fr' ? 'Nouvel article' : 'New post'}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            {locale === 'fr' ? 'Aucun article.' : 'No posts yet.'}
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">
                    {locale === 'fr' ? post.titleFr : post.titleEn}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {post.category} · {post.status}
                    {post.publishedAt &&
                      ` · ${new Date(post.publishedAt).toLocaleDateString(locale)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/${locale}/admin/blog/${post.slug}/edit`}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
                    aria-label={locale === 'fr' ? 'Modifier' : 'Edit'}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => remove(post.slug)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    aria-label={locale === 'fr' ? 'Supprimer' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PermissionGate>
  );
}
