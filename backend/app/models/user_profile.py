from sqlalchemy import Column, Integer, Float, String, ForeignKey, Date, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class UserProfile(Base):
    """
    Extended user profile information.

    Stores personal data like physical attributes, preferences, and bio.
    """
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Personal Information
    full_name = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)  # male, female, other, prefer_not_to_say
    bio = Column(Text, nullable=True)

    # Physical Attributes
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg

    # Contact & Location
    phone = Column(String(20), nullable=True)
    country = Column(String(50), nullable=True)
    city = Column(String(50), nullable=True)
    timezone = Column(String(50), nullable=True)

    # Fitness Level & Preferences
    fitness_level = Column(String(20), nullable=True)  # beginner, intermediate, advanced
    activity_level = Column(String(20), nullable=True)  # sedentary, light, moderate, active, very_active
    preferred_workout_time = Column(String(20), nullable=True)  # morning, afternoon, evening

    # Profile Image
    avatar_url = Column(String(255), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(user_id={self.user_id}, full_name='{self.full_name}')>"
