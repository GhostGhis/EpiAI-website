'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { formatShortDate } from '@/lib/events/utils';
import { Calendar, MapPin, Users, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RegistrationItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  status: string;
}

export default function MyRegistrationsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const t = useTranslations('Events');
  const tNav = useTranslations('Navigation');

  const { isSignedIn } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function fetchRegistrations() {
      try {
        const response = await fetch('/api/events/registrations/me');
        if (response.ok) {
          setRegistrations(await response.json());
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegistrations();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">{tNav('signInRequired')}</h1>
        <p className="text-white/60 mb-6">{t('signInToViewRegistrations')}</p>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          {tNav('signIn')}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded mb-2" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('myRegistrations')}</h1>
        <p className="text-white/60">{t('manageRegistrations')}</p>
      </div>

      {registrations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
          <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t('noRegistrations')}</h3>
          <p className="text-white/60 mb-6">{t('noRegistrationsHint')}</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
          >
            {t('browseEvents')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Link
              key={reg.id}
              href={`/events/${reg.eventId}`}
              className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{reg.eventTitle}</h3>
                  <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatShortDate(reg.eventDate, locale as 'en' | 'fr')}
                    </span>
                    {reg.eventLocation && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {reg.eventLocation}
                      </span>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm border border-emerald-500/30">
                  <Check className="w-3 h-3" />
                  {t('registered')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
