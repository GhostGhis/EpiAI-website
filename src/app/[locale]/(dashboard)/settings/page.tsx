'use client';

import { UserProfile } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const t = useTranslations('Dashboard');

    return (
        <div className="max-w-6xl mx-auto">
            <div className="sticky top-0 z-20 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 -mt-4 sm:-mt-0">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all text-sm font-medium min-h-[44px]"
                >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span className="truncate">{locale === 'fr' ? 'Retour au dashboard' : 'Back to dashboard'}</span>
                </Link>
                <div className="hidden sm:block text-center flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">{t('settings')}</h1>
                    <p className="text-white/60 text-sm truncate">{t('overview')}</p>
                </div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium min-h-[44px] shrink-0"
                    aria-label={locale === 'fr' ? 'Fermer les paramètres' : 'Close settings'}
                >
                    <X className="w-5 h-5" />
                    <span className="hidden sm:inline">{locale === 'fr' ? 'Fermer' : 'Close'}</span>
                </Link>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                <UserProfile
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-transparent shadow-none',
                            navbar: 'bg-white/5 rounded-xl',
                            navbarButton: 'text-white/70 hover:text-white hover:bg-white/10 rounded-lg',
                            navbarButtonActive: 'bg-white/10 text-white',
                            pageScrollBox: 'bg-transparent',
                            page: 'bg-transparent',
                            profileSection: 'bg-white/5 border border-white/10 rounded-xl',
                            profileSectionPrimaryButton: 'bg-white text-black hover:bg-white/90 rounded-lg',
                            formButtonPrimary: 'bg-white text-black hover:bg-white/90 rounded-lg',
                            formButtonReset: 'text-white/70 hover:text-white hover:bg-white/10 rounded-lg',
                            badge: 'bg-white/10 text-white border-white/20',
                            accordionTriggerButton: 'text-white/70 hover:text-white hover:bg-white/5 rounded-lg',
                            accordionContent: 'bg-white/5 rounded-lg',
                            formFieldLabel: 'text-white/70',
                            formFieldInput: 'bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-lg',
                            identityPreviewText: 'text-white',
                            identityPreviewEditButton: 'text-white/70 hover:text-white',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-white/60',
                            socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg',
                            dividerLine: 'bg-white/10',
                            dividerText: 'text-white/40',
                            avatarImageActionsUpload: 'text-white/70 hover:text-white',
                            avatarImageActionsRemove: 'text-red-400 hover:text-red-300',
                            fileDropAreaBox: 'bg-white/5 border-white/20 rounded-lg',
                            fileDropAreaIconBox: 'text-white/40',
                            fileDropAreaText: 'text-white/60',
                            fileDropAreaButtonPrimary: 'bg-white text-black hover:bg-white/90 rounded-lg',
                        },
                    }}
                    routing="path"
                    path={`/${locale}/settings`}
                />
            </div>
        </div>
    );
}
