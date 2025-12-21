/**
 * Achievement Types for HyperFit Gamification System
 *
 * TypeScript interfaces matching backend achievement schemas
 */

export enum AchievementCategory {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  CONSISTENCY = 'consistency',
  SOCIAL = 'social',
  PROGRESS = 'progress',
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: AchievementCategory;
  icon_name: string; // Ionicons name
  color: string; // Hex color
  target_value: number;
  xp_reward: number;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User's progress on a specific achievement
 */
export interface UserAchievement {
  id: number;
  user_id: number;
  achievement: Achievement;
  current_progress: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

/**
 * User's activity streak data
 */
export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_active_days: number;
}

/**
 * User's level and XP data
 */
export interface UserLevel {
  level: number;
  current_xp: number;
  total_xp: number;
  xp_to_next_level: number;
}

/**
 * Combined user statistics
 */
export interface UserStats {
  level: UserLevel;
  streak: UserStreak;
  total_achievements: number;
  unlocked_achievements: number;
  achievements_percentage: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  level: number;
  total_xp: number;
  current_xp: number;
}

/**
 * Leaderboard response
 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_users: number;
}

/**
 * Activity tracking request
 */
export interface ActivityTrackRequest {
  activity_type: 'workout' | 'meal' | 'photo' | 'measurement';
  activity_count?: number;
}

/**
 * Activity tracking response
 */
export interface ActivityTrackResponse {
  message: string;
  stats: UserStats;
  unlocked_achievements: AchievementUnlockNotification[];
  leveled_up: boolean;
  new_level: number | null;
  xp_earned: number;
}

/**
 * Achievement unlock notification
 */
export interface AchievementUnlockNotification {
  achievement: Achievement;
  xp_earned: number;
  new_level: number | null;
  message: string;
}

/**
 * Achievement filter options
 */
export interface AchievementFilters {
  category?: AchievementCategory;
  showUnlockedOnly?: boolean;
  showLockedOnly?: boolean;
}
