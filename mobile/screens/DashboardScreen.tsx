/**
 * DashboardScreen - Main dashboard with card-based layout
 *
 * Orchestrates data fetching and passes data as props to child components.
 * All API calls wrapped in try/catch with graceful fallback to mock data.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design System
import {
  colors,
  gradients,
  typography,
  spacing,
  animation,
} from '../design/tokens';

// Components
import {
  DashboardHeader,
  TodayActivityCard,
  NextWorkoutCard,
  QuickActionsRow,
  WeeklyProgressCard,
  BodyStatsCard,
  AchievementsCard,
  DailyInsightCard,
} from '../components/dashboard';

// Services
import { getTodaySummary, getNutritionGoal, logWater } from '../services/nutritionService';
import { getWorkoutStats } from '../services/workoutService';
import { measurementService } from '../services/measurementService';
import { achievementService } from '../services/achievementService';

// Stores
import { useSleepStore } from '../stores/sleepStore';
import { useTrainingStore } from '../stores/trainingStore';

// Sleep utils
import {
  formatDuration,
  getSleepStatusInfo,
  formatTimeDisplay,
} from '../utils/sleepCalculations';

// Mock data fallbacks
import {
  mockTodayNutrition,
  mockMeasurements,
  mockDashboardStats,
  mockInsights,
} from '../data/mockData';

// Types
import type { UserStats } from '../types/achievement.types';

// ============================================================================
// DAILY INSIGHTS
// ============================================================================
const DAILY_INSIGHTS = [
  'Consistency beats perfection. Keep showing up and the results will follow.',
  'Hydration tip: drink a glass of water before every meal to boost metabolism.',
  'Try progressive overload: add 2.5kg to your main lifts each week.',
  'Sleep is recovery. Aim for 7-9 hours to maximize muscle growth.',
  'Post-workout protein within 30 minutes helps optimize muscle repair.',
  'Active recovery days are just as important as training days.',
  'Track your workouts to see progress you might not notice in the mirror.',
];

function getDailyInsight(): string {
  const dayOfWeek = new Date().getDay();
  return DAILY_INSIGHTS[dayOfWeek % DAILY_INSIGHTS.length];
}

// ============================================================================
// DASHBOARD STATE
// ============================================================================
interface DashboardState {
  userName: string;
  streak: number;
  calories: { current: number; goal: number };
  protein: { current: number; goal: number };
  water: { current: number; goal: number };
  steps: { current: number; goal: number };
  nextWorkout: { name: string; duration: number; exerciseCount: number } | null;
  workoutsCompleted: number;
  workoutsTarget: number;
  weekDays: boolean[];
  totalVolume: number;
  totalTime: number;
  latestPR: { name: string; detail: string; date: string } | null;
  weight: { current: number | null; weeklyDelta: number | null };
  sleepAvg: number | null;
  sleepStatus: 'optimal' | 'on_track' | 'borderline' | 'insufficient';
  sleepStatusLabel: string;
  sleepStatusColor: string;
  lastNightSleep: { duration: string; bedtime: string; wakeTime: string } | null;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  recentBadges: { emoji: string; name: string }[];
  insight: string;
}

const DEFAULT_STATE: DashboardState = {
  userName: 'Athlete',
  streak: 0,
  calories: { current: 0, goal: 2200 },
  protein: { current: 0, goal: 150 },
  water: { current: 0, goal: 3000 },
  steps: { current: 0, goal: 10000 },
  nextWorkout: null,
  workoutsCompleted: 0,
  workoutsTarget: 5,
  weekDays: [false, false, false, false, false, false, false],
  totalVolume: 0,
  totalTime: 0,
  latestPR: null,
  weight: { current: null, weeklyDelta: null },
  sleepAvg: null,
  sleepStatus: 'insufficient',
  sleepStatusLabel: 'No data',
  sleepStatusColor: colors.textDisabled,
  lastNightSleep: null,
  level: 1,
  currentXP: 0,
  nextLevelXP: 1000,
  recentBadges: [],
  insight: getDailyInsight(),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // State
  const [data, setData] = useState<DashboardState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stores
  const {
    fetchAllRecentEntries: fetchSleepEntries,
    get7DayAverage: getSleep7DayAvg,
    getRecentEntries: getRecentSleepEntries,
  } = useSleepStore();

  const {
    savedWorkouts,
    workoutHistory,
    getStreak,
  } = useTrainingStore();

  // ========================================
  // DATA LOADING
  // ========================================
  const loadDashboardData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Fetch sleep data
      await fetchSleepEntries();

      // Get user info from AsyncStorage
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : null;
      const userName = user?.first_name || user?.username || 'Athlete';

      // Get streak from training store
      const streak = getStreak();

      // --- Nutrition ---
      let calories = { current: mockTodayNutrition.calories.current, goal: mockTodayNutrition.calories.target };
      let protein = { current: mockTodayNutrition.protein.current, goal: mockTodayNutrition.protein.target };
      let water = { current: mockTodayNutrition.water.current, goal: mockTodayNutrition.water.target };

      try {
        const [summaryResult, goalResult] = await Promise.allSettled([
          getTodaySummary(),
          getNutritionGoal(),
        ]);

        if (summaryResult.status === 'fulfilled') {
          const s = summaryResult.value;
          calories.current = Math.round(s.calories?.current || calories.current);
          protein.current = Math.round(s.protein?.current || protein.current);
          water.current = Math.round(s.water?.current || water.current);
        }
        if (goalResult.status === 'fulfilled') {
          const g = goalResult.value;
          calories.goal = g.calories || calories.goal;
          protein.goal = g.protein || protein.goal;
          water.goal = g.water_ml || water.goal;
        }
      } catch {
        // Use mock data
      }

      // --- Steps (mock for now, no wearable integration) ---
      const steps = { current: mockDashboardStats.stepsToday, goal: mockDashboardStats.stepsGoal };

      // --- Next workout ---
      let nextWorkout: DashboardState['nextWorkout'] = null;
      if (savedWorkouts.length > 0) {
        const w = savedWorkouts[0];
        nextWorkout = {
          name: w.name,
          duration: w.exercises.length * 8, // Estimate ~8min per exercise
          exerciseCount: w.exercises.length,
        };
      }

      // --- Weekly progress ---
      const today = new Date();
      const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayIndex);
      weekStart.setHours(0, 0, 0, 0);

      const weekHistory = workoutHistory.filter(h => {
        const hDate = new Date(h.date);
        return hDate >= weekStart && hDate <= today;
      });

      // Build weekDays array
      const weekDays = [false, false, false, false, false, false, false];
      weekHistory.forEach(h => {
        const hDate = new Date(h.date);
        const hDay = hDate.getDay() === 0 ? 6 : hDate.getDay() - 1;
        weekDays[hDay] = true;
      });

      const workoutsCompleted = weekDays.filter(Boolean).length;
      const totalVolume = weekHistory.reduce((sum, h) => sum + (h.weight || 0) * (h.reps || 0), 0);
      const totalTime = weekHistory.reduce((sum, h) => sum + Math.round((h.duration || 0) / 60), 0);

      // Find latest PR
      let latestPR: DashboardState['latestPR'] = null;
      const prEntry = weekHistory.find(h => h.personalRecord);
      if (prEntry) {
        latestPR = {
          name: prEntry.exerciseName,
          detail: `${prEntry.weight || 0}kg x ${prEntry.reps || 0}`,
          date: new Date(prEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      }

      // --- Weight ---
      let weightData: DashboardState['weight'] = { current: null, weeklyDelta: null };
      try {
        const latestMeasurement = await measurementService.getLatestMeasurement();
        if (latestMeasurement && latestMeasurement.weight) {
          weightData.current = latestMeasurement.weight;
          // Calculate weekly delta from measurement history
          const allMeasurements = await measurementService.getMeasurements({ limit: 10 });
          if (allMeasurements.length >= 2) {
            const sorted = [...allMeasurements].sort(
              (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
            );
            const latest = sorted[0]?.weight;
            const weekAgo = sorted.find(m => {
              const daysDiff = (new Date().getTime() - new Date(m.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff >= 5;
            });
            if (latest && weekAgo?.weight) {
              weightData.weeklyDelta = Number((latest - weekAgo.weight).toFixed(1));
            }
          }
        }
      } catch {
        weightData = {
          current: mockMeasurements.latest.weight,
          weeklyDelta: mockMeasurements.weeklyTrend,
        };
      }

      // --- Sleep ---
      const sleepAvg = getSleep7DayAvg();
      const sleepStatusInfo = getSleepStatusInfo(sleepAvg);

      let lastNightSleep: DashboardState['lastNightSleep'] = null;
      const recentSleep = getRecentSleepEntries(1);
      if (recentSleep.length > 0) {
        const entry = recentSleep[0];
        lastNightSleep = {
          duration: formatDuration(entry.duration_hours),
          bedtime: formatTimeDisplay(entry.bedtime),
          wakeTime: formatTimeDisplay(entry.wake_time),
        };
      }

      // --- Achievements ---
      let level = 1;
      let currentXP = 0;
      let nextLevelXP = 1000;
      let recentBadges: { emoji: string; name: string }[] = [];

      try {
        const userStats: UserStats = await achievementService.getUserStats();
        level = userStats.level.level;
        currentXP = userStats.level.current_xp;
        nextLevelXP = userStats.level.xp_to_next_level;

        const unlocked = await achievementService.getUnlockedAchievements();
        recentBadges = unlocked
          .slice(-3)
          .reverse()
          .map(ua => ({
            emoji: ua.achievement.icon_name || '🏆',
            name: ua.achievement.name,
          }));
      } catch {
        // Use defaults
      }

      // --- Daily insight ---
      const insight = getDailyInsight();

      setData({
        userName,
        streak,
        calories,
        protein,
        water,
        steps,
        nextWorkout,
        workoutsCompleted,
        workoutsTarget: 5,
        weekDays,
        totalVolume,
        totalTime,
        latestPR,
        weight: weightData,
        sleepAvg,
        sleepStatus: sleepStatusInfo.status as DashboardState['sleepStatus'],
        sleepStatusLabel: sleepStatusInfo.label,
        sleepStatusColor: sleepStatusInfo.color,
        lastNightSleep,
        level,
        currentXP,
        nextLevelXP,
        recentBadges,
        insight,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchSleepEntries, getSleep7DayAvg, getRecentSleepEntries, savedWorkouts, workoutHistory, getStreak]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: animation.easing.spring.friction,
        tension: animation.easing.spring.tension,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => loadDashboardData(true), [loadDashboardData]);

  // ========================================
  // QUICK ACTION HANDLERS
  // ========================================
  const handleLogMeal = () => {
    router.push('/(tabs)/log-meal');
  };

  const handleAddWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await logWater({ amount_ml: 250, date: today });
      // Refresh to show updated water
      loadDashboardData(true);
    } catch {
      // Silently fail
    }
  };

  const handleAskAI = () => {
    router.push('/(tabs)/chat');
  };

  const handleWeighIn = () => {
    router.push('/(tabs)/measurements');
  };

  const handleStartWorkout = () => {
    router.push('/(tabs)/training');
  };

  const handleCreateWorkout = () => {
    router.push('/(tabs)/training');
  };

  const handleViewAchievements = () => {
    router.push('/achievements');
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (isLoading) {
    return (
      <LinearGradient colors={gradients.background as unknown as [string, string, ...string[]]} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </LinearGradient>
    );
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <LinearGradient colors={gradients.background as unknown as [string, string, ...string[]]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing['2xl'],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View
          style={[
            styles.contentWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <DashboardHeader
            userName={data.userName}
            streak={data.streak}
          />

          <TodayActivityCard
            calories={data.calories}
            protein={data.protein}
            water={data.water}
            steps={data.steps}
          />

          <NextWorkoutCard
            workout={data.nextWorkout}
            onStartWorkout={handleStartWorkout}
            onCreateWorkout={handleCreateWorkout}
          />

          <QuickActionsRow
            onLogMeal={handleLogMeal}
            onAddWater={handleAddWater}
            onAskAI={handleAskAI}
            onWeighIn={handleWeighIn}
          />

          <WeeklyProgressCard
            workoutsCompleted={data.workoutsCompleted}
            workoutsTarget={data.workoutsTarget}
            weekDays={data.weekDays}
            totalVolume={data.totalVolume}
            totalTime={data.totalTime}
            latestPR={data.latestPR}
          />

          <BodyStatsCard
            weight={data.weight}
            sleep={{
              sevenDayAvg: data.sleepAvg,
              status: data.sleepStatus,
              statusLabel: data.sleepStatusLabel,
              statusColor: data.sleepStatusColor,
              lastNight: data.lastNightSleep,
            }}
            onWeightPress={handleWeighIn}
          />

          <AchievementsCard
            level={data.level}
            currentXP={data.currentXP}
            nextLevelXP={data.nextLevelXP}
            recentBadges={data.recentBadges}
            onViewAll={handleViewAchievements}
          />

          <DailyInsightCard insight={data.insight} />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center', width: '100%' } : {}),
  },
  contentWrap: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
