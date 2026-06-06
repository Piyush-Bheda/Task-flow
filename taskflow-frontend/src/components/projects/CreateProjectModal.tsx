import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { projectService } from '@/services/project.service';
import type { CreateProjectInput } from '@/types/projectDetails';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getActiveWorkspace = (): { id: string; name: string } | null => {
  try {
    const stored = localStorage.getItem('active_workspace');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed?.id) return parsed;
  } catch {
    // ignore
  }
  return null;
};

export const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (open) {
      setActiveWorkspace(getActiveWorkspace());
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectService.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setName('');
      setDescription('');
      setError(null);
      onOpenChange(false);
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to create project. Please try again.';
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeWorkspace) {
      setError('No active workspace. Please select a workspace first.');
      return;
    }

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const trimmedDescription = description.trim();
    mutation.mutate({
      name: name.trim(),
      description: trimmedDescription ? trimmedDescription : null,
      workspaceId: activeWorkspace.id,
    });
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setName('');
      setDescription('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              {activeWorkspace
                ? `Add a new project to "${activeWorkspace.name}".`
                : 'Add a new project to your workspace.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!activeWorkspace && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  No active workspace selected. Please select a workspace from the switcher in the sidebar before creating a project.
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Project Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., TaskFlow Mobile"
                disabled={mutation.isPending}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                disabled={mutation.isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !activeWorkspace}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};