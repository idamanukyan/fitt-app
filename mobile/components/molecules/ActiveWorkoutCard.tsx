/**
 * ActiveWorkoutCard - User's active workout card
 * Shows workout with quick stats and actions
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { UserWorkout } from '../../types/workout.types';

interface ActiveWorkoutCardProps {
  workout: UserWorkout;
  onPress: () => void;
  onStart?: () => void;
  onFavorite?: () => void;
}

export default function ActiveWorkoutCard({
  workout,
  onPress,
  onStart,
  onFavorite,
}: ActiveWorkoutCardProps) {
  const formatLastCompleted = (date: string | null): string => {
    if (!date) return 'Never completed';

    const completedDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - completedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Background */}
      <LinearGradient
        colors={[theme.colors.concrete, theme.colors.concreteDark]}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name} numberOfLines={1}>
            {workout.name.toUpperCase()}
          </Text>
          <Text style={styles.workoutType}>
            {workout.workout_type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={workout.is_favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={workout.is_favorite ? theme.colors.techRed : theme.colors.steel}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Times Completed */}
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.techGreen} />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{workout.times_completed}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </View>
        </View>

        {/* Last Completed */}
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={theme.colors.techCyan} />
          <View style={styles.statContent}>
            <Text style={styles.statValue} numberOfLines={1}>
              {formatLastCompleted(workout.last_completed)}
            </Text>
            <Text style={styles.statLabel}>LAST SESSION</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      {onStart && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.techBlue, theme.colors.techCyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Ionicons name="play" size={16} color={theme.colors.black} />
            <Text style={styles.startButtonText}>START WORKOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  workoutType: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 1,
    marginTop: 2,
  },
  startButton: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    shadowColor: theme.colors.techBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  startButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 2,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron + '60',
    pointerEvents: 'none',
  },
});
