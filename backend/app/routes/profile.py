"""
Profile routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.profile_service import ProfileService
from app.schemas.profile_schema_extended import UserProfileCreate, UserProfileUpdate, UserProfileOut

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/me", response_model=UserProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile."""
    service = ProfileService(db)
    return service.get_profile(current_user.id)


@router.post("/me", response_model=UserProfileOut)
def create_or_update_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user profile."""
    service = ProfileService(db)
    return service.create_or_update_profile(current_user.id, profile_data)


@router.put("/me", response_model=UserProfileOut)
def update_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile."""
    service = ProfileService(db)
    return service.update_profile(current_user.id, update_data)
