import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function JoinSection() {
    const t = useTranslations('HomePage');
    const tJoin = useTranslations('Join');

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/10 to-zinc-950/80 -z-10"></div>
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">{tJoin('cta_text')}</h2>
                <p className="text-lg text-zinc-400 mb-10 font-light">
                    Join a community of passionate students mastering the foundations of AI and Data Science.
                </p>
                <Link href="/join">
                    <button className="px-10 py-4 rounded-xl bg-brand-600 text-white font-semibold text-lg hover:bg-brand-500 transition-colors shadow-lg">
                        {t('join_btn')}
                    </button>
                </Link>
            </div>
        </section>
    );
}
