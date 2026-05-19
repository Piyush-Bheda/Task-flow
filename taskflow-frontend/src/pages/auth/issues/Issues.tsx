import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { issueService } from '@/services/issue.service';
import type { Issue, IssueStatus, IssuePriority } from '@/types/issue';
import { IssueFilters } from '@/components/issues/IssueFilters';
import { IssuesTable } from '@/components/issues/IssuesTable';
import { IssueSkeleton } from '@/components/issues/IssueSkeleton';
import { Pagination } from '@/components/issues/Pagination';
import { CreateIssueModal } from '@/components/issues/CreateIssueModal';
import { UpdateIssueModal } from '@/components/issues/UpdateIssueModal';

export default function Issues() {
  const [searchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const status = (searchParams.get('status') as IssueStatus) || undefined;
  const priority = (searchParams.get('priority') as IssuePriority) || undefined;
  const assigneeId = searchParams.get('assigneeId') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const projectId = searchParams.get('projectId') || undefined;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['issues', projectId, status, priority, assigneeId, search, page],
    queryFn: () => issueService.getIssues({
      projectId,
      status,
      priority,
      assigneeId,
      search,
      page,
      limit: 10,
    }),
    staleTime: 30 * 1000,
  });

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setIsUpdateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        </div>
        <IssueSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Failed to load issues</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Could not fetch issues. Please try again.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Issues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.totalCount ?? 0} issues total
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      <IssueFilters projectId={projectId} />

      <IssuesTable issues={data?.data || []} onEdit={handleEdit} />

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onPageChange={(newPage) => {
            const next = new URLSearchParams(searchParams);
            next.set('page', String(newPage));
            window.history.pushState(null, '', `?${next.toString()}`);
            window.location.reload(); // Simple approach; use setSearchParams in real app
          }}
        />
      )}

      <CreateIssueModal open={isCreateOpen} onOpenChange={setIsCreateOpen} projectId={projectId} />
      
      <UpdateIssueModal 
        issue={editingIssue} 
        open={isUpdateOpen} 
        onOpenChange={(v) => {
          setIsUpdateOpen(v);
          if (!v) setEditingIssue(null);
        }} 
      />
    </div>
  );
}