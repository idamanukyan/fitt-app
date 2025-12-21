/**
 * WorkoutDetailScreen - View workout template/plan details with all exercises
 * Supports both templates and user workouts
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import {
  getTemplateById,
  getMyWorkoutById,
  createWorkoutFromTemplate,
} from '../services/workoutService';
import { WorkoutTemplate, UserWorkout } from '../types/workout.types';
import ExercisePill from '../components/atoms/ExercisePill';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = parseInt(params.id as string);
  const isUserWorkout = params.type === 'user';

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [userWorkout, setUserWorkout] = useState<UserWorkout | null>(null);

  useEffect(() => {
    loadWorkoutDetails();
  }, []);

  const loadWorkoutDetails = async () => {
    try {
      if (isUserWorkout) {
        const workout = await getMyWorkoutById(workoutId);
        setUserWorkout(workout);
      } else {
        const tmpl = await getTemplateById(workoutId);
        setTemplate(tmpl);
      }
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!template) return;
    try {
      const newWorkout = await createWorkoutFromTemplate(template.id);
      router.replace(`/workout-session/${newWorkout.id}`);
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const handleStartWorkout = () => {
    router.push(`/workout-session/${workoutId}`);
  };

  const data = isUserWorkout ? userWorkout : template;
  const exercises = data?.exercises || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>LOADING WORKOUT...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{data?.name.toUpperCase()}</Text>
          {data?.description && (
            <Text style={styles.description}>{data.description}</Text>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={[theme.colors.concrete, theme.colors.concreteDark]}
            style={styles.statsCardBackground}
          />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={20} color={theme.colors.techBlue} />
              <Text style={styles.statLabel}>TYPE</Text>
              <Text style={styles.statValue}>
                {data?.workout_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            {data && 'duration_minutes' in data && data.duration_minutes && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={theme.colors.techCyan} />
                <Text style={styles.statLabel}>DURATION</Text>
                <Text style={styles.statValue}>{data.duration_minutes} MIN</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={20} color={theme.colors.techGreen} />
              <Text style={styles.statLabel}>EXERCISES</Text>
              <Text style={styles.statValue}>{exercises.length}</Text>
            </View>
          </View>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>EXERCISES ({exercises.length})</Text>

          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {exercise.exercise_name?.toUpperCase() || 'EXERCISE'}
                  </Text>
                  <View style={styles.exerciseMeta}>
                    {exercise.sets && (
                      <ExercisePill
                        label={`${exercise.sets} SETS`}
                        color={theme.colors.techBlue}
                        size="small"
                      />
                    )}
                    {exercise.reps && (
                      <ExercisePill
                        label={`${exercise.reps} REPS`}
                        color={theme.colors.techCyan}
                        size="small"
                      />
                    )}
                    {exercise.rest_seconds && (
                      <ExercisePill
                        label={`${exercise.rest_seconds}s REST`}
                        color={theme.colors.steelDark}
                        size="small"
                      />
                    )}
                  </View>
                  {exercise.notes && (
                    <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {isUserWorkout ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartWorkout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.techBlue, theme.colors.techCyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="play" size={20} color={theme.colors.black} />
                <Text style={styles.actionButtonText}>START WORKOUT</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUseTemplate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.techGreen, theme.colors.techCyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="add-circle" size={20} color={theme.colors.black} />
                <Text style={styles.actionButtonText}>USE THIS TEMPLATE</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techBlue,
    fontWeight: '700',
    letterSpacing: 2,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.steel,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
  statsCard: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  statsCardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  statsRow: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.steelDark,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  exercisesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
  },
  exerciseItem: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.techBlue + '20',
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  exerciseInfo: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  exerciseNotes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    fontStyle: 'italic',
  },
  actionContainer: {
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.colors.techBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 2,
  },
});
