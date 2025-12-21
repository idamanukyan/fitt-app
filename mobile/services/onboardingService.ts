/**
 * Onboarding service for user profile and goals setup
 */
import apiClient from './api';

export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type FitnessLevelType = 'beginner' | 'intermediate' | 'advanced';
export type ActivityLevelType = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType =
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'body_fat_reduction'
  | 'strength_gain'
  | 'endurance'
  | 'flexibility'
  | 'general_fitness';

export interface ProfileData {
  full_name?: string;
  date_of_birth?: string;
  gender?: GenderType;
  height?: number;
  weight?: number;
  fitness_level?: FitnessLevelType;
  activity_level?: ActivityLevelType;
}

export interface GoalData {
  goal_type: GoalType;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  starting_value?: number;
  target_date?: string;
}

export interface ProfileResponse {
  id: number;
  user_id: number;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_level?: string;
  activity_level?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalResponse {
  id: number;
  user_id: number;
  goal_type: string;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  starting_value?: number;
  current_value?: number;
  is_active: boolean;
  is_completed: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export const onboardingService = {
  /**
   * Create or update user profile during onboarding
   */
  async saveProfile(data: ProfileData): Promise<ProfileResponse> {
    const response = await apiClient.post<ProfileResponse>('/onboarding/profile', data);
    return response.data;
  },

  /**
   * Add a goal during onboarding
   */
  async addGoal(data: GoalData): Promise<GoalResponse> {
    const response = await apiClient.post<GoalResponse>('/onboarding/goals', data);
    return response.data;
  },
};
