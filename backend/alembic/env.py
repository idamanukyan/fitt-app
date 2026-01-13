"""
Alembic Environment Configuration

Handles database migrations for HyperFit backend.
"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# Add the parent directory to sys.path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import application modules
from app.core.config import settings
from app.core.database import Base

# Import all models to ensure they're registered with Base.metadata
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_measurement import UserMeasurement
from app.models.user_goal import UserGoal
from app.models.user_device import UserDevice
from app.models.user_notification import UserNotification
from app.models.token import RefreshToken, TokenBlacklist
from app.models.role import UserRole, CoachProfile
from app.models.coach import ClientInvitation
from app.models.workout import (
    WorkoutTemplate, WorkoutTemplateExercise, UserWorkout,
    WorkoutExercise, WorkoutSession, ExerciseLog
)
from app.models.exercise import Exercise, UserExercise, ExerciseHistory, ExerciseAlternative
from app.models.nutrition import FoodItem, Meal, MealFood, WaterLog, NutritionGoal
from app.models.progress_photo import ProgressPhoto
from app.models.achievement import Achievement, UserAchievement, UserLevel, UserStreak
from app.models.supplement import Supplement, UserSupplement, SupplementIntake
from app.models.shop import Product, ShoppingCart, CartItem, Order, OrderItem, ProductReview
from app.models.chat import ChatConversation, ChatMessage, ChatSuggestion
from app.models.sleep import SleepEntry
from app.models.meal_plan import MealPlan, MealPlanDay, MealPlanMeal, GroceryList, GroceryItem

# Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for autogenerate support
target_metadata = Base.metadata

# Override sqlalchemy.url with environment variable
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine
    creation we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    In this scenario we need to create an Engine and associate a
    connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
