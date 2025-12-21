"""
Sleep service with business logic.
"""
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.sleep import SleepEntry
from app.schemas.sleep_schema import SleepCreate, SleepUpdate, SleepOut


class SleepService:
    """Sleep tracking business logic service."""

    def __init__(self, db: Session):
        self.db = db

    def create_sleep_entry(self, user_id: int, sleep_data: SleepCreate) -> SleepOut:
        """Create a new sleep entry."""
        # Check for existing entry on this date
        existing = self.db.query(SleepEntry).filter(
            and_(SleepEntry.user_id == user_id, SleepEntry.date == sleep_data.date)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sleep entry already exists for this date"
            )

        sleep_dict = sleep_data.model_dump(exclude_unset=True)
        sleep_entry = SleepEntry(user_id=user_id, **sleep_dict)

        self.db.add(sleep_entry)
        self.db.commit()
        self.db.refresh(sleep_entry)

        return SleepOut.model_validate(sleep_entry)

    def get_sleep_entries(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[SleepOut]:
        """Get sleep entries for a user with optional date filtering."""
        query = self.db.query(SleepEntry).filter(SleepEntry.user_id == user_id)

        if start_date:
            query = query.filter(SleepEntry.date >= start_date)
        if end_date:
            query = query.filter(SleepEntry.date <= end_date)

        entries = query.order_by(SleepEntry.date.desc()).offset(skip).limit(limit).all()
        return [SleepOut.model_validate(e) for e in entries]

    def get_sleep_entry_by_id(self, user_id: int, entry_id: int) -> SleepOut:
        """Get a specific sleep entry by ID."""
        entry = self.db.query(SleepEntry).filter(SleepEntry.id == entry_id).first()

        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sleep entry not found"
            )

        if entry.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this entry"
            )

        return SleepOut.model_validate(entry)

    def get_sleep_entry_by_date(self, user_id: int, entry_date: date) -> Optional[SleepOut]:
        """Get sleep entry for a specific date."""
        entry = self.db.query(SleepEntry).filter(
            and_(SleepEntry.user_id == user_id, SleepEntry.date == entry_date)
        ).first()

        if not entry:
            return None

        return SleepOut.model_validate(entry)

    def get_latest_sleep_entry(self, user_id: int) -> SleepOut:
        """Get the most recent sleep entry."""
        entry = self.db.query(SleepEntry).filter(
            SleepEntry.user_id == user_id
        ).order_by(SleepEntry.date.desc()).first()

        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No sleep entries found"
            )

        return SleepOut.model_validate(entry)

    def update_sleep_entry(self, user_id: int, entry_id: int, update_data: SleepUpdate) -> SleepOut:
        """Update a sleep entry."""
        entry = self.db.query(SleepEntry).filter(SleepEntry.id == entry_id).first()

        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sleep entry not found"
            )

        if entry.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this entry"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(entry, key, value)

        entry.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(entry)

        return SleepOut.model_validate(entry)

    def upsert_sleep_entry(self, user_id: int, sleep_data: SleepCreate) -> SleepOut:
        """Create or update sleep entry for a date."""
        existing = self.db.query(SleepEntry).filter(
            and_(SleepEntry.user_id == user_id, SleepEntry.date == sleep_data.date)
        ).first()

        if existing:
            # Update existing
            update_dict = sleep_data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            return SleepOut.model_validate(existing)
        else:
            # Create new
            return self.create_sleep_entry(user_id, sleep_data)

    def delete_sleep_entry(self, user_id: int, entry_id: int) -> bool:
        """Delete a sleep entry."""
        entry = self.db.query(SleepEntry).filter(SleepEntry.id == entry_id).first()

        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sleep entry not found"
            )

        if entry.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this entry"
            )

        self.db.delete(entry)
        self.db.commit()
        return True

    def delete_sleep_entry_by_date(self, user_id: int, entry_date: date) -> bool:
        """Delete sleep entry for a specific date."""
        entry = self.db.query(SleepEntry).filter(
            and_(SleepEntry.user_id == user_id, SleepEntry.date == entry_date)
        ).first()

        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sleep entry not found for this date"
            )

        self.db.delete(entry)
        self.db.commit()
        return True
