"""
Achievement routes for gamification system.

Provides endpoints for listing achievements, tracking user progress,
managing streaks, levels, and leaderboard.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user, get_current_coach_or_admin
from app.models.user import User
from app.models.achievement import AchievementCategory
from app.services.achievement_service import AchievementService
from app.schemas.achievement_schemas import (
    AchievementCreate,
    AchievementUpdate,
    AchievementResponse,
    UserAchievementResponse,
    UserStatsResponse,
    LeaderboardResponse,
    ActivityTrackRequest,
    AchievementCategoryEnum
)


router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


# ==================== Public/User Endpoints ====================

@router.get("", response_model=list)
def list_achievements(
    category: Optional[AchievementCategoryEnum] = Query(None, description="Filter by category"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all achievements.

    If authenticated, includes user's progress on each achievement.
    If not authenticated, returns basic achievement list.
    """
    service = AchievementService(db)

    # Convert enum to model enum if provided
    category_filter = None
    if category:
        category_filter = AchievementCategory(category.value)

    user_id = current_user.id if current_user else None
    achievements = service.list_achievements(user_id=user_id, category=category_filter)

    return achievements


@router.get("/user", response_model=UserStatsResponse)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's achievement statistics.

    Returns level, XP, streak, and achievement counts.
    Requires authentication.
    """
    service = AchievementService(db)
    return service.get_user_stats(current_user.id)


@router.get("/user/unlocked", response_model=list[UserAchievementResponse])
def get_unlocked_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's unlocked achievements.

    Returns only achievements the user has completed.
    Requires authentication.
    """
    service = AchievementService(db)
    return service.get_unlocked_achievements(current_user.id)


@router.post("/track", status_code=status.HTTP_200_OK)
def track_activity(
    activity_data: ActivityTrackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Track user activity and check for achievement unlocks.

    Supports activity types: workout, meal, photo, measurement.
    Updates streak, awards XP, and checks for newly unlocked achievements.

    Requires authentication.
    """
    service = AchievementService(db)

    # Validate activity type
    valid_types = ["workout", "meal", "photo", "measurement"]
    if activity_data.activity_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid activity type. Must be one of: {', '.join(valid_types)}"
        )

    result = service.track_activity(
        user_id=current_user.id,
        activity_type=activity_data.activity_type,
        activity_count=activity_data.activity_count
    )

    return {
        "message": "Activity tracked successfully",
        "stats": result["stats"],
        "unlocked_achievements": result["unlocked_achievements"],
        "leveled_up": result["leveled_up"],
        "new_level": result["new_level"],
        "xp_earned": result["xp_earned"]
    }


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    limit: int = Query(50, ge=1, le=100, description="Number of top users to return"),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard of top users by level and XP.

    Public endpoint - no authentication required.
    Returns ranked list of users with their levels and XP.
    """
    service = AchievementService(db)
    return service.get_leaderboard(limit=limit)


# ==================== Admin Endpoints ====================

@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    achievement_data: AchievementCreate,
    current_user: User = Depends(get_current_coach_or_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new achievement.

    Admin only endpoint for creating achievements.
    Requires admin role.
    """
    service = AchievementService(db)

    try:
        achievement = service.create_achievement(achievement_data.model_dump())
        return achievement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create achievement: {str(e)}")


@router.put("/{achievement_id}", response_model=AchievementResponse)
def update_achievement(
    achievement_id: int,
    achievement_data: AchievementUpdate,
    current_user: User = Depends(get_current_coach_or_admin),
    db: Session = Depends(get_db)
):
    """
    Update an existing achievement.

    Admin only endpoint for updating achievements.
    Requires admin role.
    """
    service = AchievementService(db)

    # Only include non-None fields
    update_data = achievement_data.model_dump(exclude_unset=True)

    try:
        achievement = service.update_achievement(achievement_id, update_data)
        return achievement
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update achievement: {str(e)}")


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    achievement_id: int,
    current_user: User = Depends(get_current_coach_or_admin),
    db: Session = Depends(get_db)
):
    """
    Delete an achievement.

    Admin only endpoint for deleting achievements.
    Requires admin role.
    WARNING: This will also delete all user progress on this achievement.
    """
    service = AchievementService(db)

    try:
        service.delete_achievement(achievement_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete achievement: {str(e)}")
