'use client';

import { cn } from '@/lib/utils/cn';
import { Eye, Star } from 'lucide-react';

interface EventVisibilitySettingsProps {
  locale: string;
  isPublished: boolean;
  isFeatured: boolean;
  onChange: (next: { isPublished: boolean; isFeatured: boolean }) => void;
  className?: string;
}

export function EventVisibilitySettings({
  locale,
  isPublished,
  isFeatured,
  onChange,
  className,
}: EventVisibilitySettingsProps) {
  const fr = locale === 'fr';

  return (
    <fieldset
      className={cn(
        'space-y-3 rounded-xl border border-default bg-card-muted p-4',
        className
      )}
    >
      <legend className="px-1 text-sm font-semibold text-primary">
        {fr ? 'Paramètres de publication' : 'Publication settings'}
      </legend>
      <p className="text-xs text-muted">
        {fr
          ? 'Coche pour rendre l’événement visible sur le site public (accueil + calendrier).'
          : 'Check to make the event visible on the public site (homepage + calendar).'}
      </p>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) =>
            onChange({
              isPublished: e.target.checked,
              isFeatured: e.target.checked ? isFeatured : false,
            })
          }
          className="mt-1 rounded border-default"
        />
        <span className="flex-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Eye className="w-4 h-4" />
            {fr ? 'Événement public' : 'Public event'}
          </span>
          <span className="block text-xs text-muted mt-0.5">
            {fr
              ? 'Visible par tout le monde sur la page d’accueil et le calendrier.'
              : 'Visible to everyone on the homepage and calendar.'}
          </span>
        </span>
      </label>

      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer',
          !isPublished && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="checkbox"
          checked={isFeatured}
          disabled={!isPublished}
          onChange={(e) =>
            onChange({ isPublished, isFeatured: e.target.checked })
          }
          className="mt-1 rounded border-default"
        />
        <span className="flex-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Star className="w-4 h-4" />
            {fr ? 'Mettre en avant' : 'Featured'}
          </span>
          <span className="block text-xs text-muted mt-0.5">
            {fr
              ? 'Priorité dans la section Events de l’accueil.'
              : 'Priority in the homepage Events section.'}
          </span>
        </span>
      </label>
    </fieldset>
  );
}
