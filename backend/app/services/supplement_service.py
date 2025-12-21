from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, date, timedelta
from slugify import slugify

from app.models.supplement import (
    Supplement,
    UserSupplement,
    SupplementIntake,
    SupplementCategory,
    IntakeFrequency,
    IntakeTiming
)
from app.schemas.supplement import (
    SupplementCreate,
    SupplementUpdate,
    UserSupplementCreate,
    UserSupplementUpdate,
    SupplementIntakeCreate
)


class SupplementService:
    """Service for managing supplements"""

    @staticmethod
    def get_supplement(db: Session, supplement_id: int) -> Optional[Supplement]:
        """Get supplement by ID"""
        return db.query(Supplement).filter(Supplement.id == supplement_id).first()

    @staticmethod
    def get_supplement_by_slug(db: Session, slug: str) -> Optional[Supplement]:
        """Get supplement by slug"""
        return db.query(Supplement).filter(Supplement.slug == slug).first()

    @staticmethod
    def get_supplements(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        category: Optional[SupplementCategory] = None,
        search: Optional[str] = None,
        is_popular: Optional[bool] = None
    ) -> tuple[List[Supplement], int]:
        """Get all supplements with filters"""
        query = db.query(Supplement).filter(Supplement.is_active == True)

        if category:
            query = query.filter(Supplement.category == category)

        if search:
            query = query.filter(
                or_(
                    Supplement.name.ilike(f"%{search}%"),
                    Supplement.description.ilike(f"%{search}%"),
                    Supplement.brand.ilike(f"%{search}%")
                )
            )

        if is_popular is not None:
            query = query.filter(Supplement.is_popular == is_popular)

        total = query.count()
        supplements = query.offset(skip).limit(limit).all()

        return supplements, total

    @staticmethod
    def create_supplement(db: Session, supplement_data: SupplementCreate) -> Supplement:
        """Create a new supplement"""
        # Generate slug from name
        slug = slugify(supplement_data.name)

        # Check if slug exists, add number if needed
        existing = db.query(Supplement).filter(Supplement.slug == slug).first()
        if existing:
            counter = 1
            while db.query(Supplement).filter(Supplement.slug == f"{slug}-{counter}").first():
                counter += 1
            slug = f"{slug}-{counter}"

        supplement = Supplement(
            **supplement_data.model_dump(),
            slug=slug
        )
        db.add(supplement)
        db.commit()
        db.refresh(supplement)
        return supplement

    @staticmethod
    def update_supplement(
        db: Session,
        supplement_id: int,
        supplement_data: SupplementUpdate
    ) -> Optional[Supplement]:
        """Update supplement"""
        supplement = db.query(Supplement).filter(Supplement.id == supplement_id).first()
        if not supplement:
            return None

        update_data = supplement_data.model_dump(exclude_unset=True)

        # Update slug if name changed
        if "name" in update_data:
            update_data["slug"] = slugify(update_data["name"])

        for field, value in update_data.items():
            setattr(supplement, field, value)

        db.commit()
        db.refresh(supplement)
        return supplement

    @staticmethod
    def delete_supplement(db: Session, supplement_id: int) -> bool:
        """Soft delete supplement"""
        supplement = db.query(Supplement).filter(Supplement.id == supplement_id).first()
        if not supplement:
            return False

        supplement.is_active = False
        db.commit()
        return True


