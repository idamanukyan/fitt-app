/**
 * Gamification Mock Data
 * Sample data for XP, levels, achievements, streaks, and challenges
 */

import type {
  GamificationState,
  TrainingStreak,
  TrainingAchievement,
  AchievementProgress,
  Challenge,
  XPGainEvent,
  LeaderboardEntry,
} from '../types/gamification.types';
import { getLevelFromXP, calculateLevelProgress } from '../types/gamification.types';

// Generate dates
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Current streak data
export const mockTrainingStreak: TrainingStreak = {
  currentDays: 7,
  startDate: getDateString(6),
  lastWorkoutDate: getDateString(0),
  isActive: true,
  freezesAvailable: 2,
  freezesUsed: 0,
  longestStreak: 14,
  weeklyGoal: 4,
  weeklyProgress: 3,
};

// Recent XP gains
export const mockRecentXPGains: XPGainEvent[] = [
  {
    id: 'xp-1',
    activityType: 'workout_completed',
    xpAmount: 100,
    description: 'Completed Push Day workout',
    timestamp: getDateString(0),
    workoutId: 'workout-125',
  },
  {
    id: 'xp-2',
    activityType: 'personal_record',
    xpAmount: 50,
    description: 'New PR on Deadlift!',
    timestamp: getDateString(0),
    workoutId: 'workout-125',
    exerciseId: 'deadlift',
  },
  {
    id: 'xp-3',
    activityType: 'streak_day',
    xpAmount: 20,
    description: '7-day streak bonus',
    timestamp: getDateString(0),
  },
  {
    id: 'xp-4',
    activityType: 'ai_session_completed',
    xpAmount: 150,
    description: 'AI Coach session: Bicep Curls',
    timestamp: getDateString(1),
    exerciseId: 'bicep-curl',
  },
  {
    id: 'xp-5',
    activityType: 'perfect_form_set',
    xpAmount: 25,
    description: 'Perfect form on Bench Press',
    timestamp: getDateString(1),
    exerciseId: 'bench-press',
  },
  {
    id: 'xp-6',
    activityType: 'first_workout_of_day',
    xpAmount: 25,
    description: 'First workout of the day bonus',
    timestamp: getDateString(1),
  },
  {
    id: 'xp-7',
    activityType: 'achievement_unlocked',
    xpAmount: 100,
    description: 'Achievement: Iron Lifter',
    timestamp: getDateString(2),
  },
];

