"""
Exercise schemas for API request/response validation.
Supports MuscleWiki data structure with gender variants, rehab, and i18n.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from enum import Enum

from app.models.exercise import (
    MuscleGroup, BodyPart, Equipment, ExerciseCategory,
    DifficultyLevel, ExerciseGender, ExercisePurpose, PainFocus,
    ForceType, MovementPattern
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
    name_de: Optional[str] = Field(None, max_length=200, description="German name")
    description: Optional[str] = Field(None, description="Exercise description")
    description_de: Optional[str] = Field(None, description="German description")

    # Categorization
    muscle_group: MuscleGroup = Field(..., description="Primary muscle group")
    body_part: BodyPart = Field(..., description="Body part")
    secondary_muscles: Optional[List[str]] = Field(default=[], description="Secondary muscles")
    category: ExerciseCategory = Field(default=ExerciseCategory.STRENGTH, description="Exercise category")
    equipment: Equipment = Field(default=Equipment.BODYWEIGHT, description="Required equipment")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE, description="Difficulty level")

    # Gender
    gender: ExerciseGender = Field(default=ExerciseGender.UNISEX, description="Gender targeting")

    # Purpose & Rehab
    purpose: Optional[ExercisePurpose] = Field(None, description="Primary purpose")
    pain_focus: Optional[PainFocus] = Field(None, description="Pain relief focus area")
    is_rehab: bool = Field(default=False, description="Is rehabilitation exercise")
    pain_warning: Optional[str] = Field(None, description="Pain/injury warning")
    contraindications: Optional[List[str]] = Field(default=[], description="Contraindications")

    # Movement
    force_type: Optional[ForceType] = Field(None, description="Force type")
    movement_pattern: Optional[MovementPattern] = Field(None, description="Movement pattern")
    is_compound: bool = Field(default=False, description="Is compound movement")
    is_unilateral: bool = Field(default=False, description="Is unilateral exercise")

    # Media
    images_male: Optional[List[str]] = Field(default=[], description="Male demonstration images")
    images_female: Optional[List[str]] = Field(default=[], description="Female demonstration images")
    videos_male: Optional[List[str]] = Field(default=[], description="Male demonstration videos")
    videos_female: Optional[List[str]] = Field(default=[], description="Female demonstration videos")
    thumbnail_url: Optional[str] = Field(None, max_length=500, description="Thumbnail URL")
    gif_url: Optional[str] = Field(None, max_length=500, description="GIF demonstration URL")

    # Instructions
    instructions: Optional[List[str]] = Field(default=[], description="Step-by-step instructions")
    instructions_de: Optional[List[str]] = Field(default=[], description="German instructions")
    tips: Optional[List[str]] = Field(default=[], description="Exercise tips")
    tips_de: Optional[List[str]] = Field(default=[], description="German tips")
    common_mistakes: Optional[List[str]] = Field(default=[], description="Common mistakes")
    common_mistakes_de: Optional[List[str]] = Field(default=[], description="German mistakes")

    # Source
    source: str = Field(default="system", description="Data source")
    musclewiki_id: Optional[str] = Field(None, description="MuscleWiki reference ID")
    external_url: Optional[str] = Field(None, description="External source URL")

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
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    name_de: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    description_de: Optional[str] = None

    muscle_group: Optional[MuscleGroup] = None
    body_part: Optional[BodyPart] = None
    secondary_muscles: Optional[List[str]] = None
    category: Optional[ExerciseCategory] = None
    equipment: Optional[Equipment] = None
    difficulty: Optional[DifficultyLevel] = None
    gender: Optional[ExerciseGender] = None

    purpose: Optional[ExercisePurpose] = None
    pain_focus: Optional[PainFocus] = None
    is_rehab: Optional[bool] = None
    pain_warning: Optional[str] = None
    contraindications: Optional[List[str]] = None

    force_type: Optional[ForceType] = None
    movement_pattern: Optional[MovementPattern] = None
    is_compound: Optional[bool] = None
    is_unilateral: Optional[bool] = None

    images_male: Optional[List[str]] = None
    images_female: Optional[List[str]] = None
    videos_male: Optional[List[str]] = None
    videos_female: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    gif_url: Optional[str] = None

    instructions: Optional[List[str]] = None
    instructions_de: Optional[List[str]] = None
    tips: Optional[List[str]] = None
    tips_de: Optional[List[str]] = None
    common_mistakes: Optional[List[str]] = None
    common_mistakes_de: Optional[List[str]] = None

    tracks_weight: Optional[bool] = None
    tracks_reps: Optional[bool] = None
    tracks_time: Optional[bool] = None
    tracks_distance: Optional[bool] = None
    default_sets: Optional[int] = Field(None, ge=1, le=10)
    default_reps: Optional[int] = Field(None, ge=1, le=100)
    default_rest_seconds: Optional[int] = Field(None, ge=0, le=600)

    is_popular: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None
    is_active: Optional[bool] = None
    requires_spotter: Optional[bool] = None


# ========== Exercise Response Schemas ==========

class ExerciseMedia(BaseModel):
    """Media container for exercise with gender support."""
    images: List[str] = Field(default=[])
    videos: List[str] = Field(default=[])
    thumbnail: Optional[str] = None
    gif: Optional[str] = None


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
    thumbnail_url: Optional[str]
    source: str

    class Config:
        from_attributes = True


class ExerciseResponse(BaseModel):
    """Full exercise response with all fields."""
    id: int
    name: str
    name_de: Optional[str]
    slug: str
    description: Optional[str]
    description_de: Optional[str]

    # Classification
    muscle_group: MuscleGroup
    body_part: BodyPart
    secondary_muscles: List[str]
    category: ExerciseCategory
    equipment: Equipment
    difficulty: DifficultyLevel
    gender: ExerciseGender

    # Purpose & Rehab
    purpose: Optional[ExercisePurpose]
    pain_focus: Optional[PainFocus]
    is_rehab: bool
    pain_warning: Optional[str]
    contraindications: List[str]

    # Movement
    force_type: Optional[ForceType]
    movement_pattern: Optional[MovementPattern]
    is_compound: bool
    is_unilateral: bool

    # Media - raw
    images_male: List[str]
    images_female: List[str]
    videos_male: List[str]
    videos_female: List[str]
    thumbnail_url: Optional[str]
    gif_url: Optional[str]

    # Instructions
    instructions: List[str]
    instructions_de: List[str]
    tips: List[str]
    tips_de: List[str]
    common_mistakes: List[str]
    common_mistakes_de: List[str]

    # Source
    source: str
    musclewiki_id: Optional[str]
    external_url: Optional[str]

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
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ExerciseDetailResponse(ExerciseResponse):
    """Exercise detail with computed media for specific gender."""
    media: ExerciseMedia = Field(default_factory=ExerciseMedia)
    is_saved: bool = Field(default=False, description="Whether user has saved this exercise")
    alternatives: List[ExerciseSummary] = Field(default=[], description="Alternative exercises")


# ========== List Response ==========

class ExerciseListResponse(BaseModel):
    """Paginated list of exercises."""
    total: int = Field(..., description="Total number of exercises")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total pages")
    exercises: List[ExerciseSummary] = Field(..., description="List of exercises")


class DiscoverSections(BaseModel):
    """Discover page sections with categorized exercises."""
    popular: List[ExerciseSummary] = Field(default=[], description="Popular exercises")
    featured: List[ExerciseSummary] = Field(default=[], description="Featured exercises")
    new_exercises: List[ExerciseSummary] = Field(default=[], description="Newly added")
    stretching: List[ExerciseSummary] = Field(default=[], description="Stretching exercises")
    mobility: List[ExerciseSummary] = Field(default=[], description="Mobility exercises")
    back_pain_relief: List[ExerciseSummary] = Field(default=[], description="Back pain relief")
    female_focused: List[ExerciseSummary] = Field(default=[], description="Female-focused exercises")


# ========== Filter/Search Schemas ==========

class ExerciseFilters(BaseModel):
    """Query parameters for filtering exercises."""
    # Basic filters
    muscle_group: Optional[MuscleGroup] = None
    body_part: Optional[BodyPart] = None
    equipment: Optional[Equipment] = None
    category: Optional[ExerciseCategory] = None
    difficulty: Optional[DifficultyLevel] = None
    gender: Optional[ExerciseGender] = None

    # Purpose & Rehab
    purpose: Optional[ExercisePurpose] = None
    pain_focus: Optional[PainFocus] = None
    is_rehab: Optional[bool] = None

    # Discovery flags
    is_popular: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_compound: Optional[bool] = None

    # Search
    search: Optional[str] = Field(None, description="Search by name/description")

    # Sorting
    sort_by: ExerciseSortField = Field(default=ExerciseSortField.POPULARITY)
    sort_order: SortOrder = Field(default=SortOrder.DESC)

    # Pagination
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")


class RehabFilters(BaseModel):
    """Specialized filters for rehab/pain relief exercises."""
    pain_focus: PainFocus = Field(..., description="Pain area to target")
    difficulty: Optional[DifficultyLevel] = Field(None, description="Max difficulty")
    equipment: Optional[Equipment] = Field(None, description="Available equipment")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=50)


# ========== User Exercise Schemas ==========

class UserExerciseCreate(BaseModel):
    """Schema for user-created exercise."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None

    muscle_group: MuscleGroup
    body_part: BodyPart
    secondary_muscles: Optional[List[str]] = Field(default=[])
    category: ExerciseCategory = Field(default=ExerciseCategory.STRENGTH)
    equipment: Equipment = Field(default=Equipment.BODYWEIGHT)
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE)

    instructions: Optional[List[str]] = Field(default=[])
    tips: Optional[List[str]] = Field(default=[])
    images: Optional[List[str]] = Field(default=[])
    videos: Optional[List[str]] = Field(default=[])

    tracks_weight: bool = Field(default=True)
    tracks_reps: bool = Field(default=True)
    tracks_time: bool = Field(default=False)


