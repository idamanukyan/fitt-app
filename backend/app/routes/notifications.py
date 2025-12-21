"""
Notification routes.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification_schema_extended import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications."""
    service = NotificationService(db)
    return service.get_notifications(current_user.id, skip, limit)


@router.get("/unread", response_model=List[NotificationOut])
def get_unread_notifications(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unread notifications."""
    service = NotificationService(db)
    return service.get_unread_notifications(current_user.id, skip, limit)


@router.get("/unread/count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications."""
    service = NotificationService(db)
    return service.get_unread_count(current_user.id)


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read."""
    service = NotificationService(db)
    return service.mark_as_read(current_user.id, notification_id)


@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read."""
    service = NotificationService(db)
    return service.mark_all_as_read(current_user.id)


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification."""
    service = NotificationService(db)
    service.delete_notification(current_user.id, notification_id)
    return {"message": "Notification deleted successfully"}
