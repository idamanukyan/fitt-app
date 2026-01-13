"""
Health Check API Tests

Tests for API health and root endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestHealthCheck:
    """Tests for health check endpoints."""

    def test_root_endpoint(self, client: TestClient):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "6.0"
        assert "features" in data

    def test_docs_accessible(self, client: TestClient):
        """Test API documentation is accessible."""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_schema(self, client: TestClient):
        """Test OpenAPI schema is available."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert data["info"]["title"] == "HyperFit API"
