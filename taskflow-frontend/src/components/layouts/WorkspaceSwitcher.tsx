import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const WORKSPACES = [
  { id: "1", name: "Development Team" },
  { id: "2", name: "Startup Workspace" },
  { id: "3", name: "Personal" },
];

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export default function WorkspaceSwitcher({ isCollapsed = false }: WorkspaceSwitcherProps) {
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const stored = localStorage.getItem("active_workspace");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return WORKSPACES[0];
      }
    }
    return WORKSPACES[0];
  });

  const handleSelect = (workspace: (typeof WORKSPACES)[0]) => {
    setActiveWorkspace(workspace);
    localStorage.setItem("active_workspace", JSON.stringify(workspace));
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>
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
            <span className="truncate">{activeWorkspace.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[216px]">
        {WORKSPACES.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSelect(workspace)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm">{workspace.name}</span>
            {activeWorkspace.id === workspace.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}