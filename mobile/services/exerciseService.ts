/**
 * Exercise Service - Backend API Integration for Discover and Train
 * Connects to MuscleWiki-based exercise library backend.
 */

import apiClient from './api';
import type {
  ExerciseSummary,
  ExerciseDetailResponse,
  ExerciseListResponse,
  DiscoverSections,
  TrainOverview,
  ExerciseFilters,
  RehabFilters,
  UserExerciseCreate,
  UserExerciseUpdate,
  UserExerciseResponse,
  ExerciseHistoryCreate,
  ExerciseHistoryResponse,
  SaveExerciseRequest,
  SavedExerciseResponse,
  BulkSaveRequest,
  BulkRemoveRequest,
  MuscleGroup,
  BodyPart,
  Equipment,
  ExerciseCategory,
  PainFocus,
  ExerciseGender,
} from '../types/exercise.types';

// ============================================================================
// DISCOVER - Global Exercise Library (Read-only for users)
// ============================================================================

/**
 * Get curated sections for Discover page
 */
export async function getDiscoverSections(
  gender?: ExerciseGender,
  language: string = 'en'
): Promise<DiscoverSections> {
  const params = new URLSearchParams();
  if (gender) params.append('gender', gender);
  params.append('language', language);

  const response = await apiClient.get<DiscoverSections>(
    `/exercises/discover?${params.toString()}`
  );
  return response.data;
}

/**
 * Search exercises with full-text search
 */
export async function searchExercises(
  query: string,
  filters?: Partial<ExerciseFilters>
): Promise<ExerciseListResponse> {
  const params = new URLSearchParams({ q: query });

  if (filters) {
    if (filters.muscle_group) params.append('muscle_group', filters.muscle_group);
    if (filters.body_part) params.append('body_part', filters.body_part);
    if (filters.equipment) params.append('equipment', filters.equipment);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));
  }

  const response = await apiClient.get<ExerciseListResponse>(
    `/exercises/search?${params.toString()}`
  );
  return response.data;
}

/**
 * Get exercises for pain relief / rehab
 */
export async function getRehabExercises(
  painFocus: PainFocus,
  filters?: Partial<RehabFilters>
): Promise<ExerciseListResponse> {
  const params = new URLSearchParams();
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.equipment) params.append('equipment', filters.equipment);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.page_size) params.append('page_size', String(filters.page_size));

  const response = await apiClient.get<ExerciseListResponse>(
    `/exercises/rehab/${painFocus}?${params.toString()}`
  );
  return response.data;
}

/**
 * Get exercises by muscle group
 */
export async function getExercisesByMuscle(
  muscleGroup: MuscleGroup,
  page: number = 1,
  pageSize: number = 20
): Promise<ExerciseListResponse> {
  const response = await apiClient.get<ExerciseListResponse>(
    `/exercises/by-muscle/${muscleGroup}?page=${page}&page_size=${pageSize}`
  );
  return response.data;
}

/**
 * Get exercises by body part
 */
export async function getExercisesByBodyPart(
  bodyPart: BodyPart,
  page: number = 1,
  pageSize: number = 20
): Promise<ExerciseListResponse> {
  const response = await apiClient.get<ExerciseListResponse>(
    `/exercises/by-body-part/${bodyPart}?page=${page}&page_size=${pageSize}`
  );
  return response.data;
}

/**
 * Get exercises by equipment
 */
