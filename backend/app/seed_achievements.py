"""
Seed script for populating achievement data.

Creates 30+ achievements across all categories:
- Workout achievements
- Nutrition achievements
- Consistency (streak) achievements
- Social achievements
- Progress achievements
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base

# Import all models to ensure tables and relationships are properly registered
from app.models.achievement import Achievement, AchievementCategory, UserAchievement, UserStreak, UserLevel
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_measurement import UserMeasurement
from app.models.user_goal import UserGoal
from app.models.user_notification import UserNotification
from app.models.user_device import UserDevice
from app.models.token import RefreshToken
from app.models.coach import CoachProfile
from app.models.progress_photo import ProgressPhoto


def seed_achievements():
    """Seed achievement data into the database."""
    db = SessionLocal()

    try:
        # Check if achievements already exist
        existing_count = db.query(Achievement).count()
        if existing_count > 0:
            print(f"⚠️  Database already contains {existing_count} achievements.")
            response = input("Do you want to delete existing achievements and reseed? (yes/no): ")
            if response.lower() != "yes":
                print("Seeding cancelled.")
                return
            else:
                # Delete existing achievements
                db.query(Achievement).delete()
                db.commit()
                print("✅ Existing achievements deleted.")

        achievements = [
            # ==================== Workout Achievements ====================
            {
                "name": "First Steps",
                "slug": "first-steps",
                "description": "Complete your very first workout",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "walk",
                "color": "#0EA5E9",
                "target_value": 1,
                "xp_reward": 50,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Getting Started",
                "slug": "getting-started",
                "description": "Complete 5 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "fitness",
                "color": "#0EA5E9",
                "target_value": 5,
                "xp_reward": 100,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Committed",
                "slug": "committed",
                "description": "Complete 10 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "barbell",
                "color": "#0EA5E9",
                "target_value": 10,
                "xp_reward": 200,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Dedicated Athlete",
                "slug": "dedicated-athlete",
                "description": "Complete 25 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "trophy",
                "color": "#0EA5E9",
                "target_value": 25,
                "xp_reward": 350,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Fitness Warrior",
                "slug": "fitness-warrior",
                "description": "Complete 50 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "shield",
                "color": "#06B6D4",
                "target_value": 50,
                "xp_reward": 500,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Centurion",
                "slug": "centurion",
                "description": "Complete 100 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "ribbon",
                "color": "#06B6D4",
                "target_value": 100,
                "xp_reward": 1000,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Elite Performer",
                "slug": "elite-performer",
                "description": "Complete 250 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "star",
                "color": "#F97316",
                "target_value": 250,
                "xp_reward": 2000,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Legendary",
                "slug": "legendary",
                "description": "Complete 500 workouts",
                "category": AchievementCategory.WORKOUT,
                "icon_name": "flame",
                "color": "#F97316",
                "target_value": 500,
                "xp_reward": 5000,
                "is_active": True,
                "is_hidden": False
            },

            # ==================== Nutrition Achievements ====================
            {
                "name": "Nutrition Newbie",
                "slug": "nutrition-newbie",
                "description": "Log your first meal",
                "category": AchievementCategory.NUTRITION,
                "icon_name": "restaurant",
                "color": "#10B981",
                "target_value": 1,
                "xp_reward": 25,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Food Tracker",
                "slug": "food-tracker",
                "description": "Log 10 meals",
                "category": AchievementCategory.NUTRITION,
                "icon_name": "nutrition",
                "color": "#10B981",
                "target_value": 10,
                "xp_reward": 100,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Meal Master",
                "slug": "meal-master",
                "description": "Log 50 meals",
                "category": AchievementCategory.NUTRITION,
                "icon_name": "pizza",
                "color": "#10B981",
                "target_value": 50,
                "xp_reward": 250,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Nutrition Expert",
                "slug": "nutrition-expert",
                "description": "Log 100 meals",
                "category": AchievementCategory.NUTRITION,
                "icon_name": "leaf",
                "color": "#10B981",
                "target_value": 100,
                "xp_reward": 500,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Macro Manager",
                "slug": "macro-manager",
                "description": "Log 250 meals",
                "category": AchievementCategory.NUTRITION,
                "icon_name": "analytics",
                "color": "#10B981",
                "target_value": 250,
                "xp_reward": 1000,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Nutrition Champion",
                "slug": "nutrition-champion",
                "description": "Log 500 meals",
                "category": AchievementCategory.NUTRITION,
                "icon_name": "medal",
                "color": "#10B981",
                "target_value": 500,
                "xp_reward": 2000,
                "is_active": True,
                "is_hidden": False
            },

            # ==================== Consistency Achievements ====================
            {
                "name": "Starting Streak",
                "slug": "starting-streak",
                "description": "Maintain a 3-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#F97316",
                "target_value": 3,
                "xp_reward": 75,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Week Warrior",
                "slug": "week-warrior",
                "description": "Maintain a 7-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#F97316",
                "target_value": 7,
                "xp_reward": 200,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Two Week Champion",
                "slug": "two-week-champion",
                "description": "Maintain a 14-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#F97316",
                "target_value": 14,
                "xp_reward": 400,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Monthly Momentum",
                "slug": "monthly-momentum",
                "description": "Maintain a 30-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#F97316",
                "target_value": 30,
                "xp_reward": 750,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Streak Master",
                "slug": "streak-master",
                "description": "Maintain a 60-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#F97316",
                "target_value": 60,
                "xp_reward": 1500,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Consistency King",
                "slug": "consistency-king",
                "description": "Maintain a 100-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#EF4444",
                "target_value": 100,
                "xp_reward": 3000,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Unstoppable",
                "slug": "unstoppable",
                "description": "Maintain a 365-day activity streak",
                "category": AchievementCategory.CONSISTENCY,
                "icon_name": "flame",
                "color": "#EF4444",
                "target_value": 365,
                "xp_reward": 10000,
                "is_active": True,
                "is_hidden": False
            },

            # ==================== Social Achievements ====================
            {
                "name": "Social Butterfly",
                "slug": "social-butterfly",
                "description": "Connect with your first friend",
                "category": AchievementCategory.SOCIAL,
                "icon_name": "people",
                "color": "#8B5CF6",
                "target_value": 1,
                "xp_reward": 50,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Friend Circle",
                "slug": "friend-circle",
                "description": "Connect with 5 friends",
                "category": AchievementCategory.SOCIAL,
                "icon_name": "people-circle",
                "color": "#8B5CF6",
                "target_value": 5,
                "xp_reward": 150,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Community Member",
                "slug": "community-member",
                "description": "Connect with 10 friends",
                "category": AchievementCategory.SOCIAL,
                "icon_name": "people",
                "color": "#8B5CF6",
                "target_value": 10,
                "xp_reward": 300,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Social Leader",
                "slug": "social-leader",
                "description": "Connect with 25 friends",
                "category": AchievementCategory.SOCIAL,
                "icon_name": "megaphone",
                "color": "#8B5CF6",
                "target_value": 25,
                "xp_reward": 750,
                "is_active": True,
                "is_hidden": False
            },

            # ==================== Progress Achievements ====================
            {
                "name": "Progress Tracker",
                "slug": "progress-tracker",
                "description": "Upload your first progress photo",
                "category": AchievementCategory.PROGRESS,
                "icon_name": "camera",
                "color": "#06B6D4",
                "target_value": 1,
                "xp_reward": 50,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Documenting Journey",
                "slug": "documenting-journey",
                "description": "Upload 5 progress photos",
                "category": AchievementCategory.PROGRESS,
                "icon_name": "images",
                "color": "#06B6D4",
                "target_value": 5,
                "xp_reward": 150,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Transformation Timeline",
                "slug": "transformation-timeline",
                "description": "Upload 10 progress photos",
                "category": AchievementCategory.PROGRESS,
                "icon_name": "aperture",
                "color": "#06B6D4",
                "target_value": 10,
                "xp_reward": 300,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "Visual Progress Master",
                "slug": "visual-progress-master",
                "description": "Upload 25 progress photos",
                "category": AchievementCategory.PROGRESS,
                "icon_name": "image",
                "color": "#06B6D4",
                "target_value": 25,
                "xp_reward": 750,
                "is_active": True,
                "is_hidden": False
            },
            {
                "name": "First Measurement",
                "slug": "first-measurement",
                "description": "Record your first body measurement",
                "category": AchievementCategory.PROGRESS,
                "icon_name": "resize",
                "color": "#06B6D4",
                "target_value": 1,
                "xp_reward": 25,
                "is_active": True,
                "is_hidden": False
            },
        ]

        # Create achievements
        for ach_data in achievements:
            achievement = Achievement(**ach_data)
            db.add(achievement)

        db.commit()
        print(f"✅ Successfully seeded {len(achievements)} achievements!")

        # Display summary by category
        print("\n📊 Achievement Summary by Category:")
        for category in AchievementCategory:
            count = sum(1 for ach in achievements if ach["category"] == category)
            if count > 0:
                print(f"  - {category.value.title()}: {count} achievements")

    except Exception as e:
        print(f"❌ Error seeding achievements: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Starting achievement seeding process...")
    print("-" * 50)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Seed achievements
    seed_achievements()

    print("-" * 50)
    print("🎉 Seeding complete!")
