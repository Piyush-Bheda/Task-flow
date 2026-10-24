import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { issueService } from '@/services/issue.service';
import { IssuesTable } from '@/components/issues/IssuesTable';
import { IssueSkeleton } from '@/components/issues/IssueSkeleton';
import { Pagination } from '@/components/issues/Pagination';
import { CreateIssueModal } from '@/components/issues/CreateIssueModal';
import { UpdateIssueModal } from '@/components/issues/UpdateIssueModal';
import { IssueFilters } from '@/components/issues/IssueFilters';
import type { Issue, IssueStatus, IssuePriority } from '@/types/issue';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState as reactuseState } from 'react';

export default function Issues() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = reactuseState(false);
  const [editingIssue, setEditingIssue] = reactuseState<Issue | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = reactuseState(false);

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
        <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">Could not fetch issues. Please try again.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Issues</h1>
            <div className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              {data?.totalCount ?? 0} total
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Manage and track your workspace tasks</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <IssueFilters projectId={projectId} />
      </div>

      {/* Table View */}
      <IssuesTable issues={data?.data || []} onEdit={handleEdit} />

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onPageChange={(newPage) => {
            const next = new URLSearchParams(searchParams);
            next.set('page', String(newPage));
            navigate({ search: next.toString() });
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

// Helper component for error state (imported in real app)
function AlertTriangle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 8-//-8.98-5.7a2 2 0 0 0-2 0l-.01 0 0 0 0 0z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>;
}
