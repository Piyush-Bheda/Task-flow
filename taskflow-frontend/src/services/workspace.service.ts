import api from '@/api/axios';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export const workspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    try {
      const { data } = await api.get<{ success: boolean; data: Workspace[] }>('/api/workspaces');
      if (!data.success) return [];
      return data.data || [];
    } catch (e) {
      console.error('Error fetching workspaces:', e);
      return [];
    }
  },

  createWorkspace: async (name: string): Promise<Workspace> => {
    const { data } = await api.post<{ success: boolean; data: Workspace }>('/api/workspaces', { name });
    return data.data;
  },
};