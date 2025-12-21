"""
Nutrition tracking routes.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.nutrition_service import NutritionService
from app.schemas.nutrition_schemas import (
    FoodItemCreate, FoodItemUpdate, FoodItemResponse, FoodSearchResponse,
    MealCreate, MealUpdate, MealResponse, MealWithTotals,
    MealFoodCreate, MealFoodResponse,
    WaterLogCreate, WaterLogUpdate, WaterLogResponse,
    NutritionGoalCreate, NutritionGoalUpdate, NutritionGoalResponse,
    DailyNutritionSummary
)

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition"])


# ---------------------------
# Food Items
# ---------------------------

@router.post("/foods", response_model=FoodItemResponse)
def create_food_item(
    food_data: FoodItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new food item"""
    return NutritionService.create_food_item(db, food_data, current_user.id)


@router.get("/foods", response_model=List[FoodItemResponse])
def get_food_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all food items with pagination"""
    return NutritionService.get_food_items(db, skip, limit)


@router.get("/foods/search", response_model=FoodSearchResponse)
def search_food_items(
    query: str = Query(..., min_length=1),
    category: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search food items by name or brand"""
    results = NutritionService.search_food_items(db, query, category, limit)
    return FoodSearchResponse(results=results, total=len(results))


@router.get("/foods/barcode/{barcode}", response_model=FoodItemResponse)
def get_food_by_barcode(
    barcode: str,
    db: Session = Depends(get_db)
):
    """Get food item by barcode"""
    food_item = NutritionService.get_food_by_barcode(db, barcode)
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return food_item


@router.get("/foods/{food_id}", response_model=FoodItemResponse)
def get_food_item(
    food_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific food item"""
    food_item = NutritionService.get_food_item(db, food_id)
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return food_item


@router.put("/foods/{food_id}", response_model=FoodItemResponse)
def update_food_item(
    food_id: int,
    food_data: FoodItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a food item"""
    food_item = NutritionService.update_food_item(db, food_id, food_data)
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return food_item


@router.delete("/foods/{food_id}")
def delete_food_item(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a food item"""
    success = NutritionService.delete_food_item(db, food_id)
    if not success:
        raise HTTPException(status_code=404, detail="Food item not found")
    return {"message": "Food item deleted successfully"}


# ---------------------------
# Meals
# ---------------------------

@router.post("/meals", response_model=MealResponse)
def create_meal(
    meal_data: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new meal"""
    return NutritionService.create_meal(db, current_user.id, meal_data)


@router.get("/meals", response_model=List[MealResponse])
def get_user_meals(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all meals for current user, optionally filtered by date range"""
    return NutritionService.get_user_meals(db, current_user.id, start_date, end_date)


@router.get("/meals/date/{meal_date}", response_model=List[MealResponse])
def get_meals_by_date(
    meal_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all meals for a specific date"""
    return NutritionService.get_meals_by_date(db, current_user.id, meal_date)


@router.get("/meals/{meal_id}", response_model=MealResponse)
def get_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific meal"""
    meal = NutritionService.get_meal(db, meal_id, current_user.id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal


@router.put("/meals/{meal_id}", response_model=MealResponse)
def update_meal(
    meal_id: int,
    meal_data: MealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a meal"""
    meal = NutritionService.update_meal(db, meal_id, current_user.id, meal_data)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal


@router.delete("/meals/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a meal"""
    success = NutritionService.delete_meal(db, meal_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"message": "Meal deleted successfully"}


# ---------------------------
# Meal Foods
# ---------------------------

@router.post("/meals/{meal_id}/foods", response_model=MealFoodResponse)
def add_food_to_meal(
    meal_id: int,
    food_data: MealFoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a food item to a meal"""
    try:
        meal_food = NutritionService.add_food_to_meal(db, meal_id, current_user.id, food_data)
        if not meal_food:
            raise HTTPException(status_code=404, detail="Meal not found")
        return meal_food
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/meal-foods/{meal_food_id}")
def remove_food_from_meal(
    meal_food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a food item from a meal"""
    success = NutritionService.remove_food_from_meal(db, meal_food_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Meal food not found")
    return {"message": "Food removed from meal successfully"}


# ---------------------------
# Water Logs
# ---------------------------

@router.post("/water", response_model=WaterLogResponse)
def log_water(
    water_data: WaterLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log water intake (adds to existing log for the date)"""
    return NutritionService.log_water(db, current_user.id, water_data)


@router.get("/water/date/{log_date}", response_model=WaterLogResponse)
def get_water_log(
    log_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get water log for a specific date"""
    water_log = NutritionService.get_water_log(db, current_user.id, log_date)
    if not water_log:
        raise HTTPException(status_code=404, detail="Water log not found for this date")
    return water_log


@router.put("/water/date/{log_date}", response_model=WaterLogResponse)
def update_water_log(
    log_date: date,
    water_data: WaterLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update water log for a specific date (sets total, not adds)"""
    water_log = NutritionService.update_water_log(db, current_user.id, log_date, water_data)
    if not water_log:
        raise HTTPException(status_code=404, detail="Water log not found for this date")
    return water_log


# ---------------------------
# Nutrition Goals
# ---------------------------

@router.post("/goals", response_model=NutritionGoalResponse)
def create_or_update_nutrition_goal(
    goal_data: NutritionGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update nutrition goals"""
    return NutritionService.create_or_update_nutrition_goal(db, current_user.id, goal_data)


@router.get("/goals", response_model=NutritionGoalResponse)
def get_nutrition_goal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get nutrition goals for current user"""
    goal = NutritionService.get_nutrition_goal(db, current_user.id)
    if not goal:
        # Return default goals if none exist
        from app.models.nutrition import NutritionGoal
        return NutritionGoal(
            id=0,
            user_id=current_user.id,
            calories=2000.0,
            protein=150.0,
            carbs=200.0,
            fat=65.0,
            fiber=25.0,
            water_ml=2000.0
        )
    return goal


@router.put("/goals", response_model=NutritionGoalResponse)
def update_nutrition_goal(
    goal_data: NutritionGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update nutrition goals"""
    existing_goal = NutritionService.get_nutrition_goal(db, current_user.id)
    if not existing_goal:
        raise HTTPException(status_code=404, detail="Nutrition goals not found. Create them first.")

    # Convert update to create schema for the service method
    from app.schemas.nutrition_schemas import NutritionGoalCreate
    update_dict = goal_data.model_dump(exclude_unset=True)

    # Get current values for fields not being updated
    current_values = {
        'calories': existing_goal.calories,
        'protein': existing_goal.protein,
        'carbs': existing_goal.carbs,
        'fat': existing_goal.fat,
        'fiber': existing_goal.fiber,
        'water_ml': existing_goal.water_ml
    }
    current_values.update(update_dict)

    goal_create = NutritionGoalCreate(**current_values)
    return NutritionService.create_or_update_nutrition_goal(db, current_user.id, goal_create)


# ---------------------------
# Daily Summary
# ---------------------------

@router.get("/summary/{summary_date}", response_model=DailyNutritionSummary)
def get_daily_summary(
    summary_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete daily nutrition summary with all meals and progress"""
    return NutritionService.get_daily_summary(db, current_user.id, summary_date)


@router.get("/summary", response_model=DailyNutritionSummary)
def get_today_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's nutrition summary"""
    return NutritionService.get_daily_summary(db, current_user.id, date.today())
