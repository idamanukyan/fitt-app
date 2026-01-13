/**
 * Meal Plan Service
 *
 * Handles AI-generated meal plans, weekly schedules,
 * and grocery list management.
 */

import api from './api';

// =============================================================================
// TYPES
// =============================================================================

export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'low_carb'
  | 'high_protein'
  | 'gluten_free'
  | 'dairy_free';

export type MealPlanStatus = 'draft' | 'active' | 'completed' | 'archived';

export type MealType =
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'afternoon_snack'
  | 'dinner'
  | 'evening_snack';

export interface MealPlanMeal {
  id: number;
  day_id: number;
  meal_type: MealType;
  meal_order: number;
  name: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servings: number;
  serving_size?: string;
  is_completed: boolean;
  is_skipped: boolean;
  food_item_id?: number;
  created_at: string;
  updated_at: string;
}

export interface MealPlanDay {
  id: number;
  meal_plan_id: number;
  day_number: number;
  day_date: string;
  day_name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: MealPlanMeal[];
  notes?: string;
  created_at: string;
}

export interface MealPlan {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: MealPlanStatus;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  dietary_preference: DietaryPreference;
  allergies?: string;
  excluded_foods?: string;
  meals_per_day: number;
  include_snacks: boolean;
  ai_provider?: string;
  ai_model?: string;
  days: MealPlanDay[];
  created_at: string;
  updated_at: string;
}

export interface MealPlanSummary {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: MealPlanStatus;
  target_calories: number;
  dietary_preference: DietaryPreference;
  days_count: number;
  total_meals: number;
  avg_daily_calories: number;
}

export interface GroceryItem {
  id: number;
  grocery_list_id: number;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  is_purchased: boolean;
  notes?: string;
  created_at: string;
}

