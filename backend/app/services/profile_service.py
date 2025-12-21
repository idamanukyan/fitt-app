"""
Profile service with business logic.
"""
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.user_profile_repository import UserProfileRepository
from app.repositories.user_repository import UserRepository
from app.schemas.profile_schema_extended import UserProfileCreate, UserProfileUpdate, UserProfileOut


class ProfileService:
    """Profile business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = UserProfileRepository(db)
        self.user_repo = UserRepository(db)

    def get_profile(self, user_id: int) -> UserProfileOut:
        """Get user profile."""
        profile = self.profile_repo.get_by_user_id(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        return UserProfileOut.model_validate(profile)

    def create_or_update_profile(self, user_id: int, profile_data: UserProfileCreate) -> UserProfileOut:
        """Create or update user profile."""
        # Verify user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if profile exists
        existing_profile = self.profile_repo.get_by_user_id(user_id)

        profile_dict = profile_data.model_dump(exclude_unset=True)

        if existing_profile:
            # Update existing profile
            updated_profile = self.profile_repo.update_by_user_id(user_id, profile_dict)
            return UserProfileOut.model_validate(updated_profile)
        else:
            # Create new profile
            new_profile = self.profile_repo.create_for_user(user_id, profile_dict)
            return UserProfileOut.model_validate(new_profile)

    def update_profile(self, user_id: int, update_data: UserProfileUpdate) -> UserProfileOut:
        """Update user profile."""
        profile = self.profile_repo.get_by_user_id(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_profile = self.profile_repo.update_by_user_id(user_id, update_dict)

        return UserProfileOut.model_validate(updated_profile)
