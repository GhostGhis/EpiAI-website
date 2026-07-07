import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';

export default async function CalendarPage() {
  const locale = await getLocale();
  const events = await prisma.event.findMany({
    where: { isPublished: true, date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    take: 50,
  });

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image src="/assets/hero-bg.jpg" alt="" fill className="object-cover brightness-[0.35]" priority />
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {locale === 'fr' ? 'Calendrier public' : 'Public calendar'}
            </h1>
            <p className="text-white/60">
              {locale === 'fr'
                ? 'Hackathons, workshops et conférences Epi\'AI.'
                : 'Epi\'AI hackathons, workshops and conferences.'}
            </p>
          </div>
          <a
            href="/api/events/calendar"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
            download
          >
            {locale === 'fr' ? 'Télécharger iCal (.ics)' : 'Download iCal (.ics)'}
          </a>
        </div>

        {events.length === 0 ? (
          <p className="text-white/40 text-center py-12">
            {locale === 'fr' ? 'Aucun événement à venir.' : 'No upcoming events.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {events.map((e) => (
              <li
                key={e.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="text-center sm:w-20 shrink-0">
                  <p className="text-2xl font-bold text-brand-400">
                    {e.date.getDate()}
                  </p>
                  <p className="text-xs text-white/50 uppercase">
                    {e.date.toLocaleDateString(locale, { month: 'short' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white">{e.title}</h2>
                  <p className="text-white/50 text-sm mt-1">{e.location}</p>
                </div>
                <Link href="/sign-in" className="text-sm text-brand-400 hover:text-brand-300 shrink-0">
                  {locale === 'fr' ? 'Membre ? Se connecter' : 'Member? Sign in'}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
