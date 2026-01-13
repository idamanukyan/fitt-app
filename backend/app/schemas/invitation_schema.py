"""
Invitation Schemas

Pydantic schemas for client invitation API.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
import re

from app.models.client_invitation import InvitationStatus


# Blocked email domains (temporary/disposable email services)
BLOCKED_DOMAINS = {
    "tempmail.com", "throwaway.email", "guerrillamail.com",
    "10minutemail.com", "mailinator.com", "temp-mail.org",
    "fakeinbox.com", "trashmail.com", "getnada.com",
    "sharklasers.com", "yopmail.com", "maildrop.cc"
}


class InviteClientRequest(BaseModel):
    """Request to invite a new client."""
    email: EmailStr = Field(..., description="Client's email address")
    name: Optional[str] = Field(None, max_length=100, description="Client's name (optional)")
    message: Optional[str] = Field(
        None,
        max_length=500,
        description="Personal message to include in invitation (optional)"
    )

    @field_validator('email')
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        """Block disposable email domains."""
        email_lower = v.lower()
        domain = email_lower.split('@')[-1]

        if domain in BLOCKED_DOMAINS:
            raise ValueError(f"Email domain '{domain}' is not allowed. Please use a permanent email address.")

        return email_lower

    @field_validator('name')
    @classmethod
    def sanitize_name(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize name input."""
        if v is None:
            return None
        # Remove any HTML tags
        v = re.sub(r'<[^>]+>', '', v)
        # Strip and normalize whitespace
        v = ' '.join(v.split())
        return v if v else None

    @field_validator('message')
    @classmethod
    def sanitize_message(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize personal message."""
        if v is None:
            return None
        # Remove any HTML tags
        v = re.sub(r'<[^>]+>', '', v)
        # Normalize whitespace but preserve line breaks
        lines = v.split('\n')
        lines = [' '.join(line.split()) for line in lines]
        v = '\n'.join(lines).strip()
        return v if v else None

    class Config:
        json_schema_extra = {
            "example": {
                "email": "newclient@example.com",
                "name": "John Smith",
                "message": "Hi John! I'd love to help you reach your fitness goals. Looking forward to working with you!"
            }
        }


class InvitationResponse(BaseModel):
    """Response after sending invitation."""
    id: int
    email: str
    name: Optional[str]
    status: InvitationStatus
    created_at: datetime
    expires_at: datetime
    days_until_expiry: int
    message: str

    class Config:
        from_attributes = True


class InvitationListItem(BaseModel):
    """Invitation item for list view."""
    id: int
    email: str
    name: Optional[str]
    status: InvitationStatus
    created_at: datetime
    expires_at: datetime
    email_sent_at: Optional[datetime]
    resend_count: int

    @property
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    class Config:
        from_attributes = True


class InvitationListResponse(BaseModel):
    """Paginated list of invitations."""
    invitations: List[InvitationListItem]
    total: int
    pending_count: int
    accepted_count: int
    expired_count: int


class ResendInvitationRequest(BaseModel):
    """Request to resend an invitation."""
    invitation_id: int


class RevokeInvitationRequest(BaseModel):
    """Request to revoke an invitation."""
    invitation_id: int


class AcceptInvitationRequest(BaseModel):
    """Request to accept an invitation (used for existing users)."""
    token: str = Field(..., min_length=20, max_length=100)


class InvitationValidationResponse(BaseModel):
    """Response when validating an invitation token."""
    valid: bool
    invitation_id: Optional[int] = None
    coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    client_email: Optional[str] = None
    client_name: Optional[str] = None
    personal_message: Optional[str] = None
    expires_at: Optional[datetime] = None
    error: Optional[str] = None
    error_code: Optional[str] = None


class InvitationErrorCodes:
    """Standard error codes for invitation failures."""
    INVALID_TOKEN = "INVALID_TOKEN"
    EXPIRED_TOKEN = "EXPIRED_TOKEN"
    ALREADY_ACCEPTED = "ALREADY_ACCEPTED"
    REVOKED = "REVOKED"
    ALREADY_CLIENT = "ALREADY_CLIENT"
    ALREADY_INVITED = "ALREADY_INVITED"
    EMAIL_FAILED = "EMAIL_FAILED"
    RATE_LIMITED = "RATE_LIMITED"
