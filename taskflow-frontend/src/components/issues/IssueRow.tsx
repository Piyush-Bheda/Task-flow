import { useNavigate } from 'react-router-dom';
import { Pencil, ArrowUpRight } from 'lucide-react';
import type { Issue } from '@/types/issue';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';

interface IssueRowProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
}

export const IssueRow = ({ issue, onEdit }: IssueRowProps) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <tr 
      className="border-b border-border hover:bg-accent/30 transition-colors cursor-pointer group"
      onClick={() => navigate(`/issues/${issue.id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {issue.title}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </td>
      
      <td className="px-4 py-3">
        <StatusBadge status={issue.status} />
      </td>
      
      <td className="px-4 py-3">
        <PriorityBadge priority={issue.priority} />
      </td>
      
      <td className="px-4 py-3">
        {issue.assignee ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {issue.assignee.initials}
            </div>
            <span className="text-sm text-muted-foreground">{issue.assignee.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{formatDate(issue.createdAt)}</span>
      </td>
      
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(issue);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};