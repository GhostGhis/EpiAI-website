'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordResetCheck } from '@/hooks/usePasswordResetCheck';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useRouter, usePathname } from 'next/navigation'; // Changed from '@/i18n/routing'
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl'; // Added
import {
  LayoutDashboard,
  User,
  Settings,
  Users,
  LogOut,
  Menu,
  MessageSquare,
  Calendar,
  FolderOpen,
  UserPlus,
  ArrowLeft,
  Plus,
  ClipboardList,
  UserCheck,
  UsersRound,
  MessagesSquare,
  BookOpen,
} from 'lucide-react';
import { UserButton, useClerk, useUser } from '@clerk/nextjs';
import { userButtonProps } from '@/lib/clerk/user-button';
import { getRoleName } from '@/lib/roles/utils';
import GlobalSearch from '@/components/dashboard/GlobalSearch';
import NotificationBell from '@/components/dashboard/NotificationBell';
import PushNotificationManager from '@/components/dashboard/PushNotificationManager';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
import ThemeToggle from '@/components/ThemeToggle';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';
import { markNotificationTypeRead, useNotificationCounts } from '@/hooks/useNotificationCounts';
import { cn } from '@/lib/utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, roleId, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  usePasswordResetCheck();

  const { total: chatUnreadTotal } = useChatUnreadCount(!!isSignedIn);
  const { counts: notifCounts } = useNotificationCounts(!!isSignedIn);

  useEffect(() => {
    if (!isSignedIn || !pathname) return;

    if (pathname.includes('/forum')) {
      void markNotificationTypeRead('forum');
    } else if (pathname.includes('/events')) {
      void markNotificationTypeRead('event');
    } else if (pathname.includes('/intranet')) {
      void markNotificationTypeRead('activity');
    } else if (pathname.includes('/admin/membership')) {
      void markNotificationTypeRead('membership');
    }
  }, [pathname, isSignedIn]);

  const t = useTranslations('Navigation');

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  const dashboardHref = `/${locale}/dashboard`;
  const isOnDashboard = pathname === dashboardHref;

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setSidebarOpen(false);
    if (isOnDashboard) {
      e.preventDefault();
      router.refresh();
    }
  };

  const navItems = [
    {
      label: t('dashboard'),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      active: pathname === `/${locale}/dashboard`,
      badge: notifCounts.total + chatUnreadTotal,
    },
    {
      label: t('resources'),
      href: `/${locale}/resources`,
      icon: FolderOpen,
      active: pathname.startsWith(`/${locale}/resources`),
    },
    {
      label: t('forum'),
      href: `/${locale}/forum`,
      icon: MessageSquare,
      active: pathname.startsWith(`/${locale}/forum`),
      badge: notifCounts.forum,
    },
    {
      label: t('chat'),
      href: `/${locale}/chat`,
      icon: MessagesSquare,
      active: pathname.startsWith(`/${locale}/chat`),
      badge: chatUnreadTotal,
    },
    {
      label: t('events'),
      href: `/${locale}/events`,
      icon: Calendar,
      active: pathname.startsWith(`/${locale}/events`),
      badge: notifCounts.event,
    },
    {
      label: t('intranet'),
      href: `/${locale}/intranet`,
      icon: ClipboardList,
      active: pathname.startsWith(`/${locale}/intranet`),
      badge: notifCounts.activity,
    },
    {
      label: t('profile'),
      href: `/${locale}/profile`,
      icon: User,
      active: pathname === `/${locale}/profile`,
    },
    {
      label: t('myAttendance'),
      href: `/${locale}/attendance`,
      icon: UserCheck,
      active: pathname.startsWith(`/${locale}/attendance`),
    },
  ];

  const adminItems = [
    {
      label: t('membership'),
      href: `/${locale}/admin/membership`,
      icon: UserPlus,
      active: pathname.startsWith(`/${locale}/admin/membership`),
      adminOnly: true,
      badge: notifCounts.membership,
    },
    {
      label: t('projects'),
      href: `/${locale}/admin/projects`,
      icon: FolderOpen,
      active: pathname.startsWith(`/${locale}/admin/projects`),
      adminOnly: true,
    },
    {
      label: t('team'),
      href: `/${locale}/admin/team`,
      icon: UsersRound,
      active: pathname.startsWith(`/${locale}/admin/team`),
      adminOnly: true,
    },
    {
      label: t('attendance'),
      href: `/${locale}/admin/attendance`,
      icon: UserCheck,
      active: pathname.startsWith(`/${locale}/admin/attendance`),
      adminOnly: true,
    },
    {
      label: t('blogAdmin'),
      href: `/${locale}/admin/blog`,
      icon: BookOpen,
      active: pathname.startsWith(`/${locale}/admin/blog`),
      adminOnly: true,
    },
    {
      label: t('admin'),
      href: `/${locale}/admin`,
      icon: Users,
      active: pathname === `/${locale}/admin`,
      adminOnly: true,
    },
  ];

  return (
    <ProtectedRoute
      redirectToSignIn
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-default border-t-brand-500 rounded-full mx-auto mb-4" />
            <p className="text-secondary">{t('loading')}</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-page">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-default shadow-sm transform transition-transform duration-300 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="px-4 py-4 border-b border-subtle">
              <Link
                href={dashboardHref}
                onClick={handleLogoClick}
                className="flex items-center gap-2.5"
                aria-label={locale === 'fr' ? 'Tableau de bord EPI\'AI' : 'EPI\'AI dashboard'}
              >
                <BrandLogo size="md" />
                <div>
                  <span className="text-primary font-semibold text-base tracking-tight">EPI&apos;AI</span>
                  <p className="text-muted text-[11px] font-medium uppercase tracking-wider">Dashboard</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'nav-item',
                      item.active ? 'nav-item-active' : 'nav-item-inactive'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                      <UnreadBadge count={item.badge} />
                    ) : null}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="pt-4 pb-1.5">
                    <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-widest">
                      {t('adminSection')}
                    </p>
                  </div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'nav-item',
                          item.active ? 'nav-item-admin-active' : 'nav-item-inactive'
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                          <UnreadBadge count={item.badge} />
                        ) : null}
                      </Link>
                    );
                  })}

                  {isAdmin && (
                    <div className="px-1 pt-3">
                      <a
                        href={`/${locale}/admin/projects/new`}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors no-underline"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('newProject')}</span>
                      </a>
                    </div>
                  )}
                </>
              )}
            </nav>

            <div className="p-3 border-t border-subtle bg-card-muted/30">
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <UserButton
                  {...userButtonProps(locale)}
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 rounded-full ring-2 ring-default',
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-primary font-medium text-sm truncate leading-tight">
                    {user?.firstName || user?.username || user?.emailAddresses[0]?.emailAddress || 'User'}
                  </p>
                  <p className={cn('text-[11px] truncate mt-0.5', roleId ? 'text-brand-700' : 'text-muted')}>
                    {roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member'}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Link
                  href={`/${locale}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-default bg-card text-secondary hover:text-primary hover:bg-card-muted transition-colors text-xs font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('backHome')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-muted hover:text-primary hover:bg-card transition-colors text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:pl-64 min-h-screen flex flex-col">
          <header className="sticky top-0 z-30 hidden lg:flex items-center justify-end gap-2 px-6 h-14 border-b border-subtle bg-surface/90 backdrop-blur-md">
            <GlobalSearch />
            <NotificationBell />
            <ThemeToggle />
          </header>

          <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-surface/95 backdrop-blur-md border-b border-subtle lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 text-secondary hover:text-primary rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href={dashboardHref}
              onClick={handleLogoClick}
              className="flex items-center"
              aria-label={locale === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            >
              <BrandLogo size="sm" />
            </Link>
            <div className="flex items-center gap-1">
              <GlobalSearch />
              <NotificationBell />
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1280px]">
            <PushNotificationManager />
            {children}
          </main>
        </div>
        <OnboardingWizard />
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
