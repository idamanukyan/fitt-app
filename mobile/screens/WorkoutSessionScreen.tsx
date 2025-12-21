/**
 * WorkoutSessionScreen - Active workout logging screen
 * Track sets, reps, weight for each exercise in real-time
 * High-tech architecture design
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import {
  getMyWorkoutById,
  createSession,
  completeSession,
  updateSession,
} from '../services/workoutService';
import { UserWorkout, SetData, WorkoutSession } from '../types/workout.types';
import SetTracker from '../components/atoms/SetTracker';

interface ExerciseSessionData {
  exercise_id: number;
  exercise_name: string;
  order_index: number;
  target_sets: number;
  target_reps: number | null;
  sets: SetData[];
  notes: string;
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<UserWorkout | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [exercisesData, setExercisesData] = useState<ExerciseSessionData[]>([]);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number>(0);

  useEffect(() => {
    loadWorkout();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadWorkout = async () => {
    try {
      const data = await getMyWorkoutById(workoutId);
      setWorkout(data);

      // Initialize exercise session data
      const initialData: ExerciseSessionData[] = data.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name || 'Exercise',
        order_index: ex.order_index,
        target_sets: ex.sets || 3,
        target_reps: ex.reps,
        sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
          set: i + 1,
          reps: ex.reps || 0,
          weight: 0,
          completed: false,
        })),
        notes: '',
      }));
      setExercisesData(initialData);

      // Create workout session
      await createWorkoutSession();
    } catch (error) {
      console.error('Error loading workout:', error);
      Alert.alert('Error', 'Failed to load workout');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const createWorkoutSession = async () => {
    try {
      const session = await createSession({
        user_workout_id: workoutId,
        title: workout?.name,
        started_at: new Date().toISOString(),
        is_completed: false,
        exercise_logs: [],
      });
      setSessionId(session.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const formatDuration = () => {
    const diff = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'completed',
    value: number | boolean
  ) => {
    setExercisesData((prev) => {
      const newData = [...prev];
      const exercise = { ...newData[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        [field]: value,
      };
      exercise.sets = sets;
      newData[exerciseIndex] = exercise;
      return newData;
    });
  };

  const handleNotesChange = (exerciseIndex: number, notes: string) => {
    setExercisesData((prev) => {
      const newData = [...prev];
      newData[exerciseIndex] = {
        ...newData[exerciseIndex],
        notes,
      };
      return newData;
    });
  };

  const calculateStats = () => {
    let totalSets = 0;
    let completedSets = 0;
    let totalVolume = 0;
    let totalReps = 0;

    exercisesData.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        totalSets++;
        if (set.completed) {
          completedSets++;
          totalVolume += (set.weight || 0) * (set.reps || 0);
          totalReps += set.reps || 0;
        }
      });
    });

    return { totalSets, completedSets, totalVolume, totalReps };
  };

  const handleFinishWorkout = async () => {
    const stats = calculateStats();

    if (stats.completedSets === 0) {
      Alert.alert('No Sets Completed', 'Please complete at least one set before finishing.');
      return;
    }

    Alert.alert(
      'Finish Workout?',
      `You've completed ${stats.completedSets} of ${stats.totalSets} sets.\n\nTotal Volume: ${stats.totalVolume.toFixed(0)}kg\nTotal Reps: ${stats.totalReps}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            try {
              if (!sessionId) return;

              const duration = Math.floor(
                (currentTime.getTime() - startTime.getTime()) / 60000
              );

              // Prepare exercise logs
              const exercise_logs = exercisesData.map((exercise) => ({
                exercise_id: exercise.exercise_id,
                order_index: exercise.order_index,
                sets_data: JSON.stringify(exercise.sets.filter((s) => s.completed)),
                total_sets: exercise.sets.filter((s) => s.completed).length,
                total_reps: exercise.sets
                  .filter((s) => s.completed)
                  .reduce((sum, s) => sum + (s.reps || 0), 0),
                max_weight:
                  Math.max(
                    ...exercise.sets.filter((s) => s.completed).map((s) => s.weight || 0)
                  ) || null,
                total_volume: exercise.sets
                  .filter((s) => s.completed)
                  .reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0),
                notes: exercise.notes || null,
                personal_record: false,
              }));

              // Update session with completion data
              await updateSession(sessionId, {
                ended_at: new Date().toISOString(),
                duration_minutes: duration,
                total_volume: stats.totalVolume,
                total_reps: stats.totalReps,
                total_exercises: exercisesData.length,
                is_completed: true,
              });

              // Complete session (this will show rating prompt)
              Alert.alert(
                'Great Work!',
                'Rate your workout',
                [
                  { text: '1⭐', onPress: () => finishWithRating(1) },
                  { text: '2⭐', onPress: () => finishWithRating(2) },
                  { text: '3⭐', onPress: () => finishWithRating(3) },
                  { text: '4⭐', onPress: () => finishWithRating(4) },
                  { text: '5⭐', onPress: () => finishWithRating(5) },
                ],
                { cancelable: false }
              );
            } catch (error) {
              console.error('Error finishing workout:', error);
              Alert.alert('Error', 'Failed to save workout session');
            }
          },
        },
      ]
    );
  };

  const finishWithRating = async (rating: number) => {
    try {
      if (sessionId) {
        await completeSession(sessionId, rating);
      }
      router.replace('/(tabs)/training');
    } catch (error) {
      console.error('Error rating workout:', error);
      router.replace('/(tabs)/training');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>STARTING WORKOUT...</Text>
      </View>
    );
  }

  if (!workout) return null;

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout.name.toUpperCase()}
          </Text>
          <Text style={styles.timer}>{formatDuration()}</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {stats.completedSets}/{stats.totalSets}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={16} color={theme.colors.techGreen} />
          <Text style={styles.statLabel}>VOLUME</Text>
          <Text style={styles.statValue}>{stats.totalVolume.toFixed(0)}kg</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="repeat-outline" size={16} color={theme.colors.techCyan} />
          <Text style={styles.statLabel}>REPS</Text>
          <Text style={styles.statValue}>{stats.totalReps}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={16} color={theme.colors.techBlue} />
          <Text style={styles.statLabel}>EXERCISES</Text>
          <Text style={styles.statValue}>{exercisesData.length}</Text>
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercisesData.map((exercise, exerciseIndex) => {
          const isExpanded = expandedExerciseIndex === exerciseIndex;
          const completedSets = exercise.sets.filter((s) => s.completed).length;

          return (
            <View key={exerciseIndex} style={styles.exerciseCard}>
              {/* Exercise Header */}
              <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() =>
                  setExpandedExerciseIndex(isExpanded ? -1 : exerciseIndex)
                }
                activeOpacity={0.8}
              >
                <View style={styles.exerciseHeaderLeft}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text>
                  </View>
                  <View style={styles.exerciseHeaderContent}>
                    <Text style={styles.exerciseName} numberOfLines={1}>
                      {exercise.exercise_name.toUpperCase()}
                    </Text>
                    <Text style={styles.exerciseTarget}>
                      TARGET: {exercise.target_sets} sets
                      {exercise.target_reps && ` × ${exercise.target_reps} reps`}
                    </Text>
                  </View>
                </View>

                <View style={styles.exerciseHeaderRight}>
                  <View
                    style={[
                      styles.completionBadge,
                      completedSets === exercise.sets.length &&
                        styles.completionBadgeComplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.completionText,
                        completedSets === exercise.sets.length &&
                          styles.completionTextComplete,
                      ]}
                    >
                      {completedSets}/{exercise.sets.length}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.steel}
                  />
                </View>
              </TouchableOpacity>

              {/* Exercise Sets */}
              {isExpanded && (
                <View style={styles.setsContainer}>
                  <View style={styles.setsHeader}>
                    <Text style={styles.setsTitle}>SETS</Text>
                  </View>

                  {exercise.sets.map((set, setIndex) => (
                    <SetTracker
                      key={setIndex}
                      setNumber={set.set}
                      reps={set.reps}
                      weight={set.weight}
                      completed={set.completed}
                      onRepsChange={(reps) =>
                        handleSetChange(exerciseIndex, setIndex, 'reps', reps)
                      }
                      onWeightChange={(weight) =>
                        handleSetChange(exerciseIndex, setIndex, 'weight', weight)
                      }
                      onCompletedChange={(completed) =>
                        handleSetChange(exerciseIndex, setIndex, 'completed', completed)
                      }
                      editable={true}
                      showWeight={true}
                    />
                  ))}

                  {/* Notes */}
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>NOTES (OPTIONAL)</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={exercise.notes}
                      onChangeText={(text) => handleNotesChange(exerciseIndex, text)}
                      placeholder="Add notes about this exercise..."
                      placeholderTextColor={theme.colors.iron}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Spacer for finish button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Finish Button */}
      <View style={styles.finishButtonContainer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishWorkout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.techGreen, theme.colors.techGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.black} />
            <Text style={styles.finishButtonText}>FINISH WORKOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.concreteDark + 'E6',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
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
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  workoutName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  timer: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techGreen,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.techGreen,
    letterSpacing: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.concrete,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.iron,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.steelDark,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  exerciseCard: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  exerciseHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },
  exerciseHeaderContent: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  exerciseTarget: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 0.5,
  },
  exerciseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  completionBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.steel,
  },
  completionBadgeComplete: {
    backgroundColor: theme.colors.techGreen + '20',
    borderColor: theme.colors.techGreen,
  },
  completionText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.steel,
    letterSpacing: 1,
  },
  completionTextComplete: {
    color: theme.colors.techGreen,
  },
  setsContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
    backgroundColor: theme.colors.concreteDark,
  },
  setsHeader: {
    marginBottom: theme.spacing.sm,
  },
  setsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.steel,
    letterSpacing: 2,
  },
  notesContainer: {
    marginTop: theme.spacing.md,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.steelDark,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  notesInput: {
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  finishButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.concreteDark + 'E6',
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  finishButton: {
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    shadowColor: theme.colors.techGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  finishButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 2,
  },
});
