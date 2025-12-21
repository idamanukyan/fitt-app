"""
Measurement routes.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.measurement_service import MeasurementService
from app.schemas.measurement_schema_extended import MeasurementCreate, MeasurementUpdate, MeasurementOut

router = APIRouter(prefix="/measurements", tags=["Measurements"])


@router.post("/", response_model=MeasurementOut)
def create_measurement(
    measurement_data: MeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a new body measurement."""
    service = MeasurementService(db)
    return service.create_measurement(current_user.id, measurement_data)


@router.get("/", response_model=List[MeasurementOut])
def get_measurements(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all measurements for current user."""
    service = MeasurementService(db)
    return service.get_measurements(current_user.id, skip, limit)


@router.get("/latest", response_model=MeasurementOut)
def get_latest_measurement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the most recent measurement."""
    service = MeasurementService(db)
    return service.get_latest_measurement(current_user.id)


@router.get("/{measurement_id}", response_model=MeasurementOut)
def get_measurement(
    measurement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific measurement."""
    service = MeasurementService(db)
    return service.get_measurement_by_id(current_user.id, measurement_id)


@router.put("/{measurement_id}", response_model=MeasurementOut)
def update_measurement(
    measurement_id: int,
    update_data: MeasurementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a measurement."""
    service = MeasurementService(db)
    return service.update_measurement(current_user.id, measurement_id, update_data)


@router.delete("/{measurement_id}")
def delete_measurement(
    measurement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a measurement."""
    service = MeasurementService(db)
    service.delete_measurement(current_user.id, measurement_id)
    return {"message": "Measurement deleted successfully"}
