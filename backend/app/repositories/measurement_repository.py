"""
User Measurement repository for database operations.

Handles all database queries related to UserMeasurement entity.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user_measurement import UserMeasurement
from app.repositories.base_repository import BaseRepository


class MeasurementRepository(BaseRepository[UserMeasurement]):
    """Repository for UserMeasurement entity operations."""

    def __init__(self, db: Session):
        super().__init__(UserMeasurement, db)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserMeasurement]:
        """Get all measurements for a user, ordered by most recent."""
        return (
            self.db.query(UserMeasurement)
            .filter(UserMeasurement.user_id == user_id)
            .order_by(desc(UserMeasurement.recorded_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_latest_by_user(self, user_id: int) -> Optional[UserMeasurement]:
        """Get the most recent measurement for a user."""
        return (
            self.db.query(UserMeasurement)
            .filter(UserMeasurement.user_id == user_id)
            .order_by(desc(UserMeasurement.recorded_at))
            .first()
        )

    def get_by_date_range(
        self, user_id: int, start_date: datetime, end_date: datetime
    ) -> List[UserMeasurement]:
        """Get measurements within a date range."""
        return (
            self.db.query(UserMeasurement)
            .filter(
                UserMeasurement.user_id == user_id,
                UserMeasurement.recorded_at >= start_date,
                UserMeasurement.recorded_at <= end_date,
            )
            .order_by(desc(UserMeasurement.recorded_at))
            .all()
        )

    def get_last_n_measurements(self, user_id: int, n: int = 10) -> List[UserMeasurement]:
        """Get last N measurements for a user."""
        return (
            self.db.query(UserMeasurement)
            .filter(UserMeasurement.user_id == user_id)
            .order_by(desc(UserMeasurement.recorded_at))
            .limit(n)
            .all()
        )

    def create_measurement(self, user_id: int, measurement_data: dict) -> UserMeasurement:
        """Create a new measurement for a user."""
        measurement_data['user_id'] = user_id
        return self.create(measurement_data)

    def count_by_user(self, user_id: int) -> int:
        """Count total measurements for a user."""
        return self.db.query(UserMeasurement).filter(UserMeasurement.user_id == user_id).count()
