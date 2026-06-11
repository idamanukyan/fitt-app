/**
 * NextWorkoutCard - Displays next scheduled workout with start button
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

// ============================================================================
// TYPES
// ============================================================================
export interface NextWorkout {
  title: string;
  duration: string;
  exercises: number;
}

export interface NextWorkoutCardProps {
  nextWorkout: NextWorkout | null;
  onStartWorkout: () => void;
}

export const NextWorkoutCard: React.FC<NextWorkoutCardProps> = ({
  nextWorkout,
  onStartWorkout,
}) => (
  <View style={styles.workoutCard}>
    <View style={styles.workoutContent}>
      <View style={styles.workoutIconWrap}>
        <Ionicons name="barbell" size={24} color={colors.primary} />
      </View>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutTitle}>
          {nextWorkout?.title || 'No workout scheduled'}
        </Text>
        <Text style={styles.workoutMeta}>
          {nextWorkout
            ? `${nextWorkout.duration} · ${nextWorkout.exercises} exercises`
            : 'Add a workout to get started'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </View>

    <TouchableOpacity
      onPress={onStartWorkout}
      activeOpacity={0.9}
      style={styles.startWorkoutButton}
    >
      <LinearGradient
        colors={gradients.buttonPrimary as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.startWorkoutGradient}
      >
        <Text style={styles.startWorkoutText}>
          {nextWorkout ? 'Start Workout' : 'Browse Workouts'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

export default NextWorkoutCard;

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    ...shadows.card,
  },
  workoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  workoutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  workoutMeta: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  startWorkoutButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  startWorkoutText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});
