"""
Sleep Entry schemas.
"""
from typing import Optional
from datetime import datetime
from datetime import date as DateType
from pydantic import BaseModel, Field


class SleepCreate(BaseModel):
    """Create sleep entry request."""
    date: DateType = Field(..., description="The date of the sleep entry (YYYY-MM-DD)")
    bedtime: datetime = Field(..., description="Bedtime as ISO datetime")
    wake_time: datetime = Field(..., description="Wake time as ISO datetime")
    duration_hours: float = Field(..., gt=0, le=24, description="Sleep duration in hours")
    duration_minutes: int = Field(..., ge=0, le=1440, description="Sleep duration in minutes")
    sleep_quality: Optional[int] = Field(None, ge=1, le=100, description="Quality score 1-100")
    notes: Optional[str] = Field(None, max_length=1000)
    source: Optional[str] = Field('manual', max_length=50)

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-01-15",
                "bedtime": "2025-01-14T23:00:00",
                "wake_time": "2025-01-15T07:00:00",
                "duration_hours": 8.0,
                "duration_minutes": 480,
                "sleep_quality": 85,
                "notes": "Slept well"
            }
        }


class SleepUpdate(BaseModel):
    """Update sleep entry request."""
    date: Optional[DateType] = None
    bedtime: Optional[datetime] = None
    wake_time: Optional[datetime] = None
    duration_hours: Optional[float] = Field(None, gt=0, le=24)
    duration_minutes: Optional[int] = Field(None, ge=0, le=1440)
    sleep_quality: Optional[int] = Field(None, ge=1, le=100)
    notes: Optional[str] = None
    source: Optional[str] = None


class SleepOut(BaseModel):
    """Sleep entry response schema."""
    id: int
    user_id: int
    date: DateType
    bedtime: datetime
    wake_time: datetime
    duration_hours: float
    duration_minutes: int
    sleep_quality: Optional[int]
    notes: Optional[str]
    source: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
