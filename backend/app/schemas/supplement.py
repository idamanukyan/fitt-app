from datetime import datetime, time
from enum import Enum

from pydantic import BaseModel


# Enums
class SupplementCategory(str, Enum):
    PROTEIN = "protein"
    VITAMINS = "vitamins"
    MINERALS = "minerals"
    AMINO_ACIDS = "amino_acids"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"
    CREATINE = "creatine"
    BCAA = "bcaa"
    OMEGA_3 = "omega_3"
    MULTIVITAMIN = "multivitamin"
    WEIGHT_LOSS = "weight_loss"
    ENERGY = "energy"
    RECOVERY = "recovery"
    OTHER = "other"

class IntakeFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    AS_NEEDED = "as_needed"
    EVERY_OTHER_DAY = "every_other_day"

class IntakeTiming(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    BEFORE_WORKOUT = "before_workout"
    AFTER_WORKOUT = "after_workout"
    WITH_MEAL = "with_meal"
    BEFORE_BED = "before_bed"
    ANY_TIME = "any_time"

# Supplement Schemas
class SupplementBase(BaseModel):
    name: str
    description: str | None = None
    category: SupplementCategory
    brand: str | None = None
    default_dosage: float | None = None
    dosage_unit: str | None = None
    serving_size: str | None = None
    benefits: str | None = None  # JSON string
    side_effects: str | None = None
    instructions: str | None = None
    calories_per_serving: int | None = None
    protein_per_serving: float | None = None
    carbs_per_serving: float | None = None
    fats_per_serving: float | None = None
    recommended_timing: IntakeTiming | None = None
    recommended_frequency: IntakeFrequency | None = None
    image_url: str | None = None
    is_popular: bool = False

class SupplementCreate(SupplementBase):
    pass

class SupplementUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: SupplementCategory | None = None
    brand: str | None = None
    default_dosage: float | None = None
    dosage_unit: str | None = None
    serving_size: str | None = None
    benefits: str | None = None
    side_effects: str | None = None
    instructions: str | None = None
    image_url: str | None = None
    is_popular: bool | None = None
    is_active: bool | None = None

class Supplement(SupplementBase):
    id: int
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

# UserSupplement Schemas
class UserSupplementBase(BaseModel):
    supplement_id: int
    dosage: float | None = None
    dosage_unit: str | None = None
    frequency: IntakeFrequency = IntakeFrequency.DAILY
    timing: IntakeTiming = IntakeTiming.MORNING
    specific_time: time | None = None
    days_of_week: str | None = None  # JSON string
    reminder_enabled: bool = True
    notes: str | None = None
    purpose: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    total_stock: int | None = None
    remaining_stock: int | None = None
    low_stock_alert: bool = True

class UserSupplementCreate(UserSupplementBase):
    pass

class UserSupplementUpdate(BaseModel):
    dosage: float | None = None
    dosage_unit: str | None = None
    frequency: IntakeFrequency | None = None
    timing: IntakeTiming | None = None
    specific_time: time | None = None
    days_of_week: str | None = None
    is_active: bool | None = None
    reminder_enabled: bool | None = None
    notes: str | None = None
    purpose: str | None = None
    end_date: datetime | None = None
    total_stock: int | None = None
    remaining_stock: int | None = None
    low_stock_alert: bool | None = None

class UserSupplement(UserSupplementBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None
    supplement: Supplement | None = None

    class Config:
        from_attributes = True

# SupplementIntake Schemas
class SupplementIntakeBase(BaseModel):
    user_supplement_id: int
    dosage_taken: float | None = None
    dosage_unit: str | None = None
    was_scheduled: bool = True
    skipped: bool = False
    skip_reason: str | None = None
    notes: str | None = None
    side_effects_noted: str | None = None

class SupplementIntakeCreate(SupplementIntakeBase):
    taken_at: datetime | None = None

class SupplementIntake(SupplementIntakeBase):
    id: int
    user_id: int
    taken_at: datetime
    created_at: datetime
    user_supplement: UserSupplement | None = None

    class Config:
        from_attributes = True

# Response Schemas
class SupplementListResponse(BaseModel):
    supplements: list[Supplement]
    total: int
    page: int
    page_size: int

class UserSupplementListResponse(BaseModel):
    supplements: list[UserSupplement]
    total: int

class TodaysSupplementsResponse(BaseModel):
    """Supplements due today with intake status"""
    scheduled: list[dict]  # Supplements to take today
    taken: list[dict]  # Already taken today
    missed: list[dict]  # Should have been taken but weren't
    upcoming: list[dict]  # Due later today

class SupplementStatsResponse(BaseModel):
    """User's supplement compliance statistics"""
    total_supplements: int
    active_supplements: int
    compliance_rate: float  # Percentage of scheduled doses taken
    total_doses_this_week: int
    doses_taken_this_week: int
    doses_missed_this_week: int
    low_stock_alerts: list[dict]  # Supplements running low
