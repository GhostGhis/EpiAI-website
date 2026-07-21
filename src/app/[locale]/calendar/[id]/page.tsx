import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import { Link } from '@/i18n/routing';
import { getEventById } from '@/lib/events/repository';
import { EventDetail } from '@/components/events/EventDetail';
import { ArrowLeft } from 'lucide-react';

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const fr = locale === 'fr';
  const event = await getEventById(id);

  if (!event || !event.isPublished) {
    notFound();
  }

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image
          src="/assets/hero-bg.jpg"
          alt=""
          fill
          className="object-cover brightness-[0.35]"
          priority
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {fr ? 'Retour au calendrier' : 'Back to calendar'}
        </Link>

        <div className="rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-8 backdrop-blur-sm">
          <EventDetail event={event} />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            {fr ? 'Se connecter pour s’inscrire' : 'Sign in to register'}
          </Link>
          <Link
            href="/calendar"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium transition-colors"
          >
            {fr ? 'Autres événements' : 'More events'}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
