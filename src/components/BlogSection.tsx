import { getTranslations, getLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { getPublishedPosts } from '@/lib/blog/repository';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop',
];

export default async function BlogSection() {
  const tHeader = await getTranslations('Header');
  const locale = await getLocale();
  const posts = await getPublishedPosts(6);

  if (posts.length === 0) {
    return (
      <section id="blog" className="py-24 px-4 min-h-[50vh] relative">
        <div className="max-w-7xl mx-auto w-full text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">{tHeader('blog')}</h2>
          <p className="text-gray-400 text-sm">
            {locale === 'fr' ? 'Aucun article publié pour le moment.' : 'No published posts yet.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-24 px-4 min-h-screen relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-900/15 to-transparent -z-10" />
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">
            {tHeader('blog')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm font-light">
            {locale === 'fr'
              ? 'Les dernières actualités et tutoriels de la communauté EPI\'AI.'
              : 'Latest insights and tutorials from the EPI\'AI community.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => {
            const title = locale === 'fr' ? post.titleFr : post.titleEn;
            const excerpt = locale === 'fr' ? post.excerptFr : post.excerptEn;
            const image = post.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
            const date = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '';

            return (
              <article
                key={post.id}
                className="group relative flex flex-col h-full rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all duration-300 overflow-hidden hover:-translate-y-2"
              >
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-0" aria-label={title} />
                <div className="h-56 relative overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] uppercase font-bold text-white">
                    {post.category}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-4 font-medium uppercase">
                    <span>{date}</span>
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    <span>{post.authorName}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 flex-1">{excerpt}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
