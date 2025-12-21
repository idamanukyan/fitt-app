/**
 * WeeklyComparisonCard - Week-over-week performance comparison
 * Shows this week vs last week metrics with deltas
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { WeeklySummary } from '../../types/insights.types';

interface WeeklyComparisonCardProps {
  summary: WeeklySummary;
  variant?: 'full' | 'compact';
  style?: object;
}

export const WeeklyComparisonCard: React.FC<WeeklyComparisonCardProps> = ({
  summary,
  variant = 'full',
  style,
}) => {
  const formatChange = (value: number | null, suffix: string = ''): string => {
    if (value === null) return '--';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value}${suffix}`;
  };

  const getChangeColor = (value: number | null, higherIsBetter: boolean = true): string => {
    if (value === null || value === 0) return colors.textMuted;
    const isPositive = value > 0;
    return (isPositive && higherIsBetter) || (!isPositive && !higherIsBetter)
      ? colors.success
      : colors.error;
  };

  const getChangeIcon = (value: number | null): keyof typeof Ionicons.glyphMap => {
    if (value === null || value === 0) return 'remove';
    return value > 0 ? 'trending-up' : 'trending-down';
  };

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactHeader}>
          <Ionicons name="calendar" size={16} color={colors.primary} />
          <Text style={styles.compactTitle}>This Week</Text>
        </View>
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Text style={styles.compactValue}>{summary.workoutsCompleted}</Text>
            <Text style={styles.compactLabel}>workouts</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactValue}>{summary.avgFormScore ?? '--'}%</Text>
            <Text style={styles.compactLabel}>form</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactValue}>{summary.xpEarned}</Text>
            <Text style={styles.compactLabel}>XP</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.title}>Weekly Summary</Text>
        </View>
        <View style={styles.weekRange}>
          <Text style={styles.weekRangeText}>
            {new Date(summary.weekStartDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {new Date(summary.weekEndDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Workouts Completed */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="fitness" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>
            {summary.workoutsCompleted}/{summary.workoutsPlanned}
          </Text>
          <Text style={styles.statLabel}>Workouts</Text>
          <View style={styles.completionBar}>
            <View
              style={[
                styles.completionFill,
                {
                  width: `${(summary.workoutsCompleted / summary.workoutsPlanned) * 100}%`,
                  backgroundColor:
                    summary.workoutsCompleted >= summary.workoutsPlanned
                      ? colors.success
                      : colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Total Volume */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondarySubtle }]}>
            <Ionicons name="barbell" size={20} color={colors.secondary} />
          </View>
          <Text style={styles.statValue}>
            {(summary.totalVolume / 1000).toFixed(1)}k
          </Text>
          <Text style={styles.statLabel}>Volume (kg)</Text>
          <View style={styles.changeRow}>
            <Ionicons
              name={getChangeIcon(summary.volumeChange)}
              size={12}
              color={getChangeColor(summary.volumeChange)}
            />
            <Text
              style={[styles.changeText, { color: getChangeColor(summary.volumeChange) }]}
            >
              {formatChange(summary.volumeChange, '%')}
            </Text>
          </View>
        </View>

        {/* Form Score */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <Text style={styles.statValue}>
            {summary.avgFormScore !== null ? `${summary.avgFormScore}%` : '--'}
          </Text>
          <Text style={styles.statLabel}>Avg Form</Text>
          {summary.formScoreChange !== null && (
            <View style={styles.changeRow}>
              <Ionicons
                name={getChangeIcon(summary.formScoreChange)}
                size={12}
                color={getChangeColor(summary.formScoreChange)}
              />
              <Text
                style={[
                  styles.changeText,
                  { color: getChangeColor(summary.formScoreChange) },
                ]}
              >
                {formatChange(summary.formScoreChange, ' pts')}
              </Text>
            </View>
          )}
        </View>

        {/* XP Earned */}
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
            <Ionicons name="star" size={20} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{summary.xpEarned}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
          {summary.prsAchieved > 0 && (
            <View style={styles.prBadge}>
              <Ionicons name="trophy" size={10} color={colors.warning} />
              <Text style={styles.prText}>{summary.prsAchieved} PRs</Text>
            </View>
          )}
        </View>
      </View>

      {/* Sleep & Streak Row */}
      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStat}>
          <Ionicons name="moon" size={16} color={colors.secondary} />
          <View style={styles.secondaryStatInfo}>
            <Text style={styles.secondaryStatValue}>
              {summary.avgSleepHours?.toFixed(1) ?? '--'} hrs
            </Text>
            <Text style={styles.secondaryStatLabel}>Avg Sleep</Text>
          </View>
          {summary.sleepChange !== null && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor:
                    summary.sleepChange >= 0 ? colors.successBg : colors.errorBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.changeBadgeText,
                  { color: summary.sleepChange >= 0 ? colors.success : colors.error },
                ]}
              >
                {formatChange(summary.sleepChange, 'h')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.secondaryStat}>
          <Ionicons name="flame" size={16} color={colors.accent.orange} />
          <View style={styles.secondaryStatInfo}>
            <Text style={styles.secondaryStatValue}>{summary.streakDays} days</Text>
            <Text style={styles.secondaryStatLabel}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Highlights Section */}
      {summary.highlights.length > 0 && (
        <View style={styles.highlightsSection}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {summary.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Areas to Improve */}
      {summary.areasToImprove.length > 0 && (
        <View style={styles.improvementsSection}>
          <Text style={styles.sectionTitle}>Focus Areas</Text>
          {summary.areasToImprove.map((area, index) => (
            <View key={index} style={styles.improvementItem}>
              <Ionicons name="arrow-forward-circle" size={14} color={colors.warning} />
              <Text style={styles.improvementText}>{area}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Mini version for dashboard
interface WeeklyMiniSummaryProps {
  workoutsCompleted: number;
  workoutsPlanned: number;
  xpEarned: number;
  streakDays: number;
  style?: object;
}

export const WeeklyMiniSummary: React.FC<WeeklyMiniSummaryProps> = ({
  workoutsCompleted,
  workoutsPlanned,
  xpEarned,
  streakDays,
  style,
}) => (
  <View style={[styles.miniContainer, style]}>
    <View style={styles.miniStat}>
      <Ionicons name="fitness" size={14} color={colors.primary} />
      <Text style={styles.miniValue}>
        {workoutsCompleted}/{workoutsPlanned}
      </Text>
    </View>
    <View style={styles.miniDivider} />
    <View style={styles.miniStat}>
      <Ionicons name="star" size={14} color={colors.warning} />
      <Text style={styles.miniValue}>{xpEarned} XP</Text>
    </View>
    <View style={styles.miniDivider} />
    <View style={styles.miniStat}>
      <Ionicons name="flame" size={14} color={colors.accent.orange} />
      <Text style={styles.miniValue}>{streakDays}d</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  weekRange: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  weekRangeText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  completionBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.glass,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    borderRadius: 2,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  changeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  prText: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.warning,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  secondaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secondaryStatInfo: {
    alignItems: 'flex-start',
  },
  secondaryStatValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  secondaryStatLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  changeBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  highlightsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  highlightText: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  improvementsSection: {
    marginTop: spacing.md,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  improvementText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    flex: 1,
  },

  // Compact variant
  compactContainer: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  compactTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStat: {
    alignItems: 'center',
  },
  compactValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  compactLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // Mini variant
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  miniValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  miniDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.glassBorder,
  },
});

export default WeeklyComparisonCard;
