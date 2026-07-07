import { cn } from '@/lib/utils/cn';

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto -mx-1', className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-card-muted/60">{children}</thead>;
}

export function DataTableHeadRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-default">{children}</tr>;
}

export function DataTableTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-subtle">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn('hover:bg-card-muted/40 transition-colors', className)}>
      {children}
    </tr>
  );
}

export function DataTableTd({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-2.5 align-middle', className)}>
      {children}
    </td>
  );
}
