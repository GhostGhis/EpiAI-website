'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface GenerateEventBlogButtonProps {
  eventId: string;
  className?: string;
}

export function GenerateEventBlogButton({ eventId, className }: GenerateEventBlogButtonProps) {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (force = false) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/generate-blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.push(`/${locale}/admin/blog/${data.slug}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={() => handleGenerate(false)}
        disabled={loading}
        size="sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {fr ? 'Générer un article blog' : 'Generate blog post'}
      </Button>
      {error ? (
        <p className="text-xs text-red-500 mt-2 max-w-sm">
          {error}
          {error.includes('AI') || error.includes('configur') ? null : (
            <>
              {' '}
              <button
                type="button"
                className="underline"
                onClick={() => handleGenerate(true)}
              >
                {fr ? 'Régénérer' : 'Regenerate'}
              </button>
            </>
          )}
        </p>
      ) : (
        <p className="text-xs text-muted mt-1.5">
          {fr
            ? 'IA → brouillon bilingue à partir du titre, contenu et médias.'
            : 'AI → bilingual draft from title, content and media.'}
        </p>
      )}
    </div>
  );
}
