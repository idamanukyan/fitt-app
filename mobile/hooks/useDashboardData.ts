/**
 * useDashboardData - Hook for loading and managing premium dashboard data
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getTodaySummary, getNutritionGoal } from '../services/nutritionService';
import { useSleepStore } from '../stores/sleepStore';
import type { SleepCreateData } from '../types/sleep.types';
import {
  mockTodayNutrition,
  mockMeasurements,
  mockWorkoutTemplates,
  mockDashboardStats,
  mockInsights,
} from '../data/mockData';
import logger from '../utils/logger';
import type { PerformanceData } from '../components/dashboard';

// ============================================================================
// TYPES
// ============================================================================
export interface DashboardData {
  user: { name: string; date: string };
  weather: { temp: number; icon: string };
  performance: PerformanceData;
  bodyTrends: {
    data: number[];
    current: number;
    delta: number;
    avgSleep: string;
  };
  nextWorkout: { title: string; duration: string; exercises: number } | null;
  insight: string;
}

const defaultData: DashboardData = {
  user: {
    name: 'User',
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  },
  weather: { temp: 18, icon: 'partly-sunny' },
  performance: {
    calories: { current: 0, target: 2200 },
    water: { current: 0, target: 3 },
    steps: 0,
    activeBurn: 0,
  },
  bodyTrends: { data: [0, 0, 0, 0, 0, 0, 0], current: 0, delta: 0, avgSleep: '--' },
  nextWorkout: null,
  insight: 'Log in to get personalized insights!',
};

// ============================================================================
// HOOK
// ============================================================================
export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sleep modal state
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepModalMode, setSleepModalMode] = useState<'add' | 'edit'>('add');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Sleep store
  const {
    isLoading: sleepLoading,
    isSaving: sleepSaving,
    isDeleting: sleepDeleting,
    fetchAllRecentEntries: fetchSleepEntries,
    get7DayAverage: getSleep7DayAvg,
    getRecentEntries: getRecentSleepEntries,
    getWeekComparison: getSleepWeekComparison,
    createEntry: createSleepEntry,
    updateEntry: updateSleepEntry,
    deleteEntry: deleteSleepEntry,
    selectedEntry: selectedSleepEntry,
    setSelectedDate: setSelectedSleepDate,
  } = useSleepStore();

  const loadDashboardData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      await fetchSleepEntries();

      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : null;

      let calories = { current: mockTodayNutrition.calories.current, target: mockTodayNutrition.calories.target };
      let water = { current: mockTodayNutrition.water.current / 1000, target: mockTodayNutrition.water.target / 1000 };

      if (token) {
        try {
          const [nutritionSummary, nutritionGoal] = await Promise.allSettled([
            getTodaySummary(),
            getNutritionGoal(),
          ]);

          if (nutritionSummary.status === 'fulfilled') {
            calories.current = Math.round(nutritionSummary.value.calories?.current || calories.current);
          }
          if (nutritionGoal.status === 'fulfilled') {
            calories.target = nutritionGoal.value.calories || calories.target;
            water.target = (nutritionGoal.value.water_ml || water.target * 1000) / 1000;
          }
        } catch (e) {
          logger.log('Using mock data');
        }
      }

      const nextWorkoutTemplate = mockWorkoutTemplates[0];
      const weightHistory = mockMeasurements.history.map(m => m.weight);
      const insight = mockInsights[Math.floor(Math.random() * mockInsights.length)];

      setDashboardData({
        user: {
          name: user?.username || user?.first_name || 'Athlete',
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        },
        weather: { temp: 18, icon: 'partly-sunny' },
        performance: {
          calories,
          water,
          steps: mockDashboardStats.stepsToday,
          activeBurn: mockDashboardStats.activeMinutesToday * 8,
        },
        bodyTrends: {
          data: weightHistory.slice(0, 7).reverse(),
          current: mockMeasurements.latest.weight,
          delta: mockMeasurements.weeklyTrend,
          avgSleep: `${mockDashboardStats.sleepLastNight}h`,
        },
        nextWorkout: {
          title: nextWorkoutTemplate.name,
          duration: `${nextWorkoutTemplate.duration} min`,
          exercises: nextWorkoutTemplate.exercises.length,
        },
        insight,
      });
    } catch (err) {
      logger.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const onRefresh = useCallback(() => loadDashboardData(true), [loadDashboardData]);

  // Sleep handlers
  const handleSleepTap = useCallback(() => {
    const recentSleep = getRecentSleepEntries(1);
    if (recentSleep.length > 0) {
      setSelectedSleepDate(recentSleep[0].date);
      setSleepModalMode('edit');
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedSleepDate(yesterday.toISOString().split('T')[0]);
      setSleepModalMode('add');
    }
    setShowSleepModal(true);
  }, [getRecentSleepEntries, setSelectedSleepDate]);

  const handleLastNightTap = useCallback((entry: { date: string }) => {
    setSelectedSleepDate(entry.date);
    setSleepModalMode('edit');
    setShowSleepModal(true);
  }, [setSelectedSleepDate]);

  const handleAddSleep = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedSleepDate(yesterday.toISOString().split('T')[0]);
    setSleepModalMode('add');
    setShowSleepModal(true);
  }, [setSelectedSleepDate]);

  const closeSleepModal = useCallback(() => {
    setShowSleepModal(false);
    setSelectedSleepDate(null);
  }, [setSelectedSleepDate]);

  const handleSleepSave = useCallback(async (data: SleepCreateData) => {
    const result = sleepModalMode === 'edit' && selectedSleepEntry
      ? await updateSleepEntry(selectedSleepEntry.id, data)
      : await createSleepEntry(data);
    if (result) {
      setShowSleepModal(false);
      setSelectedSleepDate(null);
    }
  }, [sleepModalMode, selectedSleepEntry, updateSleepEntry, createSleepEntry, setSelectedSleepDate]);

  const handleSleepDelete = sleepModalMode === 'edit' && selectedSleepEntry
    ? async () => {
        const success = await deleteSleepEntry(selectedSleepEntry.id);
        if (success) {
          setShowSleepModal(false);
          setSelectedSleepDate(null);
        }
      }
    : undefined;

  return {
    dashboardData,
    isLoading,
    isRefreshing,
    onRefresh,
    fadeAnim,
    slideAnim,

    // Sleep
    showSleepModal,
    sleepModalMode,
    sleepSaving,
    sleepDeleting,
    selectedSleepEntry,
    getSleep7DayAvg,
    getRecentSleepEntries,
    getSleepWeekComparison,
    handleSleepTap,
    handleLastNightTap,
    handleAddSleep,
    closeSleepModal,
    handleSleepSave,
    handleSleepDelete,
  };
}
