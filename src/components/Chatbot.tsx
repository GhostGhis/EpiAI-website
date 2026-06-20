'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import { FAQ_CHIP_IDS, type FaqId } from '@/lib/faq/catalog';

interface Message {
  role: 'bot' | 'user';
  text: string;
  suggestions?: FaqId[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Chatbot');
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) === 'en' ? 'en' : 'fr';
  const bottomRef = useRef<HTMLDivElement>(null);

  const isDashboard =
    pathname?.includes('/dashboard') ||
    pathname?.includes('/forum') ||
    pathname?.includes('/chat') ||
    pathname?.includes('/events') ||
    pathname?.includes('/resources') ||
    pathname?.includes('/intranet') ||
    pathname?.includes('/admin') ||
    pathname?.includes('/profile');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'bot', text: t('welcome') }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toApiHistory = useCallback(
    (msgs: Message[]) =>
      msgs
        .filter((m) => m.text !== t('welcome'))
        .slice(-8)
        .map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        })),
    [t]
  );

  const askAssistant = useCallback(
    async (payload: { message?: string; faqId?: FaqId }, userLabel: string) => {
      setLoading(true);
      setMessages((prev) => [...prev, { role: 'user', text: userLabel }]);

      try {
        const history = toApiHistory(messages);
        const res = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, locale, history }),
        });

        if (!res.ok) throw new Error('chatbot failed');

        const data = (await res.json()) as {
          answer: string;
          suggestions?: FaqId[];
        };

        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: data.answer,
            suggestions: data.suggestions?.length ? data.suggestions : undefined,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: t('error'),
            suggestions: FAQ_CHIP_IDS.slice(0, 3),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [locale, messages, t, toApiHistory]
  );

  const sendMessage = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    void askAssistant({ message: text }, text);
  };

  const askChip = (faqId: FaqId, useShortLabel = true) => {
    if (loading) return;
    const label = useShortLabel && (FAQ_CHIP_IDS as readonly FaqId[]).includes(faqId)
      ? t(`chips.${faqId}`)
      : t(`questions.${faqId}`);
    void askAssistant({ faqId }, label);
  };

  if (isDashboard) return null;

  const showChips = messages.length <= 1 && !loading;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end max-w-[calc(100vw-2rem)]">
      {isOpen && (
        <div className="mb-3 sm:mb-4 w-[min(100vw-2rem,350px)] h-[min(70dvh,500px)] rounded-2xl sm:rounded-[2rem] bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden glass-panel">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white leading-tight truncate">{t('title')}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-wider">
                    {t('online')}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 p-2 -mr-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-hide min-h-0">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`rounded-2xl p-3 text-xs sm:text-sm leading-relaxed max-w-[90%] ${
                    msg.role === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 ml-auto'
                      : 'bg-white/5 border border-white/10 text-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                      {t('fallbackSuggestions')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => askChip(id, false)}
                          disabled={loading}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                        >
                          {t(`questions.${id}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="rounded-2xl p-3 text-xs sm:text-sm bg-white/5 border border-white/10 text-white/50 max-w-[90%]">
                {t('loading')}
              </div>
            )}

            {showChips && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {FAQ_CHIP_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => askChip(id)}
                    disabled={loading}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[11px] hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {t(`chips.${id}`)}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="p-3 sm:p-4 bg-white/5 border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                disabled={loading}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors pr-12 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1.5 p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center border transition-all duration-300 shadow-2xl ${
          isOpen
            ? 'bg-slate-800 border-white/20 scale-90'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-white/10 hover:scale-110 active:scale-95'
        }`}
        aria-label={t('title')}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
