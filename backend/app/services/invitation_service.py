"""
Invitation Service

Business logic for client invitations with email delivery.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
from fastapi import HTTPException, status
import logging

from app.models.user import User
from app.models.client_invitation import ClientInvitation, InvitationStatus
from app.models.role import UserRole
from app.schemas.invitation_schema import (
    InviteClientRequest,
    InvitationResponse,
    InvitationListItem,
    InvitationListResponse,
    InvitationValidationResponse,
    InvitationErrorCodes,
)
from app.services.email import get_email_service
from app.services.coach_service import CoachService

logger = logging.getLogger(__name__)


class InvitationService:
    """Service for managing client invitations."""

    # Rate limiting constants
    MAX_INVITES_PER_HOUR = 20
    MAX_RESENDS_PER_INVITE = 3
    RESEND_COOLDOWN_MINUTES = 30

    def __init__(self, db: Session):
        self.db = db
        self.email_service = get_email_service()

    async def invite_client(
        self,
        coach_id: int,
        request: InviteClientRequest
    ) -> InvitationResponse:
        """
        Send invitation to a potential client.

        Handles:
        - Idempotent re-invites to same email
        - Already active client detection
        - Email delivery
        - Rate limiting
        """
        email = request.email.lower().strip()

        # Get coach info
        coach = self.db.query(User).filter(
            User.id == coach_id,
            User.role == UserRole.COACH
        ).first()

        if not coach:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach not found"
            )

        coach_name = coach.profile.full_name if coach.profile and coach.profile.full_name else coach.username

        # Check rate limit
        self._check_rate_limit(coach_id)

        # Check if email is already an active client
        existing_user = self.db.query(User).filter(
            func.lower(User.email) == email
        ).first()

        if existing_user:
            # Check if already a client of this coach
            if existing_user in coach.clients:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": "This person is already your client",
                        "code": InvitationErrorCodes.ALREADY_CLIENT
                    }
                )

        # Check for existing pending invitation
        existing_invite = self.db.query(ClientInvitation).filter(
            ClientInvitation.coach_id == coach_id,
            func.lower(ClientInvitation.email) == email,
            ClientInvitation.status == InvitationStatus.PENDING
        ).first()

        if existing_invite:
            # Idempotent: return existing invitation if still valid
            if existing_invite.is_valid:
                return InvitationResponse(
                    id=existing_invite.id,
                    email=existing_invite.email,
                    name=existing_invite.name,
                    status=existing_invite.status,
                    created_at=existing_invite.created_at,
                    expires_at=existing_invite.expires_at,
                    days_until_expiry=existing_invite.days_until_expiry,
                    message=f"Invitation already sent to {email}. Expires in {existing_invite.days_until_expiry} days."
                )
            else:
                # Expired invitation - update it
                existing_invite.mark_expired()
                self.db.commit()

        # Create new invitation
        invitation, raw_token = ClientInvitation.create_invitation(
            coach_id=coach_id,
            email=email,
            name=request.name,
            personal_message=request.message
        )

        self.db.add(invitation)
        self.db.flush()  # Get ID before email send

        # Send invitation email
        email_result = await self.email_service.send_client_invitation(
            to_email=email,
            coach_name=coach_name,
            client_name=request.name,
            personal_message=request.message,
            invite_token=raw_token,
            expiry_days=invitation.days_until_expiry
        )

        if email_result.success:
            invitation.mark_email_sent()
            logger.info(f"Invitation email sent to {email} for coach {coach_id}")
        else:
            invitation.mark_email_failed(email_result.error or "Unknown error")
            logger.error(f"Failed to send invitation email to {email}: {email_result.error}")

            # Don't fail the request if it's console mode (development)
            if not self.email_service.is_production_ready:
                logger.warning("Email service in console mode - invitation created without real email delivery")
            else:
                # Production failure - rollback and raise
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "message": "Failed to send invitation email. Please try again.",
                        "code": InvitationErrorCodes.EMAIL_FAILED
                    }
                )

        self.db.commit()
        self.db.refresh(invitation)

        return InvitationResponse(
            id=invitation.id,
            email=invitation.email,
            name=invitation.name,
            status=invitation.status,
            created_at=invitation.created_at,
            expires_at=invitation.expires_at,
            days_until_expiry=invitation.days_until_expiry,
            message=f"Invitation sent successfully to {email}"
        )

    def get_coach_invitations(
        self,
        coach_id: int,
        status_filter: Optional[InvitationStatus] = None,
        skip: int = 0,
        limit: int = 50
    ) -> InvitationListResponse:
        """Get all invitations sent by a coach."""
        query = self.db.query(ClientInvitation).filter(
            ClientInvitation.coach_id == coach_id
        )

        if status_filter:
            query = query.filter(ClientInvitation.status == status_filter)

        # Update expired invitations
        self._update_expired_invitations(coach_id)

        total = query.count()

        invitations = query.order_by(
            ClientInvitation.created_at.desc()
        ).offset(skip).limit(limit).all()

        # Get counts by status
        status_counts = self.db.query(
            ClientInvitation.status,
            func.count(ClientInvitation.id)
        ).filter(
            ClientInvitation.coach_id == coach_id
        ).group_by(ClientInvitation.status).all()

        counts = {s.value: 0 for s in InvitationStatus}
        for status_val, count in status_counts:
            counts[status_val.value] = count

        return InvitationListResponse(
            invitations=[
                InvitationListItem(
                    id=inv.id,
                    email=inv.email,
                    name=inv.name,
                    status=inv.status,
                    created_at=inv.created_at,
                    expires_at=inv.expires_at,
                    email_sent_at=inv.email_sent_at,
                    resend_count=inv.resend_count
                ) for inv in invitations
            ],
            total=total,
            pending_count=counts.get("pending", 0),
            accepted_count=counts.get("accepted", 0),
            expired_count=counts.get("expired", 0)
        )

    async def resend_invitation(
        self,
        coach_id: int,
        invitation_id: int
    ) -> InvitationResponse:
        """Resend an invitation email."""
        invitation = self._get_invitation_for_coach(coach_id, invitation_id)

        # Check resend limits
        if invitation.resend_count >= self.MAX_RESENDS_PER_INVITE:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Maximum resend limit ({self.MAX_RESENDS_PER_INVITE}) reached for this invitation"
            )

        # Check cooldown
        if invitation.last_resend_at:
            cooldown_end = invitation.last_resend_at + timedelta(minutes=self.RESEND_COOLDOWN_MINUTES)
            if datetime.utcnow() < cooldown_end:
                minutes_left = (cooldown_end - datetime.utcnow()).seconds // 60
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {minutes_left} minutes before resending"
                )

        if not invitation.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot resend: invitation is no longer valid"
            )

        # Generate new token
        raw_token, token_hash = ClientInvitation.generate_token()
        invitation.token_hash = token_hash
        invitation.expires_at = datetime.utcnow() + timedelta(days=ClientInvitation.TOKEN_EXPIRY_DAYS)
        invitation.increment_resend()

        # Get coach info
        coach = self.db.query(User).filter(User.id == coach_id).first()
        coach_name = coach.profile.full_name if coach.profile and coach.profile.full_name else coach.username

        # Send email
        email_result = await self.email_service.send_client_invitation(
            to_email=invitation.email,
            coach_name=coach_name,
            client_name=invitation.name,
            personal_message=invitation.personal_message,
            invite_token=raw_token,
            expiry_days=invitation.days_until_expiry
        )

        if email_result.success:
            invitation.mark_email_sent()
        else:
            invitation.mark_email_failed(email_result.error)

        self.db.commit()
        self.db.refresh(invitation)

        return InvitationResponse(
            id=invitation.id,
            email=invitation.email,
            name=invitation.name,
            status=invitation.status,
            created_at=invitation.created_at,
            expires_at=invitation.expires_at,
            days_until_expiry=invitation.days_until_expiry,
            message=f"Invitation resent to {invitation.email}"
        )

    def revoke_invitation(
        self,
        coach_id: int,
        invitation_id: int
    ) -> dict:
        """Revoke a pending invitation."""
        invitation = self._get_invitation_for_coach(coach_id, invitation_id)

        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot revoke: invitation status is '{invitation.status.value}'"
            )

        invitation.mark_revoked()
        self.db.commit()

        return {
            "message": f"Invitation to {invitation.email} has been revoked",
            "invitation_id": invitation_id
        }

    def validate_token(self, token: str) -> InvitationValidationResponse:
        """
        Validate an invitation token.

        Used when user clicks invite link.
        """
        token_hash = ClientInvitation.hash_token(token)

        invitation = self.db.query(ClientInvitation).filter(
            ClientInvitation.token_hash == token_hash
        ).first()

        if not invitation:
            return InvitationValidationResponse(
                valid=False,
                error="Invalid invitation link",
                error_code=InvitationErrorCodes.INVALID_TOKEN
            )

        if invitation.status == InvitationStatus.ACCEPTED:
            return InvitationValidationResponse(
                valid=False,
                error="This invitation has already been accepted",
                error_code=InvitationErrorCodes.ALREADY_ACCEPTED
            )

        if invitation.status == InvitationStatus.REVOKED:
            return InvitationValidationResponse(
                valid=False,
                error="This invitation has been revoked",
                error_code=InvitationErrorCodes.REVOKED
            )

        if invitation.is_expired:
            invitation.mark_expired()
            self.db.commit()
            return InvitationValidationResponse(
                valid=False,
                error="This invitation has expired. Please request a new invitation from your coach.",
                error_code=InvitationErrorCodes.EXPIRED_TOKEN
            )

        # Get coach info
        coach = invitation.coach
        coach_name = coach.profile.full_name if coach.profile and coach.profile.full_name else coach.username

        return InvitationValidationResponse(
            valid=True,
            invitation_id=invitation.id,
            coach_name=coach_name,
            coach_email=coach.email,
            client_email=invitation.email,
            client_name=invitation.name,
            personal_message=invitation.personal_message,
            expires_at=invitation.expires_at
        )

    async def accept_invitation(
        self,
        token: str,
        user_id: int
    ) -> dict:
        """
        Accept an invitation for an authenticated user.

        This links the user to the coach as a client.
        """
        token_hash = ClientInvitation.hash_token(token)

        invitation = self.db.query(ClientInvitation).filter(
            ClientInvitation.token_hash == token_hash
        ).first()

        if not invitation or not invitation.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired invitation"
            )

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Verify email matches (if user is logged in with different email)
        if user.email.lower() != invitation.email.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This invitation was sent to a different email address"
            )

        # Check if already a client
        coach = invitation.coach
        if user in coach.clients:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already a client of this coach"
            )

        # Use coach service to assign client
        coach_service = CoachService(self.db)
        try:
            coach_service.assign_client(coach.id, user.id)
        except HTTPException:
            raise

        # Mark invitation as accepted
        invitation.mark_accepted(user.id)
        self.db.commit()

        # Send notification to coach
        coach_name = coach.profile.full_name if coach.profile and coach.profile.full_name else coach.username
        client_name = user.profile.full_name if user.profile and user.profile.full_name else user.username

        await self.email_service.send_invitation_accepted_notification(
            coach_email=coach.email,
            coach_name=coach_name,
            client_name=client_name,
            client_email=user.email
        )

        return {
            "message": f"Successfully joined {coach_name}'s coaching program!",
            "coach_id": coach.id,
            "coach_name": coach_name
        }

    def _get_invitation_for_coach(
        self,
        coach_id: int,
        invitation_id: int
    ) -> ClientInvitation:
        """Get invitation belonging to coach."""
        invitation = self.db.query(ClientInvitation).filter(
            ClientInvitation.id == invitation_id,
            ClientInvitation.coach_id == coach_id
        ).first()

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found"
            )

        return invitation

    def _check_rate_limit(self, coach_id: int) -> None:
        """Check if coach has exceeded invitation rate limit."""
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)

        recent_count = self.db.query(ClientInvitation).filter(
            ClientInvitation.coach_id == coach_id,
            ClientInvitation.created_at > one_hour_ago
        ).count()

        if recent_count >= self.MAX_INVITES_PER_HOUR:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": f"Rate limit exceeded. Maximum {self.MAX_INVITES_PER_HOUR} invitations per hour.",
                    "code": InvitationErrorCodes.RATE_LIMITED
                }
            )

    def _update_expired_invitations(self, coach_id: int) -> None:
        """Mark expired invitations."""
        self.db.query(ClientInvitation).filter(
            ClientInvitation.coach_id == coach_id,
            ClientInvitation.status == InvitationStatus.PENDING,
            ClientInvitation.expires_at < datetime.utcnow()
        ).update({"status": InvitationStatus.EXPIRED})
        self.db.commit()
