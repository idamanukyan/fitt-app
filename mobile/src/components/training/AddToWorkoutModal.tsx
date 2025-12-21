/**
 * AddToWorkoutModal - Modal for adding exercises to workouts
 *
 * Features:
 * - List existing workout templates
 * - Create new workout option
 * - Quick add to current/active session
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../../design/tokens';
import { GlassCard } from '../ui/GlassCard';

interface WorkoutTemplate {
  id: number | string;
  name: string;
  exerciseCount: number;
  lastUsed?: string;
}

interface AddToWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseId: string | number;
  exerciseName: string;
  onAddToWorkout?: (workoutId: string | number) => void;
  onCreateNewWorkout?: () => void;
  onStartQuickWorkout?: () => void;
}

export function AddToWorkoutModal({
  visible,
  onClose,
  exerciseId,
  exerciseName,
  onAddToWorkout,
  onCreateNewWorkout,
  onStartQuickWorkout,
}: AddToWorkoutModalProps) {
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<string | number | null>(null);

  useEffect(() => {
    if (visible) {
      loadWorkouts();
    }
  }, [visible]);

  const loadWorkouts = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, use mock data
      const mockWorkouts: WorkoutTemplate[] = [
        { id: 1, name: 'Push Day', exerciseCount: 5, lastUsed: '2 days ago' },
        { id: 2, name: 'Pull Day', exerciseCount: 6, lastUsed: '3 days ago' },
        { id: 3, name: 'Leg Day', exerciseCount: 7, lastUsed: '4 days ago' },
        { id: 4, name: 'Full Body', exerciseCount: 8, lastUsed: '1 week ago' },
        { id: 5, name: 'Upper Body', exerciseCount: 6, lastUsed: '1 week ago' },
      ];
      setWorkouts(mockWorkouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWorkout = (workoutId: string | number) => {
    setSelectedWorkout(workoutId);

    // Show success feedback
    const workout = workouts.find(w => w.id === workoutId);
    Alert.alert(
      'Added to Workout',
      `"${exerciseName}" has been added to "${workout?.name}"`,
      [
        {
          text: 'OK',
          onPress: () => {
            onAddToWorkout?.(workoutId);
            onClose();
          },
        },
      ]
    );
  };

  const handleCreateNew = () => {
    Alert.alert(
      'Create New Workout',
      `Create a new workout starting with "${exerciseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            onCreateNewWorkout?.();
            onClose();
          },
        },
      ]
    );
  };

  const handleQuickStart = () => {
    Alert.alert(
      'Start Quick Workout',
      `Start a quick workout session with "${exerciseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            onStartQuickWorkout?.();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <BlurView intensity={90} style={StyleSheet.absoluteFillObject} />

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add to Workout</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Ionicons name="barbell-outline" size={20} color={colors.primary} />
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exerciseName}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={handleQuickStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="flash" size={20} color={colors.textInverse} />
                <Text style={styles.quickActionText}>Quick Start</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionOutline}
              onPress={handleCreateNew}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.quickActionOutlineText}>New Workout</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR ADD TO EXISTING</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Workout List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading workouts...</Text>
            </View>
          ) : workouts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>Create your first workout above</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.workoutList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.workoutListContent}
            >
              {workouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={[
                    styles.workoutItem,
                    selectedWorkout === workout.id && styles.workoutItemSelected,
                  ]}
                  onPress={() => handleAddToWorkout(workout.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.workoutIcon}>
                    <Ionicons name="list" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.exerciseCount} exercises
                      {workout.lastUsed && ` • ${workout.lastUsed}`}
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: colors.gradientStart,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '80%',
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderRadius: 18,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
  },
  exerciseName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  quickActionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  quickActionOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
  },
  quickActionOutlineText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  dividerText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  workoutList: {
    maxHeight: 300,
  },
  workoutListContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  workoutItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  workoutMeta: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default AddToWorkoutModal;
