"""
Progress Photos routes.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.progress_photo_service import ProgressPhotoService
from app.schemas.progress_photo_schemas import (
    ProgressPhotoCreate,
    ProgressPhotoUpdate,
    ProgressPhotoOut,
    PhotoComparison,
    TimelineResponse,
    ProgressPhotoStats,
    PhotoTypeEnum
)

router = APIRouter(prefix="/api/progress-photos", tags=["Progress Photos"])


@router.post("/", response_model=ProgressPhotoOut)
def create_progress_photo(
    photo_data: ProgressPhotoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new progress photo with base64 encoded image.

    The photo_url should contain the full base64 encoded image data.
    Optionally include thumbnail_url for a compressed version.
    """
    service = ProgressPhotoService(db)
    return service.create_progress_photo(current_user.id, photo_data)


@router.get("/", response_model=List[ProgressPhotoOut])
def get_progress_photos(
    photo_type: Optional[PhotoTypeEnum] = Query(None, description="Filter by photo type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all progress photos for the current user.

    Optionally filter by photo_type (front, back, side_left, side_right, custom).
    Results are ordered by most recent first.
    """
    service = ProgressPhotoService(db)
    return service.get_progress_photos(current_user.id, photo_type, skip, limit)


@router.get("/comparison", response_model=PhotoComparison)
def get_photo_comparison(
    photo_type: Optional[PhotoTypeEnum] = Query(None, description="Filter by photo type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get before/after comparison showing first photo vs latest photo.

    Includes time difference and stats like weight change and body fat change.
    Optionally filter by photo_type to compare specific angles.
    """
    service = ProgressPhotoService(db)
    return service.get_comparison(current_user.id, photo_type)


@router.get("/timeline", response_model=TimelineResponse)
def get_timeline(
    period: str = Query("monthly", regex="^(daily|weekly|monthly)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get photos grouped by time period for timeline view.

    Period can be: 'daily', 'weekly', or 'monthly'.
    Photos are grouped with period labels and counts.
    """
    service = ProgressPhotoService(db)
    return service.get_timeline(current_user.id, period)


@router.get("/stats", response_model=ProgressPhotoStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics about user's progress photos."""
    service = ProgressPhotoService(db)
    return service.get_stats(current_user.id)


@router.get("/{photo_id}", response_model=ProgressPhotoOut)
def get_progress_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific progress photo by ID."""
    service = ProgressPhotoService(db)
    return service.get_progress_photo_by_id(current_user.id, photo_id)


@router.put("/{photo_id}", response_model=ProgressPhotoOut)
def update_progress_photo(
    photo_id: int,
    update_data: ProgressPhotoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a progress photo's metadata.

    Can update: photo_type, weight, body fat percentage, notes, privacy, and tags.
    Cannot update the actual photo image after upload.
    """
    service = ProgressPhotoService(db)
    return service.update_progress_photo(current_user.id, photo_id, update_data)


@router.delete("/{photo_id}")
def delete_progress_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a progress photo permanently."""
    service = ProgressPhotoService(db)
    service.delete_progress_photo(current_user.id, photo_id)
    return {"message": "Progress photo deleted successfully"}
