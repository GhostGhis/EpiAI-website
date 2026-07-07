'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { formatShortDate } from '@/lib/events/utils';
import { Calendar, MapPin, Users, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, Card, EmptyState, Panel, Badge } from '@/components/ui';

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
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title={t('signInToViewRegistrations')}
        action={
          <Link href="/sign-in">
            <Button>{tNav('signIn')}</Button>
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-default animate-pulse shadow-card">
            <div className="h-6 w-48 bg-card-muted rounded mb-2" />
            <div className="h-4 w-32 bg-card-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('myRegistrations')} description={t('manageRegistrations')} />

      {registrations.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title={t('noRegistrationsHint')}
          action={
            <Link href="/events">
              <Button>{t('browseEvents')}</Button>
            </Link>
          }
        />
      ) : (
        <Panel title={t('myRegistrations')} description={`${registrations.length} ${registrations.length === 1 ? 'registration' : 'registrations'}`}>
          <div className="space-y-3">
            {registrations.map((reg) => (
              <Link key={reg.id} href={`/events/${reg.eventId}`} className="block">
                <Card className="hover:border-brand-500/25 hover:shadow-card transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-2">{reg.eventTitle}</h3>
                      <div className="flex flex-wrap gap-4 text-secondary text-sm">
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
                    <Badge variant="success" className="gap-1">
                      <Check className="w-3 h-3" />
                      {t('registered')}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
