/**
 * Exercise Store - Zustand State Management for Discover & Train
 *
 * Manages:
 * - Discover sections and search
 * - User's saved exercises (Train)
 * - Custom user exercises
 * - Exercise history
 * - Filter state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as exerciseService from '../services/exerciseService';
import type {
  ExerciseSummary,
  ExerciseDetailResponse,
  DiscoverSections,
  TrainOverview,
  ExerciseFilters,
  UserExerciseResponse,
  UserExerciseCreate,
  UserExerciseUpdate,
  ExerciseHistoryResponse,
  ExerciseHistoryCreate,
  SavedExerciseResponse,
  MuscleGroup,
  BodyPart,
  Equipment,
  ExerciseCategory,
  PainFocus,
  ExerciseGender,
  DifficultyLevel,
} from '../types/exercise.types';

// ============================================================================
// STORE TYPES
// ============================================================================

interface ExerciseState {
  // ========== DISCOVER STATE ==========
  discoverSections: DiscoverSections | null;
  discoverLoading: boolean;
  discoverError: string | null;

  // Search
  searchQuery: string;
  searchResults: ExerciseSummary[];
  searchLoading: boolean;
  searchPage: number;
  searchTotalPages: number;

  // Active filters
  filters: ExerciseFilters;

  // Filter results (by muscle, body part, etc.)
  filteredExercises: ExerciseSummary[];
  filterLoading: boolean;
  filterPage: number;
  filterTotalPages: number;

  // ========== TRAIN STATE ==========
  trainOverview: TrainOverview | null;
  trainLoading: boolean;
  trainError: string | null;

  // Saved exercises
  savedExercises: SavedExerciseResponse[];
  savedExerciseIds: Set<number>; // Quick lookup

  // Custom exercises
  customExercises: UserExerciseResponse[];

  // History
  recentHistory: ExerciseHistoryResponse[];

  // ========== EXERCISE DETAIL ==========
  currentExercise: ExerciseDetailResponse | null;
  detailLoading: boolean;
  detailError: string | null;

  // ========== USER PREFERENCES ==========
  preferredGender: ExerciseGender;
  preferredLanguage: 'en' | 'de';

  // ========== DISCOVER ACTIONS ==========
  fetchDiscoverSections: () => Promise<void>;
  search: (query: string) => Promise<void>;
  searchMore: () => Promise<void>;
  clearSearch: () => void;

  // Filter actions
  setFilter: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  clearFilters: () => void;
  applyFilters: () => Promise<void>;
  fetchByMuscle: (muscle: MuscleGroup) => Promise<void>;
  fetchByBodyPart: (bodyPart: BodyPart) => Promise<void>;
  fetchByEquipment: (equipment: Equipment) => Promise<void>;
  fetchByCategory: (category: ExerciseCategory) => Promise<void>;
  fetchRehab: (painFocus: PainFocus) => Promise<void>;
  loadMoreFiltered: () => Promise<void>;

  // ========== TRAIN ACTIONS ==========
  fetchTrainOverview: () => Promise<void>;
  refreshSavedExercises: () => Promise<void>;
  saveExercise: (exerciseId: number, notes?: string) => Promise<void>;
  unsaveExercise: (exerciseId: number) => Promise<void>;
  toggleSave: (exerciseId: number) => Promise<boolean>;
  isExerciseSaved: (exerciseId: number) => boolean;

  // Custom exercises
  fetchCustomExercises: () => Promise<void>;
  createCustomExercise: (exercise: UserExerciseCreate) => Promise<UserExerciseResponse>;
  updateCustomExercise: (id: number, updates: UserExerciseUpdate) => Promise<void>;
  deleteCustomExercise: (id: number) => Promise<void>;

  // History
  fetchHistory: () => Promise<void>;
  logHistory: (history: ExerciseHistoryCreate) => Promise<ExerciseHistoryResponse>;

  // ========== EXERCISE DETAIL ACTIONS ==========
  fetchExerciseById: (id: number) => Promise<void>;
  fetchExerciseBySlug: (slug: string) => Promise<void>;
  clearCurrentExercise: () => void;

  // ========== PREFERENCES ==========
  setPreferredGender: (gender: ExerciseGender) => void;
  setPreferredLanguage: (language: 'en' | 'de') => void;

  // ========== UTILITY ==========
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialFilters: ExerciseFilters = {
  page: 1,
  page_size: 20,
};

const initialState = {
  // Discover
  discoverSections: null,
  discoverLoading: false,
  discoverError: null,

  // Search
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchPage: 1,
  searchTotalPages: 0,

  // Filters
  filters: initialFilters,
  filteredExercises: [],
  filterLoading: false,
  filterPage: 1,
  filterTotalPages: 0,

  // Train
  trainOverview: null,
  trainLoading: false,
  trainError: null,
  savedExercises: [],
  savedExerciseIds: new Set<number>(),
  customExercises: [],
  recentHistory: [],

  // Detail
  currentExercise: null,
  detailLoading: false,
  detailError: null,

  // Preferences
  preferredGender: ExerciseGender.UNISEX,
  preferredLanguage: 'en' as const,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // DISCOVER ACTIONS
      // ========================================================================

      fetchDiscoverSections: async () => {
        const { preferredGender, preferredLanguage } = get();
        set({ discoverLoading: true, discoverError: null });

        try {
          const sections = await exerciseService.getDiscoverSections(
            preferredGender,
            preferredLanguage
          );
          set({ discoverSections: sections, discoverLoading: false });
        } catch (error: any) {
          set({
            discoverError: error.message || 'Failed to load discover sections',
            discoverLoading: false,
          });
        }
      },

      search: async (query: string) => {
        set({ searchQuery: query, searchLoading: true, searchPage: 1 });

        if (!query.trim()) {
          set({ searchResults: [], searchLoading: false, searchTotalPages: 0 });
          return;
        }

        try {
          const { filters } = get();
          const response = await exerciseService.searchExercises(query, {
            ...filters,
            page: 1,
          });
          set({
            searchResults: response.exercises,
            searchTotalPages: response.total_pages,
            searchLoading: false,
          });
        } catch (error: any) {
          set({ searchLoading: false });
          console.error('Search error:', error);
        }
      },

      searchMore: async () => {
        const { searchQuery, searchPage, searchTotalPages, searchResults, searchLoading, filters } = get();

        if (searchLoading || searchPage >= searchTotalPages) return;

        set({ searchLoading: true });

        try {
          const nextPage = searchPage + 1;
          const response = await exerciseService.searchExercises(searchQuery, {
            ...filters,
            page: nextPage,
          });
          set({
            searchResults: [...searchResults, ...response.exercises],
            searchPage: nextPage,
            searchLoading: false,
          });
        } catch (error: any) {
          set({ searchLoading: false });
        }
      },

      clearSearch: () => {
        set({
          searchQuery: '',
          searchResults: [],
          searchPage: 1,
          searchTotalPages: 0,
        });
      },

      // ========================================================================
      // FILTER ACTIONS
      // ========================================================================

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: 1 },
        }));
      },

      clearFilters: () => {
        set({
          filters: initialFilters,
          filteredExercises: [],
          filterPage: 1,
          filterTotalPages: 0,
        });
      },

      applyFilters: async () => {
        const { filters, searchQuery } = get();
        set({ filterLoading: true });

        try {
          const response = await exerciseService.searchExercises(searchQuery || '', filters);
          set({
            filteredExercises: response.exercises,
            filterPage: response.page,
            filterTotalPages: response.total_pages,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      fetchByMuscle: async (muscle: MuscleGroup) => {
        set({ filterLoading: true, filters: { ...get().filters, muscle_group: muscle } });

        try {
          const response = await exerciseService.getExercisesByMuscle(muscle, 1, 20);
          set({
            filteredExercises: response.exercises,
            filterPage: 1,
            filterTotalPages: response.total_pages,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      fetchByBodyPart: async (bodyPart: BodyPart) => {
        set({ filterLoading: true, filters: { ...get().filters, body_part: bodyPart } });

        try {
          const response = await exerciseService.getExercisesByBodyPart(bodyPart, 1, 20);
          set({
            filteredExercises: response.exercises,
            filterPage: 1,
            filterTotalPages: response.total_pages,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      fetchByEquipment: async (equipment: Equipment) => {
        set({ filterLoading: true, filters: { ...get().filters, equipment } });

        try {
          const response = await exerciseService.getExercisesByEquipment(equipment, 1, 20);
          set({
            filteredExercises: response.exercises,
            filterPage: 1,
            filterTotalPages: response.total_pages,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      fetchByCategory: async (category: ExerciseCategory) => {
        set({ filterLoading: true, filters: { ...get().filters, category } });

        try {
          const response = await exerciseService.getExercisesByCategory(category, 1, 20);
          set({
            filteredExercises: response.exercises,
            filterPage: 1,
            filterTotalPages: response.total_pages,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      fetchRehab: async (painFocus: PainFocus) => {
        set({ filterLoading: true, filters: { ...get().filters, pain_focus: painFocus, is_rehab: true } });

        try {
          const response = await exerciseService.getRehabExercises(painFocus, {
            page: 1,
            page_size: 20,
          });
          set({
            filteredExercises: response.exercises,
            filterPage: 1,
            filterTotalPages: response.total_pages,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      loadMoreFiltered: async () => {
        const { filters, filterPage, filterTotalPages, filteredExercises, filterLoading, searchQuery } = get();

        if (filterLoading || filterPage >= filterTotalPages) return;

        set({ filterLoading: true });

        try {
          const nextPage = filterPage + 1;
          const response = await exerciseService.searchExercises(searchQuery || '', {
            ...filters,
            page: nextPage,
          });
          set({
            filteredExercises: [...filteredExercises, ...response.exercises],
            filterPage: nextPage,
            filterLoading: false,
          });
        } catch (error: any) {
          set({ filterLoading: false });
        }
      },

      // ========================================================================
      // TRAIN ACTIONS
      // ========================================================================

      fetchTrainOverview: async () => {
        set({ trainLoading: true, trainError: null });

        try {
          const overview = await exerciseService.getTrainOverview();
          const savedIds = new Set(overview.saved_exercises.map((e) => e.id));

          set({
            trainOverview: overview,
            savedExercises: overview.saved_exercises.map((e) => ({
              exercise: e,
              saved_at: new Date().toISOString(),
              notes: null,
            })),
            savedExerciseIds: savedIds,
            customExercises: overview.custom_exercises,
            recentHistory: overview.recent_exercises,
            trainLoading: false,
          });
        } catch (error: any) {
          set({
            trainError: error.message || 'Failed to load train overview',
            trainLoading: false,
          });
        }
      },

      refreshSavedExercises: async () => {
        try {
          const saved = await exerciseService.getSavedExercises();
          const savedIds = new Set(saved.map((s) => s.exercise.id));

          set({
            savedExercises: saved,
            savedExerciseIds: savedIds,
          });
        } catch (error: any) {
          console.error('Failed to refresh saved exercises:', error);
        }
      },

      saveExercise: async (exerciseId: number, notes?: string) => {
        try {
          await exerciseService.saveExercise(exerciseId, notes);

          set((state) => {
            const newIds = new Set(state.savedExerciseIds);
            newIds.add(exerciseId);
            return { savedExerciseIds: newIds };
          });

          // Refresh to get full data
          get().refreshSavedExercises();
        } catch (error: any) {
          console.error('Failed to save exercise:', error);
          throw error;
        }
      },

      unsaveExercise: async (exerciseId: number) => {
        try {
          await exerciseService.unsaveExercise(exerciseId);

          set((state) => {
            const newIds = new Set(state.savedExerciseIds);
            newIds.delete(exerciseId);
            return {
              savedExerciseIds: newIds,
              savedExercises: state.savedExercises.filter((s) => s.exercise.id !== exerciseId),
            };
          });
        } catch (error: any) {
          console.error('Failed to unsave exercise:', error);
          throw error;
        }
      },

      toggleSave: async (exerciseId: number) => {
        const isSaved = get().savedExerciseIds.has(exerciseId);

        if (isSaved) {
          await get().unsaveExercise(exerciseId);
          return false;
        } else {
          await get().saveExercise(exerciseId);
          return true;
        }
      },

      isExerciseSaved: (exerciseId: number) => {
        return get().savedExerciseIds.has(exerciseId);
      },

      // ========================================================================
      // CUSTOM EXERCISE ACTIONS
      // ========================================================================

      fetchCustomExercises: async () => {
        try {
          const custom = await exerciseService.getCustomExercises();
          set({ customExercises: custom });
        } catch (error: any) {
          console.error('Failed to fetch custom exercises:', error);
        }
      },

      createCustomExercise: async (exercise: UserExerciseCreate) => {
        const created = await exerciseService.createCustomExercise(exercise);
        set((state) => ({
          customExercises: [...state.customExercises, created],
        }));
        return created;
      },

      updateCustomExercise: async (id: number, updates: UserExerciseUpdate) => {
        const updated = await exerciseService.updateCustomExercise(id, updates);
        set((state) => ({
          customExercises: state.customExercises.map((e) =>
            e.id === id ? updated : e
          ),
        }));
      },

      deleteCustomExercise: async (id: number) => {
        await exerciseService.deleteCustomExercise(id);
        set((state) => ({
          customExercises: state.customExercises.filter((e) => e.id !== id),
        }));
      },

      // ========================================================================
      // HISTORY ACTIONS
      // ========================================================================

      fetchHistory: async () => {
        try {
          const history = await exerciseService.getExerciseHistory(1, 50);
          set({ recentHistory: history });
        } catch (error: any) {
          console.error('Failed to fetch history:', error);
        }
      },

      logHistory: async (history: ExerciseHistoryCreate) => {
        const created = await exerciseService.logExerciseHistory(history);
        set((state) => ({
          recentHistory: [created, ...state.recentHistory.slice(0, 49)],
        }));
        return created;
      },

      // ========================================================================
      // EXERCISE DETAIL ACTIONS
      // ========================================================================

      fetchExerciseById: async (id: number) => {
        const { preferredGender, preferredLanguage } = get();
        set({ detailLoading: true, detailError: null });

        try {
          const exercise = await exerciseService.getExerciseById(
            id,
            preferredGender,
            preferredLanguage
          );
          set({ currentExercise: exercise, detailLoading: false });
        } catch (error: any) {
          set({
            detailError: error.message || 'Failed to load exercise',
            detailLoading: false,
          });
        }
      },

      fetchExerciseBySlug: async (slug: string) => {
        const { preferredGender, preferredLanguage } = get();
        set({ detailLoading: true, detailError: null });

        try {
          const exercise = await exerciseService.getExerciseBySlug(
            slug,
            preferredGender,
            preferredLanguage
          );
          set({ currentExercise: exercise, detailLoading: false });
        } catch (error: any) {
          set({
            detailError: error.message || 'Failed to load exercise',
            detailLoading: false,
          });
        }
      },

      clearCurrentExercise: () => {
        set({ currentExercise: null, detailError: null });
      },

      // ========================================================================
      // PREFERENCES
      // ========================================================================

      setPreferredGender: (gender: ExerciseGender) => {
        set({ preferredGender: gender });
        // Refresh discover with new preference
        get().fetchDiscoverSections();
      },

      setPreferredLanguage: (language: 'en' | 'de') => {
        set({ preferredLanguage: language });
      },

      // ========================================================================
      // UTILITY
      // ========================================================================

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'hyperfit-exercise-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        savedExerciseIds: Array.from(state.savedExerciseIds),
        preferredGender: state.preferredGender,
        preferredLanguage: state.preferredLanguage,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert saved IDs array back to Set after rehydration
        if (state && Array.isArray(state.savedExerciseIds)) {
          state.savedExerciseIds = new Set(state.savedExerciseIds as unknown as number[]);
        }
      },
    }
  )
);

export default useExerciseStore;
