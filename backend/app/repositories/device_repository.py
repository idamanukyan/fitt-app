"""
User Device repository for database operations.

Handles all database queries related to UserDevice entity.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user_device import UserDevice
from app.repositories.base_repository import BaseRepository


class DeviceRepository(BaseRepository[UserDevice]):
    """Repository for UserDevice entity operations."""

    def __init__(self, db: Session):
        super().__init__(UserDevice, db)

    def get_by_user(self, user_id: int) -> List[UserDevice]:
        """Get all devices for a user."""
        return (
            self.db.query(UserDevice)
            .filter(UserDevice.user_id == user_id)
            .order_by(desc(UserDevice.last_active))
            .all()
        )

    def get_active_devices(self, user_id: int) -> List[UserDevice]:
        """Get all active devices for a user."""
        return (
            self.db.query(UserDevice)
            .filter(UserDevice.user_id == user_id, UserDevice.is_active == True)
            .order_by(desc(UserDevice.last_active))
            .all()
        )

    def get_by_device_id(self, device_id: str) -> Optional[UserDevice]:
        """Get device by device ID."""
        return self.db.query(UserDevice).filter(UserDevice.device_id == device_id).first()

    def get_by_push_token(self, push_token: str) -> Optional[UserDevice]:
        """Get device by push token."""
        return self.db.query(UserDevice).filter(UserDevice.push_token == push_token).first()

    def register_device(self, user_id: int, device_data: dict) -> UserDevice:
        """Register a new device for a user."""
        # Check if device already exists
        existing = self.get_by_device_id(device_data.get('device_id'))
        if existing:
            # Update existing device
            for key, value in device_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            existing.last_active = datetime.utcnow()
            existing.is_active = True
            self.db.commit()
            self.db.refresh(existing)
            return existing

        # Create new device
        device_data['user_id'] = user_id
        return self.create(device_data)

    def update_last_active(self, device_id: str) -> Optional[UserDevice]:
        """Update device's last active timestamp."""
        device = self.get_by_device_id(device_id)
        if not device:
            return None

        device.last_active = datetime.utcnow()
        self.db.commit()
        self.db.refresh(device)
        return device

    def deactivate_device(self, device_id: str) -> bool:
        """Deactivate a device."""
        device = self.get_by_device_id(device_id)
        if not device:
            return False

        device.is_active = False
        self.db.commit()
        return True

    def get_devices_with_push_enabled(self, user_id: int) -> List[UserDevice]:
        """Get all devices with push notifications enabled for a user."""
        return (
            self.db.query(UserDevice)
            .filter(
                UserDevice.user_id == user_id,
                UserDevice.is_active == True,
                UserDevice.push_enabled == True,
                UserDevice.push_token.isnot(None),
            )
            .all()
        )

    def count_active_devices(self, user_id: int) -> int:
        """Count active devices for a user."""
        return (
            self.db.query(UserDevice)
            .filter(UserDevice.user_id == user_id, UserDevice.is_active == True)
            .count()
        )
