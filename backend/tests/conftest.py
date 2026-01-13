"""
Pytest Configuration and Fixtures

Provides shared fixtures for all tests including test database setup,
test client, and authentication helpers.
"""
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.auth_enhanced import pwd_context, create_access_token
from app.models.user import User
from app.models.role import UserRole

# Test database URL - in-memory SQLite
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    """
    Create a fresh test database for each test function.

    Uses in-memory SQLite for speed and isolation.
    """
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with dependency override for database.
    """
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db: Session) -> User:
    """
    Create a test user in the database.
    """
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=pwd_context.hash("testpassword123"),
        role=UserRole.USER,
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def test_coach(test_db: Session) -> User:
    """
    Create a test coach user in the database.
    """
    coach = User(
        username="testcoach",
        email="coach@example.com",
        hashed_password=pwd_context.hash("coachpassword123"),
        role=UserRole.COACH,
        is_active=True
    )
    test_db.add(coach)
    test_db.commit()
    test_db.refresh(coach)
    return coach


@pytest.fixture
def test_admin(test_db: Session) -> User:
    """
    Create a test admin user in the database.
    """
    admin = User(
        username="testadmin",
        email="admin@example.com",
        hashed_password=pwd_context.hash("adminpassword123"),
        role=UserRole.ADMIN,
        is_active=True
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """
    Create authentication headers for a test user.
    """
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def coach_auth_headers(test_coach: User) -> dict:
    """
    Create authentication headers for a test coach.
    """
    token = create_access_token(data={"sub": str(test_coach.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(test_admin: User) -> dict:
    """
    Create authentication headers for a test admin.
    """
    token = create_access_token(data={"sub": str(test_admin.id)})
    return {"Authorization": f"Bearer {token}"}
