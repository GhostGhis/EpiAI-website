// Format date complète
export function formatDate(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Format date courte
export function formatShortDate(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Format date simple
export function formatSimpleDate(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Format relative time
export function formatDistanceToNow(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return locale === 'fr' ? 'Date invalide' : 'Invalid date';
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return locale === 'fr' ? 'Passé' : 'Past';
  }

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
      return locale === 'fr'
        ? `dans ${count} ${interval.label}${count > 1 ? 's' : ''}`
        : `in ${count} ${interval.label}${count > 1 ? 's' : ''}`;
    }
  }

  return locale === 'fr' ? 'À l\'instant' : 'Just now';
}

// Countdown components
export function getCountdown(dateString: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  if (diffInSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = Math.floor(diffInSeconds % 60);

  return { days, hours, minutes, seconds, isPast: false };
}

// Vérifier si l'événement est complet
export function isEventFull(spotsLeft: number): boolean {
  return spotsLeft <= 0;
}

// Pourcentage de places restantes
export function getSpotsPercentage(registered: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.round(((capacity - registered) / capacity) * 100);
}

// Couleur de progression
export function getProgressColor(percentage: number): string {
  if (percentage > 50) return 'bg-brand-500';
  if (percentage > 25) return 'bg-amber-500';
  return 'bg-red-500';
}

// Valider les dates
export function validateEventDates(startDate: string, endDate?: string): { valid: boolean; error?: string } {
  const start = new Date(startDate);
  const now = new Date();

  if (start < now) {
    return { valid: false, error: 'Start date must be in the future' };
  }

  if (endDate) {
    const end = new Date(endDate);
    if (end <= start) {
      return { valid: false, error: 'End date must be after start date' };
    }
  }

  return { valid: true };
}

// Valider la capacité
export function validateCapacity(capacity: number): { valid: boolean; error?: string } {
  if (capacity < 1) {
    return { valid: false, error: 'Capacity must be at least 1' };
  }
  if (capacity > 10000) {
    return { valid: false, error: 'Capacity cannot exceed 10,000' };
  }
  return { valid: true };
}

//slugify pour les URLs
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Tronquer le texte
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
