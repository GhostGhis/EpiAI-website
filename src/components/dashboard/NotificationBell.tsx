'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import {
  dispatchNotificationsChanged,
  useNotificationCounts,
} from '@/hooks/useNotificationCounts';

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const POLL_MS = 8000;

export default function NotificationBell() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { counts, refresh: refreshCounts } = useNotificationCounts(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // optional
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_MS);
    const onChange = () => {
      fetchNotifications();
      refreshCounts();
    };
    window.addEventListener('notifications-changed', onChange);
    window.addEventListener('focus', onChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-changed', onChange);
      window.removeEventListener('focus', onChange);
    };
  }, [fetchNotifications, refreshCounts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    dispatchNotificationsChanged();
  };

  const markOne = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
    dispatchNotificationsChanged();
  };

  const unread = counts.total;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <UnreadBadge
            count={unread}
            className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px]"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-medium text-sm">
              {locale === 'fr' ? 'Notifications' : 'Notifications'}
              {unread > 0 && (
                <span className="ml-2 text-emerald-400 text-xs">({unread})</span>
              )}
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {locale === 'fr' ? 'Tout lire' : 'Mark all read'}
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                {locale === 'fr' ? 'Aucune notification' : 'No notifications'}
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-white/5 ${!n.isRead ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''}`}
                >
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        void markOne(n.id);
                        setOpen(false);
                      }}
                      className="block"
                    >
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-white/50 text-xs mt-1">{n.message}</p>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void markOne(n.id)}
                      className="block w-full text-left"
                    >
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-white/50 text-xs mt-1">{n.message}</p>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
