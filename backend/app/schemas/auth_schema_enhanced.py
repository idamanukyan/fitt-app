"""
Enhanced authentication schemas with refresh tokens and role management.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from app.models.role import UserRole


class UserRegister(BaseModel):
    """User registration request."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    role: Optional[UserRole] = UserRole.USER  # Default to USER role

    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only letters, numbers, and underscores')
        return v.lower()

    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "password": "SecurePass123!",
                "role": "user"
            }
        }


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "SecurePass123!"
            }
        }


class TokenResponse(BaseModel):
    """Token response with access and refresh tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until access token expires


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class LogoutRequest(BaseModel):
    """Logout request (optional, can use token from header)."""
    refresh_token: Optional[str] = None  # If provided, revoke this refresh token too


class UserOut(BaseModel):
    """User response schema."""
    id: int
    username: str
    email: str
    is_active: bool
    is_premium: bool
    role: str
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Complete authentication response with user and tokens."""
    user: UserOut
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RoleUpdateRequest(BaseModel):
    """Request to update user role (admin only)."""
    role: UserRole

    class Config:
        json_schema_extra = {
            "example": {
                "role": "coach"
            }
        }
