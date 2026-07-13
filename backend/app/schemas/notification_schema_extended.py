"""
User Notification schemas with comprehensive DTOs.
"""
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


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
    extra_data: dict[str, Any] | None = None
    priority: NotificationPriorityEnum | None = NotificationPriorityEnum.NORMAL
    scheduled_for: datetime | None = None

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
    sent_at: datetime | None
    read_at: datetime | None
    sent_via_push: bool
    sent_via_email: bool
    sent_via_in_app: bool
    extra_data: dict[str, Any] | None
    priority: str
    scheduled_for: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
