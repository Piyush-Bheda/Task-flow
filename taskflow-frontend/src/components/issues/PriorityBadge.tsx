import { cn } from '@/lib/utils';
import type { IssuePriority } from '@/types/issue';

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

const config: Record<IssuePriority, { label: string; classes: string; dot: string }> = {
  low: {
    label: 'Low',
    classes: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    classes: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  high: {
    label: 'High',
    classes: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  critical: {
    label: 'Critical',
    classes: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const { label, classes, dot } = config[priority];
  
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', classes, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
};