/**
 * Zustand Store for Measurements
 *
 * Production-ready state management with:
 * - Centralized measurement data
 * - Loading/error states
 * - Optimistic updates
 * - Month-based caching
 * - Calendar data computation
 * - Trend calculations
 *
 * Why Zustand over React Query:
 * - Simpler mental model for this use case
 * - Better integration with React Native
 * - Easier offline-first implementation
 * - Flexible caching strategy
 * - Direct state mutations for optimistic updates
 */
import { create } from 'zustand';
import { measurementService, getDateFromMeasurement } from '../services/measurementService';
import type {
  Measurement,
  MeasurementCreateData,
  MeasurementUpdateData,
  MeasurementMonthlySummary,
  MeasurementTrends,
  MeasurementComparison,
} from '../types/api.types';

// Calendar day data structure
export interface CalendarDayData {
  date: string;
  hasData: boolean;
  measurement?: Measurement;
  weight?: number;
  trend: 'up' | 'down' | 'stable';
}

// Store state interface
interface MeasurementState {
  // Data
  measurements: Measurement[];
  measurementsByDate: Map<string, Measurement>;
  calendarData: Map<string, CalendarDayData>;

  // Current view state
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  selectedMeasurement: Measurement | null;

  // Loading states
  isLoading: boolean;
  isLoadingMonth: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Cached monthly data
  loadedMonths: Set<string>;
  monthlySummaries: Map<string, MeasurementMonthlySummary>;

  // Actions
  setCurrentMonth: (year: number, month: number) => void;
  setSelectedDate: (date: string | null) => void;

  // Data fetching
  fetchMeasurements: (forceRefresh?: boolean) => Promise<void>;
  fetchMonthMeasurements: (year: number, month: number, forceRefresh?: boolean) => Promise<void>;
  fetchAllRecentMeasurements: () => Promise<void>;

  // CRUD operations
  createMeasurement: (data: MeasurementCreateData) => Promise<Measurement | null>;
  updateMeasurement: (id: number, data: MeasurementUpdateData) => Promise<Measurement | null>;
  upsertMeasurementByDate: (date: string, data: MeasurementCreateData) => Promise<Measurement | null>;
  deleteMeasurement: (id: number) => Promise<boolean>;
  deleteMeasurementByDate: (date: string) => Promise<boolean>;

  // Computed data
  getMeasurementForDate: (date: string) => Measurement | null;
  getTrendsForDate: (date: string) => MeasurementTrends;
  getMonthlySummary: (year: number, month: number) => MeasurementMonthlySummary;
  getMonthComparison: () => MeasurementComparison | null;
  getRecentMeasurements: (count: number) => Measurement[];

  // Utility
  clearError: () => void;
  reset: () => void;
}

