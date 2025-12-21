"""
Exercise models for MuscleWiki-based exercise library.
Supports gender variants, rehab exercises, and comprehensive filtering.
"""
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Enum as SQLEnum, DateTime,
    ForeignKey, Table, JSON, Float, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum


class MuscleGroup(str, enum.Enum):
    """Primary muscle groups targeted by exercises."""
    CHEST = "chest"
    BACK = "back"
    SHOULDERS = "shoulders"
    BICEPS = "biceps"
    TRICEPS = "triceps"
    FOREARMS = "forearms"
    ABS = "abs"
    OBLIQUES = "obliques"
    CORE = "core"
    QUADS = "quads"
    HAMSTRINGS = "hamstrings"
    GLUTES = "glutes"
    CALVES = "calves"
    HIP_FLEXORS = "hip_flexors"
    ADDUCTORS = "adductors"
    ABDUCTORS = "abductors"
    TRAPS = "traps"
    LATS = "lats"
    LOWER_BACK = "lower_back"
    NECK = "neck"
    FULL_BODY = "full_body"


class BodyPart(str, enum.Enum):
    """High-level body part groupings."""
    CHEST = "chest"
    BACK = "back"
    SHOULDERS = "shoulders"
    ARMS = "arms"
    CORE = "core"
    LEGS = "legs"
    GLUTES = "glutes"
    FULL_BODY = "full_body"


class Equipment(str, enum.Enum):
    """Equipment needed for exercises."""
    BODYWEIGHT = "bodyweight"
    BARBELL = "barbell"
    DUMBBELL = "dumbbell"
    KETTLEBELL = "kettlebell"
    MACHINE = "machine"
    CABLE = "cable"
    SMITH_MACHINE = "smith_machine"
    EZ_BAR = "ez_bar"
    TRAP_BAR = "trap_bar"
    RESISTANCE_BAND = "resistance_band"
    MEDICINE_BALL = "medicine_ball"
    STABILITY_BALL = "stability_ball"
    FOAM_ROLLER = "foam_roller"
    PULL_UP_BAR = "pull_up_bar"
    DIP_BARS = "dip_bars"
    BENCH = "bench"
    BOX = "box"
    TRX = "trx"
    NONE = "none"
    OTHER = "other"


class ExerciseCategory(str, enum.Enum):
    """Category of exercise."""
    STRENGTH = "strength"
    STRETCHING = "stretching"
    MOBILITY = "mobility"
    REHAB = "rehab"
    CARDIO = "cardio"
    PLYOMETRIC = "plyometric"
    POWERLIFTING = "powerlifting"
    OLYMPIC = "olympic"
    CALISTHENICS = "calisthenics"
    YOGA = "yoga"
    WARMUP = "warmup"
    COOLDOWN = "cooldown"


