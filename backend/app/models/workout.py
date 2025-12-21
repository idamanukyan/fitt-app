from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class WorkoutType(enum.Enum):
    """Type of workout program"""
    STRENGTH = "strength"
    HYPERTROPHY = "hypertrophy"
    POWERLIFTING = "powerlifting"
    CARDIO = "cardio"
    HIIT = "hiit"
    ENDURANCE = "endurance"
    FLEXIBILITY = "flexibility"
    CROSSFIT = "crossfit"
    BODYWEIGHT = "bodyweight"
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    FULL_BODY = "full_body"
    UPPER_BODY = "upper_body"
    LOWER_BODY = "lower_body"
    PUSH = "push"
    PULL = "pull"
    LEGS = "legs"

class WorkoutTemplate(Base):
    """
    Workout templates - pre-built workout plans created by coaches or admins.

    These are reusable workout programs that users can add to their training.
    """
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Template metadata
    workout_type = Column(SQLEnum(WorkoutType), nullable=False, index=True)
    difficulty_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    duration_minutes = Column(Integer, nullable=True)  # Estimated duration
    calories_burned = Column(Integer, nullable=True)  # Estimated calories

    # Template settings
    is_public = Column(Boolean, default=True)  # Public or private template
    is_premium = Column(Boolean, default=False)  # Premium template
    is_featured = Column(Boolean, default=False)  # Featured on discover page
    is_active = Column(Boolean, default=True)

    # Creator info
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by_coach = Column(Boolean, default=False)

    # Media
    thumbnail_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)

    # Popularity metrics
    times_used = Column(Integer, default=0)
    rating_average = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_user_id])
    template_exercises = relationship(
        "WorkoutTemplateExercise",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="WorkoutTemplateExercise.order_index"
    )
    user_workouts = relationship(
        "UserWorkout",
        back_populates="template",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<WorkoutTemplate(id={self.id}, name='{self.name}')>"


class WorkoutTemplateExercise(Base):
    """
    Exercises in a workout template.

    Defines which exercises are in a template and their configuration (sets, reps, etc.)
    """
    __tablename__ = "workout_template_exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, nullable=False)  # Order in the workout

    # Exercise configuration
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)  # For timed exercises
    rest_seconds = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    template = relationship("WorkoutTemplate", back_populates="template_exercises")
    exercise = relationship("Exercise")

    def __repr__(self):
        return f"<WorkoutTemplateExercise(template_id={self.template_id}, exercise_id={self.exercise_id})>"


class UserWorkout(Base):
    """
    User's personal workout plans.

    Users can create custom workouts or use templates. This tracks their active workout plans.
    """
    __tablename__ = "user_workouts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=True)

    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    workout_type = Column(SQLEnum(WorkoutType), nullable=False)

    # Status
    is_active = Column(Boolean, default=True)
    is_favorite = Column(Boolean, default=False)

    # Stats
    times_completed = Column(Integer, default=0)
    last_completed = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
    template = relationship("WorkoutTemplate", back_populates="user_workouts")
    workout_exercises = relationship(
        "WorkoutExercise",
        back_populates="user_workout",
        cascade="all, delete-orphan",
        order_by="WorkoutExercise.order_index"
    )
    workout_sessions = relationship(
        "WorkoutSession",
        back_populates="user_workout",
        cascade="all, delete-orphan",
        order_by="WorkoutSession.started_at.desc()"
    )

    def __repr__(self):
        return f"<UserWorkout(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class WorkoutExercise(Base):
    """
    Exercises in a user's workout plan.

    Similar to WorkoutTemplateExercise but for user's personal workouts.
    """
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_workout_id = Column(Integer, ForeignKey("user_workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, nullable=False)

    # Exercise configuration
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    user_workout = relationship("UserWorkout", back_populates="workout_exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")

    def __repr__(self):
        return f"<WorkoutExercise(workout_id={self.user_workout_id}, exercise_id={self.exercise_id})>"


class WorkoutSession(Base):
    """
    Individual workout session - tracks when a user completes a workout.

    Each time a user does a workout, a session is created with logs for each exercise.
    """
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_workout_id = Column(Integer, ForeignKey("user_workouts.id"), nullable=True)

    # Session details
    title = Column(String(200), nullable=True)  # Custom title
    notes = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)

    # Session stats
    total_volume = Column(Float, default=0.0)  # Total weight lifted (kg)
    total_reps = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    calories_burned = Column(Integer, nullable=True)

    # Status
    is_completed = Column(Boolean, default=False)
    rating = Column(Integer, nullable=True)  # 1-5 star rating

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    user_workout = relationship("UserWorkout", back_populates="workout_sessions")
    exercise_logs = relationship(
        "ExerciseLog",
        back_populates="workout_session",
        cascade="all, delete-orphan",
        order_by="ExerciseLog.order_index"
    )

    def __repr__(self):
        return f"<WorkoutSession(id={self.id}, user_id={self.user_id}, started_at='{self.started_at}')>"


class ExerciseLog(Base):
    """
    Individual exercise performance logs - tracks sets, reps, weight for each exercise in a session.

    This is the granular tracking of each exercise within a workout session.
    """
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workout_session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    order_index = Column(Integer, nullable=False)

    # Sets performed (JSON array as string)
    # Format: [{"set": 1, "reps": 10, "weight": 50, "completed": true}, ...]
    sets_data = Column(Text, nullable=True)

    # Summary stats
    total_sets = Column(Integer, default=0)
    total_reps = Column(Integer, default=0)
    max_weight = Column(Float, nullable=True)
    total_volume = Column(Float, default=0.0)  # Sum of (weight * reps) for all sets

    # Time tracking (for cardio/timed exercises)
    duration_seconds = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    personal_record = Column(Boolean, default=False)  # PR achieved in this log

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    workout_session = relationship("WorkoutSession", back_populates="exercise_logs")
    exercise = relationship("Exercise", back_populates="exercise_logs")

    def __repr__(self):
        return f"<ExerciseLog(id={self.id}, exercise_id={self.exercise_id}, session_id={self.workout_session_id})>"
