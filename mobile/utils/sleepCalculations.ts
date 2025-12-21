/**
 * Sleep Calculation Utilities
 *
 * Production-ready calculation functions for sleep tracking:
 * - Duration calculations
 * - Quality scoring
 * - Rolling averages
 * - Trend analysis
 * - Sleep status classification
 */

import type {
  SleepEntry,
  SleepStatus,
  SleepStatusInfo,
  SleepTrends,
  SleepRollingAverage,
  SleepHistoryPoint,
  SleepWeekComparison,
  SleepMonthlySummary,
  DashboardSleepData,
} from '../types/sleep.types';
import { colors } from '../design/tokens';

// ============================================================================
// CONSTANTS
// ============================================================================

// Sleep duration thresholds (in hours)
export const SLEEP_THRESHOLDS = {
  INSUFFICIENT: 6, // Less than 6 hours
  BORDERLINE_MIN: 6, // 6-7 hours
  OPTIMAL_MIN: 7, // 7+ hours is optimal
  OPTIMAL_MAX: 9, // Up to 9 hours is optimal
  EXCESSIVE: 9, // More than 9 hours
} as const;

// Default sleep goals - full definition is below in SLEEP GOALS section

// ============================================================================
// DURATION CALCULATIONS
// ============================================================================

/**
 * Calculate sleep duration between bedtime and wake time
 * Handles overnight sleep (e.g., 23:00 to 07:00)
 *
 * @param bedtime - ISO datetime string or Date
 * @param wakeTime - ISO datetime string or Date
 * @returns Duration in hours (decimal)
 */
export function calculateSleepDuration(
  bedtime: string | Date,
  wakeTime: string | Date
): number {
  const bedDate = bedtime instanceof Date ? bedtime : new Date(bedtime);
  const wakeDate = wakeTime instanceof Date ? wakeTime : new Date(wakeTime);

  let durationMs = wakeDate.getTime() - bedDate.getTime();

  // Handle case where wake time is on the next day
  if (durationMs < 0) {
    // Add 24 hours
    durationMs += 24 * 60 * 60 * 1000;
  }

  // Convert to hours with 2 decimal places
  const hours = durationMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
}

/**
 * Calculate duration in minutes for precision
 */
export function calculateSleepDurationMinutes(
  bedtime: string | Date,
  wakeTime: string | Date
): number {
  const hours = calculateSleepDuration(bedtime, wakeTime);
  return Math.round(hours * 60);
}

/**
 * Format duration as human-readable string
 * @param hours - Duration in hours
 * @returns Formatted string like "7h 30m"
 */
export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format duration as short string for compact displays
 * @param hours - Duration in hours
 * @returns Formatted string like "7.5h"
 */
