"""
Enhanced authentication utilities with refresh tokens, JWT blacklist, and RBAC.

Features:
- Access and refresh token generation
- JWT ID (JTI) for token blacklisting
- Secure password hashing with BCrypt
- Role-Based Access Control (RBAC)
- Token blacklist checking
- Token rotation on refresh
"""
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from functools import wraps
import bcrypt
import uuid

from app.models.user import User
from app.models.token import RefreshToken, TokenBlacklist
from app.models.role import UserRole
from app.core.database import get_db
from app.core.config import settings

# Security Configuration - loaded from environment
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

# HTTP Bearer token scheme
security = HTTPBearer()


class PasswordHasher:
    """BCrypt password hasher with cost factor 12."""

    @staticmethod
    def hash(password: str) -> str:
        """Hash a password using bcrypt with cost factor 12."""
        salt = bcrypt.gensalt(rounds=12)  # Cost factor: 2^12 iterations
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash."""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )


# Password hasher instance
pwd_context = PasswordHasher()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with JTI (JWT ID) for blacklisting.

    Args:
        data: Dictionary containing claims to encode
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string with JTI
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    # Add JTI for token blacklisting
    jti = str(uuid.uuid4())

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": jti,
        "type": "access"
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int, db: Session, device_info: Optional[str] = None, ip_address: Optional[str] = None) -> str:
    """
    Create a refresh token and store it in database.

    Args:
        user_id: User ID
        db: Database session
        device_info: Optional device information
        ip_address: Optional IP address

    Returns:
        Encoded refresh token string
    """
    jti = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    token_data = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": jti,
        "type": "refresh"
    }

    token_string = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    # Store refresh token in database
    db_token = RefreshToken(
        user_id=user_id,
        token=token_string,
        expires_at=expire,
        device_info=device_info,
        ip_address=ip_address
    )
    db.add(db_token)
    db.commit()

    return token_string


def verify_refresh_token(token: str, db: Session) -> Optional[User]:
    """
    Verify refresh token and return user if valid.

    Args:
        token: Refresh token string
        db: Database session

    Returns:
        User object if valid, None otherwise

    Raises:
        HTTPException: If token is invalid or revoked
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        jti = payload.get("jti")
        user_id = payload.get("sub")

        # Check if token is in database and not revoked
        db_token = db.query(RefreshToken).filter(
            RefreshToken.token == token,
            RefreshToken.is_revoked == False
        ).first()

        if not db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token revoked or invalid"
            )

        # Check if token is expired
        if db_token.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )

        # Get user
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate token"
        )


def blacklist_token(jti: str, user_id: int, token_type: str, expires_at: datetime, db: Session, reason: Optional[str] = None):
    """
    Add a token to the blacklist.

    Args:
        jti: JWT ID
        user_id: User ID
        token_type: Type of token (access or refresh)
        expires_at: Token expiration time
        db: Database session
        reason: Optional reason for blacklisting
    """
    blacklist_entry = TokenBlacklist(
        jti=jti,
        token_type=token_type,
        user_id=user_id,
        expires_at=expires_at,
        reason=reason or "logout"
    )
    db.add(blacklist_entry)
    db.commit()


def is_token_blacklisted(jti: str, db: Session) -> bool:
    """
    Check if a token JTI is blacklisted.

    Args:
        jti: JWT ID
        db: Database session

    Returns:
        True if blacklisted, False otherwise
    """
    return db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first() is not None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Decode JWT token, check blacklist, and retrieve current user.

    Args:
        credentials: HTTP Bearer credentials
        db: Database session

    Returns:
        User object

    Raises:
        HTTPException: If token is invalid, blacklisted, or user not found
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        jti = payload.get("jti")
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or not jti:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Check if token is blacklisted
        if is_token_blacklisted(jti, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"}
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


# Role-based permission dependencies

def require_role(allowed_roles: List[UserRole]):
    """
    Dependency to check if user has required role.

    Usage:
        @app.get("/admin/users", dependencies=[Depends(require_role([UserRole.ADMIN]))])
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return current_user
    return role_checker


# Convenience dependencies for common role checks

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def get_current_coach_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires COACH role."""
    if current_user.role != UserRole.COACH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required"
        )
    return current_user


def get_current_coach_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires COACH or ADMIN role."""
    if current_user.role not in [UserRole.COACH, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach or Admin access required"
        )
    return current_user


async def get_optional_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency that optionally returns the current user if authenticated.
    Returns None if no valid token is provided (does not raise an error).
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None or not user.is_active:
            return None

        return user
    except JWTError:
        return None
