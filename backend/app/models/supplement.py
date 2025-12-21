from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, Time, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class SupplementCategory(enum.Enum):
    """Supplement categories"""
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

class IntakeFrequency(enum.Enum):
    """How often supplement should be taken"""
    DAILY = "daily"
    WEEKLY = "weekly"
    AS_NEEDED = "as_needed"
    EVERY_OTHER_DAY = "every_other_day"

class IntakeTiming(enum.Enum):
    """When supplement should be taken"""
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    BEFORE_WORKOUT = "before_workout"
    AFTER_WORKOUT = "after_workout"
    WITH_MEAL = "with_meal"
    BEFORE_BED = "before_bed"
    ANY_TIME = "any_time"

class Supplement(Base):
    """
    Master supplement library - contains all available supplements.

    This is a catalog of supplements that users can add to their personal schedule.
    """
    __tablename__ = "supplements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Categorization
    category = Column(SQLEnum(SupplementCategory), nullable=False, index=True)
    brand = Column(String(200), nullable=True)

    # Supplement details
    default_dosage = Column(Float, nullable=True)  # Default amount
    dosage_unit = Column(String(50), nullable=True)  # mg, g, IU, capsules, etc.
    serving_size = Column(String(100), nullable=True)  # "1 scoop", "2 capsules", etc.

    # Benefits and usage
    benefits = Column(Text, nullable=True)  # JSON array as string
    side_effects = Column(Text, nullable=True)  # Common side effects
    instructions = Column(Text, nullable=True)  # How to take it

    # Nutritional info (if applicable)
    calories_per_serving = Column(Integer, nullable=True)
    protein_per_serving = Column(Float, nullable=True)
    carbs_per_serving = Column(Float, nullable=True)
    fats_per_serving = Column(Float, nullable=True)

    # Recommendations
    recommended_timing = Column(SQLEnum(IntakeTiming), nullable=True)
    recommended_frequency = Column(SQLEnum(IntakeFrequency), nullable=True)

    # Media
    image_url = Column(String(500), nullable=True)

    # Metadata
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user_supplements = relationship(
        "UserSupplement",
        back_populates="supplement",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Supplement(id={self.id}, name='{self.name}')>"


class UserSupplement(Base):
    """
    User's personal supplement schedule.

    Tracks which supplements a user is taking, their custom dosage, and schedule.
    """
    __tablename__ = "user_supplements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    supplement_id = Column(Integer, ForeignKey("supplements.id"), nullable=False)

    # Custom dosage (can override default)
    dosage = Column(Float, nullable=True)
    dosage_unit = Column(String(50), nullable=True)

    # Schedule
    frequency = Column(SQLEnum(IntakeFrequency), nullable=False, default=IntakeFrequency.DAILY)
    timing = Column(SQLEnum(IntakeTiming), nullable=False, default=IntakeTiming.MORNING)
    specific_time = Column(Time, nullable=True)  # Exact time for reminder

    # Days of week (for weekly frequency) - JSON array as string
    # e.g., ["monday", "wednesday", "friday"]
    days_of_week = Column(String(200), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    reminder_enabled = Column(Boolean, default=True)

    # Custom notes
    notes = Column(Text, nullable=True)
    purpose = Column(String(500), nullable=True)  # Why taking this supplement

    # Start and end dates
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)  # Optional end date for cycles

    # Stock tracking
    total_stock = Column(Integer, nullable=True)  # Total servings/pills
    remaining_stock = Column(Integer, nullable=True)  # How many left
    low_stock_alert = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
    supplement = relationship("Supplement", back_populates="user_supplements")
    intakes = relationship(
        "SupplementIntake",
        back_populates="user_supplement",
        cascade="all, delete-orphan",
        order_by="SupplementIntake.taken_at.desc()"
    )

    def __repr__(self):
        return f"<UserSupplement(id={self.id}, user_id={self.user_id}, supplement_id={self.supplement_id})>"


class SupplementIntake(Base):
    """
    Log of supplement intakes - tracks when user actually took their supplements.

    Used for compliance tracking and analytics.
    """
    __tablename__ = "supplement_intakes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_supplement_id = Column(Integer, ForeignKey("user_supplements.id"), nullable=False)

    # Intake details
    taken_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    dosage_taken = Column(Float, nullable=True)
    dosage_unit = Column(String(50), nullable=True)

    # Compliance tracking
    was_scheduled = Column(Boolean, default=True)  # Was it a scheduled dose or ad-hoc?
    skipped = Column(Boolean, default=False)  # Did user skip this dose?
    skip_reason = Column(String(500), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    side_effects_noted = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    user_supplement = relationship("UserSupplement", back_populates="intakes")

    def __repr__(self):
        return f"<SupplementIntake(id={self.id}, user_id={self.user_id}, taken_at='{self.taken_at}')>"
