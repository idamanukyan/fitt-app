/**
 * WorkoutHistoryCard - Workout History Entry Display
 * Shows completed workouts with AI scores and stats
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';
import type { TrainingHistoryEntry } from '../../types/training.types';

interface WorkoutHistoryCardProps {
  entry: TrainingHistoryEntry;
  onPress: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return colors.success;
  if (score >= 75) return colors.primary;
  if (score >= 60) return colors.warning;
  return colors.error;
};

const formatDate = (dateStr: string): { day: string; month: string; time: string } => {
  const date = new Date(dateStr);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleString('default', { month: 'short' }),
    time: date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' }),
  };
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

export const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({
  entry,
  onPress,
}) => {
  const dateInfo = formatDate(entry.date);
  const scoreColor = getScoreColor(entry.aiScore);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Date Badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateDay}>{dateInfo.day}</Text>
        <Text style={styles.dateMonth}>{dateInfo.month}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {entry.exerciseName}
          </Text>
          {entry.personalRecord && (
            <View style={styles.prBadge}>
              <Ionicons name="trophy" size={12} color={colors.warning} />
              <Text style={styles.prText}>PR</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{entry.sets}</Text>
            <Text style={styles.statLabel}>sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{entry.reps}</Text>
            <Text style={styles.statLabel}>reps</Text>
          </View>
          {entry.weight && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{entry.weight}</Text>
                <Text style={styles.statLabel}>kg</Text>
              </View>
            </>
          )}
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="flame" size={14} color={colors.accent.orange} />
            <Text style={styles.statValue}>{entry.calories}</Text>
          </View>
        </View>

        <Text style={styles.time}>{dateInfo.time} - {formatDuration(entry.duration)}</Text>
      </View>

      {/* AI Score */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {entry.aiScore}
          </Text>
        </View>
        <Text style={styles.scoreLabel}>AI Score</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  dateMonth: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  exerciseName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  prText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.warning,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  time: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scoreValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default WorkoutHistoryCard;
