"""
User Measurement schemas with comprehensive DTOs.
"""
from datetime import datetime

from pydantic import BaseModel, Field


class MeasurementCreate(BaseModel):
    """Create measurement request."""
    weight: float | None = Field(None, gt=0, description="Weight in kg")
    body_fat_percentage: float | None = Field(None, ge=0, le=100)
    muscle_mass: float | None = Field(None, gt=0)
    chest: float | None = Field(None, gt=0, description="Chest circumference in cm")
    waist: float | None = Field(None, gt=0)
    hips: float | None = Field(None, gt=0)
    left_arm: float | None = None
    right_arm: float | None = None
    left_thigh: float | None = None
    right_thigh: float | None = None
    left_calf: float | None = None
    right_calf: float | None = None
    neck: float | None = None
    shoulders: float | None = None
    notes: str | None = Field(None, max_length=500)
    recorded_at: datetime | None = None  # Auto-set to now if not provided

    class Config:
        json_schema_extra = {
            "example": {
                "weight": 75.5,
                "body_fat_percentage": 18.5,
                "chest": 100.0,
                "waist": 85.0,
                "hips": 98.0,
                "notes": "Morning measurement, before breakfast"
            }
        }


class MeasurementUpdate(BaseModel):
    """Update measurement request."""
    weight: float | None = None
    body_fat_percentage: float | None = None
    muscle_mass: float | None = None
    chest: float | None = None
    waist: float | None = None
    hips: float | None = None
    left_arm: float | None = None
    right_arm: float | None = None
    left_thigh: float | None = None
    right_thigh: float | None = None
    left_calf: float | None = None
    right_calf: float | None = None
    neck: float | None = None
    shoulders: float | None = None
    notes: str | None = None


class MeasurementOut(BaseModel):
    """Measurement response schema."""
    id: int
    user_id: int
    weight: float | None
    body_fat_percentage: float | None
    muscle_mass: float | None
    chest: float | None
    waist: float | None
    hips: float | None
    left_arm: float | None
    right_arm: float | None
    left_thigh: float | None
    right_thigh: float | None
    left_calf: float | None
    right_calf: float | None
    neck: float | None
    shoulders: float | None
    notes: str | None
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
