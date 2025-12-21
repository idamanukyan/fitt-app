"""
Coach service for managing coach profiles and client relationships.
"""
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.user import User
from app.models.coach import CoachProfile
from app.models.user_profile import UserProfile
from app.models.role import UserRole
from app.schemas.coach_schema import (
    CoachProfileCreate,
    CoachProfileOut,
    ClientBasicInfo
)


class CoachService:
    """Service for coach-related operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_or_create_coach_profile(self, user_id: int) -> CoachProfile:
        """Get existing coach profile or create a new one."""
        coach_profile = self.db.query(CoachProfile).filter(
            CoachProfile.user_id == user_id
        ).first()

        if not coach_profile:
            coach_profile = CoachProfile(user_id=user_id)
            self.db.add(coach_profile)
            self.db.commit()
            self.db.refresh(coach_profile)

        return coach_profile

    def update_coach_profile(
        self,
        user_id: int,
        profile_data: CoachProfileCreate
    ) -> CoachProfile:
        """Update coach profile."""
        coach_profile = self.get_or_create_coach_profile(user_id)

        # Update fields
        for field, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(coach_profile, field, value)

        coach_profile.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(coach_profile)

        return coach_profile

    def assign_client(self, coach_id: int, client_id: int) -> dict:
        """Assign a client to a coach."""
        # Get coach
        coach = self.db.query(User).filter(
            User.id == coach_id,
            User.role == UserRole.COACH
        ).first()

        if not coach:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach not found"
            )

        # Get client
        client = self.db.query(User).filter(
            User.id == client_id,
            User.role == UserRole.USER
        ).first()

        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )

        # Check if already assigned
        if client in coach.clients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client already assigned to this coach"
            )

        # Check coach capacity
        coach_profile = self.get_or_create_coach_profile(coach_id)
        if len(coach.clients) >= coach_profile.max_clients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coach has reached maximum client capacity"
            )

        # Assign client
        coach.clients.append(client)
        self.db.commit()

        return {
            "message": "Client assigned successfully",
            "client_id": client_id,
            "coach_id": coach_id
        }

    def unassign_client(self, coach_id: int, client_id: int) -> dict:
        """Unassign a client from a coach."""
        coach = self.db.query(User).filter(User.id == coach_id).first()
        client = self.db.query(User).filter(User.id == client_id).first()

        if not coach or not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach or client not found"
            )

        if client not in coach.clients:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client not assigned to this coach"
            )

        coach.clients.remove(client)
        self.db.commit()

        return {
            "message": "Client unassigned successfully",
            "client_id": client_id
        }

    def get_coach_clients(self, coach_id: int) -> List[User]:
        """Get all clients assigned to a coach."""
        coach = self.db.query(User).filter(
            User.id == coach_id,
            User.role == UserRole.COACH
        ).first()

        if not coach:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach not found"
            )

        return coach.clients

    def get_client_details(self, coach_id: int, client_id: int) -> User:
        """Get detailed information about a specific client."""
        coach = self.db.query(User).filter(User.id == coach_id).first()
        client = self.db.query(User).filter(User.id == client_id).first()

        if not coach or not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach or client not found"
            )

        # Verify client is assigned to this coach
        if client not in coach.clients:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This client is not assigned to you"
            )

        return client

    def get_available_coaches(self) -> List[User]:
        """Get all coaches accepting new clients."""
        coaches = self.db.query(User).join(CoachProfile).filter(
            User.role == UserRole.COACH,
            User.is_active == True,
            CoachProfile.is_accepting_clients == True
        ).all()

        return coaches
