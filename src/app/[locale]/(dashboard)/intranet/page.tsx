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
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { IActivity, PaginatedResponse } from '@/lib/activities/types';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {locale === 'fr' ? 'Intranet - Activités' : 'Intranet - Activities'}
          </h1>
          <p className="text-white/60">
            {locale === 'fr'
              ? 'Consultez et inscrivez-vous aux activités de l\'association. L\'inscription est obligatoire au moins 24h avant.'
              : 'View and register for association activities. Registration is mandatory at least 24h before.'}
          </p>
        </div>
        {canCreate && (
          <Link
            href={`/${locale}/intranet/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            {locale === 'fr' ? 'Nouvelle activité' : 'New Activity'}
          </Link>
        )}
      </div>

      {/* Toggle Past/Upcoming */}
      <div className="flex gap-2">
        <button
          onClick={() => { setShowPast(false); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !showPast
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          {locale === 'fr' ? 'A venir' : 'Upcoming'}
        </button>
        <button
          onClick={() => { setShowPast(true); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showPast
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          {locale === 'fr' ? 'Passées' : 'Past'}
        </button>
      </div>

      {/* My Attendance Summary */}
      <AttendanceSummaryCard locale={locale} />

      {/* Activities List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
              <div className="h-6 w-48 bg-white/10 rounded mb-3" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
          <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {locale === 'fr' ? 'Aucune activité' : 'No activities'}
          </h3>
          <p className="text-white/60">
            {showPast
              ? (locale === 'fr' ? 'Aucune activité passée.' : 'No past activities.')
              : (locale === 'fr' ? 'Aucune activité à venir.' : 'No upcoming activities.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
                    {activity.isMandatory && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30 font-medium">
                        {locale === 'fr' ? 'Obligatoire' : 'Mandatory'}
                      </span>
                    )}
                    {activity.isPast && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs border border-gray-500/30">
                        {locale === 'fr' ? 'Terminé' : 'Past'}
                      </span>
                    )}
                  </div>

                  <p className="text-white/60 text-sm mb-3">{activity.description}</p>

                  <div className="flex flex-wrap gap-4 text-white/50 text-xs">
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
                            className="text-xs text-white/40 hover:text-red-400 transition-colors"
                          >
                            {locale === 'fr' ? 'Se désinscrire' : 'Unregister'}
                          </button>
                        )}
                      </div>
                    ) : activity.canRegister ? (
                      <button
                        onClick={() => handleRegister(activity.id)}
                        disabled={registering === activity.id}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {registering === activity.id
                          ? '...'
                          : (locale === 'fr' ? 'S\'inscrire' : 'Register')}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30">
                        <AlertCircle className="w-4 h-4" />
                        {locale === 'fr' ? 'Deadline passée' : 'Deadline passed'}
                      </span>
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
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-white/60 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
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
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-semibold text-white/80 mb-3">
        {locale === 'fr' ? 'Mon résumé de présence' : 'My Attendance Summary'}
      </h3>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          <span className="text-white text-sm font-bold">{summary.totalPresent}</span>
          <span className="text-white/50 text-xs">{locale === 'fr' ? 'Présences' : 'Present'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-white text-sm font-bold">{summary.totalAbsent}</span>
          <span className="text-white/50 text-xs">{locale === 'fr' ? 'Absences' : 'Absent'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs">{locale === 'fr' ? 'Taux:' : 'Rate:'}</span>
          <span className={`text-sm font-bold ${summary.attendanceRate >= 70 ? 'text-brand-400' : 'text-red-400'}`}>
            {summary.attendanceRate?.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
