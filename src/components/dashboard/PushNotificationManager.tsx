'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushNotificationManager() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);

    const wasDismissed = localStorage.getItem('epiai-push-dismissed');
    if (wasDismissed === 'true') setDismissed(true);
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      const keyRes = await fetch('/api/push/vapid-key');
      if (!keyRes.ok) throw new Error('Push not configured');
      const { publicKey } = await keyRes.json();

      const reg = await navigator.serviceWorker.register('/push-sw.js');
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      localStorage.removeItem('epiai-push-dismissed');
      setDismissed(true);
    } catch (err) {
      console.warn('[Push] Subscription failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('epiai-push-dismissed', 'true');
    setDismissed(true);
  };

  if (!supported || permission === 'granted' || dismissed) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <div>
          <p className="text-sm font-medium text-white">
            Activer les alertes hors ligne
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            Reçois une notification sur ton appareil quand il y a une réponse forum,
            un événement ou un message chat — même sans ouvrir Epi&apos;AI.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={subscribe}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
        >
          {loading ? 'Activation…' : 'Activer'}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PushSettingsToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window,
    );
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setEnabled(Notification.permission === 'granted');
    }
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        if (Notification.permission === 'granted') {
          const reg = await navigator.serviceWorker.getRegistration('/push-sw.js');
          const sub = await reg?.pushManager.getSubscription();
          if (sub) {
            await fetch('/api/push/subscribe', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
            await sub.unsubscribe();
          }
          setEnabled(false);
        } else {
          window.location.reload();
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
    >
      {enabled ? <Bell className="h-3.5 w-3.5 text-brand-400" /> : <BellOff className="h-3.5 w-3.5" />}
      {enabled ? 'Alertes activées' : 'Alertes désactivées'}
    </button>
  );
}
