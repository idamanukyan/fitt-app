from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time
from enum import Enum

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
    description: Optional[str] = None
    category: SupplementCategory
    brand: Optional[str] = None
    default_dosage: Optional[float] = None
    dosage_unit: Optional[str] = None
    serving_size: Optional[str] = None
    benefits: Optional[str] = None  # JSON string
    side_effects: Optional[str] = None
    instructions: Optional[str] = None
    calories_per_serving: Optional[int] = None
    protein_per_serving: Optional[float] = None
    carbs_per_serving: Optional[float] = None
    fats_per_serving: Optional[float] = None
    recommended_timing: Optional[IntakeTiming] = None
    recommended_frequency: Optional[IntakeFrequency] = None
    image_url: Optional[str] = None
    is_popular: bool = False

class SupplementCreate(SupplementBase):
    pass

class SupplementUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[SupplementCategory] = None
    brand: Optional[str] = None
    default_dosage: Optional[float] = None
    dosage_unit: Optional[str] = None
    serving_size: Optional[str] = None
    benefits: Optional[str] = None
    side_effects: Optional[str] = None
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None

class Supplement(SupplementBase):
    id: int
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# UserSupplement Schemas
class UserSupplementBase(BaseModel):
    supplement_id: int
    dosage: Optional[float] = None
    dosage_unit: Optional[str] = None
    frequency: IntakeFrequency = IntakeFrequency.DAILY
    timing: IntakeTiming = IntakeTiming.MORNING
    specific_time: Optional[time] = None
    days_of_week: Optional[str] = None  # JSON string
    reminder_enabled: bool = True
    notes: Optional[str] = None
    purpose: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_stock: Optional[int] = None
    remaining_stock: Optional[int] = None
    low_stock_alert: bool = True

class UserSupplementCreate(UserSupplementBase):
    pass

class UserSupplementUpdate(BaseModel):
    dosage: Optional[float] = None
    dosage_unit: Optional[str] = None
    frequency: Optional[IntakeFrequency] = None
    timing: Optional[IntakeTiming] = None
    specific_time: Optional[time] = None
    days_of_week: Optional[str] = None
    is_active: Optional[bool] = None
    reminder_enabled: Optional[bool] = None
    notes: Optional[str] = None
    purpose: Optional[str] = None
    end_date: Optional[datetime] = None
    total_stock: Optional[int] = None
    remaining_stock: Optional[int] = None
    low_stock_alert: Optional[bool] = None

class UserSupplement(UserSupplementBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    supplement: Optional[Supplement] = None

    class Config:
        from_attributes = True

# SupplementIntake Schemas
class SupplementIntakeBase(BaseModel):
    user_supplement_id: int
    dosage_taken: Optional[float] = None
    dosage_unit: Optional[str] = None
    was_scheduled: bool = True
    skipped: bool = False
    skip_reason: Optional[str] = None
    notes: Optional[str] = None
    side_effects_noted: Optional[str] = None

class SupplementIntakeCreate(SupplementIntakeBase):
    taken_at: Optional[datetime] = None

class SupplementIntake(SupplementIntakeBase):
    id: int
    user_id: int
    taken_at: datetime
    created_at: datetime
    user_supplement: Optional[UserSupplement] = None

    class Config:
        from_attributes = True

# Response Schemas
class SupplementListResponse(BaseModel):
    supplements: List[Supplement]
    total: int
    page: int
    page_size: int

class UserSupplementListResponse(BaseModel):
    supplements: List[UserSupplement]
    total: int

class TodaysSupplementsResponse(BaseModel):
    """Supplements due today with intake status"""
    scheduled: List[dict]  # Supplements to take today
    taken: List[dict]  # Already taken today
    missed: List[dict]  # Should have been taken but weren't
    upcoming: List[dict]  # Due later today

class SupplementStatsResponse(BaseModel):
    """User's supplement compliance statistics"""
    total_supplements: int
    active_supplements: int
    compliance_rate: float  # Percentage of scheduled doses taken
    total_doses_this_week: int
    doses_taken_this_week: int
    doses_missed_this_week: int
    low_stock_alerts: List[dict]  # Supplements running low
