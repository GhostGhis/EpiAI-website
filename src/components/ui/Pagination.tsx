import { cn } from '@/lib/utils/cn';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsis = totalPages > 7;
  const visiblePages = showEllipsis
    ? pages.filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
      )
    : pages;

  return (
    <div className={cn('flex justify-center items-center gap-1.5 pt-2', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9 p-0"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {visiblePages.map((p, i) => {
        const prev = visiblePages[i - 1];
        const showGap = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showGap ? <span className="text-muted text-xs px-1">…</span> : null}
            <Button
              variant={page === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPageChange(p)}
              className="w-9 h-9 p-0 tabular-nums"
            >
              {p}
            </Button>
          </span>
        );
      })}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-9 h-9 p-0"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
