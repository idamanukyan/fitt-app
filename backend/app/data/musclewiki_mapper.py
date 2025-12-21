"""
MuscleWiki data mapper and ingestion utilities.

This module provides:
1. Mapping from MuscleWiki data structure to our Exercise model
2. URL builders for MuscleWiki media (images/videos)
3. Seed data generation

MuscleWiki URL patterns:
- Images: https://musclewiki.com/media/uploads/videos/{muscle}/{exercise}/{gender}-{exercise}-{position}.png
- Videos: https://musclewiki.com/media/uploads/videos/{muscle}/{exercise}/{gender}-{exercise}.mp4
"""
import re
from typing import Optional, List, Dict, Any
from slugify import slugify

from app.models.exercise import (
    MuscleGroup, BodyPart, Equipment, ExerciseCategory,
    DifficultyLevel, ExerciseGender, ExercisePurpose, PainFocus,
    ForceType, MovementPattern
)


# ========== MuscleWiki URL Patterns ==========

MUSCLEWIKI_BASE = "https://musclewiki.com"
MUSCLEWIKI_MEDIA_BASE = "https://musclewiki.com/media/uploads"


def build_musclewiki_image_url(muscle: str, exercise_slug: str, gender: str = "male", position: int = 0) -> str:
    """Build MuscleWiki image URL."""
    gender_prefix = "male" if gender == "male" else "female"
    return f"{MUSCLEWIKI_MEDIA_BASE}/videos/{muscle}/{exercise_slug}/{gender_prefix}-{exercise_slug}-{position}.png"


def build_musclewiki_video_url(muscle: str, exercise_slug: str, gender: str = "male") -> str:
    """Build MuscleWiki video URL."""
    gender_prefix = "male" if gender == "male" else "female"
    return f"{MUSCLEWIKI_MEDIA_BASE}/videos/{muscle}/{exercise_slug}/{gender_prefix}-{exercise_slug}.mp4"


def build_musclewiki_gif_url(muscle: str, exercise_slug: str, gender: str = "male") -> str:
    """Build MuscleWiki GIF URL."""
    gender_prefix = "male" if gender == "male" else "female"
    return f"{MUSCLEWIKI_MEDIA_BASE}/videos/{muscle}/{exercise_slug}/{gender_prefix}-{exercise_slug}.gif"


# ========== Muscle Group Mappings ==========

MUSCLEWIKI_MUSCLE_MAP: Dict[str, MuscleGroup] = {
    # Chest
    "chest": MuscleGroup.CHEST,
    "pectorals": MuscleGroup.CHEST,
    "upper-chest": MuscleGroup.CHEST,
    "lower-chest": MuscleGroup.CHEST,

    # Back
    "back": MuscleGroup.BACK,
    "lats": MuscleGroup.LATS,
    "latissimus-dorsi": MuscleGroup.LATS,
    "traps": MuscleGroup.TRAPS,
    "trapezius": MuscleGroup.TRAPS,
    "rhomboids": MuscleGroup.BACK,
    "lower-back": MuscleGroup.LOWER_BACK,
    "erector-spinae": MuscleGroup.LOWER_BACK,

    # Shoulders
    "shoulders": MuscleGroup.SHOULDERS,
    "deltoids": MuscleGroup.SHOULDERS,
    "front-deltoids": MuscleGroup.SHOULDERS,
    "side-deltoids": MuscleGroup.SHOULDERS,
    "rear-deltoids": MuscleGroup.SHOULDERS,

    # Arms
    "biceps": MuscleGroup.BICEPS,
    "triceps": MuscleGroup.TRICEPS,
    "forearms": MuscleGroup.FOREARMS,
    "wrist-flexors": MuscleGroup.FOREARMS,
    "wrist-extensors": MuscleGroup.FOREARMS,

    # Core
    "abs": MuscleGroup.ABS,
    "abdominals": MuscleGroup.ABS,
    "obliques": MuscleGroup.OBLIQUES,
    "core": MuscleGroup.CORE,
    "transverse-abdominis": MuscleGroup.CORE,

    # Legs
    "quads": MuscleGroup.QUADS,
    "quadriceps": MuscleGroup.QUADS,
    "hamstrings": MuscleGroup.HAMSTRINGS,
    "glutes": MuscleGroup.GLUTES,
    "gluteus": MuscleGroup.GLUTES,
    "calves": MuscleGroup.CALVES,
    "gastrocnemius": MuscleGroup.CALVES,
    "soleus": MuscleGroup.CALVES,
    "hip-flexors": MuscleGroup.HIP_FLEXORS,
    "adductors": MuscleGroup.ADDUCTORS,
    "abductors": MuscleGroup.ABDUCTORS,

    # Other
    "neck": MuscleGroup.NECK,
    "full-body": MuscleGroup.FULL_BODY,
}

