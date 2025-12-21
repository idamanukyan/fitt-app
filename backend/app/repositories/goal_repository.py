"""
User Goal repository for database operations.

Handles all database queries related to UserGoal entity.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user_goal import UserGoal
from app.repositories.base_repository import BaseRepository


class GoalRepository(BaseRepository[UserGoal]):
    """Repository for UserGoal entity operations."""

    def __init__(self, db: Session):
        super().__init__(UserGoal, db)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserGoal]:
        """Get all goals for a user."""
        return (
            self.db.query(UserGoal)
            .filter(UserGoal.user_id == user_id)
            .order_by(desc(UserGoal.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_active_goals(self, user_id: int) -> List[UserGoal]:
        """Get all active (not completed) goals for a user."""
        return (
            self.db.query(UserGoal)
            .filter(UserGoal.user_id == user_id, UserGoal.is_active == True, UserGoal.is_completed == False)
            .order_by(desc(UserGoal.created_at))
            .all()
        )

    def get_completed_goals(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserGoal]:
        """Get all completed goals for a user."""
        return (
            self.db.query(UserGoal)
            .filter(UserGoal.user_id == user_id, UserGoal.is_completed == True)
            .order_by(desc(UserGoal.completed_date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_goal_type(self, user_id: int, goal_type: str) -> List[UserGoal]:
        """Get goals by type for a user."""
        return (
            self.db.query(UserGoal)
            .filter(UserGoal.user_id == user_id, UserGoal.goal_type == goal_type)
            .order_by(desc(UserGoal.created_at))
            .all()
        )

    def create_goal(self, user_id: int, goal_data: dict) -> UserGoal:
        """Create a new goal for a user."""
        goal_data['user_id'] = user_id
        return self.create(goal_data)

    def mark_completed(self, goal_id: int) -> Optional[UserGoal]:
        """Mark a goal as completed."""
        goal = self.get_by_id(goal_id)
        if not goal:
            return None

        goal.is_completed = True
        goal.is_active = False
        goal.completed_date = datetime.utcnow()
        goal.progress_percentage = 100.0
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def update_progress(self, goal_id: int, current_value: float, progress_percentage: float) -> Optional[UserGoal]:
        """Update goal progress."""
        goal = self.get_by_id(goal_id)
        if not goal:
            return None

        goal.current_value = current_value
        goal.progress_percentage = min(progress_percentage, 100.0)

        # Auto-complete if reached 100%
        if goal.progress_percentage >= 100.0:
            goal.is_completed = True
            goal.is_active = False
            goal.completed_date = datetime.utcnow()

        self.db.commit()
        self.db.refresh(goal)
        return goal

    def count_active_goals(self, user_id: int) -> int:
        """Count active goals for a user."""
        return (
            self.db.query(UserGoal)
            .filter(UserGoal.user_id == user_id, UserGoal.is_active == True, UserGoal.is_completed == False)
            .count()
        )

    def count_completed_goals(self, user_id: int) -> int:
        """Count completed goals for a user."""
        return self.db.query(UserGoal).filter(UserGoal.user_id == user_id, UserGoal.is_completed == True).count()
