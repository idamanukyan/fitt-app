/**
 * Sleep Service for HyperFit
 *
 * Production-ready API service with:
 * - Full CRUD operations for sleep entries
 * - Date-based queries (by month, date range)
 * - Demo mode support with realistic mock data
 * - Trend and statistics calculations
 * - Future health platform integration support
 */

import apiClient from './api';
import type {
  SleepEntry,
  SleepCreateData,
  SleepUpdateData,
  SleepQueryParams,
  SleepMonthlySummary,
  SleepTrends,
  SleepStatistics,
  DashboardSleepData,
  SleepSource,
} from '../types/sleep.types';
import {
  calculateSleepDuration,
  calculateSleepDurationMinutes,
  calculateSleepTrends,
  calculateMonthlySummary,
  getDashboardSleepData,
  getRolling7DayAverage,
  getRolling30DayAverage,
  getWeekComparison,
  getSleepStatus,
  createBedtimeISO,
  createWakeTimeISO,
  parseTimeString,
} from '../utils/sleepCalculations';

// Demo mode - synced with other services
const DEMO_MODE = false;

// ============================================================================
// DEMO DATA GENERATION
// ============================================================================

/**
 * Generate realistic demo sleep data for the last 90 days
 */
const generateDemoSleepEntries = (): SleepEntry[] => {
  const entries: SleepEntry[] = [];
  const today = new Date();

  // Deterministic skip pattern for realistic gaps
  const skipDays = new Set([3, 7, 12, 15, 19, 24, 28, 33, 37, 41, 45, 50, 54, 58, 62, 67, 71, 75, 79, 84, 88]);

  // Base sleep patterns
  let baseBedtimeHour = 23;
  let baseWakeHour = 7;

  for (let i = 90; i >= 0; i--) {
    // Skip some days for realism (but always include recent days)
    if (skipDays.has(i) && i > 3) continue;

    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Add variation to bedtime (22:00 - 00:30)
    const bedtimeVariation = ((i % 5) - 2) * 0.5; // -1 to +1 hours
    const bedtimeHour = Math.round(baseBedtimeHour + bedtimeVariation);
    const bedtimeMinute = (i % 4) * 15; // 0, 15, 30, 45

    // Add variation to wake time (6:00 - 8:30)
    const wakeVariation = ((i % 7) - 3) * 0.25; // -0.75 to +1 hours
    const wakeHour = Math.round(baseWakeHour + wakeVariation);
    const wakeMinute = ((i + 2) % 4) * 15;

    // Create bedtime and wake time
    const bedtime = createBedtimeISO(dateStr, bedtimeHour, bedtimeMinute);
    const wakeTime = createWakeTimeISO(dateStr, bedtimeHour, wakeHour, wakeMinute);

    // Calculate duration
    const durationHours = calculateSleepDuration(bedtime, wakeTime);
    const durationMinutes = calculateSleepDurationMinutes(bedtime, wakeTime);

    // Generate quality score (correlates slightly with duration)
    let quality: number | undefined;
    if (i % 3 !== 0) {
      // ~66% of entries have quality
      const baseQuality = Math.min(100, Math.max(40, 60 + durationHours * 5));
      quality = Math.round(baseQuality + ((i % 11) - 5) * 3);
    }

    // Generate notes for some entries
    let notes: string | undefined;
    if (i % 7 === 0) {
      const noteOptions = [
        'Slept well, felt refreshed',
        'Had trouble falling asleep',
        'Woke up once during the night',
        'Great sleep, no interruptions',
        'Went to bed late, tired in the morning',
        'Used sleep meditation app',
        'Afternoon nap may have affected sleep',
      ];
      notes = noteOptions[i % noteOptions.length];
    }

    const entry: SleepEntry = {
      id: 1000 - i,
      user_id: 1,
      date: dateStr,
      bedtime,
      wake_time: wakeTime,
      duration_hours: durationHours,
      duration_minutes: durationMinutes,
      sleep_quality: quality,
      notes,
      source: 'manual' as SleepSource,
      created_at: date.toISOString(),
    };

    entries.push(entry);
  }

  return entries;
};