MUSCLE_TO_BODYPART: Dict[MuscleGroup, BodyPart] = {
    MuscleGroup.CHEST: BodyPart.CHEST,
    MuscleGroup.BACK: BodyPart.BACK,
    MuscleGroup.LATS: BodyPart.BACK,
    MuscleGroup.TRAPS: BodyPart.BACK,
    MuscleGroup.LOWER_BACK: BodyPart.BACK,
    MuscleGroup.SHOULDERS: BodyPart.SHOULDERS,
    MuscleGroup.BICEPS: BodyPart.ARMS,
    MuscleGroup.TRICEPS: BodyPart.ARMS,
    MuscleGroup.FOREARMS: BodyPart.ARMS,
    MuscleGroup.ABS: BodyPart.CORE,
    MuscleGroup.OBLIQUES: BodyPart.CORE,
    MuscleGroup.CORE: BodyPart.CORE,
    MuscleGroup.QUADS: BodyPart.LEGS,
    MuscleGroup.HAMSTRINGS: BodyPart.LEGS,
    MuscleGroup.CALVES: BodyPart.LEGS,
    MuscleGroup.HIP_FLEXORS: BodyPart.LEGS,
    MuscleGroup.ADDUCTORS: BodyPart.LEGS,
    MuscleGroup.ABDUCTORS: BodyPart.LEGS,
    MuscleGroup.GLUTES: BodyPart.GLUTES,
    MuscleGroup.NECK: BodyPart.FULL_BODY,
    MuscleGroup.FULL_BODY: BodyPart.FULL_BODY,
}


# ========== Equipment Mappings ==========

MUSCLEWIKI_EQUIPMENT_MAP: Dict[str, Equipment] = {
    "bodyweight": Equipment.BODYWEIGHT,
    "body-weight": Equipment.BODYWEIGHT,
    "none": Equipment.BODYWEIGHT,

    "barbell": Equipment.BARBELL,
    "straight-bar": Equipment.BARBELL,

    "dumbbell": Equipment.DUMBBELL,
    "dumbbells": Equipment.DUMBBELL,

    "kettlebell": Equipment.KETTLEBELL,
    "kettlebells": Equipment.KETTLEBELL,

    "machine": Equipment.MACHINE,
    "smith-machine": Equipment.SMITH_MACHINE,
    "smith": Equipment.SMITH_MACHINE,

    "cable": Equipment.CABLE,
    "cables": Equipment.CABLE,

    "ez-bar": Equipment.EZ_BAR,
    "ez-curl-bar": Equipment.EZ_BAR,

    "trap-bar": Equipment.TRAP_BAR,
    "hex-bar": Equipment.TRAP_BAR,

    "resistance-band": Equipment.RESISTANCE_BAND,
    "bands": Equipment.RESISTANCE_BAND,
    "band": Equipment.RESISTANCE_BAND,

    "medicine-ball": Equipment.MEDICINE_BALL,
    "med-ball": Equipment.MEDICINE_BALL,

    "stability-ball": Equipment.STABILITY_BALL,
    "swiss-ball": Equipment.STABILITY_BALL,
    "exercise-ball": Equipment.STABILITY_BALL,

    "foam-roller": Equipment.FOAM_ROLLER,
    "roller": Equipment.FOAM_ROLLER,

    "pull-up-bar": Equipment.PULL_UP_BAR,
    "pullup-bar": Equipment.PULL_UP_BAR,
    "chin-up-bar": Equipment.PULL_UP_BAR,

    "dip-bars": Equipment.DIP_BARS,
    "parallel-bars": Equipment.DIP_BARS,

    "bench": Equipment.BENCH,
    "flat-bench": Equipment.BENCH,
    "incline-bench": Equipment.BENCH,

    "box": Equipment.BOX,
    "plyo-box": Equipment.BOX,

    "trx": Equipment.TRX,
    "suspension-trainer": Equipment.TRX,
}


