/**
 * Nutrition tracking service
 */
import apiClient from './api';
import {
  FoodItem,
  FoodItemCreate,
  FoodSearchQuery,
  FoodSearchResponse,
  Meal,
  MealCreate,
  MealUpdate,
  MealFoodCreate,
  MealFood,
  WaterLog,
  WaterLogCreate,
  WaterLogUpdate,
  NutritionGoal,
  NutritionGoalCreate,
  NutritionGoalUpdate,
  DailyNutritionSummary,
} from '../types/nutrition.types';

const NUTRITION_BASE = '/api/nutrition';

// ---------------------------
// Food Items
// ---------------------------

export const createFoodItem = async (foodData: FoodItemCreate): Promise<FoodItem> => {
  const response = await apiClient.post(`${NUTRITION_BASE}/foods`, foodData);
  return response.data;
};

export const getFoodItems = async (skip = 0, limit = 100): Promise<FoodItem[]> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/foods`, {
    params: { skip, limit },
  });
  return response.data;
};

export const searchFoodItems = async (
  query: string,
  category?: string,
  limit = 20
): Promise<FoodSearchResponse> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/foods/search`, {
    params: { query, category, limit },
  });
  return response.data;
};

export const getFoodByBarcode = async (barcode: string): Promise<FoodItem> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/foods/barcode/${barcode}`);
  return response.data;
};

export const getFoodItem = async (foodId: number): Promise<FoodItem> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/foods/${foodId}`);
  return response.data;
};

export const deleteFoodItem = async (foodId: number): Promise<void> => {
  await apiClient.delete(`${NUTRITION_BASE}/foods/${foodId}`);
};

// ---------------------------
// Meals
// ---------------------------

export const createMeal = async (mealData: MealCreate): Promise<Meal> => {
  const response = await apiClient.post(`${NUTRITION_BASE}/meals`, mealData);
  return response.data;
};

export const getUserMeals = async (
  startDate?: string,
  endDate?: string
): Promise<Meal[]> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/meals`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getMealsByDate = async (date: string): Promise<Meal[]> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/meals/date/${date}`);
  return response.data;
};

export const getMeal = async (mealId: number): Promise<Meal> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/meals/${mealId}`);
  return response.data;
};

export const updateMeal = async (
  mealId: number,
  mealData: MealUpdate
): Promise<Meal> => {
  const response = await apiClient.put(`${NUTRITION_BASE}/meals/${mealId}`, mealData);
  return response.data;
};

export const deleteMeal = async (mealId: number): Promise<void> => {
  await apiClient.delete(`${NUTRITION_BASE}/meals/${mealId}`);
};

// ---------------------------
// Meal Foods
// ---------------------------

export const addFoodToMeal = async (
  mealId: number,
  foodData: MealFoodCreate
): Promise<MealFood> => {
  const response = await apiClient.post(
    `${NUTRITION_BASE}/meals/${mealId}/foods`,
    foodData
  );
  return response.data;
};

export const removeFoodFromMeal = async (mealFoodId: number): Promise<void> => {
  await apiClient.delete(`${NUTRITION_BASE}/meal-foods/${mealFoodId}`);
};

// ---------------------------
// Water Logs
// ---------------------------

export const logWater = async (waterData: WaterLogCreate): Promise<WaterLog> => {
  const response = await apiClient.post(`${NUTRITION_BASE}/water`, waterData);
  return response.data;
};

export const getWaterLog = async (date: string): Promise<WaterLog> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/water/date/${date}`);
  return response.data;
};

export const updateWaterLog = async (
  date: string,
  waterData: WaterLogUpdate
): Promise<WaterLog> => {
  const response = await apiClient.put(
    `${NUTRITION_BASE}/water/date/${date}`,
    waterData
  );
  return response.data;
};

// ---------------------------
// Nutrition Goals
// ---------------------------

export const createOrUpdateNutritionGoal = async (
  goalData: NutritionGoalCreate
): Promise<NutritionGoal> => {
  const response = await apiClient.post(`${NUTRITION_BASE}/goals`, goalData);
  return response.data;
};

export const getNutritionGoal = async (): Promise<NutritionGoal> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/goals`);
  return response.data;
};

export const updateNutritionGoal = async (
  goalData: NutritionGoalUpdate
): Promise<NutritionGoal> => {
  const response = await apiClient.put(`${NUTRITION_BASE}/goals`, goalData);
  return response.data;
};

// ---------------------------
// Daily Summary
// ---------------------------

export const getDailySummary = async (date: string): Promise<DailyNutritionSummary> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/summary/${date}`);
  return response.data;
};

export const getTodaySummary = async (): Promise<DailyNutritionSummary> => {
  const response = await apiClient.get(`${NUTRITION_BASE}/summary`);
  return response.data;
};

// ---------------------------
// Helper Functions
// ---------------------------

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const calculateMacroPercentages = (
  protein: number,
  carbs: number,
  fat: number
): { protein: number; carbs: number; fat: number } => {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals;

  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbsCals / totalCals) * 100),
    fat: Math.round((fatCals / totalCals) * 100),
  };
};

export const waterCupsFromMl = (ml: number): number => {
  return Math.floor(ml / 250); // 250ml = 1 cup
};

export const mlFromWaterCups = (cups: number): number => {
  return cups * 250;
};
