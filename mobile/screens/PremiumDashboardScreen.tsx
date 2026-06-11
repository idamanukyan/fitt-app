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
import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Design System
import { colors, gradients, typography, spacing } from '../design/tokens';
import { HFSectionTitle } from '../design/components';

// Services
import { useAnalytics } from '../contexts/AnalyticsContext';
import { AnalyticsEvents } from '../services/analyticsService';

// Sleep Tracking
import { useSleepStore } from '../stores/sleepStore';
import { AddSleepModal } from '../components/sleep/AddSleepModal';

import logger from '../utils/logger';

// Dashboard Components
import {
  DashboardHeader,
  DailyProgressCard,
  BodyTrendsCard,
  NextWorkoutCard,
  QuickActionsRow,
  DailyInsightCard,
} from '../components/dashboard';
import type { QuickAction } from '../components/dashboard';

// Data hook
import { useDashboardData } from '../hooks/useDashboardData';

// Quick action definitions
const QUICK_ACTIONS: QuickAction[] = [
  { icon: 'camera', label: 'Log Meal', color: colors.primary, action: 'meal' },
  { icon: 'restaurant', label: 'Meal Plans', color: colors.secondary, action: 'mealplan' },
  { icon: 'chatbubbles', label: 'Ask AI', color: colors.accent.blue, action: 'ai' },
  { icon: 'stats-chart', label: 'View Stats', color: colors.accent.orange, action: 'stats' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PremiumDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { track, trackButtonTap } = useAnalytics();

  const {
    dashboardData,
    isLoading,
    isRefreshing,
    onRefresh,
    fadeAnim,
    slideAnim,
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
  } = useDashboardData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickAction = (action: string) => {
    logger.log('Quick action pressed:', action);
    try {
      trackButtonTap(`quick_action_${action}`, { action_type: action });
    } catch (e) {
      logger.log('Analytics error:', e);
    }
    switch (action) {
      case 'meal':
        try { track(AnalyticsEvents.MEAL_LOGGED, { source: 'dashboard' }); } catch (e) {}
        router.push('/(tabs)/log-meal');
        break;
      case 'ai':
        track(AnalyticsEvents.AI_CHAT_MESSAGE_SENT, { source: 'dashboard' });
        router.push('/(tabs)/chat');
        break;
      case 'stats':
        router.push('/(tabs)/measurements');
        break;
      case 'mealplan':
        router.push('/meal-plans');
        break;
    }
  };

  const handleStartWorkout = () => {
    track(AnalyticsEvents.WORKOUT_STARTED, { source: 'dashboard' });
    router.push('/(tabs)/training');
  };

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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing['2xl'] },
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
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <DashboardHeader
            greeting={getGreeting()}
            userName={dashboardData.user.name}
            date={dashboardData.user.date}
            weatherIcon={dashboardData.weather.icon}
            weatherTemp={dashboardData.weather.temp}
          />

          <DailyProgressCard
            performance={dashboardData.performance}
            onPress={() => {
              trackButtonTap('daily_progress_card', { source: 'dashboard' });
              router.push('/(tabs)/measurements');
            }}
          />

          <HFSectionTitle title="Body Trends" subtitle="Last 7 days" />

          <BodyTrendsCard
            bodyTrends={{
              current: dashboardData.bodyTrends.current,
              delta: dashboardData.bodyTrends.delta,
            }}
            sleep7DayAvg={getSleep7DayAvg()}
            sleepComparison={getSleepWeekComparison()}
            lastNightSleep={getRecentSleepEntries(1)[0]}
            onSleepTap={handleSleepTap}
            onLastNightTap={handleLastNightTap}
            onAddSleep={handleAddSleep}
          />

          <HFSectionTitle
            title="Next Workout"
            action={{ label: 'See all', onPress: () => router.push('/(tabs)/training') }}
          />

          <NextWorkoutCard
            nextWorkout={dashboardData.nextWorkout}
            onStartWorkout={handleStartWorkout}
          />

          <HFSectionTitle title="Quick Actions" />

          <QuickActionsRow actions={QUICK_ACTIONS} onAction={handleQuickAction} />

          <DailyInsightCard insight={dashboardData.insight} />
        </Animated.View>
      </ScrollView>

      <AddSleepModal
        visible={showSleepModal}
        onClose={closeSleepModal}
        onSave={handleSleepSave}
        onDelete={handleSleepDelete}
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
