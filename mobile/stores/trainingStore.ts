/**
 * Training Store - Zustand State Management for Training Feature
 * Manages exercises, workouts, history, and AI session data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXERCISES, getExerciseById, searchExercises as searchExercisesData, getExercisesByCategory } from '../data/exercises';
import type {
  ExerciseDetail,
  SavedWorkout,
  SavedWorkoutExercise,
  TrainingHistoryEntry,
  AIWorkoutSession,
} from '../types/training.types';
import { MuscleGroup } from '../types/workout.types';

// ============================================================================
// STORE TYPES
// ============================================================================

interface TrainingState {
  // Exercises
  exercises: ExerciseDetail[];
  featuredExercises: ExerciseDetail[];
  searchQuery: string;
  selectedCategory: string;
  filteredExercises: ExerciseDetail[];

  // Saved Workouts
  savedWorkouts: SavedWorkout[];
  activeWorkoutId: string | null;

  // History
  workoutHistory: TrainingHistoryEntry[];

  // AI Session
  currentAISession: AIWorkoutSession | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Exercises
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  getExercise: (id: string) => ExerciseDetail | undefined;
  searchExercises: (query: string) => ExerciseDetail[];

  // Actions - Saved Workouts
  addWorkout: (workout: Omit<SavedWorkout, 'id' | 'createdAt' | 'updatedAt' | 'timesCompleted' | 'averageScore'>) => void;
  updateWorkout: (id: string, updates: Partial<SavedWorkout>) => void;
  deleteWorkout: (id: string) => void;
  duplicateWorkout: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addExerciseToWorkout: (workoutId: string, exercise: SavedWorkoutExercise) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  reorderExercises: (workoutId: string, exercises: SavedWorkoutExercise[]) => void;

  // Actions - History
  addHistoryEntry: (entry: Omit<TrainingHistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  getHistoryForExercise: (exerciseId: string) => TrainingHistoryEntry[];
  getRecentHistory: (limit: number) => TrainingHistoryEntry[];

  // Actions - AI Session
  startAISession: (exercise: ExerciseDetail) => void;
  endAISession: (sessionData: AIWorkoutSession) => void;
  clearAISession: () => void;

  // Computed
  getTotalWorkouts: () => number;
  getTotalExercisesCompleted: () => number;
  getAverageScore: () => number;
  getStreak: () => number;
}

// ============================================================================
// INITIAL MOCK DATA
// ============================================================================

const INITIAL_SAVED_WORKOUTS: SavedWorkout[] = [
  {
    id: 'workout-1',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps',
    exercises: [
      { exerciseId: 'bench-press', exerciseName: 'Barbell Bench Press', order: 1, targetSets: 4, targetReps: 8, targetWeight: 60, restTime: 120, notes: 'Focus on form' },
      { exerciseId: 'incline-dumbbell-press', exerciseName: 'Incline Dumbbell Press', order: 2, targetSets: 3, targetReps: 10, targetWeight: 20, restTime: 90 },
      { exerciseId: 'overhead-press', exerciseName: 'Barbell Overhead Press', order: 3, targetSets: 3, targetReps: 10, targetWeight: 40, restTime: 90 },
      { exerciseId: 'lateral-raises', exerciseName: 'Dumbbell Lateral Raises', order: 4, targetSets: 3, targetReps: 15, targetWeight: 8, restTime: 60 },
      { exerciseId: 'tricep-pushdowns', exerciseName: 'Cable Tricep Pushdowns', order: 5, targetSets: 3, targetReps: 12, restTime: 60 },
    ],
    scheduledDay: 'monday',
    lastCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timesCompleted: 12,
    averageScore: 87,
    isFavorite: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'workout-2',
    name: 'Pull Day',
    description: 'Back and biceps',
    exercises: [
      { exerciseId: 'barbell-row', exerciseName: 'Barbell Bent-Over Row', order: 1, targetSets: 4, targetReps: 8, targetWeight: 50, restTime: 120 },
      { exerciseId: 'pull-ups', exerciseName: 'Pull-Ups', order: 2, targetSets: 3, targetReps: 8, restTime: 120 },
      { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', order: 3, targetSets: 3, targetReps: 10, targetWeight: 45, restTime: 90 },
      { exerciseId: 'bicep-curls', exerciseName: 'Dumbbell Bicep Curls', order: 4, targetSets: 3, targetReps: 12, targetWeight: 12, restTime: 60 },
      { exerciseId: 'hammer-curls', exerciseName: 'Hammer Curls', order: 5, targetSets: 3, targetReps: 12, targetWeight: 12, restTime: 60 },
    ],
    scheduledDay: 'wednesday',
    lastCompleted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    timesCompleted: 8,
    averageScore: 91,
    isFavorite: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'workout-3',
    name: 'Leg Day',
    description: 'Quads, hamstrings, and calves',
    exercises: [
      { exerciseId: 'barbell-squat', exerciseName: 'Barbell Back Squat', order: 1, targetSets: 4, targetReps: 6, targetWeight: 80, restTime: 180 },
      { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', order: 2, targetSets: 3, targetReps: 10, targetWeight: 60, restTime: 120 },
      { exerciseId: 'leg-press', exerciseName: 'Leg Press', order: 3, targetSets: 3, targetReps: 12, targetWeight: 120, restTime: 120 },
      { exerciseId: 'lunges', exerciseName: 'Walking Lunges', order: 4, targetSets: 3, targetReps: 12, targetWeight: 20, restTime: 90 },
    ],
    scheduledDay: 'friday',
    lastCompleted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timesCompleted: 6,
    averageScore: 85,
    isFavorite: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_HISTORY: TrainingHistoryEntry[] = [
  {
    id: 'hist-1',
    date: new Date().toISOString(),
    exerciseId: 'barbell-squat',
    exerciseName: 'Barbell Back Squat',
    sets: 4,
    reps: 24,
    weight: 80,
    aiScore: 92,
    formScore: 94,
    duration: 1800,
    calories: 180,
    personalRecord: true,
  },
  {
    id: 'hist-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    exerciseId: 'bench-press',
    exerciseName: 'Barbell Bench Press',
    sets: 4,
    reps: 32,
    weight: 60,
    aiScore: 88,
    formScore: 90,
    duration: 1500,
    calories: 150,
    personalRecord: false,
  },
  {
    id: 'hist-3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    exerciseId: 'pull-ups',
    exerciseName: 'Pull-Ups',
    sets: 3,
    reps: 24,
    aiScore: 95,
    formScore: 97,
    duration: 900,
    calories: 90,
    personalRecord: false,
  },
  {
    id: 'hist-4',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    exerciseId: 'romanian-deadlift',
    exerciseName: 'Romanian Deadlift',
    sets: 3,
    reps: 30,
    weight: 60,
    aiScore: 86,
    formScore: 88,
    duration: 1200,
    calories: 120,
    personalRecord: false,
  },
  {
    id: 'hist-5',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    exerciseId: 'overhead-press',
    exerciseName: 'Barbell Overhead Press',
    sets: 3,
    reps: 30,
    weight: 40,
    aiScore: 89,
    formScore: 91,
    duration: 1100,
    calories: 110,
    personalRecord: false,
  },
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      // Initial state
      exercises: EXERCISES,
      featuredExercises: EXERCISES.slice(0, 5),
      searchQuery: '',
      selectedCategory: 'all',
      filteredExercises: EXERCISES,
      savedWorkouts: INITIAL_SAVED_WORKOUTS,
      activeWorkoutId: null,
      workoutHistory: INITIAL_HISTORY,
      currentAISession: null,
      isLoading: false,
      error: null,

      // Exercise actions
      setSearchQuery: (query: string) => {
        const filtered = query.length > 0
          ? searchExercisesData(query)
          : get().selectedCategory === 'all'
            ? EXERCISES
            : getExercisesByCategory(get().selectedCategory as MuscleGroup);

        set({ searchQuery: query, filteredExercises: filtered });
      },

      setSelectedCategory: (categoryId: string) => {
        const filtered = categoryId === 'all'
          ? EXERCISES
          : getExercisesByCategory(categoryId as MuscleGroup);

        set({ selectedCategory: categoryId, filteredExercises: filtered, searchQuery: '' });
      },

      getExercise: (id: string) => {
        return getExerciseById(id);
      },

      searchExercises: (query: string) => {
        return searchExercisesData(query);
      },

      // Saved Workouts actions
      addWorkout: (workout) => {
        const newWorkout: SavedWorkout = {
          ...workout,
          id: `workout-${Date.now()}`,
          timesCompleted: 0,
          averageScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ savedWorkouts: [...get().savedWorkouts, newWorkout] });
      },

      updateWorkout: (id, updates) => {
        set({
          savedWorkouts: get().savedWorkouts.map(w =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
        });
      },

      deleteWorkout: (id) => {
        set({ savedWorkouts: get().savedWorkouts.filter(w => w.id !== id) });
      },

      duplicateWorkout: (id) => {
        const workout = get().savedWorkouts.find(w => w.id === id);
        if (workout) {
          const duplicate: SavedWorkout = {
            ...workout,
            id: `workout-${Date.now()}`,
            name: `${workout.name} (Copy)`,
            timesCompleted: 0,
            averageScore: 0,
            lastCompleted: undefined,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({ savedWorkouts: [...get().savedWorkouts, duplicate] });
        }
      },

      toggleFavorite: (id) => {
        set({
          savedWorkouts: get().savedWorkouts.map(w =>
            w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
          ),
        });
      },

      addExerciseToWorkout: (workoutId, exercise) => {
        set({
          savedWorkouts: get().savedWorkouts.map(w => {
            if (w.id === workoutId) {
              return {
                ...w,
                exercises: [...w.exercises, { ...exercise, order: w.exercises.length + 1 }],
                updatedAt: new Date().toISOString(),
              };
            }
            return w;
          }),
        });
      },

      removeExerciseFromWorkout: (workoutId, exerciseId) => {
        set({
          savedWorkouts: get().savedWorkouts.map(w => {
            if (w.id === workoutId) {
              return {
                ...w,
                exercises: w.exercises
                  .filter(e => e.exerciseId !== exerciseId)
                  .map((e, i) => ({ ...e, order: i + 1 })),
                updatedAt: new Date().toISOString(),
              };
            }
            return w;
          }),
        });
      },

      reorderExercises: (workoutId, exercises) => {
        set({
          savedWorkouts: get().savedWorkouts.map(w =>
            w.id === workoutId
              ? { ...w, exercises, updatedAt: new Date().toISOString() }
              : w
          ),
        });
      },

      // History actions
      addHistoryEntry: (entry) => {
        const newEntry: TrainingHistoryEntry = {
          ...entry,
          id: `hist-${Date.now()}`,
        };
        set({ workoutHistory: [newEntry, ...get().workoutHistory] });

        // Update workout stats if applicable
        const workout = get().savedWorkouts.find(w =>
          w.exercises.some(e => e.exerciseId === entry.exerciseId)
        );
        if (workout) {
          const newTimesCompleted = workout.timesCompleted + 1;
          const newAverageScore = Math.round(
            (workout.averageScore * workout.timesCompleted + entry.aiScore) / newTimesCompleted
          );
          get().updateWorkout(workout.id, {
            timesCompleted: newTimesCompleted,
            averageScore: newAverageScore,
            lastCompleted: new Date().toISOString(),
          });
        }
      },

      clearHistory: () => {
        set({ workoutHistory: [] });
      },

      getHistoryForExercise: (exerciseId) => {
        return get().workoutHistory.filter(h => h.exerciseId === exerciseId);
      },

      getRecentHistory: (limit) => {
        return get().workoutHistory.slice(0, limit);
      },

      // AI Session actions
      startAISession: (exercise) => {
        const session: AIWorkoutSession = {
          id: `session-${Date.now()}`,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          startTime: Date.now(),
          sets: [],
          currentSet: 1,
          isActive: true,
          totalScore: 0,
          feedback: [],
        };
        set({ currentAISession: session });
      },

      endAISession: (sessionData) => {
        // Add to history
        const historyEntry: Omit<TrainingHistoryEntry, 'id'> = {
          date: new Date().toISOString(),
          exerciseId: sessionData.exerciseId,
          exerciseName: sessionData.exerciseName,
          sets: sessionData.sets.length,
          reps: sessionData.sets.reduce((sum, s) => sum + s.reps, 0),
          aiScore: Math.round(sessionData.totalScore),
          formScore: Math.round(
            sessionData.sets.reduce((sum, s) => sum + s.score.formScore, 0) / sessionData.sets.length
          ),
          duration: sessionData.endTime
            ? Math.floor((sessionData.endTime - sessionData.startTime) / 1000)
            : 0,
          calories: Math.round(sessionData.sets.reduce((sum, s) => sum + s.duration * 0.1, 0)),
          personalRecord: false,
        };

        get().addHistoryEntry(historyEntry);
        set({ currentAISession: null });
      },

      clearAISession: () => {
        set({ currentAISession: null });
      },

      // Computed getters
      getTotalWorkouts: () => {
        return get().savedWorkouts.reduce((sum, w) => sum + w.timesCompleted, 0);
      },

      getTotalExercisesCompleted: () => {
        return get().workoutHistory.length;
      },

      getAverageScore: () => {
        const history = get().workoutHistory;
        if (history.length === 0) return 0;
        return Math.round(
          history.reduce((sum, h) => sum + h.aiScore, 0) / history.length
        );
      },

      getStreak: () => {
        const history = get().workoutHistory;
        if (history.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];

          const hasWorkout = history.some(h =>
            h.date.split('T')[0] === dateStr
          );

          if (hasWorkout) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'hyperfit-training-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedWorkouts: state.savedWorkouts,
        workoutHistory: state.workoutHistory,
      }),
    }
  )
);

export default useTrainingStore;
