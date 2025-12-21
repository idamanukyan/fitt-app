"""
User Notification schemas with comprehensive DTOs.
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class NotificationTypeEnum(str, Enum):
    """Notification type options."""
    WORKOUT_REMINDER = "workout_reminder"
    GOAL_MILESTONE = "goal_milestone"
    PROGRESS_UPDATE = "progress_update"
    ACHIEVEMENT = "achievement"
    FRIEND_ACTIVITY = "friend_activity"
    SYSTEM_MESSAGE = "system_message"
    PROMOTIONAL = "promotional"


class NotificationPriorityEnum(str, Enum):
    """Notification priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCreate(BaseModel):
    """Create notification request."""
    notification_type: NotificationTypeEnum
    title: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1)
    extra_data: Optional[Dict[str, Any]] = None
    priority: Optional[NotificationPriorityEnum] = NotificationPriorityEnum.NORMAL
    scheduled_for: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "notification_type": "goal_milestone",
                "title": "Goal Progress!",
                "message": "You've reached 50% of your weight loss goal!",
                "priority": "high"
            }
        }


class NotificationOut(BaseModel):
    """Notification response schema."""
    id: int
    user_id: int
    notification_type: str
    title: str
    message: str
    is_read: bool
    is_sent: bool
    sent_at: Optional[datetime]
    read_at: Optional[datetime]
    sent_via_push: bool
    sent_via_email: bool
    sent_via_in_app: bool
    extra_data: Optional[Dict[str, Any]]
    priority: str
    scheduled_for: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
