'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CreateThreadForm } from '@/components/forum/CreateThreadForm';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FormPageShell, EmptyState, Button } from '@/components/ui';

export default function NewThreadPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, hasPermission } = useAuth();
  const t = useTranslations('Forum');

  if (!isSignedIn) {
    return (
      <EmptyState
        title="You need to be signed in to create a new discussion."
        action={
          <Link href={`/${locale}/sign-in`}>
            <Button>Sign In</Button>
          </Link>
        }
      />
    );
  }

  if (!hasPermission('content.create')) {
    return (
      <EmptyState
        title="You don't have permission to create new discussions."
        action={
          <Link href={`/${locale}/forum`}>
            <Button variant="secondary">{t('backToForum')}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <FormPageShell
      backHref={`/${locale}/forum`}
      backLabel={t('backToForum')}
      title={t('createNewThread')}
      description="Start a new discussion with the community."
    >
      <CreateThreadForm />
    </FormPageShell>
  );
}
