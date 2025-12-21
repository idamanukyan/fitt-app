/**
 * Gamification Type Definitions
 * Types for XP, levels, achievements, streaks, and challenges
 */

// XP reward categories
export type XPActivityType =
  | 'workout_completed'
  | 'set_completed'
  | 'personal_record'
  | 'perfect_form_set'
  | 'streak_day'
  | 'ai_session_completed'
  | 'challenge_completed'
  | 'achievement_unlocked'
  | 'first_workout_of_day'
  | 'weekly_goal_met';

// XP reward configuration
export interface XPRewardConfig {
  activityType: XPActivityType;
  baseXP: number;
  multiplierConditions?: XPMultiplier[];
}

export interface XPMultiplier {
  condition: string;
  multiplier: number;
  description: string;
}

// Level system
export interface LevelThreshold {
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  badge: string; // Icon name or emoji
  color: string;
  perks?: string[];
}

// User's gamification state
export interface GamificationState {
  userId: string;
  currentXP: number;
  totalXPEarned: number;
  level: number;
  levelProgress: number; // 0-1 progress to next level
  xpToNextLevel: number;
  currentLevelInfo: LevelThreshold;

  // Streak info
  currentStreak: TrainingStreak;
  bestStreak: number;

  // Achievements
  unlockedAchievements: TrainingAchievement[];
  achievementProgress: AchievementProgress[];

  // Active challenges
  activeChallenges: Challenge[];
  completedChallengesCount: number;

  // Stats
  totalWorkoutsCompleted: number;
  totalAISessionsCompleted: number;
  totalPRsAchieved: number;

  // Recent activity
  recentXPGains: XPGainEvent[];
}

// XP gain event for history
export interface XPGainEvent {
  id: string;
  activityType: XPActivityType;
  xpAmount: number;
  description: string;
  timestamp: string;
  workoutId?: string;
  exerciseId?: string;
}

// Training streak
export interface TrainingStreak {
  currentDays: number;
  startDate: string;
  lastWorkoutDate: string;
  isActive: boolean;
  freezesAvailable: number;
  freezesUsed: number;
  longestStreak: number;
  weeklyGoal: number; // workouts per week
  weeklyProgress: number;
}

// Achievement categories
export type AchievementCategory =
  | 'consistency'
  | 'strength'
  | 'volume'
  | 'form'
  | 'exploration'
  | 'social'
  | 'special';

// Achievement rarity
export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

// Achievement definition
export interface TrainingAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  unlockedAt: string | null;
  isUnlocked: boolean;
  isSecret: boolean; // Hidden until unlocked
  requirement: AchievementRequirement;
}

// Achievement requirement types
export interface AchievementRequirement {
  type: 'count' | 'streak' | 'threshold' | 'combination';
  target: number;
  metric: string;
  conditions?: string[];
}

// Achievement progress tracking
export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  lastUpdated: string;
}

// Challenge types
export type ChallengeType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special';

export type ChallengeStatus =
  | 'active'
  | 'completed'
  | 'failed'
  | 'expired';

// Challenge definition
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  xpReward: number;
  requirement: ChallengeRequirement;
  progress: number; // 0-1
  currentValue: number;
  targetValue: number;
  startDate: string;
  endDate: string;
  completedAt: string | null;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Challenge requirement
export interface ChallengeRequirement {
  metric: string;
  target: number;
  unit?: string;
  exerciseId?: string;
  muscleGroup?: string;
}

// Leaderboard entry (future social feature)
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

// XP configuration constants
export const XP_REWARDS: Record<XPActivityType, number> = {
  workout_completed: 100,
  set_completed: 5,
  personal_record: 50,
  perfect_form_set: 25,
  streak_day: 20,
  ai_session_completed: 150,
  challenge_completed: 200,
  achievement_unlocked: 100,
  first_workout_of_day: 25,
  weekly_goal_met: 150,
};

// Level thresholds
export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minXP: 0, maxXP: 499, title: 'Beginner', badge: 'fitness-outline', color: '#9CA3AF' },
  { level: 2, minXP: 500, maxXP: 1499, title: 'Novice', badge: 'body-outline', color: '#60A5FA' },
  { level: 3, minXP: 1500, maxXP: 3499, title: 'Intermediate', badge: 'barbell-outline', color: '#4ADE80' },
  { level: 4, minXP: 3500, maxXP: 6999, title: 'Advanced', badge: 'flame-outline', color: '#FBBF24' },
  { level: 5, minXP: 7000, maxXP: 11999, title: 'Expert', badge: 'star-outline', color: '#F97316' },
  { level: 6, minXP: 12000, maxXP: 19999, title: 'Elite', badge: 'trophy-outline', color: '#A78BFA' },
  { level: 7, minXP: 20000, maxXP: 34999, title: 'Master', badge: 'diamond-outline', color: '#EC4899' },
  { level: 8, minXP: 35000, maxXP: 59999, title: 'Champion', badge: 'medal-outline', color: '#EF4444' },
  { level: 9, minXP: 60000, maxXP: 99999, title: 'Legend', badge: 'shield-checkmark-outline', color: '#14B8A6' },
  { level: 10, minXP: 100000, maxXP: Infinity, title: 'Titan', badge: 'planet-outline', color: '#FFD700' },
];

// Utility function to get level from XP
export const getLevelFromXP = (xp: number): LevelThreshold => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXP) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
};

// Utility function to calculate level progress
export const calculateLevelProgress = (xp: number): { progress: number; xpToNext: number } => {
  const currentLevel = getLevelFromXP(xp);
  const xpInLevel = xp - currentLevel.minXP;
  const levelRange = currentLevel.maxXP - currentLevel.minXP;

  if (levelRange === Infinity) {
    return { progress: 1, xpToNext: 0 };
  }

  return {
    progress: xpInLevel / levelRange,
    xpToNext: currentLevel.maxXP - xp + 1,
  };
};
