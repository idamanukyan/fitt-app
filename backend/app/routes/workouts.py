"""
Workout routes for templates, user workouts, and sessions.

Complete workout management with CRUD operations for all workout entities.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user, get_current_coach_or_admin
from app.models.user import User
from app.models.workout import WorkoutType
from app.services.workout_service import WorkoutService
from app.schemas.workout_schemas import (
    WorkoutTemplateCreate,
    WorkoutTemplateUpdate,
    WorkoutTemplateResponse,
    WorkoutTemplateListResponse,
    UserWorkoutCreate,
    UserWorkoutUpdate,
    UserWorkoutResponse,
    UserWorkoutListResponse,
    WorkoutSessionCreate,
    WorkoutSessionUpdate,
    WorkoutSessionResponse,
    WorkoutSessionListResponse,
    WorkoutStats
)


router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


# ========== Workout Templates ==========

@router.get("/templates", response_model=WorkoutTemplateListResponse)
def list_workout_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    workout_type: Optional[WorkoutType] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get list of public workout templates.

    Returns paginated list of workout templates with filters.
    Only public templates are shown to all users.
    """
    service = WorkoutService(db)
    return service.list_templates(
        page=page,
        page_size=page_size,
        workout_type=workout_type,
        is_featured=is_featured,
        is_public=True
    )


@router.get("/templates/{template_id}", response_model=WorkoutTemplateResponse)
def get_workout_template(
    template_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a workout template.

    Returns complete template details including all exercises.
    """
    service = WorkoutService(db)
    return service.get_template_by_id(template_id)


@router.post("/templates", response_model=WorkoutTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_workout_template(
    template_data: WorkoutTemplateCreate,
    current_user: User = Depends(get_current_coach_or_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new workout template (Coach/Admin only).

    Coaches and admins can create workout templates that can be shared with users.
    Templates can be marked as public, premium, or featured.
    """
    service = WorkoutService(db)
    is_coach = current_user.role.value in ['coach', 'admin']
    return service.create_template(
        template_data,
        created_by_user_id=current_user.id,
        is_coach=is_coach
    )


@router.put("/templates/{template_id}", response_model=WorkoutTemplateResponse)
def update_workout_template(
    template_id: int,
    update_data: WorkoutTemplateUpdate,
    current_user: User = Depends(get_current_coach_or_admin),
    db: Session = Depends(get_db)
):
    """
    Update a workout template (Coach/Admin only, must be creator).

    Only the creator of the template can update it.
    """
    service = WorkoutService(db)
    return service.update_template(template_id, update_data, current_user.id)


@router.delete("/templates/{template_id}", status_code=status.HTTP_200_OK)
def delete_workout_template(
    template_id: int,
    current_user: User = Depends(get_current_coach_or_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a workout template (Coach/Admin only, must be creator).

    Performs a soft delete. Only the creator can delete their templates.
    """
    service = WorkoutService(db)
    return service.delete_template(template_id, current_user.id)


# ========== User Workouts ==========

@router.get("/my-workouts", response_model=UserWorkoutListResponse)
def list_my_workouts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's workout plans.

    Returns all workout plans created by or assigned to the current user.
    Can filter by active status and favorites.
    """
    service = WorkoutService(db)
    return service.list_user_workouts(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        is_active=is_active,
        is_favorite=is_favorite
    )


@router.get("/my-workouts/{workout_id}", response_model=UserWorkoutResponse)
def get_my_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific user workout.

    Returns complete workout details including all exercises and configuration.
    """
    service = WorkoutService(db)
    return service.get_user_workout(current_user.id, workout_id)


@router.post("/my-workouts", response_model=UserWorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_my_workout(
    workout_data: UserWorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new personal workout plan.

    Users can create custom workout plans or base them on templates.
    If based on a template, exercises are copied to the user's workout.
    """
    service = WorkoutService(db)
    return service.create_user_workout(current_user.id, workout_data)


@router.put("/my-workouts/{workout_id}", response_model=UserWorkoutResponse)
def update_my_workout(
    workout_id: int,
    update_data: UserWorkoutUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a user workout plan.

    Update workout details like name, description, or favorite status.
    """
    service = WorkoutService(db)
    return service.update_user_workout(current_user.id, workout_id, update_data)


@router.delete("/my-workouts/{workout_id}", status_code=status.HTTP_200_OK)
def delete_my_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a user workout plan.

    Permanently deletes the workout plan and all associated data.
    """
    service = WorkoutService(db)
    return service.delete_user_workout(current_user.id, workout_id)


# ========== Workout Sessions ==========

@router.get("/sessions", response_model=WorkoutSessionListResponse)
def list_my_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_completed: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's workout sessions (workout history).

    Returns all workout sessions ordered by most recent first.
    Can filter by completion status.
    """
    service = WorkoutService(db)
    return service.list_sessions(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        is_completed=is_completed
    )


@router.get("/sessions/{session_id}", response_model=WorkoutSessionResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific workout session.

    Returns complete session details including all exercise logs with sets, reps, and weights.
    """
    service = WorkoutService(db)
    return service.get_session(current_user.id, session_id)


@router.post("/sessions", response_model=WorkoutSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: WorkoutSessionCreate,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a completed workout session.

    Create a workout session to track a completed workout.
    Includes all exercise logs with sets, reps, weights, and other performance data.
    Returns 201 for new sessions, 200 for deduplicated sessions (same client_id).
    """
    service = WorkoutService(db)
    session_response, is_new = service.create_session(current_user.id, session_data)
    if not is_new:
        response.status_code = status.HTTP_200_OK
    return session_response


@router.put("/sessions/{session_id}", response_model=WorkoutSessionResponse)
def update_session(
    session_id: int,
    update_data: WorkoutSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a workout session.

    Update session details like notes, rating, or completion status.
    Useful for updating in-progress sessions.
    """
    service = WorkoutService(db)
    return service.update_session(current_user.id, session_id, update_data)


# ========== Statistics ==========

@router.get("/stats", response_model=WorkoutStats)
def get_workout_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's workout statistics.

    Returns comprehensive statistics including:
    - Total workouts and sessions
    - Total volume lifted
    - Total reps completed
    - Average workout duration
    - Total workout time
    """
    service = WorkoutService(db)
    return service.get_workout_stats(current_user.id)
