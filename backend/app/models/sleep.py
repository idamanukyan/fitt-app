"""
Sleep Tracking Database Model for HyperFit
"""
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Date, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class SleepEntry(Base):
    """
    Sleep Entry Model - stores individual sleep tracking records.
    """
    __tablename__ = "sleep_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # The date representing the night of sleep
    date = Column(Date, nullable=False, index=True)

    # Sleep times
    bedtime = Column(DateTime, nullable=False)
    wake_time = Column(DateTime, nullable=False)

    # Calculated duration
    duration_hours = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)

    # Optional quality rating (1-100)
    sleep_quality = Column(Integer, nullable=True)

    # Optional notes
    notes = Column(Text, nullable=True)

    # Data source
    source = Column(String(50), nullable=False, default='manual')

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)

    # Relationship
    user = relationship("User", back_populates="sleep_entries")

    # Unique constraint: one entry per user per date
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_user_sleep_date'),
    )

    def __repr__(self):
        return f"<SleepEntry(id={self.id}, user_id={self.user_id}, date={self.date})>"
