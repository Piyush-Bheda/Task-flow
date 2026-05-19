import api from '@/api/axios';
import type { IssuesResponse, Issue, CreateIssueInput, UpdateIssueInput, IssueFilters } from '@/types/issue';

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
    return data;
  },

  getIssue: async (id: string): Promise<Issue> => {
    const { data } = await api.get(`/api/issues/${id}`);
    return data;
  },

  createIssue: async (input: CreateIssueInput): Promise<Issue> => {
    const { data } = await api.post('/api/issues', input);
    return data;
  },

  updateIssue: async (id: string, input: UpdateIssueInput): Promise<Issue> => {
    const { data } = await api.patch(`/api/issues/${id}`, input);
    return data;
  },
};