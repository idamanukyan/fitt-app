"""
Achievement repository for database operations.

Provides CRUD operations for achievements, user achievements, streaks, and levels.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc
from datetime import datetime, date, timedelta

from app.models.achievement import (
    Achievement,
    UserAchievement,
    UserStreak,
    UserLevel,
    AchievementCategory
)
from app.repositories.base_repository import BaseRepository


class AchievementRepository:
    """Repository for achievement-related database operations."""

    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db

    # ==================== Achievement Operations ====================

    def get_all_achievements(self, category: Optional[AchievementCategory] = None,
                            is_active: bool = True) -> List[Achievement]:
        """
        Get all achievements, optionally filtered by category.

        Args:
            category: Optional category filter
            is_active: Only return active achievements (default: True)

        Returns:
            List of Achievement objects
        """
        query = self.db.query(Achievement)

        if is_active:
            query = query.filter(Achievement.is_active == True)

        if category:
            query = query.filter(Achievement.category == category)

        return query.order_by(Achievement.category, Achievement.target_value).all()

    def get_achievement_by_id(self, achievement_id: int) -> Optional[Achievement]:
        """Get achievement by ID."""
        return self.db.query(Achievement).filter(Achievement.id == achievement_id).first()

    def get_achievement_by_slug(self, slug: str) -> Optional[Achievement]:
        """Get achievement by slug."""
        return self.db.query(Achievement).filter(Achievement.slug == slug).first()

    def create_achievement(self, achievement_data: Dict[str, Any]) -> Achievement:
        """Create a new achievement."""
        achievement = Achievement(**achievement_data)
        self.db.add(achievement)
        self.db.commit()
        self.db.refresh(achievement)
        return achievement

    def update_achievement(self, achievement_id: int, achievement_data: Dict[str, Any]) -> Optional[Achievement]:
        """Update an achievement."""
        achievement = self.get_achievement_by_id(achievement_id)
        if not achievement:
            return None

        for key, value in achievement_data.items():
            if hasattr(achievement, key):
                setattr(achievement, key, value)

        achievement.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(achievement)
        return achievement

    def delete_achievement(self, achievement_id: int) -> bool:
        """Delete an achievement."""
        achievement = self.get_achievement_by_id(achievement_id)
        if not achievement:
            return False

        self.db.delete(achievement)
        self.db.commit()
        return True

    # ==================== User Achievement Operations ====================

    def get_user_achievements(self, user_id: int,
                             category: Optional[AchievementCategory] = None,
                             unlocked_only: bool = False) -> List[UserAchievement]:
        """
        Get user's achievements with achievement details.

        Args:
            user_id: User ID
            category: Optional category filter
            unlocked_only: Only return unlocked achievements

        Returns:
            List of UserAchievement objects with achievement loaded
        """
        query = self.db.query(UserAchievement).options(
            joinedload(UserAchievement.achievement)
        ).filter(UserAchievement.user_id == user_id)

        if unlocked_only:
            query = query.filter(UserAchievement.is_unlocked == True)

        if category:
            query = query.join(Achievement).filter(Achievement.category == category)

        return query.all()

    def get_user_achievement(self, user_id: int, achievement_id: int) -> Optional[UserAchievement]:
        """Get a specific user achievement."""
        return self.db.query(UserAchievement).filter(
            and_(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            )
        ).first()

    def create_user_achievement(self, user_id: int, achievement_id: int) -> UserAchievement:
        """Create a new user achievement entry (initial progress)."""
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id,
            current_progress=0,
            is_unlocked=False
        )
        self.db.add(user_achievement)
        self.db.commit()
        self.db.refresh(user_achievement)
        return user_achievement

    def update_user_achievement_progress(self, user_id: int, achievement_id: int,
                                        progress: int) -> Optional[UserAchievement]:
        """
        Update user achievement progress.

        Args:
            user_id: User ID
            achievement_id: Achievement ID
            progress: New progress value

        Returns:
            Updated UserAchievement or None
        """
        user_achievement = self.get_user_achievement(user_id, achievement_id)

        if not user_achievement:
            # Create if doesn't exist
            user_achievement = self.create_user_achievement(user_id, achievement_id)

        user_achievement.current_progress = progress
        user_achievement.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(user_achievement)
        return user_achievement

    def unlock_achievement(self, user_id: int, achievement_id: int) -> Optional[UserAchievement]:
        """
        Unlock an achievement for a user.

        Args:
            user_id: User ID
            achievement_id: Achievement ID

        Returns:
            Unlocked UserAchievement or None
        """
        user_achievement = self.get_user_achievement(user_id, achievement_id)

        if not user_achievement:
            user_achievement = self.create_user_achievement(user_id, achievement_id)

        if not user_achievement.is_unlocked:
            user_achievement.is_unlocked = True
            user_achievement.unlocked_at = datetime.utcnow()
            user_achievement.updated_at = datetime.utcnow()

            self.db.commit()
            self.db.refresh(user_achievement)

        return user_achievement

    def get_unlocked_count(self, user_id: int) -> int:
        """Get count of unlocked achievements for a user."""
        return self.db.query(UserAchievement).filter(
            and_(
                UserAchievement.user_id == user_id,
                UserAchievement.is_unlocked == True
            )
        ).count()

    # ==================== User Streak Operations ====================

    def get_user_streak(self, user_id: int) -> Optional[UserStreak]:
        """Get user's streak data."""
        return self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()

    def create_user_streak(self, user_id: int) -> UserStreak:
        """Create initial streak entry for user."""
        streak = UserStreak(
            user_id=user_id,
            current_streak=0,
            longest_streak=0,
            total_active_days=0
        )
        self.db.add(streak)
        self.db.commit()
        self.db.refresh(streak)
        return streak

    def update_user_streak(self, user_id: int, activity_date: Optional[date] = None) -> UserStreak:
        """
        Update user's streak based on activity.

        Args:
            user_id: User ID
            activity_date: Date of activity (default: today)

        Returns:
            Updated UserStreak
        """
        if activity_date is None:
            activity_date = date.today()

        streak = self.get_user_streak(user_id)

        if not streak:
            streak = self.create_user_streak(user_id)

        # If no previous activity, start streak
        if not streak.last_activity_date:
            streak.current_streak = 1
            streak.longest_streak = 1
            streak.total_active_days = 1
            streak.last_activity_date = activity_date
        else:
            # Calculate days since last activity
            days_diff = (activity_date - streak.last_activity_date).days

            if days_diff == 0:
                # Same day - no change to streak
                pass
            elif days_diff == 1:
                # Consecutive day - increment streak
                streak.current_streak += 1
                streak.total_active_days += 1
                streak.last_activity_date = activity_date

                # Update longest streak if needed
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
            else:
                # Streak broken - reset to 1
                streak.current_streak = 1
                streak.total_active_days += 1
                streak.last_activity_date = activity_date

        streak.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(streak)
        return streak

    # ==================== User Level Operations ====================

    def get_user_level(self, user_id: int) -> Optional[UserLevel]:
        """Get user's level data."""
        return self.db.query(UserLevel).filter(UserLevel.user_id == user_id).first()

    def create_user_level(self, user_id: int) -> UserLevel:
        """Create initial level entry for user."""
        level = UserLevel(
            user_id=user_id,
            level=1,
            current_xp=0,
            total_xp=0
        )
        self.db.add(level)
        self.db.commit()
        self.db.refresh(level)
        return level

    def add_xp(self, user_id: int, xp_amount: int) -> UserLevel:
        """
        Add XP to user and handle level ups.

        Args:
            user_id: User ID
            xp_amount: Amount of XP to add

        Returns:
            Updated UserLevel
        """
        level = self.get_user_level(user_id)

        if not level:
            level = self.create_user_level(user_id)

        # Add XP
        level.current_xp += xp_amount
        level.total_xp += xp_amount

        # Check for level ups
        while level.current_xp >= level.xp_to_next_level():
            level.current_xp -= level.xp_to_next_level()
            level.level += 1

        level.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(level)
        return level

    # ==================== Leaderboard Operations ====================

    def get_leaderboard(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get top users by level and XP.

        Args:
            limit: Number of users to return

        Returns:
            List of dictionaries with user info and level data
        """
        from app.models.user import User

        results = (
            self.db.query(UserLevel, User)
            .join(User, UserLevel.user_id == User.id)
            .order_by(desc(UserLevel.level), desc(UserLevel.total_xp))
            .limit(limit)
            .all()
        )

        leaderboard = []
        for rank, (user_level, user) in enumerate(results, start=1):
            leaderboard.append({
                "rank": rank,
                "user_id": user.id,
                "username": user.username,
                "level": user_level.level,
                "total_xp": user_level.total_xp,
                "current_xp": user_level.current_xp
            })

        return leaderboard
