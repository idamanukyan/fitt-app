"""
Meal Plan Service

Handles meal plan generation, management, and grocery list creation.
Uses AI for intelligent meal planning based on user preferences.
"""
import json
import re
from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.meal_plan import (
    MealPlan, MealPlanDay, MealPlanMeal, GroceryList, GroceryItem,
    DietaryPreference, MealPlanStatus, MealType
)
from app.models.nutrition import NutritionGoal
from app.schemas.meal_plan_schemas import (
    GenerateMealPlanRequest, MealPlanCreate, MealPlanUpdate,
    MealPlanMealUpdate, GroceryItemCreate
)
from app.services.ai.manager import get_ai_manager, TaskType
from app.services.ai.base import Message, MessageRole, UserContext


class MealPlanService:
    """Service for meal plan operations"""

    # Day names for meal plans
    DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    # Meal order by type
    MEAL_ORDER = {
        MealType.BREAKFAST: 1,
        MealType.MORNING_SNACK: 2,
        MealType.LUNCH: 3,
        MealType.AFTERNOON_SNACK: 4,
        MealType.DINNER: 5,
        MealType.EVENING_SNACK: 6,
    }

    @staticmethod
    def get_meal_plans(
        db: Session,
        user_id: int,
        status: Optional[MealPlanStatus] = None,
        skip: int = 0,
        limit: int = 10
    ) -> List[MealPlan]:
        """Get user's meal plans with optional status filter"""
        query = db.query(MealPlan).filter(MealPlan.user_id == user_id)

        if status:
            query = query.filter(MealPlan.status == status)

        return query.order_by(MealPlan.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_meal_plan(db: Session, meal_plan_id: int, user_id: int) -> Optional[MealPlan]:
        """Get a specific meal plan with all related data"""
        return db.query(MealPlan).options(
            joinedload(MealPlan.days).joinedload(MealPlanDay.meals)
        ).filter(
            MealPlan.id == meal_plan_id,
            MealPlan.user_id == user_id
        ).first()

    @staticmethod
    def get_active_meal_plan(db: Session, user_id: int) -> Optional[MealPlan]:
        """Get user's currently active meal plan"""
        return db.query(MealPlan).options(
            joinedload(MealPlan.days).joinedload(MealPlanDay.meals)
        ).filter(
            MealPlan.user_id == user_id,
            MealPlan.status == MealPlanStatus.ACTIVE
        ).first()

    @staticmethod
    def update_meal_plan(
        db: Session,
        meal_plan_id: int,
        user_id: int,
        update_data: MealPlanUpdate
    ) -> Optional[MealPlan]:
        """Update a meal plan"""
        meal_plan = db.query(MealPlan).filter(
            MealPlan.id == meal_plan_id,
            MealPlan.user_id == user_id
        ).first()

        if not meal_plan:
            return None

        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(meal_plan, field, value)

        db.commit()
        db.refresh(meal_plan)
        return meal_plan

    @staticmethod
    def delete_meal_plan(db: Session, meal_plan_id: int, user_id: int) -> bool:
        """Delete a meal plan"""
        meal_plan = db.query(MealPlan).filter(
            MealPlan.id == meal_plan_id,
            MealPlan.user_id == user_id
        ).first()

        if not meal_plan:
            return False

        db.delete(meal_plan)
        db.commit()
        return True

    @staticmethod
    def update_meal(
        db: Session,
        meal_id: int,
        user_id: int,
        update_data: MealPlanMealUpdate
    ) -> Optional[MealPlanMeal]:
        """Update a specific meal"""
        meal = db.query(MealPlanMeal).join(MealPlanDay).join(MealPlan).filter(
            MealPlanMeal.id == meal_id,
            MealPlan.user_id == user_id
        ).first()

        if not meal:
            return None

        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(meal, field, value)

        # Update day totals
        MealPlanService._update_day_totals(db, meal.day_id)

        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def _update_day_totals(db: Session, day_id: int):
        """Recalculate day totals from meals"""
        day = db.query(MealPlanDay).filter(MealPlanDay.id == day_id).first()
        if not day:
            return

        totals = db.query(
            func.sum(MealPlanMeal.calories).label('calories'),
            func.sum(MealPlanMeal.protein).label('protein'),
            func.sum(MealPlanMeal.carbs).label('carbs'),
            func.sum(MealPlanMeal.fat).label('fat')
        ).filter(
            MealPlanMeal.day_id == day_id,
            MealPlanMeal.is_skipped == False
        ).first()

        day.total_calories = totals.calories or 0
        day.total_protein = totals.protein or 0
        day.total_carbs = totals.carbs or 0
        day.total_fat = totals.fat or 0

    @staticmethod
    async def generate_meal_plan(
        db: Session,
        user_id: int,
        request: GenerateMealPlanRequest
    ) -> Dict[str, Any]:
        """
        Generate a new AI-powered meal plan.

        Uses the AI manager to create personalized meals based on
        user preferences, dietary restrictions, and nutrition goals.
        """
        # Get user's nutrition goals if targets not specified
        if not request.target_protein or not request.target_carbs or not request.target_fat:
            nutrition_goal = db.query(NutritionGoal).filter(
                NutritionGoal.user_id == user_id
            ).first()

            if nutrition_goal:
                if not request.target_protein:
                    request.target_protein = nutrition_goal.protein
                if not request.target_carbs:
                    request.target_carbs = nutrition_goal.carbs
                if not request.target_fat:
                    request.target_fat = nutrition_goal.fat

        # Calculate macro targets if still not set (based on calories)
        if not request.target_protein:
            request.target_protein = request.target_calories * 0.3 / 4  # 30% from protein
        if not request.target_carbs:
            request.target_carbs = request.target_calories * 0.4 / 4  # 40% from carbs
        if not request.target_fat:
            request.target_fat = request.target_calories * 0.3 / 9  # 30% from fat

        # Build AI prompt
        prompt = MealPlanService._build_generation_prompt(request)

        # Get AI manager and generate
        import time
        start_time = time.time()

        ai_manager = get_ai_manager()
        user_context = UserContext(
            user_id=user_id,
            dietary_preferences=[request.dietary_preference.value] if request.dietary_preference != DietaryPreference.NONE else []
        )

        messages = [Message(role=MessageRole.USER, content=prompt)]
        response = await ai_manager.generate(
            messages,
            user_context,
            task_type=TaskType.MEAL_PLANNING,
            temperature=0.8,
            max_tokens=4000
        )

        generation_time = int((time.time() - start_time) * 1000)

        if not response.is_success:
            raise ValueError(f"AI generation failed: {response.error}")

        # Parse AI response
        meal_plan_data = MealPlanService._parse_ai_response(response.content, request)

        # Create meal plan in database
        meal_plan = MealPlanService._create_meal_plan_from_data(
            db, user_id, request, meal_plan_data,
            response.provider.value, response.model
        )

        # Generate grocery list
        grocery_list = MealPlanService._generate_grocery_list(db, meal_plan)

        return {
            "meal_plan": meal_plan,
            "ai_provider": response.provider.value,
            "ai_model": response.model,
            "generation_time_ms": generation_time,
            "grocery_list": grocery_list
        }

    @staticmethod
    def _build_generation_prompt(request: GenerateMealPlanRequest) -> str:
        """Build the AI prompt for meal plan generation"""
        # Determine meal types to include
        meal_types = ["breakfast", "lunch", "dinner"]
        if request.include_snacks:
            if request.meals_per_day >= 4:
                meal_types.insert(2, "afternoon_snack")
            if request.meals_per_day >= 5:
                meal_types.insert(1, "morning_snack")
            if request.meals_per_day >= 6:
                meal_types.append("evening_snack")

        restrictions = []
        if request.dietary_preference != DietaryPreferenceEnum.NONE:
            restrictions.append(f"Diet: {request.dietary_preference.value}")
        if request.allergies:
            restrictions.append(f"Allergies: {', '.join(request.allergies)}")
        if request.excluded_foods:
            restrictions.append(f"Exclude: {', '.join(request.excluded_foods)}")

        preferences = []
        if request.quick_meals_only:
            preferences.append("Quick meals only (under 30 min total time)")
        if request.budget_friendly:
            preferences.append("Budget-friendly ingredients")
        if request.meal_prep_friendly:
            preferences.append("Good for meal prep/batch cooking")
        if request.preferred_foods:
            preferences.append(f"Preferred foods: {', '.join(request.preferred_foods)}")

        prompt = f"""Generate a {request.days}-day meal plan with the following requirements:

NUTRITION TARGETS (per day):
- Calories: {request.target_calories} kcal
- Protein: {request.target_protein:.0f}g
- Carbs: {request.target_carbs:.0f}g
- Fat: {request.target_fat:.0f}g

MEALS PER DAY: {', '.join(meal_types)}

DIETARY RESTRICTIONS:
{chr(10).join(restrictions) if restrictions else 'None'}

PREFERENCES:
{chr(10).join(preferences) if preferences else 'None'}

IMPORTANT: Return the meal plan in this exact JSON format:
{{
  "days": [
    {{
      "day": 1,
      "meals": [
        {{
          "meal_type": "breakfast",
          "name": "Meal Name",
          "description": "Brief description",
          "ingredients": "- ingredient 1\\n- ingredient 2",
          "instructions": "1. Step one\\n2. Step two",
          "prep_time": 10,
          "cook_time": 15,
          "calories": 400,
          "protein": 25,
          "carbs": 35,
          "fat": 15,
          "servings": 1
        }}
      ]
    }}
  ]
}}

Generate varied, delicious meals. Each day should have different meals.
Ensure daily totals are close to the nutrition targets.
Include exact calorie and macro counts for each meal."""

        return prompt

    @staticmethod
    def _parse_ai_response(content: str, request: GenerateMealPlanRequest) -> Dict:
        """Parse AI response into structured meal plan data"""
        # Try to extract JSON from response
        try:
            # Find JSON in response
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                data = json.loads(json_match.group())
                if "days" in data:
                    return data
        except json.JSONDecodeError:
            pass

        # Fallback: Create a basic meal plan if parsing fails
        return MealPlanService._create_fallback_meal_plan(request)

    @staticmethod
    def _create_fallback_meal_plan(request: GenerateMealPlanRequest) -> Dict:
        """Create a basic fallback meal plan if AI parsing fails"""
        calories_per_meal = request.target_calories / request.meals_per_day

        days = []
        for day_num in range(1, request.days + 1):
            meals = []
            meal_types = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER]

            for i, meal_type in enumerate(meal_types[:request.meals_per_day]):
                meals.append({
                    "meal_type": meal_type.value,
                    "name": f"{meal_type.value.replace('_', ' ').title()} - Day {day_num}",
                    "description": "AI-generated meal",
                    "ingredients": "Please customize ingredients",
                    "instructions": "Please add cooking instructions",
                    "prep_time": 15,
                    "cook_time": 20,
                    "calories": round(calories_per_meal),
                    "protein": round(request.target_protein / request.meals_per_day),
                    "carbs": round(request.target_carbs / request.meals_per_day),
                    "fat": round(request.target_fat / request.meals_per_day),
                    "servings": 1
                })

            days.append({"day": day_num, "meals": meals})

        return {"days": days}

    @staticmethod
    def _create_meal_plan_from_data(
        db: Session,
        user_id: int,
        request: GenerateMealPlanRequest,
        data: Dict,
        ai_provider: str,
        ai_model: str
    ) -> MealPlan:
        """Create meal plan database records from parsed data"""
        # Create meal plan
        end_date = request.start_date + timedelta(days=request.days - 1)
        plan_name = request.name or f"Meal Plan - {request.start_date.strftime('%b %d')}"

        meal_plan = MealPlan(
            user_id=user_id,
            name=plan_name,
            description=f"AI-generated {request.dietary_preference.value} meal plan" if request.dietary_preference != DietaryPreference.NONE else "AI-generated meal plan",
            start_date=request.start_date,
            end_date=end_date,
            status=MealPlanStatus.DRAFT,
            target_calories=request.target_calories,
            target_protein=request.target_protein,
            target_carbs=request.target_carbs,
            target_fat=request.target_fat,
            dietary_preference=DietaryPreference(request.dietary_preference.value),
            allergies=",".join(request.allergies) if request.allergies else None,
            excluded_foods=",".join(request.excluded_foods) if request.excluded_foods else None,
            meals_per_day=request.meals_per_day,
            include_snacks=request.include_snacks,
            ai_provider=ai_provider,
            ai_model=ai_model
        )
        db.add(meal_plan)
        db.flush()

        # Create days and meals
        for day_data in data.get("days", []):
            day_num = day_data.get("day", 1)
            day_date = request.start_date + timedelta(days=day_num - 1)
            day_name = MealPlanService.DAY_NAMES[day_date.weekday()]

            day = MealPlanDay(
                meal_plan_id=meal_plan.id,
                day_number=day_num,
                day_date=day_date,
                day_name=day_name
            )
            db.add(day)
            db.flush()

            # Add meals
            day_calories = 0
            day_protein = 0
            day_carbs = 0
            day_fat = 0

            for meal_data in day_data.get("meals", []):
                meal_type_str = meal_data.get("meal_type", "lunch")
                try:
                    meal_type = MealType(meal_type_str)
                except ValueError:
                    meal_type = MealType.LUNCH

                meal = MealPlanMeal(
                    day_id=day.id,
                    meal_type=meal_type,
                    meal_order=MealPlanService.MEAL_ORDER.get(meal_type, 3),
                    name=meal_data.get("name", "Meal"),
                    description=meal_data.get("description"),
                    ingredients=meal_data.get("ingredients"),
                    instructions=meal_data.get("instructions"),
                    prep_time_minutes=meal_data.get("prep_time"),
                    cook_time_minutes=meal_data.get("cook_time"),
                    calories=float(meal_data.get("calories", 0)),
                    protein=float(meal_data.get("protein", 0)),
                    carbs=float(meal_data.get("carbs", 0)),
                    fat=float(meal_data.get("fat", 0)),
                    fiber=float(meal_data.get("fiber", 0)) if meal_data.get("fiber") else None,
                    servings=int(meal_data.get("servings", 1))
                )
                db.add(meal)

                day_calories += meal.calories
                day_protein += meal.protein
                day_carbs += meal.carbs
                day_fat += meal.fat

            # Update day totals
            day.total_calories = day_calories
            day.total_protein = day_protein
            day.total_carbs = day_carbs
            day.total_fat = day_fat

        db.commit()
        db.refresh(meal_plan)

        return meal_plan

    @staticmethod
    def _generate_grocery_list(db: Session, meal_plan: MealPlan) -> GroceryList:
        """Generate a grocery list from a meal plan"""
        # Create grocery list
        grocery_list = GroceryList(
            meal_plan_id=meal_plan.id,
            user_id=meal_plan.user_id,
            name=f"Groceries for {meal_plan.name}"
        )
        db.add(grocery_list)
        db.flush()

        # Extract ingredients from all meals
        ingredient_counts: Dict[str, Dict[str, Any]] = {}

        for day in meal_plan.days:
            for meal in day.meals:
                if meal.ingredients:
                    # Parse ingredients (newline or comma separated)
                    lines = meal.ingredients.replace(",", "\n").split("\n")
                    for line in lines:
                        line = line.strip().lstrip("-•* ")
                        if line and len(line) > 1:
                            # Normalize ingredient name
                            name = line.lower()
                            if name in ingredient_counts:
                                ingredient_counts[name]["count"] += 1
                            else:
                                # Try to categorize
                                category = MealPlanService._categorize_ingredient(name)
                                ingredient_counts[name] = {
                                    "name": line.title(),
                                    "count": 1,
                                    "category": category
                                }

        # Create grocery items
        for ing_name, ing_data in ingredient_counts.items():
            item = GroceryItem(
                grocery_list_id=grocery_list.id,
                name=ing_data["name"],
                quantity=ing_data["count"],
                category=ing_data["category"]
            )
            db.add(item)

        db.commit()
        db.refresh(grocery_list)

        return grocery_list

    @staticmethod
    def _categorize_ingredient(name: str) -> str:
        """Categorize an ingredient for the grocery list"""
        name = name.lower()

        categories = {
            "produce": ["apple", "banana", "orange", "lettuce", "spinach", "tomato", "onion", "garlic", "pepper", "carrot", "broccoli", "cucumber", "avocado", "berry", "lemon", "lime"],
            "protein": ["chicken", "beef", "pork", "fish", "salmon", "tuna", "shrimp", "egg", "tofu", "turkey", "steak"],
            "dairy": ["milk", "cheese", "yogurt", "butter", "cream", "sour cream"],
            "grains": ["rice", "pasta", "bread", "oat", "quinoa", "cereal", "flour", "tortilla"],
            "pantry": ["oil", "vinegar", "sauce", "spice", "salt", "pepper", "sugar", "honey", "maple"],
            "frozen": ["frozen"],
            "canned": ["canned", "beans", "tomato sauce", "broth", "stock"]
        }

        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword in name:
                    return category

        return "other"

    @staticmethod
    def get_grocery_list(db: Session, meal_plan_id: int, user_id: int) -> Optional[GroceryList]:
        """Get grocery list for a meal plan"""
        return db.query(GroceryList).options(
            joinedload(GroceryList.items)
        ).filter(
            GroceryList.meal_plan_id == meal_plan_id,
            GroceryList.user_id == user_id
        ).first()

    @staticmethod
    def update_grocery_item(
        db: Session,
        item_id: int,
        user_id: int,
        is_purchased: bool
    ) -> Optional[GroceryItem]:
        """Update a grocery item's purchased status"""
        item = db.query(GroceryItem).join(GroceryList).filter(
            GroceryItem.id == item_id,
            GroceryList.user_id == user_id
        ).first()

        if not item:
            return None

        item.is_purchased = is_purchased
        db.commit()
        db.refresh(item)

        return item


# Import enum for prompt building
from app.schemas.meal_plan_schemas import DietaryPreferenceEnum
