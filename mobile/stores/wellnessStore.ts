/**
 * Wellness Store - Unified Sleep + Measurements Sync
 * Handles cross-feature synchronization and correlation analysis
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

interface WellnessEntry {
  date: string; // YYYY-MM-DD
  sleep?: {
    duration: number; // minutes
    quality: number; // 1-5
    bedtime: string;
    wakeTime: string;
  };
  measurements?: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
  };
  workout?: {
    completed: boolean;
    score?: number;
    duration?: number;
    calories?: number;
  };
  mood?: number; // 1-5
  energy?: number; // 1-5
  notes?: string;
}

interface WellnessCorrelation {
  type: 'sleep_weight' | 'sleep_performance' | 'sleep_energy';
  correlation: number; // -1 to 1
  insight: string;
  recommendation: string;
  sampleSize: number;
}

interface WellnessTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

interface WellnessState {
  // Data
  entries: Record<string, WellnessEntry>; // keyed by date YYYY-MM-DD
  lastSyncTime: number;

  // Actions
  setEntry: (date: string, data: Partial<WellnessEntry>) => void;
  getEntry: (date: string) => WellnessEntry | undefined;
  getEntriesForRange: (startDate: string, endDate: string) => WellnessEntry[];

  // Sleep-specific
  setSleepData: (date: string, sleep: WellnessEntry['sleep']) => void;
  getSleepData: (date: string) => WellnessEntry['sleep'] | undefined;

  // Measurements-specific
  setMeasurementData: (date: string, measurements: WellnessEntry['measurements']) => void;
  getMeasurementData: (date: string) => WellnessEntry['measurements'] | undefined;

  // Workout-specific
  setWorkoutData: (date: string, workout: WellnessEntry['workout']) => void;
  getWorkoutData: (date: string) => WellnessEntry['workout'] | undefined;

  // Analysis
  calculateCorrelations: () => WellnessCorrelation[];
  getTrends: (days: number) => WellnessTrend[];
  getWellnessScore: (date: string) => number;

  // Sync
  syncFromSleepStore: (sleepEntries: Array<{ date: string; duration: number; quality: number; bedtime: string; wakeTime: string }>) => void;
  syncFromMeasurementStore: (measurementEntries: Array<{ date: string; weight?: number; bodyFat?: number; muscleMass?: number }>) => void;
  syncFromTrainingStore: (historyEntries: Array<{ date: string; aiScore: number; duration: number; calories: number }>) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(new Date(d)));
  }

  return dates;
};

const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length < 3) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
};

// ============================================================================
// STORE
// ============================================================================

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      entries: {},
      lastSyncTime: 0,

      // Basic CRUD
      setEntry: (date, data) => {
        set(state => ({
          entries: {
            ...state.entries,
            [date]: {
              ...state.entries[date],
              date,
              ...data,
            },
          },
          lastSyncTime: Date.now(),
        }));
      },

      getEntry: (date) => get().entries[date],

      getEntriesForRange: (startDate, endDate) => {
        const dates = getDateRange(startDate, endDate);
        const entries = get().entries;
        return dates.map(date => entries[date]).filter(Boolean);
      },

      // Sleep
      setSleepData: (date, sleep) => {
        get().setEntry(date, { sleep });
      },

      getSleepData: (date) => get().entries[date]?.sleep,

      // Measurements
      setMeasurementData: (date, measurements) => {
        get().setEntry(date, { measurements });
      },

      getMeasurementData: (date) => get().entries[date]?.measurements,

      // Workout
      setWorkoutData: (date, workout) => {
        get().setEntry(date, { workout });
      },

      getWorkoutData: (date) => get().entries[date]?.workout,

      // Sync from other stores
      syncFromSleepStore: (sleepEntries) => {
        const updates: Record<string, WellnessEntry> = {};

        sleepEntries.forEach(entry => {
          const dateKey = entry.date.split('T')[0];
          updates[dateKey] = {
            ...get().entries[dateKey],
            date: dateKey,
            sleep: {
              duration: entry.duration,
              quality: entry.quality,
              bedtime: entry.bedtime,
              wakeTime: entry.wakeTime,
            },
          };
        });

        set(state => ({
          entries: { ...state.entries, ...updates },
          lastSyncTime: Date.now(),
        }));
      },

      syncFromMeasurementStore: (measurementEntries) => {
        const updates: Record<string, WellnessEntry> = {};

        measurementEntries.forEach(entry => {
          const dateKey = entry.date.split('T')[0];
          updates[dateKey] = {
            ...get().entries[dateKey],
            date: dateKey,
            measurements: {
              weight: entry.weight,
              bodyFat: entry.bodyFat,
              muscleMass: entry.muscleMass,
            },
          };
        });

        set(state => ({
          entries: { ...state.entries, ...updates },
          lastSyncTime: Date.now(),
        }));
      },

      syncFromTrainingStore: (historyEntries) => {
        const updates: Record<string, WellnessEntry> = {};

        historyEntries.forEach(entry => {
          const dateKey = entry.date.split('T')[0];
          updates[dateKey] = {
            ...get().entries[dateKey],
            date: dateKey,
            workout: {
              completed: true,
              score: entry.aiScore,
              duration: entry.duration,
              calories: entry.calories,
            },
          };
        });

        set(state => ({
          entries: { ...state.entries, ...updates },
          lastSyncTime: Date.now(),
        }));
      },

      // Analysis
      calculateCorrelations: () => {
        const entries = Object.values(get().entries);
        const correlations: WellnessCorrelation[] = [];

        // Sleep vs Weight correlation
        const sleepWeightData = entries.filter(e => e.sleep?.duration && e.measurements?.weight);
        if (sleepWeightData.length >= 7) {
          const sleepDurations = sleepWeightData.map(e => e.sleep!.duration);
          const weights = sleepWeightData.map(e => e.measurements!.weight!);
          const correlation = calculatePearsonCorrelation(sleepDurations, weights);

          let insight = '';
          let recommendation = '';

          if (correlation < -0.3) {
            insight = 'Better sleep is associated with lower weight';
            recommendation = 'Prioritize 7-9 hours of quality sleep for weight management';
          } else if (correlation > 0.3) {
            insight = 'Sleep duration and weight are positively correlated';
            recommendation = 'Focus on sleep quality over duration';
          } else {
            insight = 'No strong correlation between sleep and weight';
            recommendation = 'Maintain consistent sleep habits';
          }

          correlations.push({
            type: 'sleep_weight',
            correlation,
            insight,
            recommendation,
            sampleSize: sleepWeightData.length,
          });
        }

        // Sleep vs Performance correlation
        const sleepPerformanceData = entries.filter(e => e.sleep?.duration && e.workout?.score);
        if (sleepPerformanceData.length >= 5) {
          const sleepDurations = sleepPerformanceData.map(e => e.sleep!.duration);
          const scores = sleepPerformanceData.map(e => e.workout!.score!);
          const correlation = calculatePearsonCorrelation(sleepDurations, scores);

          let insight = '';
          let recommendation = '';

          if (correlation > 0.3) {
            insight = 'Better sleep leads to better workout performance';
            recommendation = 'Get adequate sleep before intense training days';
          } else if (correlation < -0.3) {
            insight = 'Performance may not depend heavily on sleep duration';
            recommendation = 'Focus on sleep quality and recovery techniques';
          } else {
            insight = 'Sleep and performance show moderate relationship';
            recommendation = 'Maintain consistent sleep schedule';
          }

          correlations.push({
            type: 'sleep_performance',
            correlation,
            insight,
            recommendation,
            sampleSize: sleepPerformanceData.length,
          });
        }

        // Sleep quality vs Energy
        const sleepEnergyData = entries.filter(e => e.sleep?.quality && e.energy);
        if (sleepEnergyData.length >= 5) {
          const qualities = sleepEnergyData.map(e => e.sleep!.quality);
          const energies = sleepEnergyData.map(e => e.energy!);
          const correlation = calculatePearsonCorrelation(qualities, energies);

          correlations.push({
            type: 'sleep_energy',
            correlation,
            insight: correlation > 0.5
              ? 'Sleep quality strongly affects your energy levels'
              : 'Sleep quality has moderate impact on energy',
            recommendation: correlation > 0.5
              ? 'Improve sleep hygiene for better daily energy'
              : 'Consider other factors affecting energy (nutrition, stress)',
            sampleSize: sleepEnergyData.length,
          });
        }

        return correlations;
      },

      getTrends: (days) => {
        const entries = Object.values(get().entries);
        const now = new Date();
        const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const previousPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

        const currentPeriod = entries.filter(e => {
          const date = new Date(e.date);
          return date >= periodStart && date <= now;
        });

        const previousPeriod = entries.filter(e => {
          const date = new Date(e.date);
          return date >= previousPeriodStart && date < periodStart;
        });

        const trends: WellnessTrend[] = [];

        // Sleep duration trend
        const currentSleep = currentPeriod.filter(e => e.sleep?.duration).map(e => e.sleep!.duration);
        const previousSleep = previousPeriod.filter(e => e.sleep?.duration).map(e => e.sleep!.duration);

        if (currentSleep.length > 0 && previousSleep.length > 0) {
          const currentAvg = currentSleep.reduce((a, b) => a + b, 0) / currentSleep.length;
          const previousAvg = previousSleep.reduce((a, b) => a + b, 0) / previousSleep.length;
          const change = ((currentAvg - previousAvg) / previousAvg) * 100;

          trends.push({
            metric: 'Sleep Duration',
            direction: Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down',
            change: Math.round(change),
            period: `${days} days`,
          });
        }

        // Weight trend
        const currentWeight = currentPeriod.filter(e => e.measurements?.weight).map(e => e.measurements!.weight!);
        const previousWeight = previousPeriod.filter(e => e.measurements?.weight).map(e => e.measurements!.weight!);

        if (currentWeight.length > 0 && previousWeight.length > 0) {
          const currentAvg = currentWeight.reduce((a, b) => a + b, 0) / currentWeight.length;
          const previousAvg = previousWeight.reduce((a, b) => a + b, 0) / previousWeight.length;
          const change = currentAvg - previousAvg;

          trends.push({
            metric: 'Weight',
            direction: Math.abs(change) < 0.5 ? 'stable' : change > 0 ? 'up' : 'down',
            change: Math.round(change * 10) / 10,
            period: `${days} days`,
          });
        }

        // Workout score trend
        const currentScores = currentPeriod.filter(e => e.workout?.score).map(e => e.workout!.score!);
        const previousScores = previousPeriod.filter(e => e.workout?.score).map(e => e.workout!.score!);

        if (currentScores.length > 0 && previousScores.length > 0) {
          const currentAvg = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;
          const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
          const change = currentAvg - previousAvg;

          trends.push({
            metric: 'Workout Score',
            direction: Math.abs(change) < 3 ? 'stable' : change > 0 ? 'up' : 'down',
            change: Math.round(change),
            period: `${days} days`,
          });
        }

        return trends;
      },

      getWellnessScore: (date) => {
        const entry = get().entries[date];
        if (!entry) return 0;

        let score = 0;
        let factors = 0;

        // Sleep contribution (0-35 points)
        if (entry.sleep) {
          const sleepHours = entry.sleep.duration / 60;
          const sleepScore = Math.min(35, Math.max(0,
            sleepHours >= 7 && sleepHours <= 9 ? 35 :
            sleepHours >= 6 && sleepHours < 7 ? 25 :
            sleepHours > 9 && sleepHours <= 10 ? 25 :
            15
          ));
          score += sleepScore * (entry.sleep.quality / 5);
          factors++;
        }

        // Workout contribution (0-35 points)
        if (entry.workout?.completed) {
          const workoutScore = entry.workout.score
            ? (entry.workout.score / 100) * 35
            : 25;
          score += workoutScore;
          factors++;
        }

        // Energy/mood contribution (0-30 points)
        if (entry.energy || entry.mood) {
          const energyMood = ((entry.energy || 3) + (entry.mood || 3)) / 2;
          score += (energyMood / 5) * 30;
          factors++;
        }

        return factors > 0 ? Math.round(score) : 0;
      },
    }),
    {
      name: 'hyperfit-wellness-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useWellnessStore;
