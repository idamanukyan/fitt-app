from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.services.user_service import UserService
from app.schemas.user_schema_extended import UserOut, UserUpdate, UserStats
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current authenticated user information."""
    service = UserService(db)
    return service.get_user_by_id(current_user.id)


@router.put("/me", response_model=UserOut)
def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    service = UserService(db)
    return service.update_user(current_user.id, update_data)


@router.get("/me/stats", response_model=UserStats)
def get_user_statistics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user statistics (measurements, goals, etc)."""
    service = UserService(db)
    return service.get_user_stats(current_user.id)


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID (public endpoint)."""
    service = UserService(db)
    return service.get_user_by_id(user_id)
