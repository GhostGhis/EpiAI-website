'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordResetCheck } from '@/hooks/usePasswordResetCheck';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useRouter, usePathname } from 'next/navigation'; // Changed from '@/i18n/routing'
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BrandWordmark } from '@/components/BrandLogo';
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
  ClipboardCheck,
  UserCheck,
  UsersRound,
  MessagesSquare,
  BookOpen,
  GraduationCap,
  Wallet,
  GitCommitHorizontal,
} from 'lucide-react';
import { UserButton, useClerk, useUser } from '@clerk/nextjs';
import { userButtonProps } from '@/lib/clerk/user-button';
import { getRoleName } from '@/lib/roles/utils';
import GlobalSearch from '@/components/dashboard/GlobalSearch';
import NotificationBell from '@/components/dashboard/NotificationBell';
import PushNotificationManager from '@/components/dashboard/PushNotificationManager';
import PwaInstallBanner from '@/components/dashboard/PwaInstallBanner';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
import ThemeToggle from '@/components/ThemeToggle';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import InAppAlertBridge from '@/components/dashboard/InAppAlertBridge';
import ChatLiveAlerts from '@/components/chat/ChatLiveAlerts';
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
  const [leadsModule, setLeadsModule] = useState(false);
  const [canReviewAdmission, setCanReviewAdmission] = useState(false);

  useEffect(() => {
    if (!isSignedIn || isAdmin) return;
    let cancelled = false;
    fetch('/api/modules')
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => {
        if (!cancelled) setLeadsModule(Array.isArray(rows) && rows.some((row) => row?.isLead));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isAdmin]);

  useEffect(() => {
    if (!isSignedIn || isAdmin) {
      setCanReviewAdmission(false);
      return;
    }
    let cancelled = false;
    fetch('/api/admin/admission/reviewers/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setCanReviewAdmission(Boolean(data?.canReview));
      })
      .catch(() => {
        if (!cancelled) setCanReviewAdmission(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isAdmin]);

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
  const isChatPage = pathname?.includes('/chat') ?? false;

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
      label: t('modules'),
      href: `/${locale}/modules`,
      icon: GraduationCap,
      active: pathname.startsWith(`/${locale}/modules`),
    },
    ...(isAdmin || leadsModule
      ? [
          {
            label: t('suivi'),
            href: `/${locale}/suivi`,
            icon: GitCommitHorizontal,
            active: pathname.startsWith(`/${locale}/suivi`),
          },
        ]
      : []),
    ...(canReviewAdmission
      ? [
          {
            label: t('membership'),
            href: `/${locale}/admin/membership`,
            icon: ClipboardCheck,
            active: pathname.startsWith(`/${locale}/admin/membership`),
          },
        ]
      : []),
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
      label: t('eventsAdmin'),
      href: `/${locale}/admin/events`,
      icon: Calendar,
      active: pathname.startsWith(`/${locale}/admin/events`),
      adminOnly: true,
    },
    {
      label: t('fees'),
      href: `/${locale}/admin/fees`,
      icon: Wallet,
      active: pathname.startsWith(`/${locale}/admin/fees`),
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
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip bg-page">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[210] bg-overlay lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - footer always visible; bottom nav is hidden while open on mobile */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-[220] flex h-dvh max-h-dvh w-[min(16rem,88vw)] flex-col border-r border-default bg-surface transform transition-transform duration-300 lg:z-50 lg:w-64 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex min-h-[calc(3.75rem+env(safe-area-inset-top,0px))] shrink-0 items-center border-b border-subtle px-4 pt-[env(safe-area-inset-top,0px)]">
            <Link
              href={dashboardHref}
              onClick={handleLogoClick}
              className="flex min-w-0 items-center gap-3 rounded-md"
              aria-label={locale === 'fr' ? 'Tableau de bord EPI\'AI' : 'EPI\'AI dashboard'}
            >
              <BrandWordmark size="sm" />
              <span className="truncate text-[13px] font-medium text-muted">{t('memberSpace')}</span>
            </Link>
          </div>

          <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'nav-item',
                    item.active ? 'nav-item-active' : 'nav-item-inactive',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                    <UnreadBadge count={item.badge} />
                  ) : null}
                </Link>
              );
            })}

            {isAdmin ? (
              <>
                <div className="pb-1.5 pt-4">
                  <p className="px-3 text-[12px] font-semibold text-muted">{t('adminSection')}</p>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'nav-item',
                        item.active ? 'nav-item-admin-active' : 'nav-item-inactive',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                        <UnreadBadge count={item.badge} />
                      ) : null}
                    </Link>
                  );
                })}
                <div className="px-1 pb-2 pt-3">
                  <a
                    href={`/${locale}/admin/projects/new`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-[14px] font-medium text-white no-underline transition-[background-color,transform] duration-[180ms] hover:bg-brand-700 active:scale-[0.98] dark:hover:bg-brand-500"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('newProject')}</span>
                  </a>
                </div>
              </>
            ) : null}
          </nav>

          <div className="shrink-0 border-t border-subtle bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <div className="mb-3 flex items-center gap-2.5 px-1">
              <UserButton
                {...userButtonProps(locale)}
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 rounded-full ring-2 ring-default',
                  },
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight text-primary">
                  {user?.firstName || user?.username || user?.emailAddresses[0]?.emailAddress || 'User'}
                </p>
                <p className={cn('mt-0.5 truncate text-[11px]', roleId ? 'text-brand-700' : 'text-muted')}>
                  {roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member'}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Link
                href={`/${locale}`}
                onClick={() => setSidebarOpen(false)}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-default bg-card text-[13px] font-medium text-secondary transition-colors duration-[160ms] hover:bg-card-muted hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backHome')}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 text-[13px] font-medium text-red-400 transition-colors duration-[160ms] hover:bg-red-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('signOut')}
              </button>
            </div>
          </div>
        </aside>

        <div
          className={cn(
            'lg:pl-64 min-h-screen flex flex-col w-full min-w-0 contain-x',
            isChatPage && 'max-lg:h-dvh max-lg:max-h-dvh max-lg:overflow-hidden',
          )}
        >
          <header className="sticky top-0 z-30 hidden lg:flex items-center justify-end gap-1 px-6 h-[60px] border-b border-subtle bg-surface/95 backdrop-blur-sm">
            <GlobalSearch />
            <NotificationBell />
            <ThemeToggle />
          </header>

          <header
            className={cn(
              'sticky top-0 z-30 items-center gap-1 px-2 bg-surface border-b border-subtle lg:hidden',
              'pt-[env(safe-area-inset-top,0px)] min-h-[calc(3.5rem+env(safe-area-inset-top,0px))]',
              isChatPage ? 'hidden' : 'grid grid-cols-[auto_minmax(0,1fr)_auto]',
            )}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center w-11 h-11 shrink-0 text-secondary hover:text-primary hover:bg-card-muted rounded-lg"
              aria-label={locale === 'fr' ? 'Ouvrir le menu' : 'Open menu'}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href={dashboardHref}
              onClick={handleLogoClick}
              className="flex min-w-0 items-center justify-center overflow-hidden"
              aria-label={locale === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            >
              <BrandWordmark size="sm" className="max-h-7 w-auto max-w-[7.5rem]" />
            </Link>
            <div className="flex shrink-0 items-center gap-0.5">
              <GlobalSearch />
              <NotificationBell />
              <ThemeToggle compact />
            </div>
          </header>

          <main
            className={cn(
              'flex-1 w-full max-w-[1280px] min-w-0 contain-x',
              isChatPage
                ? 'min-h-0 p-0 lg:p-8 lg:pb-8 flex flex-col overflow-hidden'
                : 'p-3 sm:p-6 lg:p-8 pb-mobile-nav lg:pb-8',
            )}
          >
            {!isChatPage && (
              <>
                <PwaInstallBanner />
                <PushNotificationManager />
              </>
            )}
            {children}
          </main>
        </div>
        <OnboardingWizard />
        {isSignedIn ? (
          <>
            <ChatLiveAlerts enabled />
            <InAppAlertBridge enabled />
          </>
        ) : null}
        {!isChatPage && !sidebarOpen ? <MobileBottomNav /> : null}
      </div>
    </ProtectedRoute>
  );
}
