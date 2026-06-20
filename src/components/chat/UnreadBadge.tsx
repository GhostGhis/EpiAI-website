'use client';

import { cn } from '@/lib/utils/cn';

interface UnreadBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'notification';
}

export function UnreadBadge({ count, className, size = 'sm', variant = 'notification' }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'rounded-full text-white font-semibold flex items-center justify-center shrink-0',
        variant === 'notification' ? 'bg-emerald-500' : 'bg-indigo-500',
        size === 'sm' ? 'min-w-[18px] h-[18px] text-[10px] px-1' : 'min-w-[22px] h-[22px] text-xs px-1.5',
        className
      )}
      aria-label={`${count} non lu${count > 1 ? 's' : ''}`}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
