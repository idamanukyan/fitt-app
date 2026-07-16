"""
Exercise schemas for API request/response validation.
Supports MuscleWiki data structure with gender variants, rehab, and i18n.
"""
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.models.exercise import (
    BodyPart,
    DifficultyLevel,
    Equipment,
    ExerciseCategory,
    ExerciseGender,
    ExercisePurpose,
    ForceType,
    MovementPattern,
    MuscleGroup,
    PainFocus,
)

# ========== Enums for API ==========

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ExerciseSortField(str, Enum):
    NAME = "name"
    POPULARITY = "popularity_score"
    CREATED = "created_at"
    DIFFICULTY = "difficulty"


# ========== Exercise Create/Update Schemas ==========

class ExerciseCreate(BaseModel):
    """Schema for creating a new exercise."""
    name: str = Field(..., min_length=1, max_length=200, description="Exercise name")
    name_de: str | None = Field(None, max_length=200, description="German name")
    description: str | None = Field(None, description="Exercise description")
    description_de: str | None = Field(None, description="German description")

    # Categorization
    muscle_group: MuscleGroup = Field(..., description="Primary muscle group")
    body_part: BodyPart = Field(..., description="Body part")
    secondary_muscles: list[str] | None = Field(default=[], description="Secondary muscles")
    category: ExerciseCategory = Field(default=ExerciseCategory.STRENGTH, description="Exercise category")
    equipment: Equipment = Field(default=Equipment.BODYWEIGHT, description="Required equipment")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE, description="Difficulty level")

    # Gender
    gender: ExerciseGender = Field(default=ExerciseGender.UNISEX, description="Gender targeting")

    # Purpose & Rehab
    purpose: ExercisePurpose | None = Field(None, description="Primary purpose")
    pain_focus: PainFocus | None = Field(None, description="Pain relief focus area")
    is_rehab: bool = Field(default=False, description="Is rehabilitation exercise")
    pain_warning: str | None = Field(None, description="Pain/injury warning")
    contraindications: list[str] | None = Field(default=[], description="Contraindications")

    # Movement
    force_type: ForceType | None = Field(None, description="Force type")
    movement_pattern: MovementPattern | None = Field(None, description="Movement pattern")
    is_compound: bool = Field(default=False, description="Is compound movement")
    is_unilateral: bool = Field(default=False, description="Is unilateral exercise")

    # Media
    images_male: list[str] | None = Field(default=[], description="Male demonstration images")
    images_female: list[str] | None = Field(default=[], description="Female demonstration images")
    videos_male: list[str] | None = Field(default=[], description="Male demonstration videos")
    videos_female: list[str] | None = Field(default=[], description="Female demonstration videos")
    thumbnail_url: str | None = Field(None, max_length=500, description="Thumbnail URL")
    gif_url: str | None = Field(None, max_length=500, description="GIF demonstration URL")

    # Instructions
    instructions: list[str] | None = Field(default=[], description="Step-by-step instructions")
    instructions_de: list[str] | None = Field(default=[], description="German instructions")
    tips: list[str] | None = Field(default=[], description="Exercise tips")
    tips_de: list[str] | None = Field(default=[], description="German tips")
    common_mistakes: list[str] | None = Field(default=[], description="Common mistakes")
    common_mistakes_de: list[str] | None = Field(default=[], description="German mistakes")

    # Source
    source: str = Field(default="system", description="Data source")
    musclewiki_id: str | None = Field(None, description="MuscleWiki reference ID")
    external_url: str | None = Field(None, description="External source URL")

    # Tracking
    tracks_weight: bool = Field(default=True)
    tracks_reps: bool = Field(default=True)
    tracks_time: bool = Field(default=False)
    tracks_distance: bool = Field(default=False)
    default_sets: int = Field(default=3, ge=1, le=10)
    default_reps: int = Field(default=10, ge=1, le=100)
    default_rest_seconds: int = Field(default=60, ge=0, le=600)

    # Flags
    is_popular: bool = Field(default=False)
    is_featured: bool = Field(default=False)
    is_new: bool = Field(default=False)
    requires_spotter: bool = Field(default=False)

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Exercise name cannot be empty')
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Barbell Bench Press",
                "muscle_group": "chest",
                "body_part": "chest",
                "secondary_muscles": ["triceps", "shoulders"],
                "category": "strength",
                "equipment": "barbell",
                "difficulty": "intermediate",
                "gender": "unisex",
                "is_compound": True,
                "instructions": ["Lie on bench", "Grip barbell", "Lower to chest", "Press up"],
                "tips": ["Keep elbows at 45 degrees"],
                "images_male": ["https://musclewiki.com/bench-press-m.jpg"],
                "images_female": ["https://musclewiki.com/bench-press-f.jpg"]
            }
        }


