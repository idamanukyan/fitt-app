/**
 * ExerciseListCard - Exercise card for discover screen
 * Matches dashboard glass card style
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
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { Exercise } from '../../types/exercise';

interface ExerciseListCardProps {
  exercise: Exercise;
  onPress: () => void;
}

export const ExerciseListCard: React.FC<ExerciseListCardProps> = ({
  exercise,
  onPress,
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner':
        return colors.success;
      case 'Intermediate':
        return colors.warning;
      case 'Advanced':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {exercise.thumbnailUrl ? (
          <Image
            source={{ uri: exercise.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="barbell" size={24} color={colors.textMuted} />
          </View>
        )}

        {/* AI Badge */}
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={10} color={colors.textInverse} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>

        {/* Muscles */}
        <View style={styles.muscleRow}>
          {exercise.primaryMuscles.slice(0, 2).map((muscle, index) => (
            <View key={index} style={styles.muscleChip}>
              <Text style={styles.muscleText}>{muscle}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          {exercise.difficulty && (
            <View style={styles.difficultyBadge}>
              <View
                style={[
                  styles.difficultyDot,
                  { backgroundColor: getDifficultyColor(exercise.difficulty) },
                ]}
              />
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(exercise.difficulty) },
                ]}
              >
                {exercise.difficulty}
              </Text>
            </View>
          )}

          {exercise.isCompound && (
            <View style={styles.compoundBadge}>
              <Text style={styles.compoundText}>Compound</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  muscleChip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  muscleText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  compoundBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  compoundText: {
    fontSize: typography.size.xs,
    color: colors.secondary,
    fontWeight: typography.weight.medium,
  },
});

export default ExerciseListCard;
