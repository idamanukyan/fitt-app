from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class UserDevice(Base):
    """
    Registered user devices and push tokens.

    Tracks user devices for push notifications, session management, and analytics.
    """
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Device Information
    device_id = Column(String(255), unique=True, nullable=False, index=True)  # Unique device identifier
    device_type = Column(String(20), nullable=False)  # ios, android, web
    device_name = Column(String(100), nullable=True)  # e.g., "iPhone 14 Pro", "Samsung Galaxy S23"
    device_model = Column(String(100), nullable=True)
    os_version = Column(String(50), nullable=True)
    app_version = Column(String(20), nullable=True)

    # Push Notification Token
    push_token = Column(String(255), nullable=True, index=True)
    push_enabled = Column(Boolean, default=True, nullable=False)

    # Activity Tracking
    is_active = Column(Boolean, default=True, nullable=False)
    last_active = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    last_ip_address = Column(String(50), nullable=True)

    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="devices")

    def __repr__(self):
        return f"<UserDevice(user_id={self.user_id}, device_type='{self.device_type}', device_name='{self.device_name}')>"
