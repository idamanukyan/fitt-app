"""
Progress Photo schemas with comprehensive DTOs.
"""
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class PhotoTypeEnum(str, Enum):
    """Photo type enum for API requests."""
    FRONT = "front"
    BACK = "back"
    SIDE_LEFT = "side_left"
    SIDE_RIGHT = "side_right"
    CUSTOM = "custom"


class ProgressPhotoCreate(BaseModel):
    """Create progress photo request."""
    photo_url: str = Field(..., description="Base64 encoded image or file path")
    thumbnail_url: str | None = Field(None, description="Base64 encoded thumbnail")
    photo_type: PhotoTypeEnum = Field(PhotoTypeEnum.FRONT, description="Type of photo")
    taken_at: datetime | None = Field(None, description="When photo was taken, defaults to now")
    weight_kg: float | None = Field(None, gt=0, description="Weight in kg at time of photo")
    body_fat_percentage: float | None = Field(None, ge=0, le=100, description="Body fat percentage")
    notes: str | None = Field(None, max_length=1000, description="Optional notes")
    is_public: bool = Field(False, description="Make photo public")
    tags: str | None = Field(None, description="JSON array of tags")

    class Config:
        json_schema_extra = {
            "example": {
                "photo_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
                "photo_type": "front",
                "weight_kg": 75.5,
                "body_fat_percentage": 18.5,
                "notes": "Morning photo, feeling strong!",
                "is_public": False
            }
        }


class ProgressPhotoUpdate(BaseModel):
    """Update progress photo request."""
    photo_type: PhotoTypeEnum | None = None
    weight_kg: float | None = Field(None, gt=0)
    body_fat_percentage: float | None = Field(None, ge=0, le=100)
    notes: str | None = Field(None, max_length=1000)
    is_public: bool | None = None
    tags: str | None = None


class ProgressPhotoOut(BaseModel):
    """Progress photo response schema."""
    id: int
    user_id: int
    photo_url: str
    thumbnail_url: str | None
    photo_type: str
    taken_at: datetime
    weight_kg: float | None
    body_fat_percentage: float | None
    notes: str | None
    is_public: bool
    tags: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PhotoComparison(BaseModel):
    """Schema for before/after photo comparison."""
    first_photo: ProgressPhotoOut | None = Field(None, description="First/oldest photo")
    latest_photo: ProgressPhotoOut | None = Field(None, description="Latest/most recent photo")
    time_difference_days: int = Field(0, description="Days between photos")
    weight_change_kg: float | None = Field(None, description="Weight change (negative = loss)")
    body_fat_change: float | None = Field(None, description="Body fat percentage change")

    class Config:
        json_schema_extra = {
            "example": {
                "time_difference_days": 90,
                "weight_change_kg": -5.5,
                "body_fat_change": -3.2
            }
        }


class TimelineGroup(BaseModel):
    """Schema for timeline grouping."""
    period: str = Field(..., description="Time period label (e.g., 'January 2025')")
    photos: list[ProgressPhotoOut] = Field([], description="Photos in this period")
    photo_count: int = Field(0, description="Number of photos in period")


class TimelineResponse(BaseModel):
    """Schema for timeline view response."""
    groups: list[TimelineGroup] = Field([], description="Photos grouped by time period")
    total_photos: int = Field(0, description="Total number of photos")


class ProgressPhotoStats(BaseModel):
    """Statistics about user's progress photos."""
    total_photos: int
    photos_by_type: dict[str, int]
    first_photo_date: datetime | None
    latest_photo_date: datetime | None
    total_days_tracked: int
