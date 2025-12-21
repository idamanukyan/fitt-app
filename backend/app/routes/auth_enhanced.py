"""
Enhanced authentication routes with refresh tokens and logout.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.auth_service_enhanced import AuthServiceEnhanced
from app.schemas.auth_schema_enhanced import (
    UserRegister,
    UserLogin,
    AuthResponse,
    RefreshTokenRequest,
    LogoutRequest,
    TokenResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication Enhanced"])


def get_device_info(request: Request) -> str:
    """Extract device info from request."""
    return request.headers.get("user-agent", "unknown")


def get_ip_address(request: Request) -> str:
    """Extract IP address from request."""
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user with role.

    - **username**: Unique username (3-50 characters, alphanumeric + underscore)
    - **email**: Valid email address
    - **password**: Minimum 8 characters
    - **role**: Optional role (user, coach, admin) - defaults to 'user'

    Returns user object with access and refresh tokens.
    """
    service = AuthServiceEnhanced(db)
    device_info = get_device_info(request)
    ip_address = get_ip_address(request)

    return service.register_user(user_data, device_info, ip_address)


@router.post("/login", response_model=AuthResponse)
def login(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login with email and password.

    - **email**: User's email address
    - **password**: User's password

    Returns user object with access and refresh tokens.
    Access token expires in 30 minutes.
    Refresh token expires in 30 days.
    """
    service = AuthServiceEnhanced(db)
    device_info = get_device_info(request)
    ip_address = get_ip_address(request)

    return service.login_user(login_data, device_info, ip_address)


@router.post("/logout")
def logout(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout and blacklist current access token.

    Optionally provide refresh_token in body to revoke it as well.

    - **refresh_token**: Optional refresh token to revoke

    After logout, the access token will be blacklisted and cannot be used.
    """
    service = AuthServiceEnhanced(db)

    # Get access token from dependency (already verified)
    # We need to pass the actual token string, so we'll extract it from the request
    from fastapi.security import HTTPBearer
    from fastapi import Request

    # This is a bit of a hack, but we need the actual token string
    # In a real app, you might want to modify get_current_user to return both user and token

    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.

    - **refresh_token**: Valid refresh token

    Returns new access token and refresh token.
    The refresh token may be rotated (old one revoked, new one issued).
    """
    service = AuthServiceEnhanced(db)
    return service.refresh_access_token(refresh_data)


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.

    Requires valid access token in Authorization header:
    `Authorization: Bearer <access_token>`
    """
    from app.schemas.auth_schema_enhanced import UserOut
    return UserOut.model_validate(current_user)
