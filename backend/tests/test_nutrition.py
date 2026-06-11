"""
Nutrition API Tests

Tests for food items, meals, water tracking, nutrition goals, and daily summaries.
"""
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.nutrition import FoodItem, Meal, MealType, MealFood, WaterLog, NutritionGoal


@pytest.fixture
def sample_food(test_db: Session, test_user) -> FoodItem:
    """Create a sample food item."""
    food = FoodItem(
        name="Chicken Breast",
        brand="Generic",
        category="protein",
        serving_size=100.0,
        serving_unit="g",
        calories=165.0,
        protein=31.0,
        carbs=0.0,
        fat=3.6,
        fiber=0.0,
        created_by_user_id=test_user.id,
    )
    test_db.add(food)
    test_db.commit()
    test_db.refresh(food)
    return food


@pytest.fixture
def sample_food_2(test_db: Session) -> FoodItem:
    """Create a second sample food item."""
    food = FoodItem(
        name="Brown Rice",
        brand="Uncle Ben's",
        category="carbs",
        serving_size=150.0,
        serving_unit="g",
        calories=170.0,
        protein=4.0,
        carbs=36.0,
        fat=1.5,
        fiber=2.0,
    )
    test_db.add(food)
    test_db.commit()
    test_db.refresh(food)
    return food


@pytest.fixture
def sample_meal(test_db: Session, test_user) -> Meal:
    """Create a sample meal directly in DB."""
    meal = Meal(
        user_id=test_user.id,
        meal_type=MealType.LUNCH,
        name="Lunch",
        date=date(2024, 1, 15),
    )
    test_db.add(meal)
    test_db.commit()
    test_db.refresh(meal)
    return meal


