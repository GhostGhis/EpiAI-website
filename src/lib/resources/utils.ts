// Format file size
export function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return '';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// Format date
export function formatDate(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format relative time
export function formatDistanceToNow(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
    { label: locale === 'fr' ? 'an' : 'year', seconds: 31536000 },
    { label: locale === 'fr' ? 'mois' : 'month', seconds: 2592000 },
    { label: locale === 'fr' ? 'semaine' : 'week', seconds: 604800 },
    { label: locale === 'fr' ? 'jour' : 'day', seconds: 86400 },
    { label: locale === 'fr' ? 'heure' : 'hour', seconds: 3600 },
    { label: locale === 'fr' ? 'minute' : 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      if (locale === 'fr') {
        return `il y a ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return locale === 'fr' ? 'a l\'instant' : 'just now';
}

// Get difficulty info
export function getDifficultyInfo(difficulty: string, locale: 'en' | 'fr' = 'en') {
  const difficulties: Record<string, { label: string; color: string }> = {
    beginner: {
      label: locale === 'fr' ? 'Debutant' : 'Beginner',
      color: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    },
    intermediate: {
      label: locale === 'fr' ? 'Intermediaire' : 'Intermediate',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    advanced: {
      label: locale === 'fr' ? 'Avance' : 'Advanced',
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };

  return difficulties[difficulty] || difficulties.beginner;
}

// Get type icon
export function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    pdf: 'FileText',
    code: 'Code',
    video: 'Play',
    article: 'BookOpen',
    course: 'GraduationCap',
    dataset: 'Database',
  };
  return icons[type] || 'File';
}

// Get type label
export function getTypeLabel(type: string, locale: 'en' | 'fr' = 'en'): string {
  const labels: Record<string, { en: string; fr: string }> = {
    pdf: { en: 'PDF', fr: 'PDF' },
    code: { en: 'Code', fr: 'Code' },
    video: { en: 'Video', fr: 'Video' },
    article: { en: 'Article', fr: 'Article' },
    course: { en: 'Course', fr: 'Cours' },
    dataset: { en: 'Dataset', fr: 'Dataset' },
  };
  return labels[type]?.[locale] || type;
}

// Get type color
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: 'text-red-400 bg-red-400/10',
    code: 'text-brand-400 bg-blue-400/10',
    video: 'text-purple-400 bg-purple-400/10',
    article: 'text-brand-400 bg-brand-400/10',
    course: 'text-amber-400 bg-amber-400/10',
    dataset: 'text-cyan-400 bg-cyan-400/10',
  };
  return colors[type] || 'text-gray-400 bg-gray-400/10';
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate file type
export function isValidFileType(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => fileType.toLowerCase().includes(type.toLowerCase()));
}

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = {
  pdf: ['application/pdf'],
  code: ['text/plain', 'application/zip', 'application/x-zip-compressed'],
  dataset: ['text/csv', 'application/json', 'application/parquet'],
};

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Get icon for file
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const icons: Record<string, string> = {
    pdf: 'FileText',
    py: 'Code',
    js: 'Code',
    ipynb: 'Code',
    zip: 'Archive',
    csv: 'Database',
    json: 'Database',
  };
  return icons[ext] || 'File';
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Generate slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
