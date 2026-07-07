'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApplicationCard } from '@/components/membership/ApplicationCard';
import { InviteUserForm } from '@/components/admin/InviteUserForm';
import { BulkInviteForm } from '@/components/admin/BulkInviteForm';
import { formatDistanceToNow } from '@/lib/utils/date';
import { Users, Clock, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';
import type { PaginatedResponse } from '@/lib/membership/types';
import { PageHeader, StatCard, Button, EmptyState, Panel, Pagination } from '@/components/ui';

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
    <div className="space-y-5">
      <PageHeader title={t('title')} description={t('description')} actions={<InviteUserForm />} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('total')} value={stats.total} icon={Users} />
        <StatCard
          label={t('pending')}
          value={stats.pending}
          icon={Clock}
          iconClassName="text-amber-600"
          iconBgClassName="bg-amber-500/10"
        />
        <StatCard label={t('approved')} value={stats.approved} icon={CheckCircle} />
        <StatCard
          label={t('rejected')}
          value={stats.rejected}
          icon={XCircle}
          iconClassName="text-red-600"
          iconBgClassName="bg-red-500/10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setFilter(status); setPage(1); }}
          >
            {status === 'all' ? t('all') : t(status)}
          </Button>
        ))}
      </div>

      <Panel
        title={filter === 'all' ? t('all') : t(filter)}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-default animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-card-muted" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 bg-card-muted rounded" />
                    <div className="h-4 w-1/2 bg-card-muted rounded" />
                    <div className="h-20 w-full bg-card-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState icon={<Users className="w-12 h-12" />} title={t('noApplicationsDescription')} />
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

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Panel>

      <Panel
        title={t('bulkInvite')}
        description={t('bulkInviteDescription')}
        actions={<FileSpreadsheet className="w-4 h-4 text-brand-600" />}
      >
        <BulkInviteForm />
      </Panel>
    </div>
  );
}