# ========== Category Mappings ==========

MUSCLEWIKI_CATEGORY_MAP: Dict[str, ExerciseCategory] = {
    "strength": ExerciseCategory.STRENGTH,
    "hypertrophy": ExerciseCategory.STRENGTH,
    "power": ExerciseCategory.STRENGTH,

    "stretching": ExerciseCategory.STRETCHING,
    "stretch": ExerciseCategory.STRETCHING,
    "static-stretch": ExerciseCategory.STRETCHING,
    "dynamic-stretch": ExerciseCategory.STRETCHING,

    "mobility": ExerciseCategory.MOBILITY,
    "flexibility": ExerciseCategory.MOBILITY,

    "rehab": ExerciseCategory.REHAB,
    "rehabilitation": ExerciseCategory.REHAB,
    "recovery": ExerciseCategory.REHAB,
    "prehab": ExerciseCategory.REHAB,

    "cardio": ExerciseCategory.CARDIO,
    "aerobic": ExerciseCategory.CARDIO,

    "plyometric": ExerciseCategory.PLYOMETRIC,
    "plyometrics": ExerciseCategory.PLYOMETRIC,
    "explosive": ExerciseCategory.PLYOMETRIC,

    "powerlifting": ExerciseCategory.POWERLIFTING,
    "olympic": ExerciseCategory.OLYMPIC,
    "olympic-lifting": ExerciseCategory.OLYMPIC,

    "calisthenics": ExerciseCategory.CALISTHENICS,
    "bodyweight-exercise": ExerciseCategory.CALISTHENICS,

    "yoga": ExerciseCategory.YOGA,

    "warmup": ExerciseCategory.WARMUP,
    "warm-up": ExerciseCategory.WARMUP,

    "cooldown": ExerciseCategory.COOLDOWN,
    "cool-down": ExerciseCategory.COOLDOWN,
}


# ========== Pain Focus Mappings ==========

PAIN_KEYWORDS_MAP: Dict[str, PainFocus] = {
    "lower back": PainFocus.LOWER_BACK,
    "lower-back": PainFocus.LOWER_BACK,
    "lumbar": PainFocus.LOWER_BACK,

    "upper back": PainFocus.UPPER_BACK,
    "upper-back": PainFocus.UPPER_BACK,
    "thoracic": PainFocus.UPPER_BACK,

    "neck": PainFocus.NECK,
    "cervical": PainFocus.NECK,

    "knee": PainFocus.KNEES,
    "knees": PainFocus.KNEES,
    "patellar": PainFocus.KNEES,

    "shoulder": PainFocus.SHOULDERS,
    "shoulders": PainFocus.SHOULDERS,
    "rotator cuff": PainFocus.SHOULDERS,

    "hip": PainFocus.HIPS,
    "hips": PainFocus.HIPS,

    "ankle": PainFocus.ANKLES,
    "ankles": PainFocus.ANKLES,

    "wrist": PainFocus.WRISTS,
    "wrists": PainFocus.WRISTS,

    "elbow": PainFocus.ELBOWS,
    "elbows": PainFocus.ELBOWS,
}


# ========== Mapper Class ==========

