"""
Goal routes.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.goal_service import GoalService
from app.schemas.goal_schema_extended import GoalCreate, GoalUpdate, GoalProgressUpdate, GoalOut

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.post("/", response_model=GoalOut)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new fitness goal."""
    service = GoalService(db)
    return service.create_goal(current_user.id, goal_data)


@router.get("/", response_model=List[GoalOut])
def get_goals(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all goals for current user."""
    service = GoalService(db)
    return service.get_goals(current_user.id, skip, limit)


@router.get("/active", response_model=List[GoalOut])
def get_active_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active (not completed) goals."""
    service = GoalService(db)
    return service.get_active_goals(current_user.id)


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific goal."""
    service = GoalService(db)
    return service.get_goal_by_id(current_user.id, goal_id)


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    update_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a goal."""
    service = GoalService(db)
    return service.update_goal(current_user.id, goal_id, update_data)


@router.put("/{goal_id}/progress", response_model=GoalOut)
def update_goal_progress(
    goal_id: int,
    progress_data: GoalProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update goal progress."""
    service = GoalService(db)
    return service.update_progress(current_user.id, goal_id, progress_data)


@router.post("/{goal_id}/complete", response_model=GoalOut)
def complete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a goal as completed."""
    service = GoalService(db)
    return service.complete_goal(current_user.id, goal_id)


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a goal."""
    service = GoalService(db)
    service.delete_goal(current_user.id, goal_id)
    return {"message": "Goal deleted successfully"}
