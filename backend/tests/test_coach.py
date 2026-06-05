"""
Coach API Tests

Tests for coach profile management, client relationships, and RBAC.
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import UserRole
from app.models.coach import CoachProfile
from app.core.auth_enhanced import pwd_context, create_access_token


@pytest.fixture
def coach_profile(test_db: Session, test_coach) -> CoachProfile:
    """Create a coach profile."""
    profile = CoachProfile(
        user_id=test_coach.id,
        specialization="Strength Training",
        certifications="NASM CPT",
        years_of_experience=5,
        bio="Experienced strength coach",
        max_clients=30,
        is_accepting_clients=True,
        hourly_rate=50,
    )
    test_db.add(profile)
    test_db.commit()
    test_db.refresh(profile)
    return profile


@pytest.fixture
def second_user(test_db: Session) -> User:
    """Create a second regular user for client testing."""
    user = User(
        username="seconduser",
        email="second@example.com",
        hashed_password=pwd_context.hash("password123"),
        role=UserRole.USER,
        is_active=True,
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


class TestCoachProfile:
    """Tests for coach profile endpoints."""

    def test_get_coach_profile(
        self, client: TestClient, coach_auth_headers, coach_profile
    ):
        """Test getting coach profile."""
        response = client.get("/api/coach/profile", headers=coach_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["specialization"] == "Strength Training"
        assert data["years_of_experience"] == 5

    def test_get_profile_creates_default(
        self, client: TestClient, coach_auth_headers
    ):
        """Test getting profile creates one if none exists."""
        response = client.get("/api/coach/profile", headers=coach_auth_headers)
        assert response.status_code == 200

    def test_update_coach_profile(
        self, client: TestClient, coach_auth_headers, coach_profile
    ):
        """Test updating coach profile."""
        response = client.put(
            "/api/coach/profile",
            json={
                "specialization": "Weight Loss",
                "certifications": "NASM CPT, ACE",
                "years_of_experience": 6,
                "bio": "Updated bio",
                "max_clients": 40,
                "is_accepting_clients": True,
                "hourly_rate": 60,
            },
            headers=coach_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["specialization"] == "Weight Loss"
        assert data["hourly_rate"] == 60

    def test_create_coach_profile(self, client: TestClient, coach_auth_headers):
        """Test creating coach profile via POST."""
        response = client.post(
            "/api/coach/profile",
            json={
                "specialization": "HIIT Training",
                "years_of_experience": 3,
            },
            headers=coach_auth_headers,
        )
        assert response.status_code == 200

    def test_get_profile_as_regular_user_forbidden(
        self, client: TestClient, auth_headers
    ):
        """Test regular user cannot access coach profile."""
        response = client.get("/api/coach/profile", headers=auth_headers)
        assert response.status_code == 403

    def test_get_profile_unauthenticated(self, client: TestClient):
        """Test unauthenticated cannot access coach profile."""
        response = client.get("/api/coach/profile")
        assert response.status_code == 403


class TestClientManagement:
    """Tests for coach client management."""

    def test_assign_client(
        self, client: TestClient, coach_auth_headers, coach_profile, test_user
    ):
        """Test assigning a client to coach."""
        response = client.post(
            "/api/coach/clients/assign",
            json={"client_id": test_user.id},
            headers=coach_auth_headers,
        )
        assert response.status_code == 200

    def test_list_clients(
        self, client: TestClient, coach_auth_headers, coach_profile,
        test_db, test_coach, test_user
    ):
        """Test listing coach's clients."""
        # Assign client first
        from app.models.role import coach_clients
        test_db.execute(
            coach_clients.insert().values(
                coach_id=test_coach.id, client_id=test_user.id,
                assigned_at=datetime.utcnow().isoformat()
            )
        )
        test_db.commit()

        response = client.get("/api/coach/clients", headers=coach_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["username"] == "testuser"

    def test_unassign_client(
        self, client: TestClient, coach_auth_headers, coach_profile,
        test_db, test_coach, test_user
    ):
        """Test unassigning a client from coach."""
        from app.models.role import coach_clients
        test_db.execute(
            coach_clients.insert().values(
                coach_id=test_coach.id, client_id=test_user.id,
                assigned_at=datetime.utcnow().isoformat()
            )
        )
        test_db.commit()

        response = client.post(
            "/api/coach/clients/unassign",
            json={"client_id": test_user.id},
            headers=coach_auth_headers,
        )
        assert response.status_code == 200

    def test_list_clients_as_user_forbidden(
        self, client: TestClient, auth_headers
    ):
        """Test regular user cannot list clients."""
        response = client.get("/api/coach/clients", headers=auth_headers)
        assert response.status_code == 403

    def test_assign_client_as_user_forbidden(
        self, client: TestClient, auth_headers, second_user
    ):
        """Test regular user cannot assign clients."""
        response = client.post(
            "/api/coach/clients/assign",
            json={"client_id": second_user.id},
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestClientDetails:
    """Tests for viewing client details."""

    def test_get_client_goals(
        self, client: TestClient, coach_auth_headers, coach_profile,
        test_db, test_coach, test_user
    ):
        """Test getting client's goals."""
        from app.models.role import coach_clients
        test_db.execute(
            coach_clients.insert().values(
                coach_id=test_coach.id, client_id=test_user.id,
                assigned_at=datetime.utcnow().isoformat()
            )
        )
        test_db.commit()

        response = client.get(
            f"/api/coach/clients/{test_user.id}/goals",
            headers=coach_auth_headers,
        )
        assert response.status_code == 200

    def test_get_client_measurements(
        self, client: TestClient, coach_auth_headers, coach_profile,
        test_db, test_coach, test_user
    ):
        """Test getting client's measurements."""
        from app.models.role import coach_clients
        test_db.execute(
            coach_clients.insert().values(
                coach_id=test_coach.id, client_id=test_user.id,
                assigned_at=datetime.utcnow().isoformat()
            )
        )
        test_db.commit()

        response = client.get(
            f"/api/coach/clients/{test_user.id}/measurements",
            headers=coach_auth_headers,
        )
        assert response.status_code == 200


class TestCoachDiscovery:
    """Tests for public coach discovery."""

    def test_discover_coaches(
        self, client: TestClient, coach_profile
    ):
        """Test discovering available coaches (public endpoint)."""
        response = client.get("/api/coach/discover")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_discover_coaches_no_auth_required(self, client: TestClient):
        """Test coach discovery doesn't require auth."""
        response = client.get("/api/coach/discover")
        assert response.status_code == 200


class TestMyCoaches:
    """Tests for user viewing their coaches."""

    def test_get_my_coaches(
        self, client: TestClient, auth_headers, coach_profile,
        test_db, test_coach, test_user
    ):
        """Test getting user's assigned coaches."""
        from app.models.role import coach_clients
        test_db.execute(
            coach_clients.insert().values(
                coach_id=test_coach.id, client_id=test_user.id,
                assigned_at=datetime.utcnow().isoformat()
            )
        )
        test_db.commit()

        response = client.get("/api/coach/my-coaches", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_my_coaches_unauthenticated(self, client: TestClient):
        """Test getting coaches requires auth."""
        response = client.get("/api/coach/my-coaches")
        assert response.status_code == 403
