import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

/** Redirige /membership vers /join (candidature publique). */
export default async function MembershipRedirectPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/join`);
}
