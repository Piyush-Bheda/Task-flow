import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FolderKanban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/api/axios';
import type { Project } from '@/types/project';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Project }>(`/api/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Project Not Found</h1>
        </div>
        <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Project ID
            </label>
            <p className="text-sm font-mono text-foreground mt-1">{project.id}</p>
          </div>
          <div className="h-px bg-border" />
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <p className="text-sm text-foreground mt-1">{project.description || 'No description'}</p>
          </div>
          <div className="h-px bg-border" />
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            <p className="text-sm text-foreground mt-1">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}