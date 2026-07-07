'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Users, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { MemberAttendanceSummary } from '@/lib/activities/types';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {locale === 'fr' ? 'Rapport de Présence' : 'Attendance Report'}
          </h1>
          <p className="text-white/60">
            {locale === 'fr'
              ? 'Consultez le rapport de présence de chaque membre.'
              : 'View attendance reports for each member.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === 'fr' ? 'Rechercher un membre...' : 'Search member...'}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-5 w-40 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">
              {locale === 'fr' ? 'Aucune donnée de présence' : 'No attendance data'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-4 px-4 py-2 text-xs text-white/40 font-semibold uppercase">
              <span>{locale === 'fr' ? 'Membre' : 'Member'}</span>
              <span className="text-center">{locale === 'fr' ? 'Présent' : 'Present'}</span>
              <span className="text-center">{locale === 'fr' ? 'Absent' : 'Absent'}</span>
              <span className="text-center">{locale === 'fr' ? 'Taux' : 'Rate'}</span>
            </div>

            {filtered.map((member) => (
              <div key={member.userId}>
                <button
                  onClick={() => loadUserDetails(member.userId)}
                  className="w-full grid grid-cols-[1fr_80px_80px_80px] gap-4 items-center px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{member.userName}</p>
                      <p className="text-white/40 text-xs">{member.userEmail}</p>
                      {member.attendanceRate < 50 && member.totalPresent + member.totalAbsent > 2 && (
                        <span className="text-amber-400 text-xs" role="status">
                          {locale === 'fr' ? '⚠ Absences répétées' : '⚠ Low attendance'}
                        </span>
                      )}
                    </div>
                    {expandedUser === member.userId ? (
                      <ChevronUp className="w-4 h-4 text-white/30 ml-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30 ml-auto" />
                    )}
                  </div>
                  <span className="text-center text-brand-400 font-bold">{member.totalPresent}</span>
                  <span className="text-center text-red-400 font-bold">{member.totalAbsent}</span>
                  <span className={`text-center font-bold ${member.attendanceRate >= 70 ? 'text-brand-400' : 'text-red-400'}`}>
                    {member.attendanceRate.toFixed(0)}%
                  </span>
                </button>

                {/* Expanded Details */}
                {expandedUser === member.userId && selectedUserDetails && (
                  <div className="mt-1 ml-12 space-y-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    {selectedUserDetails.details.length === 0 ? (
                      <p className="text-white/40 text-xs">{locale === 'fr' ? 'Aucun détail' : 'No details'}</p>
                    ) : (
                      selectedUserDetails.details.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                          <div>
                            <span className="text-white/80">{d.activityTitle}</span>
                            <span className="text-white/30 ml-2">
                              {d.activityDate ? new Date(d.activityDate).toLocaleDateString(locale) : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!d.wasRegistered && (
                              <span className="text-amber-400 text-[10px]">
                                {locale === 'fr' ? 'Non inscrit' : 'Not registered'}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.isPresent
                                ? 'bg-brand-500/20 text-brand-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {d.isPresent
                                ? (locale === 'fr' ? 'Présent' : 'Present')
                                : (locale === 'fr' ? 'Absent' : 'Absent')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
