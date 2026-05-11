/**
 * WeeklyProgressCard - Week progress dots, workout count, volume/time, PR highlight
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface WeeklyProgressCardProps {
  workoutsCompleted: number;
  workoutsTarget: number;
  weekDays: boolean[];
  totalVolume: number;
  totalTime: number;
  latestPR: {
    name: string;
    detail: string;
    date: string;
  } | null;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg.toLocaleString()} kg`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getTodayDayIndex(): number {
  const day = new Date().getDay();
  // Convert from Sunday=0 to Monday=0
  return day === 0 ? 6 : day - 1;
}

export const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
  workoutsCompleted,
  workoutsTarget,
  weekDays,
  totalVolume,
  totalTime,
  latestPR,
}) => {
  const todayIndex = getTodayDayIndex();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <Text style={styles.workoutCount}>
          {workoutsCompleted} / {workoutsTarget} workouts
        </Text>
      </View>

      {/* Week dots */}
      <View style={styles.dotsRow}>
        {DAY_LABELS.map((label, index) => {
          const isCompleted = weekDays[index] === true;
          const isToday = index === todayIndex;

          return (
            <View key={index} style={styles.dayColumn}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isToday && !isCompleted && styles.dotToday,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={10} color={colors.textInverse} />
                )}
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Stat boxes */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
          <Text style={styles.statLabel}>VOLUME</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
          <Text style={styles.statLabel}>TIME</Text>
        </View>
      </View>

      {/* PR highlight */}
      {latestPR && (
        <View style={styles.prRow}>
          <View style={styles.prIconWrap}>
            <Ionicons name="trophy" size={14} color={colors.warning} />
          </View>
          <View style={styles.prInfo}>
            <Text style={styles.prName}>{latestPR.name}</Text>
            <Text style={styles.prDetail}>{latestPR.detail}</Text>
          </View>
          <Text style={styles.prDate}>{latestPR.date}</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  workoutCount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotToday: {
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: typography.weight.medium,
    color: colors.textDisabled,
    textTransform: 'uppercase',
  },
  dayLabelToday: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  prIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prInfo: {
    flex: 1,
  },
  prName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  prDetail: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  prDate: {
    fontSize: typography.size.xs,
    color: colors.textDisabled,
  },
});

export default WeeklyProgressCard;
