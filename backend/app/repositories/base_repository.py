"""
Base repository with common CRUD operations.

Provides generic database operations that can be inherited by specific repositories.
"""
from typing import Generic, TypeVar, Type, List, Optional, Any, Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository class with common database operations.

    Implements generic CRUD methods that can be reused across all entities.
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository with model class and database session.

        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all records with pagination."""
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def get_by_field(self, field_name: str, value: Any) -> Optional[ModelType]:
        """Get a single record by any field."""
        return self.db.query(self.model).filter(getattr(self.model, field_name) == value).first()

    def get_many_by_field(self, field_name: str, value: Any, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get multiple records by field value with pagination."""
        return (
            self.db.query(self.model)
            .filter(getattr(self.model, field_name) == value)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Update an existing record."""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return None

        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """Delete a record by ID."""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True

    def exists(self, id: int) -> bool:
        """Check if a record exists."""
        return self.db.query(self.model).filter(self.model.id == id).first() is not None

    def count(self) -> int:
        """Count total records."""
        return self.db.query(self.model).count()

    def count_by_field(self, field_name: str, value: Any) -> int:
        """Count records matching a field value."""
        return self.db.query(self.model).filter(getattr(self.model, field_name) == value).count()
