'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CreateResourceForm } from '@/components/resources/CreateResourceForm';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FormPageShell, EmptyState, Button } from '@/components/ui';

export default function NewResourcePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, hasPermission } = useAuth();
  const t = useTranslations('Resources');

  if (!isSignedIn) {
    return (
      <EmptyState
        title="You need to be signed in to create a new resource."
        action={
          <Link href={`/${locale}/sign-in`}>
            <Button>Sign In</Button>
          </Link>
        }
      />
    );
  }

  if (!hasPermission('resources.create')) {
    return (
      <EmptyState
        title="You don't have permission to create new resources."
        action={
          <Link href={`/${locale}/resources`}>
            <Button variant="secondary">{t('backToResources')}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <FormPageShell
      backHref={`/${locale}/resources`}
      backLabel={t('backToResources')}
      title={t('addResource')}
      description="Share a resource with the community."
    >
      <CreateResourceForm />
    </FormPageShell>
  );
}
