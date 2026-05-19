import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';    
import type { IssueStatus, IssuePriority } from '@/types/issue';

// Hardcoded assignees until users API exists
const ASSIGNEES = [
  { id: '1', name: 'Piyush' },
  { id: '2', name: 'Alex' },
  { id: '3', name: 'Sarah' },
];

interface IssueFiltersProps {
  projectId?: string;
}

export const IssueFilters = ({ projectId }: IssueFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParam = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 when filters change
    next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const status = searchParams.get('status') || 'all';
  const priority = searchParams.get('priority') || 'all';
  const assigneeId = searchParams.get('assigneeId') || 'all';
  const search = searchParams.get('search') || '';

  const hasFilters = status !== 'all' || priority !== 'all' || assigneeId !== 'all' || search;

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (projectId) next.set('projectId', projectId);
    setSearchParams(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value || null)}
            className="pl-8"
          />
        </div>

        {/* Status */}
        <Select value={status} onValueChange={(v) => updateParam('status', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select value={priority} onValueChange={(v) => updateParam('priority', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee */}
        <Select value={assigneeId} onValueChange={(v) => updateParam('assigneeId', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {ASSIGNEES.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};