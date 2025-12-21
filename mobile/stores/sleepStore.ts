/**
 * Zustand Store for Sleep Tracking
 *
 * Production-ready state management with:
 * - Centralized sleep data
 * - Loading/error states
 * - Optimistic updates
 * - Month-based caching
 * - Calendar data computation
 * - Trend calculations
 * - Dashboard data caching
 */

import { create } from 'zustand';
import { sleepService } from '../services/sleepService';
import type {
  SleepEntry,
  SleepCreateData,
  SleepUpdateData,
  SleepMonthlySummary,
  SleepTrends,
  SleepCalendarDay,
  DashboardSleepData,
  SleepWeekComparison,
  SleepGoal,
  SleepGoalProgress,
  SleepRegularityMetrics,
  SleepAnalyticsData,
  SleepWeightCorrelation,
} from '../types/sleep.types';
import {
  getSleepStatus,
  calculateSleepTrends,
  calculateMonthlySummary,
  getDashboardSleepData,
  getWeekComparison,
  calculateSleepRegularityIndex,
  calculateSleepGoalProgress,
  generateSleepAnalytics,
  calculateSleepWeightCorrelation,
  DEFAULT_SLEEP_GOAL,
} from '../utils/sleepCalculations';

// ============================================================================
// TYPES
// ============================================================================

interface SleepState {
  // Data
  entries: SleepEntry[];
  entriesByDate: Map<string, SleepEntry>;
  calendarData: Map<string, SleepCalendarDay>;

  // Current view state
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  selectedEntry: SleepEntry | null;

  // Loading states
  isLoading: boolean;
  isLoadingMonth: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Cached data
  loadedMonths: Set<string>;
  monthlySummaries: Map<string, SleepMonthlySummary>;
  dashboardData: DashboardSleepData | null;
  dashboardDataTimestamp: number | null;

  // Sleep goal
  sleepGoal: SleepGoal;

  // Analytics cache
  analytics7Day: SleepAnalyticsData | null;
  analytics30Day: SleepAnalyticsData | null;
  regularityMetrics: SleepRegularityMetrics | null;
  goalProgress: SleepGoalProgress | null;
  analyticsTimestamp: number | null;

  // Actions
  setCurrentMonth: (year: number, month: number) => void;
  setSelectedDate: (date: string | null) => void;

  // Data fetching
  fetchEntries: (forceRefresh?: boolean) => Promise<void>;
  fetchMonthEntries: (year: number, month: number, forceRefresh?: boolean) => Promise<void>;
  fetchAllRecentEntries: () => Promise<void>;
  fetchDashboardData: (forceRefresh?: boolean) => Promise<DashboardSleepData>;

  // CRUD operations
  createEntry: (data: SleepCreateData) => Promise<SleepEntry | null>;
  updateEntry: (id: number, data: SleepUpdateData) => Promise<SleepEntry | null>;
  upsertEntryByDate: (date: string, data: SleepCreateData) => Promise<SleepEntry | null>;
  deleteEntry: (id: number) => Promise<boolean>;
  deleteEntryByDate: (date: string) => Promise<boolean>;

  // Computed data
  getEntryForDate: (date: string) => SleepEntry | null;
  getTrendsForDate: (date: string) => SleepTrends;
  getMonthlySummary: (year: number, month: number) => SleepMonthlySummary;
  getWeekComparison: () => SleepWeekComparison;
  getRecentEntries: (count: number) => SleepEntry[];
  get7DayAverage: () => number | null;

  // Analytics
  getAnalytics7Day: (forceRefresh?: boolean) => SleepAnalyticsData;
  getAnalytics30Day: (forceRefresh?: boolean) => SleepAnalyticsData;
  getRegularityMetrics: (forceRefresh?: boolean) => SleepRegularityMetrics;
  getGoalProgress: (forceRefresh?: boolean) => SleepGoalProgress;
  getSleepWeightCorrelation: (weightEntries: Array<{ date: string; weight: number }>) => SleepWeightCorrelation;

