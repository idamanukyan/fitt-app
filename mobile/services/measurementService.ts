/**
 * Enhanced Measurement Service for HyperFit
 *
 * Production-ready API service with:
 * - Full CRUD operations
 * - Date-based queries (by month, date range)
 * - Trend calculations
 * - Monthly comparisons
 * - Timezone handling
 * - Optimistic updates support
 * - Demo mode support
 */
import apiClient from './api';
import type {
  Measurement,
  MeasurementCreateData,
  MeasurementUpdateData,
  MeasurementQueryParams,
  MeasurementMonthlySummary,
  MeasurementTrends,
  MeasurementComparison,
} from '../types/api.types';

// Demo mode - synced with authService
const DEMO_MODE = false;

// Generate demo measurements for the last 90 days
const generateDemoMeasurements = (): Measurement[] => {
  const measurements: Measurement[] = [];
  const today = new Date();
  let currentWeight = 86.5;
  let currentBodyFat = 19.5;

  // Deterministic "random" skip pattern based on day number
  const skipDays = new Set([1, 2, 4, 6, 8, 9, 11, 13, 15, 16, 18, 20, 22, 23, 25, 27, 29, 30, 32, 34, 36, 37, 39, 41, 43, 44, 46, 48, 50, 51, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 78, 79, 81, 83, 85, 86, 88]);

  // Generate measurements for the last 90 days (with some gaps for realism)
  for (let i = 90; i >= 0; i--) {
    // Skip some days for realistic data (but always include recent days)
    if (skipDays.has(i) && i > 3) continue;

    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gradual weight loss trend with deterministic fluctuations
    // Use day index to create pseudo-random but consistent values
    const weightChange = ((i % 7) - 3.5) * 0.15 - 0.05; // Slight bias toward loss
    currentWeight = Math.max(75, Math.min(95, currentWeight + weightChange));

    // Body fat follows similar trend
    const bodyFatChange = ((i % 5) - 2.5) * 0.1 - 0.02;
    currentBodyFat = Math.max(10, Math.min(25, currentBodyFat + bodyFatChange));

    // Calculate BMI (assuming height of 178cm / 1.78m for demo)
    const heightInMeters = 1.78;
    const bmi = parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));

    const measurement: Measurement = {
      id: 1000 - i,
      user_id: 1,
      weight: parseFloat(currentWeight.toFixed(1)),
      body_fat_percentage: parseFloat(currentBodyFat.toFixed(1)),
      muscle_mass: parseFloat((currentWeight * 0.45).toFixed(1)),
      bmi,
      chest: i === 0 ? 102 : null,
      waist: i === 0 ? 84 : null,
      hips: i === 0 ? 98 : null,
      left_arm: i === 0 ? 36 : null,
      right_arm: i === 0 ? 36.5 : null,
      left_thigh: i === 0 ? 58 : null,
      right_thigh: i === 0 ? 58.5 : null,
      left_calf: i === 0 ? 38 : null,
      right_calf: i === 0 ? 38 : null,
      neck: null,
      shoulders: null,
      water_percentage: null,
      visceral_fat: null,
      resting_metabolic_rate: null,
      notes: i === 0 ? 'Latest measurement with full body metrics' : null,
      recorded_at: date.toISOString(),
      created_at: date.toISOString(),
    };

    measurements.push(measurement);
  }

  return measurements;
};

// Helper to extract date from measurement (defined early for use in initialization)
const extractDateFromMeasurement = (measurement: Measurement): string => {
  return measurement.recorded_at.split('T')[0];
};

// In-memory store for demo mode (simulates database)
let demoMeasurements: Measurement[] = generateDemoMeasurements();

/**
 * Simulate network delay for demo mode
 */
