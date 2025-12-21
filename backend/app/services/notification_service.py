"""
Notification service with business logic.
"""
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.notification_schema_extended import NotificationCreate, NotificationOut


class NotificationService:
    """Notification business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.notification_repo = NotificationRepository(db)
        self.user_repo = UserRepository(db)

    def create_notification(self, user_id: int, notification_data: NotificationCreate) -> NotificationOut:
        """Create a new notification."""
        # Verify user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        notification_dict = notification_data.model_dump(exclude_unset=True)
        notification = self.notification_repo.create_notification(user_id, notification_dict)

        return NotificationOut.model_validate(notification)

    def get_notifications(self, user_id: int, skip: int = 0, limit: int = 100) -> List[NotificationOut]:
        """Get all notifications for a user."""
        notifications = self.notification_repo.get_by_user(user_id, skip, limit)
        return [NotificationOut.model_validate(n) for n in notifications]

    def get_unread_notifications(self, user_id: int, skip: int = 0, limit: int = 100) -> List[NotificationOut]:
        """Get unread notifications."""
        notifications = self.notification_repo.get_unread(user_id, skip, limit)
        return [NotificationOut.model_validate(n) for n in notifications]

    def get_notification_by_id(self, user_id: int, notification_id: int) -> NotificationOut:
        """Get a specific notification."""
        notification = self.notification_repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        # Verify ownership
        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this notification"
            )

        return NotificationOut.model_validate(notification)

    def mark_as_read(self, user_id: int, notification_id: int) -> NotificationOut:
        """Mark notification as read."""
        notification = self.notification_repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        # Verify ownership
        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this notification"
            )

        updated_notification = self.notification_repo.mark_as_read(notification_id)
        return NotificationOut.model_validate(updated_notification)

    def mark_all_as_read(self, user_id: int) -> dict:
        """Mark all notifications as read."""
        count = self.notification_repo.mark_all_as_read(user_id)
        return {"marked_as_read": count}

    def delete_notification(self, user_id: int, notification_id: int) -> bool:
        """Delete a notification."""
        notification = self.notification_repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        # Verify ownership
        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this notification"
            )

        return self.notification_repo.delete(notification_id)

    def get_unread_count(self, user_id: int) -> dict:
        """Get count of unread notifications."""
        count = self.notification_repo.count_unread(user_id)
        return {"unread_count": count}
