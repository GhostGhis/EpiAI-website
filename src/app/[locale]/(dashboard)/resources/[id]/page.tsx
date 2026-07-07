'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { DifficultyBadge } from '@/components/resources/DifficultyBadge';
import { FileViewerModal } from '@/components/resources/FileViewerModal';
import { formatFileSize, formatDistanceToNow, formatDate, getTypeLabel, getDifficultyInfo } from '@/lib/resources/utils';
import { cn } from '@/lib/utils/cn';
import {
  ArrowLeft,
  Eye,
  Download,
  ExternalLink,
  Calendar,
  User,
  Tag,
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
  Edit,
  Trash2,
  Share2,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResourceWithDetails } from '@/lib/resources/types';
import { PageHeader, Panel, Button, Badge } from '@/components/ui';

const iconComponents: Record<string, any> = {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const resourceId = params.id as string;
  const t = useTranslations('Resources');

  const { isSignedIn, hasPermission, userId } = useAuth();
  const [resource, setResource] = useState<ResourceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    async function fetchResource() {
      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) {
          throw new Error('Resource not found');
        }
        const data = await response.json();
        setResource(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResource();
  }, [resourceId]);

  // Check if url is a real external link (not a local uploaded file path)
  const externalUrl = resource?.url && !resource.url.startsWith('/uploads/') ? resource.url : null;
  const hasUploadedFile = !!(resource?.fileUrl || resource?.url?.startsWith('/uploads/'));

  const handleDownload = () => {
    if (!resource || !resource.isDownloadable) return;
    // Route through the serve API with download=true (auth-protected, tracks count)
    window.open(`/api/resources/${resourceId}/serve?download=true`, '_blank');
  };

  const handleOpenLink = () => {
    if (!externalUrl) return;
    window.open(externalUrl, '_blank');
  };

  const handleViewFile = () => {
    setShowViewer(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      router.push(`/${locale}/resources`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource?.title,
          text: resource?.description,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Clipboard copy with multiple fallbacks
    let copied = false;

    // Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch {
        // Fall through to legacy fallback
      }
    }

    // Legacy fallback for HTTP or unsupported contexts
    if (!copied) {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
      document.body.removeChild(textarea);
    }

    if (copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-card-muted rounded" />
        <div className="h-12 w-3/4 bg-card-muted rounded" />
        <div className="h-6 w-1/2 bg-card-muted rounded" />
        <div className="h-48 bg-card-muted rounded-2xl" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-primary mb-4">Resource not found</h2>
        <Link
          href={`/${locale}/resources`}
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to resources
        </Link>
      </div>
    );
  }

  const TypeIcon = iconComponents[resource.type] || FileText;
  const difficultyInfo = getDifficultyInfo(resource.difficulty, locale as 'en' | 'fr');
  const canEdit = userId === resource.createdBy || hasPermission('resources.manage');
  const fileExtension = (resource.fileUrl || resource.url || '').split('.').pop()?.toLowerCase();

  return (
    <div className="space-y-5">
      {/* Secure file viewer modal */}
      {showViewer && (
        <FileViewerModal
          resourceId={resourceId}
          fileName={resource.title}
          fileType={resource.fileType}
          fileExtension={fileExtension}
          isDownloadable={resource.isDownloadable}
          onClose={() => setShowViewer(false)}
        />
      )}
      <PageHeader
        eyebrow="Resources"
        title={resource.title}
        description={resource.categoryName}
        actions={
          <Link
            href={`/${locale}/resources`}
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToResources')}
          </Link>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Panel>
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-4 rounded-xl flex-shrink-0',
                getTypeColor(resource.type)
              )}>
                <TypeIcon className="w-8 h-8" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="default">
                    {getTypeLabel(resource.type, locale as 'en' | 'fr')}
                  </Badge>
                  <DifficultyBadge
                    difficulty={resource.difficulty}
                    locale={locale as 'en' | 'fr'}
                  />
                  {resource.isFeatured && (
                    <Badge variant="amber">Featured</Badge>
                  )}
                </div>

                <p className="text-secondary whitespace-pre-wrap">
                  {resource.description}
                </p>
              </div>
            </div>
          </Panel>

          {resource.tags.length > 0 && (
            <Panel title={t('tags')}>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="default">#{tag}</Badge>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-5">
          <Panel>
            <div className="space-y-4">
              {externalUrl && (
                <Button onClick={handleOpenLink} className="w-full" size="lg">
                  <ExternalLink className="w-4 h-4" />
                  {t('openLink')}
                </Button>
              )}

              {/* View File — visible si fichier uploadé (downloadable ou non) */}
              {hasUploadedFile && (
                <Button onClick={handleViewFile} className="w-full" size="lg">
                  <Eye className="w-4 h-4" />
                  {locale === 'fr' ? 'Voir le fichier' : 'View File'}
                </Button>
              )}

              {/* Download — uniquement si isDownloadable */}
              {resource.isDownloadable && (hasUploadedFile || externalUrl) && (
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500/20 text-brand-400 font-semibold hover:bg-brand-500/30 border border-brand-500/30 transition-all"
                >
                  <Download className="w-5 h-5" />
                  {t('downloadFile')}
                </button>
              )}

              <button
                onClick={handleShare}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all',
                  copied
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-card-muted text-primary hover:bg-card-muted'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    {locale === 'fr' ? 'Lien copié !' : 'Link copied!'}
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    {t('share')}
                  </>
                )}
              </button>

              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/${locale}/resources/${resource.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card-muted text-primary font-medium hover:bg-card-muted transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    {t('edit')}
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
                  </button>
                </div>
              )}
            </div>
          </Panel>

          <Panel title={t('stats')}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t('views')}
                </span>
                <span className="text-primary font-medium">{resource.viewCount}</span>
              </div>
              {resource.isDownloadable && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {t('downloads')}
                  </span>
                  <span className="text-primary font-medium">{resource.downloadCount}</span>
                </div>
              )}
              {resource.fileSize && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary">{t('fileSize')}</span>
                  <span className="text-primary font-medium">{formatFileSize(resource.fileSize)}</span>
                </div>
              )}
            </div>
          </Panel>

          <Panel title={t('information')}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-secondary text-sm">{t('createdAt')}</p>
                  <p className="text-primary">{formatDate(resource.createdAt, locale as 'en' | 'fr')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-secondary text-sm">{t('author')}</p>
                  <p className="text-primary">{resource.author || t('anonymous')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-secondary text-sm">{t('category')}</p>
                  <p className="text-primary">{resource.categoryName}</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500/20 text-red-400',
    code: 'bg-brand-500/15 text-brand-400',
    video: 'bg-purple-500/20 text-purple-400',
    article: 'bg-brand-500/20 text-brand-400',
    course: 'bg-amber-500/20 text-amber-400',
    dataset: 'bg-cyan-500/20 text-cyan-400',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
}
