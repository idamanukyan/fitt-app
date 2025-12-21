"""
Progress Photo repository for database operations.

Handles all database queries related to ProgressPhoto entity.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.models.progress_photo import ProgressPhoto, PhotoType
from app.repositories.base_repository import BaseRepository


class ProgressPhotoRepository(BaseRepository[ProgressPhoto]):
    """Repository for ProgressPhoto entity operations."""

    def __init__(self, db: Session):
        super().__init__(ProgressPhoto, db)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[ProgressPhoto]:
        """Get all progress photos for a user, ordered by most recent."""
        return (
            self.db.query(ProgressPhoto)
            .filter(ProgressPhoto.user_id == user_id)
            .order_by(desc(ProgressPhoto.taken_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_user_and_type(
        self, user_id: int, photo_type: PhotoType, skip: int = 0, limit: int = 100
    ) -> List[ProgressPhoto]:
        """Get progress photos for a user filtered by photo type."""
        return (
            self.db.query(ProgressPhoto)
            .filter(
                ProgressPhoto.user_id == user_id,
                ProgressPhoto.photo_type == photo_type
            )
            .order_by(desc(ProgressPhoto.taken_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_first_photo(self, user_id: int, photo_type: Optional[PhotoType] = None) -> Optional[ProgressPhoto]:
        """Get the first (oldest) progress photo for a user."""
        query = self.db.query(ProgressPhoto).filter(ProgressPhoto.user_id == user_id)

        if photo_type:
            query = query.filter(ProgressPhoto.photo_type == photo_type)

        return query.order_by(asc(ProgressPhoto.taken_at)).first()

    def get_latest_photo(self, user_id: int, photo_type: Optional[PhotoType] = None) -> Optional[ProgressPhoto]:
        """Get the most recent progress photo for a user."""
        query = self.db.query(ProgressPhoto).filter(ProgressPhoto.user_id == user_id)

        if photo_type:
            query = query.filter(ProgressPhoto.photo_type == photo_type)

        return query.order_by(desc(ProgressPhoto.taken_at)).first()

    def get_by_date_range(
        self, user_id: int, start_date: datetime, end_date: datetime, photo_type: Optional[PhotoType] = None
    ) -> List[ProgressPhoto]:
        """Get progress photos within a date range."""
        query = (
            self.db.query(ProgressPhoto)
            .filter(
                ProgressPhoto.user_id == user_id,
                ProgressPhoto.taken_at >= start_date,
                ProgressPhoto.taken_at <= end_date,
            )
        )

        if photo_type:
            query = query.filter(ProgressPhoto.photo_type == photo_type)

        return query.order_by(desc(ProgressPhoto.taken_at)).all()

    def get_timeline_grouped(
        self, user_id: int, period: str = "monthly"
    ) -> List[ProgressPhoto]:
        """
        Get progress photos grouped by time period.

        Args:
            user_id: User ID
            period: 'daily', 'weekly', or 'monthly'
        """
        return (
            self.db.query(ProgressPhoto)
            .filter(ProgressPhoto.user_id == user_id)
            .order_by(desc(ProgressPhoto.taken_at))
            .all()
        )

    def create_progress_photo(self, user_id: int, photo_data: dict) -> ProgressPhoto:
        """Create a new progress photo for a user."""
        photo_data['user_id'] = user_id
        return self.create(photo_data)

    def count_by_user(self, user_id: int) -> int:
        """Count total progress photos for a user."""
        return self.db.query(ProgressPhoto).filter(ProgressPhoto.user_id == user_id).count()

    def count_by_user_and_type(self, user_id: int, photo_type: PhotoType) -> int:
        """Count progress photos for a user by type."""
        return (
            self.db.query(ProgressPhoto)
            .filter(
                ProgressPhoto.user_id == user_id,
                ProgressPhoto.photo_type == photo_type
            )
            .count()
        )
