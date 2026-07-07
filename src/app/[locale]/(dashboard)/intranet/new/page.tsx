'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles/utils';
import { ArrowLeft, Calendar, MapPin, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
      <div className="max-w-2xl mx-auto text-center py-16">
        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Accès refusé' : 'Access Denied'}
        </h1>
        <p className="text-white/60 mb-6">
          {locale === 'fr'
            ? 'Vous n\'avez pas la permission de créer des activités.'
            : 'You don\'t have permission to create activities.'}
        </p>
        <Link
          href={`/${locale}/intranet`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'fr' ? 'Retour à l\'intranet' : 'Back to Intranet'}
        </Link>
      </div>
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
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/${locale}/intranet`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {locale === 'fr' ? 'Retour à l\'intranet' : 'Back to Intranet'}
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">
        {locale === 'fr' ? 'Nouvelle activité' : 'New Activity'}
      </h1>
      <p className="text-white/60 mb-8">
        {locale === 'fr'
          ? 'La deadline d\'inscription sera automatiquement fixée à 24h avant l\'activité.'
          : 'Registration deadline will be automatically set to 24h before the activity.'}
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            {locale === 'fr' ? 'Titre *' : 'Title *'}
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder={locale === 'fr' ? 'Nom de l\'activité' : 'Activity name'}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            {locale === 'fr' ? 'Description *' : 'Description *'}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder={locale === 'fr' ? 'Décrivez l\'activité...' : 'Describe the activity...'}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
            required
          />
        </div>

        {/* Mandatory */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isMandatory}
              onChange={(e) => updateForm('isMandatory', e.target.checked)}
              className="rounded border-white/20"
            />
            <span className="text-white/70 text-sm font-medium">
              {locale === 'fr' ? 'Activité obligatoire' : 'Mandatory activity'}
            </span>
          </label>
          <span className="text-white/40 text-xs">
            {locale === 'fr'
              ? '(les absences non-justifiées seront comptabilisées)'
              : '(unexcused absences will be tracked)'}
          </span>
        </div>

        {/* Date / End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {locale === 'fr' ? 'Date de début *' : 'Start date *'}
            </label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateForm('date', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {locale === 'fr' ? 'Date de fin' : 'End date'}
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => updateForm('endDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Location / Online */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <label className="block text-white/70 text-sm font-medium">
              <MapPin className="w-4 h-4 inline mr-1" />
              {locale === 'fr' ? 'Lieu *' : 'Location *'}
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isOnline}
                onChange={(e) => updateForm('isOnline', e.target.checked)}
                className="rounded border-white/20"
              />
              <Globe className="w-4 h-4" />
              {locale === 'fr' ? 'En ligne' : 'Online'}
            </label>
          </div>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateForm('location', e.target.value)}
            placeholder={form.isOnline
              ? (locale === 'fr' ? 'Ex: Discord, Zoom...' : 'E.g. Discord, Zoom...')
              : (locale === 'fr' ? 'Adresse ou salle' : 'Address or room')}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            required
          />
          {form.isOnline && (
            <input
              type="url"
              value={form.onlineLink}
              onChange={(e) => updateForm('onlineLink', e.target.value)}
              placeholder={locale === 'fr' ? 'Lien de la réunion' : 'Meeting link'}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          )}
        </div>

        {/* Info box about deadline */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-brand-400 text-sm">
          {locale === 'fr'
            ? 'La deadline d\'inscription sera automatiquement calculée à 24h avant la date de l\'activité. Les membres devront s\'inscrire avant cette deadline.'
            : 'The registration deadline will be automatically calculated to 24h before the activity date. Members must register before this deadline.'}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'flex-1 py-3 rounded-xl font-semibold transition-all',
              'bg-brand-600 text-white hover:bg-brand-700',
              isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isPending
              ? (locale === 'fr' ? 'Création...' : 'Creating...')
              : (locale === 'fr' ? 'Créer l\'activité' : 'Create Activity')}
          </button>
          <Link
            href={`/${locale}/intranet`}
            className="px-6 py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-medium"
          >
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Link>
        </div>
      </form>
    </div>
  );
}
