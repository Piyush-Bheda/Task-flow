import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/types/issue';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const config: Record<IssueStatus, { label: string; classes: string }> = {
  todo: {
    label: 'Todo',
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  'in-progress': {
    label: 'In Progress',
    classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  done: {
    label: 'Done',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { label, classes } = config[status];
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      classes,
      className
    )}>
      {label}
    </span>
  );
};