from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import httpx

from app.models.nutrition import FoodItem, Meal, MealFood, WaterLog, NutritionGoal, MealType
from app.schemas.nutrition_schemas import (
    FoodItemCreate, FoodItemUpdate, MealCreate, MealUpdate,
    MealFoodCreate, WaterLogCreate, WaterLogUpdate,
    NutritionGoalCreate, NutritionGoalUpdate,
    MacroBreakdown, DailyNutritionSummary, MealWithTotals
)

# Open Food Facts API configuration
OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v0/product"


class NutritionService:
    """Service for nutrition tracking operations"""

    # ---------------------------
    # FoodItem Operations
    # ---------------------------

    @staticmethod
    def create_food_item(db: Session, food_data: FoodItemCreate, user_id: Optional[int] = None) -> FoodItem:
        """Create a new food item"""
        food_item = FoodItem(
            **food_data.model_dump(),
            created_by_user_id=user_id,
            is_verified=0  # User-created foods are not verified by default
        )
        db.add(food_item)
        db.commit()
        db.refresh(food_item)
        return food_item

    @staticmethod
    def get_food_item(db: Session, food_id: int) -> Optional[FoodItem]:
        """Get a food item by ID"""
        return db.query(FoodItem).filter(FoodItem.id == food_id).first()

    @staticmethod
    def get_food_items(db: Session, skip: int = 0, limit: int = 100) -> List[FoodItem]:
        """Get all food items with pagination"""
        return db.query(FoodItem).offset(skip).limit(limit).all()

    @staticmethod
    def search_food_items(db: Session, query: str, category: Optional[str] = None, limit: int = 20) -> List[FoodItem]:
        """Search food items by name, brand, or category"""
        search = f"%{query.lower()}%"
        filters = or_(
            func.lower(FoodItem.name).like(search),
            func.lower(FoodItem.brand).like(search)
        )

        if category:
            filters = and_(filters, FoodItem.category == category)

        return db.query(FoodItem).filter(filters).limit(limit).all()

    @staticmethod
    def get_food_by_barcode(db: Session, barcode: str) -> Optional[FoodItem]:
        """Get food item by barcode from local database"""
        return db.query(FoodItem).filter(FoodItem.barcode == barcode).first()

    @staticmethod
    def lookup_barcode(db: Session, barcode: str) -> Optional[FoodItem]:
        """
        Lookup food by barcode with Open Food Facts fallback.

        1. First checks local database
        2. If not found, queries Open Food Facts API
        3. Caches the result in local database for future lookups
        """
        # First, check local database
        existing = NutritionService.get_food_by_barcode(db, barcode)
        if existing:
            return existing

        # Query Open Food Facts API
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(f"{OPEN_FOOD_FACTS_API}/{barcode}.json")

                if response.status_code != 200:
                    return None

                data = response.json()

                if data.get("status") != 1 or not data.get("product"):
                    return None

                product = data["product"]
                nutrients = product.get("nutriments", {})

                # Extract nutrition data (per 100g)
                calories = nutrients.get("energy-kcal_100g") or nutrients.get("energy-kcal") or 0
                protein = nutrients.get("proteins_100g") or nutrients.get("proteins") or 0
                carbs = nutrients.get("carbohydrates_100g") or nutrients.get("carbohydrates") or 0
                fat = nutrients.get("fat_100g") or nutrients.get("fat") or 0
                fiber = nutrients.get("fiber_100g") or nutrients.get("fiber") or 0
                sugar = nutrients.get("sugars_100g") or nutrients.get("sugars") or 0
                sodium = nutrients.get("sodium_100g") or nutrients.get("sodium") or 0

                # Get product name and brand
                name = product.get("product_name") or product.get("product_name_en") or "Unknown Product"
                brand = product.get("brands") or ""

                # Get serving size
                serving_size = product.get("serving_size") or "100g"
                serving_grams = 100.0  # Default to 100g

                # Try to parse serving size
                if product.get("serving_quantity"):
                    try:
                        serving_grams = float(product["serving_quantity"])
                    except (ValueError, TypeError):
                        pass

                # Get category
                categories = product.get("categories_tags", [])
                category = categories[0].replace("en:", "").replace("-", " ").title() if categories else None

                # Parse serving unit from serving_size string
                serving_unit = "g"
                if serving_size:
                    if "ml" in serving_size.lower():
                        serving_unit = "ml"
                    elif "oz" in serving_size.lower():
                        serving_unit = "oz"
                    elif "cup" in serving_size.lower():
                        serving_unit = "cup"

                # Create and save food item to database
                food_item = FoodItem(
                    name=name[:200],  # Match model limit
                    brand=brand[:100] if brand else None,
                    barcode=barcode,
                    calories=round(calories, 1),
                    protein=round(protein, 1),
                    carbs=round(carbs, 1),
                    fat=round(fat, 1),
                    fiber=round(fiber, 1) if fiber else None,
                    sugar=round(sugar, 1) if sugar else None,
                    sodium=round(sodium * 1000, 1) if sodium else None,  # Convert to mg
                    serving_size=serving_grams,  # Numeric serving size
                    serving_unit=serving_unit,
                    category=category[:50] if category else None,
                    is_verified=1,  # From Open Food Facts
                    description=f"Imported from Open Food Facts (barcode: {barcode})"
                )

                db.add(food_item)
                db.commit()
                db.refresh(food_item)

                return food_item

        except httpx.TimeoutException:
            # API timeout - return None
            return None
        except Exception as e:
            # Log error but don't crash
            print(f"Open Food Facts lookup error: {e}")
            return None

    @staticmethod
    def update_food_item(db: Session, food_id: int, food_data: FoodItemUpdate) -> Optional[FoodItem]:
        """Update a food item"""
        food_item = db.query(FoodItem).filter(FoodItem.id == food_id).first()
        if not food_item:
            return None

        update_data = food_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(food_item, field, value)

        db.commit()
        db.refresh(food_item)
        return food_item

    @staticmethod
    def delete_food_item(db: Session, food_id: int) -> bool:
        """Delete a food item"""
        food_item = db.query(FoodItem).filter(FoodItem.id == food_id).first()
        if not food_item:
            return False
        db.delete(food_item)
        db.commit()
        return True

    # ---------------------------
    # Meal Operations
    # ---------------------------

    @staticmethod
    def create_meal(db: Session, user_id: int, meal_data: MealCreate) -> Meal:
        """Create a new meal with optional foods"""
        # Create meal
        meal = Meal(
            user_id=user_id,
            meal_type=meal_data.meal_type,
            name=meal_data.name,
            date=meal_data.date,
            notes=meal_data.notes
        )
        db.add(meal)
        db.flush()  # Get meal ID

        # Add foods if provided
        if meal_data.foods:
            for food_data in meal_data.foods:
                NutritionService._add_food_to_meal(db, meal.id, food_data)

        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def get_meal(db: Session, meal_id: int, user_id: int) -> Optional[Meal]:
        """Get a meal by ID (with user authorization check)"""
        return db.query(Meal).options(
            joinedload(Meal.meal_foods).joinedload(MealFood.food_item)
        ).filter(
            Meal.id == meal_id,
            Meal.user_id == user_id
        ).first()

    @staticmethod
    def get_user_meals(db: Session, user_id: int, start_date: Optional[date] = None,
                       end_date: Optional[date] = None) -> List[Meal]:
        """Get all meals for a user, optionally filtered by date range"""
        query = db.query(Meal).options(
            joinedload(Meal.meal_foods).joinedload(MealFood.food_item)
        ).filter(Meal.user_id == user_id)

        if start_date:
            query = query.filter(Meal.date >= start_date)
        if end_date:
            query = query.filter(Meal.date <= end_date)

        return query.order_by(Meal.date.desc(), Meal.meal_type).all()

    @staticmethod
    def get_meals_by_date(db: Session, user_id: int, meal_date: date) -> List[Meal]:
        """Get all meals for a specific date"""
        return db.query(Meal).options(
            joinedload(Meal.meal_foods).joinedload(MealFood.food_item)
        ).filter(
            Meal.user_id == user_id,
            Meal.date == meal_date
        ).order_by(Meal.meal_type).all()

    @staticmethod
    def update_meal(db: Session, meal_id: int, user_id: int, meal_data: MealUpdate) -> Optional[Meal]:
        """Update a meal"""
        meal = db.query(Meal).filter(
            Meal.id == meal_id,
            Meal.user_id == user_id
        ).first()

        if not meal:
            return None

        update_data = meal_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(meal, field, value)

        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def delete_meal(db: Session, meal_id: int, user_id: int) -> bool:
        """Delete a meal"""
        meal = db.query(Meal).filter(
            Meal.id == meal_id,
            Meal.user_id == user_id
        ).first()

        if not meal:
            return False

        db.delete(meal)
        db.commit()
        return True

    # ---------------------------
    # MealFood Operations
    # ---------------------------

    @staticmethod
    def add_food_to_meal(db: Session, meal_id: int, user_id: int, food_data: MealFoodCreate) -> Optional[MealFood]:
        """Add a food item to a meal"""
        # Verify meal belongs to user
        meal = db.query(Meal).filter(
            Meal.id == meal_id,
            Meal.user_id == user_id
        ).first()

        if not meal:
            return None

        return NutritionService._add_food_to_meal(db, meal_id, food_data)

    @staticmethod
    def _add_food_to_meal(db: Session, meal_id: int, food_data: MealFoodCreate) -> MealFood:
        """Internal method to add food to meal (no auth check)"""
        # Get food item
        food_item = db.query(FoodItem).filter(FoodItem.id == food_data.food_id).first()
        if not food_item:
            raise ValueError(f"Food item {food_data.food_id} not found")

        # Calculate totals
        serving_multiplier = food_data.serving_amount
        meal_food = MealFood(
            meal_id=meal_id,
            food_id=food_data.food_id,
            serving_amount=food_data.serving_amount,
            total_calories=food_item.calories * serving_multiplier,
            total_protein=food_item.protein * serving_multiplier,
            total_carbs=food_item.carbs * serving_multiplier,
            total_fat=food_item.fat * serving_multiplier,
            total_fiber=(food_item.fiber or 0) * serving_multiplier
        )

        db.add(meal_food)
        db.commit()
        db.refresh(meal_food)
        return meal_food

    @staticmethod
    def remove_food_from_meal(db: Session, meal_food_id: int, user_id: int) -> bool:
        """Remove a food from a meal"""
        meal_food = db.query(MealFood).join(Meal).filter(
            MealFood.id == meal_food_id,
            Meal.user_id == user_id
        ).first()

        if not meal_food:
            return False

        db.delete(meal_food)
        db.commit()
        return True

    # ---------------------------
    # Water Log Operations
    # ---------------------------

    @staticmethod
    def log_water(db: Session, user_id: int, water_data: WaterLogCreate) -> WaterLog:
        """Log water intake"""
        log_date = water_data.date or date.today()

        # Check if log exists for this date
        existing_log = db.query(WaterLog).filter(
            WaterLog.user_id == user_id,
            WaterLog.date == log_date
        ).first()

        if existing_log:
            # Update existing log
            existing_log.amount_ml += water_data.amount_ml
            db.commit()
            db.refresh(existing_log)
            return existing_log
        else:
            # Create new log
            water_log = WaterLog(
                user_id=user_id,
                date=log_date,
                amount_ml=water_data.amount_ml
            )
            db.add(water_log)
            db.commit()
            db.refresh(water_log)
            return water_log

    @staticmethod
    def get_water_log(db: Session, user_id: int, log_date: date) -> Optional[WaterLog]:
        """Get water log for a specific date"""
        return db.query(WaterLog).filter(
            WaterLog.user_id == user_id,
            WaterLog.date == log_date
        ).first()

    @staticmethod
    def update_water_log(db: Session, user_id: int, log_date: date, water_data: WaterLogUpdate) -> Optional[WaterLog]:
        """Update water log for a date"""
        water_log = NutritionService.get_water_log(db, user_id, log_date)
        if not water_log:
            return None

        water_log.amount_ml = water_data.amount_ml
        db.commit()
        db.refresh(water_log)
        return water_log

    # ---------------------------
    # Nutrition Goal Operations
    # ---------------------------

    @staticmethod
    def create_or_update_nutrition_goal(db: Session, user_id: int, goal_data: NutritionGoalCreate) -> NutritionGoal:
        """Create or update nutrition goals"""
        existing_goal = db.query(NutritionGoal).filter(
            NutritionGoal.user_id == user_id
        ).first()

        if existing_goal:
            # Update existing goal
            for field, value in goal_data.model_dump().items():
                setattr(existing_goal, field, value)
            db.commit()
            db.refresh(existing_goal)
            return existing_goal
        else:
            # Create new goal
            goal = NutritionGoal(
                user_id=user_id,
                **goal_data.model_dump()
            )
            db.add(goal)
            db.commit()
            db.refresh(goal)
            return goal

    @staticmethod
    def get_nutrition_goal(db: Session, user_id: int) -> Optional[NutritionGoal]:
        """Get nutrition goals for a user"""
        return db.query(NutritionGoal).filter(
            NutritionGoal.user_id == user_id
        ).first()

    # ---------------------------
    # Daily Summary
    # ---------------------------

    @staticmethod
    def get_daily_summary(db: Session, user_id: int, summary_date: date) -> DailyNutritionSummary:
        """Get complete daily nutrition summary"""
        # Get user's nutrition goals
        goal = NutritionService.get_nutrition_goal(db, user_id)
        if not goal:
            # Create default goals if none exist
            goal = NutritionGoal(
                user_id=user_id,
                calories=2000.0,
                protein=150.0,
                carbs=200.0,
                fat=65.0,
                fiber=25.0,
                water_ml=2000.0
            )

        # Get all meals for the date
        meals = NutritionService.get_meals_by_date(db, user_id, summary_date)

        # Calculate totals from meals
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fat = 0.0
        total_fiber = 0.0

        meals_with_totals = []
        for meal in meals:
            meal_calories = sum(mf.total_calories for mf in meal.meal_foods)
            meal_protein = sum(mf.total_protein for mf in meal.meal_foods)
            meal_carbs = sum(mf.total_carbs for mf in meal.meal_foods)
            meal_fat = sum(mf.total_fat for mf in meal.meal_foods)
            meal_fiber = sum(mf.total_fiber or 0 for mf in meal.meal_foods)

            total_calories += meal_calories
            total_protein += meal_protein
            total_carbs += meal_carbs
            total_fat += meal_fat
            total_fiber += meal_fiber

            meals_with_totals.append(MealWithTotals(
                **meal.__dict__,
                meal_foods=[mf for mf in meal.meal_foods],
                total_calories=meal_calories,
                total_protein=meal_protein,
                total_carbs=meal_carbs,
                total_fat=meal_fat,
                total_fiber=meal_fiber
            ))

        # Get water intake
        water_log = NutritionService.get_water_log(db, user_id, summary_date)
        total_water = water_log.amount_ml if water_log else 0.0

        # Build macro breakdowns
        def make_breakdown(current: float, goal: float) -> MacroBreakdown:
            percentage = (current / goal * 100) if goal > 0 else 0
            return MacroBreakdown(
                current=round(current, 1),
                goal=round(goal, 1),
                percentage=round(percentage, 1),
                remaining=round(max(0, goal - current), 1)
            )

        return DailyNutritionSummary(
            date=summary_date,
            calories=make_breakdown(total_calories, goal.calories),
            protein=make_breakdown(total_protein, goal.protein),
            carbs=make_breakdown(total_carbs, goal.carbs),
            fat=make_breakdown(total_fat, goal.fat),
            fiber=make_breakdown(total_fiber, goal.fiber or 25.0),
            water=make_breakdown(total_water, goal.water_ml),
            meals=meals_with_totals,
            total_meals=len(meals)
        )
