"""
User repository for database operations.

Handles all database queries related to User entity.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User entity operations."""

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()

    def email_exists(self, email: str) -> bool:
        """Check if email already exists."""
        return self.db.query(User).filter(User.email == email).first() is not None

    def username_exists(self, username: str) -> bool:
        """Check if username already exists."""
        return self.db.query(User).filter(User.username == username).first() is not None

    def get_active_users(self, skip: int = 0, limit: int = 100):
        """Get all active users."""
        return (
            self.db.query(User)
            .filter(User.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_premium_users(self, skip: int = 0, limit: int = 100):
        """Get all premium users."""
        return (
            self.db.query(User)
            .filter(User.is_premium == True, User.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_last_login(self, user_id: int):
        """Update user's last login timestamp."""
        from datetime import datetime
        user = self.get_by_id(user_id)
        if user:
            user.last_login = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: int) -> bool:
        """Soft delete: deactivate user account."""
        user = self.get_by_id(user_id)
        if not user:
            return False
        user.is_active = False
        self.db.commit()
        return True

    def activate_user(self, user_id: int) -> bool:
        """Reactivate a deactivated user account."""
        user = self.get_by_id(user_id)
        if not user:
            return False
        user.is_active = True
        self.db.commit()
        return True
