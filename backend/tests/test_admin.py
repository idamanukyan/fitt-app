"""
Admin API Tests

Tests for user management, system stats, and RBAC enforcement.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import UserRole
from app.core.auth_enhanced import pwd_context


@pytest.fixture
def extra_users(test_db: Session) -> list[User]:
    """Create additional users for listing/filtering tests."""
    users = []
    for i in range(3):
        user = User(
            username=f"extrauser{i}",
            email=f"extra{i}@example.com",
            hashed_password=pwd_context.hash("password123"),
            role=UserRole.USER,
            is_active=True,
        )
        test_db.add(user)
        users.append(user)

    inactive_user = User(
        username="inactiveuser",
        email="inactive@example.com",
        hashed_password=pwd_context.hash("password123"),
        role=UserRole.USER,
        is_active=False,
    )
    test_db.add(inactive_user)
    users.append(inactive_user)

    test_db.commit()
    for user in users:
        test_db.refresh(user)
    return users


class TestAdminListUsers:
    """Tests for admin user listing."""

    def test_list_users(
        self, client: TestClient, admin_auth_headers, extra_users
    ):
        """Test listing all users."""
        response = client.get("/api/v1/admin/users", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4  # 3 extra + 1 inactive + admin itself

    def test_list_users_pagination(
        self, client: TestClient, admin_auth_headers, extra_users
    ):
        """Test user listing with pagination."""
        response = client.get(
            "/api/v1/admin/users?skip=0&limit=2",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2

    def test_list_users_filter_by_role(
        self, client: TestClient, admin_auth_headers, test_coach, extra_users
    ):
        """Test filtering users by role."""
        response = client.get(
            "/api/v1/admin/users?role=coach",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        for user in data:
            assert user["role"] == "coach"

    def test_list_users_filter_by_active(
        self, client: TestClient, admin_auth_headers, extra_users
    ):
        """Test filtering users by active status."""
        response = client.get(
            "/api/v1/admin/users?is_active=false",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        for user in data:
            assert user["is_active"] is False

    def test_list_users_invalid_role(
        self, client: TestClient, admin_auth_headers
    ):
        """Test filtering with invalid role returns 400."""
        response = client.get(
            "/api/v1/admin/users?role=invalid",
            headers=admin_auth_headers,
        )
        assert response.status_code == 400

    def test_list_users_as_regular_user_forbidden(
        self, client: TestClient, auth_headers
    ):
        """Test regular user cannot list users."""
        response = client.get("/api/v1/admin/users", headers=auth_headers)
        assert response.status_code == 403

    def test_list_users_as_coach_forbidden(
        self, client: TestClient, coach_auth_headers
    ):
        """Test coach cannot list users."""
        response = client.get("/api/v1/admin/users", headers=coach_auth_headers)
        assert response.status_code == 403

    def test_list_users_unauthenticated(self, client: TestClient):
        """Test listing users requires auth."""
        response = client.get("/api/v1/admin/users")
        assert response.status_code == 403


class TestAdminGetUser:
    """Tests for getting user details."""

    def test_get_user_by_id(
        self, client: TestClient, admin_auth_headers, test_user
    ):
        """Test getting user by ID."""
        response = client.get(
            f"/api/v1/admin/users/{test_user.id}",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_get_nonexistent_user(self, client: TestClient, admin_auth_headers):
        """Test getting non-existent user returns 404."""
        response = client.get(
            "/api/v1/admin/users/99999",
            headers=admin_auth_headers,
        )
        assert response.status_code == 404


class TestAdminUpdateRole:
    """Tests for updating user roles."""

    def test_update_user_role_to_coach(
        self, client: TestClient, admin_auth_headers, test_user
    ):
        """Test updating user role to coach."""
        response = client.put(
            f"/api/v1/admin/users/{test_user.id}/role",
            json={"role": "coach"},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "coach"

    def test_update_user_role_nonexistent(
        self, client: TestClient, admin_auth_headers
    ):
        """Test updating role for non-existent user."""
        response = client.put(
            "/api/v1/admin/users/99999/role",
            json={"role": "coach"},
            headers=admin_auth_headers,
        )
        assert response.status_code == 404

    def test_update_role_as_user_forbidden(
        self, client: TestClient, auth_headers, test_coach
    ):
        """Test regular user cannot update roles."""
        response = client.put(
            f"/api/v1/admin/users/{test_coach.id}/role",
            json={"role": "admin"},
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestAdminActivateDeactivate:
    """Tests for activating/deactivating users."""

    def test_deactivate_user(
        self, client: TestClient, admin_auth_headers, test_user
    ):
        """Test deactivating a user."""
        response = client.put(
            f"/api/v1/admin/users/{test_user.id}/deactivate",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    def test_activate_user(
        self, client: TestClient, admin_auth_headers, test_db, test_user
    ):
        """Test activating a previously deactivated user."""
        test_user.is_active = False
        test_db.commit()

        response = client.put(
            f"/api/v1/admin/users/{test_user.id}/activate",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True

    def test_cannot_deactivate_self(
        self, client: TestClient, admin_auth_headers, test_admin
    ):
        """Test admin cannot deactivate themselves."""
        response = client.put(
            f"/api/v1/admin/users/{test_admin.id}/deactivate",
            headers=admin_auth_headers,
        )
        assert response.status_code == 400

    def test_deactivate_nonexistent_user(
        self, client: TestClient, admin_auth_headers
    ):
        """Test deactivating non-existent user returns 404."""
        response = client.put(
            "/api/v1/admin/users/99999/deactivate",
            headers=admin_auth_headers,
        )
        assert response.status_code == 404


class TestAdminDeleteUser:
    """Tests for deleting users."""

    def test_delete_user(
        self, client: TestClient, admin_auth_headers, test_user
    ):
        """Test deleting a user."""
        response = client.delete(
            f"/api/v1/admin/users/{test_user.id}",
            headers=admin_auth_headers,
        )
        assert response.status_code == 200

    def test_cannot_delete_self(
        self, client: TestClient, admin_auth_headers, test_admin
    ):
        """Test admin cannot delete themselves."""
        response = client.delete(
            f"/api/v1/admin/users/{test_admin.id}",
            headers=admin_auth_headers,
        )
        assert response.status_code == 400

    def test_delete_nonexistent_user(self, client: TestClient, admin_auth_headers):
        """Test deleting non-existent user returns 404."""
        response = client.delete(
            "/api/v1/admin/users/99999",
            headers=admin_auth_headers,
        )
        assert response.status_code == 404

    def test_delete_user_as_user_forbidden(
        self, client: TestClient, auth_headers, test_coach
    ):
        """Test regular user cannot delete users."""
        response = client.delete(
            f"/api/v1/admin/users/{test_coach.id}",
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestAdminStats:
    """Tests for system statistics."""

    def test_get_system_stats(
        self, client: TestClient, admin_auth_headers, test_user, test_coach
    ):
        """Test getting system statistics."""
        response = client.get("/api/v1/admin/stats", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "active_users" in data
        assert "inactive_users" in data
        assert "users_by_role" in data
        assert data["total_users"] >= 3  # user + coach + admin

    def test_get_stats_as_user_forbidden(self, client: TestClient, auth_headers):
        """Test regular user cannot get stats."""
        response = client.get("/api/v1/admin/stats", headers=auth_headers)
        assert response.status_code == 403

    def test_get_stats_unauthenticated(self, client: TestClient):
        """Test getting stats requires auth."""
        response = client.get("/api/v1/admin/stats")
        assert response.status_code == 403
