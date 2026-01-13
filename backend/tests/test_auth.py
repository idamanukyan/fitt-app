"""
Authentication API Tests

Tests for user registration, login, token refresh, and logout.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import UserRole


class TestRegistration:
    """Tests for user registration endpoint."""

    def test_register_success(self, client: TestClient):
        """Test successful user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepassword123"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "id" in data

    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test registration with existing email fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "anotheruser",
                "email": test_user.email,  # Existing email
                "password": "securepassword123"
            }
        )
        assert response.status_code == 400

    def test_register_duplicate_username(self, client: TestClient, test_user: User):
        """Test registration with existing username fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": test_user.username,  # Existing username
                "email": "different@example.com",
                "password": "securepassword123"
            }
        )
        assert response.status_code == 400

    def test_register_weak_password(self, client: TestClient):
        """Test registration with weak password fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "123"  # Too short
            }
        )
        assert response.status_code == 422  # Validation error


class TestLogin:
    """Tests for user login endpoint."""

    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with wrong password fails."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent email fails."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword"
            }
        )
        assert response.status_code == 401


class TestProtectedRoutes:
    """Tests for protected route access."""

    def test_access_protected_route_with_token(
        self, client: TestClient, auth_headers: dict
    ):
        """Test accessing protected route with valid token."""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200

    def test_access_protected_route_without_token(self, client: TestClient):
        """Test accessing protected route without token fails."""
        response = client.get("/api/auth/me")
        assert response.status_code == 403  # No authorization header

    def test_access_protected_route_invalid_token(self, client: TestClient):
        """Test accessing protected route with invalid token fails."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401


class TestRoleBasedAccess:
    """Tests for role-based access control."""

    def test_admin_route_as_admin(
        self, client: TestClient, admin_auth_headers: dict
    ):
        """Test admin can access admin routes."""
        response = client.get("/api/admin/users", headers=admin_auth_headers)
        assert response.status_code == 200

    def test_admin_route_as_user(
        self, client: TestClient, auth_headers: dict
    ):
        """Test regular user cannot access admin routes."""
        response = client.get("/api/admin/users", headers=auth_headers)
        assert response.status_code == 403

    def test_coach_route_as_coach(
        self, client: TestClient, coach_auth_headers: dict
    ):
        """Test coach can access coach routes."""
        response = client.get("/api/coach/clients", headers=coach_auth_headers)
        assert response.status_code == 200

    def test_coach_route_as_user(
        self, client: TestClient, auth_headers: dict
    ):
        """Test regular user cannot access coach routes."""
        response = client.get("/api/coach/clients", headers=auth_headers)
        assert response.status_code == 403
