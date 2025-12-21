"""
Coach-specific models and profiles.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class CoachProfile(Base):
    """
    Extended profile for coaches with specializations and credentials.

    Linked to a User with role=COACH.
    """
    __tablename__ = "coach_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Professional details
    specialization = Column(String(100), nullable=True)  # e.g., "Weight Loss", "Strength Training"
    certifications = Column(Text, nullable=True)  # JSON array or comma-separated
    years_of_experience = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)

    # Availability
    max_clients = Column(Integer, default=50, nullable=False)
    is_accepting_clients = Column(Boolean, default=True, nullable=False)
    hourly_rate = Column(Integer, nullable=True)  # For future payment integration

    # Contact
    phone_number = Column(String(20), nullable=True)
    website_url = Column(String(255), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="coach_profile")

    def __repr__(self):
        return f"<CoachProfile(user_id={self.user_id}, specialization='{self.specialization}')>"