class UserSupplementService:
    """Service for managing user supplements"""

    @staticmethod
    def get_user_supplement(
        db: Session,
        user_supplement_id: int,
        user_id: int
    ) -> Optional[UserSupplement]:
        """Get user supplement by ID"""
        return db.query(UserSupplement).filter(
            and_(
                UserSupplement.id == user_supplement_id,
                UserSupplement.user_id == user_id
            )
        ).options(joinedload(UserSupplement.supplement)).first()

    @staticmethod
    def get_user_supplements(
        db: Session,
        user_id: int,
        is_active: Optional[bool] = True
    ) -> List[UserSupplement]:
        """Get all user supplements"""
        query = db.query(UserSupplement).filter(UserSupplement.user_id == user_id)

        if is_active is not None:
            query = query.filter(UserSupplement.is_active == is_active)

        return query.options(joinedload(UserSupplement.supplement)).all()

    @staticmethod
    def add_supplement_to_user(
        db: Session,
        user_id: int,
        supplement_data: UserSupplementCreate
    ) -> Optional[UserSupplement]:
        """Add supplement to user's schedule"""
        # Check if supplement exists
        supplement = db.query(Supplement).filter(
            Supplement.id == supplement_data.supplement_id
        ).first()
        if not supplement:
            return None

        # Check if user already has this supplement
        existing = db.query(UserSupplement).filter(
            and_(
                UserSupplement.user_id == user_id,
                UserSupplement.supplement_id == supplement_data.supplement_id,
                UserSupplement.is_active == True
            )
        ).first()
        if existing:
            return None  # User already has this supplement

        user_supplement = UserSupplement(
            user_id=user_id,
            **supplement_data.model_dump()
        )
        db.add(user_supplement)
        db.commit()
        db.refresh(user_supplement)
        return user_supplement

    @staticmethod
    def update_user_supplement(
        db: Session,
        user_supplement_id: int,
        user_id: int,
        update_data: UserSupplementUpdate
    ) -> Optional[UserSupplement]:
        """Update user supplement"""
        user_supplement = db.query(UserSupplement).filter(
            and_(
                UserSupplement.id == user_supplement_id,
                UserSupplement.user_id == user_id
            )
        ).first()
        if not user_supplement:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(user_supplement, field, value)

        db.commit()
        db.refresh(user_supplement)
        return user_supplement

    @staticmethod
    def remove_user_supplement(
        db: Session,
        user_supplement_id: int,
        user_id: int
    ) -> bool:
        """Remove supplement from user's schedule (soft delete)"""
        user_supplement = db.query(UserSupplement).filter(
            and_(
                UserSupplement.id == user_supplement_id,
                UserSupplement.user_id == user_id
            )
        ).first()
        if not user_supplement:
            return False

        user_supplement.is_active = False
        db.commit()
        return True

    @staticmethod
    def get_todays_supplements(
        db: Session,
        user_id: int
    ) -> dict:
        """Get today's supplement schedule with intake status"""
        today = date.today()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())

        # Get all active user supplements
        user_supplements = db.query(UserSupplement).filter(
            and_(
                UserSupplement.user_id == user_id,
                UserSupplement.is_active == True
            )
        ).options(joinedload(UserSupplement.supplement)).all()

        # Get today's intakes
        todays_intakes = db.query(SupplementIntake).filter(
            and_(
                SupplementIntake.user_id == user_id,
                SupplementIntake.taken_at >= today_start,
                SupplementIntake.taken_at <= today_end
            )
        ).all()

        taken_ids = {intake.user_supplement_id for intake in todays_intakes if not intake.skipped}

        scheduled = []
        taken = []
        upcoming = []

        current_time = datetime.now().time()

        for us in user_supplements:
            supplement_info = {
                "id": us.id,
                "supplement": {
                    "id": us.supplement.id,
                    "name": us.supplement.name,
                    "category": us.supplement.category.value,
                    "image_url": us.supplement.image_url
                },
                "dosage": us.dosage or us.supplement.default_dosage,
                "dosage_unit": us.dosage_unit or us.supplement.dosage_unit,
                "timing": us.timing.value,
                "specific_time": us.specific_time.strftime("%H:%M") if us.specific_time else None,
                "notes": us.notes
            }

            # Check if this supplement is due today based on frequency
            is_due_today = UserSupplementService._is_due_today(us)

            if not is_due_today:
                continue

            if us.id in taken_ids:
                taken.append(supplement_info)
            elif us.specific_time and us.specific_time > current_time:
                upcoming.append(supplement_info)
            else:
                scheduled.append(supplement_info)

        return {
            "scheduled": scheduled,
            "taken": taken,
            "missed": [],  # Would need more complex logic
            "upcoming": upcoming
        }

    @staticmethod
    def _is_due_today(user_supplement: UserSupplement) -> bool:
        """Check if supplement is due today based on frequency"""
        if user_supplement.frequency == IntakeFrequency.DAILY:
            return True
        elif user_supplement.frequency == IntakeFrequency.AS_NEEDED:
            return False
        # Add more complex logic for weekly, every_other_day, etc.
        return True

    @staticmethod
    def get_low_stock_supplements(
        db: Session,
        user_id: int,
        threshold: int = 7
    ) -> List[UserSupplement]:
        """Get supplements that are running low"""
        return db.query(UserSupplement).filter(
            and_(
                UserSupplement.user_id == user_id,
                UserSupplement.is_active == True,
                UserSupplement.low_stock_alert == True,
                UserSupplement.remaining_stock <= threshold
            )
        ).options(joinedload(UserSupplement.supplement)).all()