export interface GroceryList {
  id: number;
  meal_plan_id: number;
  name: string;
  is_completed: boolean;
  items: GroceryItem[];
  items_by_category: Record<string, GroceryItem[]>;
  total_items: number;
  purchased_items: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateMealPlanRequest {
  name?: string;
  start_date: string;
  days: number;
  target_calories: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  dietary_preference: DietaryPreference;
  allergies?: string[];
  excluded_foods?: string[];
  preferred_foods?: string[];
  meals_per_day: number;
  include_snacks: boolean;
  quick_meals_only?: boolean;
  budget_friendly?: boolean;
  meal_prep_friendly?: boolean;
}

export interface GeneratedMealPlanResponse {
  meal_plan: MealPlan;
  ai_provider: string;
  ai_model: string;
  generation_time_ms: number;
  grocery_list?: GroceryList;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get meal type display name
 */
export function getMealTypeDisplay(mealType: MealType): string {
  const displays: Record<MealType, string> = {
    breakfast: 'Breakfast',
    morning_snack: 'Morning Snack',
    lunch: 'Lunch',
    afternoon_snack: 'Afternoon Snack',
    dinner: 'Dinner',
    evening_snack: 'Evening Snack',
  };
  return displays[mealType] || mealType;
}

/**
 * Get dietary preference display name
 */
export function getDietaryPreferenceDisplay(pref: DietaryPreference): string {
  const displays: Record<DietaryPreference, string> = {
    none: 'No Restrictions',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian',
    keto: 'Keto',
    paleo: 'Paleo',
    mediterranean: 'Mediterranean',
    low_carb: 'Low Carb',
    high_protein: 'High Protein',
    gluten_free: 'Gluten Free',
    dairy_free: 'Dairy Free',
  };
  return displays[pref] || pref;
}

/**
 * Get meal type icon
 */
export function getMealTypeIcon(mealType: MealType): string {
  const icons: Record<MealType, string> = {
    breakfast: '🌅',
    morning_snack: '🍎',
    lunch: '☀️',
    afternoon_snack: '🥜',
    dinner: '🌙',
    evening_snack: '🍵',
  };
  return icons[mealType] || '🍽️';
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

export const mealPlanService = {
  /**
   * Generate a new AI meal plan
   */
  async generateMealPlan(
    request: GenerateMealPlanRequest
  ): Promise<GeneratedMealPlanResponse> {
    const response = await api.post<GeneratedMealPlanResponse>(
      '/api/meal-plans/generate',
      request
    );
    return response.data;
  },

  /**
   * Get all meal plans for the current user
   */
  async getMealPlans(
    status?: MealPlanStatus,
    skip = 0,
    limit = 10
  ): Promise<{ meal_plans: MealPlanSummary[]; total: number }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('skip', String(skip));
    params.append('limit', String(limit));

    const response = await api.get<{ meal_plans: MealPlanSummary[]; total: number }>(
      `/api/meal-plans?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get the currently active meal plan
   */
  async getActiveMealPlan(): Promise<MealPlan | null> {
    try {
      const response = await api.get<MealPlan | null>('/api/meal-plans/active');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get a specific meal plan with all details
   */
  async getMealPlan(mealPlanId: number): Promise<MealPlan> {
    const response = await api.get<MealPlan>(`/api/meal-plans/${mealPlanId}`);
    return response.data;
  },

  /**
   * Update a meal plan
   */
  async updateMealPlan(
    mealPlanId: number,
    updates: Partial<{
      name: string;
      description: string;
      status: MealPlanStatus;
      target_calories: number;
      target_protein: number;
      target_carbs: number;
      target_fat: number;
    }>
  ): Promise<MealPlan> {
    const response = await api.put<MealPlan>(`/api/meal-plans/${mealPlanId}`, updates);
    return response.data;
  },

  /**
   * Activate a meal plan
   */
  async activateMealPlan(mealPlanId: number): Promise<MealPlan> {
    const response = await api.post<MealPlan>(`/api/meal-plans/${mealPlanId}/activate`);
    return response.data;
  },

  /**
   * Delete a meal plan
   */
  async deleteMealPlan(mealPlanId: number): Promise<void> {
    await api.delete(`/api/meal-plans/${mealPlanId}`);
  },

  /**
   * Update a specific meal
   */
  async updateMeal(
    mealId: number,
    updates: Partial<{
      name: string;
      description: string;
      ingredients: string;
      instructions: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      is_completed: boolean;
      is_skipped: boolean;
    }>
  ): Promise<MealPlanMeal> {
    const response = await api.put<MealPlanMeal>(`/api/meal-plans/meals/${mealId}`, updates);
    return response.data;
  },

  /**
   * Mark a meal as completed
   */
  async completeMeal(mealId: number): Promise<MealPlanMeal> {
    const response = await api.post<MealPlanMeal>(`/api/meal-plans/meals/${mealId}/complete`);
    return response.data;
  },

  /**
   * Skip a meal
   */
  async skipMeal(mealId: number): Promise<MealPlanMeal> {
    const response = await api.post<MealPlanMeal>(`/api/meal-plans/meals/${mealId}/skip`);
    return response.data;
  },

  /**
   * Get grocery list for a meal plan
   */
  async getGroceryList(mealPlanId: number): Promise<GroceryList> {
    const response = await api.get<GroceryList>(`/api/meal-plans/${mealPlanId}/grocery-list`);
    return response.data;
  },

  /**
   * Toggle grocery item purchased status
   */
  async toggleGroceryItem(
    itemId: number,
    isPurchased: boolean
  ): Promise<{ id: number; name: string; is_purchased: boolean }> {
    const response = await api.put<{ id: number; name: string; is_purchased: boolean }>(
      `/api/meal-plans/grocery-items/${itemId}?is_purchased=${isPurchased}`
    );
    return response.data;
  },

  // ========================================
  // LOCAL HELPERS
  // ========================================

  /**
   * Get meals for a specific day from a meal plan
   */
  getMealsForDay(mealPlan: MealPlan, dayNumber: number): MealPlanMeal[] {
    const day = mealPlan.days.find((d) => d.day_number === dayNumber);
    return day?.meals || [];
  },

  /**
   * Get today's meals from an active meal plan
   */
  getTodaysMeals(mealPlan: MealPlan): MealPlanMeal[] {
    const today = new Date().toISOString().split('T')[0];
    const day = mealPlan.days.find((d) => d.day_date === today);
    return day?.meals || [];
  },

  /**
   * Calculate meal plan progress
   */
  calculateProgress(mealPlan: MealPlan): {
    totalMeals: number;
    completedMeals: number;
    skippedMeals: number;
    progressPercent: number;
  } {
    let totalMeals = 0;
    let completedMeals = 0;
    let skippedMeals = 0;

    for (const day of mealPlan.days) {
      for (const meal of day.meals) {
        totalMeals++;
        if (meal.is_completed) completedMeals++;
        if (meal.is_skipped) skippedMeals++;
      }
    }

    const progressPercent =
      totalMeals > 0 ? Math.round(((completedMeals + skippedMeals) / totalMeals) * 100) : 0;

    return { totalMeals, completedMeals, skippedMeals, progressPercent };
  },

  /**
   * Get grocery list progress
   */
  calculateGroceryProgress(groceryList: GroceryList): {
    totalItems: number;
    purchasedItems: number;
    progressPercent: number;
  } {
    const totalItems = groceryList.items.length;
    const purchasedItems = groceryList.items.filter((i) => i.is_purchased).length;
    const progressPercent = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

    return { totalItems, purchasedItems, progressPercent };
  },
};

export default mealPlanService;
