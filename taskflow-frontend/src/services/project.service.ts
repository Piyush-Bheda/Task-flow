import api from '@/api/axios';
import { type Project, type CreateProjectInput } from '@/types/project';

const getWorkspaceId = (): string => {
  try {
    const stored = localStorage.getItem('active_workspace');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Active workspace:', parsed);
      return parsed.id;
    }
  } catch (e) {
    console.error('Error parsing workspace:', e);
  }
  return '';
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const workspaceId = getWorkspaceId();
    console.log('Fetching projects for workspace:', workspaceId);
    if (!workspaceId) {
      console.warn('No workspace ID found');
      return [];
    }
    try {
      const { data } = await api.get<{ success: boolean; data: Project[]; message?: string }>('/api/projects', {
        params: { workspaceId },
      });
      console.log('Projects response:', data);
      if (!data.success) {
        console.error('Failed to fetch projects:', data.message);
        return [];
      }
      return data.data || [];
    } catch (e: any) {
      console.error('Error fetching projects:', e.response?.data || e.message);
      throw e;
    }
  },

  createProject: async (input: CreateProjectInput): Promise<Project> => {
    const workspaceId = getWorkspaceId();
    const response = await api.post<{ success: boolean; data: Project }>('/api/projects', {
      ...input,
      workspaceId,
    });
    return response.data.data;
  },
};