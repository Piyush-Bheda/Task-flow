import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { issueService } from '@/services/issue.service';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { PriorityBadge } from '@/components/issues/PriorityBadge';
import { Skeleton } from '@/components/ui/skeleton';

export default function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issueService.getIssue(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Issue not found</h2>
        <Button className="mt-4" onClick={() => navigate('/issues')}>Back to Issues</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/issues')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{issue.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span>ID: {issue.id}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Description</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {issue.description || 'No description provided.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Assignee</h3>
          {issue.assignee ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {issue.assignee.initials}
              </div>
              <span className="text-sm">{issue.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project</span>
              <span>{issue.projectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{new Date(issue.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments placeholder - ready for future implementation */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Comments</h3>
          <span className="text-xs text-muted-foreground">(Coming soon)</span>
        </div>
        <p className="text-sm text-muted-foreground">Comments and activity history will be available here.</p>
      </div>
    </div>
  );
}