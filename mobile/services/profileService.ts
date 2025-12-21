/**
 * Profile service for user profile management
 */
import apiClient from './api';
import type { UserProfile, ProfileUpdateData } from '../types/api.types';

export const profileService = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/profile/me');
    return response.data;
  },

  /**
   * Create or update profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/profile/me', data);
    return response.data;
  },

  /**
   * Update profile (PUT method)
   */
  async putProfile(data: ProfileUpdateData): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/profile/me', data);
    return response.data;
  },
};
