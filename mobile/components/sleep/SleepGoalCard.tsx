/**
 * SleepGoalCard - Sleep Goal Progress Component
 *
 * Features:
 * - Goal progress indicator
 * - Current streak display
 * - Weekly adherence dots
 * - Edit goal button
 * - Animated progress ring
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  typography,
  spacing,
  radius,
  gradients,
} from '../../design/tokens';
import type { SleepGoalProgress } from '../../types/sleep.types';
import { formatDuration } from '../../utils/sleepCalculations';

interface SleepGoalCardProps {
  progress: SleepGoalProgress;
  onEditGoal?: () => void;
  compact?: boolean;
}

const RING_SIZE = 100;
const RING_STROKE_WIDTH = 10;

export const SleepGoalCard: React.FC<SleepGoalCardProps> = ({
  progress,
  onEditGoal,
  compact = false,
}) => {
  const {
    goal,
    current_avg_hours,
    goal_achieved,
    goal_adherence_percentage,
    current_streak,
    longest_streak,
    weekly_adherence,
  } = progress;

  // Calculate ring progress
  const ringProgress = useMemo(() => {
    const percentage = goal_adherence_percentage / 100;
    const circumference = 2 * Math.PI * ((RING_SIZE - RING_STROKE_WIDTH) / 2);
    const strokeDashoffset = circumference * (1 - percentage);
    return { circumference, strokeDashoffset };
  }, [goal_adherence_percentage]);

  // Get streak emoji based on length
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '💤';
  };

  // Get progress color
  const getProgressColor = (): string => {
    if (goal_adherence_percentage >= 80) return colors.success;
    if (goal_adherence_percentage >= 50) return colors.warning;
    return colors.error;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactLeft}>
          <View style={[styles.compactIcon, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="flag" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.compactTitle}>Sleep Goal</Text>
            <Text style={styles.compactValue}>
              {current_avg_hours !== null ? formatDuration(current_avg_hours) : '--'} / {formatDuration(goal.target_hours)}
            </Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <View style={styles.adherenceBadge}>
            <Text style={[styles.adherenceText, { color: getProgressColor() }]}>
              {goal_adherence_percentage}%
            </Text>
          </View>
          {current_streak > 0 && (
            <Text style={styles.compactStreak}>
              {getStreakEmoji(current_streak)} {current_streak}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={20} color={colors.primary} />
          <Text style={styles.title}>Sleep Goal</Text>
        </View>
        {onEditGoal && (
          <TouchableOpacity style={styles.editButton} onPress={onEditGoal}>
            <Ionicons name="pencil" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background ring */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={(RING_SIZE - RING_STROKE_WIDTH) / 2}
              stroke={colors.glassLight}
              strokeWidth={RING_STROKE_WIDTH}
              fill="transparent"
            />
            {/* Progress ring */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={(RING_SIZE - RING_STROKE_WIDTH) / 2}
              stroke={getProgressColor()}
              strokeWidth={RING_STROKE_WIDTH}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={ringProgress.circumference}
              strokeDashoffset={ringProgress.strokeDashoffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={[styles.ringPercentage, { color: getProgressColor() }]}>
              {goal_adherence_percentage}%
            </Text>
            <Text style={styles.ringLabel}>Goal Met</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {/* Target */}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Target</Text>
            <Text style={styles.statValue}>{formatDuration(goal.target_hours)}</Text>
          </View>

          {/* Current Average */}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Your Avg</Text>
            <Text style={[
              styles.statValue,
              goal_achieved ? { color: colors.success } : { color: colors.error }
            ]}>
              {current_avg_hours !== null ? formatDuration(current_avg_hours) : '--'}
            </Text>
          </View>

          {/* Streak */}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Streak</Text>
            <View style={styles.streakValue}>
              <Text style={styles.statValue}>
                {getStreakEmoji(current_streak)} {current_streak}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Weekly adherence */}
      <View style={styles.weeklySection}>
        <Text style={styles.weeklyTitle}>This Week</Text>
        <View style={styles.weeklyDots}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
            const met = weekly_adherence[index] === 1;
            return (
              <View key={index} style={styles.weeklyDayContainer}>
                <View
                  style={[
                    styles.weeklyDot,
                    met ? styles.weeklyDotMet : styles.weeklyDotMissed,
                  ]}
                >
                  {met && <Ionicons name="checkmark" size={12} color={colors.textInverse} />}
                </View>
                <Text style={styles.weeklyDayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Best streak badge */}
      {longest_streak > 0 && (
        <View style={styles.bestStreak}>
          <Ionicons name="trophy" size={14} color={colors.warning} />
          <Text style={styles.bestStreakText}>
            Best streak: {longest_streak} days
          </Text>
        </View>
      )}
    </View>
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
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
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
  ringPercentage: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  ringLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  stats: {
    flex: 1,
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weeklySection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  weeklyTitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  weeklyDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyDayContainer: {
    alignItems: 'center',
    gap: 4,
  },
  weeklyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDotMet: {
    backgroundColor: colors.success,
  },
  weeklyDotMissed: {
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  weeklyDayLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  bestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  bestStreakText: {
    fontSize: typography.size.sm,
    color: colors.warning,
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
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  compactValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  adherenceBadge: {
    backgroundColor: colors.glassLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  adherenceText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  compactStreak: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});

export default SleepGoalCard;
