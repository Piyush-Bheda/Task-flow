import api from '@/api/axios';
import type { Project, ProjectMember, ProjectStats, Issue, Activity, IssueStatus, IssuePriority } from '@/types/projectDetails';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface AddMemberInput {
  email?: string;
  userId?: string;
  role?: "admin" | "member";
}

export const projectDetailsService = {
  // Get project details
  async getProject(projectId: string): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(`/api/projects/${projectId}`);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to fetch project");
    }
    return response.data.data;
  },

  // Update project
  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    const response = await api.patch<ApiResponse<Project>>(`/api/projects/${projectId}`, data);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to update project");
    }
    return response.data.data;
  },

  // Get project stats
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    const response = await api.get<ApiResponse<ProjectStats>>(`/api/projects/${projectId}/stats`);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to fetch project stats");
    }
    return response.data.data;
  },

  // Project Members
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await api.get<ApiResponse<ProjectMember[]>>(`/api/projects/${projectId}/members`);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to fetch project members");
    }
    return response.data.data;
  },

  async getProjectMemberRole(projectId: string): Promise<{ role: string }> {
    const response = await api.get<ApiResponse<{ role: string }>>(`/api/projects/${projectId}/members/role`);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to fetch user role");
    }
    return response.data.data;
  },

  async addProjectMember(projectId: string, input: AddMemberInput): Promise<ProjectMember> {
    const response = await api.post<ApiResponse<ProjectMember>>(`/api/projects/${projectId}/members`, input);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to add member");
    }
    return response.data.data;
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/api/projects/${projectId}/members/${userId}`);
    if (!response.data?.success) {
      throw new Error("Failed to remove member");
    }
  },

  // Project Issues
  async getProjectIssues(projectId: string, filters?: {
    status?: IssueStatus;
    priority?: IssuePriority;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ issues: Issue[]; total: number }> {
    const response = await api.get<ApiResponse<{ issues: Issue[]; total: number }>>(`/api/projects/${projectId}/issues`, { params: filters });
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to fetch issues");
    }
    return response.data.data;
  },

  // Project Activity
  async getProjectActivity(projectId: string): Promise<Activity[]> {
    const response = await api.get<ApiResponse<Activity[]>>(`/api/projects/${projectId}/activity`);
    if (!response.data?.success || !response.data?.data) {
      throw new Error("Failed to fetch activity");
    }
    return response.data.data;
  },
};