"""
User Goal schemas with comprehensive DTOs.
"""
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class GoalTypeEnum(str, Enum):
    """Goal type options."""
    WEIGHT_LOSS = "weight_loss"
    WEIGHT_GAIN = "weight_gain"
    MUSCLE_GAIN = "muscle_gain"
    BODY_FAT_REDUCTION = "body_fat_reduction"
    STRENGTH_GAIN = "strength_gain"
    ENDURANCE = "endurance"
    FLEXIBILITY = "flexibility"
    GENERAL_FITNESS = "general_fitness"


class GoalCreate(BaseModel):
    """Create goal request."""
    goal_type: GoalTypeEnum
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    target_value: float | None = None
    unit: str | None = Field(None, max_length=20)
    starting_value: float | None = None
    current_value: float | None = None
    target_date: datetime | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "goal_type": "weight_loss",
                "title": "Lose 10kg by Summer",
                "description": "Reduce weight through healthy eating and exercise",
                "target_value": 70.0,
                "unit": "kg",
                "starting_value": 80.0,
                "target_date": "2024-06-01T00:00:00"
            }
        }


class GoalUpdate(BaseModel):
    """Update goal request."""
    title: str | None = None
    description: str | None = None
    target_value: float | None = None
    current_value: float | None = None
    target_date: datetime | None = None
    is_active: bool | None = None


class GoalProgressUpdate(BaseModel):
    """Update goal progress."""
    current_value: float
    notes: str | None = None


class GoalOut(BaseModel):
    """Goal response schema."""
    id: int
    user_id: int
    goal_type: str
    title: str
    description: str | None
    target_value: float | None
    unit: str | None
    starting_value: float | None
    current_value: float | None
    start_date: datetime
    target_date: datetime | None
    completed_date: datetime | None
    is_active: bool
    is_completed: bool
    progress_percentage: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
