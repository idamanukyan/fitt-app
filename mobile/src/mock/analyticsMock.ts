/**
 * Analytics Mock Data
 * Sample data for workout analytics, performance tracking, and personal records
 */

import type {
  WorkoutAnalyticsSummary,
  ExerciseAnalytics,
  PersonalRecord,
  TimeSeriesDataPoint,
  MuscleGroupStats,
  DailyWorkoutSummary,
} from '../types/analytics.types';

// Generate dates for the last N days
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// 7-day volume trend
export const mockVolumeTrend7d: TimeSeriesDataPoint[] = [
  { date: getDateString(6), value: 12500, label: 'Mon' },
  { date: getDateString(5), value: 0, label: 'Tue' },
  { date: getDateString(4), value: 15200, label: 'Wed' },
  { date: getDateString(3), value: 8900, label: 'Thu' },
  { date: getDateString(2), value: 0, label: 'Fri' },
  { date: getDateString(1), value: 18300, label: 'Sat' },
  { date: getDateString(0), value: 14100, label: 'Sun' },
];

// 7-day calories trend
export const mockCaloriesTrend7d: TimeSeriesDataPoint[] = [
  { date: getDateString(6), value: 320, label: 'Mon' },
  { date: getDateString(5), value: 0, label: 'Tue' },
  { date: getDateString(4), value: 385, label: 'Wed' },
  { date: getDateString(3), value: 245, label: 'Thu' },
  { date: getDateString(2), value: 0, label: 'Fri' },
  { date: getDateString(1), value: 425, label: 'Sat' },
  { date: getDateString(0), value: 365, label: 'Sun' },
];

// Form score trend
export const mockFormScoreTrend7d: TimeSeriesDataPoint[] = [
  { date: getDateString(6), value: 78, label: 'Mon' },
  { date: getDateString(5), value: 0, label: 'Tue' },
  { date: getDateString(4), value: 82, label: 'Wed' },
  { date: getDateString(3), value: 75, label: 'Thu' },
  { date: getDateString(2), value: 0, label: 'Fri' },
  { date: getDateString(1), value: 85, label: 'Sat' },
  { date: getDateString(0), value: 88, label: 'Sun' },
];

// Muscle group distribution
export const mockMuscleGroupDistribution: MuscleGroupStats[] = [
  {
    muscleGroup: 'Chest',
    sets: 24,
    volume: 18500,
    percentage: 22,
    lastWorked: getDateString(1),
    recommendedFrequency: 3,
    daysSinceLastWorked: 1,
    status: 'optimal',
  },
  {
    muscleGroup: 'Back',
    sets: 28,
    volume: 21200,
    percentage: 25,
    lastWorked: getDateString(0),
    recommendedFrequency: 3,
    daysSinceLastWorked: 0,
    status: 'optimal',
  },
  {
    muscleGroup: 'Shoulders',
    sets: 16,
    volume: 8400,
    percentage: 10,
    lastWorked: getDateString(3),
    recommendedFrequency: 2,
    daysSinceLastWorked: 3,
    status: 'balanced',
  },
  {
    muscleGroup: 'Biceps',
    sets: 12,
    volume: 4800,
    percentage: 6,
    lastWorked: getDateString(1),
    recommendedFrequency: 2,
    daysSinceLastWorked: 1,
    status: 'balanced',
  },
  {
    muscleGroup: 'Triceps',
    sets: 14,
    volume: 5600,
    percentage: 7,
    lastWorked: getDateString(1),
    recommendedFrequency: 2,
    daysSinceLastWorked: 1,
    status: 'balanced',
  },
  {
    muscleGroup: 'Legs',
    sets: 18,
    volume: 28500,
    percentage: 21,
    lastWorked: getDateString(4),
    recommendedFrequency: 2,
    daysSinceLastWorked: 4,
    status: 'undertrained',
  },
  {
    muscleGroup: 'Core',
    sets: 8,
    volume: 2100,
    percentage: 9,
    lastWorked: getDateString(0),
    recommendedFrequency: 3,
    daysSinceLastWorked: 0,
    status: 'balanced',
  },
];

// Recent personal records
export const mockRecentPRs: PersonalRecord[] = [
  {
    id: 'pr-1',
    exerciseId: 'bench-press',
    exerciseName: 'Bench Press',
    category: 'weight',
    value: 102.5,
    previousValue: 100,
    unit: 'kg',
    achievedAt: getDateString(1),
    workoutId: 'workout-123',
    isNew: true,
  },
  {
    id: 'pr-2',
    exerciseId: 'squat',
    exerciseName: 'Barbell Squat',
    category: 'weight',
    value: 140,
    previousValue: 135,
    unit: 'kg',
    achievedAt: getDateString(4),
    workoutId: 'workout-120',
    isNew: true,
  },
  {
    id: 'pr-3',
    exerciseId: 'deadlift',
    exerciseName: 'Deadlift',
    category: 'reps',
    value: 8,
    previousValue: 6,
    unit: 'reps',
    achievedAt: getDateString(0),
    workoutId: 'workout-125',
    isNew: true,
  },
  {
    id: 'pr-4',
    exerciseId: 'pull-ups',
    exerciseName: 'Pull-ups',
    category: 'reps',
    value: 15,
    previousValue: 12,
    unit: 'reps',
    achievedAt: getDateString(3),
    workoutId: 'workout-121',
    isNew: false,
  },
  {
    id: 'pr-5',
    exerciseId: 'bicep-curl',
    exerciseName: 'Bicep Curl',
    category: 'form_score',
    value: 95,
    previousValue: 88,
    unit: '%',
    achievedAt: getDateString(1),
    workoutId: 'workout-123',
    isNew: true,
  },
];