class ExerciseUpdate(BaseModel):
    """Schema for updating an existing exercise. All fields optional."""
    name: str | None = Field(None, min_length=1, max_length=200)
    name_de: str | None = Field(None, max_length=200)
    description: str | None = None
    description_de: str | None = None

    muscle_group: MuscleGroup | None = None
    body_part: BodyPart | None = None
    secondary_muscles: list[str] | None = None
    category: ExerciseCategory | None = None
    equipment: Equipment | None = None
    difficulty: DifficultyLevel | None = None
    gender: ExerciseGender | None = None

    purpose: ExercisePurpose | None = None
    pain_focus: PainFocus | None = None
    is_rehab: bool | None = None
    pain_warning: str | None = None
    contraindications: list[str] | None = None

    force_type: ForceType | None = None
    movement_pattern: MovementPattern | None = None
    is_compound: bool | None = None
    is_unilateral: bool | None = None

    images_male: list[str] | None = None
    images_female: list[str] | None = None
    videos_male: list[str] | None = None
    videos_female: list[str] | None = None
    thumbnail_url: str | None = None
    gif_url: str | None = None

    instructions: list[str] | None = None
    instructions_de: list[str] | None = None
    tips: list[str] | None = None
    tips_de: list[str] | None = None
    common_mistakes: list[str] | None = None
    common_mistakes_de: list[str] | None = None

    tracks_weight: bool | None = None
    tracks_reps: bool | None = None
    tracks_time: bool | None = None
    tracks_distance: bool | None = None
    default_sets: int | None = Field(None, ge=1, le=10)
    default_reps: int | None = Field(None, ge=1, le=100)
    default_rest_seconds: int | None = Field(None, ge=0, le=600)

    is_popular: bool | None = None
    is_featured: bool | None = None
    is_new: bool | None = None
    is_active: bool | None = None
    requires_spotter: bool | None = None


# ========== Exercise Response Schemas ==========

class ExerciseMedia(BaseModel):
    """Media container for exercise with gender support."""
    images: list[str] = Field(default=[])
    videos: list[str] = Field(default=[])
    thumbnail: str | None = None
    gif: str | None = None


class ExerciseSummary(BaseModel):
    """Compact exercise summary for list views."""
    id: int
    name: str
    slug: str
    muscle_group: MuscleGroup
    body_part: BodyPart
    equipment: Equipment
    difficulty: DifficultyLevel
    category: ExerciseCategory
    gender: ExerciseGender
    is_popular: bool
    is_featured: bool
    is_rehab: bool
    thumbnail_url: str | None
    source: str

    class Config:
        from_attributes = True