export function formatDurationShort(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format ISO datetime to time string (HH:MM)
 */
export function formatTimeFromISO(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format time for display with AM/PM
 */
export function formatTimeDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Create ISO datetime from date and time components
 */
export function createBedtimeISO(
  date: string, // YYYY-MM-DD
  hour: number,
  minute: number
): string {
  // Normalize hour to 0-23 range
  const normalizedHour = ((hour % 24) + 24) % 24;
  const normalizedMinute = Math.max(0, Math.min(59, minute));

  // Parse the date parts to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const bedtime = new Date(year, month - 1, day, normalizedHour, normalizedMinute, 0);

  // If bedtime is after midnight but before noon, it's actually the next day conceptually
  // but we store it as is for accurate tracking
  return bedtime.toISOString();
}

/**
 * Create wake time ISO string
 * Automatically handles overnight sleep (adds a day if wake time is before bedtime)
 */
export function createWakeTimeISO(
  date: string, // YYYY-MM-DD (the date of bedtime)
  bedtimeHour: number,
  wakeHour: number,
  wakeMinute: number
): string {
  // Normalize hours to 0-23 range
  const normalizedBedtimeHour = ((bedtimeHour % 24) + 24) % 24;
  const normalizedWakeHour = ((wakeHour % 24) + 24) % 24;
  const normalizedMinute = Math.max(0, Math.min(59, wakeMinute));

  // Parse the date parts to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  let wakeDate = new Date(year, month - 1, day, normalizedWakeHour, normalizedMinute, 0);

  // If wake time is earlier than bedtime, it's the next day
  if (normalizedWakeHour < normalizedBedtimeHour || (normalizedWakeHour < 12 && normalizedBedtimeHour >= 12)) {
    wakeDate.setDate(wakeDate.getDate() + 1);
  }

  return wakeDate.toISOString();
}

/**
 * Parse time string (HH:MM) to hour and minute
 */
export function parseTimeString(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour: hour || 0, minute: minute || 0 };
}

/**
 * Get hour from ISO datetime (0-23)
 */
export function getHourFromISO(isoString: string): number {
  return new Date(isoString).getHours();
}

// ============================================================================
// SLEEP STATUS CLASSIFICATION
// ============================================================================

/**
 * Classify sleep duration into status categories
 */
export function getSleepStatus(durationHours: number): SleepStatus {
  if (durationHours < SLEEP_THRESHOLDS.INSUFFICIENT) {
    return 'insufficient';
  }
  if (durationHours < SLEEP_THRESHOLDS.OPTIMAL_MIN) {
    return 'borderline';
  }
  if (durationHours <= SLEEP_THRESHOLDS.OPTIMAL_MAX) {
    return 'optimal';
  }
  return 'excessive';
}

/**
 * Get full status info including color, label, and description
 */
export function getSleepStatusInfo(durationHours: number | null): SleepStatusInfo {
  if (durationHours === null) {
    return {
      status: 'insufficient',
      color: colors.textMuted,
      label: 'No data',
      description: 'No sleep data recorded',
      icon: 'moon-outline',
    };
  }

  const status = getSleepStatus(durationHours);

  switch (status) {
    case 'optimal':
      return {
        status: 'optimal',
        color: colors.success,
        label: 'Optimal',
        description: 'Great sleep! You\'re getting the recommended amount.',
        icon: 'checkmark-circle',
      };
    case 'on_track':
      return {
        status: 'on_track',
        color: colors.success,
        label: 'On track',
        description: 'Good sleep duration within healthy range.',
        icon: 'checkmark-circle-outline',
      };
    case 'borderline':
      return {
        status: 'borderline',
        color: colors.warning,
        label: 'Borderline',
        description: 'Slightly below optimal. Try to get 7+ hours.',
        icon: 'alert-circle-outline',
      };
    case 'insufficient':
      return {
        status: 'insufficient',
        color: colors.error,
        label: 'Insufficient',
        description: 'Not enough sleep. Aim for at least 7 hours.',
        icon: 'warning-outline',
      };
    case 'excessive':
      return {
        status: 'excessive',
        color: colors.warning,
        label: 'Excessive',
        description: 'More than 9 hours may indicate oversleeping.',
        icon: 'time-outline',
      };
  }
}

/**
 * Get status color based on hours
 */
export function getSleepStatusColor(durationHours: number | null): string {
  return getSleepStatusInfo(durationHours).color;
}

// ============================================================================
// ROLLING AVERAGES
// ============================================================================

/**
 * Calculate rolling N-day average from sleep entries
 */
export function getRollingAverage(
  entries: SleepEntry[],
  days: number = 7,
  referenceDate?: Date
): SleepRollingAverage {
  const refDate = referenceDate || new Date();
  const startDate = new Date(refDate);
  startDate.setDate(startDate.getDate() - days);

  // Filter entries within the period
  const periodEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= refDate;
  });

  if (periodEntries.length === 0) {
    return {
      period_days: days,
      avg_duration_hours: null,
      avg_sleep_quality: null,
      entries_count: 0,
      trend: null,
      trend_percentage: null,
    };
  }

  // Calculate averages
  const totalDuration = periodEntries.reduce((sum, e) => sum + e.duration_hours, 0);
  const avgDuration = totalDuration / periodEntries.length;

  const qualityEntries = periodEntries.filter((e) => e.sleep_quality !== undefined);
  const avgQuality =
    qualityEntries.length > 0
      ? qualityEntries.reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / qualityEntries.length
      : null;

  // Calculate trend compared to previous period
  const previousStart = new Date(startDate);
  previousStart.setDate(previousStart.getDate() - days);

  const previousEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= previousStart && entryDate < startDate;
  });

  let trend: 'improving' | 'declining' | 'stable' | null = null;
  let trendPercentage: number | null = null;

  if (previousEntries.length > 0) {
    const previousAvg = previousEntries.reduce((sum, e) => sum + e.duration_hours, 0) / previousEntries.length;
    const diff = avgDuration - previousAvg;
    trendPercentage = (diff / previousAvg) * 100;

    if (diff > 0.25) trend = 'improving';
    else if (diff < -0.25) trend = 'declining';
    else trend = 'stable';
  }

  return {
    period_days: days,
    avg_duration_hours: Math.round(avgDuration * 100) / 100,
    avg_sleep_quality: avgQuality !== null ? Math.round(avgQuality) : null,
    entries_count: periodEntries.length,
    trend,
    trend_percentage: trendPercentage !== null ? Math.round(trendPercentage * 10) / 10 : null,
  };
}

/**
 * Shorthand for 7-day rolling average
 */
export function getRolling7DayAverage(entries: SleepEntry[]): SleepRollingAverage {
  return getRollingAverage(entries, 7);
}

/**
 * Shorthand for 30-day rolling average
 */
