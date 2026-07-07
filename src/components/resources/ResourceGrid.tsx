'use client';

import type { ResourceWithDetails } from '@/lib/resources/types';
import { ResourceCard } from './ResourceCard';
import { cn } from '@/lib/utils/cn';
import { FolderOpen } from 'lucide-react';

interface ResourceGridProps {
  resources: ResourceWithDetails[];
  isLoading?: boolean;
  className?: string;
}

export function ResourceGrid({ resources, isLoading, className }: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-3 md:grid-cols-2 lg:grid-cols-3', className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-card border border-default shadow-card animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-card-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-card-muted rounded" />
                <div className="h-4 w-full bg-card-muted rounded" />
                <div className="h-4 w-1/2 bg-card-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'rounded-2xl bg-card border border-default',
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-card-muted flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          No resources found
        </h3>
        <p className="text-secondary text-center max-w-sm">
          There are no resources matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 md:grid-cols-2 lg:grid-cols-3', className)}>
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
