import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyProjectsProps {
  onCreateClick: () => void;
}

export const EmptyProjects = ({ onCreateClick }: EmptyProjectsProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-xl bg-card/50">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FolderKanban className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">No projects yet</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
        Get started by creating your first project in this workspace.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Create Project
      </Button>
    </div>
  );
};