/**
 * WorkoutTemplateCard - Display workout template with stats
 * High-tech architecture design
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { WorkoutTemplateSummary } from '../../types/workout.types';

interface WorkoutTemplateCardProps {
  template: WorkoutTemplateSummary;
  onPress: () => void;
}

export default function WorkoutTemplateCard({ template, onPress }: WorkoutTemplateCardProps) {
  const getDifficultyColor = () => {
    switch (template.difficulty_level) {
      case 'beginner':
        return theme.colors.techGreen;
      case 'intermediate':
        return theme.colors.techOrange;
      case 'advanced':
        return theme.colors.techRed;
      default:
        return theme.colors.techBlue;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.concrete, theme.colors.concreteDark]}
        style={styles.background}
      />

      {/* Thumbnail */}
      {template.thumbnail_url ? (
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: template.thumbnail_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.thumbnailOverlay} />
        </View>
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="barbell-outline" size={40} color={theme.colors.steel} />
        </View>
      )}

      {/* Premium Badge */}
      {template.is_premium && (
        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={12} color={theme.colors.black} />
          <Text style={styles.premiumText}>PRO</Text>
        </View>
      )}

      {/* Featured Badge */}
      {template.is_featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="flame" size={12} color={theme.colors.techOrange} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {template.name.toUpperCase()}
        </Text>

        <View style={styles.metadata}>
          {/* Workout Type */}
          <View style={styles.metaPill}>
            <Ionicons name="fitness-outline" size={12} color={theme.colors.techBlue} />
            <Text style={styles.metaText}>
              {template.workout_type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          {/* Duration */}
          {template.duration_minutes && (
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={12} color={theme.colors.steel} />
              <Text style={styles.metaText}>{template.duration_minutes} MIN</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Difficulty */}
          {template.difficulty_level && (
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor() + '20' },
              ]}
            >
              <Text
                style={[styles.difficultyText, { color: getDifficultyColor() }]}
              >
                {template.difficulty_level.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Rating */}
          {template.rating_average > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={theme.colors.techOrange} />
              <Text style={styles.ratingText}>{template.rating_average.toFixed(1)}</Text>
            </View>
          )}

          {/* Times Used */}
          <View style={styles.usedContainer}>
            <Ionicons name="people-outline" size={12} color={theme.colors.steelDark} />
            <Text style={styles.usedText}>{template.times_used}</Text>
          </View>
        </View>
      </View>

      {/* Border */}
      <View style={styles.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  thumbnailContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.black + '30',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colors.concreteDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
  },
  premiumBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.techOrange,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 1,
  },
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.black + '80',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.techOrange,
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.steel,
    letterSpacing: 0.5,
  },
  statsRow: {
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
  },
  usedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  usedText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steelDark,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron + '60',
    pointerEvents: 'none',
  },
});
