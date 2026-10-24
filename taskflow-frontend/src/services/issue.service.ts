import api from '@/api/axios';
import type { IssuesResponse, Issue, CreateIssueInput, UpdateIssueInput, IssueFilters, IssueStatus, IssuePriority } from '@/types/issue';

const STATUS_MAP: Record<string, IssueStatus> = {
  'Open': 'todo',
  'todo': 'todo',
  'In Progress': 'in-progress',
  'in-progress': 'in-progress',
  'Done': 'done',
  'done': 'done',
  'Closed': 'done',
};

const PRIORITY_MAP: Record<string, IssuePriority> = {
  'Low': 'low',
  'low': 'low',
  'Medium': 'medium',
  'medium': 'medium',
  'High': 'high',
  'high': 'high',
  'Critical': 'critical',
  'critical': 'critical',
  'Urgent': 'urgent',
  'urgent': 'urgent',
};

function normalizeIssue(issue: any): Issue {
  return {
    ...issue,
    status: STATUS_MAP[issue.status] || 'todo',
    priority: PRIORITY_MAP[issue.priority] || 'medium',
  };
}

export const issueService = {
  getIssues: async (filters: IssueFilters): Promise<IssuesResponse> => {
    const params: Record<string, string | number> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.assigneeId) params.assigneeId = filters.assigneeId;
    if (filters.search?.trim()) params.search = filters.search.trim();

    const { data } = await api.get('/api/issues', { params });

    return {
      ...data,
      data: data.data.map(normalizeIssue),
    };
  },

  getIssue: async (id: string): Promise<Issue> => {
    const { data } = await api.get(`/api/issues/${id}`);
    return normalizeIssue(data);
  },

  createIssue: async (input: CreateIssueInput): Promise<Issue> => {
    const { data } = await api.post('/api/issues', input);
    return normalizeIssue(data);
  },

  updateIssue: async (id: string, input: UpdateIssueInput): Promise<Issue> => {
    const { data } = await api.patch(`/api/issues/${id}`, input);
    return normalizeIssue(data);
  },
};
