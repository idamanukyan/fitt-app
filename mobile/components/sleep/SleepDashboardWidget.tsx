/**
 * SleepDashboardWidget - Dashboard Sleep Summary Component
 *
 * Features:
 * - Last night's sleep summary
 * - 7-day average and trend
 * - Goal progress indicator
 * - Sleep regularity score
 * - Quick add/view actions
 * - Compact and expanded modes
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';
import type { DashboardSleepData, SleepGoalProgress, SleepRegularityMetrics } from '../../types/sleep.types';
import { formatDuration } from '../../utils/sleepCalculations';

interface SleepDashboardWidgetProps {
  dashboardData: DashboardSleepData;
  goalProgress?: SleepGoalProgress | null;
  regularityMetrics?: SleepRegularityMetrics | null;
  onPress?: () => void;
  onAddSleep?: () => void;
  compact?: boolean;
}

const RING_SIZE = 56;
const RING_STROKE = 6;

export const SleepDashboardWidget: React.FC<SleepDashboardWidgetProps> = ({
  dashboardData,
  goalProgress,
  regularityMetrics,
  onPress,
  onAddSleep,
  compact = false,
}) => {
  const { last_night, seven_day_avg, trend, trend_vs_previous_week, status_info, streak_days } = dashboardData;

  // Calculate progress ring
  const goalAdherence = goalProgress?.goal_adherence_percentage ?? 0;
  const ringProgress = useMemo(() => {
    const percentage = goalAdherence / 100;
    const circumference = 2 * Math.PI * ((RING_SIZE - RING_STROKE) / 2);
    const strokeDashoffset = circumference * (1 - percentage);
    return { circumference, strokeDashoffset };
  }, [goalAdherence]);

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (trend === 'up') {
      return { icon: 'trending-up' as const, color: colors.success };
    } else if (trend === 'down') {
      return { icon: 'trending-down' as const, color: colors.error };
    }
    return { icon: 'remove' as const, color: colors.textMuted };
  };

  const trendDisplay = getTrendDisplay();

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.secondarySubtle }]}>
            <Ionicons name="moon" size={20} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.compactTitle}>Sleep</Text>
            <Text style={styles.compactValue}>
              {last_night.duration_hours !== null
                ? formatDuration(last_night.duration_hours)
                : 'No data'}
            </Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          {trend && (
            <View style={[styles.compactTrend, { backgroundColor: `${trendDisplay.color}15` }]}>
              <Ionicons name={trendDisplay.icon} size={14} color={trendDisplay.color} />
            </View>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="moon" size={20} color={colors.secondary} />
          <Text style={styles.title}>Sleep</Text>
        </View>
        {!last_night.duration_hours && onAddSleep && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddSleep}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Goal Progress Ring */}
        <View style={styles.ringSection}>
          <View style={styles.ringContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={(RING_SIZE - RING_STROKE) / 2}
                stroke={colors.glassLight}
                strokeWidth={RING_STROKE}
                fill="transparent"
              />
              {/* Progress ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={(RING_SIZE - RING_STROKE) / 2}
                stroke={status_info.color}
                strokeWidth={RING_STROKE}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={ringProgress.circumference}
                strokeDashoffset={ringProgress.strokeDashoffset}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={[styles.ringValue, { color: status_info.color }]}>
                {goalAdherence}%
              </Text>
            </View>
          </View>
          <Text style={styles.ringLabel}>Goal</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          {/* Last Night */}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Last Night</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: status_info.color }]}>
                {last_night.duration_hours !== null
                  ? formatDuration(last_night.duration_hours)
                  : '--'}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${status_info.color}20` }]}>
                <Text style={[styles.statusBadgeText, { color: status_info.color }]}>
                  {status_info.label}
                </Text>
              </View>
            </View>
          </View>

          {/* 7-Day Average */}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>7-Day Avg</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>
                {seven_day_avg !== null ? formatDuration(seven_day_avg) : '--'}
              </Text>
              {trend_vs_previous_week !== null && (
                <View style={styles.trendBadge}>
                  <Ionicons name={trendDisplay.icon} size={12} color={trendDisplay.color} />
                  <Text style={[styles.trendText, { color: trendDisplay.color }]}>
                    {trend_vs_previous_week > 0 ? '+' : ''}{trend_vs_previous_week}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        {/* Streak */}
        {streak_days > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>
              {streak_days >= 7 ? '🔥' : streak_days >= 3 ? '✨' : '💤'}
            </Text>
            <Text style={styles.streakText}>{streak_days} day streak</Text>
          </View>
        )}

        {/* SRI Score */}
        {regularityMetrics && regularityMetrics.sri_score > 0 && (
          <View style={styles.sriBadge}>
            <Ionicons name="pulse" size={12} color={colors.secondary} />
            <Text style={styles.sriText}>SRI: {regularityMetrics.sri_score}</Text>
          </View>
        )}

        {/* View All */}
        <View style={styles.viewAll}>
          <Text style={styles.viewAllText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.full,
  },
  addButtonText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringSection: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  ringLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsSection: {
    flex: 1,
    gap: spacing.sm,
  },
  statItem: {},
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  sriBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  sriText: {
    fontSize: typography.size.xs,
    color: colors.secondary,
    fontWeight: typography.weight.medium,
  },
  viewAll: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  compactValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compactTrend: {
    padding: 4,
    borderRadius: 6,
  },
});

export default SleepDashboardWidget;
