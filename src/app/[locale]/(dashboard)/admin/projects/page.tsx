'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PageHeader, Button, Panel, ListRow, EmptyState, Badge } from '@/components/ui';

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
                    <Shield className="w-16 h-16 text-muted mb-4" />
                    <h2 className="text-xl font-semibold text-primary mb-2">Access Denied</h2>
                    <p className="text-secondary text-center max-w-md">
                        You don&apos;t have permission to manage projects.
                    </p>
                </div>
            }
        >
            <div className="space-y-5">
                <PageHeader
                    title="Projects Management"
                    description="Manage and publish projects for the homepage"
                    actions={
                        <Link href={`/${locale}/admin/projects/new`}>
                            <Button>
                                <Plus className="w-5 h-5" />
                                New Project
                            </Button>
                        </Link>
                    }
                />

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-2 border-default border-t-brand-500 rounded-full"></div>
                    </div>
                ) : fetchError ? (
                    <div className="text-center py-20 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <p className="text-red-300 mb-4">{fetchError}</p>
                        <button
                            type="button"
                            onClick={() => { setLoading(true); void fetchProjects(); }}
                            className="px-4 py-2 rounded-xl bg-card-muted text-primary text-sm hover:bg-card"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : projects.length === 0 ? (
                    <EmptyState
                        icon={<Plus className="w-12 h-12" />}
                        title="No projects yet"
                        action={
                            <Link href="/admin/projects/new">
                                <Button>
                                    <Plus className="w-5 h-5" />
                                    Create First Project
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <Panel title="All projects" description={`${projects.length} project${projects.length === 1 ? '' : 's'}`}>
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <ListRow
                                    key={project._id}
                                    leading={
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title[locale as 'en' | 'fr']}
                                            className="w-20 h-16 object-cover rounded-lg border border-default"
                                        />
                                    }
                                    actions={
                                        <>
                                            <button
                                                onClick={() => togglePublished(project._id, project.published)}
                                                className={`p-2 rounded-lg transition-colors ${project.published
                                                    ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                                                    : 'bg-card text-muted hover:bg-card-muted'
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
                                                className="p-2 rounded-lg bg-card hover:bg-card-muted text-secondary hover:text-primary transition-colors"
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
                                        </>
                                    }
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold text-primary">
                                                {project.title[locale as 'en' | 'fr']}
                                            </p>
                                            <Badge variant={project.published ? 'success' : 'muted'}>
                                                {project.published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>
                                        <p className="text-secondary text-xs line-clamp-2 mb-2">
                                            {project.description[locale as 'en' | 'fr']}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="brand">{project.status}</Badge>
                                            {project.techStack.slice(0, 3).map((tech) => (
                                                <Badge key={tech} variant="default">{tech}</Badge>
                                            ))}
                                            {project.techStack.length > 3 && (
                                                <Badge variant="muted">+{project.techStack.length - 3} more</Badge>
                                            )}
                                        </div>
                                    </div>
                                </ListRow>
                            ))}
                        </div>
                    </Panel>
                )}
            </div>
        </PermissionGate>
    );
}
