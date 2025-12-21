/**
 * Analytics Type Definitions
 * Types for workout analytics, performance tracking, and personal records
 */

// Time series data point for charts
export interface TimeSeriesDataPoint {
  date: string; // ISO date string
  value: number;
  label?: string;
}

// Personal record types
export type PRCategory =
  | 'weight'
  | 'reps'
  | 'volume'
  | 'duration'
  | 'form_score';

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: PRCategory;
  value: number;
  previousValue: number | null;
  unit: string;
  achievedAt: string; // ISO date string
  workoutId: string;
  isNew: boolean; // For UI highlighting
}

// Exercise-specific analytics
export interface ExerciseAnalytics {
  exerciseId: string;
  exerciseName: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number; // weight * reps
  averageWeight: number;
  maxWeight: number;
  averageReps: number;
  maxReps: number;
  averageFormScore: number | null;
  sessionCount: number;
  lastPerformed: string | null; // ISO date string
  progressionTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  weightProgression: TimeSeriesDataPoint[];
  volumeProgression: TimeSeriesDataPoint[];
  formScoreProgression: TimeSeriesDataPoint[];
}

// Period summary analytics
export interface WorkoutAnalyticsSummary {
  period: '7d' | '30d' | '90d' | 'all';
  startDate: string;
  endDate: string;

  // Workout counts
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalDuration: number; // minutes

  // Volume metrics
  totalVolume: number; // kg or lbs
  averageVolumePerWorkout: number;
  volumeTrend: TimeSeriesDataPoint[];

  // Calories
  totalCaloriesBurned: number;
  averageCaloriesPerWorkout: number;
  caloriesTrend: TimeSeriesDataPoint[];

  // Performance scores
  averageFormScore: number | null;
  averageIntensity: number | null; // 0-100
  formScoreTrend: TimeSeriesDataPoint[];

  // Muscle group distribution
  muscleGroupDistribution: MuscleGroupStats[];

  // Personal records
  newPRsCount: number;
  recentPRs: PersonalRecord[];

  // Comparisons
  comparisonToPreviousPeriod: PeriodComparison | null;
}

// Muscle group workout distribution
export interface MuscleGroupStats {
  muscleGroup: string;
  sets: number;
  volume: number;
  percentage: number; // of total workout volume
  lastWorked: string | null; // ISO date string
  recommendedFrequency: number; // days between workouts
  daysSinceLastWorked: number | null;
  status: 'balanced' | 'undertrained' | 'overtrained' | 'optimal';
}

// Period-over-period comparison
export interface PeriodComparison {
  workoutsChange: number; // percentage
  volumeChange: number;
  caloriesChange: number;
  formScoreChange: number | null;
  durationChange: number;
}

// Daily workout summary for calendar views
export interface DailyWorkoutSummary {
  date: string;
  workoutCount: number;
  totalDuration: number;
  totalVolume: number;
  caloriesBurned: number;
  muscleGroupsWorked: string[];
  hasAISession: boolean;
}

// Workout performance curve data
export interface PerformanceCurve {
  exerciseId: string;
  exerciseName: string;
  dataPoints: PerformanceCurvePoint[];
  estimatedOneRepMax: number | null;
}

export interface PerformanceCurvePoint {
  reps: number;
  weight: number;
  date: string;
}

// Analytics filter options
export interface AnalyticsFilters {
  period: '7d' | '30d' | '90d' | 'all';
  exerciseId?: string;
  muscleGroup?: string;
  includeAISessions: boolean;
}

// Analytics API response wrapper
export interface AnalyticsResponse<T> {
  data: T;
  generatedAt: string;
  fromCache: boolean;
  cacheExpiresAt: string | null;
}
