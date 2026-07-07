import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { getActivePartners } from '@/lib/partners/repository';

export default async function PartnersPage() {
  const locale = await getLocale();
  const partners = await getActivePartners();

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image src="/assets/hero-bg.jpg" alt="" fill className="object-cover brightness-[0.35]" priority />
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
          {locale === 'fr' ? 'Partenaires & Alumni' : 'Partners & Alumni'}
        </h1>
        <p className="text-white/60 text-center mb-16 max-w-2xl mx-auto">
          {locale === 'fr'
            ? 'Ils soutiennent EPI\'AI et accompagnent nos membres.'
            : 'They support EPI\'AI and mentor our members.'}
        </p>
        {partners.length === 0 ? (
          <p className="text-center text-white/40">
            {locale === 'fr' ? 'Bientôt disponible.' : 'Coming soon.'}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p) => (
              <article
                key={p.id}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all"
              >
                {p.logoUrl && (
                  <div className="h-16 relative mb-4">
                    <Image src={p.logoUrl} alt={p.name} fill className="object-contain object-left" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-white mb-2">{p.name}</h2>
                {p.type && (
                  <span className="text-xs uppercase tracking-wider text-brand-400">{p.type}</span>
                )}
                {p.description && (
                  <p className="text-white/60 text-sm mt-3">{p.description}</p>
                )}
                {p.websiteUrl && (
                  <a
                    href={p.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-sm text-brand-400 hover:text-brand-300"
                  >
                    {locale === 'fr' ? 'Visiter le site →' : 'Visit website →'}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
