"""
Coach routes for coach profile management and client relationships.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_coach_user, get_current_user
from app.models.user import User
from app.models.client_invitation import InvitationStatus
from app.services.coach_service import CoachService
from app.services.invitation_service import InvitationService
from app.schemas.coach_schema import (
    CoachProfileCreate,
    CoachProfileOut,
    ClientBasicInfo,
    AssignClientRequest,
    UnassignClientRequest,
    CoachPublicProfile
)
from app.schemas.invitation_schema import (
    InviteClientRequest,
    InvitationResponse,
    InvitationListResponse,
    ResendInvitationRequest,
    RevokeInvitationRequest,
)
from app.schemas.goal_schema_extended import GoalOut
from app.schemas.measurement_schema_extended import MeasurementOut

router = APIRouter(prefix="/coach", tags=["Coach"])


@router.get("/profile", response_model=CoachProfileOut)
def get_coach_profile(
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Get current coach's profile.

    **Coach access required.**

    Returns coach profile with specializations, certifications, etc.
    """
    service = CoachService(db)
    profile = service.get_or_create_coach_profile(current_coach.id)
    return CoachProfileOut.model_validate(profile)


@router.post("/profile", response_model=CoachProfileOut)
@router.put("/profile", response_model=CoachProfileOut)
def update_coach_profile(
    profile_data: CoachProfileCreate,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Create or update coach profile.

    **Coach access required.**

    - **specialization**: Areas of expertise (e.g., "Weight Loss", "Strength Training")
    - **certifications**: Professional certifications (e.g., "NASM CPT, ACE")
    - **years_of_experience**: Years of coaching experience
    - **bio**: Professional biography
    - **max_clients**: Maximum number of clients (1-200, default: 50)
    - **is_accepting_clients**: Whether accepting new clients
    - **hourly_rate**: Hourly coaching rate (optional)
    - **phone_number**: Contact phone number
    - **website_url**: Personal or business website
    """
    service = CoachService(db)
    profile = service.update_coach_profile(current_coach.id, profile_data)
    return CoachProfileOut.model_validate(profile)


@router.get("/clients", response_model=List[ClientBasicInfo])
def list_my_clients(
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    List all clients assigned to current coach.

    **Coach access required.**

    Returns list of clients with basic information.
    """
    service = CoachService(db)
    clients = service.get_coach_clients(current_coach.id)

    # Convert to response schema
    client_list = []
    for client in clients:
        client_info = {
            "id": client.id,
            "username": client.username,
            "email": client.email,
            "full_name": client.profile.full_name if client.profile else None,
            "is_active": client.is_active,
            "created_at": client.created_at
        }
        client_list.append(ClientBasicInfo(**client_info))

    return client_list


@router.post("/clients/assign")
def assign_client(
    assign_data: AssignClientRequest,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Assign a client to current coach.

    **Coach access required.**

    - **client_id**: ID of the user to assign as client

    The user must have role="user". Coaches and admins cannot be assigned as clients.
    """
    service = CoachService(db)
    return service.assign_client(current_coach.id, assign_data.client_id)


@router.post("/clients/unassign")
def unassign_client(
    unassign_data: UnassignClientRequest,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Unassign a client from current coach.

    **Coach access required.**

    - **client_id**: ID of the client to unassign

    Removes the coach-client relationship.
    """
    service = CoachService(db)
    return service.unassign_client(current_coach.id, unassign_data.client_id)


@router.get("/clients/{client_id}/profile")
def get_client_profile(
    client_id: int,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    View specific client's profile.

    **Coach access required.**

    Only accessible for clients assigned to the current coach.
    """
    service = CoachService(db)
    client = service.get_client_details(current_coach.id, client_id)

    if not client.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )

    from app.schemas.profile_schema_extended import ProfileOut
    return ProfileOut.model_validate(client.profile)


@router.get("/clients/{client_id}/goals", response_model=List[GoalOut])
def get_client_goals(
    client_id: int,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    View specific client's fitness goals.

    **Coach access required.**

    Only accessible for clients assigned to the current coach.
    Returns all goals with progress tracking.
    """
    service = CoachService(db)
    client = service.get_client_details(current_coach.id, client_id)

    return [GoalOut.model_validate(goal) for goal in client.goals]


@router.get("/clients/{client_id}/measurements", response_model=List[MeasurementOut])
def get_client_measurements(
    client_id: int,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    View specific client's body measurements.

    **Coach access required.**

    Only accessible for clients assigned to the current coach.
    Returns all measurements ordered by date (newest first).
    """
    service = CoachService(db)
    client = service.get_client_details(current_coach.id, client_id)

    return [MeasurementOut.model_validate(measurement) for measurement in client.measurements]


@router.get("/clients/{client_id}/stats")
def get_client_stats(
    client_id: int,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics for specific client.

    **Coach access required.**

    Returns aggregated statistics:
    - Total goals (active/completed)
    - Total measurements
    - Latest measurement
    - Progress on active goals
    """
    service = CoachService(db)
    client = service.get_client_details(current_coach.id, client_id)

    active_goals = [g for g in client.goals if g.is_active and not g.is_completed]
    completed_goals = [g for g in client.goals if g.is_completed]
    latest_measurement = client.measurements[0] if client.measurements else None

    return {
        "client_id": client_id,
        "total_goals": len(client.goals),
        "active_goals": len(active_goals),
        "completed_goals": len(completed_goals),
        "total_measurements": len(client.measurements),
        "latest_measurement": MeasurementOut.model_validate(latest_measurement) if latest_measurement else None,
        "member_since_days": (client.created_at.now() - client.created_at).days if client.created_at else 0
    }


# Public coach discovery endpoints

@router.get("/discover", response_model=List[CoachPublicProfile], tags=["Public"])
def discover_coaches(db: Session = Depends(get_db)):
    """
    Discover available coaches (public endpoint).

    Returns list of coaches accepting new clients.
    No authentication required.
    """
    service = CoachService(db)
    coaches = service.get_available_coaches()

    result = []
    for coach in coaches:
        coach_data = {
            "user_id": coach.id,
            "username": coach.username,
            "specialization": coach.coach_profile.specialization if coach.coach_profile else None,
            "years_of_experience": coach.coach_profile.years_of_experience if coach.coach_profile else None,
            "bio": coach.coach_profile.bio if coach.coach_profile else None,
            "is_accepting_clients": coach.coach_profile.is_accepting_clients if coach.coach_profile else False,
            "hourly_rate": coach.coach_profile.hourly_rate if coach.coach_profile else None
        }
        result.append(CoachPublicProfile(**coach_data))

    return result


@router.get("/my-coaches", tags=["User"])
def get_my_coaches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get coaches assigned to current user.

    **User authentication required.**

    Returns list of coaches the user is assigned to.
    """
    coaches = current_user.assigned_coaches

    result = []
    for coach in coaches:
        coach_data = {
            "user_id": coach.id,
            "username": coach.username,
            "email": coach.email,
            "specialization": coach.coach_profile.specialization if coach.coach_profile else None,
            "years_of_experience": coach.coach_profile.years_of_experience if coach.coach_profile else None,
            "phone_number": coach.coach_profile.phone_number if coach.coach_profile else None
        }
        result.append(coach_data)

    return result


# ===== CLIENT INVITATION ENDPOINTS =====

@router.post("/clients/invite", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_client(
    invite_data: InviteClientRequest,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Send invitation to a potential client.

    **Coach access required.**

    - **email**: Client's email address (required)
    - **name**: Client's name (optional)
    - **message**: Personal message to include in invitation (optional, max 500 chars)

    The invitation email is sent immediately with a secure link.
    Link expires in 7 days.

    Idempotent: Re-inviting the same email returns the existing pending invitation.
    """
    service = InvitationService(db)
    return await service.invite_client(current_coach.id, invite_data)


@router.get("/clients/invitations", response_model=InvitationListResponse)
def get_invitations(
    status_filter: Optional[InvitationStatus] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Get all invitations sent by current coach.

    **Coach access required.**

    Optional filters:
    - **status**: Filter by status (pending, accepted, expired, revoked)
    - **skip**: Pagination offset
    - **limit**: Max results (1-100)

    Returns invitations with status counts.
    """
    service = InvitationService(db)
    return service.get_coach_invitations(
        current_coach.id,
        status_filter=status_filter,
        skip=skip,
        limit=limit
    )


@router.post("/clients/invitations/{invitation_id}/resend", response_model=InvitationResponse)
async def resend_invitation(
    invitation_id: int,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Resend an invitation email.

    **Coach access required.**

    Generates a new token and sends a fresh email.
    Maximum 3 resends per invitation.
    30-minute cooldown between resends.
    """
    service = InvitationService(db)
    return await service.resend_invitation(current_coach.id, invitation_id)


@router.delete("/clients/invitations/{invitation_id}")
def revoke_invitation(
    invitation_id: int,
    current_coach: User = Depends(get_current_coach_user),
    db: Session = Depends(get_db)
):
    """
    Revoke a pending invitation.

    **Coach access required.**

    The invitation link will no longer work.
    Only pending invitations can be revoked.
    """
    service = InvitationService(db)
    return service.revoke_invitation(current_coach.id, invitation_id)
