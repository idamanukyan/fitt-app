"""
Admin routes for user management and system administration.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_admin_user
from app.models.user import User
from app.models.role import UserRole
from app.schemas.auth_schema_enhanced import UserOut, RoleUpdateRequest

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserOut])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None, description="Filter by role: user, coach, admin"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all users with pagination and filters.

    **Admin access required.**

    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum number of records to return (default: 100, max: 1000)
    - **role**: Filter by role (user, coach, admin)
    - **is_active**: Filter by active status

    Returns list of users with their information.
    """
    query = db.query(User)

    # Apply filters
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}"
            )

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    # Apply pagination
    users = query.offset(skip).limit(limit).all()

    return [UserOut.model_validate(user) for user in users]


@router.get("/users/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get specific user by ID.

    **Admin access required.**

    Returns detailed user information.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserOut.model_validate(user)


@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_data: RoleUpdateRequest,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update user's role.

    **Admin access required.**

    - **role**: New role (user, coach, admin)

    When changing to COACH role, a coach profile will be automatically created.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update role
    old_role = user.role
    user.role = role_data.role
    db.commit()
    db.refresh(user)

    # If changed to COACH, create coach profile
    if role_data.role == UserRole.COACH and old_role != UserRole.COACH:
        from app.models.coach import CoachProfile
        coach_profile = db.query(CoachProfile).filter(CoachProfile.user_id == user_id).first()
        if not coach_profile:
            coach_profile = CoachProfile(user_id=user_id)
            db.add(coach_profile)
            db.commit()

    return UserOut.model_validate(user)


@router.put("/users/{user_id}/activate", response_model=UserOut)
def activate_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Activate a user account.

    **Admin access required.**

    Sets is_active to True for the specified user.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = True
    db.commit()
    db.refresh(user)

    return UserOut.model_validate(user)


@router.put("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate a user account (soft delete).

    **Admin access required.**

    Sets is_active to False. User cannot login but data is preserved.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deactivating themselves
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )

    user.is_active = False
    db.commit()
    db.refresh(user)

    return UserOut.model_validate(user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete a user and all associated data.

    **Admin access required.**
    **⚠️ WARNING: This action is irreversible!**

    Deletes user and all related data (profile, goals, measurements, etc.)
    due to cascade delete settings.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return {"message": f"User {user_id} deleted successfully"}


@router.get("/stats")
def get_system_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get system statistics.

    **Admin access required.**

    Returns:
    - Total users count
    - Users by role
    - Active vs inactive users
    """
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = total_users - active_users

    users_by_role = {}
    for role in UserRole:
        count = db.query(User).filter(User.role == role).count()
        users_by_role[role.value] = count

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "users_by_role": users_by_role
    }