class TestFoodItems:
    """Tests for food item endpoints."""

    def test_create_food_item(self, client: TestClient, auth_headers):
        """Test creating a food item."""
        response = client.post(
            "/api/v1/nutrition/foods",
            json={
                "name": "Greek Yogurt",
                "brand": "Fage",
                "category": "dairy",
                "serving_size": 200.0,
                "serving_unit": "g",
                "calories": 130.0,
                "protein": 20.0,
                "carbs": 8.0,
                "fat": 0.0,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Greek Yogurt"
        assert data["calories"] == 130.0
        assert data["protein"] == 20.0

    def test_create_food_unauthenticated(self, client: TestClient):
        """Test creating food requires auth."""
        response = client.post(
            "/api/v1/nutrition/foods",
            json={
                "name": "Test Food",
                "serving_size": 100.0,
                "calories": 100.0,
            },
        )
        assert response.status_code == 403

    def test_list_food_items(self, client: TestClient, sample_food):
        """Test listing food items."""
        response = client.get("/api/v1/nutrition/foods")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Chicken Breast"

    def test_list_food_items_pagination(self, client: TestClient, sample_food, sample_food_2):
        """Test food items pagination."""
        response = client.get("/api/v1/nutrition/foods?skip=0&limit=1")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_food_items(self, client: TestClient, sample_food, sample_food_2):
        """Test searching food items."""
        response = client.get("/api/v1/nutrition/foods/search?query=Chicken")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert data["total"] >= 1
        assert data["results"][0]["name"] == "Chicken Breast"

    def test_get_food_item(self, client: TestClient, sample_food):
        """Test getting a specific food item."""
        response = client.get(f"/api/v1/nutrition/foods/{sample_food.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Chicken Breast"

    def test_get_nonexistent_food(self, client: TestClient):
        """Test getting non-existent food returns 404."""
        response = client.get("/api/v1/nutrition/foods/99999")
        assert response.status_code == 404

    def test_update_food_item(self, client: TestClient, auth_headers, sample_food):
        """Test updating a food item."""
        response = client.put(
            f"/api/v1/nutrition/foods/{sample_food.id}",
            json={"name": "Grilled Chicken Breast", "calories": 170.0},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Grilled Chicken Breast"
        assert data["calories"] == 170.0

    def test_delete_food_item(self, client: TestClient, auth_headers, sample_food):
        """Test deleting a food item."""
        response = client.delete(
            f"/api/v1/nutrition/foods/{sample_food.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_delete_nonexistent_food(self, client: TestClient, auth_headers):
        """Test deleting non-existent food returns 404."""
        response = client.delete(
            "/api/v1/nutrition/foods/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestMeals:
    """Tests for meal endpoints."""

    def test_create_meal(self, client: TestClient, auth_headers):
        """Test creating a meal."""
        response = client.post(
            "/api/v1/nutrition/meals",
            json={
                "meal_type": "breakfast",
                "name": "Morning Breakfast",
                "date": "2024-01-15",
                "notes": "High protein",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Morning Breakfast"

    def test_create_meal_unauthenticated(self, client: TestClient):
        """Test creating meal requires auth."""
        response = client.post(
            "/api/v1/nutrition/meals",
            json={
                "meal_type": "lunch",
                "date": "2024-01-15",
            },
        )
        assert response.status_code == 403

    def test_get_meal(self, client: TestClient, auth_headers, sample_meal):
        """Test getting a specific meal."""
        response = client.get(
            f"/api/v1/nutrition/meals/{sample_meal.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_get_meals_by_date(self, client: TestClient, auth_headers, sample_meal):
        """Test getting meals by date."""
        response = client.get(
            "/api/v1/nutrition/meals/date/2024-01-15",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    def test_get_user_meals(self, client: TestClient, auth_headers, sample_meal):
        """Test getting all user meals."""
        response = client.get("/api/v1/nutrition/meals", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    def test_update_meal(self, client: TestClient, auth_headers, sample_meal):
        """Test updating a meal."""
        response = client.put(
            f"/api/v1/nutrition/meals/{sample_meal.id}",
            json={"name": "Updated Lunch", "notes": "Updated notes"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Lunch"

    def test_delete_meal(self, client: TestClient, auth_headers, sample_meal):
        """Test deleting a meal."""
        response = client.delete(
            f"/api/v1/nutrition/meals/{sample_meal.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_get_nonexistent_meal(self, client: TestClient, auth_headers):
        """Test getting non-existent meal returns 404."""
        response = client.get(
            "/api/v1/nutrition/meals/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestMealFoods:
    """Tests for adding/removing foods from meals."""

    def test_add_food_to_meal(
        self, client: TestClient, auth_headers, sample_meal, sample_food
    ):
        """Test adding a food item to a meal."""
        response = client.post(
            f"/api/v1/nutrition/meals/{sample_meal.id}/foods",
            json={"food_id": sample_food.id, "serving_amount": 1.5},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["food_id"] == sample_food.id
        assert data["serving_amount"] == 1.5

    def test_add_food_to_nonexistent_meal(
        self, client: TestClient, auth_headers, sample_food
    ):
        """Test adding food to non-existent meal."""
        response = client.post(
            "/api/v1/nutrition/meals/99999/foods",
            json={"food_id": sample_food.id, "serving_amount": 1.0},
            headers=auth_headers,
        )
        assert response.status_code in [400, 404]

    def test_remove_food_from_meal(
        self, client: TestClient, auth_headers, test_db, sample_meal, sample_food
    ):
        """Test removing a food from a meal."""
        meal_food = MealFood(
            meal_id=sample_meal.id,
            food_id=sample_food.id,
            serving_amount=1.0,
            total_calories=165.0,
            total_protein=31.0,
            total_carbs=0.0,
            total_fat=3.6,
        )
        test_db.add(meal_food)
        test_db.commit()
        test_db.refresh(meal_food)

        response = client.delete(
            f"/api/v1/nutrition/meal-foods/{meal_food.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200


class TestWaterLogs:
    """Tests for water intake tracking."""

    def test_log_water(self, client: TestClient, auth_headers):
        """Test logging water intake."""
        response = client.post(
            "/api/v1/nutrition/water",
            json={"amount_ml": 500.0},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount_ml"] == 500.0

    def test_log_water_adds_to_existing(self, client: TestClient, auth_headers):
        """Test logging water adds to existing log for the same date."""
        # First log
        client.post(
            "/api/v1/nutrition/water",
            json={"amount_ml": 500.0},
            headers=auth_headers,
        )
        # Second log - same date (today)
        response = client.post(
            "/api/v1/nutrition/water",
            json={"amount_ml": 300.0},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount_ml"] == 800.0

    def test_get_water_log(self, client: TestClient, auth_headers):
        """Test getting water log for today's date."""
        # First create a water log for today
        client.post(
            "/api/v1/nutrition/water",
            json={"amount_ml": 1000.0},
            headers=auth_headers,
        )
        today = date.today().isoformat()
        response = client.get(
            f"/api/v1/nutrition/water/date/{today}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount_ml"] == 1000.0

    def test_get_water_log_not_found(self, client: TestClient, auth_headers):
        """Test getting water log for date with no entry."""
        response = client.get(
            "/api/v1/nutrition/water/date/2020-01-01",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_water_log(self, client: TestClient, auth_headers):
        """Test updating water log."""
        # First create
        client.post(
            "/api/v1/nutrition/water",
            json={"amount_ml": 500.0},
            headers=auth_headers,
        )
        today = date.today().isoformat()
        response = client.put(
            f"/api/v1/nutrition/water/date/{today}",
            json={"amount_ml": 2000.0},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["amount_ml"] == 2000.0

    def test_log_water_unauthenticated(self, client: TestClient):
        """Test logging water requires auth."""
        response = client.post(
            "/api/v1/nutrition/water",
            json={"amount_ml": 500.0},
        )
        assert response.status_code == 403


class TestNutritionGoals:
    """Tests for nutrition goals."""

    def test_create_nutrition_goal(self, client: TestClient, auth_headers):
        """Test creating nutrition goals."""
        response = client.post(
            "/api/v1/nutrition/goals",
            json={
                "calories": 2500.0,
                "protein": 180.0,
                "carbs": 250.0,
                "fat": 80.0,
                "fiber": 30.0,
                "water_ml": 3000.0,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["calories"] == 2500.0
        assert data["protein"] == 180.0

    def test_get_nutrition_goal_after_create(self, client: TestClient, auth_headers):
        """Test getting nutrition goals after creating them."""
        # Create first
        client.post(
            "/api/v1/nutrition/goals",
            json={
                "calories": 2000.0,
                "protein": 150.0,
                "carbs": 200.0,
                "fat": 65.0,
            },
            headers=auth_headers,
        )
        # Then get
        response = client.get("/api/v1/nutrition/goals", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["calories"] == 2000.0

    def test_update_nutrition_goal(self, client: TestClient, auth_headers):
        """Test updating nutrition goals."""
        # First create goals
        client.post(
            "/api/v1/nutrition/goals",
            json={
                "calories": 2000.0,
                "protein": 150.0,
                "carbs": 200.0,
                "fat": 65.0,
            },
            headers=auth_headers,
        )

        # Then update
        response = client.put(
            "/api/v1/nutrition/goals",
            json={"calories": 2200.0, "protein": 170.0},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["calories"] == 2200.0
        assert data["protein"] == 170.0

    def test_get_goals_unauthenticated(self, client: TestClient):
        """Test getting goals requires auth."""
        response = client.get("/api/v1/nutrition/goals")
        assert response.status_code == 403


class TestDailySummary:
    """Tests for daily nutrition summary."""

    def test_get_daily_summary(self, client: TestClient, auth_headers):
        """Test getting daily nutrition summary."""
        response = client.get(
            "/api/v1/nutrition/summary/2024-01-15",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "calories" in data
        assert "protein" in data
        assert "meals" in data
        assert "total_meals" in data

    def test_get_today_summary(self, client: TestClient, auth_headers):
        """Test getting today's summary."""
        response = client.get("/api/v1/nutrition/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "calories" in data

    def test_get_summary_unauthenticated(self, client: TestClient):
        """Test getting summary requires auth."""
        response = client.get("/api/v1/nutrition/summary/2024-01-15")
        assert response.status_code == 403
