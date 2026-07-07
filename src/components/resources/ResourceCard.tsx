'use client';

import type { ResourceWithDetails } from '@/lib/resources/types';
import { formatFileSize, formatDistanceToNow, getTypeLabel, getDifficultyInfo, getTypeColor } from '@/lib/resources/utils';
import { cn } from '@/lib/utils/cn';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
};

interface ResourceCardProps {
  resource: ResourceWithDetails;
  className?: string;
}

export function ResourceCard({ resource, className }: ResourceCardProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const TypeIcon = iconComponents[resource.type] || FileText;
  const difficultyInfo = getDifficultyInfo(resource.difficulty, locale as 'en' | 'fr');
  const timeAgo = formatDistanceToNow(resource.createdAt, locale as 'en' | 'fr');

  return (
    <Link
      href={`/${locale}/resources/${resource.id}`}
      className={cn(
        'block p-4 rounded-xl bg-card border border-default shadow-card',
        'hover:border-brand-500/20 hover:shadow-card transition-all',
        'group',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={cn(
          'p-2.5 rounded-xl flex-shrink-0',
          getTypeColor(resource.type)
        )}>
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-semibold text-primary group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5">
            {resource.title}
          </h3>

          {/* Description */}
          <p className="text-secondary text-sm line-clamp-2 mb-3">
            {resource.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Type */}
            <span className="px-2 py-0.5 rounded-lg bg-card-muted text-secondary text-xs">
              {getTypeLabel(resource.type, locale as 'en' | 'fr')}
            </span>

            {/* Difficulty */}
            <span className={cn(
              'px-2 py-0.5 rounded-lg text-xs border',
              difficultyInfo.color
            )}>
              {difficultyInfo.label}
            </span>

            {/* File size if available */}
            {resource.fileSize && (
              <span className="px-2 py-0.5 rounded-lg bg-card-muted text-muted text-xs">
                {formatFileSize(resource.fileSize)}
              </span>
            )}

            {/* Downloadable badge */}
            {resource.isDownloadable && (
              <span className="px-2 py-0.5 rounded-lg bg-brand-500/15 text-brand-400/80 text-xs border border-brand-500/20 flex items-center gap-1">
                <Download className="w-3 h-3" />
                {locale === 'fr' ? 'Téléchargeable' : 'Downloadable'}
              </span>
            )}
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {resource.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg bg-card text-secondary text-xs"
                >
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-lg bg-card text-muted text-xs">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {resource.viewCount}
              </span>
              {resource.isDownloadable && (
                <span className="flex items-center gap-1 text-brand-400/70">
                  <Download className="w-3.5 h-3.5" />
                  {resource.downloadCount}
                </span>
              )}
            </div>
            <span className="text-muted">{timeAgo}</span>
          </div>
        </div>

        {/* External Link Indicator */}
        <div className="flex-shrink-0">
          <ExternalLink className="w-4 h-4 text-muted group-hover:text-secondary transition-colors" />
        </div>
      </div>

      {/* Featured Badge */}
      {resource.isFeatured && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
            Featured
          </span>
        </div>
      )}
    </Link>
  );
}
