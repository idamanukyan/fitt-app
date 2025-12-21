#!/usr/bin/env python3
"""
Seed script for populating food database with 100+ common foods.

Run this script to populate the database with verified nutrition data.
"""
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import engine, Base
from app.models.nutrition import FoodItem

# Create tables
Base.metadata.create_all(bind=engine)


def seed_foods():
    """Seed the database with common foods"""
    session = Session(bind=engine)

    # Check if foods already exist
    existing_count = session.query(FoodItem).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} foods. Skipping seed.")
        return

    foods = [
        # PROTEINS - Meats & Poultry
        {"name": "Chicken Breast (Grilled)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
        {"name": "Chicken Thigh (Grilled)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 209, "protein": 26, "carbs": 0, "fat": 10.9, "fiber": 0},
        {"name": "Turkey Breast (Sliced)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 135, "protein": 30, "carbs": 0, "fat": 1.5, "fiber": 0},
        {"name": "Ground Beef (Lean 90/10)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 176, "protein": 26, "carbs": 0, "fat": 7.5, "fiber": 0},
        {"name": "Ground Beef (80/20)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 254, "protein": 26, "carbs": 0, "fat": 17, "fiber": 0},
        {"name": "Sirloin Steak", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 183, "protein": 26, "carbs": 0, "fat": 8, "fiber": 0},
        {"name": "Pork Chop (Grilled)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 231, "protein": 25, "carbs": 0, "fat": 14, "fiber": 0},
        {"name": "Bacon (Cooked)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 541, "protein": 37, "carbs": 1.4, "fat": 42, "fiber": 0},

        # PROTEINS - Fish & Seafood
        {"name": "Salmon (Atlantic)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 208, "protein": 20, "carbs": 0, "fat": 13, "fiber": 0},
        {"name": "Tuna (Canned in Water)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 116, "protein": 26, "carbs": 0, "fat": 0.8, "fiber": 0},
        {"name": "Tilapia", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 128, "protein": 26, "carbs": 0, "fat": 2.7, "fiber": 0},
        {"name": "Shrimp", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 99, "protein": 24, "carbs": 0.2, "fat": 0.3, "fiber": 0},
        {"name": "Cod", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 82, "protein": 18, "carbs": 0, "fat": 0.7, "fiber": 0},

        # PROTEINS - Eggs & Dairy
        {"name": "Egg (Whole, Large)", "category": "protein", "serving_size": 50, "serving_unit": "g",
         "calories": 72, "protein": 6.3, "carbs": 0.4, "fat": 4.8, "fiber": 0},
        {"name": "Egg White (Large)", "category": "protein", "serving_size": 33, "serving_unit": "g",
         "calories": 17, "protein": 3.6, "carbs": 0.2, "fat": 0.1, "fiber": 0},
        {"name": "Greek Yogurt (Plain, Nonfat)", "category": "dairy", "serving_size": 170, "serving_unit": "g",
         "calories": 100, "protein": 17, "carbs": 7, "fat": 0, "fiber": 0},
        {"name": "Greek Yogurt (Plain, Full Fat)", "category": "dairy", "serving_size": 170, "serving_unit": "g",
         "calories": 220, "protein": 15, "carbs": 8, "fat": 16, "fiber": 0},
        {"name": "Cottage Cheese (Low Fat)", "category": "dairy", "serving_size": 100, "serving_unit": "g",
         "calories": 82, "protein": 11, "carbs": 4.3, "fat": 2.3, "fiber": 0},
        {"name": "Milk (Whole)", "category": "dairy", "serving_size": 240, "serving_unit": "ml",
         "calories": 149, "protein": 7.7, "carbs": 11.7, "fat": 7.9, "fiber": 0},
        {"name": "Milk (Skim)", "category": "dairy", "serving_size": 240, "serving_unit": "ml",
         "calories": 83, "protein": 8.3, "carbs": 12.2, "fat": 0.2, "fiber": 0},
        {"name": "Cheddar Cheese", "category": "dairy", "serving_size": 28, "serving_unit": "g",
         "calories": 114, "protein": 7, "carbs": 0.4, "fat": 9.4, "fiber": 0},
        {"name": "Mozzarella Cheese (Part Skim)", "category": "dairy", "serving_size": 28, "serving_unit": "g",
         "calories": 72, "protein": 6.9, "carbs": 0.8, "fat": 4.5, "fiber": 0},

        # PROTEINS - Plant-Based
        {"name": "Tofu (Firm)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 144, "protein": 15.8, "carbs": 3.5, "fat": 8.6, "fiber": 2.3},
        {"name": "Tempeh", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 193, "protein": 20.3, "carbs": 7.6, "fat": 10.8, "fiber": 9},
        {"name": "Edamame", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 122, "protein": 11.9, "carbs": 8.9, "fat": 5.2, "fiber": 5},
        {"name": "Black Beans (Cooked)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 132, "protein": 8.9, "carbs": 23.7, "fat": 0.5, "fiber": 8.7},
        {"name": "Kidney Beans (Cooked)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 127, "protein": 8.7, "carbs": 22.8, "fat": 0.5, "fiber": 7.4},
        {"name": "Chickpeas (Cooked)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 164, "protein": 8.9, "carbs": 27.4, "fat": 2.6, "fiber": 7.6},
        {"name": "Lentils (Cooked)", "category": "protein", "serving_size": 100, "serving_unit": "g",
         "calories": 116, "protein": 9.0, "carbs": 20.1, "fat": 0.4, "fiber": 7.9},
        {"name": "Peanut Butter", "category": "protein", "serving_size": 32, "serving_unit": "g",
         "calories": 188, "protein": 7.7, "carbs": 7.7, "fat": 16, "fiber": 1.8},
        {"name": "Almond Butter", "category": "protein", "serving_size": 32, "serving_unit": "g",
         "calories": 196, "protein": 6.7, "carbs": 6.9, "fat": 17.7, "fiber": 3.3},

        # CARBS - Grains
        {"name": "Brown Rice (Cooked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 112, "protein": 2.6, "carbs": 23.5, "fat": 0.9, "fiber": 1.8},
        {"name": "White Rice (Cooked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 130, "protein": 2.7, "carbs": 28.2, "fat": 0.3, "fiber": 0.4},
        {"name": "Quinoa (Cooked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 120, "protein": 4.4, "carbs": 21.3, "fat": 1.9, "fiber": 2.8},
        {"name": "Oats (Dry)", "category": "carbs", "serving_size": 40, "serving_unit": "g",
         "calories": 152, "protein": 5.4, "carbs": 27.3, "fat": 2.6, "fiber": 4.1},
        {"name": "Whole Wheat Bread", "category": "carbs", "serving_size": 28, "serving_unit": "g",
         "calories": 69, "protein": 3.6, "carbs": 11.6, "fat": 0.9, "fiber": 1.9},
        {"name": "White Bread", "category": "carbs", "serving_size": 28, "serving_unit": "g",
         "calories": 75, "protein": 2.3, "carbs": 14.2, "fat": 1, "fiber": 0.7},
        {"name": "Pasta (Cooked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 158, "protein": 5.8, "carbs": 30.9, "fat": 0.9, "fiber": 1.8},
        {"name": "Whole Wheat Pasta (Cooked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 124, "protein": 5.3, "carbs": 26.5, "fat": 0.5, "fiber": 3.9},

        # CARBS - Starchy Vegetables
        {"name": "Sweet Potato (Baked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 90, "protein": 2, "carbs": 20.7, "fat": 0.2, "fiber": 3.3},
        {"name": "Potato (Baked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 93, "protein": 2.5, "carbs": 21.2, "fat": 0.1, "fiber": 2.2},
        {"name": "Corn (Cooked)", "category": "carbs", "serving_size": 100, "serving_unit": "g",
         "calories": 96, "protein": 3.4, "carbs": 21, "fat": 1.5, "fiber": 2.4},

        # FRUITS
        {"name": "Banana", "category": "fruits", "serving_size": 118, "serving_unit": "g",
         "calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "fiber": 3.1, "sugar": 14.4},
        {"name": "Apple", "category": "fruits", "serving_size": 182, "serving_unit": "g",
         "calories": 95, "protein": 0.5, "carbs": 25.1, "fat": 0.3, "fiber": 4.4, "sugar": 18.9},
        {"name": "Orange", "category": "fruits", "serving_size": 131, "serving_unit": "g",
         "calories": 62, "protein": 1.2, "carbs": 15.4, "fat": 0.2, "fiber": 3.1, "sugar": 12.2},
        {"name": "Strawberries", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3, "fiber": 2, "sugar": 4.9},
        {"name": "Blueberries", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 57, "protein": 0.7, "carbs": 14.5, "fat": 0.3, "fiber": 2.4, "sugar": 10},
        {"name": "Raspberries", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 52, "protein": 1.2, "carbs": 11.9, "fat": 0.7, "fiber": 6.5, "sugar": 4.4},
        {"name": "Blackberries", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 43, "protein": 1.4, "carbs": 9.6, "fat": 0.5, "fiber": 5.3, "sugar": 4.9},
        {"name": "Grapes", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 69, "protein": 0.7, "carbs": 18.1, "fat": 0.2, "fiber": 0.9, "sugar": 15.5},
        {"name": "Watermelon", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 30, "protein": 0.6, "carbs": 7.6, "fat": 0.2, "fiber": 0.4, "sugar": 6.2},
        {"name": "Pineapple", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 50, "protein": 0.5, "carbs": 13.1, "fat": 0.1, "fiber": 1.4, "sugar": 9.9},
        {"name": "Mango", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 60, "protein": 0.8, "carbs": 15, "fat": 0.4, "fiber": 1.6, "sugar": 13.7},
        {"name": "Avocado", "category": "fruits", "serving_size": 100, "serving_unit": "g",
         "calories": 160, "protein": 2, "carbs": 8.5, "fat": 14.7, "fiber": 6.7, "sugar": 0.7},

        # VEGETABLES
        {"name": "Broccoli (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 35, "protein": 2.4, "carbs": 7.2, "fat": 0.4, "fiber": 3.3},
        {"name": "Spinach (Raw)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2},
        {"name": "Kale (Raw)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 49, "protein": 4.3, "carbs": 8.8, "fat": 0.9, "fiber": 3.6},
        {"name": "Carrots (Raw)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 41, "protein": 0.9, "carbs": 9.6, "fat": 0.2, "fiber": 2.8, "sugar": 4.7},
        {"name": "Bell Pepper (Red)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 31, "protein": 1, "carbs": 6, "fat": 0.3, "fiber": 2.1, "sugar": 4.2},
        {"name": "Tomato (Raw)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "fiber": 1.2, "sugar": 2.6},
        {"name": "Cucumber", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 15, "protein": 0.7, "carbs": 3.6, "fat": 0.1, "fiber": 0.5, "sugar": 1.7},
        {"name": "Lettuce (Romaine)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 17, "protein": 1.2, "carbs": 3.3, "fat": 0.3, "fiber": 2.1},
        {"name": "Asparagus (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 22, "protein": 2.4, "carbs": 4.1, "fat": 0.2, "fiber": 2.1},
        {"name": "Green Beans (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 35, "protein": 1.8, "carbs": 7.9, "fat": 0.1, "fiber": 3.4},
        {"name": "Cauliflower (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 23, "protein": 1.8, "carbs": 4.4, "fat": 0.5, "fiber": 2.3},
        {"name": "Brussels Sprouts (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 36, "protein": 2.6, "carbs": 7.1, "fat": 0.5, "fiber": 2.6},
        {"name": "Zucchini (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 17, "protein": 1.2, "carbs": 3.1, "fat": 0.3, "fiber": 1},
        {"name": "Mushrooms (Cooked)", "category": "vegetables", "serving_size": 100, "serving_unit": "g",
         "calories": 28, "protein": 3.3, "carbs": 4.3, "fat": 0.5, "fiber": 1.3},

        # NUTS & SEEDS
        {"name": "Almonds", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 164, "protein": 6, "carbs": 6.1, "fat": 14.2, "fiber": 3.5},
        {"name": "Walnuts", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 185, "protein": 4.3, "carbs": 3.9, "fat": 18.5, "fiber": 1.9},
        {"name": "Cashews", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 157, "protein": 5.2, "carbs": 8.6, "fat": 12.4, "fiber": 0.9},
        {"name": "Peanuts", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 161, "protein": 7.3, "carbs": 4.6, "fat": 14, "fiber": 2.4},
        {"name": "Chia Seeds", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 138, "protein": 4.7, "carbs": 11.9, "fat": 8.7, "fiber": 9.8},
        {"name": "Flax Seeds", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 150, "protein": 5.1, "carbs": 8.1, "fat": 11.8, "fiber": 7.6},

        # OILS & FATS
        {"name": "Olive Oil", "category": "fats", "serving_size": 14, "serving_unit": "ml",
         "calories": 119, "protein": 0, "carbs": 0, "fat": 13.5, "fiber": 0},
        {"name": "Coconut Oil", "category": "fats", "serving_size": 14, "serving_unit": "ml",
         "calories": 121, "protein": 0, "carbs": 0, "fat": 13.5, "fiber": 0},
        {"name": "Butter", "category": "fats", "serving_size": 14, "serving_unit": "g",
         "calories": 102, "protein": 0.1, "carbs": 0, "fat": 11.5, "fiber": 0},

        # SNACKS
        {"name": "Protein Bar", "category": "snacks", "serving_size": 60, "serving_unit": "g",
         "calories": 200, "protein": 20, "carbs": 22, "fat": 7, "fiber": 3},
        {"name": "Granola", "category": "snacks", "serving_size": 50, "serving_unit": "g",
         "calories": 229, "protein": 5.8, "carbs": 37.7, "fat": 6.9, "fiber": 4.1},
        {"name": "Dark Chocolate (70% Cacao)", "category": "snacks", "serving_size": 28, "serving_unit": "g",
         "calories": 155, "protein": 2, "carbs": 13, "fat": 12, "fiber": 3, "sugar": 7},
        {"name": "Popcorn (Air-Popped)", "category": "snacks", "serving_size": 100, "serving_unit": "g",
         "calories": 387, "protein": 13, "carbs": 78, "fat": 4.5, "fiber": 15},
        {"name": "Hummus", "category": "snacks", "serving_size": 100, "serving_unit": "g",
         "calories": 166, "protein": 7.9, "carbs": 14.3, "fat": 9.6, "fiber": 6},
        {"name": "Rice Cakes", "category": "snacks", "serving_size": 9, "serving_unit": "g",
         "calories": 35, "protein": 0.7, "carbs": 7.3, "fat": 0.3, "fiber": 0.4},

        # BEVERAGES
        {"name": "Coffee (Black)", "category": "beverages", "serving_size": 240, "serving_unit": "ml",
         "calories": 2, "protein": 0.3, "carbs": 0, "fat": 0, "fiber": 0},
        {"name": "Green Tea", "category": "beverages", "serving_size": 240, "serving_unit": "ml",
         "calories": 2, "protein": 0.5, "carbs": 0, "fat": 0, "fiber": 0},
        {"name": "Almond Milk (Unsweetened)", "category": "beverages", "serving_size": 240, "serving_unit": "ml",
         "calories": 30, "protein": 1, "carbs": 1, "fat": 2.5, "fiber": 0},
        {"name": "Oat Milk", "category": "beverages", "serving_size": 240, "serving_unit": "ml",
         "calories": 120, "protein": 3, "carbs": 16, "fat": 5, "fiber": 2},
        {"name": "Protein Shake (Whey)", "category": "beverages", "serving_size": 30, "serving_unit": "g",
         "calories": 120, "protein": 24, "carbs": 3, "fat": 1.5, "fiber": 1},
        {"name": "Orange Juice", "category": "beverages", "serving_size": 240, "serving_unit": "ml",
         "calories": 112, "protein": 1.7, "carbs": 25.8, "fat": 0.5, "fiber": 0.5, "sugar": 20.8},
        {"name": "Apple Juice", "category": "beverages", "serving_size": 240, "serving_unit": "ml",
         "calories": 114, "protein": 0.2, "carbs": 28, "fat": 0.3, "fiber": 0.2, "sugar": 24},

        # CONDIMENTS & EXTRAS
        {"name": "Honey", "category": "snacks", "serving_size": 21, "serving_unit": "g",
         "calories": 64, "protein": 0.1, "carbs": 17.3, "fat": 0, "fiber": 0, "sugar": 17.2},
        {"name": "Maple Syrup", "category": "snacks", "serving_size": 20, "serving_unit": "ml",
         "calories": 52, "protein": 0, "carbs": 13.4, "fat": 0, "fiber": 0, "sugar": 12},
        {"name": "Ketchup", "category": "snacks", "serving_size": 17, "serving_unit": "g",
         "calories": 17, "protein": 0.2, "carbs": 4.5, "fat": 0, "fiber": 0.1, "sugar": 3.7},
        {"name": "Mayonnaise", "category": "fats", "serving_size": 15, "serving_unit": "g",
         "calories": 94, "protein": 0.1, "carbs": 0.1, "fat": 10.3, "fiber": 0},
        {"name": "Ranch Dressing", "category": "fats", "serving_size": 30, "serving_unit": "ml",
         "calories": 145, "protein": 0.4, "carbs": 1.4, "fat": 15.4, "fiber": 0},
    ]

    print(f"Seeding {len(foods)} food items...")

    for food_data in foods:
        food = FoodItem(
            **food_data,
            is_verified=1  # Mark as verified
        )
        session.add(food)

    try:
        session.commit()
        print(f"✓ Successfully seeded {len(foods)} foods!")
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding foods: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    seed_foods()
