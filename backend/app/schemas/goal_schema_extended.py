"""
User Goal schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


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
    description: Optional[str] = None
    target_value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=20)
    starting_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[datetime] = None

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
    title: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    target_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class GoalProgressUpdate(BaseModel):
    """Update goal progress."""
    current_value: float
    notes: Optional[str] = None


class GoalOut(BaseModel):
    """Goal response schema."""
    id: int
    user_id: int
    goal_type: str
    title: str
    description: Optional[str]
    target_value: Optional[float]
    unit: Optional[str]
    starting_value: Optional[float]
    current_value: Optional[float]
    start_date: datetime
    target_date: Optional[datetime]
    completed_date: Optional[datetime]
    is_active: bool
    is_completed: bool
    progress_percentage: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
