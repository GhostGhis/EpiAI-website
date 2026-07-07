import { useTranslations } from 'next-intl';

const impactItems = [
    {
        label: 'Master Production',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        ),
    },
    {
        label: 'Scientific Excellence',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        ),
    },
    {
        label: 'Student Growth',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.5-4.17M 5.5 5.5A100 100 0 00 20 20" />
        ),
    },
];

export default function ImpactSection() {
    const t = useTranslations('About');

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <div className="absolute right-0 top-1/2 w-96 h-96 bg-brand-600/8 rounded-full blur-[100px] -z-10" />

            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1 text-center md:text-left z-10">
                    <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white">{t('impact_title')}</h2>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light mb-8">
                        {t('impact_text')}
                    </p>
                    <div className="flex flex-col gap-4">
                        {impactItems.map((item) => (
                            <div key={item.label} className="flex items-center gap-4 text-zinc-200">
                                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/25 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {item.icon}
                                    </svg>
                                </div>
                                <span className="text-base font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full relative flex justify-center">
                    <div className="relative w-64 h-64">
                        <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-[60px]" />
                        <svg className="w-full h-full text-white/10 animate-float" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 10L177.942 55V145L100 190L22.0577 145V55L100 10Z" stroke="url(#impact-gradient-0)" strokeWidth="2" />
                            <path d="M100 30L160.622 65V135L100 170L39.3782 135V65L100 30Z" stroke="url(#impact-gradient-1)" strokeWidth="2" opacity="0.6" />
                            <path d="M100 50L143.301 75V125L100 150L56.6987 125V75L100 50Z" stroke="url(#impact-gradient-2)" strokeWidth="2" opacity="0.3" />
                            <circle cx="100" cy="100" r="8" fill="#14b8a6" className="opacity-80" />
                            <defs>
                                <linearGradient id="impact-gradient-0" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#2dd4bf" />
                                    <stop offset="1" stopColor="#0f766e" />
                                </linearGradient>
                                <linearGradient id="impact-gradient-1" x1="100" y1="30" x2="100" y2="170" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#2dd4bf" />
                                    <stop offset="1" stopColor="#0f766e" />
                                </linearGradient>
                                <linearGradient id="impact-gradient-2" x1="100" y1="50" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#2dd4bf" />
                                    <stop offset="1" stopColor="#0f766e" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}
