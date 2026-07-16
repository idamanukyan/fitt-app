"""
Workout schemas for API request/response validation.

Comprehensive Pydantic models for workout templates, user workouts, sessions, and logs.
"""
from datetime import datetime

from pydantic import BaseModel, Field, validator

from app.models.workout import WorkoutType

# ========== Workout Template Schemas ==========

class WorkoutTemplateExerciseCreate(BaseModel):
    """Exercise configuration for workout template."""
    exercise_id: int = Field(..., description="Exercise ID")
    order_index: int = Field(..., ge=0, description="Order in workout")
    sets: int | None = Field(None, ge=1, le=20, description="Number of sets")
    reps: int | None = Field(None, ge=1, le=100, description="Number of reps")
    duration_seconds: int | None = Field(None, ge=1, description="Duration for timed exercises")
    rest_seconds: int | None = Field(None, ge=0, le=600, description="Rest between sets")
    notes: str | None = Field(None, description="Exercise notes")

    class Config:
        json_schema_extra = {
            "example": {
                "exercise_id": 1,
                "order_index": 0,
                "sets": 3,
                "reps": 10,
                "rest_seconds": 60,
                "notes": "Focus on form"
            }
        }


class WorkoutTemplateCreate(BaseModel):
    """Create workout template."""
    name: str = Field(..., min_length=1, max_length=200, description="Template name")
    description: str | None = Field(None, description="Template description")
    workout_type: WorkoutType = Field(..., description="Workout type")
    difficulty_level: str | None = Field(None, max_length=50, description="Difficulty level")
    duration_minutes: int | None = Field(None, ge=1, le=300, description="Estimated duration")
    calories_burned: int | None = Field(None, ge=0, description="Estimated calories")
    is_public: bool = Field(default=True, description="Is public template")
    is_premium: bool = Field(default=False, description="Is premium template")
    is_featured: bool = Field(default=False, description="Is featured")
    thumbnail_url: str | None = Field(None, max_length=500)
    video_url: str | None = Field(None, max_length=500)
    exercises: list[WorkoutTemplateExerciseCreate] = Field(default_factory=list, description="Template exercises")

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Template name cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Push Day - Intermediate",
                "description": "Complete push workout for chest, shoulders, triceps",
                "workout_type": "push",
                "difficulty_level": "intermediate",
                "duration_minutes": 60,
                "calories_burned": 350,
                "is_public": True,
                "exercises": [
                    {
                        "exercise_id": 1,
                        "order_index": 0,
                        "sets": 4,
                        "reps": 8,
                        "rest_seconds": 90
                    }
                ]
            }
        }


class WorkoutTemplateUpdate(BaseModel):
    """Update workout template."""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    workout_type: WorkoutType | None = None
    difficulty_level: str | None = Field(None, max_length=50)
    duration_minutes: int | None = Field(None, ge=1, le=300)
    calories_burned: int | None = Field(None, ge=0)
    is_public: bool | None = None
    is_premium: bool | None = None
    is_featured: bool | None = None
    is_active: bool | None = None
    thumbnail_url: str | None = Field(None, max_length=500)
    video_url: str | None = Field(None, max_length=500)


class WorkoutTemplateExerciseResponse(BaseModel):
    """Exercise in template response."""
    id: int
    exercise_id: int
    exercise_name: str | None = None
    order_index: int
    sets: int | None
    reps: int | None
    duration_seconds: int | None
    rest_seconds: int | None
    notes: str | None

    class Config:
        from_attributes = True


class WorkoutTemplateResponse(BaseModel):
    """Workout template response."""
    id: int
    name: str
    slug: str
    description: str | None
    workout_type: WorkoutType
    difficulty_level: str | None
    duration_minutes: int | None
    calories_burned: int | None
    is_public: bool
    is_premium: bool
    is_featured: bool
    is_active: bool
    created_by_user_id: int | None
    created_by_coach: bool
    thumbnail_url: str | None
    video_url: str | None
    times_used: int
    rating_average: float
    rating_count: int
    created_at: datetime
    updated_at: datetime | None
    exercises: list[WorkoutTemplateExerciseResponse] = []

    class Config:
        from_attributes = True


