"""
Workout API Tests

Tests for workout templates, user workouts, sessions, and statistics.
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.workout import (
    WorkoutTemplate, WorkoutType, UserWorkout,
    WorkoutSession, ExerciseLog
)
from app.models.exercise import Exercise, MuscleGroup, BodyPart, Equipment, ExerciseCategory


@pytest.fixture
def sample_exercise(test_db: Session) -> Exercise:
    """Create a sample exercise for testing."""
    exercise = Exercise(
        name="Bench Press",
        slug="bench-press",
        description="Chest exercise",
        muscle_group=MuscleGroup.CHEST,
        body_part=BodyPart.CHEST,
        equipment=Equipment.BARBELL,
        category=ExerciseCategory.STRENGTH,
        is_active=True,
    )
    test_db.add(exercise)
    test_db.commit()
    test_db.refresh(exercise)
    return exercise


@pytest.fixture
def sample_template(test_db: Session, test_coach) -> WorkoutTemplate:
    """Create a sample workout template."""
    template = WorkoutTemplate(
        name="Push Day",
        slug="push-day",
        description="Push workout",
        workout_type=WorkoutType.PUSH,
        difficulty_level="intermediate",
        duration_minutes=60,
        calories_burned=350,
        is_public=True,
        is_active=True,
        created_by_user_id=test_coach.id,
        created_by_coach=True,
    )
    test_db.add(template)
    test_db.commit()
    test_db.refresh(template)
    return template


@pytest.fixture
def sample_user_workout(test_db: Session, test_user) -> UserWorkout:
    """Create a sample user workout."""
    workout = UserWorkout(
        user_id=test_user.id,
        name="My Push Day",
        description="Personal push workout",
        workout_type=WorkoutType.PUSH,
        is_active=True,
        is_favorite=False,
    )
    test_db.add(workout)
    test_db.commit()
    test_db.refresh(workout)
    return workout


@pytest.fixture
def sample_session(test_db: Session, test_user, sample_user_workout) -> WorkoutSession:
    """Create a sample workout session."""
    session = WorkoutSession(
        user_id=test_user.id,
        user_workout_id=sample_user_workout.id,
        title="Morning Workout",
        started_at=datetime(2024, 1, 15, 10, 0),
        ended_at=datetime(2024, 1, 15, 11, 0),
        duration_minutes=60,
        total_volume=3000.0,
        total_reps=100,
        total_exercises=5,
        calories_burned=350,
        is_completed=True,
        rating=4,
    )
    test_db.add(session)
    test_db.commit()
    test_db.refresh(session)
    return session


class TestWorkoutTemplateList:
    """Tests for listing workout templates."""

    def test_list_templates(self, client: TestClient, sample_template):
        """Test listing public templates."""
        response = client.get("/api/v1/workouts/templates")
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        assert "total" in data
        assert data["total"] >= 1

    def test_list_templates_pagination(self, client: TestClient, sample_template):
        """Test template list pagination."""
        response = client.get("/api/v1/workouts/templates?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5

    def test_list_templates_no_auth_required(self, client: TestClient):
        """Test that listing templates doesn't require authentication."""
        response = client.get("/api/v1/workouts/templates")
        assert response.status_code == 200


