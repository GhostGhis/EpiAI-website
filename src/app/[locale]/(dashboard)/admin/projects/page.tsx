'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';

interface Project {
    _id: string;
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    imageUrl: string;
    status: string;
    techStack: string[];
    githubUrl: string;
    discoveryUrl: string;
    published: boolean;
    createdAt: string;
}

export default function AdminProjectsPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            setFetchError(null);
            const response = await fetch('/api/projects?all=true');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
                return;
            }

            if (response.status === 401) {
                setFetchError('Session expirée — reconnectez-vous.');
            } else if (response.status === 403) {
                setFetchError('Permissions insuffisantes pour voir les projets.');
            } else {
                const body = await response.json().catch(() => ({}));
                setFetchError(body.error || `Erreur serveur (${response.status}).`);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setFetchError('Impossible de charger les projets.');
        } finally {
            setLoading(false);
        }
    }

    async function deleteProject(id: string) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProjects(projects.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }

    async function togglePublished(id: string, currentStatus: boolean) {
        try {
            const project = projects.find(p => p._id === id);
            if (!project) return;

            const response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...project,
                    published: !currentStatus,
                }),
            });

            if (response.ok) {
                setProjects(projects.map(p =>
                    p._id === id ? { ...p, published: !currentStatus } : p
                ));
            }
        } catch (error) {
            console.error('Error toggling published status:', error);
        }
    }

    return (
        <PermissionGate
            permission="content.create"
            fallback={
                <div className="flex flex-col items-center justify-center py-20">
                    <Shield className="w-16 h-16 text-white/20 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                    <p className="text-white/60 text-center max-w-md">
                        You don&apos;t have permission to manage projects.
                    </p>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Projects Management</h1>
                        <p className="text-white/60">Manage and publish projects for the homepage</p>
                    </div>
                    {/* Direct link - guaranteed to work */}
                    <a
                        href="/admin/projects/new"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        + New Project
                    </a>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-brand-500 rounded-full"></div>
                    </div>
                ) : fetchError ? (
                    <div className="text-center py-20 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <p className="text-red-300 mb-4">{fetchError}</p>
                        <button
                            type="button"
                            onClick={() => { setLoading(true); void fetchProjects(); }}
                            className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 rounded-2xl bg-white/5 border border-white/10">
                        <Plus className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 mb-4">No projects yet</p>
                        <Link
                            href="/admin/projects/new"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Project
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div
                                key={project._id}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title[locale as 'en' | 'fr']}
                                        className="w-32 h-24 object-cover rounded-xl border border-white/10"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">
                                                    {project.title[locale as 'en' | 'fr']}
                                                </h3>
                                                <p className="text-white/60 text-sm line-clamp-2">
                                                    {project.description[locale as 'en' | 'fr']}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => togglePublished(project._id, project.published)}
                                                    className={`p-2 rounded-lg transition-colors ${project.published
                                                        ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                        }`}
                                                    title={project.published ? 'Published' : 'Draft'}
                                                >
                                                    {project.published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        console.log('Edit clicked for project:', project._id);
                                                        window.location.href = `/${locale}/admin/projects/${project._id}/edit`;
                                                    }}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        console.log('Delete clicked for project:', project._id);
                                                        deleteProject(project._id);
                                                    }}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-2 py-1 rounded-md bg-blue-500/10 text-brand-400 text-xs border border-blue-500/20">
                                                {project.status}
                                            </span>
                                            {project.techStack.slice(0, 3).map((tech) => (
                                                <span key={tech} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60 text-xs">
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.techStack.length > 3 && (
                                                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 text-xs">
                                                    +{project.techStack.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PermissionGate>
    );
}
