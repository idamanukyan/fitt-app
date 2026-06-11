/**
 * BodyTrendsCard - Weight trend + sleep tracking with real data
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';
import { HFBadge } from '../../design/components';

import {
  formatDuration,
  getSleepStatusInfo,
  formatTimeDisplay,
} from '../../utils/sleepCalculations';

// ============================================================================
// TYPES
// ============================================================================
export interface BodyTrendsData {
  current: number;
  delta: number;
}

export interface SleepEntry {
  id: string;
  date: string;
  duration_hours: number;
  bedtime: string;
  wake_time: string;
}

export interface SleepComparison {
  trend: 'better' | 'worse' | null;
  difference_percentage: number | null;
}

export interface BodyTrendsCardProps {
  bodyTrends: BodyTrendsData;
  sleep7DayAvg: number | null;
  sleepComparison: SleepComparison;
  lastNightSleep: SleepEntry | undefined;
  onSleepTap: () => void;
  onLastNightTap: (entry: SleepEntry) => void;
  onAddSleep: () => void;
}

export const BodyTrendsCard: React.FC<BodyTrendsCardProps> = ({
  bodyTrends,
  sleep7DayAvg,
  sleepComparison,
  lastNightSleep,
  onSleepTap,
  onLastNightTap,
  onAddSleep,
}) => {
  const sleepStatusInfo = getSleepStatusInfo(sleep7DayAvg);

  return (
    <View style={styles.trendsCard}>
      <View style={styles.trendsRow}>
        {/* Weight */}
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Weight</Text>
          <View style={styles.trendValueRow}>
            <Text style={styles.trendValue}>
              {bodyTrends.current > 0 ? `${bodyTrends.current}` : '--'}
            </Text>
            <Text style={styles.trendUnit}>kg</Text>
          </View>
          {bodyTrends.delta !== 0 && (
            <View style={styles.trendDelta}>
              <Ionicons
                name={bodyTrends.delta < 0 ? 'trending-down' : 'trending-up'}
                size={14}
                color={bodyTrends.delta < 0 ? colors.success : colors.error}
              />
              <Text style={[
                styles.trendDeltaText,
                { color: bodyTrends.delta < 0 ? colors.success : colors.error }
              ]}>
                {Math.abs(bodyTrends.delta)} kg
              </Text>
            </View>
          )}
        </View>

        <View style={styles.trendDivider} />

        {/* Sleep Section */}
        <TouchableOpacity
          style={styles.trendItem}
          onPress={onSleepTap}
          activeOpacity={0.7}
        >
          <View style={styles.sleepLabelRow}>
            <Text style={styles.trendLabel}>Avg. Sleep</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
          </View>
          <View style={styles.trendValueRow}>
            <Text style={[styles.trendValue, { color: sleepStatusInfo.color }]}>
              {sleep7DayAvg ? `${sleep7DayAvg.toFixed(1)}h` : '--'}
            </Text>
          </View>
          <HFBadge
            label={sleepStatusInfo.label}
            variant={
              sleepStatusInfo.status === 'optimal' || sleepStatusInfo.status === 'on_track'
                ? 'success'
                : sleepStatusInfo.status === 'borderline'
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
        </TouchableOpacity>
      </View>

      {/* Last Night's Sleep Quick View */}
      {lastNightSleep ? (
        (() => {
          const statusInfo = getSleepStatusInfo(lastNightSleep.duration_hours);
          return (
            <TouchableOpacity
              style={styles.lastNightRow}
              onPress={() => onLastNightTap(lastNightSleep)}
              activeOpacity={0.7}
            >
              <View style={[styles.sleepIconBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                <Ionicons name="moon" size={16} color={statusInfo.color} />
              </View>
              <View style={styles.lastNightContent}>
                <Text style={styles.lastNightLabel}>Last night</Text>
                <Text style={[styles.lastNightDuration, { color: statusInfo.color }]}>
                  {formatDuration(lastNightSleep.duration_hours)}
                </Text>
              </View>
              <Text style={styles.lastNightTimes}>
                {formatTimeDisplay(lastNightSleep.bedtime)} - {formatTimeDisplay(lastNightSleep.wake_time)}
              </Text>
            </TouchableOpacity>
          );
        })()
      ) : (
        <TouchableOpacity
          style={styles.addSleepButton}
          onPress={onAddSleep}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.addSleepText}>Log last night's sleep</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BodyTrendsCard;

const styles = StyleSheet.create({
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
});
