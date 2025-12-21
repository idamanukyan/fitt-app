"""
Device routes.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.device_service import DeviceService
from app.schemas.device_schema_extended import DeviceRegister, DeviceUpdate, DeviceOut

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.post("/", response_model=DeviceOut)
def register_device(
    device_data: DeviceRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register or update a device for push notifications."""
    service = DeviceService(db)
    return service.register_device(current_user.id, device_data)


@router.get("/", response_model=List[DeviceOut])
def get_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all devices."""
    service = DeviceService(db)
    return service.get_devices(current_user.id)


@router.get("/active", response_model=List[DeviceOut])
def get_active_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active devices."""
    service = DeviceService(db)
    return service.get_active_devices(current_user.id)


@router.put("/{device_id}", response_model=DeviceOut)
def update_device(
    device_id: int,
    update_data: DeviceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update device information."""
    service = DeviceService(db)
    return service.update_device(current_user.id, device_id, update_data)


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a device."""
    service = DeviceService(db)
    service.delete_device(current_user.id, device_id)
    return {"message": "Device removed successfully"}
