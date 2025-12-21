from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class UserNotification(Base):
    """
    Notification preferences and history.

    Stores notification settings, delivery status, and notification history.
    """
    __tablename__ = "user_notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Notification Details
    notification_type = Column(String(50), nullable=False, index=True)
    # Types: workout_reminder, goal_milestone, progress_update, achievement,
    # friend_activity, system_message, promotional

    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)

    # Status Tracking
    is_read = Column(Boolean, default=False, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)

    # Delivery Channels
    sent_via_push = Column(Boolean, default=False, nullable=False)
    sent_via_email = Column(Boolean, default=False, nullable=False)
    sent_via_in_app = Column(Boolean, default=True, nullable=False)

    # Additional Data (JSON for flexibility)
    extra_data = Column(JSON, nullable=True)  # Extra data like action URLs, images, etc.

    # Priority & Scheduling
    priority = Column(String(10), default="normal", nullable=False)  # low, normal, high, urgent
    scheduled_for = Column(DateTime, nullable=True)  # For scheduled notifications

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<UserNotification(user_id={self.user_id}, type='{self.notification_type}', is_read={self.is_read})>"
