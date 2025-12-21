/**
 * Goal service for fitness goals management
 */
import apiClient from './api';
import type { Goal, GoalCreateData, GoalProgressUpdate } from '../types/api.types';

export const goalService = {
  /**
   * Get all goals for current user
   */
  async getGoals(skip: number = 0, limit: number = 20): Promise<Goal[]> {
    const response = await apiClient.get<Goal[]>('/goals/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get active goals only
   */
  async getActiveGoals(): Promise<Goal[]> {
    const response = await apiClient.get<Goal[]>('/goals/active');
    return response.data;
  },

  /**
   * Create new goal
   */
  async createGoal(data: GoalCreateData): Promise<Goal> {
    const response = await apiClient.post<Goal>('/goals/', data);
    return response.data;
  },

  /**
   * Get specific goal by ID
   */
  async getGoal(id: number): Promise<Goal> {
    const response = await apiClient.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  /**
   * Update goal
   */
  async updateGoal(id: number, data: Partial<GoalCreateData>): Promise<Goal> {
    const response = await apiClient.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  /**
   * Update goal progress
   */
  async updateProgress(id: number, data: GoalProgressUpdate): Promise<Goal> {
    const response = await apiClient.put<Goal>(`/goals/${id}/progress`, data);
    return response.data;
  },

  /**
   * Mark goal as complete
   */
  async completeGoal(id: number): Promise<Goal> {
    const response = await apiClient.post<Goal>(`/goals/${id}/complete`);
    return response.data;
  },

  /**
   * Delete goal
   */
  async deleteGoal(id: number): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },
};
