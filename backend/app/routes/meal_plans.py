"""
Meal Plan Routes

API endpoints for AI-powered meal plan generation and management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.models.meal_plan import MealPlanStatus
from app.schemas.meal_plan_schemas import (
    GenerateMealPlanRequest, GeneratedMealPlanResponse,
    MealPlanResponse, MealPlanSummary, MealPlanListResponse,
    MealPlanUpdate, MealPlanMealUpdate, MealPlanMealResponse,
    MealPlanDayResponse, GroceryListResponse, GroceryItemUpdate,
    RegenerateMealRequest
)
from app.services.meal_plan_service import MealPlanService

router = APIRouter(prefix="/api/meal-plans", tags=["Meal Plans"])


# ---------------------------
# Meal Plan Generation
# ---------------------------

@router.post("/generate", response_model=GeneratedMealPlanResponse)
async def generate_meal_plan(
    request: GenerateMealPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a new AI-powered meal plan.

    Creates a personalized meal plan based on:
    - Calorie and macro targets
    - Dietary preferences (vegan, keto, etc.)
    - Allergies and excluded foods
    - Number of meals per day

    Returns the generated meal plan with grocery list.
    """
    try:
        result = await MealPlanService.generate_meal_plan(db, current_user.id, request)

        return GeneratedMealPlanResponse(
            meal_plan=MealPlanResponse.model_validate(result["meal_plan"]),
            ai_provider=result["ai_provider"],
            ai_model=result["ai_model"],
            generation_time_ms=result["generation_time_ms"],
            grocery_list=GroceryListResponse.model_validate(result["grocery_list"]) if result.get("grocery_list") else None
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating meal plan: {str(e)}"
        )


# ---------------------------
# Meal Plan CRUD
# ---------------------------

@router.get("", response_model=MealPlanListResponse)
def get_meal_plans(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's meal plans.

    Optionally filter by status: draft, active, completed, archived
    """
    plan_status = None
    if status_filter:
        try:
            plan_status = MealPlanStatus(status_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}"
            )

    meal_plans = MealPlanService.get_meal_plans(
        db, current_user.id, plan_status, skip, limit
    )

    summaries = []
    for plan in meal_plans:
        total_meals = sum(len(day.meals) for day in plan.days)
        avg_calories = sum(day.total_calories for day in plan.days) / len(plan.days) if plan.days else 0

        summaries.append(MealPlanSummary(
            id=plan.id,
            name=plan.name,
            start_date=plan.start_date,
            end_date=plan.end_date,
            status=plan.status,
            target_calories=plan.target_calories,
            dietary_preference=plan.dietary_preference,
            days_count=len(plan.days),
            total_meals=total_meals,
            avg_daily_calories=round(avg_calories, 1)
        ))

    return MealPlanListResponse(meal_plans=summaries, total=len(summaries))


@router.get("/active", response_model=Optional[MealPlanResponse])
def get_active_meal_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's currently active meal plan"""
    meal_plan = MealPlanService.get_active_meal_plan(db, current_user.id)
    if not meal_plan:
        return None
    return MealPlanResponse.model_validate(meal_plan)


@router.get("/{meal_plan_id}", response_model=MealPlanResponse)
def get_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific meal plan with all days and meals"""
    meal_plan = MealPlanService.get_meal_plan(db, meal_plan_id, current_user.id)
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    return MealPlanResponse.model_validate(meal_plan)


@router.put("/{meal_plan_id}", response_model=MealPlanResponse)
def update_meal_plan(
    meal_plan_id: int,
    update_data: MealPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a meal plan's details or status"""
    meal_plan = MealPlanService.update_meal_plan(
        db, meal_plan_id, current_user.id, update_data
    )
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    return MealPlanResponse.model_validate(meal_plan)


@router.post("/{meal_plan_id}/activate", response_model=MealPlanResponse)
def activate_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Activate a meal plan.

    Deactivates any currently active plan and sets this one as active.
    """
    # Deactivate current active plan
    current_active = MealPlanService.get_active_meal_plan(db, current_user.id)
    if current_active and current_active.id != meal_plan_id:
        MealPlanService.update_meal_plan(
            db, current_active.id, current_user.id,
            MealPlanUpdate(status=MealPlanStatus.COMPLETED)
        )

    # Activate new plan
    meal_plan = MealPlanService.update_meal_plan(
        db, meal_plan_id, current_user.id,
        MealPlanUpdate(status=MealPlanStatus.ACTIVE)
    )

    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )

    return MealPlanResponse.model_validate(meal_plan)


@router.delete("/{meal_plan_id}")
def delete_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a meal plan"""
    success = MealPlanService.delete_meal_plan(db, meal_plan_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    return {"message": "Meal plan deleted successfully"}


# ---------------------------
# Individual Meals
# ---------------------------

@router.put("/meals/{meal_id}", response_model=MealPlanMealResponse)
def update_meal(
    meal_id: int,
    update_data: MealPlanMealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific meal within a meal plan"""
    meal = MealPlanService.update_meal(db, meal_id, current_user.id, update_data)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return MealPlanMealResponse.model_validate(meal)


@router.post("/meals/{meal_id}/complete", response_model=MealPlanMealResponse)
def mark_meal_completed(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a meal as completed"""
    meal = MealPlanService.update_meal(
        db, meal_id, current_user.id,
        MealPlanMealUpdate(is_completed=True, is_skipped=False)
    )
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return MealPlanMealResponse.model_validate(meal)


@router.post("/meals/{meal_id}/skip", response_model=MealPlanMealResponse)
def skip_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Skip a meal"""
    meal = MealPlanService.update_meal(
        db, meal_id, current_user.id,
        MealPlanMealUpdate(is_skipped=True, is_completed=False)
    )
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return MealPlanMealResponse.model_validate(meal)


# ---------------------------
# Grocery Lists
# ---------------------------

@router.get("/{meal_plan_id}/grocery-list", response_model=GroceryListResponse)
def get_grocery_list(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get grocery list for a meal plan"""
    grocery_list = MealPlanService.get_grocery_list(db, meal_plan_id, current_user.id)
    if not grocery_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grocery list not found"
        )

    # Group items by category
    items_by_category = {}
    for item in grocery_list.items:
        category = item.category or "other"
        if category not in items_by_category:
            items_by_category[category] = []
        items_by_category[category].append(item)

    return GroceryListResponse(
        id=grocery_list.id,
        meal_plan_id=grocery_list.meal_plan_id,
        name=grocery_list.name,
        is_completed=grocery_list.is_completed,
        items=[item for item in grocery_list.items],
        items_by_category=items_by_category,
        total_items=len(grocery_list.items),
        purchased_items=sum(1 for item in grocery_list.items if item.is_purchased),
        created_at=grocery_list.created_at,
        updated_at=grocery_list.updated_at
    )


@router.put("/grocery-items/{item_id}")
def update_grocery_item(
    item_id: int,
    is_purchased: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle a grocery item's purchased status"""
    item = MealPlanService.update_grocery_item(db, item_id, current_user.id, is_purchased)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grocery item not found"
        )
    return {"id": item.id, "name": item.name, "is_purchased": item.is_purchased}
