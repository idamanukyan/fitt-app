"""
Sleep Tracking API Schemas for HyperFit

Pydantic models for request/response validation.
Compatible with FastAPI for automatic OpenAPI documentation.
"""

from datetime import datetime, date
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, validator


# ============================================================================
# ENUMS / LITERALS
# ============================================================================

SleepSourceType = Literal[
    'manual',
    'apple_health',
    'google_fit',
    'fitbit',
    'garmin',
    'auto_detected'
]

SleepStatusType = Literal[
    'optimal',
    'on_track',
    'borderline',
    'insufficient',
    'excessive'
]


# ============================================================================
# BASE SCHEMAS
# ============================================================================

class SleepEntryBase(BaseModel):
    """Base schema for sleep entry data."""
    date: date = Field(..., description="The night the sleep started (YYYY-MM-DD)")
    bedtime: datetime = Field(..., description="When the user went to bed (ISO datetime)")
    wake_time: datetime = Field(..., description="When the user woke up (ISO datetime)")
    sleep_quality: Optional[int] = Field(
        None,
        ge=1,
        le=100,
        description="User-rated sleep quality score (1-100)"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional notes about the sleep session"
    )
    source: SleepSourceType = Field(
        default='manual',
        description="How the sleep data was recorded"
    )


class SleepEntryCreate(SleepEntryBase):
    """Schema for creating a new sleep entry."""

    @validator('wake_time')
    def wake_time_after_bedtime(cls, v, values):
        """Validate that wake time is after bedtime (accounting for overnight sleep)."""
        if 'bedtime' in values:
            bedtime = values['bedtime']
            # Allow wake time to be on the next day (overnight sleep)
            # But the duration should be reasonable (max 16 hours)
            duration = (v - bedtime).total_seconds() / 3600
            if duration < 0:
                # Next day - add 24 hours
                duration += 24
            if duration < 0.5:
                raise ValueError('Sleep duration must be at least 30 minutes')
            if duration > 16:
                raise ValueError('Sleep duration cannot exceed 16 hours')
        return v


class SleepEntryUpdate(BaseModel):
    """Schema for updating an existing sleep entry."""
    date: Optional[date] = None
    bedtime: Optional[datetime] = None
    wake_time: Optional[datetime] = None
    sleep_quality: Optional[int] = Field(None, ge=1, le=100)
    notes: Optional[str] = Field(None, max_length=500)


class SleepEntryResponse(SleepEntryBase):
    """Schema for sleep entry response."""
    id: int
    user_id: int
    duration_hours: float = Field(..., description="Calculated sleep duration in hours")
    duration_minutes: int = Field(..., description="Total sleep duration in minutes")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# QUERY SCHEMAS
# ============================================================================

class SleepQueryParams(BaseModel):
    """Query parameters for fetching sleep entries."""
    month: Optional[str] = Field(
        None,
        pattern=r'^\d{4}-\d{2}$',
        description="Filter by month (YYYY-MM format)"
    )
    start_date: Optional[date] = Field(None, description="Start date for range query")
    end_date: Optional[date] = Field(None, description="End date for range query")
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(100, ge=1, le=365, description="Maximum records to return")
    timezone: Optional[str] = Field(
        None,
        description="User's timezone for date calculations"
    )


# ============================================================================
# STATISTICS SCHEMAS
# ============================================================================

class SleepStatistics(BaseModel):
    """Sleep statistics for a time period."""
    period: str = Field(..., description="Description of the time period")
    total_entries: int
    avg_duration_hours: Optional[float] = None
    avg_sleep_quality: Optional[int] = None
    avg_bedtime: Optional[str] = Field(None, description="Average bedtime (HH:MM)")
    avg_wake_time: Optional[str] = Field(None, description="Average wake time (HH:MM)")
    min_duration_hours: Optional[float] = None
    max_duration_hours: Optional[float] = None
    total_sleep_hours: float
    consistency_score: Optional[int] = Field(
        None,
        ge=0,
        le=100,
        description="Bedtime consistency score (0-100)"
    )


class SleepRollingAverage(BaseModel):
    """Rolling average data for sleep tracking."""
    period_days: int
    avg_duration_hours: Optional[float] = None
    avg_sleep_quality: Optional[int] = None
    entries_count: int
    trend: Optional[Literal['improving', 'declining', 'stable']] = None
    trend_percentage: Optional[float] = None


class SleepWeekComparison(BaseModel):
    """Comparison between current and previous week."""
    current_week_avg: Optional[float] = None
    previous_week_avg: Optional[float] = None
    difference_hours: Optional[float] = None
    difference_percentage: Optional[float] = None
    current_week_entries: int
    previous_week_entries: int
    trend: Optional[Literal['better', 'worse', 'same']] = None


class SleepMonthlySummary(BaseModel):
    """Monthly summary for sleep data."""
    month: str = Field(..., description="Month in YYYY-MM format")
    total_entries: int
    avg_duration_hours: Optional[float] = None
    avg_quality: Optional[int] = None
    total_sleep_hours: float
    nights_optimal: int = Field(..., description="Nights with 7-9 hours sleep")
    nights_insufficient: int = Field(..., description="Nights with <6 hours sleep")
    nights_excessive: int = Field(..., description="Nights with >9 hours sleep")
    most_common_bedtime: Optional[str] = None
    most_common_wake_time: Optional[str] = None
    best_night: Optional[dict] = None
    worst_night: Optional[dict] = None


# ============================================================================
# DASHBOARD SCHEMAS
# ============================================================================

class SleepStatusInfo(BaseModel):
    """Sleep status information for UI display."""
    status: SleepStatusType
    color: str
    label: str
    description: str
    icon: str


class DashboardSleepData(BaseModel):
    """Sleep data formatted for dashboard display."""
    last_night: dict = Field(..., description="Last night's sleep data")
    seven_day_avg: Optional[float] = None
    trend: Optional[Literal['up', 'down', 'stable']] = None
    trend_vs_previous_week: Optional[float] = None
    status_info: SleepStatusInfo
    streak_days: int = Field(0, description="Consecutive days of sleep tracking")


# ============================================================================
# INSIGHTS SCHEMAS
# ============================================================================

class SleepInsight(BaseModel):
    """Sleep-related insight or recommendation."""
    id: str
    type: Literal['tip', 'warning', 'achievement', 'suggestion']
    title: str
    message: str
    priority: Literal['low', 'medium', 'high']
    actionable: bool
    action: Optional[dict] = None


class SleepGoal(BaseModel):
    """User's sleep goals and preferences."""
    target_hours: float = Field(8.0, ge=4.0, le=12.0)
    target_bedtime: str = Field("23:00", pattern=r'^\d{2}:\d{2}$')
    target_wake_time: str = Field("07:00", pattern=r'^\d{2}:\d{2}$')
    min_acceptable_hours: float = Field(7.0, ge=4.0, le=12.0)
    notifications_enabled: bool = True
    bedtime_reminder_minutes: int = Field(30, ge=0, le=120)


# ============================================================================
# BULK IMPORT SCHEMAS (for health platform integrations)
# ============================================================================

class BulkSleepImport(BaseModel):
    """Schema for bulk importing sleep data from health platforms."""
    entries: List[SleepEntryCreate]
    source: SleepSourceType
    overwrite_existing: bool = Field(
        False,
        description="Whether to overwrite existing entries for the same dates"
    )


class BulkImportResult(BaseModel):
    """Result of a bulk import operation."""
    total_submitted: int
    successfully_imported: int
    skipped: int
    errors: List[dict] = []