class TestWorkoutTemplateDetail:
    """Tests for workout template detail endpoint."""

    def test_get_template(self, client: TestClient, sample_template):
        """Test getting template by ID."""
        response = client.get(f"/api/v1/workouts/templates/{sample_template.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Push Day"
        assert data["workout_type"] == "push"

    def test_get_nonexistent_template(self, client: TestClient):
        """Test getting non-existent template returns 404."""
        response = client.get("/api/v1/workouts/templates/99999")
        assert response.status_code == 404


class TestWorkoutTemplateCreate:
    """Tests for creating workout templates."""

    def test_create_template_as_coach(
        self, client: TestClient, coach_auth_headers, sample_exercise
    ):
        """Test coach can create a template."""
        response = client.post(
            "/api/v1/workouts/templates",
            json={
                "name": "New Template",
                "workout_type": "strength",
                "description": "A new strength template",
                "difficulty_level": "beginner",
                "duration_minutes": 45,
            },
            headers=coach_auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Template"
        assert data["workout_type"] == "strength"

    def test_create_template_as_admin(
        self, client: TestClient, admin_auth_headers
    ):
        """Test admin can create a template."""
        response = client.post(
            "/api/v1/workouts/templates",
            json={
                "name": "Admin Template",
                "workout_type": "hiit",
            },
            headers=admin_auth_headers,
        )
        assert response.status_code == 201

    def test_create_template_as_regular_user_forbidden(
        self, client: TestClient, auth_headers
    ):
        """Test regular user cannot create templates."""
        response = client.post(
            "/api/v1/workouts/templates",
            json={
                "name": "User Template",
                "workout_type": "strength",
            },
            headers=auth_headers,
        )
        assert response.status_code == 403

    def test_create_template_unauthenticated(self, client: TestClient):
        """Test unauthenticated user cannot create templates."""
        response = client.post(
            "/api/v1/workouts/templates",
            json={
                "name": "No Auth Template",
                "workout_type": "strength",
            },
        )
        assert response.status_code == 403


class TestWorkoutTemplateUpdate:
    """Tests for updating workout templates."""

    def test_update_template(
        self, client: TestClient, coach_auth_headers, sample_template
    ):
        """Test coach can update their own template."""
        response = client.put(
            f"/api/v1/workouts/templates/{sample_template.id}",
            json={"name": "Updated Push Day", "duration_minutes": 90},
            headers=coach_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Push Day"

    def test_update_template_regular_user_forbidden(
        self, client: TestClient, auth_headers, sample_template
    ):
        """Test regular user cannot update templates."""
        response = client.put(
            f"/api/v1/workouts/templates/{sample_template.id}",
            json={"name": "Hacked"},
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestWorkoutTemplateDelete:
    """Tests for deleting workout templates."""

    def test_delete_template(
        self, client: TestClient, coach_auth_headers, sample_template
    ):
        """Test coach can delete their own template."""
        response = client.delete(
            f"/api/v1/workouts/templates/{sample_template.id}",
            headers=coach_auth_headers,
        )
        assert response.status_code == 200

    def test_delete_template_regular_user_forbidden(
        self, client: TestClient, auth_headers, sample_template
    ):
        """Test regular user cannot delete templates."""
        response = client.delete(
            f"/api/v1/workouts/templates/{sample_template.id}",
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestUserWorkouts:
    """Tests for user workout CRUD."""

    def test_list_my_workouts(
        self, client: TestClient, auth_headers, sample_user_workout
    ):
        """Test listing user's workouts."""
        response = client.get("/api/v1/workouts/my-workouts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "workouts" in data
        assert data["total"] >= 1

    def test_list_my_workouts_unauthenticated(self, client: TestClient):
        """Test listing workouts requires auth."""
        response = client.get("/api/v1/workouts/my-workouts")
        assert response.status_code == 403

    def test_get_my_workout(
        self, client: TestClient, auth_headers, sample_user_workout
    ):
        """Test getting a specific user workout."""
        response = client.get(
            f"/api/v1/workouts/my-workouts/{sample_user_workout.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "My Push Day"

    def test_get_other_user_workout(
        self, client: TestClient, coach_auth_headers, sample_user_workout
    ):
        """Test user cannot access another user's workout."""
        response = client.get(
            f"/api/v1/workouts/my-workouts/{sample_user_workout.id}",
            headers=coach_auth_headers,
        )
        assert response.status_code == 404

    def test_create_my_workout(self, client: TestClient, auth_headers):
        """Test creating a personal workout."""
        response = client.post(
            "/api/v1/workouts/my-workouts",
            json={
                "name": "My Custom Workout",
                "workout_type": "strength",
                "description": "A custom workout plan",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "My Custom Workout"

    def test_update_my_workout(
        self, client: TestClient, auth_headers, sample_user_workout
    ):
        """Test updating a user workout."""
        response = client.put(
            f"/api/v1/workouts/my-workouts/{sample_user_workout.id}",
            json={"name": "Updated Workout", "is_favorite": True},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Workout"

    def test_delete_my_workout(
        self, client: TestClient, auth_headers, sample_user_workout
    ):
        """Test deleting a user workout."""
        response = client.delete(
            f"/api/v1/workouts/my-workouts/{sample_user_workout.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

    def test_get_nonexistent_workout(self, client: TestClient, auth_headers):
        """Test getting non-existent workout returns 404."""
        response = client.get(
            "/api/v1/workouts/my-workouts/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestWorkoutSessions:
    """Tests for workout session endpoints."""

    def test_list_sessions(
        self, client: TestClient, auth_headers, sample_session
    ):
        """Test listing workout sessions."""
        response = client.get("/api/v1/workouts/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert data["total"] >= 1

    def test_list_sessions_unauthenticated(self, client: TestClient):
        """Test listing sessions requires auth."""
        response = client.get("/api/v1/workouts/sessions")
        assert response.status_code == 403

    def test_get_session(
        self, client: TestClient, auth_headers, sample_session
    ):
        """Test getting a specific session."""
        response = client.get(
            f"/api/v1/workouts/sessions/{sample_session.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Morning Workout"
        assert data["is_completed"] is True

    def test_get_other_user_session(
        self, client: TestClient, coach_auth_headers, sample_session
    ):
        """Test user cannot access another user's session."""
        response = client.get(
            f"/api/v1/workouts/sessions/{sample_session.id}",
            headers=coach_auth_headers,
        )
        assert response.status_code == 404

    def test_create_session(
        self, client: TestClient, auth_headers, sample_user_workout, sample_exercise
    ):
        """Test creating a workout session."""
        response = client.post(
            "/api/v1/workouts/sessions",
            json={
                "user_workout_id": sample_user_workout.id,
                "title": "Evening Workout",
                "started_at": "2024-01-15T18:00:00",
                "ended_at": "2024-01-15T19:00:00",
                "duration_minutes": 60,
                "total_volume": 5000.0,
                "total_reps": 150,
                "total_exercises": 6,
                "is_completed": True,
                "rating": 5,
                "exercise_logs": [
                    {
                        "exercise_id": sample_exercise.id,
                        "order_index": 0,
                        "total_sets": 3,
                        "total_reps": 30,
                        "max_weight": 100.0,
                        "total_volume": 3000.0,
                    }
                ],
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Evening Workout"
        assert data["is_completed"] is True

    def test_update_session(
        self, client: TestClient, auth_headers, sample_session
    ):
        """Test updating a workout session."""
        response = client.put(
            f"/api/v1/workouts/sessions/{sample_session.id}",
            json={"notes": "Great workout!", "rating": 5},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["rating"] == 5

    def test_get_nonexistent_session(self, client: TestClient, auth_headers):
        """Test getting non-existent session returns 404."""
        response = client.get(
            "/api/v1/workouts/sessions/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestWorkoutStats:
    """Tests for workout statistics endpoint."""

    def test_get_stats(
        self, client: TestClient, auth_headers, sample_session
    ):
        """Test getting workout statistics."""
        response = client.get("/api/v1/workouts/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_workouts" in data
        assert "total_sessions" in data
        assert "total_volume_kg" in data

    def test_get_stats_empty(self, client: TestClient, auth_headers):
        """Test getting stats with no workouts."""
        response = client.get("/api/v1/workouts/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_sessions"] == 0

    def test_get_stats_unauthenticated(self, client: TestClient):
        """Test getting stats requires auth."""
        response = client.get("/api/v1/workouts/stats")
        assert response.status_code == 403