  // Goal management
  setSleepGoal: (goal: Partial<SleepGoal>) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
  invalidateAnalyticsCache: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const getMonthKey = (year: number, month: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

const initialState = {
  entries: [],
  entriesByDate: new Map<string, SleepEntry>(),
  calendarData: new Map<string, SleepCalendarDay>(),
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedDate: null,
  selectedEntry: null,
  isLoading: false,
  isLoadingMonth: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  loadedMonths: new Set<string>(),
  monthlySummaries: new Map<string, SleepMonthlySummary>(),
  dashboardData: null,
  dashboardDataTimestamp: null,
  sleepGoal: DEFAULT_SLEEP_GOAL,
  analytics7Day: null,
  analytics30Day: null,
  regularityMetrics: null,
  goalProgress: null,
  analyticsTimestamp: null,
};

// Build calendar data from entries
function buildCalendarData(entries: SleepEntry[]): Map<string, SleepCalendarDay> {
  const calendarData = new Map<string, SleepCalendarDay>();

  entries.forEach((entry) => {
    calendarData.set(entry.date, {
      date: entry.date,
      hasData: true,
      entry,
      duration_hours: entry.duration_hours,
      status: getSleepStatus(entry.duration_hours),
    });
  });

  return calendarData;
}

// ============================================================================
// STORE
// ============================================================================

export const useSleepStore = create<SleepState>((set, get) => ({
  ...initialState,

  // ========================================
  // STATE SETTERS
  // ========================================

  setCurrentMonth: (year: number, month: number) => {
    set({ currentYear: year, currentMonth: month });
    // Auto-fetch data for new month if not loaded
    const monthKey = getMonthKey(year, month);
    if (!get().loadedMonths.has(monthKey)) {
      get().fetchMonthEntries(year, month);
    }
  },

  setSelectedDate: (date: string | null) => {
    const { entriesByDate } = get();
    const entry = date ? entriesByDate.get(date) || null : null;
    set({ selectedDate: date, selectedEntry: entry });
  },

  // ========================================
  // DATA FETCHING
  // ========================================

  fetchEntries: async (forceRefresh = false) => {
    const { isLoading, currentYear, currentMonth } = get();
    if (isLoading && !forceRefresh) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch current month and adjacent months for smoother navigation
      const months = [
        { year: currentYear, month: currentMonth },
        {
          year: currentMonth === 0 ? currentYear - 1 : currentYear,
          month: currentMonth === 0 ? 11 : currentMonth - 1,
        },
        {
          year: currentMonth === 11 ? currentYear + 1 : currentYear,
          month: currentMonth === 11 ? 0 : currentMonth + 1,
        },
      ];

      const allEntries: SleepEntry[] = [];
      const loadedMonths = new Set<string>();

      for (const { year, month } of months) {
        const monthEntries = await sleepService.getSleepEntriesByMonth(year, month);
        allEntries.push(...monthEntries);
        loadedMonths.add(getMonthKey(year, month));
      }

      // Deduplicate by ID
      const uniqueEntries = Array.from(new Map(allEntries.map((e) => [e.id, e])).values());

      // Build lookup maps
      const entriesByDate = new Map<string, SleepEntry>();
      uniqueEntries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      // Build calendar data
      const calendarData = buildCalendarData(uniqueEntries);

      set({
        entries: uniqueEntries,
        entriesByDate,
        calendarData,
        loadedMonths,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch sleep entries',
      });
    }
  },

  fetchMonthEntries: async (year: number, month: number, forceRefresh = false) => {
    const { loadedMonths, entries, isLoadingMonth } = get();
    const monthKey = getMonthKey(year, month);

    if ((loadedMonths.has(monthKey) && !forceRefresh) || isLoadingMonth) return;

    set({ isLoadingMonth: true, error: null });

    try {
      const monthEntries = await sleepService.getSleepEntriesByMonth(year, month);

      // Merge with existing entries
      const existingOtherMonths = entries.filter((e) => {
        const d = new Date(e.date);
        return !(d.getFullYear() === year && d.getMonth() === month);
      });

      const allEntries = [...existingOtherMonths, ...monthEntries];

      // Deduplicate
      const uniqueEntries = Array.from(new Map(allEntries.map((e) => [e.id, e])).values());

      // Build lookup maps
      const entriesByDate = new Map<string, SleepEntry>();
      uniqueEntries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      // Build calendar data
      const calendarData = buildCalendarData(uniqueEntries);

      // Update loaded months
      const newLoadedMonths = new Set(loadedMonths);
      newLoadedMonths.add(monthKey);

      set({
        entries: uniqueEntries,
        entriesByDate,
        calendarData,
        loadedMonths: newLoadedMonths,
        isLoadingMonth: false,
      });
    } catch (error: any) {
      set({
        isLoadingMonth: false,
        error: error.message || 'Failed to fetch month data',
      });
    }
  },

  fetchAllRecentEntries: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch last 90 days of entries
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);

      const entries = await sleepService.getSleepEntries({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        limit: 100,
      });

      // Build lookup maps
      const entriesByDate = new Map<string, SleepEntry>();
      entries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      // Build calendar data
      const calendarData = buildCalendarData(entries);

      // Mark relevant months as loaded
      const loadedMonths = new Set<string>();
      entries.forEach((e) => {
        const d = new Date(e.date);
        loadedMonths.add(getMonthKey(d.getFullYear(), d.getMonth()));
      });

      set({
        entries,
        entriesByDate,
        calendarData,
        loadedMonths,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch sleep entries',
      });
    }
  },

