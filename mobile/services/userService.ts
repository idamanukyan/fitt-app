/**
 * User service for user data and statistics
 */
import apiClient from './api';
import type { User, UserStats } from '../types/api.types';

export const userService = {
  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/users/me');
    return response.data;
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/api/v1/users/me/stats');
    return response.data;
  },

  /**
   * Update current user
   */
  async updateUser(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/api/v1/users/me', data);
    return response.data;
  },
};
