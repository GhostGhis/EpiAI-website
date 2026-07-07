'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles/utils';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { IActivity, PaginatedResponse } from '@/lib/activities/types';
import { PageHeader, Button, Card, EmptyState, Badge, Panel, Pagination } from '@/components/ui';

export default function IntranetPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { userId, roleId, isAdmin } = useAuth();

  const [activities, setActivities] = useState<IActivity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  const canCreate = roleId ? hasPermission(roleId, 'activities.create') : false;

  useEffect(() => {
    fetchActivities();
  }, [page, showPast]);

  async function fetchActivities() {
    setLoading(true);
    try {
      const res = await fetch(`/api/activities?page=${page}&limit=10&past=${showPast}`);
      if (res.ok) {
        const data: PaginatedResponse<IActivity> = await res.json();
        setActivities(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(activityId: string) {
    setRegistering(activityId);
    try {
      const res = await fetch(`/api/activities/${activityId}/register`, { method: 'POST' });
      if (res.ok) {
        fetchActivities();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setRegistering(null);
    }
  }

  async function handleUnregister(activityId: string) {
    setRegistering(activityId);
    try {
      const res = await fetch(`/api/activities/${activityId}/register`, { method: 'DELETE' });
      if (res.ok) {
        fetchActivities();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to unregister');
      }
    } catch (error) {
      console.error('Error unregistering:', error);
    } finally {
      setRegistering(null);
    }
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Intranet"
        title={locale === 'fr' ? 'Intranet — Activités' : 'Intranet — Activities'}
        description={
          locale === 'fr'
            ? "Consultez et inscrivez-vous aux activités. Inscription obligatoire au moins 24h avant."
            : 'View and register for association activities. Registration is mandatory at least 24h before.'
        }
        actions={
          canCreate ? (
            <Link
              href={`/${locale}/intranet/new`}
              className="inline-flex items-center justify-center font-semibold transition-colors gap-2 px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-500"
            >
              <Plus className="w-4 h-4" />
              {locale === 'fr' ? 'Nouvelle activité' : 'New Activity'}
            </Link>
          ) : undefined
        }
      />

      <div className="flex gap-2">
        <Button
          variant={!showPast ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setShowPast(false); setPage(1); }}
        >
          {locale === 'fr' ? 'À venir' : 'Upcoming'}
        </Button>
        <Button
          variant={showPast ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setShowPast(true); setPage(1); }}
        >
          {locale === 'fr' ? 'Passées' : 'Past'}
        </Button>
      </div>

      {/* My Attendance Summary */}
      <AttendanceSummaryCard locale={locale} />

      {/* Activities List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-default animate-pulse shadow-card">
              <div className="h-6 w-48 bg-card-muted rounded mb-3" />
              <div className="h-4 w-32 bg-card-muted rounded" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title={
            showPast
              ? (locale === 'fr' ? 'Aucune activité passée.' : 'No past activities.')
              : (locale === 'fr' ? 'Aucune activité à venir.' : 'No upcoming activities.')
          }
        />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:border-brand-500/25 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-primary">{activity.title}</h3>
                    {activity.isMandatory && (
                      <Badge variant="danger">
                        {locale === 'fr' ? 'Obligatoire' : 'Mandatory'}
                      </Badge>
                    )}
                    {activity.isPast && (
                      <Badge variant="muted">
                        {locale === 'fr' ? 'Terminé' : 'Past'}
                      </Badge>
                    )}
                  </div>

                  <p className="text-secondary text-sm mb-3">{activity.description}</p>

                  <div className="flex flex-wrap gap-4 text-muted text-xs">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(activity.date).toLocaleDateString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {activity.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {activity.registeredCount} {locale === 'fr' ? 'inscrits' : 'registered'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {locale === 'fr' ? 'Deadline:' : 'Deadline:'}{' '}
                      {new Date(activity.registrationDeadline).toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  {!activity.isPast && (
                    activity.isRegistered ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/20 text-brand-400 text-sm border border-brand-500/30">
                          <CheckCircle className="w-4 h-4" />
                          {locale === 'fr' ? 'Inscrit' : 'Registered'}
                        </span>
                        {activity.canRegister && (
                          <button
                            onClick={() => handleUnregister(activity.id)}
                            disabled={registering === activity.id}
                            className="text-xs text-muted hover:text-red-400 transition-colors"
                          >
                            {locale === 'fr' ? 'Se désinscrire' : 'Unregister'}
                          </button>
                        )}
                      </div>
                    ) : activity.canRegister ? (
                      <Button
                        size="sm"
                        onClick={() => handleRegister(activity.id)}
                        disabled={registering === activity.id}
                      >
                        {registering === activity.id
                          ? '...'
                          : (locale === 'fr' ? "S'inscrire" : 'Register')}
                      </Button>
                    ) : (
                      <Badge variant="amber" className="gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {locale === 'fr' ? 'Deadline passée' : 'Deadline passed'}
                      </Badge>
                    )
                  )}

                  {/* Admin link */}
                  {isAdmin && (
                    <Link
                      href={`/${locale}/intranet/${activity.id}`}
                      className="text-xs text-amber-400 hover:text-amber-300 text-center transition-colors"
                    >
                      {locale === 'fr' ? 'Gérer' : 'Manage'}
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

// Composant résumé de présence personnelle
function AttendanceSummaryCard({ locale }: { locale: string }) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('/api/attendance/report')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSummary(data); })
      .catch(() => {});
  }, []);

  if (!summary || (!summary.totalPresent && !summary.totalAbsent)) return null;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-secondary mb-3">
        {locale === 'fr' ? 'Mon résumé de présence' : 'My Attendance Summary'}
      </h3>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          <span className="text-primary text-sm font-bold">{summary.totalPresent}</span>
          <span className="text-muted text-xs">{locale === 'fr' ? 'Présences' : 'Present'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-primary text-sm font-bold">{summary.totalAbsent}</span>
          <span className="text-muted text-xs">{locale === 'fr' ? 'Absences' : 'Absent'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">{locale === 'fr' ? 'Taux:' : 'Rate:'}</span>
          <span className={`text-sm font-bold ${summary.attendanceRate >= 70 ? 'text-brand-400' : 'text-red-400'}`}>
            {summary.attendanceRate?.toFixed(0)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
