/**
 * AI Service
 *
 * API service for specialized AI features (workout generation, meal planning, etc.)
 */
import api from './api';
import {
  GenerateWorkoutRequest,
  GenerateWorkoutResponse,
  GenerateMealPlanRequest,
  GenerateMealPlanResponse,
  ExplainExerciseRequest,
  ExplainExerciseResponse,
  GetMotivationRequest,
  GetMotivationResponse,
  AIProviderStatus,
} from '../types/chat';

const AI_BASE_URL = '/api/v6/ai';

export const aiService = {
  /**
   * Get AI provider status
   */
  getStatus: async (): Promise<AIProviderStatus> => {
    const response = await api.get<AIProviderStatus>(`${AI_BASE_URL}/status`);
    return response.data;
  },

  /**
   * Generate a custom workout plan
   */
  generateWorkout: async (
    request: GenerateWorkoutRequest
  ): Promise<GenerateWorkoutResponse> => {
    const response = await api.post<GenerateWorkoutResponse>(
      `${AI_BASE_URL}/workout`,
      request
    );
    return response.data;
  },

  /**
   * Generate a meal plan
   */
  generateMealPlan: async (
    request: GenerateMealPlanRequest
  ): Promise<GenerateMealPlanResponse> => {
    const response = await api.post<GenerateMealPlanResponse>(
      `${AI_BASE_URL}/meal-plan`,
      request
    );
    return response.data;
  },

  /**
   * Get exercise explanation
   */
  explainExercise: async (
    request: ExplainExerciseRequest
  ): Promise<ExplainExerciseResponse> => {
    const response = await api.post<ExplainExerciseResponse>(
      `${AI_BASE_URL}/explain-exercise`,
      request
    );
    return response.data;
  },

  /**
   * Get motivational message
   */
  getMotivation: async (
    request: GetMotivationRequest = {}
  ): Promise<GetMotivationResponse> => {
    const response = await api.post<GetMotivationResponse>(
      `${AI_BASE_URL}/motivation`,
      request
    );
    return response.data;
  },

  // ===== CONVENIENCE METHODS =====

  /**
   * Quick workout generation with common defaults
   */
  quickWorkout: async (
    workoutType: string,
    durationMinutes: number = 30,
    equipment: string[] = []
  ): Promise<GenerateWorkoutResponse> => {
    return aiService.generateWorkout({
      workout_type: workoutType,
      duration_minutes: durationMinutes,
      equipment,
    });
  },

  /**
   * Quick meal plan with common defaults
   */
  quickMealPlan: async (
    targetCalories: number,
    dietaryRestrictions: string[] = []
  ): Promise<GenerateMealPlanResponse> => {
    return aiService.generateMealPlan({
      target_calories: targetCalories,
      meals_per_day: 3,
      dietary_restrictions: dietaryRestrictions,
      dietary_preferences: [],
    });
  },

  /**
   * Quick exercise explanation
   */
  quickExplain: async (exerciseName: string): Promise<ExplainExerciseResponse> => {
    return aiService.explainExercise({
      exercise_name: exerciseName,
    });
  },

  /**
   * Quick motivation
   */
  quickMotivation: async (situation?: string): Promise<GetMotivationResponse> => {
    return aiService.getMotivation({
      situation,
    });
  },
};

export default aiService;
