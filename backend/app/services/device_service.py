"""
Device service with business logic.
"""
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.device_repository import DeviceRepository
from app.repositories.user_repository import UserRepository
from app.schemas.device_schema_extended import DeviceRegister, DeviceUpdate, DeviceOut


class DeviceService:
    """Device business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.device_repo = DeviceRepository(db)
        self.user_repo = UserRepository(db)

    def register_device(self, user_id: int, device_data: DeviceRegister) -> DeviceOut:
        """Register or update a device."""
        # Verify user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        device_dict = device_data.model_dump(exclude_unset=True)
        device = self.device_repo.register_device(user_id, device_dict)

        return DeviceOut.model_validate(device)

    def get_devices(self, user_id: int) -> List[DeviceOut]:
        """Get all devices for a user."""
        devices = self.device_repo.get_by_user(user_id)
        return [DeviceOut.model_validate(d) for d in devices]

    def get_active_devices(self, user_id: int) -> List[DeviceOut]:
        """Get active devices for a user."""
        devices = self.device_repo.get_active_devices(user_id)
        return [DeviceOut.model_validate(d) for d in devices]

    def get_device_by_id(self, user_id: int, device_id: int) -> DeviceOut:
        """Get a specific device."""
        device = self.device_repo.get_by_id(device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this device"
            )

        return DeviceOut.model_validate(device)

    def update_device(self, user_id: int, device_id: int, update_data: DeviceUpdate) -> DeviceOut:
        """Update a device."""
        device = self.device_repo.get_by_id(device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this device"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_device = self.device_repo.update(device_id, update_dict)

        return DeviceOut.model_validate(updated_device)

    def deactivate_device(self, user_id: int, device_id: int) -> dict:
        """Deactivate a device."""
        device = self.device_repo.get_by_id(device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to deactivate this device"
            )

        # Get device_id string from the device object
        success = self.device_repo.deactivate_device(device.device_id)
        if success:
            return {"message": "Device deactivated successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to deactivate device"
            )

    def delete_device(self, user_id: int, device_id: int) -> bool:
        """Delete a device."""
        device = self.device_repo.get_by_id(device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )

        # Verify ownership
        if device.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this device"
            )

        return self.device_repo.delete(device_id)