class WorkoutTemplateSummary(BaseModel):
    """Compact template summary."""
    id: int
    name: str
    slug: str
    workout_type: WorkoutType
    difficulty_level: str | None
    duration_minutes: int | None
    is_premium: bool
    is_featured: bool
    thumbnail_url: str | None
    times_used: int
    rating_average: float

    class Config:
        from_attributes = True


class WorkoutTemplateListResponse(BaseModel):
    """Paginated template list."""
    total: int
    page: int
    page_size: int
    templates: list[WorkoutTemplateSummary]


# ========== User Workout Schemas ==========

class WorkoutExerciseCreate(BaseModel):
    """Exercise for user workout."""
    exercise_id: int = Field(..., description="Exercise ID")
    order_index: int = Field(..., ge=0)
    sets: int | None = Field(None, ge=1, le=20)
    reps: int | None = Field(None, ge=1, le=100)
    duration_seconds: int | None = Field(None, ge=1)
    rest_seconds: int | None = Field(None, ge=0, le=600)
    notes: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "exercise_id": 1,
                "order_index": 0,
                "sets": 3,
                "reps": 10,
                "rest_seconds": 60
            }
        }


class UserWorkoutCreate(BaseModel):
    """Create user workout."""
    template_id: int | None = Field(None, description="Template to base on")
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    workout_type: WorkoutType
    exercises: list[WorkoutExerciseCreate] = Field(default_factory=list)

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Workout name cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "name": "My Custom Push Day",
                "description": "Personal push workout",
                "workout_type": "push",
                "exercises": [
                    {
                        "exercise_id": 1,
                        "order_index": 0,
                        "sets": 4,
                        "reps": 8
                    }
                ]
            }
        }


class UserWorkoutUpdate(BaseModel):
    """Update user workout."""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    workout_type: WorkoutType | None = None
    is_active: bool | None = None
    is_favorite: bool | None = None


class WorkoutExerciseResponse(BaseModel):
    """Exercise in user workout response."""
    id: int
    exercise_id: int
    exercise_name: str | None = None
    order_index: int
    sets: int | None
    reps: int | None
    duration_seconds: int | None
    rest_seconds: int | None
    notes: str | None

    class Config:
        from_attributes = True


class UserWorkoutResponse(BaseModel):
    """User workout response."""
    id: int
    user_id: int
    template_id: int | None
    name: str
    description: str | None
    workout_type: WorkoutType
    is_active: bool
    is_favorite: bool
    times_completed: int
    last_completed: datetime | None
    created_at: datetime
    updated_at: datetime | None
    exercises: list[WorkoutExerciseResponse] = []

    class Config:
        from_attributes = True


class UserWorkoutSummary(BaseModel):
    """Compact user workout summary."""
    id: int
    name: str
    workout_type: WorkoutType
    is_favorite: bool
    times_completed: int
    last_completed: datetime | None

    class Config:
        from_attributes = True


class UserWorkoutListResponse(BaseModel):
    """Paginated user workout list."""
    total: int
    page: int
    page_size: int
    workouts: list[UserWorkoutSummary]


# ========== Workout Session Schemas ==========

class SetData(BaseModel):
    """Single set data."""
    set: int = Field(..., ge=1, description="Set number")
    reps: int | None = Field(None, ge=0, description="Reps completed")
    weight: float | None = Field(None, ge=0, description="Weight used (kg)")
    completed: bool = Field(default=True, description="Set completed")

    class Config:
        json_schema_extra = {
            "example": {
                "set": 1,
                "reps": 10,
                "weight": 100.0,
                "completed": True
            }
        }


class ExerciseLogCreate(BaseModel):
    """Create exercise log for session."""
    exercise_id: int = Field(..., description="Exercise ID")
    order_index: int = Field(..., ge=0)
    sets_data: str | None = Field(None, description="JSON array of set data")
    total_sets: int = Field(default=0, ge=0)
    total_reps: int = Field(default=0, ge=0)
    max_weight: float | None = Field(None, ge=0)
    total_volume: float = Field(default=0.0, ge=0)
    duration_seconds: int | None = Field(None, ge=0)
    distance_km: float | None = Field(None, ge=0)
    notes: str | None = None
    personal_record: bool = Field(default=False)

    class Config:
        json_schema_extra = {
            "example": {
                "exercise_id": 1,
                "order_index": 0,
                "sets_data": '[{"set": 1, "reps": 10, "weight": 100, "completed": true}]',
                "total_sets": 3,
                "total_reps": 30,
                "max_weight": 100.0,
                "total_volume": 3000.0
            }
        }


