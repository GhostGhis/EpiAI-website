'use client';

import { useCallback, useEffect, useState } from 'react';

const POLL_MS = 8000;

export function useChatUnreadCount(enabled = true) {
  const [total, setTotal] = useState(0);
  const [channels, setChannels] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch('/api/chat/unread', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setTotal(data.total ?? 0);
      setChannels(data.channels ?? {});
    } catch {
      // Stream optional
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    refresh();
    const interval = setInterval(refresh, POLL_MS);

    const onFocus = () => refresh();
    const onChatUpdate = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('chat-unread-changed', onChatUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('chat-unread-changed', onChatUpdate);
    };
  }, [enabled, refresh]);

  return { total, channels, refresh };
}
