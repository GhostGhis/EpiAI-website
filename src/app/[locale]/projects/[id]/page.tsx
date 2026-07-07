'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import { isRoadmapUrl } from '@/lib/projects/links';

interface Project {
  _id: string;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  imageUrl?: string;
  status?: string;
  techStack?: string[];
  githubUrl?: string;
  discoveryUrl?: string;
  content?: { en?: string; fr?: string };
}

export default function ProjectDetailPage() {
  const t = useTranslations('Project_Detail');
  const { id, locale } = useParams();
  const lang = (locale as string) === 'fr' ? 'fr' : 'en';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Not found');
        setProject(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p>{t('notFound')}</p>
        <Link href="/#projects" className="text-brand-400 hover:underline">{t('back_btn')}</Link>
      </div>
    );
  }

  const title = project.title?.[lang] || project.title?.en || '';
  const desc = project.description?.[lang] || project.description?.en || '';
  const content = project.content?.[lang] || project.content?.en || desc;
  const discoveryIsRoadmap = project.discoveryUrl
    ? isRoadmapUrl(project.discoveryUrl)
    : false;

  return (
    <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/assets/hero-bg.jpg"
          alt="Background"
          fill
          className="object-cover brightness-[0.2] scale-105"
          priority
        />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 relative z-10">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors mb-12 group">
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('back_btn')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            {project.status && (
              <div className="mb-6 inline-block px-4 py-1.5 rounded-full bg-brand-600/20 border border-brand-500/25 text-[10px] font-bold uppercase tracking-widest text-brand-300">
                {project.status}
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{title}</h1>
            <p className="text-xl text-gray-300 font-light leading-relaxed mb-12">{desc}</p>

            {content && (
              <section className="mb-12">
                <h2 className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-4">{t('challenge_title')}</h2>
                <p className="text-gray-400 font-light leading-relaxed whitespace-pre-line">{content}</p>
              </section>
            )}

            {project.techStack && project.techStack.length > 0 && (
              <section>
                <h2 className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-4">{t('tech_stack')}</h2>
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <div className="flex gap-4 mt-10">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition-all">
                  GitHub
                </a>
              )}
              {project.discoveryUrl && (
                <a href={project.discoveryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-sm hover:bg-brand-500 transition-all">
                  {discoveryIsRoadmap ? (
                    <>
                      <FileText className="w-4 h-4" />
                      {t('roadmap_btn')}
                    </>
                  ) : (
                    t('demo_btn')
                  )}
                </a>
              )}
            </div>
          </div>

          {project.imageUrl && (
            <div className="sticky top-32">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <Image src={project.imageUrl} alt={title} fill className="object-cover" />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
