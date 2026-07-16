from datetime import date, datetime
from datetime import date as DateType
from enum import Enum

from pydantic import BaseModel, Field

# ---------------------------
# Enums
# ---------------------------

class MealTypeEnum(str, Enum):
    """Meal type options"""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


# ---------------------------
# FoodItem Schemas
# ---------------------------

class FoodItemBase(BaseModel):
    """Base schema for food items"""
    name: str = Field(..., min_length=1, max_length=200)
    brand: str | None = Field(None, max_length=100)
    barcode: str | None = Field(None, max_length=50)
    category: str | None = Field(None, max_length=50)
    serving_size: float = Field(..., gt=0)
    serving_unit: str = Field("g", max_length=20)
    calories: float = Field(..., ge=0)
    protein: float = Field(0.0, ge=0)
    carbs: float = Field(0.0, ge=0)
    fat: float = Field(0.0, ge=0)
    fiber: float | None = Field(0.0, ge=0)
    sugar: float | None = Field(0.0, ge=0)
    sodium: float | None = Field(None, ge=0)
    cholesterol: float | None = Field(None, ge=0)
    saturated_fat: float | None = Field(None, ge=0)
    trans_fat: float | None = Field(None, ge=0)
    description: str | None = None


class FoodItemCreate(FoodItemBase):
    """Schema for creating a food item"""
    pass


class FoodItemUpdate(BaseModel):
    """Schema for updating a food item"""
    name: str | None = Field(None, min_length=1, max_length=200)
    brand: str | None = Field(None, max_length=100)
    barcode: str | None = Field(None, max_length=50)
    category: str | None = Field(None, max_length=50)
    serving_size: float | None = Field(None, gt=0)
    serving_unit: str | None = Field(None, max_length=20)
    calories: float | None = Field(None, ge=0)
    protein: float | None = Field(None, ge=0)
    carbs: float | None = Field(None, ge=0)
    fat: float | None = Field(None, ge=0)
    fiber: float | None = Field(None, ge=0)
    sugar: float | None = Field(None, ge=0)
    sodium: float | None = Field(None, ge=0)
    cholesterol: float | None = Field(None, ge=0)
    saturated_fat: float | None = Field(None, ge=0)
    trans_fat: float | None = Field(None, ge=0)
    description: str | None = None


class FoodItemResponse(FoodItemBase):
    """Schema for food item response"""
    id: int
    is_verified: int
    created_by_user_id: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------
# MealFood Schemas
# ---------------------------

class MealFoodBase(BaseModel):
    """Base schema for meal foods"""
    food_id: int = Field(..., gt=0)
    serving_amount: float = Field(1.0, gt=0)


class MealFoodCreate(MealFoodBase):
    """Schema for adding food to a meal"""
    pass


class MealFoodResponse(BaseModel):
    """Schema for meal food response"""
    id: int
    meal_id: int
    food_id: int
    serving_amount: float
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float | None
    created_at: datetime
    food_item: FoodItemResponse

    class Config:
        from_attributes = True


# ---------------------------
# Meal Schemas
# ---------------------------

class MealBase(BaseModel):
    """Base schema for meals"""
    meal_type: MealTypeEnum
    name: str | None = Field(None, max_length=100)
    date: date
    notes: str | None = None


class MealCreate(MealBase):
    """Schema for creating a meal"""
    foods: list[MealFoodCreate] | None = []


class MealUpdate(BaseModel):
    """Schema for updating a meal"""
    meal_type: MealTypeEnum | None = None
    name: str | None = Field(None, max_length=100)
    notes: str | None = None


class MealResponse(MealBase):
    """Schema for meal response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    meal_foods: list[MealFoodResponse] = []

    class Config:
        from_attributes = True


class MealWithTotals(MealResponse):
    """Schema for meal with calculated totals"""
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float


# ---------------------------
# WaterLog Schemas
# ---------------------------

class WaterLogBase(BaseModel):
    """Base schema for water logs"""
    date: date
    amount_ml: float = Field(..., ge=0)


class WaterLogCreate(BaseModel):
    """Schema for creating a water log"""
    amount_ml: float = Field(..., gt=0)
    date: DateType | None = None


class WaterLogUpdate(BaseModel):
    """Schema for updating a water log"""
    amount_ml: float = Field(..., ge=0)


class WaterLogResponse(WaterLogBase):
    """Schema for water log response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------
# NutritionGoal Schemas
# ---------------------------

class NutritionGoalBase(BaseModel):
    """Base schema for nutrition goals"""
    calories: float = Field(2000.0, ge=0)
    protein: float = Field(150.0, ge=0)
    carbs: float = Field(200.0, ge=0)
    fat: float = Field(65.0, ge=0)
    fiber: float | None = Field(25.0, ge=0)
    water_ml: float = Field(2000.0, ge=0)


class NutritionGoalCreate(NutritionGoalBase):
    """Schema for creating nutrition goals"""
    pass


class NutritionGoalUpdate(BaseModel):
    """Schema for updating nutrition goals"""
    calories: float | None = Field(None, ge=0)
    protein: float | None = Field(None, ge=0)
    carbs: float | None = Field(None, ge=0)
    fat: float | None = Field(None, ge=0)
    fiber: float | None = Field(None, ge=0)
    water_ml: float | None = Field(None, ge=0)


class NutritionGoalResponse(NutritionGoalBase):
    """Schema for nutrition goal response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------
# Daily Summary Schemas
# ---------------------------

class MacroBreakdown(BaseModel):
    """Macro nutrient breakdown"""
    current: float
    goal: float
    percentage: float
    remaining: float


class DailyNutritionSummary(BaseModel):
    """Complete daily nutrition summary"""
    date: date
    calories: MacroBreakdown
    protein: MacroBreakdown
    carbs: MacroBreakdown
    fat: MacroBreakdown
    fiber: MacroBreakdown
    water: MacroBreakdown
    meals: list[MealWithTotals]
    total_meals: int

    class Config:
        from_attributes = True


# ---------------------------
# Search and Query Schemas
# ---------------------------

class FoodSearchQuery(BaseModel):
    """Schema for food search"""
    query: str = Field(..., min_length=1)
    category: str | None = None
    limit: int = Field(20, ge=1, le=100)


class FoodSearchResponse(BaseModel):
    """Schema for food search results"""
    results: list[FoodItemResponse]
    total: int


# ---------------------------
# Bulk Operations
# ---------------------------

class BulkMealFoodCreate(BaseModel):
    """Schema for adding multiple foods to a meal"""
    meal_id: int
    foods: list[MealFoodCreate]


# ---------------------------
# Barcode Scan Schemas
# ---------------------------

class BarcodeManualEntry(BaseModel):
    """Schema for manually adding a food item for an unknown barcode"""
    name: str = Field(..., min_length=1, max_length=200)
    brand: str | None = Field(None, max_length=100)
    calories: float = Field(..., ge=0)
    protein: float = Field(0.0, ge=0)
    carbs: float = Field(0.0, ge=0)
    fat: float = Field(0.0, ge=0)
    fiber: float | None = Field(0.0, ge=0)
    serving_size: float = Field(100.0, gt=0)
    serving_unit: str = Field("g", max_length=20)


class BarcodeScanResponse(BaseModel):
    """Schema for barcode scan response"""
    success: bool
    barcode: str
    message: str
    food: FoodItemResponse | None = None
    cached: bool = False
