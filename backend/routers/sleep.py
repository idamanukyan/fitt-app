"""
Sleep Tracking API Router for HyperFit

FastAPI router with full CRUD operations for sleep tracking.
"""

from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

# Import schemas
from schemas.sleep import (
    SleepEntryCreate,
    SleepEntryUpdate,
    SleepEntryResponse,
    SleepStatistics,
    SleepMonthlySummary,
    DashboardSleepData,
    SleepWeekComparison,
    BulkSleepImport,
    BulkImportResult,
)

# Import models
from models.sleep import SleepEntry, SleepGoal

# Import dependencies (these would come from your app)
# from app.database import get_db
# from app.auth import get_current_user
# from app.models import User

# For demonstration, we'll create placeholder dependencies
def get_db():
    """Placeholder - replace with your database session dependency."""
    pass

def get_current_user():
    """Placeholder - replace with your authentication dependency."""
    pass


router = APIRouter(
    prefix="/sleep",
    tags=["Sleep Tracking"],
    responses={404: {"description": "Not found"}},
)


# ============================================================================
# CRUD ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[SleepEntryResponse])
async def get_sleep_entries(
    month: Optional[str] = Query(None, regex=r'^\d{4}-\d{2}$', description="Filter by month (YYYY-MM)"),
    start_date: Optional[date] = Query(None, description="Start date for range query"),
    end_date: Optional[date] = Query(None, description="End date for range query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=365),
    timezone: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get sleep entries with optional filtering.

    - **month**: Filter by month (YYYY-MM format)
    - **start_date** / **end_date**: Filter by date range
    - **skip**: Pagination offset
    - **limit**: Maximum entries to return
    """
    query = db.query(SleepEntry).filter(SleepEntry.user_id == current_user.id)

    # Apply month filter
    if month:
        year, month_num = map(int, month.split('-'))
        start = date(year, month_num, 1)
        if month_num == 12:
            end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end = date(year, month_num + 1, 1) - timedelta(days=1)
        query = query.filter(SleepEntry.date >= start, SleepEntry.date <= end)

    # Apply date range filter
    if start_date:
        query = query.filter(SleepEntry.date >= start_date)
    if end_date:
        query = query.filter(SleepEntry.date <= end_date)

    # Order by date descending (most recent first)
    query = query.order_by(SleepEntry.date.desc())

    entries = query.offset(skip).limit(limit).all()
    return entries


@router.get("/latest", response_model=SleepEntryResponse)
async def get_latest_sleep_entry(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get the most recent sleep entry."""
    entry = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id
    ).order_by(SleepEntry.date.desc()).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No sleep entries found"
        )
    return entry


@router.get("/{entry_date}", response_model=SleepEntryResponse)
async def get_sleep_entry_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get sleep entry for a specific date."""
    entry = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id,
        SleepEntry.date == entry_date
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No sleep entry found for {entry_date}"
        )
    return entry


@router.post("/", response_model=SleepEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_sleep_entry(
    entry: SleepEntryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Create a new sleep entry.

    Duration is automatically calculated from bedtime and wake time.
    Only one entry per date is allowed per user.
    """
    # Check for existing entry on this date
    existing = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id,
        SleepEntry.date == entry.date
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Sleep entry already exists for {entry.date}. Use PUT to update."
        )

    # Calculate duration
    duration_seconds = (entry.wake_time - entry.bedtime).total_seconds()
    if duration_seconds < 0:
        duration_seconds += 24 * 3600  # Add 24 hours for overnight sleep

    duration_hours = duration_seconds / 3600
    duration_minutes = int(duration_seconds / 60)

    db_entry = SleepEntry(
        user_id=current_user.id,
        date=entry.date,
        bedtime=entry.bedtime,
        wake_time=entry.wake_time,
        duration_hours=round(duration_hours, 2),
        duration_minutes=duration_minutes,
        sleep_quality=entry.sleep_quality,
        notes=entry.notes,
        source=entry.source,
    )

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return db_entry


@router.put("/{entry_id}", response_model=SleepEntryResponse)
async def update_sleep_entry(
    entry_id: int,
    entry_update: SleepEntryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Update an existing sleep entry."""
    db_entry = db.query(SleepEntry).filter(
        SleepEntry.id == entry_id,
        SleepEntry.user_id == current_user.id
    ).first()

    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep entry not found"
        )

    # Update fields if provided
    update_data = entry_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_entry, field, value)

    # Recalculate duration if times changed
    if entry_update.bedtime or entry_update.wake_time:
        bedtime = entry_update.bedtime or db_entry.bedtime
        wake_time = entry_update.wake_time or db_entry.wake_time

        duration_seconds = (wake_time - bedtime).total_seconds()
        if duration_seconds < 0:
            duration_seconds += 24 * 3600

        db_entry.duration_hours = round(duration_seconds / 3600, 2)
        db_entry.duration_minutes = int(duration_seconds / 60)

    db.commit()
    db.refresh(db_entry)

    return db_entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sleep_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Delete a sleep entry."""
    db_entry = db.query(SleepEntry).filter(
        SleepEntry.id == entry_id,
        SleepEntry.user_id == current_user.id
    ).first()

    if not db_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sleep entry not found"
        )

    db.delete(db_entry)
    db.commit()

    return None


# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@router.get("/stats/dashboard", response_model=DashboardSleepData)
async def get_dashboard_sleep_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get sleep data formatted for dashboard display."""
    today = date.today()
    seven_days_ago = today - timedelta(days=7)
    fourteen_days_ago = today - timedelta(days=14)

    # Get recent entries
    recent_entries = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id,
        SleepEntry.date >= fourteen_days_ago
    ).order_by(SleepEntry.date.desc()).all()

    # Calculate 7-day average
    current_week = [e for e in recent_entries if e.date >= seven_days_ago]
    previous_week = [e for e in recent_entries if seven_days_ago > e.date >= fourteen_days_ago]

    seven_day_avg = None
    if current_week:
        seven_day_avg = sum(e.duration_hours for e in current_week) / len(current_week)

    # Calculate trend
    trend = None
    trend_percentage = None
    if current_week and previous_week:
        prev_avg = sum(e.duration_hours for e in previous_week) / len(previous_week)
        if prev_avg > 0:
            diff = seven_day_avg - prev_avg
            trend_percentage = (diff / prev_avg) * 100
            if diff > 0.25:
                trend = 'up'
            elif diff < -0.25:
                trend = 'down'
            else:
                trend = 'stable'

    # Get last night's data
    last_night = current_week[0] if current_week else None

    # Determine status
    status_info = get_sleep_status_info(seven_day_avg)

    # Calculate streak
    streak = calculate_tracking_streak(recent_entries)

    return DashboardSleepData(
        last_night={
            'duration_hours': last_night.duration_hours if last_night else None,
            'sleep_quality': last_night.sleep_quality if last_night else None,
            'bedtime': last_night.bedtime.isoformat() if last_night else None,
            'wake_time': last_night.wake_time.isoformat() if last_night else None,
            'status': get_sleep_status(last_night.duration_hours if last_night else None),
        },
        seven_day_avg=round(seven_day_avg, 1) if seven_day_avg else None,
        trend=trend,
        trend_vs_previous_week=round(trend_percentage, 1) if trend_percentage else None,
        status_info=status_info,
        streak_days=streak,
    )


@router.get("/stats/monthly/{year}/{month}", response_model=SleepMonthlySummary)
async def get_monthly_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get monthly sleep statistics summary."""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)

    entries = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id,
        SleepEntry.date >= start_date,
        SleepEntry.date <= end_date
    ).all()

    if not entries:
        return SleepMonthlySummary(
            month=f"{year}-{month:02d}",
            total_entries=0,
            total_sleep_hours=0,
            nights_optimal=0,
            nights_insufficient=0,
            nights_excessive=0,
        )

    durations = [e.duration_hours for e in entries]

    # Count by category
    nights_optimal = sum(1 for d in durations if 7 <= d <= 9)
    nights_insufficient = sum(1 for d in durations if d < 6)
    nights_excessive = sum(1 for d in durations if d > 9)

    # Find best and worst nights
    sorted_entries = sorted(entries, key=lambda e: e.duration_hours, reverse=True)

    return SleepMonthlySummary(
        month=f"{year}-{month:02d}",
        total_entries=len(entries),
        avg_duration_hours=round(sum(durations) / len(durations), 2),
        avg_quality=int(sum(e.sleep_quality for e in entries if e.sleep_quality) / sum(1 for e in entries if e.sleep_quality)) if any(e.sleep_quality for e in entries) else None,
        total_sleep_hours=round(sum(durations), 1),
        nights_optimal=nights_optimal,
        nights_insufficient=nights_insufficient,
        nights_excessive=nights_excessive,
        best_night={'date': sorted_entries[0].date.isoformat(), 'duration': sorted_entries[0].duration_hours} if sorted_entries else None,
        worst_night={'date': sorted_entries[-1].date.isoformat(), 'duration': sorted_entries[-1].duration_hours} if sorted_entries else None,
    )


