"""
User Profile repository for database operations.

Handles all database queries related to UserProfile entity.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user_profile import UserProfile
from app.repositories.base_repository import BaseRepository


class UserProfileRepository(BaseRepository[UserProfile]):
    """Repository for UserProfile entity operations."""

    def __init__(self, db: Session):
        super().__init__(UserProfile, db)

    def get_by_user_id(self, user_id: int) -> Optional[UserProfile]:
        """Get profile by user ID."""
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    def create_for_user(self, user_id: int, profile_data: dict) -> UserProfile:
        """Create a new profile for a user."""
        profile_data['user_id'] = user_id
        return self.create(profile_data)

    def update_by_user_id(self, user_id: int, profile_data: dict) -> Optional[UserProfile]:
        """Update profile by user ID."""
        profile = self.get_by_user_id(user_id)
        if not profile:
            return None

        for field, value in profile_data.items():
            if hasattr(profile, field) and field != 'user_id':
                setattr(profile, field, value)

        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_profiles_by_fitness_level(self, fitness_level: str, skip: int = 0, limit: int = 100):
        """Get profiles filtered by fitness level."""
        return (
            self.db.query(UserProfile)
            .filter(UserProfile.fitness_level == fitness_level)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_profiles_by_gender(self, gender: str, skip: int = 0, limit: int = 100):
        """Get profiles filtered by gender."""
        return (
            self.db.query(UserProfile)
            .filter(UserProfile.gender == gender)
            .offset(skip)
            .limit(limit)
            .all()
        )