// Helper to get month key
const getMonthKey = (year: number, month: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

// Initial state
const initialState = {
  measurements: [],
  measurementsByDate: new Map<string, Measurement>(),
  calendarData: new Map<string, CalendarDayData>(),
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedDate: null,
  selectedMeasurement: null,
  isLoading: false,
  isLoadingMonth: false,
  isSaving: false,
  isDeleting: false,
  error: null,
  loadedMonths: new Set<string>(),
  monthlySummaries: new Map<string, MeasurementMonthlySummary>(),
};

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  ...initialState,

  // ========================================
  // STATE SETTERS
  // ========================================

  setCurrentMonth: (year: number, month: number) => {
    set({ currentYear: year, currentMonth: month });
    // Auto-fetch data for new month if not loaded
    const monthKey = getMonthKey(year, month);
    if (!get().loadedMonths.has(monthKey)) {
      get().fetchMonthMeasurements(year, month);
    }
  },

  setSelectedDate: (date: string | null) => {
    const { measurementsByDate } = get();
    const measurement = date ? measurementsByDate.get(date) || null : null;
    set({ selectedDate: date, selectedMeasurement: measurement });
  },

  // ========================================
  // DATA FETCHING
  // ========================================

  fetchMeasurements: async (forceRefresh = false) => {
    const { isLoading, currentYear, currentMonth } = get();
    if (isLoading && !forceRefresh) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch current month and adjacent months for smoother navigation
      const months = [
        { year: currentYear, month: currentMonth },
        { year: currentMonth === 0 ? currentYear - 1 : currentYear, month: currentMonth === 0 ? 11 : currentMonth - 1 },
        { year: currentMonth === 11 ? currentYear + 1 : currentYear, month: currentMonth === 11 ? 0 : currentMonth + 1 },
      ];

      const allMeasurements: Measurement[] = [];
      const loadedMonths = new Set<string>();

      for (const { year, month } of months) {
        const monthMeasurements = await measurementService.getMeasurementsByMonth(year, month);
        allMeasurements.push(...monthMeasurements);
        loadedMonths.add(getMonthKey(year, month));
      }

      // Deduplicate by ID
      const uniqueMeasurements = Array.from(
        new Map(allMeasurements.map((m) => [m.id, m])).values()
      );

      // Build lookup maps
      const measurementsByDate = new Map<string, Measurement>();
      uniqueMeasurements.forEach((m) => {
        measurementsByDate.set(getDateFromMeasurement(m), m);
      });

      // Build calendar data
      const calendarData = buildCalendarData(uniqueMeasurements);

      set({
        measurements: uniqueMeasurements,
        measurementsByDate,
        calendarData,
        loadedMonths,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch measurements',
      });
    }
  },

  fetchMonthMeasurements: async (year: number, month: number, forceRefresh = false) => {
    const { loadedMonths, measurements, isLoadingMonth } = get();
    const monthKey = getMonthKey(year, month);

    if ((loadedMonths.has(monthKey) && !forceRefresh) || isLoadingMonth) return;

    set({ isLoadingMonth: true, error: null });

    try {
      const monthMeasurements = await measurementService.getMeasurementsByMonth(year, month);

      // Merge with existing measurements
      const existingOtherMonths = measurements.filter((m) => {
        const d = new Date(m.recorded_at);
        return !(d.getFullYear() === year && d.getMonth() === month);
      });

      const allMeasurements = [...existingOtherMonths, ...monthMeasurements];

      // Deduplicate
      const uniqueMeasurements = Array.from(
        new Map(allMeasurements.map((m) => [m.id, m])).values()
      );

      // Build lookup maps
      const measurementsByDate = new Map<string, Measurement>();
      uniqueMeasurements.forEach((m) => {
        measurementsByDate.set(getDateFromMeasurement(m), m);
      });

      // Build calendar data
      const calendarData = buildCalendarData(uniqueMeasurements);

      // Update loaded months
      const newLoadedMonths = new Set(loadedMonths);
      newLoadedMonths.add(monthKey);

      set({
        measurements: uniqueMeasurements,
        measurementsByDate,
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

  fetchAllRecentMeasurements: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch last 90 days of measurements
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);

      const measurements = await measurementService.getMeasurements({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        limit: 100,
      });

      // Build lookup maps
      const measurementsByDate = new Map<string, Measurement>();
      measurements.forEach((m) => {
        measurementsByDate.set(getDateFromMeasurement(m), m);
      });

      // Build calendar data
      const calendarData = buildCalendarData(measurements);

      // Mark relevant months as loaded
      const loadedMonths = new Set<string>();
      measurements.forEach((m) => {
        const d = new Date(m.recorded_at);
        loadedMonths.add(getMonthKey(d.getFullYear(), d.getMonth()));
      });

      set({
        measurements,
        measurementsByDate,
        calendarData,
        loadedMonths,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch measurements',
      });
    }
  },

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  createMeasurement: async (data: MeasurementCreateData) => {
    set({ isSaving: true, error: null });

    try {
      const newMeasurement = await measurementService.createMeasurement(data);

      // Update state with new measurement
      const { measurements, measurementsByDate, calendarData, loadedMonths } = get();

      const dateStr = getDateFromMeasurement(newMeasurement);
      const updatedMeasurements = [...measurements, newMeasurement];
      const updatedByDate = new Map(measurementsByDate);
      updatedByDate.set(dateStr, newMeasurement);

      const updatedCalendarData = buildCalendarData(updatedMeasurements);

      // Mark month as needing refresh on next view
      const d = new Date(newMeasurement.recorded_at);
      const monthKey = getMonthKey(d.getFullYear(), d.getMonth());
      const updatedLoadedMonths = new Set(loadedMonths);
      updatedLoadedMonths.add(monthKey);

      set({
        measurements: updatedMeasurements,
        measurementsByDate: updatedByDate,
        calendarData: updatedCalendarData,
        loadedMonths: updatedLoadedMonths,
        isSaving: false,
      });

      return newMeasurement;
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.message || 'Failed to create measurement',
      });
      return null;
    }
  },

  updateMeasurement: async (id: number, data: MeasurementUpdateData) => {
    set({ isSaving: true, error: null });

    try {
      const updatedMeasurement = await measurementService.updateMeasurement(id, data);

      // Update state
      const { measurements } = get();
      const updatedMeasurements = measurements.map((m) =>
        m.id === id ? updatedMeasurement : m
      );

      const measurementsByDate = new Map<string, Measurement>();
      updatedMeasurements.forEach((m) => {
        measurementsByDate.set(getDateFromMeasurement(m), m);
      });

      const calendarData = buildCalendarData(updatedMeasurements);

      set({
        measurements: updatedMeasurements,
        measurementsByDate,
        calendarData,
        selectedMeasurement: updatedMeasurement,
        isSaving: false,
      });

      return updatedMeasurement;
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.message || 'Failed to update measurement',
      });
      return null;
    }
  },

  upsertMeasurementByDate: async (date: string, data: MeasurementCreateData) => {
    const { measurementsByDate } = get();
    const existing = measurementsByDate.get(date);

    if (existing) {
      return get().updateMeasurement(existing.id, data);
    } else {
      return get().createMeasurement({
        ...data,
        recorded_at: `${date}T12:00:00.000Z`,
      });
    }
  },

  deleteMeasurement: async (id: number) => {
    set({ isDeleting: true, error: null });

    try {
      await measurementService.deleteMeasurement(id);

      // Update state
      const { measurements } = get();
      const updatedMeasurements = measurements.filter((m) => m.id !== id);

      const measurementsByDate = new Map<string, Measurement>();
      updatedMeasurements.forEach((m) => {
        measurementsByDate.set(getDateFromMeasurement(m), m);
      });

      const calendarData = buildCalendarData(updatedMeasurements);

      set({
        measurements: updatedMeasurements,
        measurementsByDate,
        calendarData,
        selectedDate: null,
        selectedMeasurement: null,
        isDeleting: false,
      });

      return true;
    } catch (error: any) {
      set({
        isDeleting: false,
        error: error.message || 'Failed to delete measurement',
      });
      return false;
    }
  },

  deleteMeasurementByDate: async (date: string) => {
    const { measurementsByDate } = get();
    const measurement = measurementsByDate.get(date);

    if (measurement) {
      return get().deleteMeasurement(measurement.id);
    }
    return false;
  },

  // ========================================
  // COMPUTED DATA
  // ========================================

  getMeasurementForDate: (date: string) => {
    return get().measurementsByDate.get(date) || null;
  },

  getTrendsForDate: (date: string) => {
    const { measurements, measurementsByDate } = get();
    const measurement = measurementsByDate.get(date);

    if (!measurement) {
      return {
        weight_trend: null,
        weight_delta: null,
        weight_7day_avg: null,
        weight_30day_avg: null,
        body_fat_delta: null,
        weight_history: [],
        body_fat_history: [],
      };
    }

    return measurementService.calculateTrends(measurement, measurements);
  },

  getMonthlySummary: (year: number, month: number) => {
    const { measurements, monthlySummaries } = get();
    const monthKey = getMonthKey(year, month);

    // Check cache first
    const cached = monthlySummaries.get(monthKey);
    if (cached) return cached;

    // Calculate and cache
    const summary = measurementService.calculateMonthlySummary(year, month, measurements);

    const updatedSummaries = new Map(monthlySummaries);
    updatedSummaries.set(monthKey, summary);
    set({ monthlySummaries: updatedSummaries });

    return summary;
  },

  getMonthComparison: () => {
    const { measurements, currentYear, currentMonth } = get();

    // Get previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter measurements for each month
    const currentMonthMeasurements = measurements.filter((m) => {
      const d = new Date(m.recorded_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const previousMonthMeasurements = measurements.filter((m) => {
      const d = new Date(m.recorded_at);
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });

    if (currentMonthMeasurements.length === 0 && previousMonthMeasurements.length === 0) {
      return null;
    }

    return measurementService.calculateMonthComparison(
      currentMonthMeasurements,
      previousMonthMeasurements
    );
  },

  getRecentMeasurements: (count: number) => {
    const { measurements } = get();
    return [...measurements]
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
      .slice(0, count);
  },

  // ========================================
  // UTILITY
  // ========================================

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

// ========================================
// HELPER FUNCTIONS
// ========================================

function buildCalendarData(measurements: Measurement[]): Map<string, CalendarDayData> {
  const sorted = [...measurements].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const calendarData = new Map<string, CalendarDayData>();

  sorted.forEach((measurement, index) => {
    const dateStr = getDateFromMeasurement(measurement);
    const previous = index > 0 ? sorted[index - 1] : null;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (measurement.weight && previous?.weight) {
      const diff = measurement.weight - previous.weight;
      if (diff > 0.1) trend = 'up';
      else if (diff < -0.1) trend = 'down';
    }

    calendarData.set(dateStr, {
      date: dateStr,
      hasData: true,
      measurement,
      weight: measurement.weight || undefined,
      trend,
    });
  });

  return calendarData;
}

// Export store hook
export default useMeasurementStore;
