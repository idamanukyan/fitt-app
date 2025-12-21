"""
Extended User schemas with comprehensive DTOs.

Complete request/response models for User entity with validation.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


# ========== User Registration & Authentication ==========

class UserRegister(BaseModel):
    """User registration request schema."""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")

    @validator('username')
    def username_alphanumeric(cls, v):
        """Validate username contains only alphanumeric and underscore."""
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only letters, numbers, and underscores')
        return v.lower()

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "SecurePass123!"
            }
        }


class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "SecurePass123!"
            }
        }


class Token(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[int] = None
    email: Optional[str] = None


# ========== User Response Schemas ==========

class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str
    email: EmailStr
    is_active: bool
    is_premium: bool

    class Config:
        from_attributes = True


class UserOut(UserBase):
    """User response schema for public endpoints."""
    id: int
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "john_doe",
                "email": "john@example.com",
                "is_active": True,
                "is_premium": False,
                "created_at": "2024-01-15T10:30:00",
                "last_login": "2024-01-20T15:45:00"
            }
        }


class UserDetail(UserBase):
    """Detailed user schema with all fields."""
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update request schema."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe_updated",
                "email": "newemail@example.com"
            }
        }


class PasswordChange(BaseModel):
    """Password change request schema."""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Validate passwords match."""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


# ========== User Statistics ==========

class UserStats(BaseModel):
    """User statistics schema."""
    total_measurements: int
    total_goals: int
    active_goals: int
    completed_goals: int
    total_devices: int
    unread_notifications: int
    member_since_days: int

    class Config:
        json_schema_extra = {
            "example": {
                "total_measurements": 45,
                "total_goals": 5,
                "active_goals": 2,
                "completed_goals": 3,
                "total_devices": 2,
                "unread_notifications": 8,
                "member_since_days": 120
            }
        }
