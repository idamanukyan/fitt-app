/**
 * Type definitions for Nutrition Tracking API
 */

// Enums
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

// Food Item Types
export interface FoodItem {
  id: number;
  name: string;
  brand: string | null;
  barcode: string | null;
  category: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  saturated_fat: number | null;
  trans_fat: number | null;
  description: string | null;
  is_verified: number;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface FoodItemCreate {
  name: string;
  brand?: string;
  barcode?: string;
  category?: string;
  serving_size: number;
  serving_unit?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturated_fat?: number;
  trans_fat?: number;
  description?: string;
}

export interface FoodSearchQuery {
  query: string;
  category?: string;
  limit?: number;
}

export interface FoodSearchResponse {
  results: FoodItem[];
  total: number;
}

// Meal Food Types
export interface MealFood {
  id: number;
  meal_id: number;
  food_id: number;
  serving_amount: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number | null;
  created_at: string;
  food_item: FoodItem;
}

export interface MealFoodCreate {
  food_id: number;
  serving_amount: number;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  total_fiber?: number;
}

// Meal Types
export interface Meal {
  id: number;
  user_id: number;
  meal_type: MealType;
  name: string | null;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  meal_foods: MealFood[];
}

export interface MealCreate {
  meal_type: MealType;
  name?: string;
  date: string;
  notes?: string;
  foods?: MealFoodCreate[];
}

export interface MealUpdate {
  meal_type?: MealType;
  name?: string;
  notes?: string;
}

export interface MealWithTotals extends Meal {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
}

// Water Log Types
export interface WaterLog {
  id: number;
  user_id: number;
  date: string;
  amount_ml: number;
  created_at: string;
  updated_at: string;
}

export interface WaterLogCreate {
  amount_ml: number;
  date?: string;
}

export interface WaterLogUpdate {
  amount_ml: number;
}

// Nutrition Goal Types
export interface NutritionGoal {
  id: number;
  user_id: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  water_ml: number;
  created_at: string;
  updated_at: string;
}

export interface NutritionGoalCreate {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water_ml?: number;
}

export interface NutritionGoalUpdate {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water_ml?: number;
}

// Daily Summary Types
export interface MacroBreakdown {
  current: number;
  goal: number;
  percentage: number;
  remaining: number;
}

export interface DailyNutritionSummary {
  date: string;
  calories: MacroBreakdown;
  protein: MacroBreakdown;
  carbs: MacroBreakdown;
  fat: MacroBreakdown;
  fiber: MacroBreakdown;
  water: MacroBreakdown;
  meals: MealWithTotals[];
  total_meals: number;
}

// UI Helper Types
export interface MealTypeOption {
  value: MealType;
  label: string;
  icon: string;
}

export const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  { value: MealType.BREAKFAST, label: 'Breakfast', icon: '🌅' },
  { value: MealType.LUNCH, label: 'Lunch', icon: '☀️' },
  { value: MealType.DINNER, label: 'Dinner', icon: '🌙' },
  { value: MealType.SNACK, label: 'Snack', icon: '🍎' },
];

export interface MacroColor {
  protein: string;
  carbs: string;
  fat: string;
}

export const MACRO_COLORS: MacroColor = {
  protein: '#00E5FF',
  carbs: '#00FF94',
  fat: '#FF5252',
};
