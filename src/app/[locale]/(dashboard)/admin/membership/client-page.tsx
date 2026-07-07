'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApplicationCard } from '@/components/membership/ApplicationCard';
import { InviteUserForm } from '@/components/admin/InviteUserForm';
import { BulkInviteForm } from '@/components/admin/BulkInviteForm';
import { formatDistanceToNow } from '@/lib/utils/date';
import { Users, Clock, CheckCircle, XCircle, RefreshCw, UserPlus, FileSpreadsheet } from 'lucide-react';
import type { PaginatedResponse } from '@/lib/membership/types';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  whatsapp: string;
  motivations: string;
  status: string;
  createdAt: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function MembershipAdminClient() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('MembershipAdmin');

  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/membership?stats=true');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  // Fetch applications
  useEffect(() => {
    async function fetchApplications() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/membership?status=${filter}&page=${page}&limit=10`);
        const data: PaginatedResponse<Application> = await response.json();
        setApplications(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [filter, page]);

  const handleApplicationUpdate = () => {
    // Refresh data
    fetch(`/api/membership?stats=true`)
      .then(res => res.json())
      .then(data => setStats(data));

    fetch(`/api/membership?status=${filter}&page=${page}&limit=10`)
      .then(res => res.json())
      .then((data: PaginatedResponse<Application>) => {
        setApplications(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-white/60">{t('description')}</p>
        </div>
        <InviteUserForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-brand-500/15">
              <Users className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-white/60 text-sm">{t('total')}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-white/60 text-sm">{t('pending')}</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-brand-500/20">
              <CheckCircle className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-white/60 text-sm">{t('approved')}</span>
          </div>
          <p className="text-2xl font-bold text-brand-400">{stats.approved}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-white/60 text-sm">{t('rejected')}</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === status
              ? 'bg-white text-black'
              : 'bg-white/5 text-white hover:bg-white/10'
              }`}
          >
            {status === 'all' ? t('all') : t(status)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-1/3 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/10 rounded" />
                  <div className="h-20 w-full bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{t('noApplications')}</h3>
          <p className="text-white/60">{t('noApplicationsDescription')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              locale={locale as 'en' | 'fr'}
              onUpdate={handleApplicationUpdate}
            />
          ))}
        </div>
      )}

      {/* Bulk Invite Section */}
      <div className="pt-8 border-t border-white/10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-400" />
            {t('bulkInvite')}
          </h2>
          <p className="text-white/60 text-sm">{t('bulkInviteDescription')}</p>
        </div>
        <BulkInviteForm />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${page === p
                ? 'bg-white text-black'
                : 'bg-white/5 text-white hover:bg-white/10'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
