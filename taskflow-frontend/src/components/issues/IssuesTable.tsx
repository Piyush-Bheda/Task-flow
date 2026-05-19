import type { Issue } from '@/types/issue';
import { IssueRow } from '@/components/issues/IssueRow';
import { EmptyIssues } from '@/components/issues/EmptyIssues';

interface IssuesTableProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
}

export const IssuesTable = ({ issues, onEdit }: IssuesTableProps) => {
  if (!issues.length) {
    return <EmptyIssues />;
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};