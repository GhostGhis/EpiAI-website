'use client';

import { cn } from '@/lib/utils/cn';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
} from 'lucide-react';
import { getTypeLabel } from '@/lib/resources/utils';

interface TypeFilterProps {
  className?: string;
}

export function TypeFilter({ className }: TypeFilterProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string || 'en';

  const selectedType = searchParams.get('type') || 'all';

  const types = [
    { id: 'pdf', icon: FileText, color: 'text-red-400 bg-red-400/10' },
    { id: 'code', icon: Code, color: 'text-brand-400 bg-blue-400/10' },
    { id: 'video', icon: Play, color: 'text-purple-400 bg-purple-400/10' },
    { id: 'article', icon: BookOpen, color: 'text-brand-400 bg-brand-400/10' },
    { id: 'course', icon: GraduationCap, color: 'text-amber-400 bg-amber-400/10' },
    { id: 'dataset', icon: Database, color: 'text-cyan-400 bg-cyan-400/10' },
  ];

  const handleTypeChange = (typeId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (typeId === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', typeId);
    }
    router.push(`/${locale}/resources?${newParams.toString()}`);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;

        return (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              isSelected
                ? 'bg-white/20 text-white border border-white/40'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
            )}
          >
            <Icon className={cn('w-4 h-4', type.color.split(' ')[0])} />
            <span>{getTypeLabel(type.id, locale as 'en' | 'fr')}</span>
          </button>
        );
      })}
    </div>
  );
}
