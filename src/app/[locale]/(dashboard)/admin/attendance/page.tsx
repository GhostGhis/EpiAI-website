'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Users, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { MemberAttendanceSummary } from '@/lib/activities/types';
import {
  PageHeader,
  Panel,
  Input,
  EmptyState,
  Badge,
  DataTable,
  DataTableHead,
  DataTableHeadRow,
  DataTableTh,
  DataTableBody,
  DataTableRow,
  DataTableTd,
} from '@/components/ui';

export default function AttendanceReportPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [members, setMembers] = useState<MemberAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<MemberAttendanceSummary | null>(null);

  useEffect(() => {
    fetch('/api/attendance/report?all=true')
      .then(res => res.ok ? res.json() : [])
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  async function loadUserDetails(userId: string) {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setSelectedUserDetails(null);
      return;
    }
    setExpandedUser(userId);
    try {
      const res = await fetch(`/api/attendance/report?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserDetails(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const filtered = members.filter(m =>
    m.userName.toLowerCase().includes(search.toLowerCase()) ||
    m.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PermissionGate permission="attendance.manage">
      <div className="space-y-5">
        <PageHeader
          eyebrow="Admin"
          title={locale === 'fr' ? 'Rapport de Présence' : 'Attendance Report'}
          description={
            locale === 'fr'
              ? 'Consultez le rapport de présence de chaque membre.'
              : 'View attendance reports for each member.'
          }
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === 'fr' ? 'Rechercher un membre...' : 'Search member...'}
            className="pl-10"
          />
        </div>

        <Panel
          title={locale === 'fr' ? 'Membres' : 'Members'}
          description={`${filtered.length} ${locale === 'fr' ? 'membre(s)' : 'member(s)'}`}
          noPadding
          bodyClassName="p-0"
        >
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-default animate-pulse">
                  <div className="h-5 w-40 bg-card-muted rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<Users className="w-12 h-12" />}
                title={locale === 'fr' ? 'Aucune donnée de présence' : 'No attendance data'}
              />
            </div>
          ) : (
            <DataTable>
              <DataTableHead>
                <DataTableHeadRow>
                  <DataTableTh>{locale === 'fr' ? 'Membre' : 'Member'}</DataTableTh>
                  <DataTableTh className="text-center">{locale === 'fr' ? 'Présent' : 'Present'}</DataTableTh>
                  <DataTableTh className="text-center">{locale === 'fr' ? 'Absent' : 'Absent'}</DataTableTh>
                  <DataTableTh className="text-center">{locale === 'fr' ? 'Taux' : 'Rate'}</DataTableTh>
                  <DataTableTh className="w-8"><span className="sr-only">Expand</span></DataTableTh>
                </DataTableHeadRow>
              </DataTableHead>
              <DataTableBody>
                {filtered.map((member) => (
                  <Fragment key={member.userId}>
                    <DataTableRow className="cursor-pointer">
                      <DataTableTd>
                        <button
                          type="button"
                          onClick={() => loadUserDetails(member.userId)}
                          className="flex items-center gap-3 min-w-0 text-left w-full"
                        >
                          <div className="w-8 h-8 rounded-full bg-card-muted flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                            {member.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-primary text-sm font-medium">{member.userName}</p>
                            <p className="text-muted text-xs truncate">{member.userEmail}</p>
                            {member.attendanceRate < 50 && member.totalPresent + member.totalAbsent > 2 && (
                              <Badge variant="amber" className="mt-1">
                                {locale === 'fr' ? 'Absences répétées' : 'Low attendance'}
                              </Badge>
                            )}
                          </div>
                        </button>
                      </DataTableTd>
                      <DataTableTd className="text-center text-brand-400 font-semibold tabular-nums">
                        {member.totalPresent}
                      </DataTableTd>
                      <DataTableTd className="text-center text-red-400 font-semibold tabular-nums">
                        {member.totalAbsent}
                      </DataTableTd>
                      <DataTableTd className="text-center">
                        <span className={`font-semibold tabular-nums ${member.attendanceRate >= 70 ? 'text-brand-400' : 'text-red-400'}`}>
                          {member.attendanceRate.toFixed(0)}%
                        </span>
                      </DataTableTd>
                      <DataTableTd>
                        <button
                          type="button"
                          onClick={() => loadUserDetails(member.userId)}
                          className="flex justify-center w-full"
                          aria-label={locale === 'fr' ? 'Voir les détails' : 'View details'}
                        >
                          {expandedUser === member.userId ? (
                            <ChevronUp className="w-4 h-4 text-muted" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted" />
                          )}
                        </button>
                      </DataTableTd>
                    </DataTableRow>
                    {expandedUser === member.userId && selectedUserDetails && (
                      <DataTableRow>
                        <DataTableTd colSpan={5}>
                          <div className="ml-4 space-y-1 p-3 rounded-xl bg-card-muted border border-subtle">
                            {selectedUserDetails.details.length === 0 ? (
                              <p className="text-muted text-xs">{locale === 'fr' ? 'Aucun détail' : 'No details'}</p>
                            ) : (
                              selectedUserDetails.details.map((d, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-subtle last:border-0">
                                  <div>
                                    <span className="text-secondary">{d.activityTitle}</span>
                                    <span className="text-muted ml-2">
                                      {d.activityDate ? new Date(d.activityDate).toLocaleDateString(locale) : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!d.wasRegistered && (
                                      <Badge variant="amber">
                                        {locale === 'fr' ? 'Non inscrit' : 'Not registered'}
                                      </Badge>
                                    )}
                                    <Badge variant={d.isPresent ? 'success' : 'danger'}>
                                      {d.isPresent
                                        ? (locale === 'fr' ? 'Présent' : 'Present')
                                        : (locale === 'fr' ? 'Absent' : 'Absent')}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </DataTableTd>
                      </DataTableRow>
                    )}
                  </Fragment>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </Panel>
      </div>
    </PermissionGate>
  );
}