class MuscleWikiMapper:
    """Maps MuscleWiki exercise data to our Exercise model format."""

    @staticmethod
    def map_muscle_group(muscle: str) -> MuscleGroup:
        """Map MuscleWiki muscle name to MuscleGroup enum."""
        normalized = muscle.lower().strip().replace(" ", "-")
        return MUSCLEWIKI_MUSCLE_MAP.get(normalized, MuscleGroup.FULL_BODY)

    @staticmethod
    def map_body_part(muscle_group: MuscleGroup) -> BodyPart:
        """Get body part from muscle group."""
        return MUSCLE_TO_BODYPART.get(muscle_group, BodyPart.FULL_BODY)

    @staticmethod
    def map_equipment(equipment: str) -> Equipment:
        """Map MuscleWiki equipment name to Equipment enum."""
        normalized = equipment.lower().strip().replace(" ", "-")
        return MUSCLEWIKI_EQUIPMENT_MAP.get(normalized, Equipment.OTHER)

    @staticmethod
    def map_category(category: str) -> ExerciseCategory:
        """Map MuscleWiki category to ExerciseCategory enum."""
        normalized = category.lower().strip().replace(" ", "-")
        return MUSCLEWIKI_CATEGORY_MAP.get(normalized, ExerciseCategory.STRENGTH)

    @staticmethod
    def map_difficulty(difficulty: str) -> DifficultyLevel:
        """Map difficulty string to DifficultyLevel enum."""
        normalized = difficulty.lower().strip()
        if normalized in ["beginner", "easy", "novice"]:
            return DifficultyLevel.BEGINNER
        elif normalized in ["intermediate", "medium", "moderate"]:
            return DifficultyLevel.INTERMEDIATE
        elif normalized in ["advanced", "hard", "difficult"]:
            return DifficultyLevel.ADVANCED
        elif normalized in ["expert", "elite", "professional"]:
            return DifficultyLevel.EXPERT
        return DifficultyLevel.INTERMEDIATE

    @staticmethod
    def detect_pain_focus(name: str, description: str = "") -> Optional[PainFocus]:
        """Detect pain focus from exercise name or description."""
        combined = f"{name} {description}".lower()
        for keyword, pain_focus in PAIN_KEYWORDS_MAP.items():
            if keyword in combined:
                return pain_focus
        return None

    @staticmethod
    def detect_is_rehab(name: str, category: str = "", tags: List[str] = None) -> bool:
        """Detect if exercise is a rehabilitation exercise."""
        tags = tags or []
        combined = f"{name} {category} {' '.join(tags)}".lower()
        rehab_keywords = ["rehab", "rehabilitation", "recovery", "pain relief", "therapy", "prehab", "corrective"]
        return any(kw in combined for kw in rehab_keywords)

    @staticmethod
    def detect_gender(name: str, tags: List[str] = None) -> ExerciseGender:
        """Detect gender-specific exercise."""
        tags = tags or []
        combined = f"{name} {' '.join(tags)}".lower()

        female_keywords = ["female", "women", "hip thrust", "glute bridge", "kegel"]
        male_keywords = ["male only"]  # Most exercises are unisex

        if any(kw in combined for kw in female_keywords):
            return ExerciseGender.FEMALE
        if any(kw in combined for kw in male_keywords):
            return ExerciseGender.MALE
        return ExerciseGender.UNISEX

    @staticmethod
    def is_compound_movement(name: str, secondary_muscles: List[str] = None) -> bool:
        """Determine if exercise is compound movement."""
        compound_keywords = [
            "squat", "deadlift", "bench press", "row", "pull-up", "chin-up",
            "lunge", "clean", "snatch", "jerk", "press", "dip", "push-up"
        ]
        name_lower = name.lower()
        has_keyword = any(kw in name_lower for kw in compound_keywords)
        has_multiple_muscles = secondary_muscles and len(secondary_muscles) >= 2
        return has_keyword or has_multiple_muscles

    @classmethod
    def map_exercise(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map raw MuscleWiki exercise data to our Exercise model format.

        Expected raw_data structure:
        {
            "name": "Barbell Bench Press",
            "muscle": "chest",
            "secondary_muscles": ["triceps", "shoulders"],
            "equipment": "barbell",
            "category": "strength",
            "difficulty": "intermediate",
            "instructions": ["Step 1", "Step 2"],
            "tips": ["Tip 1"],
            "mistakes": ["Mistake 1"],
            "has_male_video": true,
            "has_female_video": true,
            "tags": ["compound", "push"],
            "musclewiki_id": "barbell-bench-press"
        }
        """
        name = raw_data.get("name", "")
        muscle = raw_data.get("muscle", "chest")
        equipment = raw_data.get("equipment", "bodyweight")
        category = raw_data.get("category", "strength")
        difficulty = raw_data.get("difficulty", "intermediate")
        tags = raw_data.get("tags", [])
        secondary = raw_data.get("secondary_muscles", [])

        muscle_group = cls.map_muscle_group(muscle)
        body_part = cls.map_body_part(muscle_group)
        mapped_equipment = cls.map_equipment(equipment)
        mapped_category = cls.map_category(category)
        mapped_difficulty = cls.map_difficulty(difficulty)
        gender = cls.detect_gender(name, tags)
        pain_focus = cls.detect_pain_focus(name, raw_data.get("description", ""))
        is_rehab = cls.detect_is_rehab(name, category, tags)
        is_compound = cls.is_compound_movement(name, secondary)

        # Generate slug
        exercise_slug = slugify(name)

        # Build media URLs
        muscle_slug = muscle.lower().replace(" ", "-")
        images_male = []
        images_female = []
        videos_male = []
        videos_female = []

        if raw_data.get("has_male_video", True):
            images_male = [
                build_musclewiki_image_url(muscle_slug, exercise_slug, "male", 0),
                build_musclewiki_image_url(muscle_slug, exercise_slug, "male", 1),
            ]
            videos_male = [build_musclewiki_video_url(muscle_slug, exercise_slug, "male")]

        if raw_data.get("has_female_video", True):
            images_female = [
                build_musclewiki_image_url(muscle_slug, exercise_slug, "female", 0),
                build_musclewiki_image_url(muscle_slug, exercise_slug, "female", 1),
            ]
            videos_female = [build_musclewiki_video_url(muscle_slug, exercise_slug, "female")]

        thumbnail = images_male[0] if images_male else (images_female[0] if images_female else None)
        gif_url = build_musclewiki_gif_url(muscle_slug, exercise_slug, "male")

        return {
            "name": name,
            "slug": exercise_slug,
            "description": raw_data.get("description"),

            "muscle_group": muscle_group,
            "body_part": body_part,
            "secondary_muscles": [cls.map_muscle_group(m).value for m in secondary],
            "category": mapped_category,
            "equipment": mapped_equipment,
            "difficulty": mapped_difficulty,
            "gender": gender,

            "purpose": ExercisePurpose.REHAB if is_rehab else (
                ExercisePurpose.STRENGTH if mapped_category == ExerciseCategory.STRENGTH else None
            ),
            "pain_focus": pain_focus,
            "is_rehab": is_rehab,
            "pain_warning": raw_data.get("pain_warning"),
            "contraindications": raw_data.get("contraindications", []),

            "is_compound": is_compound,
            "is_unilateral": "unilateral" in " ".join(tags).lower() or "single" in name.lower(),

            "images_male": images_male,
            "images_female": images_female,
            "videos_male": videos_male,
            "videos_female": videos_female,
            "thumbnail_url": thumbnail,
            "gif_url": gif_url,

            "instructions": raw_data.get("instructions", []),
            "tips": raw_data.get("tips", []),
            "common_mistakes": raw_data.get("mistakes", []),

            "source": "musclewiki",
            "musclewiki_id": raw_data.get("musclewiki_id", exercise_slug),
            "external_url": f"{MUSCLEWIKI_BASE}/exercises/{exercise_slug}",

            "is_popular": raw_data.get("is_popular", False),
            "is_featured": raw_data.get("is_featured", False),
            "is_new": raw_data.get("is_new", False),

            "tracks_weight": mapped_category in [ExerciseCategory.STRENGTH, ExerciseCategory.POWERLIFTING],
            "tracks_reps": True,
            "tracks_time": mapped_category in [ExerciseCategory.CARDIO, ExerciseCategory.STRETCHING],
            "tracks_distance": mapped_category == ExerciseCategory.CARDIO,

            "default_sets": 3 if mapped_category == ExerciseCategory.STRENGTH else 1,
            "default_reps": 10 if mapped_category == ExerciseCategory.STRENGTH else 1,
            "default_rest_seconds": 90 if is_compound else 60,
        }


def generate_slug(name: str) -> str:
    """Generate URL-safe slug from exercise name."""
    return slugify(name)
