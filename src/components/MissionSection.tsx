import { useTranslations } from 'next-intl';

export default function MissionSection() {
    const t = useTranslations('About');

    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto font-light">
                    {t('intro')}
                </p>

                <div className="mt-12 grid md:grid-cols-2 gap-6 text-left">
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-brand-500/25 transition-all">
                        <h3 className="text-xl font-semibold mb-3 text-brand-300">{t('approach_title')}</h3>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed">{t('approach_text')}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-brand-500/25 transition-all">
                        <h3 className="text-xl font-semibold mb-3 text-brand-300">Excellence</h3>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed">
                            We foster a rigorous environment where students master the theoretical foundations of AI and Data Science.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
