/**
 * NextWorkoutCard - Green accent glass card showing next scheduled workout
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

interface NextWorkoutCardProps {
  workout: {
    name: string;
    duration: number;
    exerciseCount: number;
  } | null;
  onStartWorkout: () => void;
  onCreateWorkout: () => void;
}

export const NextWorkoutCard: React.FC<NextWorkoutCardProps> = ({
  workout,
  onStartWorkout,
  onCreateWorkout,
}) => {
  if (!workout) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCreateWorkout}
        style={styles.emptyCard}
      >
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Create Your First Workout</Text>
          <Text style={styles.emptySubtitle}>Build a routine to get started</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(74, 222, 128, 0.08)', 'rgba(74, 222, 128, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.topAccent} />
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.label}>NEXT WORKOUT</Text>
            <Text style={styles.title}>{workout.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{workout.duration} min</Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="barbell-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{workout.exerciseCount} exercises</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onStartWorkout}
            style={styles.playButton}
          >
            <LinearGradient
              colors={gradients.buttonPrimary as unknown as string[]}
              style={styles.playButtonGradient}
            >
              <Ionicons name="play" size={20} color={colors.textInverse} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: radius.xl,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: typography.size.xs,
    color: colors.textDisabled,
  },
  playButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  playButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    borderStyle: 'dashed',
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});

export default NextWorkoutCard;
