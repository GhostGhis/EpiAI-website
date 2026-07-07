'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import type { MemberAttendanceSummary } from '@/lib/activities/types';
import {
  PageHeader,
  StatCard,
  Panel,
  Badge,
  Button,
  DataTable,
  DataTableHead,
  DataTableHeadRow,
  DataTableTh,
  DataTableBody,
  DataTableRow,
  DataTableTd,
} from '@/components/ui';

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
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title={locale === 'fr' ? 'Mes présences' : 'My attendance'}
        description={
          locale === 'fr'
            ? 'Suivez votre taux de participation aux activités intranet.'
            : 'Track your intranet activity participation rate.'
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <StatCard key={i} label="" value="" loading />
          ))}
        </div>
      ) : !summary ? (
        <Panel>
          <p className="text-muted text-center py-4">
            {locale === 'fr' ? 'Aucune donnée.' : 'No data.'}
          </p>
        </Panel>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              label={locale === 'fr' ? 'Présences' : 'Present'}
              value={summary.totalPresent}
              icon={UserCheck}
            />
            <StatCard
              label={locale === 'fr' ? 'Taux' : 'Rate'}
              value={`${Math.round(rate)}%`}
              icon={TrendingUp}
            />
            <StatCard
              label={locale === 'fr' ? 'Activités' : 'Activities'}
              value={totalActs}
            />
          </div>

          {isLow && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
              role="alert"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden />
              <p className="text-amber-800 text-sm">
                {locale === 'fr'
                  ? 'Ton taux de présence est inférieur à 50 %. Pense à t\'inscrire aux prochaines activités obligatoires.'
                  : 'Your attendance rate is below 50%. Consider registering for upcoming mandatory activities.'}
              </p>
            </div>
          )}

          {summary.details && summary.details.length > 0 && (
            <Panel
              title={locale === 'fr' ? 'Historique' : 'Activity history'}
              noPadding
              bodyClassName="p-0"
            >
              <DataTable>
                <DataTableHead>
                  <DataTableHeadRow>
                    <DataTableTh>{locale === 'fr' ? 'Activité' : 'Activity'}</DataTableTh>
                    <DataTableTh>{locale === 'fr' ? 'Date' : 'Date'}</DataTableTh>
                    <DataTableTh>{locale === 'fr' ? 'Statut' : 'Status'}</DataTableTh>
                  </DataTableHeadRow>
                </DataTableHead>
                <DataTableBody>
                  {summary.details.map((r) => (
                    <DataTableRow key={r.activityId}>
                      <DataTableTd className="text-primary">{r.activityTitle}</DataTableTd>
                      <DataTableTd className="text-secondary">
                        {r.activityDate
                          ? new Date(r.activityDate).toLocaleDateString(locale)
                          : '—'}
                      </DataTableTd>
                      <DataTableTd>
                        <Badge variant={r.isPresent ? 'success' : 'danger'}>
                          {r.isPresent
                            ? locale === 'fr'
                              ? 'Présent'
                              : 'Present'
                            : locale === 'fr'
                              ? 'Absent'
                              : 'Absent'}
                        </Badge>
                      </DataTableTd>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </Panel>
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
