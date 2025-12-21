"""
Progress Photo service with business logic.
"""
from typing import List, Optional, Dict
from datetime import datetime
from calendar import monthrange
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.progress_photo_repository import ProgressPhotoRepository
from app.repositories.user_repository import UserRepository
from app.schemas.progress_photo_schemas import (
    ProgressPhotoCreate,
    ProgressPhotoUpdate,
    ProgressPhotoOut,
    PhotoComparison,
    TimelineResponse,
    TimelineGroup,
    ProgressPhotoStats,
    PhotoTypeEnum
)
from app.models.progress_photo import PhotoType


class ProgressPhotoService:
    """Progress photo business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.photo_repo = ProgressPhotoRepository(db)
        self.user_repo = UserRepository(db)

    def create_progress_photo(self, user_id: int, photo_data: ProgressPhotoCreate) -> ProgressPhotoOut:
        """Create a new progress photo."""
        # Verify user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        photo_dict = photo_data.model_dump(exclude_unset=True)

        # Set taken_at to now if not provided
        if 'taken_at' not in photo_dict or photo_dict['taken_at'] is None:
            photo_dict['taken_at'] = datetime.utcnow()

        progress_photo = self.photo_repo.create_progress_photo(user_id, photo_dict)
        return ProgressPhotoOut.model_validate(progress_photo)

    def get_progress_photos(
        self,
        user_id: int,
        photo_type: Optional[PhotoTypeEnum] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ProgressPhotoOut]:
        """Get all progress photos for a user, optionally filtered by type."""
        if photo_type:
            photos = self.photo_repo.get_by_user_and_type(
                user_id, PhotoType(photo_type.value), skip, limit
            )
        else:
            photos = self.photo_repo.get_by_user(user_id, skip, limit)

        return [ProgressPhotoOut.model_validate(p) for p in photos]

    def get_progress_photo_by_id(self, user_id: int, photo_id: int) -> ProgressPhotoOut:
        """Get a specific progress photo."""
        photo = self.photo_repo.get_by_id(photo_id)
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Progress photo not found"
            )

        # Verify ownership
        if photo.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this photo"
            )

        return ProgressPhotoOut.model_validate(photo)

    def update_progress_photo(
        self, user_id: int, photo_id: int, update_data: ProgressPhotoUpdate
    ) -> ProgressPhotoOut:
        """Update a progress photo's metadata."""
        photo = self.photo_repo.get_by_id(photo_id)
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Progress photo not found"
            )

        # Verify ownership
        if photo.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this photo"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_photo = self.photo_repo.update(photo_id, update_dict)

        return ProgressPhotoOut.model_validate(updated_photo)

    def delete_progress_photo(self, user_id: int, photo_id: int) -> bool:
        """Delete a progress photo."""
        photo = self.photo_repo.get_by_id(photo_id)
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Progress photo not found"
            )

        # Verify ownership
        if photo.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this photo"
            )

        return self.photo_repo.delete(photo_id)

    def get_comparison(
        self, user_id: int, photo_type: Optional[PhotoTypeEnum] = None
    ) -> PhotoComparison:
        """Get before/after comparison (first vs latest photo)."""
        photo_type_enum = PhotoType(photo_type.value) if photo_type else None

        first_photo = self.photo_repo.get_first_photo(user_id, photo_type_enum)
        latest_photo = self.photo_repo.get_latest_photo(user_id, photo_type_enum)

        if not first_photo or not latest_photo:
            return PhotoComparison(
                first_photo=None,
                latest_photo=None,
                time_difference_days=0,
                weight_change_kg=None,
                body_fat_change=None
            )

        # Calculate time difference
        time_diff = (latest_photo.taken_at - first_photo.taken_at).days

        # Calculate weight change
        weight_change = None
        if first_photo.weight_kg and latest_photo.weight_kg:
            weight_change = latest_photo.weight_kg - first_photo.weight_kg

        # Calculate body fat change
        bf_change = None
        if first_photo.body_fat_percentage and latest_photo.body_fat_percentage:
            bf_change = latest_photo.body_fat_percentage - first_photo.body_fat_percentage

        return PhotoComparison(
            first_photo=ProgressPhotoOut.model_validate(first_photo),
            latest_photo=ProgressPhotoOut.model_validate(latest_photo),
            time_difference_days=time_diff,
            weight_change_kg=weight_change,
            body_fat_change=bf_change
        )

    def get_timeline(
        self, user_id: int, period: str = "monthly"
    ) -> TimelineResponse:
        """
        Get photos grouped by time period.

        Args:
            user_id: User ID
            period: 'daily', 'weekly', or 'monthly'
        """
        all_photos = self.photo_repo.get_by_user(user_id, skip=0, limit=1000)

        if not all_photos:
            return TimelineResponse(groups=[], total_photos=0)

        # Group photos by period
        groups_dict: Dict[str, List[ProgressPhotoOut]] = {}

        for photo in all_photos:
            if period == "monthly":
                key = photo.taken_at.strftime("%B %Y")  # "January 2025"
            elif period == "weekly":
                week_num = photo.taken_at.isocalendar()[1]
                key = f"Week {week_num} - {photo.taken_at.year}"
            else:  # daily
                key = photo.taken_at.strftime("%B %d, %Y")  # "January 15, 2025"

            if key not in groups_dict:
                groups_dict[key] = []

            groups_dict[key].append(ProgressPhotoOut.model_validate(photo))

        # Convert to TimelineGroup objects
        groups = [
            TimelineGroup(
                period=period_label,
                photos=photos,
                photo_count=len(photos)
            )
            for period_label, photos in groups_dict.items()
        ]

        return TimelineResponse(
            groups=groups,
            total_photos=len(all_photos)
        )

    def get_stats(self, user_id: int) -> ProgressPhotoStats:
        """Get statistics about user's progress photos."""
        all_photos = self.photo_repo.get_by_user(user_id, skip=0, limit=10000)

        if not all_photos:
            return ProgressPhotoStats(
                total_photos=0,
                photos_by_type={},
                first_photo_date=None,
                latest_photo_date=None,
                total_days_tracked=0
            )

        # Count by type
        photos_by_type = {}
        for photo_type in PhotoType:
            count = self.photo_repo.count_by_user_and_type(user_id, photo_type)
            if count > 0:
                photos_by_type[photo_type.value] = count

        # Get date range
        first_photo = self.photo_repo.get_first_photo(user_id)
        latest_photo = self.photo_repo.get_latest_photo(user_id)

        total_days = 0
        if first_photo and latest_photo:
            total_days = (latest_photo.taken_at - first_photo.taken_at).days

        return ProgressPhotoStats(
            total_photos=len(all_photos),
            photos_by_type=photos_by_type,
            first_photo_date=first_photo.taken_at if first_photo else None,
            latest_photo_date=latest_photo.taken_at if latest_photo else None,
            total_days_tracked=total_days
        )
