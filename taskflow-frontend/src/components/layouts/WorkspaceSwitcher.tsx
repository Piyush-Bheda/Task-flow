import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { workspaceService, type Workspace } from "@/services/workspace.service";

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export default function WorkspaceSwitcher({ isCollapsed = false }: WorkspaceSwitcherProps) {
  const { data: workspaces, isLoading, refetch } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.getWorkspaces,
    staleTime: 5 * 60 * 1000,
  });

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const createWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ success: boolean; data: Workspace }>('/api/workspaces/seed');
      return data.data;
    },
    onSuccess: (newWorkspace) => {
      refetch();
      setActiveWorkspace(newWorkspace);
      localStorage.setItem("active_workspace", JSON.stringify(newWorkspace));
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("active_workspace");
    if (stored) {
      try {
        setActiveWorkspace(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (workspaces?.length && !activeWorkspace) {
      const first = workspaces[0];
      setActiveWorkspace(first);
      localStorage.setItem("active_workspace", JSON.stringify(first));
    }
  }, [workspaces, activeWorkspace]);

  const handleSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem("active_workspace", JSON.stringify(workspace));
  };

  const handleCreateWorkspace = () => {
    createWorkspaceMutation.mutate();
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-9">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspaces?.length) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-2 text-sm"
        onClick={handleCreateWorkspace}
        disabled={createWorkspaceMutation.isPending}
      >
        {createWorkspaceMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Create Workspace
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 h-9 text-sm font-normal"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="truncate">{activeWorkspace?.name || 'Select workspace'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[216px]">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSelect(workspace)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm">{workspace.name}</span>
            {activeWorkspace?.id === workspace.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}