import type { Activity } from '@/types/dashboard';
import { EmptyState } from './EmptyState';
import { Activity as ActivityIcon, GitPullRequest, MessageSquare, FolderGit, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityListProps {
  activities: Activity[] | undefined;
}

const activityConfig: Record<string, { icon: typeof ActivityIcon; color: string; bg: string }> = {
  issue_updated: { icon: GitPullRequest, color: 'text-blue-600', bg: 'bg-blue-50' },
  issue_completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  project_created: { icon: FolderGit, color: 'text-violet-600', bg: 'bg-violet-50' },
  comment_added: { icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ActivityList = ({ activities }: ActivityListProps) => {
  if (!activities?.length) {
    return (
      <EmptyState 
        icon={ActivityIcon} 
        title="No recent activity" 
        description="Team activity will appear here once projects get moving."
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => {
          const config = activityConfig[activity.type] || activityConfig.issue_updated;
          const Icon = config.icon;
          
          return (
            <div key={activity.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-accent/30 transition-colors">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">
                  <span className="font-medium">{activity.user.name}</span>{' '}
                  <span className="text-muted-foreground">{activity.title}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};