import { cn } from '@/lib/utils/cn';
import { Card } from './Card';

interface FormShellProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Standard form layout inside a Card — consistent padding & spacing */
export function FormShell({ title, description, children, footer, className }: FormShellProps) {
  return (
    <Card className={cn('max-w-2xl', className)}>
      {(title || description) && (
        <div className="mb-6">
          {title ? <h2 className="text-lg font-semibold text-primary">{title}</h2> : null}
          {description ? <p className="text-sm text-secondary mt-1">{description}</p> : null}
        </div>
      )}
      <div className="space-y-4">{children}</div>
      {footer ? (
        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-subtle">{footer}</div>
      ) : null}
    </Card>
  );
}

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row flex-wrap gap-2.5',
        className
      )}
    >
      {children}
    </div>
  );
}
