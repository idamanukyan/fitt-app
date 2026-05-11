/**
 * BodyStatsCard - Weight trend, sleep average, last night detail
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface BodyStatsCardProps {
  weight: {
    current: number | null;
    weeklyDelta: number | null;
  };
  sleep: {
    sevenDayAvg: number | null;
    status: 'optimal' | 'on_track' | 'borderline' | 'insufficient';
    statusLabel: string;
    statusColor: string;
    lastNight: {
      duration: string;
      bedtime: string;
      wakeTime: string;
    } | null;
  };
  onLogSleep?: () => void;
  onWeightPress?: () => void;
  onSleepPress?: () => void;
}

export const BodyStatsCard: React.FC<BodyStatsCardProps> = ({
  weight,
  sleep,
  onLogSleep,
  onWeightPress,
  onSleepPress,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>BODY STATS</Text>

      {/* Two sub-cards */}
      <View style={styles.statsRow}>
        {/* Weight */}
        <TouchableOpacity
          style={styles.statCard}
          activeOpacity={onWeightPress ? 0.7 : 1}
          onPress={onWeightPress}
        >
          <Text style={styles.statTitle}>Weight</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>
              {weight.current != null ? weight.current.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statUnit}>kg</Text>
          </View>
          {weight.weeklyDelta != null && weight.weeklyDelta !== 0 && (
            <View style={styles.deltaRow}>
              <Ionicons
                name={weight.weeklyDelta < 0 ? 'trending-down' : 'trending-up'}
                size={14}
                color={weight.weeklyDelta < 0 ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.deltaText,
                  { color: weight.weeklyDelta < 0 ? colors.success : colors.error },
                ]}
              >
                {Math.abs(weight.weeklyDelta).toFixed(1)} kg
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sleep Average */}
        <TouchableOpacity
          style={styles.statCard}
          activeOpacity={onSleepPress ? 0.7 : 1}
          onPress={onSleepPress}
        >
          <View style={styles.sleepTitleRow}>
            <Text style={styles.statTitle}>Sleep Avg</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
          </View>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: sleep.statusColor }]}>
              {sleep.sevenDayAvg != null ? sleep.sevenDayAvg.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statUnit}>hrs</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${sleep.statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: sleep.statusColor }]} />
            <Text style={[styles.statusText, { color: sleep.statusColor }]}>
              {sleep.statusLabel}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Last night row */}
      {sleep.lastNight ? (
        <TouchableOpacity
          style={styles.lastNightRow}
          activeOpacity={onSleepPress ? 0.7 : 1}
          onPress={onSleepPress}
        >
          <View style={styles.moonIconWrap}>
            <Ionicons name="moon" size={16} color={colors.secondary} />
          </View>
          <View style={styles.lastNightContent}>
            <Text style={styles.lastNightLabel}>Last night</Text>
            <Text style={[styles.lastNightDuration, { color: colors.secondary }]}>
              {sleep.lastNight.duration}
            </Text>
          </View>
          <Text style={styles.lastNightTimes}>
            {sleep.lastNight.bedtime} - {sleep.lastNight.wakeTime}
          </Text>
        </TouchableOpacity>
      ) : onLogSleep ? (
        <TouchableOpacity
          style={styles.logSleepRow}
          activeOpacity={0.7}
          onPress={onLogSleep}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.logSleepText}>Log last night's sleep</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glassLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statTitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sleepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statUnit: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  deltaText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.weight.medium,
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
  moonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondarySubtle,
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
  logSleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  logSleepText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
});

export default BodyStatsCard;
