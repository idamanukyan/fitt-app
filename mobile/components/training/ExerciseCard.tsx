/**
 * ExerciseCard - Modern Exercise Display Card
 * Matches Dashboard design system with glassmorphism and gradients
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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
import type { ExerciseDetail } from '../../types/training.types';
import { DifficultyLevel, MuscleGroup } from '../../types/workout.types';

interface ExerciseCardProps {
  exercise: ExerciseDetail;
  onPress: () => void;
  compact?: boolean;
  showAIBadge?: boolean;
}

const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case DifficultyLevel.BEGINNER:
      return colors.success;
    case DifficultyLevel.INTERMEDIATE:
      return colors.warning;
    case DifficultyLevel.ADVANCED:
      return colors.accent.orange;
    case DifficultyLevel.EXPERT:
      return colors.error;
    default:
      return colors.textMuted;
  }
};

const getMuscleGroupColor = (muscleGroup: MuscleGroup): string => {
  const colorMap: Record<MuscleGroup, string> = {
    [MuscleGroup.CHEST]: colors.accent.blue,
    [MuscleGroup.BACK]: colors.secondary,
    [MuscleGroup.SHOULDERS]: colors.accent.orange,
    [MuscleGroup.BICEPS]: colors.accent.cyan,
    [MuscleGroup.TRICEPS]: colors.accent.cyan,
    [MuscleGroup.FOREARMS]: colors.accent.cyan,
    [MuscleGroup.ABS]: colors.warning,
    [MuscleGroup.OBLIQUES]: colors.warning,
    [MuscleGroup.QUADS]: colors.accent.pink,
    [MuscleGroup.HAMSTRINGS]: colors.accent.pink,
    [MuscleGroup.GLUTES]: colors.accent.pink,
    [MuscleGroup.CALVES]: colors.accent.pink,
    [MuscleGroup.FULL_BODY]: colors.primary,
    [MuscleGroup.CARDIO]: colors.error,
  };
  return colorMap[muscleGroup] || colors.primary;
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  compact = false,
  showAIBadge = true,
}) => {
  const difficultyColor = getDifficultyColor(exercise.difficulty);
  const muscleColor = getMuscleGroupColor(exercise.category);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <View style={[styles.compactIcon, { backgroundColor: `${muscleColor}20` }]}>
            <Ionicons name="barbell" size={20} color={muscleColor} />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Text style={styles.compactMuscle}>
              {exercise.primaryMuscle}
            </Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
            <Text style={[styles.difficultyText, { color: difficultyColor }]}>
              {exercise.difficulty}
            </Text>
          </View>
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
      {/* Thumbnail/GIF Preview */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: exercise.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.thumbnailOverlay}
        />

        {/* AI Coach Badge */}
        {showAIBadge && (
          <View style={styles.aiBadge}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.aiBadgeGradient}
            >
              <Ionicons name="sparkles" size={10} color={colors.textInverse} />
              <Text style={styles.aiBadgeText}>AI</Text>
            </LinearGradient>
          </View>
        )}

        {/* Equipment Tags */}
        <View style={styles.equipmentTags}>
          {exercise.equipment.slice(0, 2).map((eq, index) => (
            <View key={index} style={styles.equipmentTag}>
              <Text style={styles.equipmentTagText}>
                {eq.replace('_', ' ')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={[styles.difficultyPill, { backgroundColor: `${difficultyColor}20` }]}>
            <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
            <Text style={[styles.difficultyLabel, { color: difficultyColor }]}>
              {exercise.difficulty}
            </Text>
          </View>
        </View>

        <View style={styles.muscleRow}>
          <View style={[styles.muscleChip, { backgroundColor: `${muscleColor}15`, borderColor: `${muscleColor}40` }]}>
            <Text style={[styles.muscleChipText, { color: muscleColor }]}>
              {exercise.primaryMuscle}
            </Text>
          </View>
          {exercise.secondaryMuscles.length > 0 && (
            <Text style={styles.secondaryText}>
              +{exercise.secondaryMuscles.length} more
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={14} color={colors.accent.orange} />
            <Text style={styles.metaText}>
              ~{exercise.estimatedCaloriesPerMinute} cal/min
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.secondary} />
            <Text style={styles.metaText}>
              {exercise.restBetweenSets}s rest
            </Text>
          </View>
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
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  thumbnailContainer: {
    height: 140,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bgCard,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  aiBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  aiBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
  equipmentTags: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  equipmentTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  equipmentTagText: {
    fontSize: typography.size.xs,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
    textTransform: 'capitalize',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  difficultyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textTransform: 'capitalize',
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  muscleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  muscleChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  secondaryText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
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
    marginBottom: spacing.sm,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  compactMuscle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  difficultyText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textTransform: 'capitalize',
  },
});

export default ExerciseCard;