@router.get("/stats/week-comparison", response_model=SleepWeekComparison)
async def get_week_comparison(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Compare current week with previous week."""
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    start_of_prev_week = start_of_week - timedelta(days=7)

    current_week = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id,
        SleepEntry.date >= start_of_week,
        SleepEntry.date <= today
    ).all()

    previous_week = db.query(SleepEntry).filter(
        SleepEntry.user_id == current_user.id,
        SleepEntry.date >= start_of_prev_week,
        SleepEntry.date < start_of_week
    ).all()

    current_avg = sum(e.duration_hours for e in current_week) / len(current_week) if current_week else None
    previous_avg = sum(e.duration_hours for e in previous_week) / len(previous_week) if previous_week else None

    difference_hours = None
    difference_percentage = None
    trend = None

    if current_avg and previous_avg:
        difference_hours = current_avg - previous_avg
        difference_percentage = (difference_hours / previous_avg) * 100

        if difference_hours > 0.25:
            trend = 'better'
        elif difference_hours < -0.25:
            trend = 'worse'
        else:
            trend = 'same'

    return SleepWeekComparison(
        current_week_avg=round(current_avg, 2) if current_avg else None,
        previous_week_avg=round(previous_avg, 2) if previous_avg else None,
        difference_hours=round(difference_hours, 2) if difference_hours else None,
        difference_percentage=round(difference_percentage, 1) if difference_percentage else None,
        current_week_entries=len(current_week),
        previous_week_entries=len(previous_week),
        trend=trend,
    )


# ============================================================================
# BULK IMPORT ENDPOINTS
# ============================================================================

@router.post("/import/bulk", response_model=BulkImportResult)
async def bulk_import_sleep_data(
    import_data: BulkSleepImport,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Bulk import sleep data (e.g., from Apple Health, Google Fit).

    Set `overwrite_existing` to true to update existing entries.
    """
    results = BulkImportResult(
        total_submitted=len(import_data.entries),
        successfully_imported=0,
        skipped=0,
        errors=[]
    )

    for entry in import_data.entries:
        try:
            existing = db.query(SleepEntry).filter(
                SleepEntry.user_id == current_user.id,
                SleepEntry.date == entry.date
            ).first()

            if existing:
                if import_data.overwrite_existing:
                    # Update existing entry
                    for field, value in entry.dict(exclude_unset=True).items():
                        setattr(existing, field, value)
                    existing.source = import_data.source
                    results.successfully_imported += 1
                else:
                    results.skipped += 1
                    continue
            else:
                # Create new entry
                duration_seconds = (entry.wake_time - entry.bedtime).total_seconds()
                if duration_seconds < 0:
                    duration_seconds += 24 * 3600

                db_entry = SleepEntry(
                    user_id=current_user.id,
                    date=entry.date,
                    bedtime=entry.bedtime,
                    wake_time=entry.wake_time,
                    duration_hours=round(duration_seconds / 3600, 2),
                    duration_minutes=int(duration_seconds / 60),
                    sleep_quality=entry.sleep_quality,
                    notes=entry.notes,
                    source=import_data.source,
                )
                db.add(db_entry)
                results.successfully_imported += 1

        except Exception as e:
            results.errors.append({
                'date': str(entry.date),
                'error': str(e)
            })

    db.commit()
    return results


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_sleep_status(duration: Optional[float]) -> str:
    """Get sleep status classification."""
    if duration is None:
        return 'insufficient'
    if duration < 6:
        return 'insufficient'
    if duration < 7:
        return 'borderline'
    if duration <= 9:
        return 'optimal'
    return 'excessive'


def get_sleep_status_info(duration: Optional[float]) -> dict:
    """Get full status info for UI display."""
    status = get_sleep_status(duration)

    status_map = {
        'optimal': {
            'status': 'optimal',
            'color': '#4ADE80',
            'label': 'Optimal',
            'description': 'Great sleep! You\'re getting the recommended amount.',
            'icon': 'checkmark-circle',
        },
        'borderline': {
            'status': 'borderline',
            'color': '#FBBF24',
            'label': 'Borderline',
            'description': 'Slightly below optimal. Try to get 7+ hours.',
            'icon': 'alert-circle-outline',
        },
        'insufficient': {
            'status': 'insufficient',
            'color': '#EF4444',
            'label': 'Insufficient',
            'description': 'Not enough sleep. Aim for at least 7 hours.',
            'icon': 'warning-outline',
        },
        'excessive': {
            'status': 'excessive',
            'color': '#FBBF24',
            'label': 'Excessive',
            'description': 'More than 9 hours may indicate oversleeping.',
            'icon': 'time-outline',
        },
    }

    return status_map.get(status, status_map['insufficient'])


def calculate_tracking_streak(entries: List[SleepEntry]) -> int:
    """Calculate consecutive days of sleep tracking."""
    if not entries:
        return 0

    sorted_entries = sorted(entries, key=lambda e: e.date, reverse=True)
    streak = 0
    expected_date = date.today()

    for entry in sorted_entries:
        # Allow for yesterday as valid start
        diff = (expected_date - entry.date).days
        if diff == 0 or diff == 1:
            streak += 1
            expected_date = entry.date - timedelta(days=1)
        else:
            break

    return streak