export function getRolling30DayAverage(entries: SleepEntry[]): SleepRollingAverage {
  return getRollingAverage(entries, 30);
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Get comprehensive trend data for sleep analysis
 */
export function getTrend(
  previousWeekAvg: number | null,
  currentWeekAvg: number | null
): { trend: 'up' | 'down' | 'stable' | null; percentage: number | null } {
  if (previousWeekAvg === null || currentWeekAvg === null) {
    return { trend: null, percentage: null };
  }

  const diff = currentWeekAvg - previousWeekAvg;
  const percentage = (diff / previousWeekAvg) * 100;

  let trend: 'up' | 'down' | 'stable';
  if (diff > 0.25) trend = 'up';
  else if (diff < -0.25) trend = 'down';
  else trend = 'stable';

  return {
    trend,
    percentage: Math.round(percentage * 10) / 10,
  };
}

/**
 * Calculate full trends data for a sleep entry
 */
export function calculateSleepTrends(
  currentEntry: SleepEntry | null,
  allEntries: SleepEntry[]
): SleepTrends {
  if (!currentEntry && allEntries.length === 0) {
    return {
      current_duration: null,
      duration_7day_avg: null,
      duration_30day_avg: null,
      previous_week_avg: null,
      duration_trend: null,
      duration_delta: null,
      quality_trend: null,
      quality_7day_avg: null,
      sleep_history: [],
      bedtime_consistency: null,
    };
  }

  // Sort entries by date (oldest first)
  const sorted = [...allEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Current duration
  const currentDuration = currentEntry?.duration_hours || null;

  // Find previous entry for delta calculation
  let durationDelta: number | null = null;
  if (currentEntry) {
    const currentIndex = sorted.findIndex((e) => e.date === currentEntry.date);
    if (currentIndex > 0) {
      durationDelta = currentEntry.duration_hours - sorted[currentIndex - 1].duration_hours;
    }
  }

  // Calculate rolling averages
  const rolling7 = getRolling7DayAverage(sorted);
  const rolling30 = getRolling30DayAverage(sorted);

  // Previous week average
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const previousWeekEntries = sorted.filter((e) => {
    const d = new Date(e.date);
    return d >= twoWeeksAgo && d < oneWeekAgo;
  });

  const previousWeekAvg =
    previousWeekEntries.length > 0
      ? previousWeekEntries.reduce((sum, e) => sum + e.duration_hours, 0) / previousWeekEntries.length
      : null;

  // Duration trend
  const trendResult = getTrend(previousWeekAvg, rolling7.avg_duration_hours);

  // Quality trend
  let qualityTrend: 'improving' | 'declining' | 'stable' | null = null;
  if (rolling7.avg_sleep_quality !== null) {
    const previousQualityEntries = previousWeekEntries.filter((e) => e.sleep_quality !== undefined);
    if (previousQualityEntries.length > 0) {
      const prevAvgQuality =
        previousQualityEntries.reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / previousQualityEntries.length;
      const qualityDiff = rolling7.avg_sleep_quality - prevAvgQuality;
      if (qualityDiff > 5) qualityTrend = 'improving';
      else if (qualityDiff < -5) qualityTrend = 'declining';
      else qualityTrend = 'stable';
    }
  }

  // Build sleep history for charts (last 7 entries)
  const recentEntries = sorted.slice(-7);
  const sleepHistory: SleepHistoryPoint[] = recentEntries.map((e) => ({
    date: e.date,
    duration_hours: e.duration_hours,
    sleep_quality: e.sleep_quality,
    bedtime_hour: getHourFromISO(e.bedtime),
  }));

  // Calculate bedtime consistency (lower variance = higher score)
  const bedtimeConsistency = calculateBedtimeConsistency(recentEntries);

  return {
    current_duration: currentDuration,
    duration_7day_avg: rolling7.avg_duration_hours,
    duration_30day_avg: rolling30.avg_duration_hours,
    previous_week_avg: previousWeekAvg !== null ? Math.round(previousWeekAvg * 100) / 100 : null,
    duration_trend: trendResult.trend,
    duration_delta: durationDelta !== null ? Math.round(durationDelta * 100) / 100 : null,
    quality_trend: qualityTrend,
    quality_7day_avg: rolling7.avg_sleep_quality,
    sleep_history: sleepHistory,
    bedtime_consistency: bedtimeConsistency,
  };
}

/**
 * Calculate bedtime consistency score (0-100)
 * Higher score = more consistent bedtime
 */
function calculateBedtimeConsistency(entries: SleepEntry[]): number | null {
  if (entries.length < 3) return null;

  // Get bedtime hours (0-23)
  const bedtimeHours = entries.map((e) => {
    const hour = getHourFromISO(e.bedtime);
    // Normalize hours around midnight (22-24 and 0-2 should be close)
    return hour >= 12 ? hour : hour + 24;
  });

  // Calculate standard deviation
  const mean = bedtimeHours.reduce((a, b) => a + b, 0) / bedtimeHours.length;
  const variance =
    bedtimeHours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / bedtimeHours.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 score (lower stdDev = higher score)
  // stdDev of 0 = 100, stdDev of 3+ hours = 0
  const score = Math.max(0, Math.min(100, 100 - (stdDev / 3) * 100));
  return Math.round(score);
}

// ============================================================================
// WEEK COMPARISON
// ============================================================================

/**
 * Compare current week sleep with previous week
 */
export function getWeekComparison(entries: SleepEntry[]): SleepWeekComparison {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfPreviousWeek = new Date(startOfWeek);
  startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

  const currentWeekEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= startOfWeek && d <= today;
  });

  const previousWeekEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= startOfPreviousWeek && d < startOfWeek;
  });

  const currentAvg =
    currentWeekEntries.length > 0
      ? currentWeekEntries.reduce((sum, e) => sum + e.duration_hours, 0) / currentWeekEntries.length
      : null;

  const previousAvg =
    previousWeekEntries.length > 0
      ? previousWeekEntries.reduce((sum, e) => sum + e.duration_hours, 0) / previousWeekEntries.length
      : null;

  let differenceHours: number | null = null;
  let differencePercentage: number | null = null;
  let trend: 'better' | 'worse' | 'same' | null = null;

  if (currentAvg !== null && previousAvg !== null) {
    differenceHours = currentAvg - previousAvg;
    differencePercentage = (differenceHours / previousAvg) * 100;

    if (differenceHours > 0.25) trend = 'better';
    else if (differenceHours < -0.25) trend = 'worse';
    else trend = 'same';
  }

  return {
    current_week_avg: currentAvg !== null ? Math.round(currentAvg * 100) / 100 : null,
    previous_week_avg: previousAvg !== null ? Math.round(previousAvg * 100) / 100 : null,
    difference_hours: differenceHours !== null ? Math.round(differenceHours * 100) / 100 : null,
    difference_percentage:
      differencePercentage !== null ? Math.round(differencePercentage * 10) / 10 : null,
    current_week_entries: currentWeekEntries.length,
    previous_week_entries: previousWeekEntries.length,
    trend,
  };
}

