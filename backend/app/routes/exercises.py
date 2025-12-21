"""
Exercise routes for Discover and Train sections.
Comprehensive API for MuscleWiki-based exercise library.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user, get_current_admin_user, get_optional_user
from app.models.user import User
from app.models.exercise import (
    MuscleGroup, BodyPart, Equipment, ExerciseCategory,
    DifficultyLevel, ExerciseGender, ExercisePurpose, PainFocus
)
from app.services.exercise_service import ExerciseService
from app.schemas.exercise_schemas import (
    ExerciseCreate, ExerciseUpdate, ExerciseResponse, ExerciseSummary,
    ExerciseListResponse, ExerciseFilters, ExerciseDetailResponse,
    DiscoverSections, RehabFilters, SortOrder, ExerciseSortField,
    UserExerciseCreate, UserExerciseUpdate, UserExerciseResponse,
    ExerciseHistoryCreate, ExerciseHistoryResponse,
    TrainOverview, SaveExerciseRequest, BulkSaveRequest, BulkRemoveRequest
)


router = APIRouter(prefix="/api/exercises", tags=["Exercises"])


# ==================== DISCOVER SECTION ====================

@router.get("/discover", response_model=DiscoverSections)
def get_discover_sections(
    gender_preference: str = Query("male", description="Gender preference for media"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get all discovery sections for the Discover screen.

    Returns categorized exercise lists:
    - Popular exercises
    - Featured exercises
    - Newly added
    - Stretching & mobility
    - Back pain relief
    - Female-focused exercises

    Used by mobile Discover screen for initial load.
    """
    service = ExerciseService(db)
    user_id = current_user.id if current_user else None
    return service.get_discover_sections(user_id=user_id, gender_preference=gender_preference)


