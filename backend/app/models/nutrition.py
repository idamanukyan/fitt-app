from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.core.database import Base
import enum

class MealType(enum.Enum):
    """Enum for meal types"""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class FoodItem(Base):
    """
    Food database with nutritional information.

    Stores comprehensive nutrition data for foods including macros,
    micronutrients, serving sizes, and barcodes for easy scanning.
    """
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Basic Information
    name = Column(String(200), nullable=False, index=True)
    brand = Column(String(100), nullable=True)
    barcode = Column(String(50), nullable=True, index=True, unique=True)
    category = Column(String(50), nullable=True, index=True)
    # Categories: protein, carbs, fruits, vegetables, dairy, snacks, beverages, etc.

    # Serving Information
    serving_size = Column(Float, nullable=False)  # Default serving size
    serving_unit = Column(String(20), nullable=False, default="g")  # g, ml, oz, cup, etc.

    # Macronutrients (per serving)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False, default=0.0)  # grams
    carbs = Column(Float, nullable=False, default=0.0)  # grams
    fat = Column(Float, nullable=False, default=0.0)  # grams
    fiber = Column(Float, nullable=True, default=0.0)  # grams
    sugar = Column(Float, nullable=True, default=0.0)  # grams

    # Micronutrients (optional, per serving)
    sodium = Column(Float, nullable=True)  # mg
    cholesterol = Column(Float, nullable=True)  # mg
    saturated_fat = Column(Float, nullable=True)  # grams
    trans_fat = Column(Float, nullable=True)  # grams

    # Additional Info
    description = Column(Text, nullable=True)
    is_verified = Column(Integer, default=0)  # 0=user-added, 1=verified
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    meal_foods = relationship("MealFood", back_populates="food_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FoodItem(id={self.id}, name='{self.name}', calories={self.calories})>"


class Meal(Base):
    """
    Meal tracking - groups foods together for a specific meal.

    Users can log multiple meals per day (breakfast, lunch, dinner, snacks)
    with custom names and notes.
    """
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Meal Details
    meal_type = Column(SQLEnum(MealType), nullable=False, index=True)
    name = Column(String(100), nullable=True)  # e.g., "Post-Workout Breakfast"
    date = Column(Date, nullable=False, index=True, default=date.today)

    # Optional
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="meals")
    meal_foods = relationship("MealFood", back_populates="meal", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Meal(id={self.id}, user_id={self.user_id}, type='{self.meal_type.value}', date={self.date})>"


class MealFood(Base):
    """
    Foods in a meal with serving amounts.

    Junction table that tracks which foods are in which meals,
    along with serving amounts and calculated nutrition totals.
    """
    __tablename__ = "meal_foods"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"), nullable=False, index=True)

    # Serving Information
    serving_amount = Column(Float, nullable=False, default=1.0)  # Number of servings

    # Calculated totals (denormalized for performance)
    total_calories = Column(Float, nullable=False)
    total_protein = Column(Float, nullable=False, default=0.0)
    total_carbs = Column(Float, nullable=False, default=0.0)
    total_fat = Column(Float, nullable=False, default=0.0)
    total_fiber = Column(Float, nullable=True, default=0.0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    meal = relationship("Meal", back_populates="meal_foods")
    food_item = relationship("FoodItem", back_populates="meal_foods")

    def __repr__(self):
        return f"<MealFood(id={self.id}, meal_id={self.meal_id}, food_id={self.food_id}, servings={self.serving_amount})>"


class WaterLog(Base):
    """
    Daily water intake tracking.

    Tracks water consumption throughout the day in milliliters.
    """
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Water Tracking
    date = Column(Date, nullable=False, index=True, default=date.today)
    amount_ml = Column(Float, nullable=False, default=0.0)  # Total water in milliliters

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="water_logs")

    def __repr__(self):
        return f"<WaterLog(id={self.id}, user_id={self.user_id}, date={self.date}, amount={self.amount_ml}ml)>"


class NutritionGoal(Base):
    """
    Daily nutrition targets.

    Stores user's daily calorie and macro goals, plus water intake targets.
    """
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Daily Targets
    calories = Column(Float, nullable=False, default=2000.0)
    protein = Column(Float, nullable=False, default=150.0)  # grams
    carbs = Column(Float, nullable=False, default=200.0)  # grams
    fat = Column(Float, nullable=False, default=65.0)  # grams
    fiber = Column(Float, nullable=True, default=25.0)  # grams
    water_ml = Column(Float, nullable=False, default=2000.0)  # milliliters

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="nutrition_goal", uselist=False)

    def __repr__(self):
        return f"<NutritionGoal(user_id={self.user_id}, calories={self.calories}, protein={self.protein}g)>"
