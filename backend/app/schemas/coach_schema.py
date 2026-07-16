"""
Coach-specific schemas for profile and client management.
"""
from datetime import datetime

from pydantic import BaseModel, Field


class CoachProfileCreate(BaseModel):
    """Create or update coach profile."""
    specialization: str | None = Field(None, max_length=100)
    certifications: str | None = None
    years_of_experience: int | None = Field(None, ge=0, le=50)
    bio: str | None = None
    max_clients: int | None = Field(50, ge=1, le=200)
    is_accepting_clients: bool | None = True
    hourly_rate: int | None = Field(None, ge=0)
    phone_number: str | None = Field(None, max_length=20)
    website_url: str | None = Field(None, max_length=255)

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
    specialization: str | None
    certifications: str | None
    years_of_experience: int | None
    bio: str | None
    max_clients: int
    is_accepting_clients: bool
    hourly_rate: int | None
    phone_number: str | None
    website_url: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClientBasicInfo(BaseModel):
    """Basic client information for coach view."""
    id: int
    username: str
    email: str
    full_name: str | None
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
    specialization: str | None
    years_of_experience: int | None
    bio: str | None
    is_accepting_clients: bool
    hourly_rate: int | None

    class Config:
        from_attributes = True