class UserExerciseUpdate(BaseModel):
    """Schema for updating user exercise."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    muscle_group: Optional[MuscleGroup] = None
    body_part: Optional[BodyPart] = None
    secondary_muscles: Optional[List[str]] = None
    category: Optional[ExerciseCategory] = None
    equipment: Optional[Equipment] = None
    difficulty: Optional[DifficultyLevel] = None
    instructions: Optional[List[str]] = None
    tips: Optional[List[str]] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    tracks_weight: Optional[bool] = None
    tracks_reps: Optional[bool] = None
    tracks_time: Optional[bool] = None
    is_active: Optional[bool] = None


class UserExerciseResponse(BaseModel):
    """User exercise response."""
    id: int
    user_id: int
    name: str
    slug: str
    description: Optional[str]
    muscle_group: MuscleGroup
    body_part: BodyPart
    secondary_muscles: List[str]
    category: ExerciseCategory
    equipment: Equipment
    difficulty: DifficultyLevel
    instructions: List[str]
    tips: List[str]
    images: List[str]
    videos: List[str]
    tracks_weight: bool
    tracks_reps: bool
    tracks_time: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ========== Exercise History Schemas ==========

class SetDetail(BaseModel):
    """Single set performance data."""
    set_number: int
    reps: int
    weight: Optional[float] = None
    rpe: Optional[int] = Field(None, ge=1, le=10, description="Rate of perceived exertion")
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None


class ExerciseHistoryCreate(BaseModel):
    """Create exercise history entry."""
    exercise_id: Optional[int] = None
    user_exercise_id: Optional[int] = None
    exercise_name: str
    workout_session_id: Optional[int] = None

    sets_completed: int = Field(..., ge=0)
    total_reps: int = Field(..., ge=0)
    total_volume: Optional[float] = None
    max_weight: Optional[float] = None
    duration_seconds: Optional[int] = None
    distance_meters: Optional[float] = None

    set_details: List[SetDetail] = Field(default=[])
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    performed_at: Optional[datetime] = None


class ExerciseHistoryResponse(BaseModel):
    """Exercise history response."""
    id: int
    user_id: int
    exercise_id: Optional[int]
    user_exercise_id: Optional[int]
    exercise_name: str
    workout_session_id: Optional[int]

    sets_completed: int
    total_reps: int
    total_volume: Optional[float]
    max_weight: Optional[float]
    avg_weight: Optional[float]
    duration_seconds: Optional[int]
    distance_meters: Optional[float]

    set_details: List[Dict[str, Any]]
    is_pr_weight: bool
    is_pr_reps: bool
    is_pr_volume: bool

    notes: Optional[str]
    rating: Optional[int]
    performed_at: datetime

    class Config:
        from_attributes = True


# ========== Saved Exercise Schemas ==========

class SaveExerciseRequest(BaseModel):
    """Request to save exercise to user's library."""
    exercise_id: int
    notes: Optional[str] = None


class SavedExerciseResponse(BaseModel):
    """Saved exercise with user notes."""
    exercise: ExerciseSummary
    saved_at: datetime
    notes: Optional[str]


# ========== Train Section Schemas ==========

class TrainOverview(BaseModel):
    """Overview data for Train section."""
    saved_exercises: List[ExerciseSummary] = Field(default=[], description="User's saved exercises")
    custom_exercises: List[UserExerciseResponse] = Field(default=[], description="User-created exercises")
    recent_exercises: List[ExerciseHistoryResponse] = Field(default=[], description="Recently performed")
    total_saved: int = Field(default=0)
    total_custom: int = Field(default=0)


# ========== Bulk Operations ==========

class BulkSaveRequest(BaseModel):
    """Bulk save exercises."""
    exercise_ids: List[int] = Field(..., min_length=1, max_length=50)


class BulkRemoveRequest(BaseModel):
    """Bulk remove saved exercises."""
    exercise_ids: List[int] = Field(..., min_length=1, max_length=50)
