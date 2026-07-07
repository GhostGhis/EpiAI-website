'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';

export default function NewProjectPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push(`/${locale}/admin/projects`);
            } else {
                const errorData = await response.json();
                alert(`Error creating project: ${errorData.error || 'Unknown error'}`);
                console.error('API Error:', errorData);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error creating project: ${error}`);
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">New Project</h1>
                    <p className="text-white/60">Create a new project for the homepage</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title EN/FR */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Title</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">English</label>
                            <input
                                type="text"
                                required
                                value={formData.title.en}
                                onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50"
                                placeholder="Traffic Sign Recognition"
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Français</label>
                            <input
                                type="text"
                                required
                                value={formData.title.fr}
                                onChange={(e) => setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50"
                                placeholder="Reconnaissance de Panneaux Routiers"
                            />
                        </div>
                    </div>
                </div>

                {/* Description EN/FR */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Description</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">English</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description.en}
                                onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50 resize-none"
                                placeholder="A computer vision model achieving 98% accuracy..."
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Français</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description.fr}
                                onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50 resize-none"
                                placeholder="Un modèle de vision par ordinateur atteignant 98% de précision..."
                            />
                        </div>
                    </div>
                </div>

                {/* Image & Status */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <h2 className="text-lg font-semibold text-white">Cover Image</h2>
                        <input
                            type="url"
                            required
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50"
                            placeholder="https://images.unsplash.com/..."
                        />
                        {formData.imageUrl && (
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
                        )}
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <h2 className="text-lg font-semibold text-white">Status</h2>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500/50"
                        >
                            <option value="Live">Live</option>
                            <option value="Beta">Beta</option>
                            <option value="In Development">In Development</option>
                            <option value="Prototype">Prototype</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Tech Stack</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50"
                            placeholder="Python, TensorFlow, OpenCV..."
                        />
                        <button
                            type="button"
                            onClick={addTech}
                            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.techStack.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm flex items-center gap-2"
                            >
                                {tech}
                                <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <h2 className="text-lg font-semibold text-white">GitHub URL</h2>
                        <input
                            type="url"
                            value={formData.githubUrl}
                            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50"
                            placeholder="https://github.com/..."
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <h2 className="text-lg font-semibold text-white">Discovery/Demo URL</h2>
                        <input
                            type="url"
                            value={formData.discoveryUrl}
                            onChange={(e) => setFormData({ ...formData, discoveryUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500/50"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Publish Toggle */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-5 h-5 rounded bg-white/5 border-white/20 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                            <p className="text-white font-semibold">Publish immediately</p>
                            <p className="text-white/60 text-sm">Make this project visible on the homepage</p>
                        </div>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-semibold transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
