import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface NavbarProps {
  onMenuClick: () => void;
  collapsedSidebar: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/settings": "Settings",
  "/members": "Members",
};

export default function Navbar({ onMenuClick, collapsedSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarOffset = collapsedSidebar ? "md:ml-16" : "md:ml-[240px]";

  return (
    <header
      className={`sticky top-0 z-40 h-14 border-b border-border bg-background flex items-center justify-between px-4 ${sidebarOffset} transition-all duration-300`}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search - desktop only */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] pl-8 h-9 text-sm bg-muted border-0"
          />
        </div>

        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">U</span>
        </div>

        {/* Logout */}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}