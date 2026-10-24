import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, LogOut, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/settings": "Settings",
  "/members": "Members",
  "/issues": "Issues",
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Workspace";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6"
    >
      {/* Left: Navigation & Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search - desktop only */}
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <Input
            type="search"
            placeholder="Search for issues or projects... (⌘K)"
            className="w-64 pl-9 h-9 text-sm bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-background focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="h-px w-px bg-border mx-1 hidden sm:block" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}