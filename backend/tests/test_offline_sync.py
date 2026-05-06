"""Tests for offline sync / idempotent session creation."""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def get_auth_headers(client: TestClient) -> dict:
    """Register and login a test user, return auth headers."""
    ts = str(datetime.now().timestamp()).replace(".", "")
    email = f"offline_test_{ts}@test.com"
    username = f"offline_{ts}"
    client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": "TestPass123!"
    })
    response = client.post("/api/auth/login", json={
        "email": email,
        "password": "TestPass123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_session_with_client_id():
    """Session creation accepts client_id field."""
    headers = get_auth_headers(client)
    session_data = {
        "client_id": "test-uuid-12345",
        "started_at": "2024-01-15T10:00:00",
        "is_completed": True,
        "duration_minutes": 45,
        "total_volume": 5000,
        "total_reps": 100,
        "total_exercises": 5,
        "exercise_logs": []
    }
    response = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response.status_code == 201
    assert response.json()["client_id"] == "test-uuid-12345"


def test_duplicate_client_id_returns_existing_session():
    """Submitting the same client_id twice returns the first session (idempotent)."""
    headers = get_auth_headers(client)
    session_data = {
        "client_id": "dedup-uuid-99999",
        "started_at": "2024-01-15T10:00:00",
        "is_completed": True,
        "duration_minutes": 30,
        "total_volume": 3000,
        "total_reps": 60,
        "total_exercises": 3,
        "exercise_logs": []
    }

    # First creation
    response1 = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response1.status_code == 201
    session_id_1 = response1.json()["id"]

    # Second creation with same client_id
    response2 = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response2.status_code == 200
    session_id_2 = response2.json()["id"]

    # Same session returned
    assert session_id_1 == session_id_2


def test_create_session_without_client_id_still_works():
    """Sessions without client_id work normally (backwards compat)."""
    headers = get_auth_headers(client)
    session_data = {
        "started_at": "2024-01-15T10:00:00",
        "is_completed": False,
        "total_volume": 0,
        "total_reps": 0,
        "total_exercises": 0,
        "exercise_logs": []
    }
    response = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response.status_code == 201
