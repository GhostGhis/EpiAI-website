'use client';

import { UserProfile } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, Panel } from '@/components/ui';

export default function SettingsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const t = useTranslations('Dashboard');

    return (
        <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link href="/dashboard">
                    <Button variant="secondary" size="sm">
                        <ArrowLeft className="w-4 h-4" />
                        {locale === 'fr' ? 'Retour au dashboard' : 'Back to dashboard'}
                    </Button>
                </Link>
                <Link href="/dashboard" aria-label={locale === 'fr' ? 'Fermer' : 'Close'}>
                    <Button variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">{locale === 'fr' ? 'Fermer' : 'Close'}</span>
                    </Button>
                </Link>
            </div>

            <PageHeader title={t('settings')} description={t('overview')} />

            <Panel noPadding bodyClassName="p-4 sm:p-5">
                <UserProfile
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-transparent shadow-none',
                            navbar: 'bg-card-muted rounded-lg border border-subtle',
                            navbarButton: 'text-secondary hover:text-primary hover:bg-card rounded-md text-sm',
                            navbarButtonActive: 'bg-card text-primary',
                            pageScrollBox: 'bg-transparent',
                            page: 'bg-transparent',
                            profileSection: 'bg-card border border-default rounded-xl shadow-card',
                            profileSectionPrimaryButton: 'bg-brand-600 text-white hover:bg-brand-500 rounded-lg text-sm',
                            formButtonPrimary: 'bg-brand-600 text-white hover:bg-brand-500 rounded-lg text-sm',
                            formButtonReset: 'text-secondary hover:text-primary hover:bg-card-muted rounded-lg text-sm',
                            badge: 'bg-card-muted text-primary border-default',
                            accordionTriggerButton: 'text-secondary hover:text-primary hover:bg-card-muted rounded-lg',
                            accordionContent: 'bg-card-muted rounded-lg',
                            formFieldLabel: 'text-secondary text-xs',
                            formFieldInput: 'bg-input border-default text-primary placeholder:text-muted rounded-lg text-sm',
                            identityPreviewText: 'text-primary',
                            identityPreviewEditButton: 'text-secondary hover:text-primary',
                            headerTitle: 'text-primary text-lg',
                            headerSubtitle: 'text-secondary text-sm',
                            socialButtonsBlockButton: 'bg-card-muted border-default text-primary hover:bg-card rounded-lg text-sm',
                            dividerLine: 'bg-card-muted',
                            dividerText: 'text-muted text-xs',
                            avatarImageActionsUpload: 'text-secondary hover:text-primary',
                            avatarImageActionsRemove: 'text-red-600 hover:text-red-500',
                            fileDropAreaBox: 'bg-card-muted border-default rounded-lg',
                            fileDropAreaIconBox: 'text-muted',
                            fileDropAreaText: 'text-secondary text-sm',
                            fileDropAreaButtonPrimary: 'bg-brand-600 text-white hover:bg-brand-500 rounded-lg text-sm',
                        },
                    }}
                    routing="path"
                    path={`/${locale}/settings`}
                />
            </Panel>
        </div>
    );
}
