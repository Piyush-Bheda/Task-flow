import type { AssignedIssue } from '@/types/dashboard';
import { EmptyState } from './EmptyState';
import { AlertCircle, Clock, CheckCircle2, Circle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignedIssuesProps {
  issues: AssignedIssue[] | undefined;
}

const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  open: { label: 'Open', icon: Circle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  backlog: { label: 'Backlog', icon: AlertCircle, color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-slate-500' },
  medium: { label: 'Med', color: 'text-blue-600' },
  high: { label: 'High', color: 'text-amber-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

export const AssignedIssues = ({ issues }: AssignedIssuesProps) => {
  if (!issues?.length) {
    return (
      <EmptyState 
        icon={CheckCircle2} 
        title="No assigned issues" 
        description="Issues assigned to you will show up here."
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Assigned to You</h3>
        <span className="text-xs text-muted-foreground">{issues.length} issues</span>
      </div>
      <div className="divide-y divide-border">
        {issues.map((issue) => {
          const status = statusConfig[issue.status] || statusConfig.open;
          const priority = priorityConfig[issue.priority] || priorityConfig.medium;
          const StatusIcon = status.icon;

          return (
            <div key={issue.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-accent/30 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {issue.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{issue.projectName}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className={cn("text-xs font-medium", priority.color)}>{priority.label}</span>
                </div>
              </div>
              <div className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0",
                status.bg, status.color
              )}>
                <StatusIcon className="h-3 w-3" />
                <span className="hidden sm:inline">{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};