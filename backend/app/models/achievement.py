"""
Achievement models for gamification system.

Provides Achievement, UserAchievement, UserStreak, and UserLevel models
for tracking user progress, unlocks, streaks, and levels.
"""
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AchievementCategory(enum.Enum):
    """Categories for grouping achievements."""
    WORKOUT = "workout"
    NUTRITION = "nutrition"
    CONSISTENCY = "consistency"
    SOCIAL = "social"
    PROGRESS = "progress"


class Achievement(Base):
    """
    Achievement definition.

    Represents a goal/achievement that users can unlock by reaching
    specific milestones (e.g., 10 workouts, 7-day streak).
    """
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(String(500), nullable=False)
    category = Column(Enum(AchievementCategory), nullable=False, index=True)
    icon_name = Column(String(50), nullable=False)  # Ionicons name
    color = Column(String(7), nullable=False)  # Hex color (e.g., #0EA5E9)
    target_value = Column(Integer, nullable=False)  # Target to unlock (e.g., 10 workouts)
    xp_reward = Column(Integer, nullable=False, default=100)  # XP awarded on unlock
    is_active = Column(Boolean, default=True, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)  # Hidden until close to unlock
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user_achievements = relationship(
        "UserAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Achievement(id={self.id}, name='{self.name}', category='{self.category.value}')>"


class UserAchievement(Base):
    """
    User's progress on a specific achievement.

    Tracks current progress, unlock status, and notification state
    for each user-achievement pair.
    """
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    current_progress = Column(Integer, default=0, nullable=False)  # Current count (e.g., 7 workouts)
    is_unlocked = Column(Boolean, default=False, nullable=False)
    unlocked_at = Column(DateTime, nullable=True)
    notified = Column(Boolean, default=False, nullable=False)  # Whether user was notified of unlock
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id}, progress={self.current_progress}/{self.achievement.target_value if self.achievement else '?'})>"


class UserStreak(Base):
    """
    User's activity streak tracking.

    Tracks daily activity streaks, longest streak, and total active days.
    """
    __tablename__ = "user_streaks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    current_streak = Column(Integer, default=0, nullable=False)  # Current consecutive days
    longest_streak = Column(Integer, default=0, nullable=False)  # All-time longest streak
    last_activity_date = Column(Date, nullable=True)  # Last date activity was recorded
    total_active_days = Column(Integer, default=0, nullable=False)  # Total days with activity
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="streak")

    def __repr__(self):
        return f"<UserStreak(user_id={self.user_id}, current={self.current_streak}, longest={self.longest_streak})>"


class UserLevel(Base):
    """
    User's level and experience points.

    Tracks user level progression based on XP earned from activities and achievements.
    """
    __tablename__ = "user_levels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    level = Column(Integer, default=1, nullable=False)  # Current level
    current_xp = Column(Integer, default=0, nullable=False)  # XP in current level
    total_xp = Column(Integer, default=0, nullable=False)  # Total XP earned all time
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="level")

    def __repr__(self):
        return f"<UserLevel(user_id={self.user_id}, level={self.level}, xp={self.current_xp}/{self.xp_to_next_level()})>"

    def xp_to_next_level(self) -> int:
        """Calculate XP required to reach next level (level * 100)."""
        return self.level * 100
