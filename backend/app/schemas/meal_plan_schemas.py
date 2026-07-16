"""
Meal Plan Schemas

Pydantic schemas for meal plan API requests and responses.
"""
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field

# ---------------------------
# Enums
# ---------------------------

class DietaryPreferenceEnum(str, Enum):
    """Dietary preference options"""
    NONE = "none"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"
    KETO = "keto"
    PALEO = "paleo"
    MEDITERRANEAN = "mediterranean"
    LOW_CARB = "low_carb"
    HIGH_PROTEIN = "high_protein"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"


class MealPlanStatusEnum(str, Enum):
    """Meal plan status"""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class MealTypeEnum(str, Enum):
    """Meal type within a day"""
    BREAKFAST = "breakfast"
    MORNING_SNACK = "morning_snack"
    LUNCH = "lunch"
    AFTERNOON_SNACK = "afternoon_snack"
    DINNER = "dinner"
    EVENING_SNACK = "evening_snack"


# ---------------------------
# Meal Plan Generation Request
# ---------------------------

class GenerateMealPlanRequest(BaseModel):
    """Request to generate a new AI meal plan"""
    name: str | None = Field(None, max_length=100)
    start_date: date
    days: int = Field(7, ge=1, le=14)  # 1-14 days

    # Nutrition Targets
    target_calories: float = Field(2000.0, ge=1000, le=5000)
    target_protein: float | None = Field(None, ge=0)
    target_carbs: float | None = Field(None, ge=0)
    target_fat: float | None = Field(None, ge=0)

    # Preferences
    dietary_preference: DietaryPreferenceEnum = DietaryPreferenceEnum.NONE
    allergies: list[str] | None = []
    excluded_foods: list[str] | None = []
    preferred_foods: list[str] | None = []
    meals_per_day: int = Field(3, ge=2, le=6)
    include_snacks: bool = True

    # Meal Preferences
    quick_meals_only: bool = False  # Meals under 30 min
    budget_friendly: bool = False
    meal_prep_friendly: bool = False  # Good for batch cooking


# ---------------------------
# Meal Schemas
# ---------------------------

class MealPlanMealBase(BaseModel):
    """Base schema for meal plan meals"""
    meal_type: MealTypeEnum
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    ingredients: str | None = None
    instructions: str | None = None
    prep_time_minutes: int | None = Field(None, ge=0)
    cook_time_minutes: int | None = Field(None, ge=0)
    calories: float = Field(0.0, ge=0)
    protein: float = Field(0.0, ge=0)
    carbs: float = Field(0.0, ge=0)
    fat: float = Field(0.0, ge=0)
    fiber: float | None = Field(0.0, ge=0)
    servings: int = Field(1, ge=1)
    serving_size: str | None = None


class MealPlanMealCreate(MealPlanMealBase):
    """Schema for creating a meal"""
    meal_order: int = Field(0, ge=0)


class MealPlanMealUpdate(BaseModel):
    """Schema for updating a meal"""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    ingredients: str | None = None
    instructions: str | None = None
    prep_time_minutes: int | None = Field(None, ge=0)
    cook_time_minutes: int | None = Field(None, ge=0)
    calories: float | None = Field(None, ge=0)
    protein: float | None = Field(None, ge=0)
    carbs: float | None = Field(None, ge=0)
    fat: float | None = Field(None, ge=0)
    is_completed: bool | None = None
    is_skipped: bool | None = None


class MealPlanMealResponse(MealPlanMealBase):
    """Response schema for meal plan meals"""
    id: int
    day_id: int
    meal_order: int
    is_completed: bool
    is_skipped: bool
    food_item_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------
# Day Schemas
# ---------------------------

class MealPlanDayBase(BaseModel):
    """Base schema for meal plan days"""
    day_number: int = Field(..., ge=1, le=14)
    day_date: date
    day_name: str = Field(..., max_length=20)
    notes: str | None = None


class MealPlanDayCreate(MealPlanDayBase):
    """Schema for creating a day"""
    meals: list[MealPlanMealCreate] = []


