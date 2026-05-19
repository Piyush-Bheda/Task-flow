import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { projectService } from '@/services/project.service';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ProjectSkeleton } from '@/components/projects/ProjectSkeleton';
import { EmptyProjects } from '@/components/projects/EmptyProjects';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Failed to load projects</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
          Could not fetch your projects. Please try again.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your workspace projects
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <EmptyProjects onCreateClick={() => setIsModalOpen(true)} />
      )}

      <CreateProjectModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}