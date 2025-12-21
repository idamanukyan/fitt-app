/**
 * ExerciseCard - High-tech architecture exercise display
 * Shows exercise with image, muscle group, equipment
 * Supports both new ExerciseSummary and legacy Exercise types
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { Exercise, MuscleGroup as LegacyMuscleGroup, Equipment as LegacyEquipment } from '../../types/workout.types';
import type {
  ExerciseSummary,
  MuscleGroup,
  Equipment,
  DifficultyLevel,
} from '../../types/exercise.types';

// Support both new ExerciseSummary and legacy Exercise type
type ExerciseData = ExerciseSummary | Exercise;

interface ExerciseCardProps {
  exercise: ExerciseData;
  onPress: () => void;
  onSavePress?: () => void;
  isSaved?: boolean;
  compact?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

// Type guard to check if it's new ExerciseSummary
const isExerciseSummary = (exercise: ExerciseData): exercise is ExerciseSummary => {
  return 'body_part' in exercise && 'is_rehab' in exercise;
};

export default function ExerciseCard({
  exercise,
  onPress,
  onSavePress,
  isSaved = false,
  compact = false,
  variant = 'default',
}: ExerciseCardProps) {
  // Normalize data access for both types
  const muscleGroup = isExerciseSummary(exercise) ? exercise.muscle_group : exercise.muscle_group;
  const equipment = isExerciseSummary(exercise) ? exercise.equipment : exercise.equipment;
  const difficulty = isExerciseSummary(exercise) ? exercise.difficulty : exercise.difficulty;
  const thumbnailUrl = isExerciseSummary(exercise) ? exercise.thumbnail_url : exercise.thumbnail_url;
  const isPopular = isExerciseSummary(exercise) ? exercise.is_popular : exercise.is_popular;
  const isRehab = isExerciseSummary(exercise) ? exercise.is_rehab : false;
  const isCompound = isExerciseSummary(exercise) ? false : exercise.is_compound;

  const getMuscleGroupColor = (mg: string): string => {
    const colors: Record<string, string> = {
      chest: theme.colors.techBlue,
      back: theme.colors.techCyan,
      lats: theme.colors.techCyan,
      shoulders: theme.colors.techOrange,
      biceps: theme.colors.techGreen,
      triceps: theme.colors.neonPink,
      forearms: theme.colors.neonOrange,
      quads: theme.colors.neonPurple,
      hamstrings: theme.colors.neonPurple,
      glutes: theme.colors.neonPink,
      calves: theme.colors.neonPurple,
      abs: theme.colors.techGreen,
      core: theme.colors.techGreen,
      cardio: theme.colors.techOrange,
      full_body: theme.colors.techBlue,
      traps: theme.colors.techCyan,
      lower_back: theme.colors.techCyan,
    };
    return colors[mg] || theme.colors.techBlue;
  };

  const getEquipmentIcon = (eq: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      barbell: 'barbell-outline',
      dumbbell: 'barbell-outline',
      kettlebell: 'fitness-outline',
      machine: 'hardware-chip-outline',
      cable: 'git-network-outline',
      bodyweight: 'body-outline',
      resistance_band: 'remove-outline',
      pull_up_bar: 'remove-outline',
      bench: 'bed-outline',
      foam_roller: 'ellipse-outline',
      none: 'ban-outline',
    };
    return icons[eq] || 'fitness-outline';
  };

  const getDifficultyColor = (diff: string): string => {
    switch (diff) {
      case 'beginner':
        return theme.colors.techGreen;
      case 'intermediate':
        return theme.colors.techOrange;
      case 'advanced':
        return theme.colors.techRed;
      case 'expert':
        return theme.colors.neonPink;
      default:
        return theme.colors.steel;
    }
  };

  const formatText = (text: string): string => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  // Featured variant
  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Background */}
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={theme.gradients.techBlue}
            style={styles.featuredGradient}
          />
        )}

        {/* Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(26, 26, 26, 0.95)']}
          style={styles.featuredOverlay}
        />

        {/* Badges */}
        <View style={styles.featuredBadges}>
          {isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="trending-up" size={10} color={theme.colors.black} />
              <Text style={styles.badgeText}>POPULAR</Text>
            </View>
          )}
          {isRehab && (
            <View style={styles.rehabBadge}>
              <Ionicons name="medkit" size={10} color={theme.colors.black} />
              <Text style={styles.badgeText}>REHAB</Text>
            </View>
          )}
        </View>

        {/* Save Button */}
        {onSavePress && (
          <TouchableOpacity
            style={styles.featuredSaveBtn}
            onPress={onSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? theme.colors.techBlue : theme.colors.white}
            />
          </TouchableOpacity>
        )}

        {/* Content */}
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {exercise.name.toUpperCase()}
          </Text>

          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <View style={[styles.metaDot, { backgroundColor: getMuscleGroupColor(muscleGroup) }]} />
              <Text style={styles.metaText}>{formatText(muscleGroup)}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons
                name={getEquipmentIcon(equipment)}
                size={12}
                color={theme.colors.steel}
              />
              <Text style={styles.metaText}>{formatText(equipment)}</Text>
            </View>

            <View style={[styles.difficultyPill, { borderColor: getDifficultyColor(difficulty) }]}>
              <Text style={[styles.difficultyPillText, { color: getDifficultyColor(difficulty) }]}>
                {formatText(difficulty)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Compact variant
  if (variant === 'compact' || compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={styles.compactThumb}>
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.compactThumbImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.compactThumbPlaceholder, { borderColor: getMuscleGroupColor(muscleGroup) }]}>
              <Ionicons
                name="fitness-outline"
                size={20}
                color={getMuscleGroupColor(muscleGroup)}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {exercise.name.toUpperCase()}
          </Text>
          <View style={styles.compactMeta}>
            <Text style={[styles.compactMetaText, { color: getMuscleGroupColor(muscleGroup) }]}>
              {formatText(muscleGroup)}
            </Text>
            <View style={styles.compactDot} />
            <Text style={styles.compactMetaText}>{formatText(equipment)}</Text>
          </View>
        </View>

        {/* Save Button */}
        {onSavePress && (
          <TouchableOpacity
            style={styles.compactSaveBtn}
            onPress={onSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? theme.colors.techBlue : theme.colors.steelDark}
            />
          </TouchableOpacity>
        )}

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={18} color={theme.colors.steelDark} />
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Background */}
      <View style={styles.background}>
        <LinearGradient
          colors={[theme.colors.concrete, theme.colors.concreteDark]}
          style={styles.gradientBg}
        />
      </View>

      {/* Exercise Image/Thumbnail */}
      {thumbnailUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Badges on image */}
          {(isPopular || isRehab) && (
            <View style={styles.imageBadges}>
              {isPopular && (
                <View style={styles.smallBadge}>
                  <Ionicons name="flame" size={10} color={theme.colors.black} />
                </View>
              )}
              {isRehab && (
                <View style={[styles.smallBadge, { backgroundColor: theme.colors.techGreen }]}>
                  <Ionicons name="medkit" size={10} color={theme.colors.black} />
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.imagePlaceholder, { borderColor: getMuscleGroupColor(muscleGroup) }]}>
          <Ionicons
            name="fitness-outline"
            size={32}
            color={getMuscleGroupColor(muscleGroup)}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {exercise.name.toUpperCase()}
        </Text>

        {/* Metadata Pills */}
        <View style={styles.metadata}>
          {/* Muscle Group Pill */}
          <View
            style={[
              styles.pill,
              { borderColor: getMuscleGroupColor(muscleGroup) },
            ]}
          >
            <View
              style={[
                styles.pillDot,
                { backgroundColor: getMuscleGroupColor(muscleGroup) },
              ]}
            />
            <Text
              style={[
                styles.pillText,
                { color: getMuscleGroupColor(muscleGroup) },
              ]}
            >
              {formatText(muscleGroup)}
            </Text>
          </View>

          {/* Equipment Pill */}
          <View style={[styles.pill, { borderColor: theme.colors.steel }]}>
            <Ionicons
              name={getEquipmentIcon(equipment)}
              size={10}
              color={theme.colors.steel}
            />
            <Text style={[styles.pillText, { color: theme.colors.steel }]}>
              {formatText(equipment)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(difficulty) + '20' },
            ]}
          >
            <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>
              {formatText(difficulty)}
            </Text>
          </View>

          {isCompound && (
            <View style={styles.compoundBadge}>
              <Ionicons name="git-network-outline" size={10} color={theme.colors.techCyan} />
              <Text style={styles.compoundText}>COMPOUND</Text>
            </View>
          )}

          {/* Save Button */}
          {onSavePress && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onSavePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? theme.colors.techBlue : theme.colors.steelDark}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Border Glow */}
      <View
        style={[
          styles.border,
          { borderColor: getMuscleGroupColor(muscleGroup) + '40' },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default container
  container: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientBg: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.black + '40',
  },
  imageBadges: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    flexDirection: 'row',
    gap: 4,
  },
  smallBadge: {
    backgroundColor: theme.colors.techOrange,
    borderRadius: theme.borderRadius.sm,
    padding: 4,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.concreteDark,
    borderBottomWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    backgroundColor: theme.colors.concreteDark + '80',
    gap: 4,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  compoundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.techCyan + '20',
  },
  compoundText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.techCyan,
    letterSpacing: 0.5,
  },
  saveBtn: {
    marginLeft: 'auto',
    padding: theme.spacing.xs,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    pointerEvents: 'none',
  },

  // Featured variant
  featuredContainer: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    overflow: 'hidden',
    height: 200,
    ...theme.shadows.techBlueGlow,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
  },
  featuredBadges: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
    gap: 6,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.techOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  rehabBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.techGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.5,
  },
  featuredSaveBtn: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.borderRadius.full,
    padding: 6,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
  },
  featuredTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steel,
    fontWeight: '500',
  },
  difficultyPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyPillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Compact variant
  compactContainer: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  compactThumb: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  compactThumbImage: {
    width: '100%',
    height: '100%',
  },
  compactThumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactMetaText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
  },
  compactDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.steelDark,
  },
  compactSaveBtn: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
});
