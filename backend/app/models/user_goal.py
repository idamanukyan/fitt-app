from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class UserGoal(Base):
    """
    Fitness goals and progress tracking.

    Stores user-defined fitness goals with target values, deadlines, and progress.
    """
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Goal Details
    goal_type = Column(String(50), nullable=False, index=True)
    # Goal types: weight_loss, weight_gain, muscle_gain, body_fat_reduction,
    # strength_gain, endurance, flexibility, general_fitness

    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    # Target Values
    target_value = Column(Float, nullable=True)  # Target metric value
    unit = Column(String(20), nullable=True)  # kg, lbs, cm, %, reps, etc.
    starting_value = Column(Float, nullable=True)  # Starting point
    current_value = Column(Float, nullable=True)  # Current progress

    # Dates
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    target_date = Column(DateTime, nullable=True)  # Deadline
    completed_date = Column(DateTime, nullable=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    progress_percentage = Column(Float, default=0.0, nullable=False)  # 0-100

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="goals")

    def __repr__(self):
        return f"<UserGoal(user_id={self.user_id}, goal_type='{self.goal_type}', title='{self.title}')>"
