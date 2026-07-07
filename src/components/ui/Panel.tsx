import { cn } from '@/lib/utils/cn';
import { Card } from './Card';

interface PanelProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

/** Card with a structured header — Refero-style section panels */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  noPadding,
}: PanelProps) {
  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-subtle bg-card-muted/30">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold text-primary tracking-tight">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-5', bodyClassName)}>{children}</div>
    </Card>
  );
}