class SupplementIntakeService:
    """Service for managing supplement intakes"""

    @staticmethod
    def log_intake(
        db: Session,
        user_id: int,
        intake_data: SupplementIntakeCreate
    ) -> Optional[SupplementIntake]:
        """Log a supplement intake"""
        # Verify user owns this supplement
        user_supplement = db.query(UserSupplement).filter(
            and_(
                UserSupplement.id == intake_data.user_supplement_id,
                UserSupplement.user_id == user_id
            )
        ).first()
        if not user_supplement:
            return None

        intake = SupplementIntake(
            user_id=user_id,
            **intake_data.model_dump()
        )

        if not intake.taken_at:
            intake.taken_at = datetime.utcnow()

        db.add(intake)

        # Update remaining stock if tracked
        if user_supplement.remaining_stock is not None and not intake_data.skipped:
            user_supplement.remaining_stock = max(0, user_supplement.remaining_stock - 1)

        db.commit()
        db.refresh(intake)
        return intake

    @staticmethod
    def get_intake_history(
        db: Session,
        user_id: int,
        user_supplement_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[SupplementIntake]:
        """Get intake history"""
        query = db.query(SupplementIntake).filter(SupplementIntake.user_id == user_id)

        if user_supplement_id:
            query = query.filter(SupplementIntake.user_supplement_id == user_supplement_id)

        if start_date:
            query = query.filter(SupplementIntake.taken_at >= start_date)

        if end_date:
            query = query.filter(SupplementIntake.taken_at <= end_date)

        return query.order_by(SupplementIntake.taken_at.desc()).limit(limit).all()

    @staticmethod
    def get_compliance_stats(
        db: Session,
        user_id: int,
        days: int = 7
    ) -> dict:
        """Get supplement compliance statistics"""
        start_date = datetime.now() - timedelta(days=days)

        # Get total active supplements
        total_supplements = db.query(UserSupplement).filter(
            and_(
                UserSupplement.user_id == user_id,
                UserSupplement.is_active == True
            )
        ).count()

        # Get intakes in period
        intakes = db.query(SupplementIntake).filter(
            and_(
                SupplementIntake.user_id == user_id,
                SupplementIntake.taken_at >= start_date
            )
        ).all()

        taken = len([i for i in intakes if not i.skipped])
        skipped = len([i for i in intakes if i.skipped])

        # Simplified compliance calculation
        total_expected = total_supplements * days  # Assuming daily frequency
        compliance_rate = (taken / total_expected * 100) if total_expected > 0 else 0

        return {
            "total_supplements": total_supplements,
            "active_supplements": total_supplements,
            "compliance_rate": round(compliance_rate, 1),
            "total_doses_this_week": taken + skipped,
            "doses_taken_this_week": taken,
            "doses_missed_this_week": skipped,
            "low_stock_alerts": []  # Populated separately
        }
