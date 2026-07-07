'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Save,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { IActivity, IActivityRegistration, IAttendance } from '@/lib/activities/types';

export default function ActivityDetailPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const activityId = params.id as string;
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [activity, setActivity] = useState<IActivity | null>(null);
  const [registrations, setRegistrations] = useState<IActivityRegistration[]>([]);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Force register form
  const [showForceForm, setShowForceForm] = useState(false);
  const [forceUserId, setForceUserId] = useState('');
  const [forceUserName, setForceUserName] = useState('');
  const [forceUserEmail, setForceUserEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, [activityId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [actRes, attRes] = await Promise.all([
        fetch(`/api/activities/${activityId}?registrations=true`),
        fetch(`/api/activities/${activityId}/attendance`),
      ]);

      if (actRes.ok) {
        const data = await actRes.json();
        setActivity(data);
        setRegistrations(data.registrations || []);
      }

      if (attRes.ok) {
        const data = await attRes.json();
        setAttendance([...data.presentList, ...data.absentList]);
        // Initialiser la map de présence
        const map: Record<string, boolean> = {};
        data.presentList.forEach((a: IAttendance) => { map[a.userId] = true; });
        data.absentList.forEach((a: IAttendance) => { map[a.userId] = false; });
        setAttendanceMap(map);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAttendance() {
    setSaving(true);
    try {
      // Préparer les données de présence
      const attendances = registrations.map(reg => ({
        userId: reg.userId,
        userName: reg.userName,
        userEmail: reg.userEmail,
        isPresent: attendanceMap[reg.userId] ?? false,
      }));

      const res = await fetch(`/api/activities/${activityId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances }),
      });

      if (res.ok) {
        alert(locale === 'fr' ? 'Présences sauvegardées!' : 'Attendance saved!');
        fetchData();
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleForceRegister() {
    if (!forceUserId || !forceUserName || !forceUserEmail) return;

    try {
      const res = await fetch(`/api/activities/${activityId}/force-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: forceUserId,
          userName: forceUserName,
          userEmail: forceUserEmail,
        }),
      });

      if (res.ok) {
        setShowForceForm(false);
        setForceUserId('');
        setForceUserName('');
        setForceUserEmail('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleDelete() {
    if (!confirm(locale === 'fr' ? 'Supprimer cette activité?' : 'Delete this activity?')) return;

    const res = await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
    if (res.ok) router.push(`/${locale}/intranet`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60">{locale === 'fr' ? 'Activité non trouvée' : 'Activity not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href={`/${locale}/intranet`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {locale === 'fr' ? 'Retour aux activités' : 'Back to activities'}
      </Link>

      {/* Activity Info */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{activity.title}</h1>
            <p className="text-white/60 mb-4">{activity.description}</p>
            <div className="flex flex-wrap gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(activity.date).toLocaleDateString(locale, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {activity.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {activity.registeredCount} {locale === 'fr' ? 'inscrits' : 'registered'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activity.linkedEventId && (
              <Link
                href={`/${locale}/events/${activity.linkedEventId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 text-brand-400 text-sm hover:bg-brand-500/30 transition-colors border border-brand-500/25"
              >
                <ExternalLink className="w-4 h-4" />
                {locale === 'fr' ? 'Voir l\'événement' : 'View Event'}
              </Link>
            )}
            <PermissionGate permission="activities.manage">
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Admin: Attendance Management */}
      <PermissionGate permission="attendance.manage">
        <div className="p-6 rounded-2xl bg-white/5 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-amber-400">
              {locale === 'fr' ? 'Gestion de la présence' : 'Attendance Management'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForceForm(!showForceForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-400 text-sm hover:bg-brand-600/30 transition-colors border border-brand-500/25"
              >
                <UserPlus className="w-4 h-4" />
                {locale === 'fr' ? 'Inscrire de force' : 'Force Register'}
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '...' : (locale === 'fr' ? 'Sauvegarder' : 'Save')}
              </button>
            </div>
          </div>

          {/* Force Register Form */}
          {showForceForm && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-sm font-semibold text-white">
                {locale === 'fr' ? 'Inscription forcée' : 'Force Registration'}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  value={forceUserId}
                  onChange={(e) => setForceUserId(e.target.value)}
                  placeholder="User ID (Clerk)"
                  className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 outline-none"
                />
                <input
                  value={forceUserName}
                  onChange={(e) => setForceUserName(e.target.value)}
                  placeholder={locale === 'fr' ? 'Nom complet' : 'Full name'}
                  className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 outline-none"
                />
                <input
                  value={forceUserEmail}
                  onChange={(e) => setForceUserEmail(e.target.value)}
                  placeholder="Email"
                  className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 outline-none"
                />
              </div>
              <button
                onClick={handleForceRegister}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                {locale === 'fr' ? 'Inscrire' : 'Register'}
              </button>
            </div>
          )}

          {/* Attendance List */}
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-xs text-white/40 font-semibold uppercase">
              <span>{locale === 'fr' ? 'Membre' : 'Member'}</span>
              <span>{locale === 'fr' ? 'Présent' : 'Present'}</span>
              <span>{locale === 'fr' ? 'Absent' : 'Absent'}</span>
            </div>
            {registrations.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">
                {locale === 'fr' ? 'Aucun inscrit' : 'No registrations'}
              </p>
            ) : (
              registrations.map((reg) => (
                <div
                  key={reg.userId}
                  className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 rounded-xl border transition-all ${
                    attendanceMap[reg.userId] === true
                      ? 'bg-brand-500/10 border-brand-500/20'
                      : attendanceMap[reg.userId] === false
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{reg.userName}</p>
                    <p className="text-white/40 text-xs">{reg.userEmail}</p>
                    {reg.isForcedRegistration && (
                      <span className="text-amber-400 text-[10px]">
                        {locale === 'fr' ? '(Inscription forcée)' : '(Force registered)'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setAttendanceMap(m => ({ ...m, [reg.userId]: true }))}
                    className={`p-2 rounded-lg transition-colors ${
                      attendanceMap[reg.userId] === true
                        ? 'bg-brand-500 text-white'
                        : 'bg-white/5 text-white/30 hover:text-brand-400'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setAttendanceMap(m => ({ ...m, [reg.userId]: false }))}
                    className={`p-2 rounded-lg transition-colors ${
                      attendanceMap[reg.userId] === false
                        ? 'bg-red-500 text-white'
                        : 'bg-white/5 text-white/30 hover:text-red-400'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </PermissionGate>
    </div>
  );
}
