'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import type { MemberAttendanceSummary } from '@/lib/activities/types';

export default function MyAttendancePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const [summary, setSummary] = useState<MemberAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attendance/report')
      .then((r) => (r.ok ? r.json() : null))
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const rate = summary?.attendanceRate ?? 0;
  const totalActs = (summary?.totalPresent ?? 0) + (summary?.totalAbsent ?? 0);
  const isLow = rate < 50 && totalActs > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {locale === 'fr' ? 'Mes présences' : 'My attendance'}
        </h1>
        <p className="text-white/60">
          {locale === 'fr'
            ? 'Suivez votre taux de participation aux activités intranet.'
            : 'Track your intranet activity participation rate.'}
        </p>
      </div>

      {loading ? (
        <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
      ) : !summary ? (
        <p className="text-white/40">{locale === 'fr' ? 'Aucune donnée.' : 'No data.'}</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <UserCheck className="w-6 h-6 text-brand-400 mb-2" aria-hidden />
              <p className="text-2xl font-bold text-white">{summary.totalPresent}</p>
              <p className="text-white/50 text-sm">
                {locale === 'fr' ? 'Présences' : 'Present'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <TrendingUp className="w-6 h-6 text-brand-400 mb-2" aria-hidden />
              <p className="text-2xl font-bold text-white">{Math.round(rate)}%</p>
              <p className="text-white/50 text-sm">
                {locale === 'fr' ? 'Taux' : 'Rate'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-white">{totalActs}</p>
              <p className="text-white/50 text-sm">
                {locale === 'fr' ? 'Activités' : 'Activities'}
              </p>
            </div>
          </div>

          {isLow && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
              role="alert"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
              <p className="text-amber-200 text-sm">
                {locale === 'fr'
                  ? 'Ton taux de présence est inférieur à 50 %. Pense à t\'inscrire aux prochaines activités obligatoires.'
                  : 'Your attendance rate is below 50%. Consider registering for upcoming mandatory activities.'}
              </p>
            </div>
          )}

          {summary.details && summary.details.length > 0 && (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-left">
                    <th className="p-4 font-medium">
                      {locale === 'fr' ? 'Activité' : 'Activity'}
                    </th>
                    <th className="p-4 font-medium">
                      {locale === 'fr' ? 'Date' : 'Date'}
                    </th>
                    <th className="p-4 font-medium">
                      {locale === 'fr' ? 'Statut' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.details.map((r) => (
                    <tr key={r.activityId} className="border-b border-white/5">
                      <td className="p-4 text-white">{r.activityTitle}</td>
                      <td className="p-4 text-white/60">
                        {r.activityDate
                          ? new Date(r.activityDate).toLocaleDateString(locale)
                          : '—'}
                      </td>
                      <td className="p-4">
                        <span className={r.isPresent ? 'text-brand-400' : 'text-red-400'}>
                          {r.isPresent
                            ? locale === 'fr'
                              ? 'Présent'
                              : 'Present'
                            : locale === 'fr'
                              ? 'Absent'
                              : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link
            href="/intranet"
            className="inline-block text-brand-400 hover:text-brand-300 text-sm"
          >
            {locale === 'fr' ? 'Voir les activités intranet →' : 'View intranet activities →'}
          </Link>
        </>
      )}
    </div>
  );
}
