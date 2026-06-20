'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NotificationCounts } from '@/lib/notifications/repository';

const POLL_MS = 8000;

const EMPTY: NotificationCounts = {
  total: 0,
  forum: 0,
  event: 0,
  activity: 0,
  membership: 0,
  system: 0,
};

export function dispatchNotificationsChanged() {
  window.dispatchEvent(new CustomEvent('notifications-changed'));
}

export function useNotificationCounts(enabled = true) {
  const [counts, setCounts] = useState<NotificationCounts>(EMPTY);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch('/api/notifications/counts', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setCounts({
        total: data.total ?? 0,
        forum: data.forum ?? 0,
        event: data.event ?? 0,
        activity: data.activity ?? 0,
        membership: data.membership ?? 0,
        system: data.system ?? 0,
      });
    } catch {
      // optional
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    refresh();
    const interval = setInterval(refresh, POLL_MS);

    const onFocus = () => refresh();
    const onChange = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('notifications-changed', onChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('notifications-changed', onChange);
    };
  }, [enabled, refresh]);

  return { counts, refresh };
}

export async function markNotificationTypeRead(type: string) {
  await fetch('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  dispatchNotificationsChanged();
}
