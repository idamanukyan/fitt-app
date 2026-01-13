"""
Client Invitation Model

Handles coach-to-client invitations with secure tokens and lifecycle management.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from enum import Enum
import secrets
import hashlib

from app.core.database import Base


class InvitationStatus(str, Enum):
    """Invitation lifecycle states"""
    PENDING = "pending"        # Sent, awaiting acceptance
    ACCEPTED = "accepted"      # Client accepted invitation
    EXPIRED = "expired"        # Token expired without action
    REVOKED = "revoked"        # Coach cancelled invitation
    DECLINED = "declined"      # Client explicitly declined


class ClientInvitation(Base):
    """
    Secure client invitation with tokenized links.

    - One coach can have many pending invitations
    - Each invitation has a unique, secure token
    - Tokens expire after configurable period (default 7 days)
    - Supports idempotent re-invites to same email
    """
    __tablename__ = "client_invitations"

    # Composite index for common queries
    __table_args__ = (
        Index('ix_invitations_coach_status', 'coach_id', 'status'),
        Index('ix_invitations_email_coach', 'email', 'coach_id'),
        Index('ix_invitations_token_hash', 'token_hash'),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Coach who sent the invitation
    coach_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Invitee details
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(100), nullable=True)
    personal_message = Column(Text, nullable=True)

    # Token management (store hash, not raw token)
    token_hash = Column(String(64), unique=True, nullable=False)

    # Lifecycle
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)

    # If accepted, link to the client user
    accepted_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Email tracking
    email_sent_at = Column(DateTime, nullable=True)
    email_error = Column(Text, nullable=True)
    resend_count = Column(Integer, default=0, nullable=False)
    last_resend_at = Column(DateTime, nullable=True)

    # Relationships
    coach = relationship("User", foreign_keys=[coach_id], backref="sent_invitations")
    accepted_user = relationship("User", foreign_keys=[accepted_user_id])

    # Token expiry duration (7 days default)
    TOKEN_EXPIRY_DAYS = 7

    @classmethod
    def generate_token(cls) -> tuple[str, str]:
        """
        Generate a cryptographically secure token and its hash.

        Returns:
            Tuple of (raw_token, token_hash)
            - raw_token: Sent in email link (not stored in DB)
            - token_hash: Stored in DB for verification
        """
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        return raw_token, token_hash

    @classmethod
    def hash_token(cls, raw_token: str) -> str:
        """Hash a raw token for database lookup."""
        return hashlib.sha256(raw_token.encode()).hexdigest()

    @classmethod
    def create_invitation(
        cls,
        coach_id: int,
        email: str,
        name: str | None = None,
        personal_message: str | None = None,
        expiry_days: int | None = None
    ) -> tuple["ClientInvitation", str]:
        """
        Create a new invitation with secure token.

        Returns:
            Tuple of (invitation, raw_token)
        """
        raw_token, token_hash = cls.generate_token()
        expiry_days = expiry_days or cls.TOKEN_EXPIRY_DAYS

        invitation = cls(
            coach_id=coach_id,
            email=email.lower().strip(),
            name=name.strip() if name else None,
            personal_message=personal_message.strip() if personal_message else None,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(days=expiry_days)
        )

        return invitation, raw_token

    @property
    def is_expired(self) -> bool:
        """Check if invitation has expired."""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Check if invitation can still be accepted."""
        return (
            self.status == InvitationStatus.PENDING and
            not self.is_expired
        )

    @property
    def days_until_expiry(self) -> int:
        """Days remaining until expiration."""
        if self.is_expired:
            return 0
        delta = self.expires_at - datetime.utcnow()
        return max(0, delta.days)

    def mark_accepted(self, user_id: int) -> None:
        """Mark invitation as accepted."""
        self.status = InvitationStatus.ACCEPTED
        self.accepted_at = datetime.utcnow()
        self.accepted_user_id = user_id

    def mark_expired(self) -> None:
        """Mark invitation as expired."""
        self.status = InvitationStatus.EXPIRED

    def mark_revoked(self) -> None:
        """Mark invitation as revoked by coach."""
        self.status = InvitationStatus.REVOKED
        self.revoked_at = datetime.utcnow()

    def mark_email_sent(self) -> None:
        """Record successful email delivery."""
        self.email_sent_at = datetime.utcnow()
        self.email_error = None

    def mark_email_failed(self, error: str) -> None:
        """Record email delivery failure."""
        self.email_error = error[:500] if error else "Unknown error"

    def increment_resend(self) -> None:
        """Track resend attempts."""
        self.resend_count += 1
        self.last_resend_at = datetime.utcnow()

    def __repr__(self):
        return f"<ClientInvitation(id={self.id}, email='{self.email}', status={self.status.value})>"
