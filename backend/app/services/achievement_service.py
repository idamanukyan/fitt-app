"""
Achievement service for business logic.

Provides high-level operations for achievement tracking, unlocking,
XP management, streak tracking, and leaderboard functionality.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date

from app.repositories.achievement_repository import AchievementRepository
from app.models.achievement import AchievementCategory
from app.schemas.achievement_schemas import (
    AchievementResponse,
    UserAchievementResponse,
    UserStatsResponse,
    UserLevelResponse,
    UserStreakResponse,
    LeaderboardResponse,
    LeaderboardEntry,
    AchievementUnlockNotification
)


class AchievementService:
    """Service for achievement-related business logic."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db
        self.repo = AchievementRepository(db)

    # ==================== Achievement Listing ====================

    def list_achievements(self, user_id: Optional[int] = None,
                         category: Optional[AchievementCategory] = None) -> List[Any]:
        """
        List all achievements, optionally with user progress.

        Args:
            user_id: If provided, include user's progress on each achievement
            category: Optional category filter

        Returns:
            List of achievements (with progress if user_id provided)
        """
        achievements = self.repo.get_all_achievements(category=category)

        if user_id is None:
            # Return basic achievement list
            return [AchievementResponse.model_validate(ach) for ach in achievements]

        # Get user's achievement progress
        user_achievements_dict = {}
        user_achievements = self.repo.get_user_achievements(user_id, category=category)

        for ua in user_achievements:
            user_achievements_dict[ua.achievement_id] = ua

        # Build response with user progress
        result = []
        for achievement in achievements:
            if achievement.id in user_achievements_dict:
                # User has progress on this achievement
                ua = user_achievements_dict[achievement.id]
                result.append(UserAchievementResponse.from_orm_with_percentage(ua))
            else:
                # Create empty progress entry for this user
                ua = self.repo.create_user_achievement(user_id, achievement.id)
                result.append(UserAchievementResponse.from_orm_with_percentage(ua))

        return result

    def get_unlocked_achievements(self, user_id: int) -> List[UserAchievementResponse]:
        """
        Get user's unlocked achievements.

        Args:
            user_id: User ID

        Returns:
            List of unlocked user achievements
        """
        user_achievements = self.repo.get_user_achievements(user_id, unlocked_only=True)
        return [UserAchievementResponse.from_orm_with_percentage(ua) for ua in user_achievements]

    # ==================== User Stats ====================

    def get_user_stats(self, user_id: int) -> UserStatsResponse:
        """
        Get comprehensive user statistics.

        Args:
            user_id: User ID

        Returns:
            UserStatsResponse with level, streak, and achievement counts
        """
        # Get or create user level
        user_level = self.repo.get_user_level(user_id)
        if not user_level:
            user_level = self.repo.create_user_level(user_id)

        # Get or create user streak
        user_streak = self.repo.get_user_streak(user_id)
        if not user_streak:
            user_streak = self.repo.create_user_streak(user_id)

        # Get achievement counts
        total_achievements = len(self.repo.get_all_achievements())
        unlocked_count = self.repo.get_unlocked_count(user_id)

        achievements_percentage = (
            (unlocked_count / total_achievements * 100) if total_achievements > 0 else 0.0
        )

        return UserStatsResponse(
            level=UserLevelResponse.from_orm_with_xp_calculation(user_level),
            streak=UserStreakResponse.model_validate(user_streak),
            total_achievements=total_achievements,
            unlocked_achievements=unlocked_count,
            achievements_percentage=round(achievements_percentage, 2)
        )

    # ==================== Activity Tracking ====================

    def track_activity(self, user_id: int, activity_type: str,
                      activity_count: int = 1) -> Dict[str, Any]:
        """
        Track user activity and update relevant achievements and streaks.

        Args:
            user_id: User ID
            activity_type: Type of activity (workout, meal, photo, measurement)
            activity_count: Number of activities completed

        Returns:
            Dictionary with updated stats and any unlocked achievements
        """
        # Update streak
        self.update_streak(user_id)

        # Award base XP for activity
        xp_rewards = {
            "workout": 50,
            "meal": 10,
            "photo": 25,
            "measurement": 15
        }
        base_xp = xp_rewards.get(activity_type, 10)
        old_level = self.repo.get_user_level(user_id)
        old_level_num = old_level.level if old_level else 1

        self.add_xp(user_id, base_xp * activity_count)

        # Check for achievement unlocks
        unlocked = self.check_and_unlock_achievements(user_id, activity_type, activity_count)

        # Get updated stats
        stats = self.get_user_stats(user_id)

        # Check if user leveled up
        leveled_up = stats.level.level > old_level_num

        return {
            "stats": stats,
            "unlocked_achievements": unlocked,
            "leveled_up": leveled_up,
            "new_level": stats.level.level if leveled_up else None,
            "xp_earned": base_xp * activity_count
        }

    def check_and_unlock_achievements(self, user_id: int, activity_type: Optional[str] = None,
                                     activity_count: int = 1) -> List[AchievementUnlockNotification]:
        """
        Check and unlock achievements based on user progress.

        Args:
            user_id: User ID
            activity_type: Type of activity that triggered check
            activity_count: Number of activities completed

        Returns:
            List of newly unlocked achievements
        """
        unlocked_notifications = []

        # Get all achievements
        achievements = self.repo.get_all_achievements()

        for achievement in achievements:
            user_achievement = self.repo.get_user_achievement(user_id, achievement.id)

            if not user_achievement:
                user_achievement = self.repo.create_user_achievement(user_id, achievement.id)

            # Skip if already unlocked
            if user_achievement.is_unlocked:
                continue

            # Update progress based on activity type and achievement category
            should_check = False

            if activity_type == "workout" and achievement.category == AchievementCategory.WORKOUT:
                # Increment workout count
                user_achievement.current_progress += activity_count
                should_check = True
            elif activity_type == "meal" and achievement.category == AchievementCategory.NUTRITION:
                # Increment meal log count
                user_achievement.current_progress += activity_count
                should_check = True
            elif activity_type == "photo" and achievement.category == AchievementCategory.PROGRESS:
                # Increment photo count
                user_achievement.current_progress += activity_count
                should_check = True

            # Check for consistency achievements (streaks)
            if achievement.category == AchievementCategory.CONSISTENCY:
                user_streak = self.repo.get_user_streak(user_id)
                if user_streak:
                    user_achievement.current_progress = user_streak.current_streak
                    should_check = True

            # Check if achievement should be unlocked
            if should_check and user_achievement.current_progress >= achievement.target_value:
                # Unlock achievement
                self.repo.unlock_achievement(user_id, achievement.id)

                # Award XP
                old_level = self.repo.get_user_level(user_id)
                old_level_num = old_level.level if old_level else 1
                self.add_xp(user_id, achievement.xp_reward)
                new_level = self.repo.get_user_level(user_id)
                leveled_up = new_level.level > old_level_num

                # Create notification
                notification = AchievementUnlockNotification(
                    achievement=AchievementResponse.model_validate(achievement),
                    xp_earned=achievement.xp_reward,
                    new_level=new_level.level if leveled_up else None,
                    message=f"Achievement Unlocked: {achievement.name}!"
                )
                unlocked_notifications.append(notification)
            else:
                # Just update progress
                self.repo.update_user_achievement_progress(
                    user_id,
                    achievement.id,
                    user_achievement.current_progress
                )

        return unlocked_notifications

    # ==================== XP Management ====================

    def add_xp(self, user_id: int, amount: int) -> UserLevelResponse:
        """
        Add XP to user and handle level ups.

        Args:
            user_id: User ID
            amount: Amount of XP to add

        Returns:
            Updated user level
        """
        user_level = self.repo.add_xp(user_id, amount)
        return UserLevelResponse.from_orm_with_xp_calculation(user_level)

    # ==================== Streak Management ====================

    def update_streak(self, user_id: int, activity_date: Optional[date] = None) -> UserStreakResponse:
        """
        Update user's activity streak.

        Args:
            user_id: User ID
            activity_date: Date of activity (default: today)

        Returns:
            Updated user streak
        """
        user_streak = self.repo.update_user_streak(user_id, activity_date)
        return UserStreakResponse.model_validate(user_streak)

    # ==================== Leaderboard ====================

    def get_leaderboard(self, limit: int = 50) -> LeaderboardResponse:
        """
        Get top users by level and XP.

        Args:
            limit: Number of users to return (default: 50)

        Returns:
            Leaderboard with ranked users
        """
        leaderboard_data = self.repo.get_leaderboard(limit)

        entries = [LeaderboardEntry(**entry) for entry in leaderboard_data]

        return LeaderboardResponse(
            entries=entries,
            total_users=len(entries)
        )

    # ==================== Admin Operations ====================

    def create_achievement(self, achievement_data: Dict[str, Any]) -> AchievementResponse:
        """
        Create a new achievement (admin only).

        Args:
            achievement_data: Achievement data

        Returns:
            Created achievement
        """
        # Check if slug already exists
        existing = self.repo.get_achievement_by_slug(achievement_data.get("slug"))
        if existing:
            raise HTTPException(status_code=400, detail="Achievement with this slug already exists")

        achievement = self.repo.create_achievement(achievement_data)
        return AchievementResponse.model_validate(achievement)

    def update_achievement(self, achievement_id: int,
                          achievement_data: Dict[str, Any]) -> AchievementResponse:
        """
        Update an achievement (admin only).

        Args:
            achievement_id: Achievement ID
            achievement_data: Updated data

        Returns:
            Updated achievement
        """
        achievement = self.repo.update_achievement(achievement_id, achievement_data)
        if not achievement:
            raise HTTPException(status_code=404, detail="Achievement not found")

        return AchievementResponse.model_validate(achievement)

    def delete_achievement(self, achievement_id: int) -> bool:
        """
        Delete an achievement (admin only).

        Args:
            achievement_id: Achievement ID

        Returns:
            True if deleted, False otherwise
        """
        success = self.repo.delete_achievement(achievement_id)
        if not success:
            raise HTTPException(status_code=404, detail="Achievement not found")

        return True
