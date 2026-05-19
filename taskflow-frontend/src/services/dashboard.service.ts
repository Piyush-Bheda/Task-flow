import api from '@/api/axios';
import { type DashboardStats, type Activity, type AssignedIssue } from '@/types/dashboard';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardStats; message?: string }>('/api/dashboard/stats');
      console.log('getStats response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('getStats error:', error.response?.data || error.message);
      throw error;
    }
  },

  getRecentActivity: async (): Promise<Activity[]> => {
    try {
      const response = await api.get<{ success: boolean; data: Activity[]; message?: string }>('/api/activity/recent');
      console.log('getRecentActivity response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch activity');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('getRecentActivity error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAssignedIssues: async (): Promise<AssignedIssue[]> => {
    try {
      const response = await api.get<{ success: boolean; data: AssignedIssue[]; message?: string }>('/api/issues/assigned');
      console.log('getAssignedIssues response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch issues');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('getAssignedIssues error:', error.response?.data || error.message);
      throw error;
    }
  },
};