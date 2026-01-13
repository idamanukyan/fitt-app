"""
Invitation Routes

Public and authenticated endpoints for handling client invitations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.invitation_service import InvitationService
from app.schemas.invitation_schema import (
    InvitationValidationResponse,
    AcceptInvitationRequest,
)

router = APIRouter(prefix="/invite", tags=["Invitation"])

# App URLs
APP_URL = os.getenv("APP_URL", "https://app.hyperfit.com")
WEB_URL = os.getenv("WEB_URL", "https://hyperfit.com")


@router.get("/validate", response_model=InvitationValidationResponse)
def validate_invitation(
    token: str = Query(..., min_length=20, max_length=100),
    db: Session = Depends(get_db)
):
    """
    Validate an invitation token.

    **No authentication required.**

    This endpoint is called when user clicks the invite link.
    Returns invitation details if valid, or error info if invalid.

    Use this to show the user:
    - Who invited them
    - Any personal message
    - Expiration date

    Then redirect to sign-up or login flow.
    """
    service = InvitationService(db)
    return service.validate_token(token)


@router.get("/accept")
def accept_invitation_redirect(
    token: str = Query(..., min_length=20, max_length=100),
    db: Session = Depends(get_db)
):
    """
    Handle invitation link click.

    **No authentication required.**

    This is the endpoint users land on when clicking the email link.
    It validates the token and redirects to the appropriate page:

    - Valid token → Redirect to signup/login page with token
    - Invalid/expired → Redirect to error page

    The frontend handles the actual account creation/login.
    """
    service = InvitationService(db)
    validation = service.validate_token(token)

    if validation.valid:
        # Redirect to frontend invitation acceptance page
        redirect_url = f"{APP_URL}/auth/accept-invite?token={token}"
    else:
        # Redirect to error page with error code
        error_code = validation.error_code or "UNKNOWN"
        redirect_url = f"{APP_URL}/invite/error?code={error_code}"

    return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)


@router.post("/accept")
async def accept_invitation(
    request: AcceptInvitationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept an invitation as authenticated user.

    **Authentication required.**

    Called after user signs up or logs in via the invite flow.
    Links the user to the coach as a client.

    The user's email must match the invitation email.
    """
    service = InvitationService(db)
    return await service.accept_invitation(request.token, current_user.id)


@router.get("/info/{token}", response_model=InvitationValidationResponse)
def get_invitation_info(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed invitation information.

    **No authentication required.**

    Alternative to /validate for frontend use.
    Returns the same validation response.
    """
    service = InvitationService(db)
    return service.validate_token(token)
