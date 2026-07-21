import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { normalizeImageUrl } from '@/lib/utils/image-url';

export default async function CalendarPage() {
  const locale = await getLocale();
  const fr = locale === 'fr';
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { date: 'desc' },
    take: 50,
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
  const past = events.filter((e) => e.date < now);

  const list = [...upcoming, ...past];

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image src="/assets/hero-bg.jpg" alt="" fill className="object-cover brightness-[0.35]" priority />
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {fr ? 'Événements Epi’AI' : 'Epi’AI Events'}
            </h1>
            <p className="text-white/60">
              {fr
                ? 'Talks, workshops et conférences ouverts au public.'
                : 'Talks, workshops and conferences open to the public.'}
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-white/40 text-center py-12">
            {fr ? 'Aucun événement public pour le moment.' : 'No public events yet.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {list.map((e) => {
              const isPast = e.date < now;
              const cover = normalizeImageUrl(e.imageUrl);
              return (
                <li key={e.id}>
                  <Link
                    href={`/calendar/${e.id}`}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-brand-500/30 hover:bg-white/[0.07] transition-colors block"
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="w-full sm:w-28 h-36 sm:h-20 object-cover rounded-xl shrink-0"
                      />
                    ) : (
                      <div className="text-center sm:w-20 shrink-0">
                        <p className="text-2xl font-bold text-brand-400">{e.date.getDate()}</p>
                        <p className="text-xs text-white/50 uppercase">
                          {e.date.toLocaleDateString(locale, { month: 'short' })}
                        </p>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-white">{e.title}</h2>
                        {isPast ? (
                          <span className="text-[10px] uppercase tracking-wider text-white/40 border border-white/15 px-2 py-0.5 rounded-full">
                            {fr ? 'Passé' : 'Past'}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-white/50 text-sm mt-1">{e.location}</p>
                      <p className="text-white/40 text-xs mt-1">
                        {e.date.toLocaleString(locale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <span className="text-sm text-brand-400 shrink-0">
                      {fr ? 'Voir →' : 'View →'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
