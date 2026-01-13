"""
Application configuration management.

Loads settings from environment variables with sensible defaults.
"""
import os
from typing import List
from functools import lru_cache
from dotenv import load_dotenv

# Load .env file from backend directory
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hyperfit-dev-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS512")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hyperfit.db")

    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:8081,http://localhost:19006").split(",")
        if origin.strip()
    ]

    # AI Services
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