export async function getExercisesByEquipment(
  equipment: Equipment,
  page: number = 1,
  pageSize: number = 20
): Promise<ExerciseListResponse> {
  const response = await apiClient.get<ExerciseListResponse>(
    `/exercises/by-equipment/${equipment}?page=${page}&page_size=${pageSize}`
  );
  return response.data;
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(
  category: ExerciseCategory,
  page: number = 1,
  pageSize: number = 20
): Promise<ExerciseListResponse> {
  const response = await apiClient.get<ExerciseListResponse>(
    `/exercises/by-category/${category}?page=${page}&page_size=${pageSize}`
  );
  return response.data;
}

// ============================================================================
// EXERCISE DETAIL
// ============================================================================

/**
 * Get exercise detail by ID
 */
export async function getExerciseById(
  exerciseId: number,
  gender?: ExerciseGender,
  language: string = 'en'
): Promise<ExerciseDetailResponse> {
  const params = new URLSearchParams({ language });
  if (gender) params.append('gender', gender);

  const response = await apiClient.get<ExerciseDetailResponse>(
    `/exercises/${exerciseId}?${params.toString()}`
  );
  return response.data;
}

/**
 * Get exercise detail by slug
 */
export async function getExerciseBySlug(
  slug: string,
  gender?: ExerciseGender,
  language: string = 'en'
): Promise<ExerciseDetailResponse> {
  const params = new URLSearchParams({ language });
  if (gender) params.append('gender', gender);

  const response = await apiClient.get<ExerciseDetailResponse>(
    `/exercises/slug/${slug}?${params.toString()}`
  );
  return response.data;
}

// ============================================================================
// TRAIN - User-Scoped Operations
// ============================================================================

/**
 * Get Train section overview
 */
export async function getTrainOverview(): Promise<TrainOverview> {
  const response = await apiClient.get<TrainOverview>('/exercises/train/overview');
  return response.data;
}

/**
 * Get user's saved exercises
 */
export async function getSavedExercises(
  page: number = 1,
  pageSize: number = 50
): Promise<SavedExerciseResponse[]> {
  const response = await apiClient.get<SavedExerciseResponse[]>(
    `/exercises/train/saved?page=${page}&page_size=${pageSize}`
  );
  return response.data;
}

/**
 * Save exercise to user's library
 */
export async function saveExercise(
  exerciseId: number,
  notes?: string
): Promise<{ message: string }> {
  const request: SaveExerciseRequest = { exercise_id: exerciseId, notes };
  const response = await apiClient.post<{ message: string }>(
    '/exercises/train/save',
    request
  );
  return response.data;
}

/**
 * Remove exercise from user's library
 */
export async function unsaveExercise(
  exerciseId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/exercises/train/save/${exerciseId}`
  );
  return response.data;
}

/**
 * Bulk save exercises
 */
export async function bulkSaveExercises(
  exerciseIds: number[]
): Promise<{ message: string; saved_count: number }> {
  const request: BulkSaveRequest = { exercise_ids: exerciseIds };
  const response = await apiClient.post<{ message: string; saved_count: number }>(
    '/exercises/train/save/bulk',
    request
  );
  return response.data;
}

/**
 * Bulk remove saved exercises
 */
export async function bulkRemoveExercises(
  exerciseIds: number[]
): Promise<{ message: string; removed_count: number }> {
  const request: BulkRemoveRequest = { exercise_ids: exerciseIds };
  const response = await apiClient.delete<{ message: string; removed_count: number }>(
    '/exercises/train/save/bulk',
    { data: request }
  );
  return response.data;
}

// ============================================================================
// CUSTOM EXERCISES - User Created
// ============================================================================

/**
 * Get user's custom exercises
 */
export async function getCustomExercises(): Promise<UserExerciseResponse[]> {
  const response = await apiClient.get<UserExerciseResponse[]>(
    '/exercises/train/custom'
  );
  return response.data;
}

/**
 * Create custom exercise
 */
export async function createCustomExercise(
  exercise: UserExerciseCreate
): Promise<UserExerciseResponse> {
  const response = await apiClient.post<UserExerciseResponse>(
    '/exercises/train/custom',
    exercise
  );
  return response.data;
}

/**
 * Update custom exercise
 */
export async function updateCustomExercise(
  exerciseId: number,
  updates: UserExerciseUpdate
): Promise<UserExerciseResponse> {
  const response = await apiClient.put<UserExerciseResponse>(
    `/exercises/train/custom/${exerciseId}`,
    updates
  );
  return response.data;
}

/**
 * Delete custom exercise
 */
export async function deleteCustomExercise(
  exerciseId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/exercises/train/custom/${exerciseId}`
  );
  return response.data;
}

// ============================================================================
// EXERCISE HISTORY
// ============================================================================

/**
 * Get exercise history
 */
export async function getExerciseHistory(
  page: number = 1,
  pageSize: number = 50
): Promise<ExerciseHistoryResponse[]> {
  const response = await apiClient.get<ExerciseHistoryResponse[]>(
    `/exercises/history?page=${page}&page_size=${pageSize}`
  );
  return response.data;
}

/**
 * Get history for specific exercise
 */
export async function getHistoryForExercise(
  exerciseId: number,
  limit: number = 20
): Promise<ExerciseHistoryResponse[]> {
  const response = await apiClient.get<ExerciseHistoryResponse[]>(
    `/exercises/history/${exerciseId}?limit=${limit}`
  );
  return response.data;
}

/**
 * Log exercise performance
 */
export async function logExerciseHistory(
  history: ExerciseHistoryCreate
): Promise<ExerciseHistoryResponse> {
  const response = await apiClient.post<ExerciseHistoryResponse>(
    '/exercises/history',
    history
  );
  return response.data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if exercise is saved by user
 */
export async function isExerciseSaved(exerciseId: number): Promise<boolean> {
  try {
    const detail = await getExerciseById(exerciseId);
    return detail.is_saved;
  } catch {
    return false;
  }
}

/**
 * Toggle save state for exercise
 */
export async function toggleSaveExercise(
  exerciseId: number,
  currentlySaved: boolean
): Promise<boolean> {
  if (currentlySaved) {
    await unsaveExercise(exerciseId);
    return false;
  } else {
    await saveExercise(exerciseId);
    return true;
  }
}

export default {
  // Discover
  getDiscoverSections,
  searchExercises,
  getRehabExercises,
  getExercisesByMuscle,
  getExercisesByBodyPart,
  getExercisesByEquipment,
  getExercisesByCategory,

  // Detail
  getExerciseById,
  getExerciseBySlug,

  // Train
  getTrainOverview,
  getSavedExercises,
  saveExercise,
  unsaveExercise,
  bulkSaveExercises,
  bulkRemoveExercises,

  // Custom exercises
  getCustomExercises,
  createCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,

  // History
  getExerciseHistory,
  getHistoryForExercise,
  logExerciseHistory,

  // Utilities
  isExerciseSaved,
  toggleSaveExercise,
};
