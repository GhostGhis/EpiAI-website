'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { FormPageShell, Button, Input, Textarea, Select } from '@/components/ui';

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const projectId = params.id as string;

    const [formData, setFormData] = useState({
        title: { en: '', fr: '' },
        description: { en: '', fr: '' },
        imageUrl: '',
        status: 'In Development',
        techStack: [] as string[],
        githubUrl: '',
        discoveryUrl: '',
        published: false,
    });

    const [techInput, setTechInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        title: data.title,
                        description: data.description,
                        imageUrl: data.imageUrl,
                        status: data.status,
                        techStack: data.techStack,
                        githubUrl: data.githubUrl || '',
                        discoveryUrl: data.discoveryUrl || '',
                        published: data.published,
                    });
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setFetching(false);
            }
        }

        fetchProject();
    }, [projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push(`/${locale}/admin/projects`);
            } else {
                const errorData = await response.json();
                alert(`Error updating project: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error updating project: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const addTech = () => {
        if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
            setFormData({
                ...formData,
                techStack: [...formData.techStack, techInput.trim()],
            });
            setTechInput('');
        }
    };

    const removeTech = (tech: string) => {
        setFormData({
            ...formData,
            techStack: formData.techStack.filter(t => t !== tech),
        });
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-10 h-10 border-2 border-default border-t-brand-500 rounded-full" />
            </div>
        );
    }

    return (
        <FormPageShell
            backHref={`/${locale}/admin/projects`}
            backLabel="Back to projects"
            title="Edit Project"
            description="Update project information"
            maxWidth="lg"
            className="max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-primary">Title</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="English"
                            type="text"
                            required
                            value={formData.title.en}
                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                        />
                        <Input
                            label="Français"
                            type="text"
                            required
                            value={formData.title.fr}
                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-primary">Description</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Textarea
                            label="English"
                            required
                            rows={4}
                            value={formData.description.en}
                            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                        />
                        <Textarea
                            label="Français"
                            required
                            rows={4}
                            value={formData.description.fr}
                            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-primary">Cover Image</h2>
                        <Input
                            type="url"
                            required
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                        {formData.imageUrl && (
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-default" />
                        )}
                    </div>

                    <div className="space-y-3">
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Live">Live</option>
                            <option value="Beta">Beta</option>
                            <option value="In Development">In Development</option>
                            <option value="Prototype">Prototype</option>
                            <option value="Archived">Archived</option>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-primary">Tech Stack</h2>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                            placeholder="Add technology..."
                            className="flex-1"
                        />
                        <Button type="button" onClick={addTech} size="md">
                            <Plus className="w-4 h-4" />
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.techStack.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 rounded-lg bg-card-muted border border-default text-primary text-sm flex items-center gap-2"
                            >
                                {tech}
                                <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="GitHub URL"
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                    <Input
                        label="Discovery/Demo URL"
                        type="url"
                        value={formData.discoveryUrl}
                        onChange={(e) => setFormData({ ...formData, discoveryUrl: e.target.value })}
                    />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4 rounded bg-input border-default text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                        <p className="text-primary text-sm font-semibold">Published</p>
                        <p className="text-secondary text-xs">Make this project visible on the homepage</p>
                    </div>
                </label>

                <div className="flex gap-3 pt-2">
                    <Link href={`/${locale}/admin/projects`}>
                        <Button variant="secondary" size="lg">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="flex-1" size="lg">
                        {loading ? 'Updating...' : 'Update Project'}
                    </Button>
                </div>
            </form>
        </FormPageShell>
    );
}
