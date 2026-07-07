import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import Footer from '@/components/Footer';
import { getPostBySlug } from '@/lib/blog/repository';
import { notFound } from 'next/navigation';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('Blog_Detail');
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const title = locale === 'fr' ? post.titleFr : post.titleEn;
  const excerpt = locale === 'fr' ? post.excerptFr : post.excerptEn;
  const content = locale === 'fr' ? post.contentFr : post.contentEn;
  const image =
    post.imageUrl ||
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop';
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <Image src="/assets/hero-bg.jpg" alt="" fill className="object-cover brightness-[0.2]" priority />
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 relative z-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-12"
        >
          ← {t('back_btn')}
        </Link>
        <article>
          <header className="mb-12">
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-400 mb-6">
              <span>{post.category}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-gray-500">{date}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{title}</h1>
            <p className="text-xl text-gray-400 font-light italic border-l-4 border-blue-600/30 pl-6">
              {excerpt}
            </p>
          </header>
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 mb-16">
            <Image src={image} alt={title} fill className="object-cover" priority />
          </div>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300 leading-relaxed">
            {content}
          </div>
          <footer className="mt-20 pt-12 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">{post.authorName}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{t('author')}</div>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
}
