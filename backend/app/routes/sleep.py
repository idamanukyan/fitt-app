"""
Sleep tracking routes.
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user
from app.models.user import User
from app.services.sleep_service import SleepService
from app.schemas.sleep_schema import SleepCreate, SleepUpdate, SleepOut

router = APIRouter(prefix="/sleep", tags=["Sleep"])


@router.post("/", response_model=SleepOut)
def create_sleep_entry(
    sleep_data: SleepCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new sleep entry."""
    service = SleepService(db)
    return service.create_sleep_entry(current_user.id, sleep_data)


@router.post("/upsert", response_model=SleepOut)
def upsert_sleep_entry(
    sleep_data: SleepCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update a sleep entry for a specific date."""
    service = SleepService(db)
    return service.upsert_sleep_entry(current_user.id, sleep_data)


@router.get("/", response_model=List[SleepOut])
def get_sleep_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=365),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sleep entries with optional date filtering."""
    service = SleepService(db)
    return service.get_sleep_entries(current_user.id, skip, limit, start_date, end_date)


@router.get("/latest", response_model=SleepOut)
def get_latest_sleep_entry(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the most recent sleep entry."""
    service = SleepService(db)
    return service.get_latest_sleep_entry(current_user.id)


@router.get("/date/{entry_date}", response_model=SleepOut)
def get_sleep_entry_by_date(
    entry_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sleep entry for a specific date."""
    service = SleepService(db)
    entry = service.get_sleep_entry_by_date(current_user.id, entry_date)
    if not entry:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No sleep entry for this date")
    return entry


@router.get("/{entry_id}", response_model=SleepOut)
def get_sleep_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific sleep entry by ID."""
    service = SleepService(db)
    return service.get_sleep_entry_by_id(current_user.id, entry_id)


@router.put("/{entry_id}", response_model=SleepOut)
def update_sleep_entry(
    entry_id: int,
    update_data: SleepUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a sleep entry."""
    service = SleepService(db)
    return service.update_sleep_entry(current_user.id, entry_id, update_data)


@router.delete("/{entry_id}")
def delete_sleep_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a sleep entry by ID."""
    service = SleepService(db)
    service.delete_sleep_entry(current_user.id, entry_id)
    return {"message": "Sleep entry deleted successfully"}


@router.delete("/date/{entry_date}")
def delete_sleep_entry_by_date(
    entry_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete sleep entry for a specific date."""
    service = SleepService(db)
    service.delete_sleep_entry_by_date(current_user.id, entry_date)
    return {"message": "Sleep entry deleted successfully"}
