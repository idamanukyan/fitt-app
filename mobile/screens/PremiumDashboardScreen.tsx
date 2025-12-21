/**
 * PremiumDashboardScreen - Premium Wellness Tech Dashboard
 *
 * Redesigned to match Login/Register aesthetic
 * - Deep purple-blue gradients
 * - Glassmorphism cards
 * - Soft shadows and friendly rounded shapes
 * - Modern, minimalistic design
 * - Integrated real sleep tracking data
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

// Design System
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
  animation,
} from '../design/tokens';
import {
  HFCard,
  HFButton,
  HFSectionTitle,
  HFBadge,
  HFGradientBackground,
} from '../design/components';

// Services
import { getTodaySummary, getNutritionGoal, formatDate } from '../services/nutritionService';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { AnalyticsEvents } from '../services/analyticsService';

// Sleep Tracking
import { useSleepStore } from '../stores/sleepStore';
import { AddSleepModal } from '../components/sleep/AddSleepModal';
import type { SleepCreateData } from '../types/sleep.types';
import {
  formatDuration,
  getSleepStatusInfo,
  formatTimeDisplay,
} from '../utils/sleepCalculations';

// Mock Data
import {
  mockUserProfile,
  mockTodayNutrition,
  mockMeasurements,
  mockWorkoutTemplates,
  mockDashboardStats,
  mockInsights,
} from '../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================
interface DashboardData {
  user: { name: string; date: string };
  weather: { temp: number; icon: string };
  performance: {
    calories: { current: number; target: number };
    water: { current: number; target: number };
    steps: number;
    activeBurn: number;
  };
  bodyTrends: {
    data: number[];
    current: number;
    delta: number;
    avgSleep: string;
  };
  nextWorkout: { title: string; duration: string; exercises: number } | null;
  insight: string;
}

// Default data
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
// ANIMATED PROGRESS RING COMPONENT
// ============================================================================
interface ProgressRingProps {
  progress: number;
  current: number;
  target: number;
  size?: number;
}

const AnimatedProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  current,
  target,
  size = 160,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const strokeWidth = 12;
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(progress, 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={colors.glassBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      <View style={styles.ringContent}>
        <Text style={styles.ringValue}>{current.toLocaleString()}</Text>
        <Text style={styles.ringUnit}>of {target.toLocaleString()} kcal</Text>
      </View>
    </View>
  );
};

// ============================================================================
// MINI METRIC CARD
// ============================================================================
interface MiniMetricProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
  suffix?: string;
}

const MiniMetricCard: React.FC<MiniMetricProps> = ({ icon, iconColor, value, label, suffix }) => (
  <View style={styles.miniMetric}>
    <View style={[styles.miniMetricIcon, { backgroundColor: `${iconColor}20` }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={styles.miniMetricValue}>
      {value}
      {suffix && <Text style={styles.miniMetricSuffix}>{suffix}</Text>}
    </Text>
    <Text style={styles.miniMetricLabel}>{label}</Text>
  </View>
);

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================
interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const QuickActionButton: React.FC<QuickActionProps> = ({ icon, label, color, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2 }}
    >
      <View style={styles.quickAction}>
        <View style={[styles.quickActionIconWrap, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PremiumDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { track, trackButtonTap } = useAnalytics();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // State
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sleep modal state
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepModalMode, setSleepModalMode] = useState<'add' | 'edit'>('add');

  // Sleep store
  const {
    entries: sleepEntries,
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

  // Load dashboard data
  const loadDashboardData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Fetch sleep data
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
          console.log('Using mock data');
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
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, []);

  const onRefresh = useCallback(() => loadDashboardData(true), [loadDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action pressed:', action);
    try {
      trackButtonTap(`quick_action_${action}`, { action_type: action });
    } catch (e) {
      console.log('Analytics error:', e);
    }
    switch (action) {
      case 'meal':
        try {
          track(AnalyticsEvents.MEAL_LOGGED, { source: 'dashboard' });
        } catch (e) {}
        router.push('/(tabs)/log-meal');
        break;
      case 'ai':
        track(AnalyticsEvents.AI_CHAT_MESSAGE_SENT, { source: 'dashboard' });
        router.push('/(tabs)/chat');
        break;
      case 'stats':
        router.push('/(tabs)/measurements');
        break;
    }
  };

  const handleStartWorkout = () => {
    track(AnalyticsEvents.WORKOUT_STARTED, { source: 'dashboard' });
    router.push('/(tabs)/training');
  };

  const calorieProgress = dashboardData.performance.calories.target > 0
    ? (dashboardData.performance.calories.current / dashboardData.performance.calories.target) * 100
    : 0;

  if (isLoading) {
    return (
      <LinearGradient colors={gradients.background as unknown as string[]} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.background as unknown as string[]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing['2xl'] }]}
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
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* ============================================================ */}
          {/* HEADER */}
          {/* ============================================================ */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{dashboardData.user.name}</Text>
              <Text style={styles.dateText}>{dashboardData.user.date}</Text>
            </View>
            <View style={styles.weatherBadge}>
              <Ionicons name={dashboardData.weather.icon as any} size={16} color={colors.textSecondary} />
              <Text style={styles.weatherTemp}>{dashboardData.weather.temp}°</Text>
            </View>
          </View>

          {/* ============================================================ */}
          {/* HERO CARD - Daily Progress (Tappable) */}
          {/* ============================================================ */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              trackButtonTap('daily_progress_card', { source: 'dashboard' });
              router.push('/(tabs)/measurements');
            }}
            style={styles.heroCard}
          >
            <LinearGradient
              colors={['rgba(74, 222, 128, 0.08)', 'rgba(167, 139, 250, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCardGradient}
            >
              <View style={styles.heroTopAccent} />

              <View style={styles.heroHeader}>
                <Text style={styles.heroTitle}>Daily Progress</Text>
                <View style={styles.heroTapHint}>
                  <Text style={styles.heroTapHintText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                </View>
              </View>

              <View style={styles.progressRingWrapper}>
                <AnimatedProgressRing
                  progress={calorieProgress}
                  current={dashboardData.performance.calories.current}
                  target={dashboardData.performance.calories.target}
                />
              </View>

              {/* Metrics Row */}
              <View style={styles.metricsRow}>
                <MiniMetricCard
                  icon="water"
                  iconColor={colors.accent.blue}
                  value={dashboardData.performance.water.current.toFixed(1)}
                  suffix={`/${dashboardData.performance.water.target}L`}
                  label="Water"
                />
                <View style={styles.metricDivider} />
                <MiniMetricCard
                  icon="footsteps"
                  iconColor={colors.accent.orange}
                  value={dashboardData.performance.steps.toLocaleString()}
                  label="Steps"
                />
                <View style={styles.metricDivider} />
                <MiniMetricCard
                  icon="flame"
                  iconColor={colors.error}
                  value={dashboardData.performance.activeBurn.toString()}
                  suffix=" kcal"
                  label="Burned"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ============================================================ */}
          {/* BODY TRENDS */}
          {/* ============================================================ */}
          <HFSectionTitle title="Body Trends" subtitle="Last 7 days" />

          <View style={styles.trendsCard}>
            <View style={styles.trendsRow}>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Weight</Text>
                <View style={styles.trendValueRow}>
                  <Text style={styles.trendValue}>
                    {dashboardData.bodyTrends.current > 0 ? `${dashboardData.bodyTrends.current}` : '--'}
                  </Text>
                  <Text style={styles.trendUnit}>kg</Text>
                </View>
                {dashboardData.bodyTrends.delta !== 0 && (
                  <View style={styles.trendDelta}>
                    <Ionicons
                      name={dashboardData.bodyTrends.delta < 0 ? 'trending-down' : 'trending-up'}
                      size={14}
                      color={dashboardData.bodyTrends.delta < 0 ? colors.success : colors.error}
                    />
                    <Text style={[
                      styles.trendDeltaText,
                      { color: dashboardData.bodyTrends.delta < 0 ? colors.success : colors.error }
                    ]}>
                      {Math.abs(dashboardData.bodyTrends.delta)} kg
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.trendDivider} />

              {/* Sleep Section - Now using real data */}
              <TouchableOpacity
                style={styles.trendItem}
                onPress={() => {
                  const recentSleep = getRecentSleepEntries(1);
                  if (recentSleep.length > 0) {
                    setSelectedSleepDate(recentSleep[0].date);
                    setSleepModalMode('edit');
                  } else {
                    // Set to yesterday for new entry
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedSleepDate(yesterday.toISOString().split('T')[0]);
                    setSleepModalMode('add');
                  }
                  setShowSleepModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.sleepLabelRow}>
                  <Text style={styles.trendLabel}>Avg. Sleep</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
                </View>
                {(() => {
                  const sleepAvg = getSleep7DayAvg();
                  const sleepComparison = getSleepWeekComparison();
                  const statusInfo = getSleepStatusInfo(sleepAvg);

                  return (
                    <>
                      <View style={styles.trendValueRow}>
                        <Text style={[styles.trendValue, { color: statusInfo.color }]}>
                          {sleepAvg ? `${sleepAvg.toFixed(1)}h` : '--'}
                        </Text>
                      </View>
                      <HFBadge
                        label={statusInfo.label}
                        variant={
                          statusInfo.status === 'optimal' || statusInfo.status === 'on_track'
                            ? 'success'
                            : statusInfo.status === 'borderline'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      />
                      {sleepComparison.trend && sleepComparison.difference_percentage !== null && (
                        <View style={styles.trendDelta}>
                          <Ionicons
                            name={sleepComparison.trend === 'better' ? 'trending-up' : 'trending-down'}
                            size={14}
                            color={sleepComparison.trend === 'better' ? colors.success : colors.error}
                          />
                          <Text style={[
                            styles.trendDeltaText,
                            { color: sleepComparison.trend === 'better' ? colors.success : colors.error }
                          ]}>
                            {Math.abs(sleepComparison.difference_percentage).toFixed(0)}%
                          </Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </TouchableOpacity>
            </View>

            {/* Last Night's Sleep Quick View */}
            {(() => {
              const lastNight = getRecentSleepEntries(1)[0];
              if (lastNight) {
                const statusInfo = getSleepStatusInfo(lastNight.duration_hours);
                return (
                  <TouchableOpacity
                    style={styles.lastNightRow}
                    onPress={() => {
                      setSelectedSleepDate(lastNight.date);
                      setSleepModalMode('edit');
                      setShowSleepModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.sleepIconBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                      <Ionicons name="moon" size={16} color={statusInfo.color} />
                    </View>
                    <View style={styles.lastNightContent}>
                      <Text style={styles.lastNightLabel}>Last night</Text>
                      <Text style={[styles.lastNightDuration, { color: statusInfo.color }]}>
                        {formatDuration(lastNight.duration_hours)}
                      </Text>
                    </View>
                    <Text style={styles.lastNightTimes}>
                      {formatTimeDisplay(lastNight.bedtime)} - {formatTimeDisplay(lastNight.wake_time)}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  style={styles.addSleepButton}
                  onPress={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedSleepDate(yesterday.toISOString().split('T')[0]);
                    setSleepModalMode('add');
                    setShowSleepModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.addSleepText}>Log last night's sleep</Text>
                </TouchableOpacity>
              );
            })()}
          </View>

          {/* ============================================================ */}
          {/* NEXT WORKOUT */}
          {/* ============================================================ */}
          <HFSectionTitle title="Next Workout" action={{ label: 'See all', onPress: () => router.push('/(tabs)/training') }} />

          <View style={styles.workoutCard}>
            <View style={styles.workoutContent}>
              <View style={styles.workoutIconWrap}>
                <Ionicons name="barbell" size={24} color={colors.primary} />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>
                  {dashboardData.nextWorkout?.title || 'No workout scheduled'}
                </Text>
                <Text style={styles.workoutMeta}>
                  {dashboardData.nextWorkout
                    ? `${dashboardData.nextWorkout.duration} · ${dashboardData.nextWorkout.exercises} exercises`
                    : 'Add a workout to get started'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>

            <TouchableOpacity
              onPress={handleStartWorkout}
              activeOpacity={0.9}
              style={styles.startWorkoutButton}
            >
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startWorkoutGradient}
              >
                <Text style={styles.startWorkoutText}>
                  {dashboardData.nextWorkout ? 'Start Workout' : 'Browse Workouts'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ============================================================ */}
          {/* QUICK ACTIONS */}
          {/* ============================================================ */}
          <HFSectionTitle title="Quick Actions" />

          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="camera"
              label="Log Meal"
              color={colors.primary}
              onPress={() => handleQuickAction('meal')}
            />
            <QuickActionButton
              icon="chatbubbles"
              label="Ask AI"
              color={colors.accent.blue}
              onPress={() => handleQuickAction('ai')}
            />
            <QuickActionButton
              icon="stats-chart"
              label="View Stats"
              color={colors.accent.orange}
              onPress={() => handleQuickAction('stats')}
            />
          </View>

          {/* ============================================================ */}
          {/* DAILY INSIGHT */}
          {/* ============================================================ */}
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb" size={18} color={colors.warning} />
            </View>
            <Text style={styles.insightText}>{dashboardData.insight}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sleep Modal */}
      <AddSleepModal
        visible={showSleepModal}
        onClose={() => {
          setShowSleepModal(false);
          setSelectedSleepDate(null);
        }}
        onSave={async (data: SleepCreateData) => {
          const result = sleepModalMode === 'edit' && selectedSleepEntry
            ? await updateSleepEntry(selectedSleepEntry.id, data)
            : await createSleepEntry(data);
          if (result) {
            setShowSleepModal(false);
            setSelectedSleepDate(null);
          }
        }}
        onDelete={sleepModalMode === 'edit' && selectedSleepEntry ? async () => {
          const success = await deleteSleepEntry(selectedSleepEntry.id);
          if (success) {
            setShowSleepModal(false);
            setSelectedSleepDate(null);
          }
        } : undefined}
        existingEntry={selectedSleepEntry}
        selectedDate={useSleepStore.getState().selectedDate || undefined}
        mode={sleepModalMode}
        isSaving={sleepSaving}
        isDeleting={sleepDeleting}
      />
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
  },

  // Loading
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.size.lg,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  userName: {
    fontSize: typography.size['3xl'],
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  weatherTemp: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.semiBold,
  },

  // Hero Card
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    ...shadows.cardElevated,
  },
  heroCardGradient: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
  },
  heroTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  heroTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroTapHintText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  progressRingWrapper: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  ringContent: {
    alignItems: 'center',
  },
  ringValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  ringUnit: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniMetric: {
    flex: 1,
    alignItems: 'center',
  },
  miniMetricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  miniMetricValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  miniMetricSuffix: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  miniMetricLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },

  // Trends Card
  trendsCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    ...shadows.card,
  },
  trendsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trendItem: {
    flex: 1,
  },
  trendLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  trendValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  trendValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  trendUnit: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  trendDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  trendDeltaText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  trendDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.xl,
  },

  // Sleep section styles
  sleepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lastNightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.md,
  },
  sleepIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastNightContent: {
    flex: 1,
  },
  lastNightLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  lastNightDuration: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
  },
  lastNightTimes: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  addSleepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  addSleepText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },

  // Workout Card
  workoutCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    ...shadows.card,
  },
  workoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  workoutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  workoutMeta: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  startWorkoutButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  startWorkoutText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  quickAction: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },

  // Insight Card
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  insightText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

});
