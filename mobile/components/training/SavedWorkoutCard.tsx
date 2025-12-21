/**
 * SavedWorkoutCard - My Workouts Card Component
 * Displays saved workout routines with exercises and quick actions
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
  gradients,
} from '../../design/tokens';
import type { SavedWorkout, DayOfWeek } from '../../types/training.types';

interface SavedWorkoutCardProps {
  workout: SavedWorkout;
  onPress: () => void;
  onStart: () => void;
  onFavorite: () => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const formatLastCompleted = (dateStr?: string): string => {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
};

export const SavedWorkoutCard: React.FC<SavedWorkoutCardProps> = ({
  workout,
  onPress,
  onStart,
  onFavorite,
}) => {
  const exerciseCount = workout.exercises.length;
  const totalSets = workout.exercises.reduce((sum, e) => sum + e.targetSets, 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {workout.name}
          </Text>
          <TouchableOpacity onPress={onFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={workout.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={workout.isFavorite ? colors.error : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        {workout.description && (
          <Text style={styles.description} numberOfLines={1}>
            {workout.description}
          </Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="barbell-outline" size={16} color={colors.secondary} />
          <Text style={styles.statText}>{exerciseCount} exercises</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="layers-outline" size={16} color={colors.accent.blue} />
          <Text style={styles.statText}>{totalSets} sets</Text>
        </View>
        {workout.scheduledDay && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="calendar-outline" size={16} color={colors.accent.orange} />
              <Text style={styles.statText}>{DAY_LABELS[workout.scheduledDay]}</Text>
            </View>
          </>
        )}
      </View>

      {/* Exercise Preview */}
      <View style={styles.exercisePreview}>
        {workout.exercises.slice(0, 3).map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <View style={styles.exerciseDot} />
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exercise.exerciseName}
            </Text>
            <Text style={styles.exerciseSetsReps}>
              {exercise.targetSets}x{exercise.targetReps}
            </Text>
          </View>
        ))}
        {exerciseCount > 3 && (
          <Text style={styles.moreExercises}>
            +{exerciseCount - 3} more exercises
          </Text>
        )}
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="checkmark-done" size={14} color={colors.success} />
            <Text style={styles.metaText}>{workout.timesCompleted}x completed</Text>
          </View>
          {workout.averageScore > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.metaText}>Avg {workout.averageScore}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.buttonPrimary as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Ionicons name="play" size={16} color={colors.textInverse} />
            <Text style={styles.startButtonText}>Start</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Last Completed Badge */}
      <View style={styles.lastCompletedBadge}>
        <Text style={styles.lastCompletedText}>
          Last: {formatLastCompleted(workout.lastCompleted)}
        </Text>
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
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  exercisePreview: {
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  exerciseName: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  exerciseSetsReps: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  moreExercises: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaInfo: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  startButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  startButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  lastCompletedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  lastCompletedText: {
    fontSize: 10,
    color: colors.textMuted,
  },
});

export default SavedWorkoutCard;
