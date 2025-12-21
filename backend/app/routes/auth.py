from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.user_service import UserService
from app.schemas.user_schema_extended import UserRegister, UserLogin, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    Creates a new user account with username, email, and password.
    Returns user info and authentication token.
    """
    service = UserService(db)
    return service.register_user(user_data)


@router.post("/login", response_model=dict)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and get token.

    Returns user info and JWT token for authenticated requests.
    """
    service = UserService(db)
    return service.login_user(login_data)