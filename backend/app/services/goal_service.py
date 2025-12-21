"""
Goal service with business logic.
"""
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.goal_repository import GoalRepository
from app.repositories.user_repository import UserRepository
from app.schemas.goal_schema_extended import GoalCreate, GoalUpdate, GoalProgressUpdate, GoalOut


class GoalService:
    """Goal business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.goal_repo = GoalRepository(db)
        self.user_repo = UserRepository(db)

    def create_goal(self, user_id: int, goal_data: GoalCreate) -> GoalOut:
        """Create a new goal."""
        # Verify user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        goal_dict = goal_data.model_dump(exclude_unset=True)

        # Calculate initial progress if values provided
        if 'starting_value' in goal_dict and 'current_value' in goal_dict and 'target_value' in goal_dict:
            if goal_dict['target_value'] and goal_dict['starting_value']:
                progress = self._calculate_progress(
                    goal_dict['starting_value'],
                    goal_dict['current_value'],
                    goal_dict['target_value']
                )
                goal_dict['progress_percentage'] = progress

        goal = self.goal_repo.create_goal(user_id, goal_dict)
        return GoalOut.model_validate(goal)

    def get_goals(self, user_id: int, skip: int = 0, limit: int = 100) -> List[GoalOut]:
        """Get all goals for a user."""
        goals = self.goal_repo.get_by_user(user_id, skip, limit)
        return [GoalOut.model_validate(g) for g in goals]

    def get_active_goals(self, user_id: int) -> List[GoalOut]:
        """Get active goals for a user."""
        goals = self.goal_repo.get_active_goals(user_id)
        return [GoalOut.model_validate(g) for g in goals]

    def get_goal_by_id(self, user_id: int, goal_id: int) -> GoalOut:
        """Get a specific goal."""
        goal = self.goal_repo.get_by_id(goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )

        # Verify ownership
        if goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this goal"
            )

        return GoalOut.model_validate(goal)

    def update_goal(self, user_id: int, goal_id: int, update_data: GoalUpdate) -> GoalOut:
        """Update a goal."""
        goal = self.goal_repo.get_by_id(goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )

        # Verify ownership
        if goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this goal"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_goal = self.goal_repo.update(goal_id, update_dict)

        return GoalOut.model_validate(updated_goal)

    def update_progress(self, user_id: int, goal_id: int, progress_data: GoalProgressUpdate) -> GoalOut:
        """Update goal progress."""
        goal = self.goal_repo.get_by_id(goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )

        # Verify ownership
        if goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this goal"
            )

        # Calculate progress percentage
        if goal.starting_value and goal.target_value:
            progress_pct = self._calculate_progress(
                goal.starting_value,
                progress_data.current_value,
                goal.target_value
            )
        else:
            progress_pct = 0.0

        updated_goal = self.goal_repo.update_progress(goal_id, progress_data.current_value, progress_pct)

        return GoalOut.model_validate(updated_goal)

    def complete_goal(self, user_id: int, goal_id: int) -> GoalOut:
        """Mark a goal as completed."""
        goal = self.goal_repo.get_by_id(goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )

        # Verify ownership
        if goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this goal"
            )

        completed_goal = self.goal_repo.mark_completed(goal_id)
        return GoalOut.model_validate(completed_goal)

    def delete_goal(self, user_id: int, goal_id: int) -> bool:
        """Delete a goal."""
        goal = self.goal_repo.get_by_id(goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )

        # Verify ownership
        if goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this goal"
            )

        return self.goal_repo.delete(goal_id)

    def _calculate_progress(self, starting_value: float, current_value: float, target_value: float) -> float:
        """Calculate progress percentage."""
        if starting_value == target_value:
            return 100.0

        progress = ((current_value - starting_value) / (target_value - starting_value)) * 100
        return max(0.0, min(progress, 100.0))  # Clamp between 0 and 100
