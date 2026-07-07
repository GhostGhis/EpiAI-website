import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Card } from './Card';
import { cn } from '@/lib/utils/cn';

interface FormPageShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthMap = {
  sm: 'max-w-xl',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
};

/** Consistent layout for create/edit forms */
export function FormPageShell({
  backHref,
  backLabel,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}: FormPageShellProps) {
  return (
    <div className={cn('space-y-5 w-full mx-auto', maxWidthMap[maxWidth], className)}>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        {backLabel}
      </Link>
      <PageHeader title={title} description={description} />
      <Card padding="md">{children}</Card>
    </div>
  );
}
