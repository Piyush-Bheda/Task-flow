import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";

export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    return stored === "true";
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuClick = () => setIsMobileOpen(true);
  const handleMobileClose = () => setIsMobileOpen(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex flex-col gap-3 p-4 w-[240px] h-screen border-r border-border">
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-full rounded-md bg-muted animate-pulse mt-4" />
          <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
        </div>
        {/* Main area skeleton */}
        <div className="flex flex-col flex-1">
          <div className="h-14 w-full border-b border-border bg-muted animate-pulse" />
          <div className="flex-1 p-6 space-y-4">
            <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => {
          const next = !isCollapsed;
          setIsCollapsed(next);
          localStorage.setItem("sidebar_collapsed", String(next));
        }} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} onClose={handleMobileClose} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar
          onMenuClick={handleMenuClick}
          collapsedSidebar={isCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}