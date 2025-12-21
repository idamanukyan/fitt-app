from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum


class PhotoType(str, enum.Enum):
    """Photo type enum for progress photos."""
    FRONT = "front"
    BACK = "back"
    SIDE_LEFT = "side_left"
    SIDE_RIGHT = "side_right"
    CUSTOM = "custom"


class ProgressPhoto(Base):
    """
    Progress photos for tracking visual transformation.

    Stores photos with metadata like weight, body fat, type (front/back/side),
    and allows for comparison and timeline views.
    """
    __tablename__ = "progress_photos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Photo Data
    photo_url = Column(Text, nullable=False)  # Base64 encoded or file path
    thumbnail_url = Column(Text, nullable=True)  # Smaller version for list views
    photo_type = Column(SQLEnum(PhotoType), default=PhotoType.FRONT, nullable=False, index=True)

    # Metadata
    taken_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    weight_kg = Column(Float, nullable=True)  # Weight at time of photo
    body_fat_percentage = Column(Float, nullable=True)  # Body fat at time of photo
    notes = Column(Text, nullable=True)

    # Privacy & Organization
    is_public = Column(Boolean, default=False, nullable=False)
    tags = Column(String(500), nullable=True)  # JSON array of tags stored as string

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="progress_photos")

    def __repr__(self):
        return f"<ProgressPhoto(user_id={self.user_id}, type='{self.photo_type}', taken_at='{self.taken_at}')>"
