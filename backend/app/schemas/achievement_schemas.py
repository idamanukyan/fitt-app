"""
Achievement Pydantic schemas for request/response validation.

Provides schemas for achievements, user achievements, streaks, and levels.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class AchievementCategoryEnum(str, Enum):
    """Achievement categories."""
    WORKOUT = "workout"
    NUTRITION = "nutrition"
    CONSISTENCY = "consistency"
    SOCIAL = "social"
    PROGRESS = "progress"


# ==================== Achievement Schemas ====================

class AchievementBase(BaseModel):
    """Base achievement schema."""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    category: AchievementCategoryEnum
    icon_name: str = Field(..., min_length=1, max_length=50)  # Ionicons name
    color: str = Field(..., min_length=7, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')  # Hex color
    target_value: int = Field(..., gt=0)
    xp_reward: int = Field(default=100, ge=0)
    is_active: bool = Field(default=True)
    is_hidden: bool = Field(default=False)


class AchievementCreate(AchievementBase):
    """Schema for creating an achievement."""
    pass


class AchievementUpdate(BaseModel):
    """Schema for updating an achievement."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    icon_name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, min_length=7, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    target_value: Optional[int] = Field(None, gt=0)
    xp_reward: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_hidden: Optional[bool] = None


class AchievementResponse(AchievementBase):
    """Schema for achievement response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== User Achievement Schemas ====================

class UserAchievementBase(BaseModel):
    """Base user achievement schema."""
    current_progress: int = Field(default=0, ge=0)
    is_unlocked: bool = Field(default=False)


class UserAchievementProgress(BaseModel):
    """Schema for updating achievement progress."""
    progress: int = Field(..., ge=0)


class UserAchievementResponse(BaseModel):
    """Schema for user achievement response with achievement details."""
    id: int
    user_id: int
    achievement: AchievementResponse
    current_progress: int
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress_percentage: float = Field(default=0.0)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_percentage(cls, user_achievement):
        """Create response with calculated progress percentage."""
        achievement = user_achievement.achievement
        progress_percentage = (
            (user_achievement.current_progress / achievement.target_value * 100)
            if achievement.target_value > 0 else 0.0
        )
        progress_percentage = min(progress_percentage, 100.0)

        data = {
            "id": user_achievement.id,
            "user_id": user_achievement.user_id,
            "achievement": achievement,
            "current_progress": user_achievement.current_progress,
            "is_unlocked": user_achievement.is_unlocked,
            "unlocked_at": user_achievement.unlocked_at,
            "progress_percentage": round(progress_percentage, 2),
            "created_at": user_achievement.created_at,
            "updated_at": user_achievement.updated_at
        }
        return cls(**data)


# ==================== User Streak Schemas ====================

class UserStreakResponse(BaseModel):
    """Schema for user streak response."""
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[date] = None
    total_active_days: int

    class Config:
        from_attributes = True


# ==================== User Level Schemas ====================

class UserLevelResponse(BaseModel):
    """Schema for user level response."""
    level: int
    current_xp: int
    total_xp: int
    xp_to_next_level: int

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_xp_calculation(cls, user_level):
        """Create response with calculated XP to next level."""
        xp_to_next = user_level.xp_to_next_level()

        data = {
            "level": user_level.level,
            "current_xp": user_level.current_xp,
            "total_xp": user_level.total_xp,
            "xp_to_next_level": xp_to_next
        }
        return cls(**data)


# ==================== Combined Stats Schema ====================

class UserStatsResponse(BaseModel):
    """Combined user statistics response."""
    level: UserLevelResponse
    streak: UserStreakResponse
    total_achievements: int
    unlocked_achievements: int
    achievements_percentage: float = Field(default=0.0)

    class Config:
        from_attributes = True


# ==================== Leaderboard Schemas ====================

class LeaderboardEntry(BaseModel):
    """Single leaderboard entry."""
    rank: int
    user_id: int
    username: str
    level: int
    total_xp: int
    current_xp: int


class LeaderboardResponse(BaseModel):
    """Leaderboard response."""
    entries: List[LeaderboardEntry]
    total_users: int


# ==================== Activity Tracking Schema ====================

class ActivityTrackRequest(BaseModel):
    """Schema for tracking user activity."""
    activity_type: str = Field(..., description="Type of activity: workout, meal, photo, measurement")
    activity_count: int = Field(default=1, ge=1, description="Number of activities completed")


# ==================== Achievement Unlock Notification Schema ====================

class AchievementUnlockNotification(BaseModel):
    """Schema for achievement unlock notification."""
    achievement: AchievementResponse
    xp_earned: int
    new_level: Optional[int] = None  # If user leveled up
    message: str