// Achievements
export const mockAchievements: TrainingAchievement[] = [
  // Consistency
  {
    id: 'ach-streak-7',
    name: 'Week Warrior',
    description: 'Complete a 7-day workout streak',
    category: 'consistency',
    rarity: 'common',
    icon: 'flame',
    xpReward: 100,
    unlockedAt: getDateString(0),
    isUnlocked: true,
    isSecret: false,
    requirement: { type: 'streak', target: 7, metric: 'consecutive_days' },
  },
  {
    id: 'ach-streak-14',
    name: 'Fortnight Fighter',
    description: 'Complete a 14-day workout streak',
    category: 'consistency',
    rarity: 'uncommon',
    icon: 'flame',
    xpReward: 200,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: false,
    requirement: { type: 'streak', target: 14, metric: 'consecutive_days' },
  },
  {
    id: 'ach-streak-30',
    name: 'Monthly Master',
    description: 'Complete a 30-day workout streak',
    category: 'consistency',
    rarity: 'rare',
    icon: 'flame',
    xpReward: 500,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: false,
    requirement: { type: 'streak', target: 30, metric: 'consecutive_days' },
  },

  // Strength
  {
    id: 'ach-first-pr',
    name: 'Record Breaker',
    description: 'Set your first personal record',
    category: 'strength',
    rarity: 'common',
    icon: 'trophy',
    xpReward: 50,
    unlockedAt: getDateString(10),
    isUnlocked: true,
    isSecret: false,
    requirement: { type: 'count', target: 1, metric: 'personal_records' },
  },
  {
    id: 'ach-iron-lifter',
    name: 'Iron Lifter',
    description: 'Lift 10,000 kg total volume',
    category: 'strength',
    rarity: 'uncommon',
    icon: 'barbell',
    xpReward: 150,
    unlockedAt: getDateString(2),
    isUnlocked: true,
    isSecret: false,
    requirement: { type: 'threshold', target: 10000, metric: 'total_volume' },
  },
  {
    id: 'ach-steel-titan',
    name: 'Steel Titan',
    description: 'Lift 100,000 kg total volume',
    category: 'strength',
    rarity: 'epic',
    icon: 'barbell',
    xpReward: 500,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: false,
    requirement: { type: 'threshold', target: 100000, metric: 'total_volume' },
  },

  // Form
  {
    id: 'ach-perfect-set',
    name: 'Perfect Execution',
    description: 'Complete a set with 95%+ form score',
    category: 'form',
    rarity: 'common',
    icon: 'checkmark-done',
    xpReward: 75,
    unlockedAt: getDateString(1),
    isUnlocked: true,
    isSecret: false,
    requirement: { type: 'threshold', target: 95, metric: 'form_score' },
  },
  {
    id: 'ach-form-master',
    name: 'Form Master',
    description: 'Average 85%+ form score over 20 AI sessions',
    category: 'form',
    rarity: 'rare',
    icon: 'star',
    xpReward: 300,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: false,
    requirement: { type: 'combination', target: 85, metric: 'avg_form_score', conditions: ['min_sessions:20'] },
  },

  // Exploration
  {
    id: 'ach-first-ai',
    name: 'AI Initiate',
    description: 'Complete your first AI Coach session',
    category: 'exploration',
    rarity: 'common',
    icon: 'sparkles',
    xpReward: 100,
    unlockedAt: getDateString(5),
    isUnlocked: true,
    isSecret: false,
    requirement: { type: 'count', target: 1, metric: 'ai_sessions' },
  },
  {
    id: 'ach-variety',
    name: 'Variety Seeker',
    description: 'Perform 20 different exercises',
    category: 'exploration',
    rarity: 'uncommon',
    icon: 'shuffle',
    xpReward: 150,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: false,
    requirement: { type: 'count', target: 20, metric: 'unique_exercises' },
  },

  // Special / Secret
  {
    id: 'ach-early-bird',
    name: 'Early Bird',
    description: 'Complete a workout before 6 AM',
    category: 'special',
    rarity: 'rare',
    icon: 'sunny',
    xpReward: 200,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: true,
    requirement: { type: 'count', target: 1, metric: 'early_workout' },
  },
  {
    id: 'ach-night-owl',
    name: 'Night Owl',
    description: 'Complete a workout after 10 PM',
    category: 'special',
    rarity: 'rare',
    icon: 'moon',
    xpReward: 200,
    unlockedAt: null,
    isUnlocked: false,
    isSecret: true,
    requirement: { type: 'count', target: 1, metric: 'late_workout' },
  },
];

// Achievement progress tracking
export const mockAchievementProgress: AchievementProgress[] = [
  {
    achievementId: 'ach-streak-14',
    currentValue: 7,
    targetValue: 14,
    percentage: 50,
    lastUpdated: getDateString(0),
  },
  {
    achievementId: 'ach-streak-30',
    currentValue: 7,
    targetValue: 30,
    percentage: 23,
    lastUpdated: getDateString(0),
  },
  {
    achievementId: 'ach-steel-titan',
    currentValue: 69000,
    targetValue: 100000,
    percentage: 69,
    lastUpdated: getDateString(0),
  },
  {
    achievementId: 'ach-form-master',
    currentValue: 8,
    targetValue: 20,
    percentage: 40,
    lastUpdated: getDateString(0),
  },
  {
    achievementId: 'ach-variety',
    currentValue: 14,
    targetValue: 20,
    percentage: 70,
    lastUpdated: getDateString(0),
  },
];

