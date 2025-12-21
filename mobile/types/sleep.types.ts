/**
 * Sleep Tracking Type Definitions
 *
 * Comprehensive types for the HyperFit sleep tracking feature
 */

// Core sleep entry interface
export interface SleepEntry {
  id: number;
  user_id: number;
  date: string; // YYYY-MM-DD format (the night the sleep started)
  bedtime: string; // ISO datetime when user went to bed
  wake_time: string; // ISO datetime when user woke up
  duration_hours: number; // Calculated sleep duration in hours
  duration_minutes: number; // Total duration in minutes for precision
  sleep_quality?: number; // Optional 1-100 score
  notes?: string;
  source: SleepSource; // How the data was recorded
  created_at: string;
  updated_at?: string;
}

// Sleep data source
export type SleepSource = 'manual' | 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'auto_detected';

// Data for creating a new sleep entry
export interface SleepCreateData {
  date: string; // YYYY-MM-DD
  bedtime: string; // ISO datetime or HH:MM format
  wake_time: string; // ISO datetime or HH:MM format
  sleep_quality?: number;
  notes?: string;
  source?: SleepSource;
}

// Data for updating a sleep entry
export interface SleepUpdateData extends Partial<SleepCreateData> {
  id?: number;
}

// Query parameters for fetching sleep data
export interface SleepQueryParams {
  month?: string; // YYYY-MM format
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  skip?: number;
  limit?: number;
}

// Sleep statistics for a time period
export interface SleepStatistics {
  period: string; // e.g., "2024-12" or "last_7_days"
  total_entries: number;
  avg_duration_hours: number | null;
  avg_sleep_quality: number | null;
  avg_bedtime: string | null; // Average bedtime in HH:MM format
  avg_wake_time: string | null; // Average wake time in HH:MM format
  min_duration_hours: number | null;
  max_duration_hours: number | null;
  total_sleep_hours: number;
  consistency_score: number | null; // 0-100 score based on bedtime consistency
}

// Rolling average data
export interface SleepRollingAverage {
  period_days: number; // 7 for 7-day, 30 for 30-day
  avg_duration_hours: number | null;
  avg_sleep_quality: number | null;
  entries_count: number;
  trend: 'improving' | 'declining' | 'stable' | null;
  trend_percentage: number | null; // Change from previous period
}

// Sleep trends data
export interface SleepTrends {
  current_duration: number | null;
  duration_7day_avg: number | null;
  duration_30day_avg: number | null;
  previous_week_avg: number | null;
  duration_trend: 'up' | 'down' | 'stable' | null;
  duration_delta: number | null; // Change from previous entry
  quality_trend: 'improving' | 'declining' | 'stable' | null;
  quality_7day_avg: number | null;
  sleep_history: SleepHistoryPoint[];
  bedtime_consistency: number | null; // 0-100 score
}

// Single point in sleep history for charts
export interface SleepHistoryPoint {
  date: string;
  duration_hours: number;
  sleep_quality?: number;
  bedtime_hour?: number; // Hour of bedtime (0-23)
}

// Sleep status classification
export type SleepStatus = 'optimal' | 'on_track' | 'borderline' | 'insufficient' | 'excessive';

// Sleep status with details
export interface SleepStatusInfo {
  status: SleepStatus;
  color: string; // Color code for UI
  label: string; // Human readable label
  description: string; // Detailed description
  icon: string; // Icon name
}

// Week comparison data
export interface SleepWeekComparison {
  current_week_avg: number | null;
  previous_week_avg: number | null;
  difference_hours: number | null;
  difference_percentage: number | null;
  current_week_entries: number;
  previous_week_entries: number;
  trend: 'better' | 'worse' | 'same' | null;
}

// Calendar day data for sleep view
export interface SleepCalendarDay {
  date: string;
  hasData: boolean;
  entry?: SleepEntry;
  duration_hours?: number;
  status: SleepStatus;
}

// Monthly summary for sleep
export interface SleepMonthlySummary {
  month: string; // YYYY-MM format
  total_entries: number;
  avg_duration_hours: number | null;
  avg_quality: number | null;
  total_sleep_hours: number;
  nights_optimal: number; // 7-9 hours
  nights_insufficient: number; // < 6 hours
  nights_excessive: number; // > 9 hours
  most_common_bedtime: string | null; // HH:MM format
  most_common_wake_time: string | null;
  best_night: { date: string; duration: number } | null;
  worst_night: { date: string; duration: number } | null;
  entries_by_date: { [date: string]: boolean };
}

