import api from '@/api/axios';
import { type Project, type CreateProjectInput } from '@/types/projectDetails';

const getWorkspaceId = (): string => {
  try {
    const stored = localStorage.getItem('active_workspace');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.id) return parsed.id;
    }
  } catch {
    // ignore
  }
  return '';
};

const normalizeProject = (raw: any): Project => {
  if (!raw) return raw;
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    description: raw.description ?? null,
    status: raw.status ?? 'active',
    workspaceId: raw.workspace_id ?? raw.workspaceId ?? undefined,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
  };
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      return [];
    }
    try {
      const { data } = await api.get<{ success: boolean; data: any[]; message?: string }>('/api/projects', {
        params: { workspaceId },
      });
      if (!data.success) {
        return [];
      }
      return (data.data || []).map(normalizeProject);
    } catch (e: any) {
      throw e;
    }
  },

  createProject: async (input: CreateProjectInput): Promise<Project> => {
    const workspaceId = input.workspaceId || getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No active workspace. Please select a workspace first.');
    }
    const response = await api.post<{ success: boolean; data: any }>('/api/projects', {
      name: input.name,
      description: input.description ?? null,
      workspaceId,
    });
    if (!response.data.success) {
      throw new Error(response.data.data?.message || 'Failed to create project');
    }
    return normalizeProject(response.data.data);
  },

  getProject: async (id: string): Promise<Project> => {
    const { data } = await api.get<{ success: boolean; data: any }>(`/api/projects/${id}`);
    return normalizeProject(data.data);
  },

  updateProject: async (id: string, input: { name: string; description?: string | null }): Promise<Project> => {
    const response = await api.patch<{ success: boolean; data: any }>(`/api/projects/${id}`, {
      name: input.name,
      description: input.description ?? null,
    });
    if (!response.data.success) {
      throw new Error(response.data.data?.message || 'Failed to update project');
    }
    return normalizeProject(response.data.data);
  },

  deleteProject: async (id: string): Promise<void> => {
    const response = await api.delete<{ success: boolean }>(`/api/projects/${id}`);
    if (!response.data.success) {
      throw new Error('Failed to delete project');
    }
  },
};