"""
Workout schemas for API request/response validation.

Comprehensive Pydantic models for workout templates, user workouts, sessions, and logs.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, validator

from app.models.workout import WorkoutType


# ========== Workout Template Schemas ==========

class WorkoutTemplateExerciseCreate(BaseModel):
    """Exercise configuration for workout template."""
    exercise_id: int = Field(..., description="Exercise ID")
    order_index: int = Field(..., ge=0, description="Order in workout")
    sets: Optional[int] = Field(None, ge=1, le=20, description="Number of sets")
    reps: Optional[int] = Field(None, ge=1, le=100, description="Number of reps")
    duration_seconds: Optional[int] = Field(None, ge=1, description="Duration for timed exercises")
    rest_seconds: Optional[int] = Field(None, ge=0, le=600, description="Rest between sets")
    notes: Optional[str] = Field(None, description="Exercise notes")

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
    description: Optional[str] = Field(None, description="Template description")
    workout_type: WorkoutType = Field(..., description="Workout type")
    difficulty_level: Optional[str] = Field(None, max_length=50, description="Difficulty level")
    duration_minutes: Optional[int] = Field(None, ge=1, le=300, description="Estimated duration")
    calories_burned: Optional[int] = Field(None, ge=0, description="Estimated calories")
    is_public: bool = Field(default=True, description="Is public template")
    is_premium: bool = Field(default=False, description="Is premium template")
    is_featured: bool = Field(default=False, description="Is featured")
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    video_url: Optional[str] = Field(None, max_length=500)
    exercises: List[WorkoutTemplateExerciseCreate] = Field(default_factory=list, description="Template exercises")

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
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    workout_type: Optional[WorkoutType] = None
    difficulty_level: Optional[str] = Field(None, max_length=50)
    duration_minutes: Optional[int] = Field(None, ge=1, le=300)
    calories_burned: Optional[int] = Field(None, ge=0)
    is_public: Optional[bool] = None
    is_premium: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    video_url: Optional[str] = Field(None, max_length=500)


class WorkoutTemplateExerciseResponse(BaseModel):
    """Exercise in template response."""
    id: int
    exercise_id: int
    exercise_name: Optional[str] = None
    order_index: int
    sets: Optional[int]
    reps: Optional[int]
    duration_seconds: Optional[int]
    rest_seconds: Optional[int]
    notes: Optional[str]

    class Config:
        from_attributes = True


class WorkoutTemplateResponse(BaseModel):
    """Workout template response."""
    id: int
    name: str
    slug: str
    description: Optional[str]
    workout_type: WorkoutType
    difficulty_level: Optional[str]
    duration_minutes: Optional[int]
    calories_burned: Optional[int]
    is_public: bool
    is_premium: bool
    is_featured: bool
    is_active: bool
    created_by_user_id: Optional[int]
    created_by_coach: bool
    thumbnail_url: Optional[str]
    video_url: Optional[str]
    times_used: int
    rating_average: float
    rating_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    exercises: List[WorkoutTemplateExerciseResponse] = []

    class Config:
        from_attributes = True


class WorkoutTemplateSummary(BaseModel):
    """Compact template summary."""
    id: int
    name: str
    slug: str
    workout_type: WorkoutType
    difficulty_level: Optional[str]
    duration_minutes: Optional[int]
    is_premium: bool
    is_featured: bool
    thumbnail_url: Optional[str]
    times_used: int
    rating_average: float

    class Config:
        from_attributes = True


class WorkoutTemplateListResponse(BaseModel):
    """Paginated template list."""
    total: int
    page: int
    page_size: int
    templates: List[WorkoutTemplateSummary]


# ========== User Workout Schemas ==========

class WorkoutExerciseCreate(BaseModel):
    """Exercise for user workout."""
    exercise_id: int = Field(..., description="Exercise ID")
    order_index: int = Field(..., ge=0)
    sets: Optional[int] = Field(None, ge=1, le=20)
    reps: Optional[int] = Field(None, ge=1, le=100)
    duration_seconds: Optional[int] = Field(None, ge=1)
    rest_seconds: Optional[int] = Field(None, ge=0, le=600)
    notes: Optional[str] = None

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
    template_id: Optional[int] = Field(None, description="Template to base on")
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    workout_type: WorkoutType
    exercises: List[WorkoutExerciseCreate] = Field(default_factory=list)

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
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    workout_type: Optional[WorkoutType] = None
    is_active: Optional[bool] = None
    is_favorite: Optional[bool] = None


class WorkoutExerciseResponse(BaseModel):
    """Exercise in user workout response."""
    id: int
    exercise_id: int
    exercise_name: Optional[str] = None
    order_index: int
    sets: Optional[int]
    reps: Optional[int]
    duration_seconds: Optional[int]
    rest_seconds: Optional[int]
    notes: Optional[str]

    class Config:
        from_attributes = True


class UserWorkoutResponse(BaseModel):
    """User workout response."""
    id: int
    user_id: int
    template_id: Optional[int]
    name: str
    description: Optional[str]
    workout_type: WorkoutType
    is_active: bool
    is_favorite: bool
    times_completed: int
    last_completed: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    exercises: List[WorkoutExerciseResponse] = []

    class Config:
        from_attributes = True


class UserWorkoutSummary(BaseModel):
    """Compact user workout summary."""
    id: int
    name: str
    workout_type: WorkoutType
    is_favorite: bool
    times_completed: int
    last_completed: Optional[datetime]

    class Config:
        from_attributes = True


class UserWorkoutListResponse(BaseModel):
    """Paginated user workout list."""
    total: int
    page: int
    page_size: int
    workouts: List[UserWorkoutSummary]


# ========== Workout Session Schemas ==========

class SetData(BaseModel):
    """Single set data."""
    set: int = Field(..., ge=1, description="Set number")
    reps: Optional[int] = Field(None, ge=0, description="Reps completed")
    weight: Optional[float] = Field(None, ge=0, description="Weight used (kg)")
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
    sets_data: Optional[str] = Field(None, description="JSON array of set data")
    total_sets: int = Field(default=0, ge=0)
    total_reps: int = Field(default=0, ge=0)
    max_weight: Optional[float] = Field(None, ge=0)
    total_volume: float = Field(default=0.0, ge=0)
    duration_seconds: Optional[int] = Field(None, ge=0)
    distance_km: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
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
    client_id: Optional[str] = Field(None, max_length=100, description="Client-generated UUID for deduplication")
    user_workout_id: Optional[int] = Field(None, description="Associated user workout")
    title: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
    started_at: datetime = Field(..., description="Session start time")
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)
    total_volume: float = Field(default=0.0, ge=0)
    total_reps: int = Field(default=0, ge=0)
    total_exercises: int = Field(default=0, ge=0)
    calories_burned: Optional[int] = Field(None, ge=0)
    is_completed: bool = Field(default=False)
    rating: Optional[int] = Field(None, ge=1, le=5)
    exercise_logs: List[ExerciseLogCreate] = Field(default_factory=list)

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
    title: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)
    total_volume: Optional[float] = Field(None, ge=0)
    total_reps: Optional[int] = Field(None, ge=0)
    total_exercises: Optional[int] = Field(None, ge=0)
    calories_burned: Optional[int] = Field(None, ge=0)
    is_completed: Optional[bool] = None
    rating: Optional[int] = Field(None, ge=1, le=5)


class ExerciseLogResponse(BaseModel):
    """Exercise log response."""
    id: int
    exercise_id: int
    exercise_name: Optional[str] = None
    order_index: int
    sets_data: Optional[str]
    total_sets: int
    total_reps: int
    max_weight: Optional[float]
    total_volume: float
    duration_seconds: Optional[int]
    distance_km: Optional[float]
    notes: Optional[str]
    personal_record: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutSessionResponse(BaseModel):
    """Workout session response."""
    id: int
    user_id: int
    user_workout_id: Optional[int]
    client_id: Optional[str] = None
    title: Optional[str]
    notes: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_minutes: Optional[int]
    total_volume: float
    total_reps: int
    total_exercises: int
    calories_burned: Optional[int]
    is_completed: bool
    rating: Optional[int]
    created_at: datetime
    exercise_logs: List[ExerciseLogResponse] = []

    class Config:
        from_attributes = True


class WorkoutSessionSummary(BaseModel):
    """Compact session summary."""
    id: int
    title: Optional[str]
    started_at: datetime
    duration_minutes: Optional[int]
    total_exercises: int
    total_volume: float
    is_completed: bool
    rating: Optional[int]

    class Config:
        from_attributes = True


class WorkoutSessionListResponse(BaseModel):
    """Paginated session list."""
    total: int
    page: int
    page_size: int
    sessions: List[WorkoutSessionSummary]


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
    favorite_muscle_group: Optional[str]
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
