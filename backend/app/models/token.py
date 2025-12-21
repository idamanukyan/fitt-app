"""
Token management models for JWT refresh tokens and blacklist.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class RefreshToken(Base):
    """
    Refresh token storage for long-lived sessions.

    Stores refresh tokens to enable token rotation and revocation.
    """
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    # Device/session tracking
    device_info = Column(String(255), nullable=True)  # User agent or device identifier
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6

    # Relationship
    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken(user_id={self.user_id}, expires_at={self.expires_at}, revoked={self.is_revoked})>"


class TokenBlacklist(Base):
    """
    Blacklist for invalidated access tokens (logout).

    Stores JTI (JWT ID) of tokens that should be rejected even if not expired.
    """
    __tablename__ = "token_blacklist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    jti = Column(String(255), unique=True, nullable=False, index=True)  # JWT ID
    token_type = Column(String(20), default="access", nullable=False)  # access or refresh
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)  # Original token expiration
    blacklisted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reason = Column(String(100), nullable=True)  # logout, suspicious_activity, password_change, etc.

    # Relationship
    user = relationship("User")

    def __repr__(self):
        return f"<TokenBlacklist(jti={self.jti}, user_id={self.user_id}, reason={self.reason})>"