// In-memory store for demo mode
let demoSleepEntries: SleepEntry[] = generateDemoSleepEntries();

/**
 * Simulate network delay for demo mode
 */
const simulateNetworkDelay = async (ms: number = 100): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Helper to get user's timezone
 */
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

/**
 * Helper to format date to YYYY-MM-DD
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper to get start and end dates for a month
 */
export const getMonthDateRange = (year: number, month: number): { start: string; end: string } => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start: formatDateToISO(start),
    end: formatDateToISO(end),
  };
};

// ============================================================================
// SLEEP SERVICE
// ============================================================================

export const sleepService = {
  // ========================================
  // CRUD OPERATIONS
  // ========================================

  /**
   * Get all sleep entries with optional filtering
   */
  async getSleepEntries(params: SleepQueryParams = {}): Promise<SleepEntry[]> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const { start_date, end_date, skip = 0, limit = 100 } = params;

      let filtered = [...demoSleepEntries];

      if (start_date) {
        filtered = filtered.filter((e) => e.date >= start_date);
      }
      if (end_date) {
        filtered = filtered.filter((e) => e.date <= end_date);
      }

      // Sort by date descending (most recent first)
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return filtered.slice(skip, skip + limit);
    }

    const { month, start_date, end_date, skip = 0, limit = 100 } = params;

    const queryParams: Record<string, any> = { skip, limit };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const range = getMonthDateRange(year, monthNum - 1);
      queryParams.start_date = range.start;
      queryParams.end_date = range.end;
    } else {
      if (start_date) queryParams.start_date = start_date;
      if (end_date) queryParams.end_date = end_date;
    }

    queryParams.timezone = getUserTimezone();

    const response = await apiClient.get<SleepEntry[]>('/api/v6/sleep/', { params: queryParams });
    return response.data;
  },

  /**
   * Get sleep entries for a specific month
   */
  async getSleepEntriesByMonth(year: number, month: number): Promise<SleepEntry[]> {
    const range = getMonthDateRange(year, month);
    return this.getSleepEntries({
      start_date: range.start,
      end_date: range.end,
      limit: 31,
    });
  },

  /**
   * Get sleep entry for a specific date
   */
  async getSleepEntryByDate(date: string): Promise<SleepEntry | null> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return demoSleepEntries.find((e) => e.date === date) || null;
    }

    try {
      const response = await apiClient.get<SleepEntry>(`/api/v6/sleep/date/${date}`, {
        params: { timezone: getUserTimezone() },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get latest sleep entry
   */
  async getLatestSleepEntry(): Promise<SleepEntry | null> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const sorted = [...demoSleepEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0] || null;
    }

    try {
      const response = await apiClient.get<SleepEntry>('/api/v6/sleep/latest');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new sleep entry
   */
  async createSleepEntry(data: SleepCreateData): Promise<SleepEntry> {
    // Parse bedtime and wake time
    const { hour: bedtimeHour, minute: bedtimeMinute } = parseTimeString(
      data.bedtime.includes('T') ? data.bedtime.split('T')[1].slice(0, 5) : data.bedtime
    );
    const { hour: wakeHour, minute: wakeMinute } = parseTimeString(
      data.wake_time.includes('T') ? data.wake_time.split('T')[1].slice(0, 5) : data.wake_time
    );

    // Create ISO strings
    const bedtime = data.bedtime.includes('T')
      ? data.bedtime
      : createBedtimeISO(data.date, bedtimeHour, bedtimeMinute);
    const wakeTime = data.wake_time.includes('T')
      ? data.wake_time
      : createWakeTimeISO(data.date, bedtimeHour, wakeHour, wakeMinute);

    // Calculate duration
    const durationHours = calculateSleepDuration(bedtime, wakeTime);
    const durationMinutes = calculateSleepDurationMinutes(bedtime, wakeTime);

    if (DEMO_MODE) {
      await simulateNetworkDelay();

      // Check for existing entry on this date
      const existingIndex = demoSleepEntries.findIndex((e) => e.date === data.date);
      if (existingIndex !== -1) {
        throw new Error('Sleep entry already exists for this date. Use update instead.');
      }

      const newId = Math.max(0, ...demoSleepEntries.map((e) => e.id)) + 1;

      const newEntry: SleepEntry = {
        id: newId,
        user_id: 1,
        date: data.date,
        bedtime,
        wake_time: wakeTime,
        duration_hours: durationHours,
        duration_minutes: durationMinutes,
        sleep_quality: data.sleep_quality,
        notes: data.notes,
        source: data.source || 'manual',
        created_at: new Date().toISOString(),
      };

      demoSleepEntries.push(newEntry);
      return newEntry;
    }

    const payload = {
      ...data,
      bedtime,
      wake_time: wakeTime,
      duration_hours: durationHours,
      duration_minutes: durationMinutes,
      timezone: getUserTimezone(),
    };

    const response = await apiClient.post<SleepEntry>('/api/v6/sleep/', payload);
    return response.data;
  },

  /**
   * Update existing sleep entry
   */
  async updateSleepEntry(id: number, data: SleepUpdateData): Promise<SleepEntry> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();

      const index = demoSleepEntries.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error('Sleep entry not found');
      }

      const existing = demoSleepEntries[index];

      // If bedtime or wake time changed, recalculate duration
      let bedtime = existing.bedtime;
      let wakeTime = existing.wake_time;

      if (data.bedtime) {
        const { hour, minute } = parseTimeString(
          data.bedtime.includes('T') ? data.bedtime.split('T')[1].slice(0, 5) : data.bedtime
        );
        bedtime = data.bedtime.includes('T')
          ? data.bedtime
          : createBedtimeISO(data.date || existing.date, hour, minute);
      }

      if (data.wake_time) {
        const bedHour = new Date(bedtime).getHours();
        const { hour, minute } = parseTimeString(
          data.wake_time.includes('T') ? data.wake_time.split('T')[1].slice(0, 5) : data.wake_time
        );
        wakeTime = data.wake_time.includes('T')
          ? data.wake_time
          : createWakeTimeISO(data.date || existing.date, bedHour, hour, minute);
      }

      const durationHours = calculateSleepDuration(bedtime, wakeTime);
      const durationMinutes = calculateSleepDurationMinutes(bedtime, wakeTime);

      const updated: SleepEntry = {
        ...existing,
        date: data.date ?? existing.date,
        bedtime,
        wake_time: wakeTime,
        duration_hours: durationHours,
        duration_minutes: durationMinutes,
        sleep_quality: data.sleep_quality ?? existing.sleep_quality,
        notes: data.notes ?? existing.notes,
        updated_at: new Date().toISOString(),
      };

      demoSleepEntries[index] = updated;
      return updated;
    }

    const response = await apiClient.put<SleepEntry>(`/api/v6/sleep/${id}`, data);
    return response.data;
  },

  /**
   * Upsert sleep entry by date (create or update)
   */
  async upsertSleepEntryByDate(date: string, data: SleepCreateData): Promise<SleepEntry> {
    if (DEMO_MODE) {
      const existing = await this.getSleepEntryByDate(date);
      if (existing) {
        return this.updateSleepEntry(existing.id, data);
      } else {
        return this.createSleepEntry({ ...data, date });
      }
    }

    // Parse bedtime and wake time
    const { hour: bedtimeHour, minute: bedtimeMinute } = parseTimeString(
      data.bedtime.includes('T') ? data.bedtime.split('T')[1].slice(0, 5) : data.bedtime
    );
    const { hour: wakeHour, minute: wakeMinute } = parseTimeString(
      data.wake_time.includes('T') ? data.wake_time.split('T')[1].slice(0, 5) : data.wake_time
    );

    // Create ISO strings
    const bedtime = data.bedtime.includes('T')
      ? data.bedtime
      : createBedtimeISO(date, bedtimeHour, bedtimeMinute);
    const wakeTime = data.wake_time.includes('T')
      ? data.wake_time
      : createWakeTimeISO(date, bedtimeHour, wakeHour, wakeMinute);

    // Calculate duration
    const durationHours = calculateSleepDuration(bedtime, wakeTime);
    const durationMinutes = calculateSleepDurationMinutes(bedtime, wakeTime);

    const payload = {
      date,
      bedtime,
      wake_time: wakeTime,
      duration_hours: durationHours,
      duration_minutes: durationMinutes,
      sleep_quality: data.sleep_quality,
      notes: data.notes,
      source: data.source || 'manual',
      timezone: getUserTimezone(),
    };

    const response = await apiClient.post<SleepEntry>('/api/v6/sleep/upsert', payload);
    return response.data;
  },

  /**
   * Delete sleep entry by ID
   */
  async deleteSleepEntry(id: number): Promise<void> {
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      demoSleepEntries = demoSleepEntries.filter((e) => e.id !== id);
      return;
    }

    await apiClient.delete(`/api/v6/sleep/${id}`);
  },

  /**
   * Delete sleep entry by date
   */
  async deleteSleepEntryByDate(date: string): Promise<boolean> {
    const entry = await this.getSleepEntryByDate(date);
    if (entry) {
      await this.deleteSleepEntry(entry.id);
      return true;
    }
    return false;
  },

  // ========================================
  // ANALYTICS & STATISTICS
  // ========================================

  /**
   * Get dashboard sleep data
   */
  async getDashboardData(): Promise<DashboardSleepData> {
    const entries = await this.getSleepEntries({ limit: 30 });
    return getDashboardSleepData(entries);
  },

  /**
   * Get 7-day rolling average
   */
  async get7DayAverage(): Promise<number | null> {
    const entries = await this.getSleepEntries({ limit: 14 });
    const rolling = getRolling7DayAverage(entries);
    return rolling.avg_duration_hours;
  },

  /**
   * Get sleep trends for a specific entry
   */
  async getTrendsForEntry(entry: SleepEntry): Promise<SleepTrends> {
    const allEntries = await this.getSleepEntries({ limit: 60 });
    return calculateSleepTrends(entry, allEntries);
  },

  /**
   * Get monthly summary
   */
  async getMonthlySummary(year: number, month: number): Promise<SleepMonthlySummary> {
    const entries = await this.getSleepEntriesByMonth(year, month);
    return calculateMonthlySummary(year, month, entries);
  },

  /**
   * Get statistics for a time period
   */
  async getStatistics(startDate: string, endDate: string): Promise<SleepStatistics> {
    const entries = await this.getSleepEntries({
      start_date: startDate,
      end_date: endDate,
    });

    if (entries.length === 0) {
      return {
        period: `${startDate} to ${endDate}`,
        total_entries: 0,
        avg_duration_hours: null,
        avg_sleep_quality: null,
        avg_bedtime: null,
        avg_wake_time: null,
        min_duration_hours: null,
        max_duration_hours: null,
        total_sleep_hours: 0,
        consistency_score: null,
      };
    }

    const durations = entries.map((e) => e.duration_hours);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    const qualityEntries = entries.filter((e) => e.sleep_quality !== undefined);
    const avgQuality =
      qualityEntries.length > 0
        ? qualityEntries.reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / qualityEntries.length
        : null;

    // Calculate average bedtime and wake time
    const bedtimeMinutes = entries.map((e) => {
      const d = new Date(e.bedtime);
      let mins = d.getHours() * 60 + d.getMinutes();
      // Normalize around midnight (22:00 = 1320, 00:00 = 1440, 02:00 = 1560)
      if (mins < 720) mins += 1440;
      return mins;
    });
    const avgBedtimeMinutes = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
    const normalizedBedtime = avgBedtimeMinutes >= 1440 ? avgBedtimeMinutes - 1440 : avgBedtimeMinutes;
    const avgBedtimeHour = Math.floor(normalizedBedtime / 60);
    const avgBedtimeMin = Math.round(normalizedBedtime % 60);

    const wakeMinutes = entries.map((e) => {
      const d = new Date(e.wake_time);
      return d.getHours() * 60 + d.getMinutes();
    });
    const avgWakeMinutes = wakeMinutes.reduce((a, b) => a + b, 0) / wakeMinutes.length;
    const avgWakeHour = Math.floor(avgWakeMinutes / 60);
    const avgWakeMin = Math.round(avgWakeMinutes % 60);

    // Calculate consistency score
    const bedtimeVariance =
      bedtimeMinutes.reduce((sum, m) => sum + Math.pow(m - avgBedtimeMinutes, 2), 0) / bedtimeMinutes.length;
    const bedtimeStdDev = Math.sqrt(bedtimeVariance);
    const consistencyScore = Math.max(0, Math.min(100, 100 - (bedtimeStdDev / 180) * 100));

    return {
      period: `${startDate} to ${endDate}`,
      total_entries: entries.length,
      avg_duration_hours: Math.round(avgDuration * 100) / 100,
      avg_sleep_quality: avgQuality !== null ? Math.round(avgQuality) : null,
      avg_bedtime: `${avgBedtimeHour.toString().padStart(2, '0')}:${avgBedtimeMin.toString().padStart(2, '0')}`,
      avg_wake_time: `${avgWakeHour.toString().padStart(2, '0')}:${avgWakeMin.toString().padStart(2, '0')}`,
      min_duration_hours: Math.min(...durations),
      max_duration_hours: Math.max(...durations),
      total_sleep_hours: Math.round(durations.reduce((a, b) => a + b, 0) * 10) / 10,
      consistency_score: Math.round(consistencyScore),
    };
  },

  // ========================================
  // CLIENT-SIDE CALCULATIONS
  // ========================================

  /**
   * Calculate trends from local data
   */
  calculateTrends(currentEntry: SleepEntry | null, allEntries: SleepEntry[]): SleepTrends {
    return calculateSleepTrends(currentEntry, allEntries);
  },

  /**
   * Calculate monthly summary from local data
   */
  calculateMonthlySummary(year: number, month: number, entries: SleepEntry[]): SleepMonthlySummary {
    return calculateMonthlySummary(year, month, entries);
  },

  /**
   * Get week comparison from local data
   */
  getWeekComparison(entries: SleepEntry[]) {
    return getWeekComparison(entries);
  },

  /**
   * Get status for a duration
   */
  getSleepStatus(durationHours: number) {
    return getSleepStatus(durationHours);
  },

  // ========================================
  // FUTURE INTEGRATIONS
  // ========================================

  /**
   * Import sleep data from Apple Health (stub for future implementation)
   */
  async importFromAppleHealth(): Promise<SleepEntry[]> {
    // TODO: Implement Apple HealthKit integration
    // This would use expo-health-connect or react-native-health
    console.warn('Apple Health integration not yet implemented');
    return [];
  },

  /**
   * Import sleep data from Google Fit (stub for future implementation)
   */
  async importFromGoogleFit(): Promise<SleepEntry[]> {
    // TODO: Implement Google Fit integration
    // This would use expo-health-connect or react-native-google-fit
    console.warn('Google Fit integration not yet implemented');
    return [];
  },

  /**
   * Get suggestions for bedtime based on patterns
   */
  async getBedtimeSuggestion(): Promise<{ suggestedBedtime: string; reason: string } | null> {
    const entries = await this.getSleepEntries({ limit: 14 });

    if (entries.length < 5) {
      return null;
    }

    // Find most common bedtime
    const bedtimeHours = entries.map((e) => {
      const d = new Date(e.bedtime);
      const h = d.getHours();
      return h >= 12 ? h : h + 24;
    });

    const avgHour = bedtimeHours.reduce((a, b) => a + b, 0) / bedtimeHours.length;
    const normalizedHour = avgHour >= 24 ? avgHour - 24 : avgHour;

    const hour = Math.floor(normalizedHour);
    const minute = Math.round((normalizedHour - hour) * 60);

    // Round to nearest 15 minutes
    const roundedMinute = Math.round(minute / 15) * 15;
    const finalMinute = roundedMinute === 60 ? 0 : roundedMinute;
    const finalHour = roundedMinute === 60 ? hour + 1 : hour;

    return {
      suggestedBedtime: `${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`,
      reason: `Based on your sleep patterns, you usually go to bed around this time.`,
    };
  },
};

export default sleepService;
