"""
User service with business logic.
"""
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.user_repository import UserRepository
from app.repositories.user_profile_repository import UserProfileRepository
from app.core.auth import pwd_context, create_access_token
from app.schemas.user_schema_extended import UserRegister, UserLogin, UserUpdate, UserOut, UserStats


class UserService:
    """User business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = UserProfileRepository(db)

    def register_user(self, user_data: UserRegister) -> dict:
        """
        Register a new user.

        Validates uniqueness and creates user + empty profile.
        """
        # Check if email exists
        if self.user_repo.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if username exists
        if self.user_repo.username_exists(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Hash password
        hashed_password = pwd_context.hash(user_data.password)

        # Create user
        user_dict = {
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hashed_password,
        }
        user = self.user_repo.create(user_dict)

        # Create empty profile
        self.profile_repo.create_for_user(user.id, {})

        # Generate token
        token = create_access_token({"sub": str(user.id), "email": user.email})

        return {
            "user": UserOut.model_validate(user),
            "access_token": token,
            "token_type": "bearer"
        }

    def login_user(self, login_data: UserLogin) -> dict:
        """Authenticate user and return token."""
        user = self.user_repo.get_by_email(login_data.email)

        if not user or not pwd_context.verify(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )

        # Update last login
        self.user_repo.update_last_login(user.id)

        # Generate token
        token = create_access_token({"sub": str(user.id), "email": user.email})

        return {
            "user": UserOut.model_validate(user),
            "access_token": token,
            "token_type": "bearer"
        }

    def get_user_by_id(self, user_id: int) -> UserOut:
        """Get user by ID."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserOut.model_validate(user)

    def update_user(self, user_id: int, update_data: UserUpdate) -> UserOut:
        """Update user information."""
        # Check if user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check email uniqueness if changing
        if update_data.email and update_data.email != user.email:
            if self.user_repo.email_exists(update_data.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )

        # Check username uniqueness if changing
        if update_data.username and update_data.username != user.username:
            if self.user_repo.username_exists(update_data.username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

        # Update user
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_user = self.user_repo.update(user_id, update_dict)

        return UserOut.model_validate(updated_user)

    def get_user_stats(self, user_id: int) -> UserStats:
        """Get user statistics."""
        from app.repositories.measurement_repository import MeasurementRepository
        from app.repositories.goal_repository import GoalRepository
        from app.repositories.device_repository import DeviceRepository
        from app.repositories.notification_repository import NotificationRepository

        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        measurement_repo = MeasurementRepository(self.db)
        goal_repo = GoalRepository(self.db)
        device_repo = DeviceRepository(self.db)
        notification_repo = NotificationRepository(self.db)

        member_days = (datetime.utcnow() - user.created_at).days

        return UserStats(
            total_measurements=measurement_repo.count_by_user(user_id),
            total_goals=goal_repo.count_by_field("user_id", user_id),
            active_goals=goal_repo.count_active_goals(user_id),
            completed_goals=goal_repo.count_completed_goals(user_id),
            total_devices=device_repo.count_active_devices(user_id),
            unread_notifications=notification_repo.count_unread(user_id),
            member_since_days=member_days
        )
