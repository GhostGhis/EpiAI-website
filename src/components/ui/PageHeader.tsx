import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-1">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl sm:text-2xl font-semibold text-primary tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-secondary max-w-2xl leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
