'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleName, getRoleColor } from '@/lib/roles/utils';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

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
  const { roleId, role, isAdmin } = useAuth();
  const t = useTranslations('Dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const roleName = roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member';
  const roleColor = roleId ? getRoleColor(roleId) : 'text-gray-400';

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statsConfig = [
    { label: t('stats.discussions'), value: stats?.discussions || 0, icon: MessageSquare, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { label: t('stats.events'), value: stats?.events || 0, icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { label: t('stats.resources'), value: stats?.resources || 0, icon: FileText, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: t('stats.members'), value: stats?.members || 0, icon: Users, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-white/60">{t('overview')}</p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className={`p-3 rounded-xl ${role?.color?.replace('text-', 'bg-').replace('400', '400/20') || 'bg-white/10'}`}>
          <Award className={`w-6 h-6 ${role?.color || 'text-white/60'}`} />
        </div>
        <div>
          <p className="text-white/60 text-sm">{locale === 'fr' ? 'Votre rôle' : 'Your role'}</p>
          <p className={`text-xl font-bold ${roleColor}`}>{roleName}</p>
        </div>
        {isAdmin && (
          <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium border border-amber-500/30">
            {t('admin')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-white/10 rounded w-16 mb-2" />
                  <div className="h-4 bg-white/5 rounded w-20" />
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">{t('recentActivity')}</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <ul className="space-y-3">
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
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div>
                          <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-white/40 text-xs mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                        <span className="text-white/30 text-xs shrink-0 ml-2">
                          {new Date(item.date).toLocaleDateString(locale)}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <p className="text-white text-sm">{item.title}</p>
                        <span className="text-white/30 text-xs">
                          {new Date(item.date).toLocaleDateString(locale)}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">{t('noActivity')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/forum/new" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
              <MessageSquare className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-white font-medium text-sm">{t('actions.newDiscussion')}</p>
            </Link>
            <Link href="/events/new" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
              <Calendar className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-white font-medium text-sm">{t('actions.createEvent')}</p>
            </Link>
            <Link href="/resources/new" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
              <FileText className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-white font-medium text-sm">{t('actions.addResource')}</p>
            </Link>
            <PermissionGate permission="dashboard.admin">
              <Link href="/admin/membership" className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-left">
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-white font-medium text-sm">{t('actions.manageMembers')}</p>
              </Link>
            </PermissionGate>
          </div>
        </div>
      </div>
    </div>
  );
}
