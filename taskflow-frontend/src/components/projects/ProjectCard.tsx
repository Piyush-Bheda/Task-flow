import { useNavigate } from 'react-router-dom';
import { FolderKanban, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5 shadow-sm",
        "hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FolderKanban className="h-5 w-5 text-primary" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {project.name}
      </h3>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {project.description || "No description provided"}
      </p>
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>0 issues</span>
        <span>•</span>
        <span>Updated recently</span>
      </div>
    </div>
  );
};