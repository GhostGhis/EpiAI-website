'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles/utils';
import { Calendar, Globe, AlertCircle } from 'lucide-react';
import { FormPageShell, EmptyState, Button, Input, Textarea } from '@/components/ui';

export default function CreateActivityPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const { roleId } = useAuth();

  const canCreate = roleId ? hasPermission(roleId, 'activities.create') : false;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    isOnline: false,
    onlineLink: '',
    isMandatory: true,
  });

  if (!canCreate) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title={
          locale === 'fr'
            ? "Vous n'avez pas la permission de créer des activités."
            : "You don't have permission to create activities."
        }
        action={
          <Link href={`/${locale}/intranet`}>
            <Button variant="secondary">
              {locale === 'fr' ? "Retour à l'intranet" : 'Back to Intranet'}
            </Button>
          </Link>
        }
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.date || !form.location) {
      setError(locale === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields');
      return;
    }

    const activityDate = new Date(form.date);
    if (isNaN(activityDate.getTime()) || activityDate <= new Date()) {
      setError(locale === 'fr' ? 'La date doit être dans le futur' : 'Date must be in the future');
      return;
    }

    if (form.endDate) {
      const endDate = new Date(form.endDate);
      if (isNaN(endDate.getTime()) || endDate <= activityDate) {
        setError(locale === 'fr' ? 'La date de fin doit être après la date de début' : 'End date must be after start date');
        return;
      }
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            date: form.date,
            endDate: form.endDate || undefined,
            location: form.location,
            isOnline: form.isOnline,
            onlineLink: form.isOnline ? form.onlineLink : undefined,
            isMandatory: form.isMandatory,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create activity');
        }

        router.push(`/${locale}/intranet`);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <FormPageShell
      backHref={`/${locale}/intranet`}
      backLabel={locale === 'fr' ? "Retour à l'intranet" : 'Back to Intranet'}
      title={locale === 'fr' ? 'Nouvelle activité' : 'New Activity'}
      description={
        locale === 'fr'
          ? "La deadline d'inscription sera automatiquement fixée à 24h avant l'activité."
          : 'Registration deadline will be automatically set to 24h before the activity.'
      }
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
          placeholder={locale === 'fr' ? "Nom de l'activité" : 'Activity name'}
          required
        />

        <Textarea
          label={locale === 'fr' ? 'Description *' : 'Description *'}
          value={form.description}
          onChange={(e) => updateForm('description', e.target.value)}
          placeholder={locale === 'fr' ? "Décrivez l'activité..." : 'Describe the activity...'}
          rows={4}
          required
        />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isMandatory}
              onChange={(e) => updateForm('isMandatory', e.target.checked)}
              className="rounded border-default"
            />
            <span className="text-secondary text-sm font-medium">
              {locale === 'fr' ? 'Activité obligatoire' : 'Mandatory activity'}
            </span>
          </label>
          <span className="text-muted text-xs">
            {locale === 'fr'
              ? '(les absences non-justifiées seront comptabilisées)'
              : '(unexcused absences will be tracked)'}
          </span>
        </div>

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

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-brand-400 text-sm">
          {locale === 'fr'
            ? "La deadline d'inscription sera automatiquement calculée à 24h avant la date de l'activité. Les membres devront s'inscrire avant cette deadline."
            : 'The registration deadline will be automatically calculated to 24h before the activity date. Members must register before this deadline.'}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1" size="lg">
            {isPending
              ? (locale === 'fr' ? 'Création...' : 'Creating...')
              : (locale === 'fr' ? "Créer l'activité" : 'Create Activity')}
          </Button>
          <Link href={`/${locale}/intranet`}>
            <Button variant="secondary" size="lg">
              {locale === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
          </Link>
        </div>
      </form>
    </FormPageShell>
  );
}
