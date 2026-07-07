import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  loading?: boolean;
  className?: string;
  trend?: string;
}

/** Compact horizontal metric — dense analytics style */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-brand-600',
  iconBgClassName = 'bg-brand-500/10',
  loading,
  className,
  trend,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-4 rounded-xl bg-card border border-default shadow-card',
        'hover:border-brand-500/20 transition-colors',
        className
      )}
    >
      <div className="min-w-0">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-card-muted rounded w-20" />
            <div className="h-7 bg-card-muted rounded w-12" />
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider truncate">
              {label}
            </p>
            <p className="text-2xl font-semibold text-primary tabular-nums tracking-tight mt-0.5">
              {value}
            </p>
            {trend ? <p className="text-xs text-muted mt-0.5">{trend}</p> : null}
          </>
        )}
      </div>
      {Icon && !loading ? (
        <div className={cn('p-2.5 rounded-lg shrink-0', iconBgClassName)}>
          <Icon className={cn('w-4 h-4', iconClassName)} />
        </div>
      ) : null}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'amber' | 'success' | 'danger' | 'muted';
  className?: string;
}

const badgeVariants = {
  default: 'bg-card-muted text-secondary border-default',
  brand: 'bg-brand-500/10 text-brand-800 border-brand-500/25 dark:text-brand-300',
  amber: 'bg-amber-500/10 text-amber-800 border-amber-500/25 dark:text-amber-300',
  success: 'bg-brand-500/10 text-brand-800 border-brand-500/25 dark:text-brand-300',
  danger: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
  muted: 'bg-card-muted text-muted border-subtle',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  className?: string;
}

export function ActionCard({ href, icon: Icon, label, iconClassName, className }: ActionCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'block p-4 rounded-xl border border-default bg-card shadow-card',
        'hover:bg-card-muted hover:border-brand-500/20 transition-all text-left',
        className
      )}
    >
      <Icon className={cn('w-4 h-4 text-brand-600 mb-2', iconClassName)} />
      <p className="text-primary font-medium text-sm">{label}</p>
    </a>
  );
}
