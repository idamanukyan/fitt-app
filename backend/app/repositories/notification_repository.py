"""
User Notification repository for database operations.

Handles all database queries related to UserNotification entity.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user_notification import UserNotification
from app.repositories.base_repository import BaseRepository


class NotificationRepository(BaseRepository[UserNotification]):
    """Repository for UserNotification entity operations."""

    def __init__(self, db: Session):
        super().__init__(UserNotification, db)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserNotification]:
        """Get all notifications for a user, ordered by most recent."""
        return (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id)
            .order_by(desc(UserNotification.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_unread(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserNotification]:
        """Get all unread notifications for a user."""
        return (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id, UserNotification.is_read == False)
            .order_by(desc(UserNotification.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_read(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserNotification]:
        """Get all read notifications for a user."""
        return (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id, UserNotification.is_read == True)
            .order_by(desc(UserNotification.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_type(self, user_id: int, notification_type: str, skip: int = 0, limit: int = 100) -> List[UserNotification]:
        """Get notifications by type."""
        return (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id, UserNotification.notification_type == notification_type)
            .order_by(desc(UserNotification.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_notification(self, user_id: int, notification_data: dict) -> UserNotification:
        """Create a new notification for a user."""
        notification_data['user_id'] = user_id
        return self.create(notification_data)

    def mark_as_read(self, notification_id: int) -> Optional[UserNotification]:
        """Mark a notification as read."""
        notification = self.get_by_id(notification_id)
        if not notification:
            return None

        notification.is_read = True
        notification.read_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user. Returns count of updated notifications."""
        count = (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id, UserNotification.is_read == False)
            .update({"is_read": True, "read_at": datetime.utcnow()})
        )
        self.db.commit()
        return count

    def count_unread(self, user_id: int) -> int:
        """Count unread notifications for a user."""
        return (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id, UserNotification.is_read == False)
            .count()
        )

    def delete_old_notifications(self, user_id: int, days: int = 30) -> int:
        """Delete notifications older than specified days. Returns count of deleted."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        count = (
            self.db.query(UserNotification)
            .filter(UserNotification.user_id == user_id, UserNotification.created_at < cutoff_date)
            .delete()
        )
        self.db.commit()
        return count
