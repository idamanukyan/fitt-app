/**
 * WorkoutSuggestionCard - AI-powered workout recommendation display
 * Shows suggested workouts based on muscle balance and training history
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows, gradients } from '../../../design/tokens';
import type { WorkoutRecommendation, RecommendedExercise } from '../../types/insights.types';

interface WorkoutSuggestionCardProps {
  recommendation: WorkoutRecommendation;
  onStart?: () => void;
  onViewDetails?: () => void;
  onDismiss?: () => void;
  variant?: 'full' | 'compact';
  style?: object;
}

export const WorkoutSuggestionCard: React.FC<WorkoutSuggestionCardProps> = ({
  recommendation,
  onStart,
  onViewDetails,
  onDismiss,
  variant = 'full',
  style,
}) => {
  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (recommendation.type) {
      case 'suggested_workout':
        return 'barbell';
      case 'exercise_swap':
        return 'swap-horizontal';
      case 'deload':
        return 'leaf';
      case 'muscle_focus':
        return 'body';
      default:
        return 'fitness';
    }
  };

  const getTypeColor = (): string => {
    switch (recommendation.type) {
      case 'suggested_workout':
        return colors.primary;
      case 'exercise_swap':
        return colors.secondary;
      case 'deload':
        return colors.success;
      case 'muscle_focus':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  const getPriorityColor = (): string => {
    switch (recommendation.priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.textMuted;
    }
  };

  const typeColor = getTypeColor();

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onViewDetails}
        activeOpacity={onViewDetails ? 0.8 : 1}
        disabled={!onViewDetails}
      >
        <View
          style={[
            styles.compactIconBg,
            { backgroundColor: `${typeColor}20` },
          ]}
        >
          <Ionicons name={getTypeIcon()} size={20} color={typeColor} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {recommendation.title}
          </Text>
          <Text style={styles.compactDescription} numberOfLines={1}>
            {recommendation.description}
          </Text>
        </View>
        {recommendation.estimatedDuration && (
          <View style={styles.compactDuration}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.compactDurationText}>
              {recommendation.estimatedDuration}m
            </Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[`${typeColor}15`, `${typeColor}05`]}
        style={styles.gradient}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityBar, { backgroundColor: getPriorityColor() }]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
            <Ionicons name={getTypeIcon()} size={28} color={typeColor} />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{recommendation.title}</Text>
              {onDismiss && (
                <TouchableOpacity
                  onPress={onDismiss}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.badges}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: `${typeColor}20` },
                ]}
              >
                <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                  {recommendation.type.replace('_', ' ')}
                </Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: `${getPriorityColor()}20` },
                ]}
              >
                <Text
                  style={[
                    styles.priorityBadgeText,
                    { color: getPriorityColor() },
                  ]}
                >
                  {recommendation.priority} priority
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{recommendation.description}</Text>

        {/* Reason */}
        <View style={styles.reasonContainer}>
          <Ionicons name="information-circle" size={14} color={colors.info} />
          <Text style={styles.reasonText}>{recommendation.reason}</Text>
        </View>

        {/* Meta info (duration, calories, muscle groups) */}
        <View style={styles.metaRow}>
          {recommendation.estimatedDuration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {recommendation.estimatedDuration} min
              </Text>
            </View>
          )}
          {recommendation.estimatedCalories && (
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>
                ~{recommendation.estimatedCalories} cal
              </Text>
            </View>
          )}
        </View>

        {/* Muscle groups */}
        {recommendation.muscleGroups && recommendation.muscleGroups.length > 0 && (
          <View style={styles.muscleGroups}>
            {recommendation.muscleGroups.map((muscle, index) => (
              <View key={index} style={styles.muscleChip}>
                <Text style={styles.muscleChipText}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Exercise list (if present) */}
        {recommendation.exercises && recommendation.exercises.length > 0 && (
          <View style={styles.exerciseSection}>
            <Text style={styles.exerciseSectionTitle}>Exercises</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.exerciseList}
            >
              {recommendation.exercises.map((exercise, index) => (
                <ExercisePreviewCard key={index} exercise={exercise} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {onViewDetails && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onViewDetails}
            >
              <Text style={styles.secondaryButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
          {onStart && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onStart}
            >
              <LinearGradient
                colors={gradients.buttonPrimary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="play" size={16} color={colors.textInverse} />
                <Text style={styles.primaryButtonText}>Start Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// Exercise preview card for the horizontal list
interface ExercisePreviewCardProps {
  exercise: RecommendedExercise;
  style?: object;
}

const ExercisePreviewCard: React.FC<ExercisePreviewCardProps> = ({
  exercise,
  style,
}) => (
  <View style={[styles.exerciseCard, style]}>
    <View style={styles.exerciseIconBg}>
      <Ionicons name="barbell" size={18} color={colors.primary} />
    </View>
    <Text style={styles.exerciseName} numberOfLines={2}>
      {exercise.exerciseName}
    </Text>
    <Text style={styles.exerciseSetsReps}>
      {exercise.sets} x {exercise.reps}
    </Text>
    {exercise.reason && (
      <Text style={styles.exerciseReason} numberOfLines={2}>
        {exercise.reason}
      </Text>
    )}
  </View>
);

// Recommendation list
interface WorkoutSuggestionListProps {
  recommendations: WorkoutRecommendation[];
  onStartWorkout?: (recommendation: WorkoutRecommendation) => void;
  onViewDetails?: (recommendation: WorkoutRecommendation) => void;
  onDismiss?: (recommendation: WorkoutRecommendation) => void;
  maxItems?: number;
  style?: object;
}

export const WorkoutSuggestionList: React.FC<WorkoutSuggestionListProps> = ({
  recommendations,
  onStartWorkout,
  onViewDetails,
  onDismiss,
  maxItems,
  style,
}) => {
  const displayRecommendations = maxItems
    ? recommendations.slice(0, maxItems)
    : recommendations;

  if (displayRecommendations.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Ionicons name="fitness-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No suggestions</Text>
        <Text style={styles.emptyText}>
          Keep training and we'll provide personalized recommendations
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.listContainer, style]}>
      {displayRecommendations.map((rec) => (
        <WorkoutSuggestionCard
          key={rec.id}
          recommendation={rec}
          onStart={onStartWorkout ? () => onStartWorkout(rec) : undefined}
          onViewDetails={onViewDetails ? () => onViewDetails(rec) : undefined}
          onDismiss={onDismiss ? () => onDismiss(rec) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  gradient: {
    padding: spacing.lg,
    position: 'relative',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  reasonText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: colors.info,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  muscleChip: {
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  muscleChipText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  exerciseSection: {
    marginBottom: spacing.lg,
  },
  exerciseSectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exerciseList: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  exerciseCard: {
    width: 120,
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  exerciseIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  exerciseSetsReps: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  exerciseReason: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  compactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactDescription: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  compactDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginRight: spacing.sm,
  },
  compactDurationText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // List container
  listContainer: {
    gap: spacing.md,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  emptyTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default WorkoutSuggestionCard;