class DifficultyLevel(str, enum.Enum):
    """Exercise difficulty level."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ExerciseGender(str, enum.Enum):
    """Gender-specific exercise variants."""
    MALE = "male"
    FEMALE = "female"
    UNISEX = "unisex"


class ExercisePurpose(str, enum.Enum):
    """Primary purpose of the exercise."""
    HYPERTROPHY = "hypertrophy"
    STRENGTH = "strength"
    ENDURANCE = "endurance"
    POWER = "power"
    FAT_LOSS = "fat_loss"
    REHAB = "rehab"
    PAIN_RELIEF = "pain_relief"
    FLEXIBILITY = "flexibility"
    WARMUP = "warmup"
    COOLDOWN = "cooldown"
    GENERAL_FITNESS = "general_fitness"


class PainFocus(str, enum.Enum):
    """Pain/rehab focus areas."""
    LOWER_BACK = "lower_back"
    UPPER_BACK = "upper_back"
    NECK = "neck"
    KNEES = "knees"
    SHOULDERS = "shoulders"
    HIPS = "hips"
    ANKLES = "ankles"
    WRISTS = "wrists"
    ELBOWS = "elbows"


class ForceType(str, enum.Enum):
    """Type of force used in exercise."""
    PUSH = "push"
    PULL = "pull"
    STATIC = "static"
    DYNAMIC = "dynamic"


class MovementPattern(str, enum.Enum):
    """Movement pattern classification."""
    HORIZONTAL_PUSH = "horizontal_push"
    HORIZONTAL_PULL = "horizontal_pull"
    VERTICAL_PUSH = "vertical_push"
    VERTICAL_PULL = "vertical_pull"
    SQUAT = "squat"
    HINGE = "hinge"
    LUNGE = "lunge"
    ROTATION = "rotation"
    CARRY = "carry"
    ISOLATION = "isolation"


# Association table for exercise target muscles
exercise_muscles = Table(
    'exercise_muscles',
    Base.metadata,
    Column('exercise_id', Integer, ForeignKey('exercises.id', ondelete='CASCADE'), primary_key=True),
    Column('muscle_group', SQLEnum(MuscleGroup), primary_key=True),
    Column('is_primary', Boolean, default=True)
)

# Association table for user saved exercises
user_saved_exercises = Table(
    'user_saved_exercises',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('exercise_id', Integer, ForeignKey('exercises.id', ondelete='CASCADE'), primary_key=True),
    Column('saved_at', DateTime, default=datetime.utcnow),
    Column('notes', Text, nullable=True)
)


class Exercise(Base):
    """
    Comprehensive exercise library supporting MuscleWiki data.

    Supports:
    - Gender-specific media (male/female demonstration videos/images)
    - Rehab and pain-relief exercises with specific targeting
    - Full i18n support via JSON fields
    - Popularity tracking and discovery features
    """
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Identification
    name = Column(String(200), nullable=False, index=True)
    name_de = Column(String(200), nullable=True)  # German translation
    slug = Column(String(250), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    description_de = Column(Text, nullable=True)

    # Classification
    muscle_group = Column(SQLEnum(MuscleGroup), nullable=False, index=True)
    body_part = Column(SQLEnum(BodyPart), nullable=False, index=True)
    secondary_muscles = Column(JSON, default=list)  # List of MuscleGroup values
    category = Column(SQLEnum(ExerciseCategory), nullable=False, default=ExerciseCategory.STRENGTH, index=True)
    equipment = Column(SQLEnum(Equipment), nullable=False, default=Equipment.BODYWEIGHT, index=True)
    difficulty = Column(SQLEnum(DifficultyLevel), nullable=False, default=DifficultyLevel.INTERMEDIATE, index=True)

    # Gender targeting
    gender = Column(SQLEnum(ExerciseGender), nullable=False, default=ExerciseGender.UNISEX, index=True)

    # Purpose & rehab
    purpose = Column(SQLEnum(ExercisePurpose), nullable=True, index=True)
    pain_focus = Column(SQLEnum(PainFocus), nullable=True, index=True)
    is_rehab = Column(Boolean, default=False, index=True)
    pain_warning = Column(Text, nullable=True)  # Warning text for certain conditions
    contraindications = Column(JSON, default=list)  # List of conditions where exercise should be avoided

    # Movement classification
    force_type = Column(SQLEnum(ForceType), nullable=True)
    movement_pattern = Column(SQLEnum(MovementPattern), nullable=True)
    is_compound = Column(Boolean, default=False, index=True)
    is_unilateral = Column(Boolean, default=False)

    # Media - separate male/female variants
    images_male = Column(JSON, default=list)  # ["url1", "url2"]
    images_female = Column(JSON, default=list)
    videos_male = Column(JSON, default=list)  # ["video_url1"]
    videos_female = Column(JSON, default=list)
    thumbnail_url = Column(String(500), nullable=True)
    gif_url = Column(String(500), nullable=True)

    # Legacy media fields (for backward compatibility)
    video_url = Column(String(500), nullable=True)

    # Instructions - with i18n support
    instructions = Column(JSON, default=list)  # ["Step 1", "Step 2"] or [{"en": "...", "de": "..."}]
    instructions_de = Column(JSON, default=list)
    tips = Column(JSON, default=list)
    tips_de = Column(JSON, default=list)
    common_mistakes = Column(JSON, default=list)
    common_mistakes_de = Column(JSON, default=list)
    form_tips = Column(Text, nullable=True)  # Legacy field

    # Source tracking
    source = Column(String(30), nullable=False, default="system", index=True)  # musclewiki, user, system
    musclewiki_id = Column(String(100), nullable=True, unique=True)  # Original MuscleWiki reference
    external_url = Column(String(500), nullable=True)  # Link to original source

    # Popularity & discovery
    popularity_score = Column(Float, default=0.0, index=True)
    view_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
    is_popular = Column(Boolean, default=False, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    is_new = Column(Boolean, default=False, index=True)  # Newly added exercises

    # Tracking settings
    tracks_weight = Column(Boolean, default=True)
    tracks_reps = Column(Boolean, default=True)
    tracks_time = Column(Boolean, default=False)
    tracks_distance = Column(Boolean, default=False)
    default_sets = Column(Integer, default=3)
    default_reps = Column(Integer, default=10)
    default_rest_seconds = Column(Integer, default=60)

    # Status
    is_active = Column(Boolean, default=True, index=True)
    requires_spotter = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workout_exercises = relationship(
        "WorkoutExercise",
        back_populates="exercise",
        cascade="all, delete-orphan"
    )
    exercise_logs = relationship(
        "ExerciseLog",
        back_populates="exercise",
        cascade="all, delete-orphan"
    )
    saved_by_users = relationship(
        "User",
        secondary=user_saved_exercises,
        backref="saved_exercises"
    )

    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_exercise_discover', 'is_active', 'category', 'body_part', 'gender'),
        Index('ix_exercise_rehab', 'is_rehab', 'pain_focus', 'is_active'),
        Index('ix_exercise_popular', 'is_active', 'is_popular', 'popularity_score'),
        Index('ix_exercise_source', 'source', 'musclewiki_id'),
    )

    def __repr__(self):
        return f"<Exercise(id={self.id}, name='{self.name}', muscle_group='{self.muscle_group.value}')>"

    def get_media(self, gender: str = "male"):
        """Get appropriate media based on gender preference."""
        if gender == "female":
            images = self.images_female if self.images_female else self.images_male
            videos = self.videos_female if self.videos_female else self.videos_male
        else:
            images = self.images_male if self.images_male else self.images_female
            videos = self.videos_male if self.videos_male else self.videos_female
        return {"images": images or [], "videos": videos or []}

    def get_instructions(self, language: str = "en"):
        """Get instructions in specified language."""
        if language == "de" and self.instructions_de:
            return self.instructions_de
        return self.instructions or []


class UserExercise(Base):
    """
    User-created custom exercises.
    These appear ONLY in Train section, not Discover.
    """
    __tablename__ = "user_exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String(250), nullable=False)

    muscle_group = Column(SQLEnum(MuscleGroup), nullable=False)
    body_part = Column(SQLEnum(BodyPart), nullable=False)
    secondary_muscles = Column(JSON, default=list)
    category = Column(SQLEnum(ExerciseCategory), nullable=False, default=ExerciseCategory.STRENGTH)
    equipment = Column(SQLEnum(Equipment), nullable=False, default=Equipment.BODYWEIGHT)
    difficulty = Column(SQLEnum(DifficultyLevel), nullable=False, default=DifficultyLevel.INTERMEDIATE)

    instructions = Column(JSON, default=list)
    tips = Column(JSON, default=list)
    images = Column(JSON, default=list)
    videos = Column(JSON, default=list)

    tracks_weight = Column(Boolean, default=True)
    tracks_reps = Column(Boolean, default=True)
    tracks_time = Column(Boolean, default=False)

    is_public = Column(Boolean, default=False)  # Share with community (future feature)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", backref="custom_exercises")

    __table_args__ = (
        Index('ix_user_exercise_user', 'user_id', 'is_active'),
    )


class ExerciseHistory(Base):
    """
    Track user's exercise performance history.
    Links exercises to workout sessions with detailed performance data.
    """
    __tablename__ = "exercise_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Can reference either system exercise or user exercise
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="SET NULL"), nullable=True)
    user_exercise_id = Column(Integer, ForeignKey("user_exercises.id", ondelete="SET NULL"), nullable=True)
    exercise_name = Column(String(200), nullable=False)  # Denormalized for history preservation

    workout_session_id = Column(Integer, ForeignKey("workout_sessions.id", ondelete="SET NULL"), nullable=True)

    # Performance summary
    sets_completed = Column(Integer, nullable=False, default=0)
    total_reps = Column(Integer, nullable=False, default=0)
    total_volume = Column(Float, nullable=True)  # Total weight x reps
    max_weight = Column(Float, nullable=True)
    avg_weight = Column(Float, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    distance_meters = Column(Float, nullable=True)

    # Detailed set data
    set_details = Column(JSON, default=list)  # [{reps: 10, weight: 50, rpe: 8, rest: 60}, ...]

    # Personal records
    is_pr_weight = Column(Boolean, default=False)
    is_pr_reps = Column(Boolean, default=False)
    is_pr_volume = Column(Boolean, default=False)

    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 how the exercise felt

    performed_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", backref="exercise_history")
    exercise = relationship("Exercise", backref="history_entries")
    user_exercise = relationship("UserExercise", backref="history_entries")

    __table_args__ = (
        Index('ix_exercise_history_user_date', 'user_id', 'performed_at'),
        Index('ix_exercise_history_exercise', 'exercise_id', 'performed_at'),
    )


class ExerciseAlternative(Base):
    """
    Exercise alternatives and variations.
    Helps users find similar exercises or progressions.
    """
    __tablename__ = "exercise_alternatives"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True)
    alternative_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True)

    relationship_type = Column(String(30), nullable=False)  # alternative, progression, regression, variation
    similarity_score = Column(Float, default=0.8)  # How similar the exercises are

    exercise = relationship("Exercise", foreign_keys=[exercise_id], backref="alternatives_from")
    alternative = relationship("Exercise", foreign_keys=[alternative_id], backref="alternatives_to")
