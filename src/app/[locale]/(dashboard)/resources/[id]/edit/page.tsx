'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { CATEGORIES } from '@/lib/resources/categories';
import { cn } from '@/lib/utils/cn';
import { getTypeLabel, formatFileSize } from '@/lib/resources/utils';
import type { ResourceWithDetails } from '@/lib/resources/types';
import { FormPageShell, EmptyState, Button } from '@/components/ui';
import {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
  Upload,
  X,
  Plus,
  Loader2,
  Link as LinkIcon,
  File,
  Check,
  Download,
  Eye,
} from 'lucide-react';

const typeOptions = [
  { id: 'pdf', icon: FileText, label: 'PDF Document', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'code', icon: Code, label: 'Code', color: 'bg-brand-500/15 text-brand-400 border-brand-500/25' },
  { id: 'video', icon: Play, label: 'Video', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'article', icon: BookOpen, label: 'Article', color: 'bg-brand-500/20 text-brand-400 border-brand-500/30' },
  { id: 'course', icon: GraduationCap, label: 'Course', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'dataset', icon: Database, label: 'Dataset', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

const difficultyOptions = [
  { id: 'beginner', label: 'Beginner', color: 'bg-brand-500/20 text-brand-400 border-brand-500/30' },
  { id: 'intermediate', label: 'Intermediate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'advanced', label: 'Advanced', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const resourceId = params.id as string;
  const t = useTranslations('Resources');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isSignedIn, hasPermission, userId } = useAuth();

  const [resource, setResource] = useState<ResourceWithDetails | null>(null);
  const [isLoadingResource, setIsLoadingResource] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'article' as 'pdf' | 'code' | 'video' | 'article' | 'course' | 'dataset',
    url: '',
    fileUrl: '',
    fileSize: 0,
    fileType: '',
    categoryId: 'ia',
    tags: [] as string[],
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    author: '',
    duration: '',
    isDownloadable: false,
  });

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch existing resource
  useEffect(() => {
    async function fetchResource() {
      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) {
          throw new Error('Resource not found');
        }
        const data: ResourceWithDetails = await response.json();
        setResource(data);

        // Pre-fill form
        setFormData({
          title: data.title,
          description: data.description,
          type: data.type as any,
          url: data.url || '',
          fileUrl: data.fileUrl || '',
          fileSize: data.fileSize || 0,
          fileType: data.fileType || '',
          categoryId: data.categoryId,
          tags: data.tags || [],
          difficulty: data.difficulty,
          author: data.author || '',
          duration: data.duration || '',
          isDownloadable: data.isDownloadable,
        });

        if (data.fileUrl) {
          setUploadedFileName(data.fileUrl.split('/').pop() || 'Uploaded file');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingResource(false);
      }
    }

    fetchResource();
  }, [resourceId]);

  const hasUrl = formData.url.trim().length > 0;
  const hasFile = formData.fileUrl.length > 0;
  const hasUrlOrFile = hasUrl || hasFile;

  const canEdit = resource && (userId === resource.createdBy || hasPermission('resources.manage'));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload/resource', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
      }));
      setUploadedFileName(file.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      fileUrl: '',
      fileSize: 0,
      fileType: '',
    }));
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!hasUrlOrFile) {
      setError('You must provide a URL, upload a file, or both.');
      setIsLoading(false);
      return;
    }

    try {
      const payload: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        categoryId: formData.categoryId,
        tags: formData.tags,
        difficulty: formData.difficulty,
        isDownloadable: formData.isDownloadable,
      };

      if (formData.url.trim()) payload.url = formData.url.trim();
      if (formData.fileUrl) {
        payload.fileUrl = formData.fileUrl;
        payload.fileSize = formData.fileSize;
        payload.fileType = formData.fileType;
      }
      if (formData.author.trim()) payload.author = formData.author.trim();
      if (formData.duration.trim()) payload.duration = formData.duration.trim();

      if (!payload.url && payload.fileUrl) {
        payload.url = payload.fileUrl;
      }

      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update resource');
      }

      router.push(`/${locale}/resources/${resourceId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  if (isLoadingResource) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-card-muted rounded" />
        <div className="h-12 w-3/4 bg-card-muted rounded" />
        <div className="h-96 bg-card-muted rounded-2xl" />
      </div>
    );
  }

  if (error && !resource) {
    return (
      <EmptyState
        title={locale === 'fr' ? 'Ressource introuvable' : 'Resource not found'}
        action={
          <Link href={`/${locale}/resources`}>
            <Button variant="secondary">{t('backToResources')}</Button>
          </Link>
        }
      />
    );
  }

  if (!isSignedIn || !canEdit) {
    return (
      <EmptyState
        title={
          locale === 'fr'
            ? "Vous n'avez pas la permission de modifier cette ressource."
            : "You don't have permission to edit this resource."
        }
        action={
          <Link href={`/${locale}/resources/${resourceId}`}>
            <Button variant="secondary">{locale === 'fr' ? 'Retour' : 'Go Back'}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <FormPageShell
      backHref={`/${locale}/resources/${resourceId}`}
      backLabel={locale === 'fr' ? 'Retour à la ressource' : 'Back to resource'}
      title={locale === 'fr' ? 'Modifier la ressource' : 'Edit Resource'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all"
              placeholder="Enter resource title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all resize-none"
              placeholder="Describe this resource..."
              rows={4}
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Resource Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {typeOptions.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                      isSelected
                        ? type.color + ' border-current'
                        : 'bg-card border-default text-secondary hover:bg-card-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{getTypeLabel(type.id, locale as 'en' | 'fr')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource Source */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary">
              Resource Source *
            </label>
            <p className="text-xs text-muted -mt-2">
              Provide a URL, upload a file, or both.
            </p>

            {/* URL Input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-muted" />
                <span className="text-sm text-secondary">URL Link</span>
                {hasUrl && <Check className="w-4 h-4 text-brand-400" />}
              </div>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all"
                placeholder="https://example.com/resource"
              />
            </div>

            {/* File Upload */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-muted" />
                <span className="text-sm text-secondary">Upload File</span>
                {hasFile && <Check className="w-4 h-4 text-brand-400" />}
              </div>

              {hasFile ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <File className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary truncate">{uploadedFileName}</p>
                    {formData.fileSize > 0 && (
                      <p className="text-xs text-muted">{formatFileSize(formData.fileSize)}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed transition-all cursor-pointer',
                    isUploading
                      ? 'border-default bg-card'
                      : 'border-default hover:border-brand-500/25 hover:bg-card'
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-muted animate-spin" />
                      <span className="text-sm text-muted">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted" />
                      <span className="text-sm text-muted">Click to upload a file</span>
                      <span className="text-xs text-muted">Max 50MB</span>
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {!hasUrlOrFile && (
              <p className="text-xs text-amber-400/80">
                Please provide at least a URL or upload a file.
              </p>
            )}
          </div>

          {/* Downloadable Toggle */}
          <div className="p-4 rounded-xl bg-card border border-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  formData.isDownloadable
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-card-muted text-muted'
                )}>
                  {formData.isDownloadable ? <Download className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">
                    {formData.isDownloadable ? 'Downloadable' : 'View only'}
                  </p>
                  <p className="text-xs text-muted">
                    {formData.isDownloadable
                      ? 'Users can download this resource'
                      : 'Users can only view this resource (no download)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isDownloadable: !prev.isDownloadable }))}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-all',
                  formData.isDownloadable ? 'bg-brand-500' : 'bg-white/20'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-5 h-5 rounded-full bg-white transition-all',
                    formData.isDownloadable ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all"
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id} className="bg-surface">
                  {category.name[locale as 'en' | 'fr'] || category.name.en}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Difficulty Level
            </label>
            <div className="flex gap-3">
              {difficultyOptions.map((difficulty) => {
                const isSelected = formData.difficulty === difficulty.id;

                return (
                  <button
                    key={difficulty.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: difficulty.id as any }))}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                      isSelected
                        ? difficulty.color + ' border-current'
                        : 'bg-card border-default text-secondary hover:bg-card-muted'
                    )}
                  >
                    {difficulty.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-card-muted text-primary hover:bg-card-muted transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-card-muted text-secondary text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted hover:text-primary transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Author Name (optional)
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all"
              placeholder="Author name or organization"
            />
          </div>

          {/* Duration */}
          {(formData.type === 'video' || formData.type === 'course') && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Duration (optional)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40 focus:bg-card-muted transition-all"
                placeholder="e.g., 2h 30m, 10 hours, 45 min"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link href={`/${locale}/resources/${resourceId}`} className="flex-1">
              <Button variant="secondary" className="w-full" size="lg">
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === 'fr' ? 'Enregistrement...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {locale === 'fr' ? 'Enregistrer' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
    </FormPageShell>
  );
}