  fetchDashboardData: async (forceRefresh = false) => {
    const { dashboardData, dashboardDataTimestamp, entries } = get();

    // Use cached data if available and fresh (within 5 minutes)
    const cacheAge = dashboardDataTimestamp ? Date.now() - dashboardDataTimestamp : Infinity;
    if (!forceRefresh && dashboardData && cacheAge < 5 * 60 * 1000) {
      return dashboardData;
    }

    try {
      // If we have entries, compute locally
      if (entries.length > 0) {
        const data = getDashboardSleepData(entries);
        set({
          dashboardData: data,
          dashboardDataTimestamp: Date.now(),
        });
        return data;
      }

      // Otherwise fetch from service
      const data = await sleepService.getDashboardData();
      set({
        dashboardData: data,
        dashboardDataTimestamp: Date.now(),
      });
      return data;
    } catch (error: any) {
      // Return cached data on error if available
      if (dashboardData) return dashboardData;

      // Return default empty data
      return {
        last_night: {
          duration_hours: null,
          sleep_quality: null,
          bedtime: null,
          wake_time: null,
          status: 'insufficient' as const,
        },
        seven_day_avg: null,
        trend: null,
        trend_vs_previous_week: null,
        status_info: {
          status: 'insufficient' as const,
          color: '#666',
          label: 'No data',
          description: 'Start tracking your sleep',
          icon: 'moon-outline',
        },
        streak_days: 0,
      };
    }
  },

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  createEntry: async (data: SleepCreateData) => {
    set({ isSaving: true, error: null });

    try {
      const newEntry = await sleepService.createSleepEntry(data);

      // Update state with new entry
      const { entries, loadedMonths } = get();

      const updatedEntries = [...entries, newEntry];
      const entriesByDate = new Map<string, SleepEntry>();
      updatedEntries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      const calendarData = buildCalendarData(updatedEntries);

      // Mark month as needing refresh
      const d = new Date(newEntry.date);
      const monthKey = getMonthKey(d.getFullYear(), d.getMonth());
      const updatedLoadedMonths = new Set(loadedMonths);
      updatedLoadedMonths.add(monthKey);

      set({
        entries: updatedEntries,
        entriesByDate,
        calendarData,
        loadedMonths: updatedLoadedMonths,
        isSaving: false,
        dashboardData: null, // Invalidate cache
        dashboardDataTimestamp: null,
      });

      return newEntry;
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.message || 'Failed to create sleep entry',
      });
      return null;
    }
  },

  updateEntry: async (id: number, data: SleepUpdateData) => {
    set({ isSaving: true, error: null });

    try {
      const updatedEntry = await sleepService.updateSleepEntry(id, data);

      // Update state
      const { entries } = get();
      const updatedEntries = entries.map((e) => (e.id === id ? updatedEntry : e));

      const entriesByDate = new Map<string, SleepEntry>();
      updatedEntries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      const calendarData = buildCalendarData(updatedEntries);

      set({
        entries: updatedEntries,
        entriesByDate,
        calendarData,
        selectedEntry: updatedEntry,
        isSaving: false,
        dashboardData: null, // Invalidate cache
        dashboardDataTimestamp: null,
      });

      return updatedEntry;
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.message || 'Failed to update sleep entry',
      });
      return null;
    }
  },

  upsertEntryByDate: async (date: string, data: SleepCreateData) => {
    set({ isSaving: true, error: null });

    try {
      // Use the service's upsert method which properly checks the backend
      const result = await sleepService.upsertSleepEntryByDate(date, { ...data, date });

      // Update state with the result
      const { entries, loadedMonths } = get();

      // Remove any existing entry for this date and add the new one
      const filteredEntries = entries.filter((e) => e.date !== date);
      const updatedEntries = [...filteredEntries, result];

      const entriesByDate = new Map<string, SleepEntry>();
      updatedEntries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      const calendarData = buildCalendarData(updatedEntries);

      // Mark month as loaded
      const d = new Date(result.date);
      const monthKey = getMonthKey(d.getFullYear(), d.getMonth());
      const updatedLoadedMonths = new Set(loadedMonths);
      updatedLoadedMonths.add(monthKey);

      set({
        entries: updatedEntries,
        entriesByDate,
        calendarData,
        loadedMonths: updatedLoadedMonths,
        isSaving: false,
        dashboardData: null,
        dashboardDataTimestamp: null,
      });

      return result;
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.message || 'Failed to save sleep entry',
      });
      return null;
    }
  },

  deleteEntry: async (id: number) => {
    set({ isDeleting: true, error: null });

    try {
      await sleepService.deleteSleepEntry(id);

      // Update state
      const { entries } = get();
      const updatedEntries = entries.filter((e) => e.id !== id);

      const entriesByDate = new Map<string, SleepEntry>();
      updatedEntries.forEach((e) => {
        entriesByDate.set(e.date, e);
      });

      const calendarData = buildCalendarData(updatedEntries);

      set({
        entries: updatedEntries,
        entriesByDate,
        calendarData,
        selectedDate: null,
        selectedEntry: null,
        isDeleting: false,
        dashboardData: null, // Invalidate cache
        dashboardDataTimestamp: null,
      });

      return true;
    } catch (error: any) {
      set({
        isDeleting: false,
        error: error.message || 'Failed to delete sleep entry',
      });
      return false;
    }
  },

  deleteEntryByDate: async (date: string) => {
    const { entriesByDate } = get();
    const entry = entriesByDate.get(date);

    if (entry) {
      return get().deleteEntry(entry.id);
    }
    return false;
  },

  // ========================================
  // COMPUTED DATA
  // ========================================

  getEntryForDate: (date: string) => {
    return get().entriesByDate.get(date) || null;
  },

  getTrendsForDate: (date: string) => {
    const { entries, entriesByDate } = get();
    const entry = entriesByDate.get(date);

    return calculateSleepTrends(entry || null, entries);
  },

  getMonthlySummary: (year: number, month: number) => {
    const { entries, monthlySummaries } = get();
    const monthKey = getMonthKey(year, month);

    // Check cache first
    const cached = monthlySummaries.get(monthKey);
    if (cached) return cached;

    // Calculate and cache
    const summary = calculateMonthlySummary(year, month, entries);

    const updatedSummaries = new Map(monthlySummaries);
    updatedSummaries.set(monthKey, summary);
    set({ monthlySummaries: updatedSummaries });

    return summary;
  },

  getWeekComparison: () => {
    const { entries } = get();
    return getWeekComparison(entries);
  },

  getRecentEntries: (count: number) => {
    const { entries } = get();
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  },

  get7DayAverage: () => {
    const { entries } = get();
    if (entries.length === 0) return null;

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d >= sevenDaysAgo && d <= today;
    });

    if (recentEntries.length === 0) return null;

    const totalHours = recentEntries.reduce((sum, e) => sum + e.duration_hours, 0);
    return Math.round((totalHours / recentEntries.length) * 10) / 10;
  },

  // ========================================
  // ANALYTICS
  // ========================================

  getAnalytics7Day: (forceRefresh = false) => {
    const { entries, analytics7Day, analyticsTimestamp, sleepGoal } = get();
    const cacheAge = analyticsTimestamp ? Date.now() - analyticsTimestamp : Infinity;

    if (!forceRefresh && analytics7Day && cacheAge < 5 * 60 * 1000) {
      return analytics7Day;
    }

    const analytics = generateSleepAnalytics(entries, 7, sleepGoal);
    set({ analytics7Day: analytics, analyticsTimestamp: Date.now() });
    return analytics;
  },

  getAnalytics30Day: (forceRefresh = false) => {
    const { entries, analytics30Day, analyticsTimestamp, sleepGoal } = get();
    const cacheAge = analyticsTimestamp ? Date.now() - analyticsTimestamp : Infinity;

    if (!forceRefresh && analytics30Day && cacheAge < 5 * 60 * 1000) {
      return analytics30Day;
    }

    const analytics = generateSleepAnalytics(entries, 30, sleepGoal);
    set({ analytics30Day: analytics, analyticsTimestamp: Date.now() });
    return analytics;
  },

  getRegularityMetrics: (forceRefresh = false) => {
    const { entries, regularityMetrics, analyticsTimestamp } = get();
    const cacheAge = analyticsTimestamp ? Date.now() - analyticsTimestamp : Infinity;

    if (!forceRefresh && regularityMetrics && cacheAge < 5 * 60 * 1000) {
      return regularityMetrics;
    }

    const metrics = calculateSleepRegularityIndex(entries);
    set({ regularityMetrics: metrics, analyticsTimestamp: Date.now() });
    return metrics;
  },

  getGoalProgress: (forceRefresh = false) => {
    const { entries, goalProgress, analyticsTimestamp, sleepGoal } = get();
    const cacheAge = analyticsTimestamp ? Date.now() - analyticsTimestamp : Infinity;

    if (!forceRefresh && goalProgress && cacheAge < 5 * 60 * 1000) {
      return goalProgress;
    }

    const progress = calculateSleepGoalProgress(entries, sleepGoal);
    set({ goalProgress: progress, analyticsTimestamp: Date.now() });
    return progress;
  },

  getSleepWeightCorrelation: (weightEntries: Array<{ date: string; weight: number }>) => {
    const { entries } = get();
    return calculateSleepWeightCorrelation(entries, weightEntries);
  },

  // ========================================
  // GOAL MANAGEMENT
  // ========================================

  setSleepGoal: (goalUpdate: Partial<SleepGoal>) => {
    const { sleepGoal } = get();
    const newGoal = { ...sleepGoal, ...goalUpdate };
    set({
      sleepGoal: newGoal,
      // Invalidate caches that depend on goal
      analytics7Day: null,
      analytics30Day: null,
      goalProgress: null,
    });
  },

  // ========================================
  // UTILITY
  // ========================================

  clearError: () => set({ error: null }),

  reset: () => set(initialState),

  invalidateAnalyticsCache: () => {
    set({
      analytics7Day: null,
      analytics30Day: null,
      regularityMetrics: null,
      goalProgress: null,
      analyticsTimestamp: null,
      dashboardData: null,
      dashboardDataTimestamp: null,
    });
  },
}));

export default useSleepStore;