// ============================================================================
// MONTHLY SUMMARY
// ============================================================================

/**
 * Calculate monthly summary statistics
 */
export function calculateMonthlySummary(
  year: number,
  month: number,
  entries: SleepEntry[]
): SleepMonthlySummary {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Filter entries for this month
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  if (monthEntries.length === 0) {
    return {
      month: monthStr,
      total_entries: 0,
      avg_duration_hours: null,
      avg_quality: null,
      total_sleep_hours: 0,
      nights_optimal: 0,
      nights_insufficient: 0,
      nights_excessive: 0,
      most_common_bedtime: null,
      most_common_wake_time: null,
      best_night: null,
      worst_night: null,
      entries_by_date: {},
    };
  }

  // Calculate averages
  const totalDuration = monthEntries.reduce((sum, e) => sum + e.duration_hours, 0);
  const avgDuration = totalDuration / monthEntries.length;

  const qualityEntries = monthEntries.filter((e) => e.sleep_quality !== undefined);
  const avgQuality =
    qualityEntries.length > 0
      ? qualityEntries.reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / qualityEntries.length
      : null;

  // Count nights by category
  let optimal = 0;
  let insufficient = 0;
  let excessive = 0;

  monthEntries.forEach((e) => {
    const status = getSleepStatus(e.duration_hours);
    if (status === 'optimal' || status === 'on_track') optimal++;
    else if (status === 'insufficient') insufficient++;
    else if (status === 'excessive') excessive++;
  });

  // Find best and worst nights
  const sorted = [...monthEntries].sort((a, b) => b.duration_hours - a.duration_hours);
  const bestNight = sorted[0]
    ? { date: sorted[0].date, duration: sorted[0].duration_hours }
    : null;
  const worstNight = sorted[sorted.length - 1]
    ? { date: sorted[sorted.length - 1].date, duration: sorted[sorted.length - 1].duration_hours }
    : null;

  // Calculate most common bedtime and wake time
  const bedtimeHours = monthEntries.map((e) => Math.round(getHourFromISO(e.bedtime)));
  const wakeHours = monthEntries.map((e) => Math.round(getHourFromISO(e.wake_time)));

  const mostCommonBedtime = getMostCommonValue(bedtimeHours);
  const mostCommonWake = getMostCommonValue(wakeHours);

  // Build entries by date map
  const entriesByDate: { [date: string]: boolean } = {};
  monthEntries.forEach((e) => {
    entriesByDate[e.date] = true;
  });

  return {
    month: monthStr,
    total_entries: monthEntries.length,
    avg_duration_hours: Math.round(avgDuration * 100) / 100,
    avg_quality: avgQuality !== null ? Math.round(avgQuality) : null,
    total_sleep_hours: Math.round(totalDuration * 10) / 10,
    nights_optimal: optimal,
    nights_insufficient: insufficient,
    nights_excessive: excessive,
    most_common_bedtime:
      mostCommonBedtime !== null
        ? `${mostCommonBedtime.toString().padStart(2, '0')}:00`
        : null,
    most_common_wake_time:
      mostCommonWake !== null ? `${mostCommonWake.toString().padStart(2, '0')}:00` : null,
    best_night: bestNight,
    worst_night: worstNight,
    entries_by_date: entriesByDate,
  };
}

/**
 * Helper to find most common value in array
 */
function getMostCommonValue(arr: number[]): number | null {
  if (arr.length === 0) return null;

  const counts = new Map<number, number>();
  arr.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));

  let maxCount = 0;
  let mostCommon: number | null = null;

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value;
    }
  });

  return mostCommon;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

/**
 * Get sleep data formatted for dashboard display
 */
export function getDashboardSleepData(entries: SleepEntry[]): DashboardSleepData {
  // Sort by date descending to get most recent
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get last night's entry (most recent)
  const lastNight = sorted[0] || null;

  // Calculate 7-day average
  const rolling7 = getRolling7DayAverage(entries);

  // Get week comparison for trend
  const weekComparison = getWeekComparison(entries);

  // Calculate tracking streak
  const streak = calculateTrackingStreak(sorted);

  const lastNightDuration = lastNight?.duration_hours || null;
  const statusInfo = getSleepStatusInfo(lastNightDuration);

  return {
    last_night: {
      duration_hours: lastNightDuration,
      sleep_quality: lastNight?.sleep_quality || null,
      bedtime: lastNight?.bedtime || null,
      wake_time: lastNight?.wake_time || null,
      status: lastNightDuration !== null ? getSleepStatus(lastNightDuration) : 'insufficient',
    },
    seven_day_avg: rolling7.avg_duration_hours,
    trend: weekComparison.trend === 'better' ? 'up' : weekComparison.trend === 'worse' ? 'down' : 'stable',
    trend_vs_previous_week: weekComparison.difference_percentage,
    status_info: statusInfo,
    streak_days: streak,
  };
}