class ExerciseResponse(BaseModel):
    """Full exercise response with all fields."""
    id: int
    name: str
    name_de: str | None
    slug: str
    description: str | None
    description_de: str | None

    # Classification
    muscle_group: MuscleGroup
    body_part: BodyPart
    secondary_muscles: list[str]
    category: ExerciseCategory
    equipment: Equipment
    difficulty: DifficultyLevel
    gender: ExerciseGender

    # Purpose & Rehab
    purpose: ExercisePurpose | None
    pain_focus: PainFocus | None
    is_rehab: bool
    pain_warning: str | None
    contraindications: list[str]

    # Movement
    force_type: ForceType | None
    movement_pattern: MovementPattern | None
    is_compound: bool
    is_unilateral: bool

    # Media - raw
    images_male: list[str]
    images_female: list[str]
    videos_male: list[str]
    videos_female: list[str]
    thumbnail_url: str | None
    gif_url: str | None

    # Instructions
    instructions: list[str]
    instructions_de: list[str]
    tips: list[str]
    tips_de: list[str]
    common_mistakes: list[str]
    common_mistakes_de: list[str]

    # Source
    source: str
    musclewiki_id: str | None
    external_url: str | None

    # Stats
    popularity_score: float
    view_count: int
    save_count: int
    is_popular: bool
    is_featured: bool
    is_new: bool

    # Tracking
    tracks_weight: bool
    tracks_reps: bool
    tracks_time: bool
    tracks_distance: bool
    default_sets: int
    default_reps: int
    default_rest_seconds: int

    # Status
    is_active: bool
    requires_spotter: bool

    # Timestamps
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class ExerciseDetailResponse(ExerciseResponse):
    """Exercise detail with computed media for specific gender."""
    media: ExerciseMedia = Field(default_factory=ExerciseMedia)
    is_saved: bool = Field(default=False, description="Whether user has saved this exercise")
    alternatives: list[ExerciseSummary] = Field(default=[], description="Alternative exercises")


# ========== List Response ==========

class ExerciseListResponse(BaseModel):
    """Paginated list of exercises."""
    total: int = Field(..., description="Total number of exercises")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total pages")
    exercises: list[ExerciseSummary] = Field(..., description="List of exercises")


class DiscoverSections(BaseModel):
    """Discover page sections with categorized exercises."""
    popular: list[ExerciseSummary] = Field(default=[], description="Popular exercises")
    featured: list[ExerciseSummary] = Field(default=[], description="Featured exercises")
    new_exercises: list[ExerciseSummary] = Field(default=[], description="Newly added")
    stretching: list[ExerciseSummary] = Field(default=[], description="Stretching exercises")
    mobility: list[ExerciseSummary] = Field(default=[], description="Mobility exercises")
    back_pain_relief: list[ExerciseSummary] = Field(default=[], description="Back pain relief")
    female_focused: list[ExerciseSummary] = Field(default=[], description="Female-focused exercises")


# ========== Filter/Search Schemas ==========

class ExerciseFilters(BaseModel):
    """Query parameters for filtering exercises."""
    # Basic filters
    muscle_group: MuscleGroup | None = None
    body_part: BodyPart | None = None
    equipment: Equipment | None = None
    category: ExerciseCategory | None = None
    difficulty: DifficultyLevel | None = None
    gender: ExerciseGender | None = None

    # Purpose & Rehab
    purpose: ExercisePurpose | None = None
    pain_focus: PainFocus | None = None
    is_rehab: bool | None = None

    # Discovery flags
    is_popular: bool | None = None
    is_featured: bool | None = None
    is_compound: bool | None = None

    # Search
    search: str | None = Field(None, description="Search by name/description")

    # Sorting
    sort_by: ExerciseSortField = Field(default=ExerciseSortField.POPULARITY)
    sort_order: SortOrder = Field(default=SortOrder.DESC)

    # Pagination
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")


class RehabFilters(BaseModel):
    """Specialized filters for rehab/pain relief exercises."""
    pain_focus: PainFocus = Field(..., description="Pain area to target")
    difficulty: DifficultyLevel | None = Field(None, description="Max difficulty")
    equipment: Equipment | None = Field(None, description="Available equipment")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=50)


# ========== User Exercise Schemas ==========