class MealPlanDayResponse(MealPlanDayBase):
    """Response schema for meal plan days"""
    id: int
    meal_plan_id: int
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    meals: list[MealPlanMealResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class MealPlanDaySummary(BaseModel):
    """Summary of a meal plan day"""
    id: int
    day_number: int
    day_date: date
    day_name: str
    total_calories: float
    total_protein: float
    meals_count: int
    completed_meals: int


# ---------------------------
# Meal Plan Schemas
# ---------------------------

class MealPlanBase(BaseModel):
    """Base schema for meal plans"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    target_calories: float = Field(2000.0, ge=0)
    target_protein: float = Field(150.0, ge=0)
    target_carbs: float = Field(200.0, ge=0)
    target_fat: float = Field(65.0, ge=0)
    dietary_preference: DietaryPreferenceEnum = DietaryPreferenceEnum.NONE
    meals_per_day: int = Field(3, ge=2, le=6)
    include_snacks: bool = True


class MealPlanCreate(MealPlanBase):
    """Schema for creating a meal plan"""
    start_date: date
    end_date: date
    allergies: str | None = None
    excluded_foods: str | None = None


class MealPlanUpdate(BaseModel):
    """Schema for updating a meal plan"""
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    status: MealPlanStatusEnum | None = None
    target_calories: float | None = Field(None, ge=0)
    target_protein: float | None = Field(None, ge=0)
    target_carbs: float | None = Field(None, ge=0)
    target_fat: float | None = Field(None, ge=0)


class MealPlanResponse(MealPlanBase):
    """Response schema for meal plans"""
    id: int
    user_id: int
    start_date: date
    end_date: date
    status: MealPlanStatusEnum
    allergies: str | None = None
    excluded_foods: str | None = None
    ai_provider: str | None = None
    ai_model: str | None = None
    days: list[MealPlanDayResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MealPlanSummary(BaseModel):
    """Summary of a meal plan"""
    id: int
    name: str
    start_date: date
    end_date: date
    status: MealPlanStatusEnum
    target_calories: float
    dietary_preference: DietaryPreferenceEnum
    days_count: int
    total_meals: int
    avg_daily_calories: float


class MealPlanListResponse(BaseModel):
    """Response for listing meal plans"""
    meal_plans: list[MealPlanSummary]
    total: int


# ---------------------------
# Grocery List Schemas
# ---------------------------

class GroceryItemBase(BaseModel):
    """Base schema for grocery items"""
    name: str = Field(..., min_length=1, max_length=200)
    quantity: float = Field(1.0, ge=0)
    unit: str | None = Field(None, max_length=50)
    category: str | None = Field(None, max_length=50)
    notes: str | None = Field(None, max_length=200)


class GroceryItemCreate(GroceryItemBase):
    """Schema for creating a grocery item"""
    pass


class GroceryItemUpdate(BaseModel):
    """Schema for updating a grocery item"""
    quantity: float | None = Field(None, ge=0)
    is_purchased: bool | None = None
    notes: str | None = Field(None, max_length=200)


class GroceryItemResponse(GroceryItemBase):
    """Response schema for grocery items"""
    id: int
    grocery_list_id: int
    is_purchased: bool
    created_at: datetime

    class Config:
        from_attributes = True


class GroceryListResponse(BaseModel):
    """Response schema for grocery lists"""
    id: int
    meal_plan_id: int
    name: str
    is_completed: bool
    items: list[GroceryItemResponse] = []
    items_by_category: dict = {}  # Grouped by category
    total_items: int
    purchased_items: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------
# AI Generation Response
# ---------------------------

class GeneratedMealPlanResponse(BaseModel):
    """Response for AI-generated meal plan"""
    meal_plan: MealPlanResponse
    ai_provider: str
    ai_model: str
    generation_time_ms: int
    grocery_list: GroceryListResponse | None = None


class RegenerateMealRequest(BaseModel):
    """Request to regenerate a specific meal"""
    meal_id: int
    reason: str | None = None  # Why regenerating (don't like, too complex, etc.)
    preferences: str | None = None  # Additional preferences for new meal
