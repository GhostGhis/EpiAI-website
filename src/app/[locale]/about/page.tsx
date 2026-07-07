import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function About() {
  const t = useTranslations('About');

  return (
    <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)] text-white overflow-hidden">
      {/* Reusing the background for consistency */}
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image
          src="/assets/hero-bg.jpg"
          alt="Background"
          fill
          quality={100}
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>

      <main className="pt-24 sm:pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light">
              {t('intro')}
            </p>
          </div>

          {/* Grid Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Motivation */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-brand-300">{t('motivation_title')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('motivation_text')}
              </p>
            </div>

            {/* Card 2: Approach */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-brand-300">{t('approach_title')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('approach_text')}
              </p>
            </div>

            {/* Card 3: Impact */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">{t('impact_title')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('impact_text')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
