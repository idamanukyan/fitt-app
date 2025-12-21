"""
Measurement service with business logic.
"""
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.measurement_repository import MeasurementRepository
from app.repositories.user_repository import UserRepository
from app.schemas.measurement_schema_extended import MeasurementCreate, MeasurementUpdate, MeasurementOut


class MeasurementService:
    """Measurement business logic service."""

    def __init__(self, db: Session):
        self.db = db
        self.measurement_repo = MeasurementRepository(db)
        self.user_repo = UserRepository(db)

    def create_measurement(self, user_id: int, measurement_data: MeasurementCreate) -> MeasurementOut:
        """Create a new measurement."""
        # Verify user exists
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        measurement_dict = measurement_data.model_dump(exclude_unset=True)

        # Set recorded_at to now if not provided
        if 'recorded_at' not in measurement_dict or measurement_dict['recorded_at'] is None:
            measurement_dict['recorded_at'] = datetime.utcnow()

        measurement = self.measurement_repo.create_measurement(user_id, measurement_dict)
        return MeasurementOut.model_validate(measurement)

    def get_measurements(self, user_id: int, skip: int = 0, limit: int = 100) -> List[MeasurementOut]:
        """Get all measurements for a user."""
        measurements = self.measurement_repo.get_by_user(user_id, skip, limit)
        return [MeasurementOut.model_validate(m) for m in measurements]

    def get_latest_measurement(self, user_id: int) -> MeasurementOut:
        """Get the most recent measurement."""
        measurement = self.measurement_repo.get_latest_by_user(user_id)
        if not measurement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No measurements found"
            )
        return MeasurementOut.model_validate(measurement)

    def get_measurement_by_id(self, user_id: int, measurement_id: int) -> MeasurementOut:
        """Get a specific measurement."""
        measurement = self.measurement_repo.get_by_id(measurement_id)
        if not measurement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Measurement not found"
            )

        # Verify ownership
        if measurement.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this measurement"
            )

        return MeasurementOut.model_validate(measurement)

    def update_measurement(self, user_id: int, measurement_id: int, update_data: MeasurementUpdate) -> MeasurementOut:
        """Update a measurement."""
        measurement = self.measurement_repo.get_by_id(measurement_id)
        if not measurement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Measurement not found"
            )

        # Verify ownership
        if measurement.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this measurement"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        updated_measurement = self.measurement_repo.update(measurement_id, update_dict)

        return MeasurementOut.model_validate(updated_measurement)

    def delete_measurement(self, user_id: int, measurement_id: int) -> bool:
        """Delete a measurement."""
        measurement = self.measurement_repo.get_by_id(measurement_id)
        if not measurement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Measurement not found"
            )

        # Verify ownership
        if measurement.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this measurement"
            )

        return self.measurement_repo.delete(measurement_id)
