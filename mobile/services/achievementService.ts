/**
 * Achievement Service
 *
 * API integration for achievement and gamification features
 */
import apiClient from './api';
import {
  Achievement,
  UserAchievement,
  UserStats,
  LeaderboardResponse,
  AchievementCategory,
  ActivityTrackRequest,
  ActivityTrackResponse,
} from '../types/achievement.types';

/**
 * Achievement Service API
 */
export const achievementService = {
  /**
   * Get all achievements (with user progress if authenticated)
   */
  getAchievements: async (category?: AchievementCategory): Promise<UserAchievement[]> => {
    try {
      const params = category ? { category } : {};
      const response = await apiClient.get<UserAchievement[]>('/api/achievements', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  /**
   * Get user's achievement statistics (level, streak, counts)
   */
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get<UserStats>('/api/achievements/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  /**
   * Get user's unlocked achievements only
   */
  getUnlockedAchievements: async (): Promise<UserAchievement[]> => {
    try {
      const response = await apiClient.get<UserAchievement[]>('/api/achievements/user/unlocked');
      return response.data;
    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
      throw error;
    }
  },

  /**
   * Track user activity (workout, meal, photo, measurement)
   * This triggers achievement checks and streak updates
   */
  trackActivity: async (
    activityType: 'workout' | 'meal' | 'photo' | 'measurement',
    activityCount: number = 1
  ): Promise<ActivityTrackResponse> => {
    try {
      const requestData: ActivityTrackRequest = {
        activity_type: activityType,
        activity_count: activityCount,
      };

      const response = await apiClient.post<ActivityTrackResponse>(
        '/api/achievements/track',
        requestData
      );
      return response.data;
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  },

  /**
   * Get leaderboard of top users
   */
  getLeaderboard: async (limit: number = 50): Promise<LeaderboardResponse> => {
    try {
      const response = await apiClient.get<LeaderboardResponse>('/api/achievements/leaderboard', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get achievements by category (local filtering)
   */
  filterAchievementsByCategory: (
    achievements: UserAchievement[],
    category: AchievementCategory | 'all'
  ): UserAchievement[] => {
    if (category === 'all') {
      return achievements;
    }
    return achievements.filter((ua) => ua.achievement.category === category);
  },

  /**
   * Get achievements by unlock status (local filtering)
   */
  filterAchievementsByStatus: (
    achievements: UserAchievement[],
    status: 'all' | 'unlocked' | 'locked'
  ): UserAchievement[] => {
    if (status === 'all') {
      return achievements;
    }
    if (status === 'unlocked') {
      return achievements.filter((ua) => ua.is_unlocked);
    }
    return achievements.filter((ua) => !ua.is_unlocked);
  },

  /**
   * Calculate progress percentage for an achievement
   */
  calculateProgress: (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  },

  /**
   * Format XP number with commas
   */
  formatXP: (xp: number): string => {
    return xp.toLocaleString();
  },

  /**
   * Get progress text (e.g., "7 / 10")
   */
  getProgressText: (current: number, target: number): string => {
    return `${current} / ${target}`;
  },

  /**
   * Check if user is close to unlocking (within 20%)
   */
  isCloseToUnlock: (current: number, target: number): boolean => {
    const progress = (current / target) * 100;
    return progress >= 80 && progress < 100;
  },
};

export default achievementService;
