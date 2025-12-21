/**
 * Workout Service - Complete API integration for workout system
 * Handles exercises, templates, user workouts, and sessions
 */
import apiClient from './api';
import {
  Exercise,
  ExerciseFilters,
  WorkoutTemplate,
  WorkoutTemplateSummary,
  WorkoutTemplateListResponse,
  UserWorkout,
  UserWorkoutSummary,
  UserWorkoutCreate,
  UserWorkoutUpdate,
  WorkoutSession,
  WorkoutSessionSummary,
  WorkoutSessionCreate,
  WorkoutSessionUpdate,
  WorkoutStats,
} from '../types/workout.types';

// ========== Exercise API ==========

/**
 * Get all exercises with optional filters
 */
export const getExercises = async (filters?: ExerciseFilters): Promise<Exercise[]> => {
  const params = new URLSearchParams();

  if (filters?.muscle_group) params.append('muscle_group', filters.muscle_group);
  if (filters?.equipment) params.append('equipment', filters.equipment);
  if (filters?.exercise_type) params.append('exercise_type', filters.exercise_type);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.is_popular !== undefined) params.append('is_popular', String(filters.is_popular));

  const response = await apiClient.get(`/exercises?${params.toString()}`);
  return response.data;
};

/**
 * Get single exercise by ID
 */
export const getExerciseById = async (id: number): Promise<Exercise> => {
  const response = await apiClient.get(`/exercises/${id}`);
  return response.data;
};

