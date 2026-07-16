"""
User Profile schemas with comprehensive DTOs.
"""
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class GenderEnum(str, Enum):
    """Gender options."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class FitnessLevelEnum(str, Enum):
    """Fitness level options."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ActivityLevelEnum(str, Enum):
    """Activity level options."""
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"


class UserProfileCreate(BaseModel):
    """Profile creation request."""
    full_name: str | None = Field(None, max_length=100)
    date_of_birth: date | None = None
    gender: GenderEnum | None = None
    bio: str | None = Field(None, max_length=500)
    height: float | None = Field(None, gt=0, le=300, description="Height in cm")
    weight: float | None = Field(None, gt=0, le=500, description="Weight in kg")
    phone: str | None = Field(None, max_length=20)
    country: str | None = Field(None, max_length=50)
    city: str | None = Field(None, max_length=50)
    timezone: str | None = None
    fitness_level: FitnessLevelEnum | None = None
    activity_level: ActivityLevelEnum | None = None
    preferred_workout_time: str | None = None
    avatar_url: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "date_of_birth": "1990-05-15",
                "gender": "male",
                "height": 180.0,
                "weight": 75.5,
                "fitness_level": "intermediate",
                "activity_level": "moderate"
            }
        }


class UserProfileUpdate(BaseModel):
    """Profile update request - all fields optional."""
    full_name: str | None = None
    date_of_birth: date | None = None
    gender: GenderEnum | None = None
    bio: str | None = None
    height: float | None = Field(None, gt=0, le=300)
    weight: float | None = Field(None, gt=0, le=500)
    phone: str | None = None
    country: str | None = None
    city: str | None = None
    timezone: str | None = None
    fitness_level: FitnessLevelEnum | None = None
    activity_level: ActivityLevelEnum | None = None
    preferred_workout_time: str | None = None
    avatar_url: str | None = None


class UserProfileOut(BaseModel):
    """Profile response schema."""
    id: int
    user_id: int
    full_name: str | None
    date_of_birth: date | None
    gender: str | None
    bio: str | None
    height: float | None
    weight: float | None
    phone: str | None
    country: str | None
    city: str | None
    timezone: str | None
    fitness_level: str | None
    activity_level: str | None
    preferred_workout_time: str | None
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
