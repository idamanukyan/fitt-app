"""
Enhanced authentication service with refresh tokens and role management.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt

from app.models.user import User
from app.models.token import RefreshToken, TokenBlacklist
from app.models.user_profile import UserProfile
from app.models.role import UserRole
from app.core.auth_enhanced import (
    pwd_context,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    blacklist_token,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.schemas.auth_schema_enhanced import (
    UserRegister,
    UserLogin,
    AuthResponse,
    UserOut,
    RefreshTokenRequest
)


class AuthServiceEnhanced:
    """Enhanced authentication service with refresh tokens and RBAC."""

    def __init__(self, db: Session):
        self.db = db

    def register_user(
        self,
        user_data: UserRegister,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuthResponse:
        """
        Register a new user with role and return tokens.

        Args:
            user_data: Registration data
            device_info: Optional device information
            ip_address: Optional IP address

        Returns:
            AuthResponse with user and tokens

        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if username already exists
        existing_username = self.db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Hash password
        hashed_password = pwd_context.hash(user_data.password)

        # Create user
        user = User(
            username=user_data.username.lower(),
            email=user_data.email.lower(),
            hashed_password=hashed_password,
            role=user_data.role or UserRole.USER
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Create empty profile
        profile = UserProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()

        # Generate tokens
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
        })

        refresh_token = create_refresh_token(
            user.id,
            self.db,
            device_info=device_info,
            ip_address=ip_address
        )

        return AuthResponse(
            user=UserOut.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    def login_user(
        self,
        login_data: UserLogin,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuthResponse:
        """
        Login user and return tokens.

        Args:
            login_data: Login credentials
            device_info: Optional device information
            ip_address: Optional IP address

        Returns:
            AuthResponse with user and tokens

        Raises:
            HTTPException: If credentials are invalid
        """
        # Find user by email
        user = self.db.query(User).filter(User.email == login_data.email.lower()).first()

        if not user or not pwd_context.verify(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )

        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()

        # Generate tokens
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
        })

        refresh_token = create_refresh_token(
            user.id,
            self.db,
            device_info=device_info,
            ip_address=ip_address
        )

        return AuthResponse(
            user=UserOut.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    def logout_user(self, access_token: str, refresh_token_str: Optional[str] = None) -> Dict[str, str]:
        """
        Logout user by blacklisting tokens.

        Args:
            access_token: Current access token
            refresh_token_str: Optional refresh token to revoke

        Returns:
            Success message
        """
        # Decode access token to get JTI
        try:
            payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            user_id = payload.get("sub")
            exp = payload.get("exp")

            if not jti or not user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token"
                )

            # Blacklist access token
            expires_at = datetime.fromtimestamp(exp)
            blacklist_token(jti, int(user_id), "access", expires_at, self.db, reason="logout")

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not process logout"
            )

        # If refresh token provided, revoke it
        if refresh_token_str:
            db_token = self.db.query(RefreshToken).filter(
                RefreshToken.token == refresh_token_str
            ).first()

            if db_token:
                db_token.is_revoked = True
                db_token.revoked_at = datetime.utcnow()
                self.db.commit()

        return {"message": "Logged out successfully"}

    def refresh_access_token(self, refresh_data: RefreshTokenRequest) -> Dict[str, any]:
        """
        Refresh access token using refresh token.

        Args:
            refresh_data: Refresh token request

        Returns:
            New access token and optionally rotated refresh token
        """
        # Verify refresh token
        user = verify_refresh_token(refresh_data.refresh_token, self.db)

        # Generate new access token
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value
        })

        # Optionally rotate refresh token (revoke old, create new)
        # For now, we'll keep the same refresh token
        # In production, you might want to rotate it

        return {
            "access_token": access_token,
            "refresh_token": refresh_data.refresh_token,  # Same token
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

    def revoke_all_user_tokens(self, user_id: int, reason: str = "password_change"):
        """
        Revoke all refresh tokens for a user (e.g., after password change).

        Args:
            user_id: User ID
            reason: Reason for revocation
        """
        tokens = self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False
        ).all()

        for token in tokens:
            token.is_revoked = True
            token.revoked_at = datetime.utcnow()

        self.db.commit()
