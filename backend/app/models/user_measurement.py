from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class UserMeasurement(Base):
    """
    Body measurements tracking over time.

    Stores various body measurements (chest, waist, arms, etc.) with timestamps
    for progress tracking.
    """
    __tablename__ = "user_measurements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Measurement Data
    weight = Column(Float, nullable=True)  # kg
    body_fat_percentage = Column(Float, nullable=True)  # %
    muscle_mass = Column(Float, nullable=True)  # kg

    # Body Measurements (all in cm)
    chest = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    hips = Column(Float, nullable=True)
    left_arm = Column(Float, nullable=True)
    right_arm = Column(Float, nullable=True)
    left_thigh = Column(Float, nullable=True)
    right_thigh = Column(Float, nullable=True)
    left_calf = Column(Float, nullable=True)
    right_calf = Column(Float, nullable=True)
    neck = Column(Float, nullable=True)
    shoulders = Column(Float, nullable=True)

    # Optional Notes
    notes = Column(Text, nullable=True)

    # Metadata
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="measurements")

    def __repr__(self):
        return f"<UserMeasurement(user_id={self.user_id}, recorded_at='{self.recorded_at}')>"
