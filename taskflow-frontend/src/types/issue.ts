export type IssueStatus = 'todo' | 'in-progress' | 'done';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Assignee {
  id: string;
  name: string;
  initials: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: Assignee | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssuesResponse {
  data: Issue[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

export interface IssueFilters {
  projectId?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  priority: IssuePriority;
  assigneeId?: string;
  projectId: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
}