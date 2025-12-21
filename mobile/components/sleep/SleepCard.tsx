/**
 * SleepCard - Dashboard Sleep Metric Component
 *
 * Features:
 * - Displays last night's sleep duration
 * - Shows 7-day average
 * - Trend indicator vs previous week
 * - Color-coded status (green/yellow/red)
 * - Tap to add/edit sleep entry
 * - Mini sparkline chart
 * - Matches dashboard card design
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';
import { useSleepStore } from '../../stores/sleepStore';
import {
  formatDuration,
  formatDurationShort,
  getSleepStatusInfo,
  formatTimeDisplay,
} from '../../utils/sleepCalculations';
import type { DashboardSleepData, SleepHistoryPoint } from '../../types/sleep.types';

interface SleepCardProps {
  onPress?: () => void;
  onAddPress?: () => void;
  compact?: boolean;
}

export const SleepCard: React.FC<SleepCardProps> = ({
  onPress,
  onAddPress,
  compact = false,
}) => {
  const {
    entries,
    isLoading,
    fetchAllRecentEntries,
    fetchDashboardData,
    get7DayAverage,
    getRecentEntries,
    getWeekComparison,
  } = useSleepStore();

  // Fetch data on mount
  useEffect(() => {
    if (entries.length === 0) {
      fetchAllRecentEntries();
    }
  }, []);

  // Get computed values
  const recentEntries = useMemo(() => getRecentEntries(7), [entries]);
  const sevenDayAvg = useMemo(() => get7DayAverage(), [entries]);
  const weekComparison = useMemo(() => getWeekComparison(), [entries]);

  // Get last night's data
  const lastNight = recentEntries[0] || null;
  const lastNightDuration = lastNight?.duration_hours || null;
  const statusInfo = getSleepStatusInfo(lastNightDuration);

  // Build sparkline data
  const sparklineData: SleepHistoryPoint[] = useMemo(() => {
    return [...recentEntries].reverse().map((e) => ({
      date: e.date,
      duration_hours: e.duration_hours,
      sleep_quality: e.sleep_quality,
    }));
  }, [recentEntries]);

  // Render mini sparkline
  const renderSparkline = () => {
    if (sparklineData.length < 2) return null;

    const width = 80;
    const height = 30;
    const padding = 2;

    // Get min/max for scaling
    const values = sparklineData.map((d) => d.duration_hours);
    const minVal = Math.min(...values) - 1;
    const maxVal = Math.max(...values) + 1;
    const range = maxVal - minVal || 1;

    // Build path
    const points = sparklineData.map((d, i) => {
      const x = padding + (i / (sparklineData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.duration_hours - minVal) / range) * (height - padding * 2);
      return { x, y };
    });

    const pathD = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');

    const lastPoint = points[points.length - 1];

    return (
      <Svg width={width} height={height}>
        <Path
          d={pathD}
          stroke={statusInfo.color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lastPoint && (
          <Circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={3}
            fill={statusInfo.color}
          />
        )}
      </Svg>
    );
  };

  // Render trend indicator
  const renderTrend = () => {
    if (!weekComparison.trend) return null;

    const isPositive = weekComparison.trend === 'better';
    const trendColor = isPositive ? colors.success : colors.error;
    const trendIcon = isPositive ? 'trending-up' : 'trending-down';
    const percentage = weekComparison.difference_percentage;

    if (percentage === null) return null;

    return (
      <View style={styles.trendContainer}>
        <Ionicons name={trendIcon as any} size={14} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {Math.abs(percentage).toFixed(0)}%
        </Text>
      </View>
    );
  };

  // Loading state
  if (isLoading && entries.length === 0) {
    return (
      <View style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading sleep data...</Text>
        </View>
      </View>
    );
  }

  // No data state
  if (!lastNight && entries.length === 0) {
    return (
      <TouchableOpacity
        style={[styles.card, compact && styles.cardCompact]}
        onPress={onAddPress || onPress}
        activeOpacity={0.7}
      >
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="moon-outline" size={24} color={colors.textMuted} />
          </View>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>Track Your Sleep</Text>
            <Text style={styles.emptySubtitle}>Tap to log last night's sleep</Text>
          </View>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  // Compact card for dashboard grid
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardCompact]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactHeader}>
          <View style={[styles.iconBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name="moon" size={16} color={statusInfo.color} />
          </View>
          <Text style={styles.compactLabel}>Sleep</Text>
        </View>

        <Text style={[styles.compactValue, { color: statusInfo.color }]}>
          {lastNightDuration ? formatDurationShort(lastNightDuration) : '--'}
        </Text>

        <View style={styles.compactFooter}>
          <Text style={styles.compactAvg}>
            {sevenDayAvg ? `${sevenDayAvg.toFixed(1)}h avg` : 'No data'}
          </Text>
          {renderTrend()}
        </View>
      </TouchableOpacity>
    );
  }

  // Full card
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name="moon" size={18} color={statusInfo.color} />
          </View>
          <View>
            <Text style={styles.title}>Sleep</Text>
            <Text style={styles.subtitle}>Last night</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {renderSparkline()}
        </View>
      </View>

      {/* Main Value */}
      <View style={styles.valueContainer}>
        <Text style={[styles.mainValue, { color: statusInfo.color }]}>
          {lastNightDuration ? formatDuration(lastNightDuration) : 'No data'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Times */}
      {lastNight && (
        <View style={styles.timesRow}>
          <View style={styles.timeItem}>
            <Ionicons name="bed-outline" size={14} color={colors.textMuted} />
            <Text style={styles.timeText}>
              {formatTimeDisplay(lastNight.bedtime)}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={12} color={colors.textDisabled} />
          <View style={styles.timeItem}>
            <Ionicons name="sunny-outline" size={14} color={colors.warning} />
            <Text style={styles.timeText}>
              {formatTimeDisplay(lastNight.wake_time)}
            </Text>
          </View>
        </View>
      )}

      {/* Footer Stats */}
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>7-day avg</Text>
          <Text style={styles.statValue}>
            {sevenDayAvg ? `${sevenDayAvg.toFixed(1)}h` : '--'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>vs last week</Text>
          <View style={styles.statValueRow}>
            {renderTrend() || <Text style={styles.statValue}>--</Text>}
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Quality</Text>
          <Text style={styles.statValue}>
            {lastNight?.sleep_quality ? `${lastNight.sleep_quality}%` : '--'}
          </Text>
        </View>
      </View>

      {/* Add button if no recent data */}
      {!lastNight && onAddPress && (
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>Log Sleep</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.md,
  },
  cardCompact: {
    padding: spacing.md,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },

  // Empty state
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // Value
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mainValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },

  // Times
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },

  // Trend
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
  },

  // Add button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
  },
  addButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },

  // Compact card
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  compactLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  compactValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactAvg: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
});

export default SleepCard;
