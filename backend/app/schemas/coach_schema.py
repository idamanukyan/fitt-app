"""
Coach-specific schemas for profile and client management.
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class CoachProfileCreate(BaseModel):
    """Create or update coach profile."""
    specialization: Optional[str] = Field(None, max_length=100)
    certifications: Optional[str] = None
    years_of_experience: Optional[int] = Field(None, ge=0, le=50)
    bio: Optional[str] = None
    max_clients: Optional[int] = Field(50, ge=1, le=200)
    is_accepting_clients: Optional[bool] = True
    hourly_rate: Optional[int] = Field(None, ge=0)
    phone_number: Optional[str] = Field(None, max_length=20)
    website_url: Optional[str] = Field(None, max_length=255)

    class Config:
        json_schema_extra = {
            "example": {
                "specialization": "Weight Loss & Strength Training",
                "certifications": "NASM CPT, ACE",
                "years_of_experience": 5,
                "bio": "Passionate fitness coach with 5+ years of experience...",
                "max_clients": 30,
                "is_accepting_clients": True,
                "hourly_rate": 50
            }
        }


class CoachProfileOut(BaseModel):
    """Coach profile response."""
    id: int
    user_id: int
    specialization: Optional[str]
    certifications: Optional[str]
    years_of_experience: Optional[int]
    bio: Optional[str]
    max_clients: int
    is_accepting_clients: bool
    hourly_rate: Optional[int]
    phone_number: Optional[str]
    website_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClientBasicInfo(BaseModel):
    """Basic client information for coach view."""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AssignClientRequest(BaseModel):
    """Request to assign a client to a coach."""
    client_id: int

    class Config:
        json_schema_extra = {
            "example": {
                "client_id": 5
            }
        }


class UnassignClientRequest(BaseModel):
    """Request to unassign a client from a coach."""
    client_id: int

    class Config:
        json_schema_extra = {
            "example": {
                "client_id": 5
            }
        }


class CoachPublicProfile(BaseModel):
    """Public coach profile for discovery."""
    user_id: int
    username: str
    specialization: Optional[str]
    years_of_experience: Optional[int]
    bio: Optional[str]
    is_accepting_clients: bool
    hourly_rate: Optional[int]

    class Config:
        from_attributes = True
