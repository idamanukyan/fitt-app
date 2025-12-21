"""
Seed script to populate the database with popular exercises.

Creates 50 common exercises covering all major muscle groups and equipment types.
Run this script after database initialization to populate the exercise library.

Usage:
    python seed_exercises.py
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from slugify import slugify

from app.core.database import SessionLocal, engine, Base
from app.models.exercise import (
    Exercise,
    MuscleGroup,
    Equipment,
    ExerciseType,
    DifficultyLevel
)


def create_exercise(db: Session, **kwargs):
    """Helper to create an exercise with slug generation."""
    if 'slug' not in kwargs:
        kwargs['slug'] = slugify(kwargs['name'])

    # Check if exercise already exists
    existing = db.query(Exercise).filter(Exercise.slug == kwargs['slug']).first()
    if existing:
        print(f"  ⏭️  Skipping '{kwargs['name']}' (already exists)")
        return existing

    exercise = Exercise(**kwargs)
    db.add(exercise)
    print(f"  ✓ Created '{kwargs['name']}'")
    return exercise


def seed_exercises(db: Session):
    """Seed the database with popular exercises."""

    print("\n🏋️  Seeding Exercise Database\n")
    print("=" * 60)

    exercises_data = [
        # ========== CHEST EXERCISES ==========
        {
            "name": "Barbell Bench Press",
            "description": "Classic chest builder performed lying on a flat bench",
            "muscle_group": MuscleGroup.CHEST,
            "secondary_muscles": '["triceps", "shoulders"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Lie on bench with feet flat\n2. Grip bar slightly wider than shoulders\n3. Lower bar to mid-chest\n4. Press bar up to starting position",
            "form_tips": "Keep elbows at 45-degree angle, maintain arch in lower back, feet planted firmly",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Dumbbell Bench Press",
            "description": "Chest exercise allowing greater range of motion than barbell",
            "muscle_group": MuscleGroup.CHEST,
            "secondary_muscles": '["triceps", "shoulders"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Lie on bench holding dumbbells\n2. Start with arms extended\n3. Lower dumbbells to chest level\n4. Press dumbbells back up",
            "form_tips": "Control the weight, keep core engaged, avoid bouncing weights",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Incline Barbell Bench Press",
            "description": "Targets upper chest on an inclined bench",
            "muscle_group": MuscleGroup.CHEST,
            "secondary_muscles": '["shoulders", "triceps"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Set bench to 30-45 degree incline\n2. Lie back and grip barbell\n3. Lower to upper chest\n4. Press up explosively",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Push-Ups",
            "description": "Classic bodyweight chest exercise",
            "muscle_group": MuscleGroup.CHEST,
            "secondary_muscles": '["triceps", "shoulders", "core"]',
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.BODYWEIGHT,
            "difficulty": DifficultyLevel.BEGINNER,
            "instructions": "1. Start in plank position\n2. Lower body until chest near floor\n3. Push back up to start",
            "form_tips": "Keep body in straight line, core tight, don't let hips sag",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },
        {
            "name": "Cable Chest Fly",
            "description": "Isolation exercise for chest using cable machine",
            "muscle_group": MuscleGroup.CHEST,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.CABLE,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== BACK EXERCISES ==========
        {
            "name": "Deadlift",
            "description": "King of compound exercises, works entire posterior chain",
            "muscle_group": MuscleGroup.BACK,
            "secondary_muscles": '["glutes", "hamstrings", "traps", "forearms"]',
            "exercise_type": ExerciseType.POWERLIFTING,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.ADVANCED,
            "instructions": "1. Stand with feet hip-width, bar over mid-foot\n2. Bend down and grip bar\n3. Lift bar by extending hips and knees\n4. Lower bar under control",
            "form_tips": "Keep back neutral, chest up, drive through heels, bar close to body",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Pull-Ups",
            "description": "Upper body pulling exercise using bodyweight",
            "muscle_group": MuscleGroup.BACK,
            "secondary_muscles": '["biceps", "forearms"]',
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.PULL_UP_BAR,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Hang from bar with overhand grip\n2. Pull yourself up until chin over bar\n3. Lower with control",
            "form_tips": "Full range of motion, engage lats, avoid swinging",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },
        {
            "name": "Barbell Row",
            "description": "Compound back exercise for thickness and strength",
            "muscle_group": MuscleGroup.BACK,
            "secondary_muscles": '["biceps", "traps", "rear delts"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Bend at hips with slight knee bend\n2. Grip bar with hands shoulder-width\n3. Pull bar to lower chest\n4. Lower with control",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Lat Pulldown",
            "description": "Cable machine exercise for lat development",
            "muscle_group": MuscleGroup.BACK,
            "secondary_muscles": '["biceps"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.CABLE,
            "difficulty": DifficultyLevel.BEGINNER,
            "instructions": "1. Sit at lat pulldown machine\n2. Grip bar wider than shoulders\n3. Pull bar down to upper chest\n4. Return with control",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Dumbbell Row",
            "description": "Unilateral back exercise for muscle balance",
            "muscle_group": MuscleGroup.BACK,
            "secondary_muscles": '["biceps", "traps"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": True,
            "is_unilateral": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== SHOULDERS ==========
        {
            "name": "Overhead Press",
            "description": "Fundamental shoulder strength builder",
            "muscle_group": MuscleGroup.SHOULDERS,
            "secondary_muscles": '["triceps", "upper chest"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Hold bar at shoulder height\n2. Press bar overhead\n3. Lower to shoulders with control",
            "form_tips": "Keep core tight, don't arch back excessively, full lockout at top",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Dumbbell Shoulder Press",
            "description": "Shoulder press with dumbbells for stability",
            "muscle_group": MuscleGroup.SHOULDERS,
            "secondary_muscles": '["triceps"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Lateral Raise",
            "description": "Isolation for side deltoids",
            "muscle_group": MuscleGroup.SHOULDERS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "instructions": "1. Hold dumbbells at sides\n2. Raise arms out to sides to shoulder height\n3. Lower with control",
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Front Raise",
            "description": "Isolation for front deltoids",
            "muscle_group": MuscleGroup.SHOULDERS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== LEGS ==========
        {
            "name": "Barbell Squat",
            "description": "King of leg exercises, full body compound movement",
            "muscle_group": MuscleGroup.QUADS,
            "secondary_muscles": '["glutes", "hamstrings", "core"]',
            "exercise_type": ExerciseType.POWERLIFTING,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.ADVANCED,
            "instructions": "1. Bar on upper back\n2. Feet shoulder-width apart\n3. Squat down until thighs parallel\n4. Drive up through heels",
            "form_tips": "Chest up, knees track over toes, full depth, tight core",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Front Squat",
            "description": "Squat variation emphasizing quads and core",
            "muscle_group": MuscleGroup.QUADS,
            "secondary_muscles": '["glutes", "core"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.ADVANCED,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Romanian Deadlift",
            "description": "Hip hinge movement for hamstrings and glutes",
            "muscle_group": MuscleGroup.HAMSTRINGS,
            "secondary_muscles": '["glutes", "lower back"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "instructions": "1. Hold bar at hip height\n2. Hinge at hips, slight knee bend\n3. Lower bar to mid-shin\n4. Return to standing",
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Leg Press",
            "description": "Machine-based quad and glute exercise",
            "muscle_group": MuscleGroup.QUADS,
            "secondary_muscles": '["glutes"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.MACHINE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Leg Curl",
            "description": "Isolation exercise for hamstrings",
            "muscle_group": MuscleGroup.HAMSTRINGS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.MACHINE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Leg Extension",
            "description": "Isolation for quadriceps",
            "muscle_group": MuscleGroup.QUADS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.MACHINE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Walking Lunges",
            "description": "Dynamic leg exercise for quads and glutes",
            "muscle_group": MuscleGroup.QUADS,
            "secondary_muscles": '["glutes", "hamstrings"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_unilateral": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Bulgarian Split Squat",
            "description": "Unilateral leg exercise with rear foot elevated",
            "muscle_group": MuscleGroup.QUADS,
            "secondary_muscles": '["glutes"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_unilateral": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Calf Raise",
            "description": "Isolation exercise for calf muscles",
            "muscle_group": MuscleGroup.CALVES,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.MACHINE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== ARMS - BICEPS ==========
        {
            "name": "Barbell Curl",
            "description": "Classic bicep mass builder",
            "muscle_group": MuscleGroup.BICEPS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "instructions": "1. Hold bar with underhand grip\n2. Curl bar up to shoulders\n3. Lower with control",
            "form_tips": "Keep elbows stationary, no swinging, squeeze at top",
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Dumbbell Curl",
            "description": "Bicep exercise allowing for rotation",
            "muscle_group": MuscleGroup.BICEPS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Hammer Curl",
            "description": "Bicep and forearm exercise with neutral grip",
            "muscle_group": MuscleGroup.BICEPS,
            "secondary_muscles": '["forearms"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Preacher Curl",
            "description": "Isolated bicep curl on preacher bench",
            "muscle_group": MuscleGroup.BICEPS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== ARMS - TRICEPS ==========
        {
            "name": "Close-Grip Bench Press",
            "description": "Compound tricep exercise",
            "muscle_group": MuscleGroup.TRICEPS,
            "secondary_muscles": '["chest"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Tricep Dips",
            "description": "Bodyweight tricep exercise",
            "muscle_group": MuscleGroup.TRICEPS,
            "secondary_muscles": '["chest", "shoulders"]',
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.BODYWEIGHT,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },
        {
            "name": "Overhead Tricep Extension",
            "description": "Isolation for long head of triceps",
            "muscle_group": MuscleGroup.TRICEPS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.DUMBBELL,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Tricep Pushdown",
            "description": "Cable isolation for triceps",
            "muscle_group": MuscleGroup.TRICEPS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.CABLE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== CORE ==========
        {
            "name": "Plank",
            "description": "Isometric core stability exercise",
            "muscle_group": MuscleGroup.ABS,
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.BODYWEIGHT,
            "difficulty": DifficultyLevel.BEGINNER,
            "instructions": "1. Hold push-up position on forearms\n2. Keep body straight\n3. Hold for time",
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": False,
            "tracks_time": True
        },
        {
            "name": "Crunches",
            "description": "Basic abdominal exercise",
            "muscle_group": MuscleGroup.ABS,
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.BODYWEIGHT,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },
        {
            "name": "Hanging Leg Raise",
            "description": "Advanced core exercise targeting lower abs",
            "muscle_group": MuscleGroup.ABS,
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.PULL_UP_BAR,
            "difficulty": DifficultyLevel.ADVANCED,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },
        {
            "name": "Russian Twist",
            "description": "Rotational core exercise",
            "muscle_group": MuscleGroup.OBLIQUES,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.MEDICINE_BALL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Cable Crunch",
            "description": "Weighted ab exercise using cable",
            "muscle_group": MuscleGroup.ABS,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.CABLE,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== GLUTES ==========
        {
            "name": "Hip Thrust",
            "description": "Primary glute exercise",
            "muscle_group": MuscleGroup.GLUTES,
            "secondary_muscles": '["hamstrings"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Glute Bridge",
            "description": "Bodyweight glute activation",
            "muscle_group": MuscleGroup.GLUTES,
            "exercise_type": ExerciseType.CALISTHENICS,
            "equipment": Equipment.BODYWEIGHT,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },

        # ========== CARDIO ==========
        {
            "name": "Running",
            "description": "Cardiovascular endurance exercise",
            "muscle_group": MuscleGroup.CARDIO,
            "exercise_type": ExerciseType.CARDIO,
            "equipment": Equipment.NONE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": False,
            "tracks_time": True,
            "tracks_distance": True
        },
        {
            "name": "Cycling",
            "description": "Low-impact cardio exercise",
            "muscle_group": MuscleGroup.CARDIO,
            "exercise_type": ExerciseType.CARDIO,
            "equipment": Equipment.MACHINE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": False,
            "tracks_time": True,
            "tracks_distance": True
        },
        {
            "name": "Rowing Machine",
            "description": "Full-body cardio and strength",
            "muscle_group": MuscleGroup.FULL_BODY,
            "exercise_type": ExerciseType.CARDIO,
            "equipment": Equipment.MACHINE,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": False,
            "tracks_time": True,
            "tracks_distance": True
        },
        {
            "name": "Jump Rope",
            "description": "High-intensity cardio exercise",
            "muscle_group": MuscleGroup.CARDIO,
            "exercise_type": ExerciseType.CARDIO,
            "equipment": Equipment.NONE,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": False,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": False,
            "tracks_time": True
        },
        {
            "name": "Burpees",
            "description": "Full-body conditioning exercise",
            "muscle_group": MuscleGroup.FULL_BODY,
            "exercise_type": ExerciseType.PLYOMETRIC,
            "equipment": Equipment.BODYWEIGHT,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": False,
            "tracks_reps": True
        },

        # ========== OLYMPIC LIFTS ==========
        {
            "name": "Power Clean",
            "description": "Olympic weightlifting movement for explosive power",
            "muscle_group": MuscleGroup.FULL_BODY,
            "secondary_muscles": '["shoulders", "back", "legs"]',
            "exercise_type": ExerciseType.OLYMPIC_WEIGHTLIFTING,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.EXPERT,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Snatch",
            "description": "Olympic lift requiring full-body coordination",
            "muscle_group": MuscleGroup.FULL_BODY,
            "exercise_type": ExerciseType.OLYMPIC_WEIGHTLIFTING,
            "equipment": Equipment.BARBELL,
            "difficulty": DifficultyLevel.EXPERT,
            "is_compound": True,
            "is_popular": False,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== KETTLEBELL ==========
        {
            "name": "Kettlebell Swing",
            "description": "Explosive hip hinge movement with kettlebell",
            "muscle_group": MuscleGroup.GLUTES,
            "secondary_muscles": '["hamstrings", "back"]',
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.KETTLEBELL,
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "is_compound": True,
            "is_popular": True,
            "tracks_weight": True,
            "tracks_reps": True
        },
        {
            "name": "Turkish Get-Up",
            "description": "Complex full-body kettlebell movement",
            "muscle_group": MuscleGroup.FULL_BODY,
            "exercise_type": ExerciseType.STRENGTH,
            "equipment": Equipment.KETTLEBELL,
            "difficulty": DifficultyLevel.ADVANCED,
            "is_compound": True,
            "is_popular": False,
            "tracks_weight": True,
            "tracks_reps": True
        },

        # ========== STRETCHING ==========
        {
            "name": "Hamstring Stretch",
            "description": "Static stretch for hamstring flexibility",
            "muscle_group": MuscleGroup.HAMSTRINGS,
            "exercise_type": ExerciseType.STRETCHING,
            "equipment": Equipment.NONE,
            "difficulty": DifficultyLevel.BEGINNER,
            "is_compound": False,
            "is_popular": False,
            "tracks_weight": False,
            "tracks_reps": False,
            "tracks_time": True
        }
    ]

    print(f"\n📦 Creating {len(exercises_data)} exercises...\n")

    for exercise_data in exercises_data:
        create_exercise(db, **exercise_data)

    db.commit()

    print("\n" + "=" * 60)
    print(f"✅ Successfully seeded {len(exercises_data)} exercises!")
    print("=" * 60 + "\n")


def main():
    """Main function to run the seed script."""
    print("\n" + "=" * 60)
    print("🏋️  HyperFit Exercise Database Seeder")
    print("=" * 60)

    # Create all tables
    print("\n📋 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")

    # Create database session
    db = SessionLocal()

    try:
        # Seed exercises
        seed_exercises(db)

        # Print summary
        total_exercises = db.query(Exercise).count()
        print(f"\n📊 Database Summary:")
        print(f"   Total exercises in database: {total_exercises}")
        print(f"   Popular exercises: {db.query(Exercise).filter(Exercise.is_popular == True).count()}")
        print(f"   Compound movements: {db.query(Exercise).filter(Exercise.is_compound == True).count()}")
        print(f"   Bodyweight exercises: {db.query(Exercise).filter(Exercise.equipment == Equipment.BODYWEIGHT).count()}")

        print("\n✨ Seeding complete! Your exercise library is ready.\n")

    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
