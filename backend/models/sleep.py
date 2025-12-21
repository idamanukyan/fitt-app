"""
Sleep Tracking Database Model for HyperFit

SQLAlchemy model for storing sleep entries.
Designed for PostgreSQL with proper indexing and constraints.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Date,
    Text,
    ForeignKey,
    Index,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Assuming you have a Base class from your database setup
# from app.database import Base
# For demonstration, we'll create a minimal Base
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()


class SleepEntry(Base):
    """
    Sleep Entry Model

    Stores individual sleep tracking records for users.
    Each record represents one night's sleep.
    """
    __tablename__ = 'sleep_entries'

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key to users table
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )

    # The date representing the night of sleep (when sleep started)
    date = Column(Date, nullable=False, index=True)

    # Sleep times as full datetime for timezone handling
    bedtime = Column(DateTime(timezone=True), nullable=False)
    wake_time = Column(DateTime(timezone=True), nullable=False)

    # Calculated duration (stored for query efficiency)
    duration_hours = Column(
        Float,
        nullable=False,
        comment="Sleep duration in decimal hours"
    )
    duration_minutes = Column(
        Integer,
        nullable=False,
        comment="Sleep duration in total minutes"
    )

    # Optional user-rated quality (1-100)
    sleep_quality = Column(
        Integer,
        nullable=True,
        comment="User-rated sleep quality score (1-100)"
    )

    # Optional notes
    notes = Column(
        Text,
        nullable=True,
        comment="User notes about the sleep session"
    )

    # Data source tracking
    source = Column(
        String(50),
        nullable=False,
        default='manual',
        comment="Source of sleep data: manual, apple_health, google_fit, etc."
    )

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )

    # Relationships
    user = relationship("User", back_populates="sleep_entries")

    # Table constraints
    __table_args__ = (
        # Unique constraint: one entry per user per date
        UniqueConstraint('user_id', 'date', name='uq_user_sleep_date'),

        # Check constraint: duration must be positive and reasonable
        CheckConstraint(
            'duration_hours > 0 AND duration_hours <= 24',
            name='ck_sleep_duration_range'
        ),

        # Check constraint: quality score must be in range
        CheckConstraint(
            'sleep_quality IS NULL OR (sleep_quality >= 1 AND sleep_quality <= 100)',
            name='ck_sleep_quality_range'
        ),

        # Index for efficient date range queries
        Index('ix_sleep_user_date_range', 'user_id', 'date'),

        # Index for monthly queries
        Index('ix_sleep_user_month', 'user_id', func.date_trunc('month', 'date')),
    )

    def __repr__(self):
        return f"<SleepEntry(id={self.id}, user_id={self.user_id}, date={self.date}, duration={self.duration_hours}h)>"

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'bedtime': self.bedtime.isoformat() if self.bedtime else None,
            'wake_time': self.wake_time.isoformat() if self.wake_time else None,
            'duration_hours': self.duration_hours,
            'duration_minutes': self.duration_minutes,
            'sleep_quality': self.sleep_quality,
            'notes': self.notes,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class SleepGoal(Base):
    """
    Sleep Goal Model

    Stores user's sleep preferences and goals.
    One record per user.
    """
    __tablename__ = 'sleep_goals'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True
    )

    # Target sleep duration
    target_hours = Column(Float, nullable=False, default=8.0)
    min_acceptable_hours = Column(Float, nullable=False, default=7.0)

    # Target times (stored as HH:MM strings)
    target_bedtime = Column(String(5), nullable=False, default='23:00')
    target_wake_time = Column(String(5), nullable=False, default='07:00')

    # Notification preferences
    notifications_enabled = Column(Integer, nullable=False, default=1)  # SQLite boolean
    bedtime_reminder_minutes = Column(Integer, nullable=False, default=30)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="sleep_goal")

    def __repr__(self):
        return f"<SleepGoal(user_id={self.user_id}, target={self.target_hours}h)>"


# SQL Migration Script (for reference)
"""
-- Create sleep_entries table
CREATE TABLE sleep_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bedtime TIMESTAMPTZ NOT NULL,
    wake_time TIMESTAMPTZ NOT NULL,
    duration_hours FLOAT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    sleep_quality INTEGER,
    notes TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT uq_user_sleep_date UNIQUE (user_id, date),
    CONSTRAINT ck_sleep_duration_range CHECK (duration_hours > 0 AND duration_hours <= 24),
    CONSTRAINT ck_sleep_quality_range CHECK (sleep_quality IS NULL OR (sleep_quality >= 1 AND sleep_quality <= 100))
);

-- Create indexes
CREATE INDEX ix_sleep_entries_user_id ON sleep_entries(user_id);
CREATE INDEX ix_sleep_entries_date ON sleep_entries(date);
CREATE INDEX ix_sleep_user_date_range ON sleep_entries(user_id, date);

-- Create sleep_goals table
CREATE TABLE sleep_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    target_hours FLOAT NOT NULL DEFAULT 8.0,
    min_acceptable_hours FLOAT NOT NULL DEFAULT 7.0,
    target_bedtime VARCHAR(5) NOT NULL DEFAULT '23:00',
    target_wake_time VARCHAR(5) NOT NULL DEFAULT '07:00',
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    bedtime_reminder_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX ix_sleep_goals_user_id ON sleep_goals(user_id);
"""