/**
 * Calculate consecutive days of sleep tracking
 */
function calculateTrackingStreak(sortedEntries: SleepEntry[]): number {
  if (sortedEntries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = today;

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    // Allow for yesterday as valid start (sleep logged in morning)
    const diffDays = Math.round((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = new Date(entryDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ============================================================================
// SLEEP QUALITY SCORING
// ============================================================================

/**
 * Calculate sleep quality score based on various factors
 * This is an optional algorithm that can be used when user doesn't provide quality manually
 *
 * Factors:
 * - Duration (40% weight) - optimal is 7-9 hours
 * - Bedtime consistency (30% weight) - compared to average
 * - Wake time consistency (30% weight) - compared to average
 */
export function calculateSleepQualityScore(
  entry: SleepEntry,
  recentEntries: SleepEntry[]
): number {
  let score = 0;

  // Duration score (40 points max)
  const durationScore = calculateDurationScore(entry.duration_hours);
  score += durationScore * 0.4;

  // Consistency scores require recent data
  if (recentEntries.length >= 3) {
    // Bedtime consistency score (30 points max)
    const avgBedtimeHour = getAverageBedtimeHour(recentEntries);
    const entryBedtimeHour = getHourFromISO(entry.bedtime);
    const bedtimeScore = calculateConsistencyScore(entryBedtimeHour, avgBedtimeHour);
    score += bedtimeScore * 0.3;

    // Wake time consistency score (30 points max)
    const avgWakeHour = getAverageWakeHour(recentEntries);
    const entryWakeHour = getHourFromISO(entry.wake_time);
    const wakeScore = calculateConsistencyScore(entryWakeHour, avgWakeHour);
    score += wakeScore * 0.3;
  } else {
    // If not enough data, use duration for full score
    score = durationScore;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Calculate duration-based score (0-100)
 */
function calculateDurationScore(hours: number): number {
  if (hours >= 7 && hours <= 9) return 100; // Optimal
  if (hours >= 6 && hours < 7) return 70; // Borderline low
  if (hours > 9 && hours <= 10) return 70; // Slightly long
  if (hours >= 5 && hours < 6) return 50; // Low
  if (hours > 10 && hours <= 11) return 50; // Long
  return 30; // Very low or very long
}

/**
 * Calculate consistency score based on deviation from average
 */
function calculateConsistencyScore(current: number, average: number): number {
  // Normalize hours around midnight
  const normalizedCurrent = current >= 12 ? current : current + 24;
  const normalizedAverage = average >= 12 ? average : average + 24;

  const diff = Math.abs(normalizedCurrent - normalizedAverage);

  if (diff <= 0.5) return 100; // Within 30 minutes
  if (diff <= 1) return 80; // Within 1 hour
  if (diff <= 2) return 60; // Within 2 hours
  if (diff <= 3) return 40; // Within 3 hours
  return 20; // More than 3 hours difference
}

/**
 * Get average bedtime hour from entries
 */
function getAverageBedtimeHour(entries: SleepEntry[]): number {
  const hours = entries.map((e) => {
    const h = getHourFromISO(e.bedtime);
    return h >= 12 ? h : h + 24;
  });
  const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
  return avg >= 24 ? avg - 24 : avg;
}

/**
 * Get average wake hour from entries
 */
function getAverageWakeHour(entries: SleepEntry[]): number {
  const hours = entries.map((e) => getHourFromISO(e.wake_time));
  return hours.reduce((a, b) => a + b, 0) / hours.length;
}

// ============================================================================
// SLEEP REGULARITY INDEX (SRI)
// ============================================================================

import type {
  SleepRegularityMetrics,
  SleepGoal,
  SleepGoalProgress,
  SleepAnalyticsData,
  SleepChartDataPoint,
} from '../types/sleep.types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Calculate Sleep Regularity Index (SRI)
 * Based on research - measures how consistent sleep patterns are day-to-day
 * Score 0-100 where 100 is perfect consistency
 */
export function calculateSleepRegularityIndex(entries: SleepEntry[]): SleepRegularityMetrics {
  const defaultMetrics: SleepRegularityMetrics = {
    sri_score: 0,
    bedtime_consistency_score: 0,
    wake_time_consistency_score: 0,
    duration_consistency_score: 0,
    bedtime_std_deviation_minutes: 0,
    wake_time_std_deviation_minutes: 0,
    avg_bedtime: '--:--',
    avg_wake_time: '--:--',
    most_consistent_day: null,
    least_consistent_day: null,
    social_jet_lag_minutes: 0,
  };

  if (entries.length < 3) {
    return defaultMetrics;
  }

  // Sort entries by date
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Extract bedtime minutes from midnight (normalized)
  const bedtimeMinutes = sorted.map((e) => {
    const d = new Date(e.bedtime);
    let mins = d.getHours() * 60 + d.getMinutes();
    // Normalize: times after 8pm are negative offset from midnight
    if (mins >= 1200) mins -= 1440; // 20:00+ becomes -240 to 0
    return mins;
  });

  // Extract wake time minutes from midnight
  const wakeMinutes = sorted.map((e) => {
    const d = new Date(e.wake_time);
    return d.getHours() * 60 + d.getMinutes();
  });

  // Extract durations
  const durations = sorted.map((e) => e.duration_hours);

  // Calculate standard deviations
  const bedtimeStdDev = calculateStandardDeviation(bedtimeMinutes);
  const wakeStdDev = calculateStandardDeviation(wakeMinutes);
  const durationStdDev = calculateStandardDeviation(durations.map(d => d * 60));

  // Convert std dev to consistency score (lower std dev = higher score)
  // Max expected std dev is ~180 minutes (3 hours)
  const bedtimeConsistency = Math.max(0, Math.min(100, 100 - (bedtimeStdDev / 180) * 100));
  const wakeConsistency = Math.max(0, Math.min(100, 100 - (wakeStdDev / 180) * 100));
  const durationConsistency = Math.max(0, Math.min(100, 100 - (durationStdDev / 120) * 100));

  // Calculate SRI as weighted average
  const sriScore = Math.round(
    bedtimeConsistency * 0.4 +
    wakeConsistency * 0.4 +
    durationConsistency * 0.2
  );

  // Calculate average bedtime and wake time
  const avgBedtimeMins = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
  const normalizedBedtime = avgBedtimeMins < 0 ? avgBedtimeMins + 1440 : avgBedtimeMins;
  const avgBedtimeHour = Math.floor(normalizedBedtime / 60);
  const avgBedtimeMin = Math.round(normalizedBedtime % 60);

  const avgWakeMins = wakeMinutes.reduce((a, b) => a + b, 0) / wakeMinutes.length;
  const avgWakeHour = Math.floor(avgWakeMins / 60);
  const avgWakeMin = Math.round(avgWakeMins % 60);

  // Calculate social jet lag (weekday vs weekend difference)
  const weekdayEntries = sorted.filter((e) => {
    const day = new Date(e.date).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendEntries = sorted.filter((e) => {
    const day = new Date(e.date).getDay();
    return day === 0 || day === 6;
  });

  let socialJetLag = 0;
  if (weekdayEntries.length > 0 && weekendEntries.length > 0) {
    const weekdayAvgBedtime = weekdayEntries.reduce((sum, e) => {
      const d = new Date(e.bedtime);
      let mins = d.getHours() * 60 + d.getMinutes();
      if (mins >= 1200) mins -= 1440;
      return sum + mins;
    }, 0) / weekdayEntries.length;

    const weekendAvgBedtime = weekendEntries.reduce((sum, e) => {
      const d = new Date(e.bedtime);
      let mins = d.getHours() * 60 + d.getMinutes();
      if (mins >= 1200) mins -= 1440;
      return sum + mins;
    }, 0) / weekendEntries.length;

    socialJetLag = Math.abs(weekendAvgBedtime - weekdayAvgBedtime);
  }

  // Find most/least consistent days
  const dayConsistency = calculateDayConsistency(sorted);
  const sortedDays = Object.entries(dayConsistency).sort((a, b) => b[1] - a[1]);
  const mostConsistentDay = sortedDays.length > 0 && sortedDays[0][1] > 0
    ? DAYS_OF_WEEK[parseInt(sortedDays[0][0])]
    : null;
  const leastConsistentDay = sortedDays.length > 1 && sortedDays[sortedDays.length - 1][1] > 0
    ? DAYS_OF_WEEK[parseInt(sortedDays[sortedDays.length - 1][0])]
    : null;

  return {
    sri_score: sriScore,
    bedtime_consistency_score: Math.round(bedtimeConsistency),
    wake_time_consistency_score: Math.round(wakeConsistency),
    duration_consistency_score: Math.round(durationConsistency),
    bedtime_std_deviation_minutes: Math.round(bedtimeStdDev),
    wake_time_std_deviation_minutes: Math.round(wakeStdDev),
    avg_bedtime: `${avgBedtimeHour.toString().padStart(2, '0')}:${avgBedtimeMin.toString().padStart(2, '0')}`,
    avg_wake_time: `${avgWakeHour.toString().padStart(2, '0')}:${avgWakeMin.toString().padStart(2, '0')}`,
    most_consistent_day: mostConsistentDay,
    least_consistent_day: leastConsistentDay,
    social_jet_lag_minutes: Math.round(socialJetLag),
  };
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate consistency score per day of week
 */
function calculateDayConsistency(entries: SleepEntry[]): { [day: number]: number } {
  const dayGroups: { [day: number]: number[] } = {};

  entries.forEach((e) => {
    const day = new Date(e.date).getDay();
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(e.duration_hours);
  });

  const dayConsistency: { [day: number]: number } = {};
  Object.entries(dayGroups).forEach(([day, durations]) => {
    if (durations.length >= 2) {
      const stdDev = calculateStandardDeviation(durations.map(d => d * 60));
      dayConsistency[parseInt(day)] = Math.max(0, 100 - (stdDev / 120) * 100);
    } else if (durations.length === 1) {
      dayConsistency[parseInt(day)] = 50; // Single data point
    }
  });

  return dayConsistency;
}

// ============================================================================
// SLEEP GOALS
// ============================================================================

export const DEFAULT_SLEEP_GOAL: SleepGoal = {
  target_hours: 7.5,
  target_bedtime: '23:00',
  target_wake_time: '06:30',
  min_acceptable_hours: 7,
  notifications_enabled: true,
  bedtime_reminder_minutes: 30,
};

/**
 * Calculate sleep goal progress and adherence
 */
export function calculateSleepGoalProgress(
  entries: SleepEntry[],
  goal: SleepGoal = DEFAULT_SLEEP_GOAL
): SleepGoalProgress {
  if (entries.length === 0) {
    return {
      goal,
      current_avg_hours: null,
      goal_achieved: false,
      goal_adherence_percentage: 0,
      days_on_target: 0,
      days_below_target: 0,
      days_above_target: 0,
      current_streak: 0,
      longest_streak: 0,
      weekly_adherence: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  // Sort by date descending
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate averages
  const totalHours = sorted.reduce((sum, e) => sum + e.duration_hours, 0);
  const avgHours = totalHours / sorted.length;

  // Count days meeting goal
  let onTarget = 0;
  let belowTarget = 0;
  let aboveTarget = 0;

  sorted.forEach((e) => {
    if (e.duration_hours >= goal.min_acceptable_hours && e.duration_hours <= goal.target_hours + 1.5) {
      onTarget++;
    } else if (e.duration_hours < goal.min_acceptable_hours) {
      belowTarget++;
    } else {
      aboveTarget++;
    }
  });

  // Calculate adherence percentage
  const adherencePercentage = Math.round((onTarget / sorted.length) * 100);

  // Calculate current streak
  let currentStreak = 0;
  for (const entry of sorted) {
    if (entry.duration_hours >= goal.min_acceptable_hours) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const chronological = [...sorted].reverse();
  for (const entry of chronological) {
    if (entry.duration_hours >= goal.min_acceptable_hours) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate weekly adherence (last 7 days)
  const today = new Date();
  const weeklyAdherence: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = sorted.find((e) => e.date === dateStr);
    if (entry && entry.duration_hours >= goal.min_acceptable_hours) {
      weeklyAdherence.push(1);
    } else {
      weeklyAdherence.push(0);
    }
  }

  return {
    goal,
    current_avg_hours: Math.round(avgHours * 10) / 10,
    goal_achieved: avgHours >= goal.min_acceptable_hours,
    goal_adherence_percentage: adherencePercentage,
    days_on_target: onTarget,
    days_below_target: belowTarget,
    days_above_target: aboveTarget,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    weekly_adherence: weeklyAdherence,
  };
}

// ============================================================================
// SLEEP ANALYTICS FOR CHARTS
// ============================================================================

/**
 * Generate analytics data for sleep charts (7-day or 30-day view)
 */
export function generateSleepAnalytics(
  entries: SleepEntry[],
  periodDays: 7 | 30,
  goal: SleepGoal = DEFAULT_SLEEP_GOAL
): SleepAnalyticsData {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - periodDays + 1);
  startDate.setHours(0, 0, 0, 0);

  // Create entry map for quick lookup
  const entryMap = new Map<string, SleepEntry>();
  entries.forEach((e) => entryMap.set(e.date, e));

  // Generate data points for each day in the period
  const chartData: SleepChartDataPoint[] = [];
  let meetingGoal = 0;
  let belowGoal = 0;

  for (let i = 0; i < periodDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = entryMap.get(dateStr);

    if (entry) {
      const goalMet = entry.duration_hours >= goal.min_acceptable_hours;
      if (goalMet) meetingGoal++;
      else belowGoal++;

      chartData.push({
        date: dateStr,
        duration_hours: entry.duration_hours,
        sleep_quality: entry.sleep_quality || null,
        bedtime_hour: new Date(entry.bedtime).getHours(),
        wake_time_hour: new Date(entry.wake_time).getHours(),
        goal_met: goalMet,
        status: getSleepStatus(entry.duration_hours),
      });
    } else {
      chartData.push({
        date: dateStr,
        duration_hours: null,
        sleep_quality: null,
        bedtime_hour: null,
        wake_time_hour: null,
        goal_met: false,
        status: 'insufficient',
      });
    }
  }

  // Filter entries for calculations
  const periodEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= startDate && d <= today;
  });

  // Calculate averages
  const avgDuration = periodEntries.length > 0
    ? periodEntries.reduce((sum, e) => sum + e.duration_hours, 0) / periodEntries.length
    : null;

  const qualityEntries = periodEntries.filter((e) => e.sleep_quality !== undefined);
  const avgQuality = qualityEntries.length > 0
    ? qualityEntries.reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / qualityEntries.length
    : null;

  // Calculate trend compared to previous period
  const previousStart = new Date(startDate);
  previousStart.setDate(previousStart.getDate() - periodDays);
  const previousEnd = new Date(startDate);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previousEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= previousStart && d <= previousEnd;
  });

  let trend: 'improving' | 'declining' | 'stable' | null = null;
  let trendPercentage: number | null = null;

  if (previousEntries.length > 0 && avgDuration !== null) {
    const previousAvg = previousEntries.reduce((sum, e) => sum + e.duration_hours, 0) / previousEntries.length;
    const diff = avgDuration - previousAvg;
    trendPercentage = (diff / previousAvg) * 100;

    if (diff > 0.25) trend = 'improving';
    else if (diff < -0.25) trend = 'declining';
    else trend = 'stable';
  }

  // Calculate min/max
  const durations = periodEntries.map((e) => e.duration_hours);
  const minDuration = durations.length > 0 ? Math.min(...durations) : null;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : null;

  // Calculate regularity metrics
  const regularityMetrics = calculateSleepRegularityIndex(periodEntries);

  return {
    period_days: periodDays,
    entries: chartData,
    avg_duration: avgDuration !== null ? Math.round(avgDuration * 10) / 10 : null,
    avg_quality: avgQuality !== null ? Math.round(avgQuality) : null,
    trend,
    trend_percentage: trendPercentage !== null ? Math.round(trendPercentage * 10) / 10 : null,
    min_duration: minDuration,
    max_duration: maxDuration,
    goal_target: goal.target_hours,
    days_meeting_goal: meetingGoal,
    days_below_goal: belowGoal,
    regularity_metrics: regularityMetrics,
  };
}

// ============================================================================
// SLEEP-WEIGHT CORRELATION INSIGHT
// ============================================================================

import type { SleepWeightCorrelation } from '../types/sleep.types';

interface WeightEntry {
  date: string;
  weight: number;
}

/**
 * Calculate correlation between sleep and weight changes
 */
export function calculateSleepWeightCorrelation(
  sleepEntries: SleepEntry[],
  weightEntries: WeightEntry[]
): SleepWeightCorrelation {
  const defaultResult: SleepWeightCorrelation = {
    correlation_coefficient: 0,
    correlation_strength: 'none',
    insight_message: 'Not enough data to analyze sleep-weight correlation.',
    recommendation: null,
    avg_sleep_on_weight_loss_days: null,
    avg_sleep_on_weight_gain_days: null,
  };

  if (sleepEntries.length < 7 || weightEntries.length < 3) {
    return defaultResult;
  }

  // Create maps for quick lookup
  const sleepMap = new Map<string, number>();
  sleepEntries.forEach((e) => sleepMap.set(e.date, e.duration_hours));

  // Sort weight entries and calculate day-over-day changes
  const sortedWeight = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weightLossDays: number[] = [];
  const weightGainDays: number[] = [];

  for (let i = 1; i < sortedWeight.length; i++) {
    const prev = sortedWeight[i - 1];
    const curr = sortedWeight[i];
    const weightChange = curr.weight - prev.weight;

    // Look for sleep on the night before weight measurement
    const sleepDate = new Date(curr.date);
    sleepDate.setDate(sleepDate.getDate() - 1);
    const sleepDateStr = sleepDate.toISOString().split('T')[0];
    const sleepHours = sleepMap.get(sleepDateStr);

    if (sleepHours !== undefined) {
      if (weightChange < -0.1) {
        weightLossDays.push(sleepHours);
      } else if (weightChange > 0.1) {
        weightGainDays.push(sleepHours);
      }
    }
  }

  // Calculate averages
  const avgSleepOnLoss = weightLossDays.length > 0
    ? weightLossDays.reduce((a, b) => a + b, 0) / weightLossDays.length
    : null;
  const avgSleepOnGain = weightGainDays.length > 0
    ? weightGainDays.reduce((a, b) => a + b, 0) / weightGainDays.length
    : null;

  // Generate insight message
  let insightMessage = 'Not enough correlated data to determine sleep-weight relationship.';
  let recommendation: string | null = null;
  let correlationStrength: 'strong' | 'moderate' | 'weak' | 'none' = 'none';
  let correlationCoefficient = 0;

  if (avgSleepOnLoss !== null && avgSleepOnGain !== null) {
    const diff = avgSleepOnLoss - avgSleepOnGain;

    if (diff > 0.5) {
      correlationStrength = 'moderate';
      correlationCoefficient = 0.4;
      insightMessage = `You tend to lose weight after nights with ${avgSleepOnLoss.toFixed(1)}h of sleep vs ${avgSleepOnGain.toFixed(1)}h on weight gain days.`;
      recommendation = 'Prioritizing 7+ hours of sleep may support your weight goals.';
    } else if (diff > 0.25) {
      correlationStrength = 'weak';
      correlationCoefficient = 0.2;
      insightMessage = `There's a slight pattern: more sleep correlates with weight loss days.`;
      recommendation = 'Consider tracking sleep more consistently for clearer insights.';
    } else {
      correlationStrength = 'none';
      insightMessage = 'Your sleep duration doesn\'t show a clear pattern with weight changes.';
    }
  } else if (avgSleepOnLoss !== null) {
    insightMessage = `On days you lost weight, you averaged ${avgSleepOnLoss.toFixed(1)}h of sleep the night before.`;
  } else if (avgSleepOnGain !== null) {
    insightMessage = `On days you gained weight, you averaged ${avgSleepOnGain.toFixed(1)}h of sleep the night before.`;
  }

  return {
    correlation_coefficient: correlationCoefficient,
    correlation_strength: correlationStrength,
    insight_message: insightMessage,
    recommendation,
    avg_sleep_on_weight_loss_days: avgSleepOnLoss !== null ? Math.round(avgSleepOnLoss * 10) / 10 : null,
    avg_sleep_on_weight_gain_days: avgSleepOnGain !== null ? Math.round(avgSleepOnGain * 10) / 10 : null,
  };
}