@router.get("/search", response_model=ExerciseListResponse)
def search_exercises(
    # Basic filters
    muscle_group: Optional[MuscleGroup] = Query(None, description="Filter by muscle group"),
    body_part: Optional[BodyPart] = Query(None, description="Filter by body part"),
    equipment: Optional[Equipment] = Query(None, description="Filter by equipment"),
    category: Optional[ExerciseCategory] = Query(None, description="Filter by category"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty"),
    gender: Optional[ExerciseGender] = Query(None, description="Filter by gender"),

    # Purpose & Rehab
    purpose: Optional[ExercisePurpose] = Query(None, description="Filter by purpose"),
    pain_focus: Optional[PainFocus] = Query(None, description="Filter by pain focus area"),
    is_rehab: Optional[bool] = Query(None, description="Filter rehab exercises"),

    # Discovery flags
    is_popular: Optional[bool] = Query(None, description="Filter popular exercises"),
    is_featured: Optional[bool] = Query(None, description="Filter featured exercises"),
    is_compound: Optional[bool] = Query(None, description="Filter compound movements"),

    # Search & Sort
    search: Optional[str] = Query(None, description="Search by name/description"),
    sort_by: ExerciseSortField = Query(ExerciseSortField.POPULARITY, description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order"),

    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),

    db: Session = Depends(get_db)
):
    """
    Search and filter exercises with comprehensive options.

    Supports filtering by:
    - Muscle group, body part, equipment
    - Category (strength, stretching, mobility, rehab)
    - Difficulty level
    - Gender (male, female, unisex)
    - Purpose (hypertrophy, strength, rehab, pain relief)
    - Pain focus area (lower back, neck, knees, etc.)

    Sorting options:
    - popularity_score (default)
    - name
    - created_at
    - difficulty

    Returns paginated results.
    """
    service = ExerciseService(db)
    filters = ExerciseFilters(
        muscle_group=muscle_group,
        body_part=body_part,
        equipment=equipment,
        category=category,
        difficulty=difficulty,
        gender=gender,
        purpose=purpose,
        pain_focus=pain_focus,
        is_rehab=is_rehab,
        is_popular=is_popular,
        is_featured=is_featured,
        is_compound=is_compound,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    return service.search_exercises(filters)


@router.get("/rehab/{pain_focus}", response_model=ExerciseListResponse)
def get_rehab_exercises(
    pain_focus: PainFocus = Path(..., description="Pain area to target"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Max difficulty level"),
    equipment: Optional[Equipment] = Query(None, description="Available equipment"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get rehabilitation exercises for specific pain/injury area.

    Pain focus areas:
    - lower_back, upper_back, neck
    - knees, shoulders, hips
    - ankles, wrists, elbows

    Returns exercises suitable for rehabilitation and pain relief.
    """
    service = ExerciseService(db)
    filters = RehabFilters(
        pain_focus=pain_focus,
        difficulty=difficulty,
        equipment=equipment,
        page=page,
        page_size=page_size
    )
    return service.get_rehab_exercises(filters)


@router.get("/by-muscle/{muscle_group}", response_model=List[ExerciseSummary])
def get_by_muscle_group(
    muscle_group: MuscleGroup,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get exercises for a specific muscle group."""
    service = ExerciseService(db)
    filters = ExerciseFilters(muscle_group=muscle_group, page_size=limit)
    result = service.search_exercises(filters)
    return result.exercises


@router.get("/by-body-part/{body_part}", response_model=List[ExerciseSummary])
def get_by_body_part(
    body_part: BodyPart,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get exercises for a body part (chest, back, legs, etc.)."""
    service = ExerciseService(db)
    filters = ExerciseFilters(body_part=body_part, page_size=limit)
    result = service.search_exercises(filters)
    return result.exercises


@router.get("/by-equipment/{equipment}", response_model=List[ExerciseSummary])
def get_by_equipment(
    equipment: Equipment,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get exercises for specific equipment."""
    service = ExerciseService(db)
    filters = ExerciseFilters(equipment=equipment, page_size=limit)
    result = service.search_exercises(filters)
    return result.exercises


@router.get("/by-category/{category}", response_model=List[ExerciseSummary])
def get_by_category(
    category: ExerciseCategory,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get exercises by category (strength, stretching, mobility, rehab)."""
    service = ExerciseService(db)
    filters = ExerciseFilters(category=category, page_size=limit)
    result = service.search_exercises(filters)
    return result.exercises


# ==================== EXERCISE DETAIL ====================

@router.get("/{exercise_id}", response_model=ExerciseDetailResponse)
def get_exercise(
    exercise_id: int,
    gender: str = Query("male", description="Gender for media selection"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific exercise.

    Returns:
    - Full exercise details with instructions, tips, common mistakes
    - Media (images/videos) based on gender preference
    - Whether exercise is saved by current user
    - Alternative exercises

    Increments view count for popularity tracking.
    """
    service = ExerciseService(db)
    user_id = current_user.id if current_user else None
    return service.get_exercise_by_id(exercise_id, user_id=user_id)


@router.get("/slug/{slug}", response_model=ExerciseDetailResponse)
def get_exercise_by_slug(
    slug: str,
    gender: str = Query("male", description="Gender for media selection"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get exercise by URL-friendly slug."""
    service = ExerciseService(db)
    user_id = current_user.id if current_user else None
    return service.get_exercise_by_slug(slug, user_id=user_id)


# ==================== TRAIN SECTION (USER-SCOPED) ====================

@router.get("/train/overview", response_model=TrainOverview)
def get_train_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overview for Train section - USER-SCOPED ONLY.

    Returns:
    - User's saved exercises
    - User's custom exercises
    - Recent exercise history
    - Counts

    This endpoint ONLY returns exercises the user has:
    - Saved from Discover
    - Created themselves
    - Recently performed

    NO global/random exercises are included.
    """
    service = ExerciseService(db)
    return service.get_train_overview(current_user.id)


@router.get("/train/saved", response_model=List[ExerciseSummary])
def get_saved_exercises(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved exercises."""
    service = ExerciseService(db)
    return service.get_saved_exercises(current_user.id)


@router.post("/train/save", status_code=status.HTTP_201_CREATED)
def save_exercise(
    request: SaveExerciseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save an exercise to user's Train library.

    Exercise will appear in Train section after saving.
    """
    service = ExerciseService(db)
    return service.save_exercise(current_user.id, request.exercise_id, request.notes)


@router.delete("/train/save/{exercise_id}")
def unsave_exercise(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove exercise from user's saved library.

    Exercise will no longer appear in Train section.
    Does NOT affect global exercise in Discover.
    """
    service = ExerciseService(db)
    return service.unsave_exercise(current_user.id, exercise_id)


@router.post("/train/save/bulk", status_code=status.HTTP_201_CREATED)
def bulk_save_exercises(
    request: BulkSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk save multiple exercises."""
    service = ExerciseService(db)
    saved = 0
    for exercise_id in request.exercise_ids:
        try:
            service.save_exercise(current_user.id, exercise_id)
            saved += 1
        except:
            pass
    return {"message": f"Saved {saved} exercises", "saved": saved}


@router.delete("/train/save/bulk")
def bulk_unsave_exercises(
    request: BulkRemoveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk remove saved exercises."""
    service = ExerciseService(db)
    removed = 0
    for exercise_id in request.exercise_ids:
        try:
            service.unsave_exercise(current_user.id, exercise_id)
            removed += 1
        except:
            pass
    return {"message": f"Removed {removed} exercises", "removed": removed}


# ==================== USER CUSTOM EXERCISES ====================

@router.get("/train/custom", response_model=List[UserExerciseResponse])
def get_user_exercises(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's custom exercises."""
    service = ExerciseService(db)
    return service.get_user_exercises(current_user.id)


@router.post("/train/custom", response_model=UserExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_user_exercise(
    data: UserExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a custom exercise.

    Custom exercises are:
    - Visible ONLY in Train section
    - NOT visible in Discover (unless marked public)
    - Owned by the creating user
    """
    service = ExerciseService(db)
    return service.create_user_exercise(current_user.id, data)


@router.put("/train/custom/{exercise_id}", response_model=UserExerciseResponse)
def update_user_exercise(
    exercise_id: int,
    data: UserExerciseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a user's custom exercise."""
    service = ExerciseService(db)
    return service.update_user_exercise(current_user.id, exercise_id, data)


@router.delete("/train/custom/{exercise_id}")
def delete_user_exercise(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a user's custom exercise (soft delete)."""
    service = ExerciseService(db)
    return service.delete_user_exercise(current_user.id, exercise_id)


# ==================== EXERCISE HISTORY ====================

@router.get("/history", response_model=List[ExerciseHistoryResponse])
def get_exercise_history(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's recent exercise history."""
    service = ExerciseService(db)
    return service.get_recent_exercise_history(current_user.id, limit=limit)


@router.get("/history/{exercise_id}", response_model=List[ExerciseHistoryResponse])
def get_single_exercise_history(
    exercise_id: int,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get history for a specific exercise."""
    service = ExerciseService(db)
    return service.get_exercise_history(current_user.id, exercise_id, limit=limit)


@router.post("/history", response_model=ExerciseHistoryResponse, status_code=status.HTTP_201_CREATED)
def log_exercise_history(
    data: ExerciseHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log exercise performance history.

    Records:
    - Sets, reps, weight, volume
    - Duration (for timed exercises)
    - Personal records (PRs)
    - Notes and ratings
    """
    service = ExerciseService(db)
    return service.log_exercise_history(current_user.id, data)


# ==================== ADMIN OPERATIONS ====================

@router.post("", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise_data: ExerciseCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new exercise (Admin only)."""
    service = ExerciseService(db)
    return service.create_exercise(exercise_data)


@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: int,
    update_data: ExerciseUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an exercise (Admin only)."""
    service = ExerciseService(db)
    return service.update_exercise(exercise_id, update_data)


@router.delete("/{exercise_id}", status_code=status.HTTP_200_OK)
def delete_exercise(
    exercise_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an exercise (Admin only, soft delete)."""
    service = ExerciseService(db)
    return service.delete_exercise(exercise_id)


@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_exercises(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Seed database with MuscleWiki exercise data (Admin only).

    Creates ~50+ exercises from curated MuscleWiki dataset.
    Skips existing exercises to avoid duplicates.
    """
    service = ExerciseService(db)
    return service.seed_from_musclewiki()


# ==================== LEGACY ENDPOINTS (Backward Compatibility) ====================

@router.get("", response_model=ExerciseListResponse)
def list_exercises(
    muscle_group: Optional[MuscleGroup] = Query(None),
    equipment: Optional[Equipment] = Query(None),
    difficulty: Optional[DifficultyLevel] = Query(None),
    is_popular: Optional[bool] = Query(None),
    is_compound: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Legacy endpoint - redirects to search."""
    service = ExerciseService(db)
    filters = ExerciseFilters(
        muscle_group=muscle_group,
        equipment=equipment,
        difficulty=difficulty,
        is_popular=is_popular,
        is_compound=is_compound,
        search=search,
        page=page,
        page_size=page_size
    )
    return service.search_exercises(filters)
