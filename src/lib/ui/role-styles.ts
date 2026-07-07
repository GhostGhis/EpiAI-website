/** Cohesive role chips — neutral base + brand/amber only for senior levels (no rainbow). */

export function getRoleChipClass(level: number): string {
  if (level >= 8) {
    return 'bg-amber-500/10 text-amber-800 border-amber-500/25 dark:text-amber-300';
  }
  if (level >= 5) {
    return 'bg-brand-500/10 text-brand-800 border-brand-500/25 dark:text-brand-300';
  }
  if (level >= 3) {
    return 'bg-card-muted text-secondary border-default';
  }
  return 'bg-card-muted text-muted border-subtle';
}

export function getRoleChipClassById(roleId: string, level: number): string {
  return getRoleChipClass(level);
}
