'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';

const STEP_KEYS = ['welcome', 'profile', 'chat', 'resources', 'done'] as const;

function storageKey(userId: string) {
  return `epiai:onboarding:done:${userId}`;
}

export default function OnboardingWizard() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const t = useTranslations('Onboarding');
  const { userId, isSignedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setLoading(false);
      return;
    }

    if (localStorage.getItem(storageKey(userId)) === '1') {
      setVisible(false);
      setLoading(false);
      return;
    }

    fetch('/api/onboarding', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.done) {
          localStorage.setItem(storageKey(userId), '1');
          setVisible(false);
        } else {
          setVisible(true);
          setStep(typeof data.step === 'number' ? data.step : 0);
        }
      })
      .catch(() => setVisible(false))
      .finally(() => setLoading(false));
  }, [isSignedIn, userId]);

  const finish = useCallback(
    async (markDone: boolean) => {
      const nextStep = markDone
        ? STEP_KEYS.length - 1
        : Math.min(step + 1, STEP_KEYS.length - 1);

      try {
        const res = await fetch('/api/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: nextStep, done: markDone }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.done && userId) {
            localStorage.setItem(storageKey(userId), '1');
          }
        } else if (markDone && userId) {
          localStorage.setItem(storageKey(userId), '1');
        }
      } catch {
        if (markDone && userId) {
          localStorage.setItem(storageKey(userId), '1');
        }
      }

      if (markDone) {
        setVisible(false);
      } else {
        setStep(nextStep);
      }
    },
    [step, userId]
  );

  if (loading || !visible) return null;

  const key = STEP_KEYS[step] || 'welcome';
  const isLast = step >= STEP_KEYS.length - 1;

  const actions: Record<string, { href: string; label: string } | null> = {
    welcome: null,
    profile: { href: '/profile', label: t('actions.profile') },
    chat: { href: '/chat', label: t('actions.chat') },
    resources: { href: '/resources', label: t('actions.resources') },
    done: { href: '/events', label: t('actions.events') },
  };

  const action = actions[key];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={() => void finish(true)}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1"
          aria-label={t('skip')}
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-2">
          {t('label')} {step + 1}/{STEP_KEYS.length}
        </p>
        <h2 id="onboarding-title" className="text-xl font-bold text-white mb-3">
          {t(`steps.${key}.title`)}
        </h2>
        <p className="text-white/60 text-sm mb-6">{t(`steps.${key}.body`)}</p>
        <div className="flex gap-3 flex-wrap">
          {action && (
            <Link
              href={action.href}
              onClick={() => void finish(false)}
              className="inline-flex items-center gap-1 flex-1 justify-center py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium min-w-[120px]"
            >
              {action.label}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={() => void finish(false)}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm min-w-[120px]"
            >
              {t('next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void finish(true)}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm"
            >
              {t('finish')}
            </button>
          )}
          <button
            type="button"
            onClick={() => void finish(true)}
            className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-sm"
          >
            {t('skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
