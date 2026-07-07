import { useTranslations } from 'next-intl';

export default function AboutSection() {
    const t = useTranslations('About');

    const cards = [
        { title: t('motivation_title'), text: t('motivation_text') },
        { title: t('approach_title'), text: t('approach_text') },
        { title: t('impact_title'), text: t('impact_text') },
    ];

    return (
        <section id="about" className="py-24 px-4 min-h-screen flex flex-col justify-center relative">
            <div className="absolute top-0 left-1/3 w-full h-[500px] bg-brand-900/10 rounded-full blur-[120px] -z-10 transform -translate-y-1/2" />

            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        {t('title')}
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
                        {t('intro')}
                    </p>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-brand-500/25 hover:bg-white/[0.05] transition-all duration-300"
                        >
                            <h3 className="text-2xl font-semibold mb-4 text-brand-300">{card.title}</h3>
                            <p className="text-zinc-400 leading-relaxed text-base font-light">
                                {card.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
