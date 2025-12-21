"""
Progress Photo schemas with comprehensive DTOs.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


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
    thumbnail_url: Optional[str] = Field(None, description="Base64 encoded thumbnail")
    photo_type: PhotoTypeEnum = Field(PhotoTypeEnum.FRONT, description="Type of photo")
    taken_at: Optional[datetime] = Field(None, description="When photo was taken, defaults to now")
    weight_kg: Optional[float] = Field(None, gt=0, description="Weight in kg at time of photo")
    body_fat_percentage: Optional[float] = Field(None, ge=0, le=100, description="Body fat percentage")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")
    is_public: bool = Field(False, description="Make photo public")
    tags: Optional[str] = Field(None, description="JSON array of tags")

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
    photo_type: Optional[PhotoTypeEnum] = None
    weight_kg: Optional[float] = Field(None, gt=0)
    body_fat_percentage: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = None
    tags: Optional[str] = None


class ProgressPhotoOut(BaseModel):
    """Progress photo response schema."""
    id: int
    user_id: int
    photo_url: str
    thumbnail_url: Optional[str]
    photo_type: str
    taken_at: datetime
    weight_kg: Optional[float]
    body_fat_percentage: Optional[float]
    notes: Optional[str]
    is_public: bool
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PhotoComparison(BaseModel):
    """Schema for before/after photo comparison."""
    first_photo: Optional[ProgressPhotoOut] = Field(None, description="First/oldest photo")
    latest_photo: Optional[ProgressPhotoOut] = Field(None, description="Latest/most recent photo")
    time_difference_days: int = Field(0, description="Days between photos")
    weight_change_kg: Optional[float] = Field(None, description="Weight change (negative = loss)")
    body_fat_change: Optional[float] = Field(None, description="Body fat percentage change")

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
    photos: List[ProgressPhotoOut] = Field([], description="Photos in this period")
    photo_count: int = Field(0, description="Number of photos in period")


class TimelineResponse(BaseModel):
    """Schema for timeline view response."""
    groups: List[TimelineGroup] = Field([], description="Photos grouped by time period")
    total_photos: int = Field(0, description="Total number of photos")


class ProgressPhotoStats(BaseModel):
    """Statistics about user's progress photos."""
    total_photos: int
    photos_by_type: Dict[str, int]
    first_photo_date: Optional[datetime]
    latest_photo_date: Optional[datetime]
    total_days_tracked: int