class WorkoutSessionCreate(BaseModel):
    """Create workout session."""
    client_id: str | None = Field(None, max_length=100, description="Client-generated UUID for deduplication")
    user_workout_id: int | None = Field(None, description="Associated user workout")
    title: str | None = Field(None, max_length=200)
    notes: str | None = None
    started_at: datetime = Field(..., description="Session start time")
    ended_at: datetime | None = None
    duration_minutes: int | None = Field(None, ge=0)
    total_volume: float = Field(default=0.0, ge=0)
    total_reps: int = Field(default=0, ge=0)
    total_exercises: int = Field(default=0, ge=0)
    calories_burned: int | None = Field(None, ge=0)
    is_completed: bool = Field(default=False)
    rating: int | None = Field(None, ge=1, le=5)
    exercise_logs: list[ExerciseLogCreate] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "user_workout_id": 1,
                "title": "Morning Push Workout",
                "started_at": "2024-01-15T10:00:00",
                "ended_at": "2024-01-15T11:00:00",
                "duration_minutes": 60,
                "is_completed": True,
                "rating": 5,
                "exercise_logs": [
                    {
                        "exercise_id": 1,
                        "order_index": 0,
                        "total_sets": 3,
                        "total_reps": 30,
                        "max_weight": 100.0,
                        "total_volume": 3000.0
                    }
                ]
            }
        }


class WorkoutSessionUpdate(BaseModel):
    """Update workout session."""
    title: str | None = Field(None, max_length=200)
    notes: str | None = None
    ended_at: datetime | None = None
    duration_minutes: int | None = Field(None, ge=0)
    total_volume: float | None = Field(None, ge=0)
    total_reps: int | None = Field(None, ge=0)
    total_exercises: int | None = Field(None, ge=0)
    calories_burned: int | None = Field(None, ge=0)
    is_completed: bool | None = None
    rating: int | None = Field(None, ge=1, le=5)


class ExerciseLogResponse(BaseModel):
    """Exercise log response."""
    id: int
    exercise_id: int
    exercise_name: str | None = None
    order_index: int
    sets_data: str | None
    total_sets: int
    total_reps: int
    max_weight: float | None
    total_volume: float
    duration_seconds: int | None
    distance_km: float | None
    notes: str | None
    personal_record: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutSessionResponse(BaseModel):
    """Workout session response."""
    id: int
    user_id: int
    user_workout_id: int | None
    client_id: str | None = None
    title: str | None
    notes: str | None
    started_at: datetime
    ended_at: datetime | None
    duration_minutes: int | None
    total_volume: float
    total_reps: int
    total_exercises: int
    calories_burned: int | None
    is_completed: bool
    rating: int | None
    created_at: datetime
    exercise_logs: list[ExerciseLogResponse] = []

    class Config:
        from_attributes = True


class WorkoutSessionSummary(BaseModel):
    """Compact session summary."""
    id: int
    title: str | None
    started_at: datetime
    duration_minutes: int | None
    total_exercises: int
    total_volume: float
    is_completed: bool
    rating: int | None

    class Config:
        from_attributes = True


class WorkoutSessionListResponse(BaseModel):
    """Paginated session list."""
    total: int
    page: int
    page_size: int
    sessions: list[WorkoutSessionSummary]


# ========== Statistics Schemas ==========

class WorkoutStats(BaseModel):
    """User workout statistics."""
    total_workouts: int
    total_sessions: int
    completed_sessions: int
    total_volume_kg: float
    total_reps: int
    total_exercises: int
    average_duration_minutes: float
    favorite_muscle_group: str | None
    total_workout_time_minutes: int

    class Config:
        json_schema_extra = {
            "example": {
                "total_workouts": 5,
                "total_sessions": 25,
                "completed_sessions": 23,
                "total_volume_kg": 50000.0,
                "total_reps": 5000,
                "total_exercises": 150,
                "average_duration_minutes": 62.5,
                "favorite_muscle_group": "chest",
                "total_workout_time_minutes": 1500
            }
        }
