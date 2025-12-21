from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.profile_service import ProfileService
from app.services.goal_service import GoalService
from app.schemas.profile_schema_extended import UserProfileCreate, UserProfileOut
from app.schemas.goal_schema_extended import GoalCreate, GoalOut

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("/profile", response_model=UserProfileOut)
def create_or_update_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update user profile during onboarding."""
    service = ProfileService(db)
    return service.create_or_update_profile(current_user.id, profile_data)


@router.post("/goals", response_model=GoalOut)
def add_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a goal during onboarding."""
    service = GoalService(db)
    return service.create_goal(current_user.id, goal_data)
