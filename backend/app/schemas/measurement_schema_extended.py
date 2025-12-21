"""
User Measurement schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class MeasurementCreate(BaseModel):
    """Create measurement request."""
    weight: Optional[float] = Field(None, gt=0, description="Weight in kg")
    body_fat_percentage: Optional[float] = Field(None, ge=0, le=100)
    muscle_mass: Optional[float] = Field(None, gt=0)
    chest: Optional[float] = Field(None, gt=0, description="Chest circumference in cm")
    waist: Optional[float] = Field(None, gt=0)
    hips: Optional[float] = Field(None, gt=0)
    left_arm: Optional[float] = None
    right_arm: Optional[float] = None
    left_thigh: Optional[float] = None
    right_thigh: Optional[float] = None
    left_calf: Optional[float] = None
    right_calf: Optional[float] = None
    neck: Optional[float] = None
    shoulders: Optional[float] = None
    notes: Optional[str] = Field(None, max_length=500)
    recorded_at: Optional[datetime] = None  # Auto-set to now if not provided

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
    weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    left_arm: Optional[float] = None
    right_arm: Optional[float] = None
    left_thigh: Optional[float] = None
    right_thigh: Optional[float] = None
    left_calf: Optional[float] = None
    right_calf: Optional[float] = None
    neck: Optional[float] = None
    shoulders: Optional[float] = None
    notes: Optional[str] = None


class MeasurementOut(BaseModel):
    """Measurement response schema."""
    id: int
    user_id: int
    weight: Optional[float]
    body_fat_percentage: Optional[float]
    muscle_mass: Optional[float]
    chest: Optional[float]
    waist: Optional[float]
    hips: Optional[float]
    left_arm: Optional[float]
    right_arm: Optional[float]
    left_thigh: Optional[float]
    right_thigh: Optional[float]
    left_calf: Optional[float]
    right_calf: Optional[float]
    neck: Optional[float]
    shoulders: Optional[float]
    notes: Optional[str]
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
