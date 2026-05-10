import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Settings, Users, PanelLeft } from "lucide-react";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/members", label: "Members", icon: Users },
];

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const sidebarWidth = isCollapsed ? "w-16" : "w-[240px]";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-background border-r border-border flex flex-col transition-all duration-300 z-30`}
    >
      {/* [A] Logo / Branding */}
      <div className={`flex items-center h-14 px-4 border-b border-border ${isCollapsed ? "justify-center" : ""}`}>
        <span className={`font-semibold text-lg text-foreground ${isCollapsed ? "hidden" : "block"}`}>
          AppName
        </span>
        {isCollapsed && (
          <span className="font-semibold text-lg text-foreground">A</span>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden py-4">
        {/* [B] Workspace Switcher */}
        <div className={`px-3 mb-4 ${isCollapsed ? "px-2" : "px-3"}`}>
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* [C] Navigation Links */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* [D] Collapse Toggle */}
        <div className={`px-3 mt-auto ${isCollapsed ? "px-2" : "px-3"}`}>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* [E] Sidebar Footer */}
        <div className={`mt-2 px-3 pt-3 border-t border-border ${isCollapsed ? "px-2" : "px-3"}`}>
          <div className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-muted-foreground">U</span>
            </div>
            {!isCollapsed && (
              <span className="text-sm text-muted-foreground truncate">
                user@example.com
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}