const simulateNetworkDelay = async (ms: number = 100): Promise<void> => {
  // Reduced delay for faster loading
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

/**
 * Parse recorded_at to date string (YYYY-MM-DD)
 */
export const getDateFromMeasurement = (measurement: Measurement): string => {
  return measurement.recorded_at.split('T')[0];
};

export const measurementService = {
  /**
   * Get all measurements with optional filtering
   */
  async getMeasurements(params: MeasurementQueryParams = {}): Promise<Measurement[]> {
    // Demo mode - return filtered demo data
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const { start_date, end_date, skip = 0, limit = 100 } = params;

      let filtered = [...demoMeasurements];

      if (start_date) {
        filtered = filtered.filter((m) => getDateFromMeasurement(m) >= start_date);
      }
      if (end_date) {
        filtered = filtered.filter((m) => getDateFromMeasurement(m) <= end_date);
      }

      return filtered.slice(skip, skip + limit);
    }

    const { month, start_date, end_date, skip = 0, limit = 100 } = params;

    const queryParams: Record<string, any> = { skip, limit };

    if (month) {
      // Parse YYYY-MM format
      const [year, monthNum] = month.split('-').map(Number);
      const range = getMonthDateRange(year, monthNum - 1);
      queryParams.start_date = range.start;
      queryParams.end_date = range.end;
    } else {
      if (start_date) queryParams.start_date = start_date;
      if (end_date) queryParams.end_date = end_date;
    }

    queryParams.timezone = getUserTimezone();

    const response = await apiClient.get<Measurement[]>('/measurements/', {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get measurements for a specific month (optimized query)
   */
  async getMeasurementsByMonth(year: number, month: number): Promise<Measurement[]> {
    const range = getMonthDateRange(year, month);
    return this.getMeasurements({
      start_date: range.start,
      end_date: range.end,
      limit: 31, // Max days in a month
    });
  },

  /**
   * Get measurement for a specific date
   */
  async getMeasurementByDate(date: string): Promise<Measurement | null> {
    // Demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      return demoMeasurements.find((m) => getDateFromMeasurement(m) === date) || null;
    }

    try {
      const response = await apiClient.get<Measurement>(`/measurements/date/${date}`, {
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
   * Get latest measurement
   */
  async getLatestMeasurement(): Promise<Measurement | null> {
    // Demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const sorted = [...demoMeasurements].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      return sorted[0] || null;
    }

    try {
      const response = await apiClient.get<Measurement>('/measurements/latest');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create new measurement
   * If recorded_at is provided, creates measurement for that date
   * Otherwise, creates for current date/time
   */
  async createMeasurement(data: MeasurementCreateData): Promise<Measurement> {
    // Demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const newId = Math.max(...demoMeasurements.map((m) => m.id)) + 1;
      // Calculate BMI if weight is provided (assuming height of 178cm for demo)
      const bmi = data.weight ? parseFloat((data.weight / (1.78 * 1.78)).toFixed(1)) : null;
      const newMeasurement: Measurement = {
        id: newId,
        user_id: 1,
        weight: data.weight || null,
        body_fat_percentage: data.body_fat_percentage || null,
        muscle_mass: data.muscle_mass || null,
        bmi,
        chest: data.chest || null,
        waist: data.waist || null,
        hips: data.hips || null,
        left_arm: data.left_arm || null,
        right_arm: data.right_arm || null,
        left_thigh: data.left_thigh || null,
        right_thigh: data.right_thigh || null,
        left_calf: data.left_calf || null,
        right_calf: data.right_calf || null,
        neck: data.neck || null,
        shoulders: data.shoulders || null,
        water_percentage: data.water_percentage || null,
        visceral_fat: data.visceral_fat || null,
        resting_metabolic_rate: data.resting_metabolic_rate || null,
        notes: data.notes || null,
        recorded_at: data.recorded_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      demoMeasurements.push(newMeasurement);
      return newMeasurement;
    }

    const payload = {
      ...data,
      timezone: getUserTimezone(),
    };

    const response = await apiClient.post<Measurement>('/measurements/', payload);
    return response.data;
  },

  /**
   * Update existing measurement by ID
   */
  async updateMeasurement(id: number, data: MeasurementUpdateData): Promise<Measurement> {
    // Demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const index = demoMeasurements.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error('Measurement not found');
      }
      const updated: Measurement = {
        ...demoMeasurements[index],
        weight: data.weight ?? demoMeasurements[index].weight,
        body_fat_percentage: data.body_fat_percentage ?? demoMeasurements[index].body_fat_percentage,
        muscle_mass: data.muscle_mass ?? demoMeasurements[index].muscle_mass,
        chest: data.chest ?? demoMeasurements[index].chest,
        waist: data.waist ?? demoMeasurements[index].waist,
        hips: data.hips ?? demoMeasurements[index].hips,
        left_arm: data.left_arm ?? demoMeasurements[index].left_arm,
        right_arm: data.right_arm ?? demoMeasurements[index].right_arm,
        left_thigh: data.left_thigh ?? demoMeasurements[index].left_thigh,
        right_thigh: data.right_thigh ?? demoMeasurements[index].right_thigh,
        left_calf: data.left_calf ?? demoMeasurements[index].left_calf,
        right_calf: data.right_calf ?? demoMeasurements[index].right_calf,
        neck: data.neck ?? demoMeasurements[index].neck,
        shoulders: data.shoulders ?? demoMeasurements[index].shoulders,
        water_percentage: data.water_percentage ?? demoMeasurements[index].water_percentage,
        visceral_fat: data.visceral_fat ?? demoMeasurements[index].visceral_fat,
        resting_metabolic_rate: data.resting_metabolic_rate ?? demoMeasurements[index].resting_metabolic_rate,
        notes: data.notes ?? demoMeasurements[index].notes,
      };
      demoMeasurements[index] = updated;
      return updated;
    }

    const response = await apiClient.put<Measurement>(`/measurements/${id}`, data);
    return response.data;
  },

  /**
   * Update measurement by date (upsert behavior)
   * Creates if doesn't exist, updates if exists
   */
  async upsertMeasurementByDate(date: string, data: MeasurementCreateData): Promise<Measurement> {
    const existing = await this.getMeasurementByDate(date);

    if (existing) {
      return this.updateMeasurement(existing.id, data);
    } else {
      return this.createMeasurement({
        ...data,
        recorded_at: `${date}T12:00:00.000Z`,
      });
    }
  },

  /**
   * Delete measurement by ID
   */
  async deleteMeasurement(id: number): Promise<void> {
    // Demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      demoMeasurements = demoMeasurements.filter((m) => m.id !== id);
      return;
    }

    await apiClient.delete(`/measurements/${id}`);
  },

  /**
   * Delete measurement by date
   */
  async deleteMeasurementByDate(date: string): Promise<boolean> {
    const measurement = await this.getMeasurementByDate(date);
    if (measurement) {
      await this.deleteMeasurement(measurement.id);
      return true;
    }
    return false;
  },

  /**
   * Get measurement by ID
   */
  async getMeasurementById(id: number): Promise<Measurement> {
    // Demo mode
    if (DEMO_MODE) {
      await simulateNetworkDelay();
      const measurement = demoMeasurements.find((m) => m.id === id);
      if (!measurement) {
        throw new Error('Measurement not found');
      }
      return measurement;
    }

    const response = await apiClient.get<Measurement>(`/measurements/${id}`);
    return response.data;
  },

  // ========================================
  // CLIENT-SIDE CALCULATIONS
  // ========================================
  // Note: These calculations are done client-side for flexibility
  // In a production environment, heavy calculations could be moved to backend

  /**
   * Calculate trends for a specific measurement
   */
  calculateTrends(
    currentMeasurement: Measurement,
    allMeasurements: Measurement[]
  ): MeasurementTrends {
    // Sort measurements by date (oldest first)
    const sorted = [...allMeasurements].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    const currentDate = new Date(currentMeasurement.recorded_at);
    const currentIndex = sorted.findIndex(
      (m) => getDateFromMeasurement(m) === getDateFromMeasurement(currentMeasurement)
    );

    // Find previous measurement
    const previousMeasurement = currentIndex > 0 ? sorted[currentIndex - 1] : null;

    // Calculate weight delta
    const weightDelta =
      currentMeasurement.weight && previousMeasurement?.weight
        ? currentMeasurement.weight - previousMeasurement.weight
        : null;

    // Calculate body fat delta
    const bodyFatDelta =
      currentMeasurement.body_fat_percentage && previousMeasurement?.body_fat_percentage
        ? currentMeasurement.body_fat_percentage - previousMeasurement.body_fat_percentage
        : null;

    // Determine weight trend
    let weightTrend: 'up' | 'down' | 'stable' | null = null;
    if (weightDelta !== null) {
      if (weightDelta > 0.1) weightTrend = 'up';
      else if (weightDelta < -0.1) weightTrend = 'down';
      else weightTrend = 'stable';
    }

    // Calculate 7-day average
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7Days = sorted.filter((m) => {
      const mDate = new Date(m.recorded_at);
      return mDate >= sevenDaysAgo && mDate <= currentDate && m.weight;
    });

    const weight7dayAvg =
      last7Days.length > 0
        ? last7Days.reduce((sum, m) => sum + (m.weight || 0), 0) / last7Days.length
        : null;

    // Calculate 30-day average
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30Days = sorted.filter((m) => {
      const mDate = new Date(m.recorded_at);
      return mDate >= thirtyDaysAgo && mDate <= currentDate && m.weight;
    });

    const weight30dayAvg =
      last30Days.length > 0
        ? last30Days.reduce((sum, m) => sum + (m.weight || 0), 0) / last30Days.length
        : null;

    // Build weight history for sparkline (last 7 entries up to current)
    const weightHistory = sorted
      .slice(Math.max(0, currentIndex - 6), currentIndex + 1)
      .filter((m) => m.weight)
      .map((m) => ({
        date: getDateFromMeasurement(m),
        weight: m.weight!,
      }));

    // Build body fat history
    const bodyFatHistory = sorted
      .slice(Math.max(0, currentIndex - 6), currentIndex + 1)
      .filter((m) => m.body_fat_percentage)
      .map((m) => ({
        date: getDateFromMeasurement(m),
        bodyFat: m.body_fat_percentage!,
      }));

    return {
      weight_trend: weightTrend,
      weight_delta: weightDelta,
      weight_7day_avg: weight7dayAvg,
      weight_30day_avg: weight30dayAvg,
      body_fat_delta: bodyFatDelta,
      weight_history: weightHistory,
      body_fat_history: bodyFatHistory,
    };
  },

  /**
   * Calculate monthly summary
   */
  calculateMonthlySummary(
    year: number,
    month: number,
    measurements: Measurement[]
  ): MeasurementMonthlySummary {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Filter measurements for this month
    const monthMeasurements = measurements.filter((m) => {
      const date = new Date(m.recorded_at);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    // Sort by date
    const sorted = [...monthMeasurements].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    // Calculate weight stats
    const weights = sorted.filter((m) => m.weight).map((m) => m.weight!);
    const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : null;
    const minWeight = weights.length > 0 ? Math.min(...weights) : null;
    const maxWeight = weights.length > 0 ? Math.max(...weights) : null;

    // Weight change (last - first)
    const weightChange =
      weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;

    // Body fat stats
    const bodyFats = sorted.filter((m) => m.body_fat_percentage).map((m) => m.body_fat_percentage!);
    const avgBodyFat = bodyFats.length > 0 ? bodyFats.reduce((a, b) => a + b, 0) / bodyFats.length : null;
    const bodyFatChange =
      bodyFats.length >= 2 ? bodyFats[bodyFats.length - 1] - bodyFats[0] : null;

    // Entries by date
    const entriesByDate: { [date: string]: boolean } = {};
    sorted.forEach((m) => {
      entriesByDate[getDateFromMeasurement(m)] = true;
    });

    return {
      month: monthStr,
      total_entries: monthMeasurements.length,
      avg_weight: avgWeight,
      min_weight: minWeight,
      max_weight: maxWeight,
      weight_change: weightChange,
      avg_body_fat: avgBodyFat,
      body_fat_change: bodyFatChange,
      entries_by_date: entriesByDate,
    };
  },

  /**
   * Compare current month with previous month
   */
  calculateMonthComparison(
    currentMonthMeasurements: Measurement[],
    previousMonthMeasurements: Measurement[]
  ): MeasurementComparison {
    // Current month stats
    const currentWeights = currentMonthMeasurements
      .filter((m) => m.weight)
      .map((m) => m.weight!);
    const currentAvgWeight =
      currentWeights.length > 0
        ? currentWeights.reduce((a, b) => a + b, 0) / currentWeights.length
        : null;

    const currentBodyFats = currentMonthMeasurements
      .filter((m) => m.body_fat_percentage)
      .map((m) => m.body_fat_percentage!);
    const currentAvgBodyFat =
      currentBodyFats.length > 0
        ? currentBodyFats.reduce((a, b) => a + b, 0) / currentBodyFats.length
        : null;

    // Previous month stats
    const previousWeights = previousMonthMeasurements
      .filter((m) => m.weight)
      .map((m) => m.weight!);
    const previousAvgWeight =
      previousWeights.length > 0
        ? previousWeights.reduce((a, b) => a + b, 0) / previousWeights.length
        : null;

    const previousBodyFats = previousMonthMeasurements
      .filter((m) => m.body_fat_percentage)
      .map((m) => m.body_fat_percentage!);
    const previousAvgBodyFat =
      previousBodyFats.length > 0
        ? previousBodyFats.reduce((a, b) => a + b, 0) / previousBodyFats.length
        : null;

    return {
      current_avg_weight: currentAvgWeight,
      previous_avg_weight: previousAvgWeight,
      weight_difference:
        currentAvgWeight && previousAvgWeight ? currentAvgWeight - previousAvgWeight : null,
      current_avg_body_fat: currentAvgBodyFat,
      previous_avg_body_fat: previousAvgBodyFat,
      body_fat_difference:
        currentAvgBodyFat && previousAvgBodyFat ? currentAvgBodyFat - previousAvgBodyFat : null,
      current_entries: currentMonthMeasurements.length,
      previous_entries: previousMonthMeasurements.length,
    };
  },

  /**
   * Build calendar data from measurements
   * Returns a map of date -> measurement data for calendar rendering
   */
  buildCalendarData(
    measurements: Measurement[]
  ): Map<string, { measurement: Measurement; trend: 'up' | 'down' | 'stable' }> {
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    const calendarData = new Map<
      string,
      { measurement: Measurement; trend: 'up' | 'down' | 'stable' }
    >();

    sorted.forEach((measurement, index) => {
      const dateStr = getDateFromMeasurement(measurement);
      const previous = index > 0 ? sorted[index - 1] : null;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (measurement.weight && previous?.weight) {
        const diff = measurement.weight - previous.weight;
        if (diff > 0.1) trend = 'up';
        else if (diff < -0.1) trend = 'down';
      }

      calendarData.set(dateStr, { measurement, trend });
    });

    return calendarData;
  },
};

export default measurementService;
