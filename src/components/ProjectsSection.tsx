'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { discoveryLinkLabel } from '@/lib/projects/links';
import type { ProjectApiShape } from '@/lib/projects/repository';

interface ProjectsSectionProps {
    initialProjects?: ProjectApiShape[];
}

export default function ProjectsSection({ initialProjects = [] }: ProjectsSectionProps) {
    const tHeader = useTranslations('Header');
    const locale = useLocale() as 'en' | 'fr';
    const [projects, setProjects] = useState<ProjectApiShape[]>(initialProjects);
    const [loading, setLoading] = useState(initialProjects.length === 0);

    useEffect(() => {
        if (initialProjects.length > 0) return;

        async function fetchProjects() {
            try {
                const response = await fetch('/api/projects');
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [initialProjects.length]);

    const statusColors = {
        "Live": "bg-brand-500/15 text-brand-300 border-brand-500/25",
        "Beta": "bg-amber-500/15 text-amber-200 border-amber-500/25",
        "In Development": "bg-zinc-500/15 text-zinc-300 border-zinc-500/25",
        "Prototype": "bg-zinc-600/15 text-zinc-400 border-zinc-500/20",
        "Archived": "bg-zinc-700/15 text-zinc-500 border-zinc-600/20"
    };

    return (
        <section id="projects" className="py-24 px-4 min-h-screen flex flex-col justify-center relative bg-black/20">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">{tHeader('projects')}</h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm font-light">
                        {locale === 'fr'
                            ? 'Découvrez les solutions innovantes et les défis techniques relevés par nos équipes étudiantes.'
                            : 'Discover the innovative solutions and technical challenges tackled by our student teams.'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-brand-500 rounded-full"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-white/40">
                            {locale === 'fr' ? 'Aucun projet publié pour le moment' : 'No projects published yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <div key={project._id} className="group relative rounded-2xl bg-surface-card border border-white/[0.06] hover:border-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col h-full">
                                {/* Main Link Overlay */}
                                <Link href={`/projects/${project._id}`} className="absolute inset-0 z-0" aria-label={project.title[locale]} />

                                {/* Project Header - Image with Overlay */}
                                <div className="h-48 relative w-full border-b border-white/5 bg-gradient-to-br from-brand-900/60 to-zinc-900 overflow-hidden">
                                    {project.imageUrl ? (
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.title[locale]}
                                        fill
                                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    ) : null}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusColors[(project.status ?? 'Live') as keyof typeof statusColors] || statusColors['Live']}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Project Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-brand-400 transition-colors font-mono">
                                        {project.title[locale]}
                                    </h3>

                                    <p className="text-gray-400 leading-relaxed mb-6 font-light text-sm line-clamp-3">
                                        {project.description[locale]}
                                    </p>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                        {project.techStack.map((tech) => (
                                            <span key={tech} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 relative z-10">
                                        {project.githubUrl && (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-xs font-semibold group/btn"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                                GitHub
                                            </a>
                                        )}
                                        {project.discoveryUrl && (
                                            <a
                                                href={project.discoveryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/20 hover:border-brand-500/40 text-brand-400 hover:text-brand-300 transition-all text-xs font-semibold"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                {discoveryLinkLabel(project.discoveryUrl, locale)}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