/**
 * Search exercises by name
 */
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const response = await apiClient.get(`/exercises/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// ========== Workout Template API ==========

/**
 * Get all workout templates (public library)
 */
export const getWorkoutTemplates = async (
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    workout_type?: string;
    difficulty_level?: string;
    is_featured?: boolean;
    is_premium?: boolean;
  }
): Promise<WorkoutTemplateListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (filters?.workout_type) params.append('workout_type', filters.workout_type);
  if (filters?.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
  if (filters?.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
  if (filters?.is_premium !== undefined) params.append('is_premium', String(filters.is_premium));

  const response = await apiClient.get(`/workouts/templates?${params.toString()}`);
  return response.data;
};

/**
 * Get single workout template by ID
 */
export const getTemplateById = async (id: number): Promise<WorkoutTemplate> => {
  const response = await apiClient.get(`/workouts/templates/${id}`);
  return response.data;
};

/**
 * Get featured workout templates
 */
export const getFeaturedTemplates = async (): Promise<WorkoutTemplateSummary[]> => {
  const response = await apiClient.get('/workouts/templates/featured');
  return response.data;
};

// ========== User Workout API ==========

/**
 * Get user's workout plans
 */
export const getMyWorkouts = async (
  activeOnly: boolean = false
): Promise<UserWorkout[]> => {
  const params = activeOnly ? '?active_only=true' : '';
  const response = await apiClient.get(`/workouts/my-workouts${params}`);
  return response.data;
};

/**
 * Get single user workout by ID
 */
export const getMyWorkoutById = async (id: number): Promise<UserWorkout> => {
  const response = await apiClient.get(`/workouts/my-workouts/${id}`);
  return response.data;
};

/**
 * Create new user workout
 */
export const createWorkout = async (data: UserWorkoutCreate): Promise<UserWorkout> => {
  const response = await apiClient.post('/workouts/my-workouts', data);
  return response.data;
};

/**
 * Create workout from template
 */
export const createWorkoutFromTemplate = async (
  templateId: number,
  customName?: string
): Promise<UserWorkout> => {
  const response = await apiClient.post(`/workouts/templates/${templateId}/use`, {
    custom_name: customName,
  });
  return response.data;
};

/**
 * Update user workout
 */
export const updateWorkout = async (
  id: number,
  data: UserWorkoutUpdate
): Promise<UserWorkout> => {
  const response = await apiClient.patch(`/workouts/my-workouts/${id}`, data);
  return response.data;
};

/**
 * Delete user workout
 */
export const deleteWorkout = async (id: number): Promise<void> => {
  await apiClient.delete(`/workouts/my-workouts/${id}`);
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (id: number): Promise<UserWorkout> => {
  const response = await apiClient.post(`/workouts/my-workouts/${id}/favorite`);
  return response.data;
};

// ========== Workout Session API ==========

/**
 * Get user's workout sessions (history)
 */
export const getWorkoutSessions = async (
  page: number = 1,
  pageSize: number = 20,
  completedOnly: boolean = false
): Promise<{ total: number; sessions: WorkoutSessionSummary[] }> => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (completedOnly) params.append('completed_only', 'true');

  const response = await apiClient.get(`/workouts/sessions?${params.toString()}`);
  return response.data;
};

/**
 * Get single workout session by ID
 */
export const getSessionById = async (id: number): Promise<WorkoutSession> => {
  const response = await apiClient.get(`/workouts/sessions/${id}`);
  return response.data;
};

/**
 * Create new workout session (start workout)
 */
export const createSession = async (data: WorkoutSessionCreate): Promise<WorkoutSession> => {
  const response = await apiClient.post('/workouts/sessions', data);
  return response.data;
};

/**
 * Update workout session (during or after workout)
 */
export const updateSession = async (
  id: number,
  data: WorkoutSessionUpdate
): Promise<WorkoutSession> => {
  const response = await apiClient.patch(`/workouts/sessions/${id}`, data);
  return response.data;
};

/**
 * Complete workout session
 */
export const completeSession = async (
  id: number,
  rating?: number
): Promise<WorkoutSession> => {
  const response = await apiClient.post(`/workouts/sessions/${id}/complete`, {
    rating,
  });
  return response.data;
};

/**
 * Delete workout session
 */
export const deleteSession = async (id: number): Promise<void> => {
  await apiClient.delete(`/workouts/sessions/${id}`);
};

// ========== Statistics API ==========

/**
 * Get user's workout statistics
 */
export const getWorkoutStats = async (): Promise<WorkoutStats> => {
  const response = await apiClient.get('/workouts/stats');
  return response.data;
};

/**
 * Get workout history for specific workout
 */
export const getWorkoutHistory = async (
  workoutId: number
): Promise<WorkoutSessionSummary[]> => {
  const response = await apiClient.get(`/workouts/my-workouts/${workoutId}/history`);
  return response.data;
};

// ========== Helper Functions ==========

/**
 * Format workout type for display
 */
export const formatWorkoutType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format muscle group for display
 */
export const formatMuscleGroup = (muscleGroup: string): string => {
  return muscleGroup
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format equipment for display
 */
export const formatEquipment = (equipment: string): string => {
  return equipment
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calculate total workout volume from sets data
 */
export const calculateVolume = (setsData: string): number => {
  try {
    const sets = JSON.parse(setsData);
    return sets.reduce((total: number, set: any) => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      return total + weight * reps;
    }, 0);
  } catch {
    return 0;
  }
};

/**
 * Format duration in minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Format volume (kg)
 */
export const formatVolume = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg.toFixed(0)}kg`;
};

export default {
  // Exercises
  getExercises,
  getExerciseById,
  searchExercises,

  // Templates
  getWorkoutTemplates,
  getTemplateById,
  getFeaturedTemplates,

  // User Workouts
  getMyWorkouts,
  getMyWorkoutById,
  createWorkout,
  createWorkoutFromTemplate,
  updateWorkout,
  deleteWorkout,
  toggleFavorite,

  // Sessions
  getWorkoutSessions,
  getSessionById,
  createSession,
  updateSession,
  completeSession,
  deleteSession,

  // Stats
  getWorkoutStats,
  getWorkoutHistory,

  // Helpers
  formatWorkoutType,
  formatMuscleGroup,
  formatEquipment,
  calculateVolume,
  formatDuration,
  formatVolume,
};
