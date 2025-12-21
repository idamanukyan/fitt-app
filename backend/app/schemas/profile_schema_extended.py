"""
User Profile schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


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
    full_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    bio: Optional[str] = Field(None, max_length=500)
    height: Optional[float] = Field(None, gt=0, le=300, description="Height in cm")
    weight: Optional[float] = Field(None, gt=0, le=500, description="Weight in kg")
    phone: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=50)
    city: Optional[str] = Field(None, max_length=50)
    timezone: Optional[str] = None
    fitness_level: Optional[FitnessLevelEnum] = None
    activity_level: Optional[ActivityLevelEnum] = None
    preferred_workout_time: Optional[str] = None
    avatar_url: Optional[str] = None

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
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    bio: Optional[str] = None
    height: Optional[float] = Field(None, gt=0, le=300)
    weight: Optional[float] = Field(None, gt=0, le=500)
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    fitness_level: Optional[FitnessLevelEnum] = None
    activity_level: Optional[ActivityLevelEnum] = None
    preferred_workout_time: Optional[str] = None
    avatar_url: Optional[str] = None


class UserProfileOut(BaseModel):
    """Profile response schema."""
    id: int
    user_id: int
    full_name: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    bio: Optional[str]
    height: Optional[float]
    weight: Optional[float]
    phone: Optional[str]
    country: Optional[str]
    city: Optional[str]
    timezone: Optional[str]
    fitness_level: Optional[str]
    activity_level: Optional[str]
    preferred_workout_time: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
