"""
Sleep Entry schemas.
"""
from datetime import date as DateType
from datetime import datetime

from pydantic import BaseModel, Field


class SleepCreate(BaseModel):
    """Create sleep entry request."""
    date: DateType = Field(..., description="The date of the sleep entry (YYYY-MM-DD)")
    bedtime: datetime = Field(..., description="Bedtime as ISO datetime")
    wake_time: datetime = Field(..., description="Wake time as ISO datetime")
    duration_hours: float = Field(..., gt=0, le=24, description="Sleep duration in hours")
    duration_minutes: int = Field(..., ge=0, le=1440, description="Sleep duration in minutes")
    sleep_quality: int | None = Field(None, ge=1, le=100, description="Quality score 1-100")
    notes: str | None = Field(None, max_length=1000)
    source: str | None = Field('manual', max_length=50)

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
    date: DateType | None = None
    bedtime: datetime | None = None
    wake_time: datetime | None = None
    duration_hours: float | None = Field(None, gt=0, le=24)
    duration_minutes: int | None = Field(None, ge=0, le=1440)
    sleep_quality: int | None = Field(None, ge=1, le=100)
    notes: str | None = None
    source: str | None = None


class SleepOut(BaseModel):
    """Sleep entry response schema."""
    id: int
    user_id: int
    date: DateType
    bedtime: datetime
    wake_time: datetime
    duration_hours: float
    duration_minutes: int
    sleep_quality: int | None
    notes: str | None
    source: str
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