class UserExerciseCreate(BaseModel):
    """Schema for user-created exercise."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None

    muscle_group: MuscleGroup
    body_part: BodyPart
    secondary_muscles: list[str] | None = Field(default=[])
    category: ExerciseCategory = Field(default=ExerciseCategory.STRENGTH)
    equipment: Equipment = Field(default=Equipment.BODYWEIGHT)
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE)

    instructions: list[str] | None = Field(default=[])
    tips: list[str] | None = Field(default=[])
    images: list[str] | None = Field(default=[])
    videos: list[str] | None = Field(default=[])

    tracks_weight: bool = Field(default=True)
    tracks_reps: bool = Field(default=True)
    tracks_time: bool = Field(default=False)


class UserExerciseUpdate(BaseModel):
    """Schema for updating user exercise."""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    muscle_group: MuscleGroup | None = None
    body_part: BodyPart | None = None
    secondary_muscles: list[str] | None = None
    category: ExerciseCategory | None = None
    equipment: Equipment | None = None
    difficulty: DifficultyLevel | None = None
    instructions: list[str] | None = None
    tips: list[str] | None = None
    images: list[str] | None = None
    videos: list[str] | None = None
    tracks_weight: bool | None = None
    tracks_reps: bool | None = None
    tracks_time: bool | None = None
    is_active: bool | None = None


class UserExerciseResponse(BaseModel):
    """User exercise response."""
    id: int
    user_id: int
    name: str
    slug: str
    description: str | None
    muscle_group: MuscleGroup
    body_part: BodyPart
    secondary_muscles: list[str]
    category: ExerciseCategory
    equipment: Equipment
    difficulty: DifficultyLevel
    instructions: list[str]
    tips: list[str]
    images: list[str]
    videos: list[str]
    tracks_weight: bool
    tracks_reps: bool
    tracks_time: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


# ========== Exercise History Schemas ==========

class SetDetail(BaseModel):
    """Single set performance data."""
    set_number: int
    reps: int
    weight: float | None = None
    rpe: int | None = Field(None, ge=1, le=10, description="Rate of perceived exertion")
    rest_seconds: int | None = None
    notes: str | None = None


class ExerciseHistoryCreate(BaseModel):
    """Create exercise history entry."""
    exercise_id: int | None = None
    user_exercise_id: int | None = None
    exercise_name: str
    workout_session_id: int | None = None

    sets_completed: int = Field(..., ge=0)
    total_reps: int = Field(..., ge=0)
    total_volume: float | None = None
    max_weight: float | None = None
    duration_seconds: int | None = None
    distance_meters: float | None = None

    set_details: list[SetDetail] = Field(default=[])
    notes: str | None = None
    rating: int | None = Field(None, ge=1, le=5)
    performed_at: datetime | None = None


class ExerciseHistoryResponse(BaseModel):
    """Exercise history response."""
    id: int
    user_id: int
    exercise_id: int | None
    user_exercise_id: int | None
    exercise_name: str
    workout_session_id: int | None

    sets_completed: int
    total_reps: int
    total_volume: float | None
    max_weight: float | None
    avg_weight: float | None
    duration_seconds: int | None
    distance_meters: float | None

    set_details: list[dict[str, Any]]
    is_pr_weight: bool
    is_pr_reps: bool
    is_pr_volume: bool

    notes: str | None
    rating: int | None
    performed_at: datetime

    class Config:
        from_attributes = True


# ========== Saved Exercise Schemas ==========

class SaveExerciseRequest(BaseModel):
    """Request to save exercise to user's library."""
    exercise_id: int
    notes: str | None = None


class SavedExerciseResponse(BaseModel):
    """Saved exercise with user notes."""
    exercise: ExerciseSummary
    saved_at: datetime
    notes: str | None


# ========== Train Section Schemas ==========

class TrainOverview(BaseModel):
    """Overview data for Train section."""
    saved_exercises: list[ExerciseSummary] = Field(default=[], description="User's saved exercises")
    custom_exercises: list[UserExerciseResponse] = Field(default=[], description="User-created exercises")
    recent_exercises: list[ExerciseHistoryResponse] = Field(default=[], description="Recently performed")
    total_saved: int = Field(default=0)
    total_custom: int = Field(default=0)


# ========== Bulk Operations ==========

class BulkSaveRequest(BaseModel):
    """Bulk save exercises."""
    exercise_ids: list[int] = Field(..., min_length=1, max_length=50)


class BulkRemoveRequest(BaseModel):
    """Bulk remove saved exercises."""
    exercise_ids: list[int] = Field(..., min_length=1, max_length=50)
