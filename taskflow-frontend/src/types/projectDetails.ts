export type ProjectStatus = "active" | "archived" | "completed";
export type ProjectRole = "owner" | "admin" | "member";
export type IssuePriority = "low" | "medium" | "high" | "urgent";
export type IssueStatus = "open" | "in_progress" | "done" | "backlog";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  workspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: {
    id: string;
    name: string;
    email: string;
    initials?: string;
  };
}

export interface ProjectStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  completedIssues: number;
  membersCount: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  workspaceId: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  assigneeId: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  type: "issue_created" | "issue_assigned" | "issue_status_changed" | "member_added" | "member_removed" | "project_updated";
  title: string;
  user: {
    id: string;
    name: string;
    initials: string;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}