// Sleep goal settings
export interface SleepGoal {
  id?: number;
  user_id?: number;
  target_hours: number; // Target sleep duration (default: 8)
  target_bedtime: string; // Target bedtime HH:MM (default: "23:00")
  target_wake_time: string; // Target wake time HH:MM (default: "07:00")
  min_acceptable_hours: number; // Minimum acceptable (default: 7)
  notifications_enabled: boolean;
  bedtime_reminder_minutes: number; // Minutes before target bedtime
  created_at?: string;
  updated_at?: string;
}

// Sleep goal progress tracking
export interface SleepGoalProgress {
  goal: SleepGoal;
  current_avg_hours: number | null;
  goal_achieved: boolean;
  goal_adherence_percentage: number; // 0-100
  days_on_target: number;
  days_below_target: number;
  days_above_target: number;
  current_streak: number; // Consecutive days meeting goal
  longest_streak: number;
  weekly_adherence: number[]; // Last 7 days (0 or 1)
}

// Sleep Regularity Index (SRI) - measures consistency
export interface SleepRegularityMetrics {
  sri_score: number; // 0-100, Sleep Regularity Index
  bedtime_consistency_score: number; // 0-100
  wake_time_consistency_score: number; // 0-100
  duration_consistency_score: number; // 0-100
  bedtime_std_deviation_minutes: number; // Standard deviation in minutes
  wake_time_std_deviation_minutes: number;
  avg_bedtime: string; // HH:MM format
  avg_wake_time: string;
  most_consistent_day: string | null; // Day of week
  least_consistent_day: string | null;
  social_jet_lag_minutes: number; // Difference between weekday and weekend sleep
}

// Sleep analytics data for charts
export interface SleepAnalyticsData {
  period_days: number; // 7 or 30
  entries: SleepChartDataPoint[];
  avg_duration: number | null;
  avg_quality: number | null;
  trend: 'improving' | 'declining' | 'stable' | null;
  trend_percentage: number | null;
  min_duration: number | null;
  max_duration: number | null;
  goal_target: number;
  days_meeting_goal: number;
  days_below_goal: number;
  regularity_metrics: SleepRegularityMetrics;
}

// Single data point for sleep charts
export interface SleepChartDataPoint {
  date: string;
  duration_hours: number | null;
  sleep_quality: number | null;
  bedtime_hour: number | null;
  wake_time_hour: number | null;
  goal_met: boolean;
  status: SleepStatus;
}

// Sleep-weight correlation insight
export interface SleepWeightCorrelation {
  correlation_coefficient: number; // -1 to 1
  correlation_strength: 'strong' | 'moderate' | 'weak' | 'none';
  insight_message: string;
  recommendation: string | null;
  avg_sleep_on_weight_loss_days: number | null;
  avg_sleep_on_weight_gain_days: number | null;
}

// Sleep insight/recommendation
export interface SleepInsight {
  id: string;
  type: 'tip' | 'warning' | 'achievement' | 'suggestion';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    label: string;
    route?: string;
    data?: any;
  };
}

// Dashboard sleep data
export interface DashboardSleepData {
  last_night: {
    duration_hours: number | null;
    sleep_quality: number | null;
    bedtime: string | null;
    wake_time: string | null;
    status: SleepStatus;
  };
  seven_day_avg: number | null;
  trend: 'up' | 'down' | 'stable' | null;
  trend_vs_previous_week: number | null; // Percentage change
  status_info: SleepStatusInfo;
  streak_days: number; // Days of consistent tracking
}

// Future integration types
export interface HealthKitSleepSample {
  startDate: string;
  endDate: string;
  value: string; // 'InBed', 'Asleep', 'Awake'
  sourceName: string;
  sourceId: string;
}

export interface GoogleFitSleepSegment {
  startTimeMillis: string;
  endTimeMillis: string;
  activityType: number; // 72=sleep, 109=light, 110=deep, 111=REM, 112=awake
}

// Sleep stage (for future advanced tracking)
export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepStageData {
  stage: SleepStage;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

// Export utility type for form state
export interface SleepFormState {
  date: Date;
  bedtimeHour: number;
  bedtimeMinute: number;
  wakeHour: number;
  wakeMinute: number;
  sleepQuality: number | null;
  notes: string;
}