// Active challenges
export const mockChallenges: Challenge[] = [
  {
    id: 'challenge-daily-1',
    name: 'Volume Crusher',
    description: 'Lift 15,000 kg today',
    type: 'daily',
    status: 'active',
    xpReward: 75,
    requirement: { metric: 'daily_volume', target: 15000, unit: 'kg' },
    progress: 0.67,
    currentValue: 10000,
    targetValue: 15000,
    startDate: getDateString(0),
    endDate: new Date().toISOString(),
    completedAt: null,
    icon: 'barbell',
    difficulty: 'medium',
  },
  {
    id: 'challenge-daily-2',
    name: 'Form Focus',
    description: 'Complete 3 sets with 90%+ form score',
    type: 'daily',
    status: 'active',
    xpReward: 50,
    requirement: { metric: 'high_form_sets', target: 3 },
    progress: 0.33,
    currentValue: 1,
    targetValue: 3,
    startDate: getDateString(0),
    endDate: new Date().toISOString(),
    completedAt: null,
    icon: 'checkmark-circle',
    difficulty: 'easy',
  },
  {
    id: 'challenge-weekly-1',
    name: 'Leg Week',
    description: 'Complete 4 leg workouts this week',
    type: 'weekly',
    status: 'active',
    xpReward: 200,
    requirement: { metric: 'muscle_group_workouts', target: 4, muscleGroup: 'Legs' },
    progress: 0.25,
    currentValue: 1,
    targetValue: 4,
    startDate: getDateString(6),
    endDate: getDateString(-1),
    completedAt: null,
    icon: 'fitness',
    difficulty: 'hard',
  },
  {
    id: 'challenge-weekly-2',
    name: 'Streak Keeper',
    description: 'Work out every day this week',
    type: 'weekly',
    status: 'active',
    xpReward: 150,
    requirement: { metric: 'weekly_workout_days', target: 7 },
    progress: 0.71,
    currentValue: 5,
    targetValue: 7,
    startDate: getDateString(6),
    endDate: getDateString(-1),
    completedAt: null,
    icon: 'flame',
    difficulty: 'hard',
  },
];

// Full gamification state
const currentXP = 3750;
const levelInfo = getLevelFromXP(currentXP);
const levelProgress = calculateLevelProgress(currentXP);

export const mockGamificationState: GamificationState = {
  userId: 'user-123',
  currentXP,
  totalXPEarned: 4250, // Including spent XP
  level: levelInfo.level,
  levelProgress: levelProgress.progress,
  xpToNextLevel: levelProgress.xpToNext,
  currentLevelInfo: levelInfo,

  currentStreak: mockTrainingStreak,
  bestStreak: 14,

  unlockedAchievements: mockAchievements.filter((a) => a.isUnlocked),
  achievementProgress: mockAchievementProgress,

  activeChallenges: mockChallenges,
  completedChallengesCount: 23,

  totalWorkoutsCompleted: 45,
  totalAISessionsCompleted: 12,
  totalPRsAchieved: 8,

  recentXPGains: mockRecentXPGains,
};

// Leaderboard (future social feature)
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-456',
    username: 'FitnessPro',
    avatarUrl: undefined,
    level: 7,
    totalXP: 24500,
    weeklyXP: 1850,
    currentStreak: 28,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: 'user-789',
    username: 'GymRat99',
    avatarUrl: undefined,
    level: 6,
    totalXP: 18200,
    weeklyXP: 1420,
    currentStreak: 21,
    isCurrentUser: false,
  },
  {
    rank: 3,
    userId: 'user-123',
    username: 'You',
    avatarUrl: undefined,
    level: 4,
    totalXP: 3750,
    weeklyXP: 520,
    currentStreak: 7,
    isCurrentUser: true,
  },
  {
    rank: 4,
    userId: 'user-234',
    username: 'IronMike',
    avatarUrl: undefined,
    level: 4,
    totalXP: 3600,
    weeklyXP: 480,
    currentStreak: 5,
    isCurrentUser: false,
  },
  {
    rank: 5,
    userId: 'user-345',
    username: 'LiftQueen',
    avatarUrl: undefined,
    level: 3,
    totalXP: 2800,
    weeklyXP: 350,
    currentStreak: 3,
    isCurrentUser: false,
  },
];

// Export all mock gamification data
export const gamificationData = {
  state: mockGamificationState,
  streak: mockTrainingStreak,
  achievements: mockAchievements,
  achievementProgress: mockAchievementProgress,
  challenges: mockChallenges,
  recentXPGains: mockRecentXPGains,
  leaderboard: mockLeaderboard,
};

export default gamificationData;
