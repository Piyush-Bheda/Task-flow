import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { DashboardStats, AssignedIssue } from '@/types/dashboard';
import { EmptyState } from './EmptyState';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  open: '#6366f1',
  in_progress: '#f59e0b',
  done: '#10b981',
  backlog: '#6b7280',
};

interface DashboardChartsProps {
  stats: DashboardStats | undefined;
  issues: AssignedIssue[] | undefined;
}

export const DashboardCharts = ({ stats, issues }: DashboardChartsProps) => {
  const statusData = useMemo(() => {
    if (!issues?.length) return [];
    const counts: Record<string, number> = {};
    issues.forEach((issue) => {
      counts[issue.status] = (counts[issue.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
      color: STATUS_COLORS[name] || '#9ca3af',
    }));
  }, [issues]);

  const overviewData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Projects', value: stats.totalProjects },
      { name: 'Issues', value: stats.totalIssues },
      { name: 'Completed', value: stats.completedIssues },
      { name: 'Users', value: stats.activeUsers },
    ];
  }, [stats]);

  if (!stats && !issues?.length) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 min-h-[320px] flex items-center justify-center">
          <EmptyState icon={PieIcon} title="No status data" description="Assign issues to see status distribution." />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 min-h-[320px] flex items-center justify-center">
          <EmptyState icon={BarChart3} title="No analytics yet" description="Dashboard stats will appear here." />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Issue Status Distribution */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-6">Issue Status</h3>
        <div className="h-[280px] w-full">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground capitalize">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState icon={PieIcon} title="No issue data" />
            </div>
          )}
        </div>
      </div>

      {/* Productivity Overview */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-6">Overview</h3>
        <div className="h-[280px] w-full">
          {overviewData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState icon={BarChart3} title="No stats available" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};