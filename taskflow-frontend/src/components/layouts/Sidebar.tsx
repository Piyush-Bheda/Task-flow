import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Settings, Users, PanelLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/issues", label: "Issues", icon: AlertCircle },
  { to: "/members", label: "Members", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const { user } = useAuth();

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : (user?.email ? user.email.trim().charAt(0).toUpperCase() : "U");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-zinc-50 dark:bg-zinc-950 border-r border-border flex flex-col transition-all duration-300 z-30",
        sidebarWidth
      )}
    >
      {/* Logo / Branding */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border bg-background transition-all",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight text-foreground">
            TaskFlow
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden py-6">
        {/* Workspace Switcher */}
        <div className={cn("px-3 mb-6 transition-all", isCollapsed ? "px-2" : "px-3")}>
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3">
          <div className={cn("text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3 transition-opacity", isCollapsed ? "opacity-0" : "opacity-100")}>
            Main Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                  isActive
                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm ring-1 ring-border font-medium"
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-foreground"
                )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", "group-hover:text-foreground")} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="mt-auto px-3 space-y-4">
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-foreground transition-all",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className={cn("h-4 w-4 shrink-0", isCollapsed && "-rotate-180")} />
            {!isCollapsed && <span>Collapse</span>}
          </button>

          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border transition-all",
            isCollapsed ? "justify-center px-0" : ""
          )}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <span className="text-xs font-bold text-primary">{userInitial}</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user?.email || "user@taskflow.com"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}