'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleName, getRoleColor } from '@/lib/roles/utils';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Users, MessageSquare, Calendar, FileText, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Permission } from '@/lib/roles/types';
import { PageHeader, Card, StatCard, Badge, ActionCard, Panel } from '@/components/ui';

interface DashboardStats {
  members: number;
  discussions: number;
  events: number;
  resources: number;
  recentActivity?: Array<{
    type: string;
    id: string;
    title: string;
    subtitle?: string;
    date: string;
  }>;
}

export default function DashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { roleId, role, isAdmin, hasPermission } = useAuth();
  const t = useTranslations('Dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const roleName = roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member';
  const roleColor = roleId ? getRoleColor(roleId) : 'text-secondary';

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) setStats(await response.json());
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statsConfig = [
    { label: t('stats.discussions'), value: stats?.discussions || 0, icon: MessageSquare },
    { label: t('stats.events'), value: stats?.events || 0, icon: Calendar },
    { label: t('stats.resources'), value: stats?.resources || 0, icon: FileText },
    { label: t('stats.members'), value: stats?.members || 0, icon: Users },
  ];

  const quickActions = [
    { permission: 'content.create' as Permission, href: '/forum/new', icon: MessageSquare, label: t('actions.newDiscussion') },
    { permission: 'dashboard.admin' as Permission, href: '/events/new', icon: Calendar, label: t('actions.createEvent') },
    { permission: 'resources.create' as Permission, href: '/resources/new', icon: FileText, label: t('actions.addResource') },
    { permission: 'dashboard.admin' as Permission, href: '/admin/membership', icon: Users, label: t('actions.manageMembers') },
  ].filter((action) => hasPermission(action.permission));

  return (
    <div className="space-y-5">
      <PageHeader title={t('title')} description={t('overview')} />

      <Card padding="sm" className="flex flex-wrap items-center gap-3">
        <div className={`p-3 rounded-xl bg-card-muted`}>
          <Award className={`w-6 h-6 ${role?.color || 'text-brand-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-secondary text-sm">{locale === 'fr' ? 'Votre rôle' : 'Your role'}</p>
          <p className={`text-xl font-bold ${roleColor}`}>{roleName}</p>
        </div>
        {isAdmin ? <Badge variant="amber">{t('admin')}</Badge> : null}
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsConfig.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={t('recentActivity')} noPadding bodyClassName="p-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-card-muted rounded-xl" />
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <ul className="space-y-2">
              {stats.recentActivity.map((item) => {
                const href =
                  item.type === 'thread'
                    ? `/forum/${item.id}`
                    : item.type === 'event'
                      ? `/events/${item.id}`
                      : item.type === 'resource'
                        ? `/resources/${item.id}`
                        : null;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    {href ? (
                      <Link
                        href={href}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card-muted hover:bg-card border border-transparent hover:border-default transition-all"
                      >
                        <div className="min-w-0">
                          <p className="text-primary text-sm font-medium line-clamp-1">{item.title}</p>
                          {item.subtitle ? (
                            <p className="text-muted text-xs mt-0.5 line-clamp-1">{item.subtitle}</p>
                          ) : null}
                        </div>
                        <span className="text-muted text-xs shrink-0">
                          {new Date(item.date).toLocaleDateString(locale)}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-card-muted">
                        <p className="text-primary text-sm">{item.title}</p>
                        <span className="text-muted text-xs">
                          {new Date(item.date).toLocaleDateString(locale)}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="w-8 h-8 text-muted mb-3" />
              <p className="text-muted text-sm">{t('noActivity')}</p>
            </div>
          )}
        </Panel>

        {quickActions.length > 0 ? (
          <Panel title={t('quickActions')} noPadding bodyClassName="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <ActionCard
                  key={action.href}
                  href={`/${locale}${action.href}`}
                  icon={action.icon}
                  label={action.label}
                />
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
