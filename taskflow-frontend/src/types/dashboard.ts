export interface DashboardStats {
  totalProjects: number;
  totalIssues: number;
  completedIssues: number;
  activeUsers: number;
}

export interface Activity {
  id: string;
  type: 'issue_updated' | 'project_created' | 'comment_added' | 'issue_completed';
  title: string;
  user: {
    name: string;
    initials: string;
  };
  timestamp: string;
}

export interface AssignedIssue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'done' | 'backlog';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectName: string;
  dueDate?: string;
}