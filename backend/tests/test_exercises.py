"""
Exercise API Tests

Tests for exercise library endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.exercise import Exercise, MuscleGroup, BodyPart, Equipment, ExerciseCategory


@pytest.fixture
def sample_exercises(test_db: Session) -> list[Exercise]:
    """Create sample exercises for testing."""
    exercises = [
        Exercise(
            name="Bench Press",
            slug="bench-press",
            description="Classic chest exercise",
            muscle_group=MuscleGroup.CHEST,
            body_part=BodyPart.CHEST,
            equipment=Equipment.BARBELL,
            category=ExerciseCategory.STRENGTH,
            is_active=True
        ),
        Exercise(
            name="Squat",
            slug="squat",
            description="Fundamental leg exercise",
            muscle_group=MuscleGroup.QUADS,
            body_part=BodyPart.LEGS,
            equipment=Equipment.BARBELL,
            category=ExerciseCategory.STRENGTH,
            is_active=True
        ),
        Exercise(
            name="Pull-up",
            slug="pull-up",
            description="Back and bicep exercise",
            muscle_group=MuscleGroup.LATS,
            body_part=BodyPart.BACK,
            equipment=Equipment.PULL_UP_BAR,
            category=ExerciseCategory.STRENGTH,
            is_active=True
        )
    ]

    for exercise in exercises:
        test_db.add(exercise)

    test_db.commit()

    for exercise in exercises:
        test_db.refresh(exercise)

    return exercises


class TestExerciseList:
    """Tests for exercise listing endpoint."""

    def test_list_exercises(
        self, client: TestClient, sample_exercises: list[Exercise]
    ):
        """Test listing all exercises."""
        response = client.get("/api/exercises")
        assert response.status_code == 200
        data = response.json()
        assert "exercises" in data
        assert len(data["exercises"]) == 3

    def test_list_exercises_by_muscle_group(
        self, client: TestClient, sample_exercises: list[Exercise]
    ):
        """Test filtering exercises by muscle group."""
        response = client.get("/api/exercises?muscle_group=chest")
        assert response.status_code == 200
        data = response.json()
        assert len(data["exercises"]) == 1
        assert data["exercises"][0]["name"] == "Bench Press"

    def test_list_exercises_by_body_part(
        self, client: TestClient, sample_exercises: list[Exercise]
    ):
        """Test filtering exercises by body part."""
        response = client.get("/api/exercises?body_part=legs")
        assert response.status_code == 200
        data = response.json()
        assert len(data["exercises"]) == 1
        assert data["exercises"][0]["name"] == "Squat"

    def test_list_exercises_pagination(
        self, client: TestClient, sample_exercises: list[Exercise]
    ):
        """Test exercise pagination."""
        response = client.get("/api/exercises?page=1&page_size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["exercises"]) == 2
        assert data["total"] == 3


class TestExerciseDetail:
    """Tests for exercise detail endpoint."""

    def test_get_exercise_by_id(
        self, client: TestClient, sample_exercises: list[Exercise]
    ):
        """Test getting exercise by ID."""
        exercise = sample_exercises[0]
        response = client.get(f"/api/exercises/{exercise.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == exercise.name

    def test_get_exercise_by_slug(
        self, client: TestClient, sample_exercises: list[Exercise]
    ):
        """Test getting exercise by slug."""
        response = client.get("/api/exercises/slug/bench-press")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Bench Press"

    def test_get_nonexistent_exercise(self, client: TestClient):
        """Test getting non-existent exercise returns 404."""
        response = client.get("/api/exercises/99999")
        assert response.status_code == 404
