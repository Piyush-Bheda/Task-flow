import { useQuery } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboard.service';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { AssignedIssues } from '@/components/dashboard/AssignedIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FolderKanban, AlertCircle, CheckCircle2, Users, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const {
    data: activities,
    isLoading: activityLoading,
    error: activityError,
  } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: dashboardService.getRecentActivity,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const {
    data: issues,
    isLoading: issuesLoading,
    error: issuesError,
  } = useQuery({
    queryKey: ['assigned-issues'],
    queryFn: dashboardService.getAssignedIssues,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const isLoading = statsLoading || activityLoading || issuesLoading;
  const hasError = statsError || activityError || issuesError;

  console.log('Dashboard debug:', { statsLoading, activityLoading, issuesLoading, statsError: statsError?.message, activityError: activityError?.message, issuesError: issuesError?.message, stats, activities, issues });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // If there's an error, check if it's because user has no workspace
  if (hasError) {
    const errorMsg = (statsError || activityError || issuesError)?.message || '';
    if (errorMsg.includes('workspace') || errorMsg.includes('No workspace')) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <FolderKanban className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No Workspace Found</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
            You don't have access to any workspace yet. Contact your administrator.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
          {errorMsg || "We couldn't fetch your dashboard data. This might be a temporary issue."}
        </p>
        <Button onClick={() => { refetchStats(); window.location.reload(); }}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your workspace</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStats()}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={FolderKanban} 
          label="Total Projects" 
          value={stats?.totalProjects ?? 0} 
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          icon={AlertCircle} 
          label="Total Issues" 
          value={stats?.totalIssues ?? 0} 
          trend={{ value: 8, isPositive: false }}
        />
        <StatsCard 
          icon={CheckCircle2} 
          label="Completed" 
          value={stats?.completedIssues ?? 0} 
          trend={{ value: 24, isPositive: true }}
        />
        <StatsCard 
          icon={Users} 
          label="Active Users" 
          value={stats?.activeUsers ?? 0} 
        />
      </div>

      {/* Charts */}
      <DashboardCharts stats={stats} issues={issues} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList activities={activities} />
        <AssignedIssues issues={issues} />
      </div>
    </div>
  );
}