import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyIssuesProps {
  onCreateClick?: () => void;
}

export const EmptyIssues = ({ onCreateClick }: EmptyIssuesProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-xl bg-card/50">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">No issues found</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
        Try adjusting your filters or create a new issue to get started.
      </p>
      {onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      )}
    </div>
  );
};