// 7-day analytics summary
export const mockAnalyticsSummary7d: WorkoutAnalyticsSummary = {
  period: '7d',
  startDate: getDateString(6),
  endDate: getDateString(0),

  totalWorkouts: 5,
  totalSets: 120,
  totalReps: 1240,
  totalDuration: 285, // minutes

  totalVolume: 69000, // kg
  averageVolumePerWorkout: 13800,
  volumeTrend: mockVolumeTrend7d,

  totalCaloriesBurned: 1740,
  averageCaloriesPerWorkout: 348,
  caloriesTrend: mockCaloriesTrend7d,

  averageFormScore: 82,
  averageIntensity: 75,
  formScoreTrend: mockFormScoreTrend7d,

  muscleGroupDistribution: mockMuscleGroupDistribution,

  newPRsCount: 4,
  recentPRs: mockRecentPRs,

  comparisonToPreviousPeriod: {
    workoutsChange: 25, // 25% more workouts
    volumeChange: 12,
    caloriesChange: 15,
    formScoreChange: 8,
    durationChange: 18,
  },
};

// 30-day analytics summary
export const mockAnalyticsSummary30d: WorkoutAnalyticsSummary = {
  period: '30d',
  startDate: getDateString(29),
  endDate: getDateString(0),

  totalWorkouts: 18,
  totalSets: 432,
  totalReps: 4680,
  totalDuration: 1080,

  totalVolume: 248400,
  averageVolumePerWorkout: 13800,
  volumeTrend: Array.from({ length: 30 }, (_, i) => ({
    date: getDateString(29 - i),
    value: Math.random() > 0.3 ? Math.floor(Math.random() * 8000) + 10000 : 0,
  })),

  totalCaloriesBurned: 6264,
  averageCaloriesPerWorkout: 348,
  caloriesTrend: Array.from({ length: 30 }, (_, i) => ({
    date: getDateString(29 - i),
    value: Math.random() > 0.3 ? Math.floor(Math.random() * 200) + 250 : 0,
  })),

  averageFormScore: 79,
  averageIntensity: 72,
  formScoreTrend: Array.from({ length: 30 }, (_, i) => ({
    date: getDateString(29 - i),
    value: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 70 : 0,
  })),

  muscleGroupDistribution: mockMuscleGroupDistribution,

  newPRsCount: 8,
  recentPRs: mockRecentPRs,

  comparisonToPreviousPeriod: {
    workoutsChange: 15,
    volumeChange: 8,
    caloriesChange: 10,
    formScoreChange: 5,
    durationChange: 12,
  },
};

// Exercise-specific analytics (Bench Press)
export const mockBenchPressAnalytics: ExerciseAnalytics = {
  exerciseId: 'bench-press',
  exerciseName: 'Bench Press',
  totalSets: 48,
  totalReps: 384,
  totalVolume: 38400,
  averageWeight: 85,
  maxWeight: 102.5,
  averageReps: 8,
  maxReps: 12,
  averageFormScore: 84,
  sessionCount: 8,
  lastPerformed: getDateString(1),
  progressionTrend: 'improving',
  weightProgression: [
    { date: getDateString(28), value: 90 },
    { date: getDateString(21), value: 92.5 },
    { date: getDateString(14), value: 95 },
    { date: getDateString(7), value: 97.5 },
    { date: getDateString(1), value: 102.5 },
  ],
  volumeProgression: [
    { date: getDateString(28), value: 3600 },
    { date: getDateString(21), value: 4200 },
    { date: getDateString(14), value: 4500 },
    { date: getDateString(7), value: 4800 },
    { date: getDateString(1), value: 5100 },
  ],
  formScoreProgression: [
    { date: getDateString(28), value: 78 },
    { date: getDateString(21), value: 80 },
    { date: getDateString(14), value: 82 },
    { date: getDateString(7), value: 85 },
    { date: getDateString(1), value: 88 },
  ],
};

// Daily workout summaries for calendar view
export const mockDailyWorkoutSummaries: DailyWorkoutSummary[] = Array.from(
  { length: 14 },
  (_, i) => {
    const hasWorkout = Math.random() > 0.35;
    return {
      date: getDateString(13 - i),
      workoutCount: hasWorkout ? 1 : 0,
      totalDuration: hasWorkout ? Math.floor(Math.random() * 30) + 45 : 0,
      totalVolume: hasWorkout ? Math.floor(Math.random() * 8000) + 10000 : 0,
      caloriesBurned: hasWorkout ? Math.floor(Math.random() * 200) + 250 : 0,
      muscleGroupsWorked: hasWorkout
        ? ['Chest', 'Shoulders', 'Triceps'].slice(0, Math.floor(Math.random() * 3) + 1)
        : [],
      hasAISession: hasWorkout && Math.random() > 0.6,
    };
  }
);

// Export all mock analytics data
export const analyticsData = {
  summary7d: mockAnalyticsSummary7d,
  summary30d: mockAnalyticsSummary30d,
  recentPRs: mockRecentPRs,
  muscleDistribution: mockMuscleGroupDistribution,
  benchPressAnalytics: mockBenchPressAnalytics,
  dailySummaries: mockDailyWorkoutSummaries,
};

export default analyticsData;
