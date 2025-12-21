"""
User Device schemas with comprehensive DTOs.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class DeviceTypeEnum(str, Enum):
    """Device type options."""
    IOS = "ios"
    ANDROID = "android"
    WEB = "web"


class DeviceRegister(BaseModel):
    """Register device request."""
    device_id: str = Field(..., min_length=1, max_length=255)
    device_type: DeviceTypeEnum
    device_name: Optional[str] = Field(None, max_length=100)
    device_model: Optional[str] = Field(None, max_length=100)
    os_version: Optional[str] = Field(None, max_length=50)
    app_version: Optional[str] = Field(None, max_length=20)
    push_token: Optional[str] = Field(None, max_length=255)
    push_enabled: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "device_id": "ABC123-DEF456-GHI789",
                "device_type": "ios",
                "device_name": "iPhone 14 Pro",
                "device_model": "iPhone15,2",
                "os_version": "17.2",
                "app_version": "1.0.0",
                "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
                "push_enabled": True
            }
        }


class DeviceUpdate(BaseModel):
    """Update device request."""
    device_name: Optional[str] = None
    os_version: Optional[str] = None
    app_version: Optional[str] = None
    push_token: Optional[str] = None
    push_enabled: Optional[bool] = None


class DeviceOut(BaseModel):
    """Device response schema."""
    id: int
    user_id: int
    device_id: str
    device_type: str
    device_name: Optional[str]
    device_model: Optional[str]
    os_version: Optional[str]
    app_version: Optional[str]
    push_token: Optional[str]
    push_enabled: bool
    is_active: bool
    last_active: datetime
    last_ip_address: Optional[str]
    registered_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
