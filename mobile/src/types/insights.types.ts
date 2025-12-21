/**
 * Coach Insights Type Definitions
 * Types for AI-powered recommendations, correlations, and performance insights
 */

// Insight categories
export type InsightCategory =
  | 'performance'
  | 'recovery'
  | 'form'
  | 'balance'
  | 'progression'
  | 'sleep'
  | 'nutrition'
  | 'consistency';

// Insight priority levels
export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

// Insight action types
export type InsightActionType =
  | 'workout_suggestion'
  | 'exercise_swap'
  | 'rest_recommendation'
  | 'form_focus'
  | 'volume_adjustment'
  | 'sleep_optimization'
  | 'muscle_balance';

// Individual coach insight
export interface CoachInsight {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  detailedExplanation?: string;
  actionType: InsightActionType;
  actionLabel?: string;
  actionPayload?: Record<string, unknown>;
  icon: string;
  iconColor: string;
  createdAt: string;
  expiresAt: string | null;
  isDismissed: boolean;
  isRead: boolean;
  relatedData?: InsightRelatedData;
}

// Related data for context
export interface InsightRelatedData {
  exerciseId?: string;
  exerciseName?: string;
  muscleGroup?: string;
  metricName?: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  percentageChange?: number;
}

// Correlation analysis types
export type CorrelationType =
  | 'sleep_performance'
  | 'sleep_form'
  | 'weight_strength'
  | 'consistency_progress'
  | 'rest_recovery'
  | 'volume_gains';

// Correlation strength
export type CorrelationStrength = 'weak' | 'moderate' | 'strong' | 'very_strong';

// Correlation analysis result
export interface CorrelationAnalysis {
  id: string;
  type: CorrelationType;
  title: string;
  description: string;
  strength: CorrelationStrength;
  coefficient: number; // -1 to 1
  confidence: number; // 0 to 1
  dataPoints: number;
  period: string;
  insight: string;
  recommendation: string;
  chartData: CorrelationChartData;
}

// Chart data for correlation visualization
export interface CorrelationChartData {
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  points: CorrelationDataPoint[];
  trendLine?: TrendLineData;
}

export interface CorrelationDataPoint {
  x: number;
  y: number;
  date: string;
  label?: string;
}

export interface TrendLineData {
  slope: number;
  intercept: number;
  startX: number;
  endX: number;
}

// Performance correlation data (cross-store)
export interface PerformanceCorrelationData {
  date: string;
  sleepDuration: number | null; // hours
  sleepQuality: number | null; // 1-5
  weight: number | null; // kg or lbs
  workoutScore: number | null; // 0-100
  formScore: number | null; // 0-100
  volumeLifted: number | null;
  intensity: number | null; // 0-100
  energyLevel: number | null; // 1-5
  soreness: number | null; // 1-5
}

// Coach Insights Dashboard
export interface CoachInsightsDashboard {
  userId: string;
  generatedAt: string;

  // Summary stats
  overallScore: number; // 0-100
  scoreChange: number; // vs previous period
  scoreTrend: 'improving' | 'stable' | 'declining';

  // Active insights
  insights: CoachInsight[];
  unreadCount: number;
  criticalCount: number;

  // Key correlations
  topCorrelations: CorrelationAnalysis[];

  // Weekly summary
  weeklySummary: WeeklySummary;

  // Muscle balance
  muscleBalance: MuscleBalanceAnalysis;

  // Form analysis
  formSummary: FormAnalysisSummary;

  // Recommendations
  workoutRecommendations: WorkoutRecommendation[];
}

// Weekly summary
export interface WeeklySummary {
  weekStartDate: string;
  weekEndDate: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  totalVolume: number;
  volumeChange: number; // vs previous week
  avgFormScore: number | null;
  formScoreChange: number | null;
  avgSleepHours: number | null;
  sleepChange: number | null;
  streakDays: number;
  xpEarned: number;
  prsAchieved: number;
  highlights: string[];
  areasToImprove: string[];
}

// Muscle balance analysis
export interface MuscleBalanceAnalysis {
  overallBalance: number; // 0-100, 100 = perfectly balanced
  muscleGroups: MuscleGroupBalance[];
  imbalances: MuscleImbalance[];
  recommendations: string[];
}

export interface MuscleGroupBalance {
  name: string;
  volume: number;
  targetVolume: number;
  percentage: number;
  status: 'undertrained' | 'optimal' | 'overtrained';
  lastWorked: string | null;
  daysSinceLastWorked: number;
}

export interface MuscleImbalance {
  primaryMuscle: string;
  secondaryMuscle: string;
  ratio: number;
  idealRatio: number;
  severity: 'mild' | 'moderate' | 'severe';
  recommendation: string;
}

// Form analysis summary
export interface FormAnalysisSummary {
  avgScore: number;
  scoreChange: number;
  totalAISessions: number;
  commonIssues: FormIssue[];
  improvements: FormImprovement[];
  exercisesNeedingWork: ExerciseFormFocus[];
}

export interface FormIssue {
  issue: string;
  frequency: number; // times occurred
  affectedExercises: string[];
  severity: 'minor' | 'moderate' | 'major';
  tip: string;
}

export interface FormImprovement {
  area: string;
  previousScore: number;
  currentScore: number;
  improvement: number;
}

export interface ExerciseFormFocus {
  exerciseId: string;
  exerciseName: string;
  avgFormScore: number;
  commonIssues: string[];
  recommendation: string;
}

// Workout recommendation
export interface WorkoutRecommendation {
  id: string;
  type: 'suggested_workout' | 'exercise_swap' | 'deload' | 'muscle_focus';
  title: string;
  description: string;
  reason: string;
  priority: InsightPriority;
  exercises?: RecommendedExercise[];
  muscleGroups?: string[];
  estimatedDuration?: number;
  estimatedCalories?: number;
}

export interface RecommendedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string; // e.g., "8-12"
  reason?: string;
}

// Insight filters
export interface InsightFilters {
  categories?: InsightCategory[];
  priorities?: InsightPriority[];
  includeRead?: boolean;
  includeDismissed?: boolean;
  limit?: number;
}
