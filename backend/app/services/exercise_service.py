"""
Exercise service with comprehensive business logic.
Supports MuscleWiki data, gender variants, rehab exercises, and user exercise management.
"""
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, func
from fastapi import HTTPException, status
from slugify import slugify
from datetime import datetime

from app.models.exercise import (
    Exercise, UserExercise, ExerciseHistory, ExerciseAlternative,
    MuscleGroup, BodyPart, Equipment, ExerciseCategory,
    DifficultyLevel, ExerciseGender, ExercisePurpose, PainFocus,
    user_saved_exercises
)
from app.models.user import User
from app.repositories.base_repository import BaseRepository
from app.schemas.exercise_schemas import (
    ExerciseCreate, ExerciseUpdate, ExerciseResponse, ExerciseSummary,
    ExerciseListResponse, ExerciseFilters, ExerciseDetailResponse, ExerciseMedia,
    DiscoverSections, RehabFilters,
    UserExerciseCreate, UserExerciseUpdate, UserExerciseResponse,
    ExerciseHistoryCreate, ExerciseHistoryResponse,
    TrainOverview, SaveExerciseRequest, SavedExerciseResponse,
    SortOrder, ExerciseSortField
)


class ExerciseService:
    """
    Exercise business logic service.
    Handles CRUD, search, filtering, and user exercise management.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = BaseRepository(Exercise, db)

    # ==================== EXERCISE CRUD ====================

    def create_exercise(self, exercise_data: ExerciseCreate) -> ExerciseResponse:
        """Create a new exercise."""
        # Check if exercise with same name exists
        existing = self.db.query(Exercise).filter(
            Exercise.name == exercise_data.name
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Exercise '{exercise_data.name}' already exists"
            )

        # Generate unique slug
        slug = self._generate_unique_slug(exercise_data.name)

        # Create exercise
        exercise_dict = exercise_data.model_dump()
        exercise_dict['slug'] = slug

        exercise = self.repo.create(exercise_dict)
        return ExerciseResponse.model_validate(exercise)

    def get_exercise_by_id(self, exercise_id: int, user_id: Optional[int] = None) -> ExerciseDetailResponse:
        """Get exercise by ID with optional user context."""
        exercise = self.repo.get_by_id(exercise_id)
        if not exercise or not exercise.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        # Increment view count
        exercise.view_count += 1
        self.db.commit()

        return self._to_detail_response(exercise, user_id)

    def get_exercise_by_slug(self, slug: str, user_id: Optional[int] = None) -> ExerciseDetailResponse:
        """Get exercise by slug."""
        exercise = self.db.query(Exercise).filter(
            Exercise.slug == slug,
            Exercise.is_active == True
        ).first()

        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        exercise.view_count += 1
        self.db.commit()

        return self._to_detail_response(exercise, user_id)

    def update_exercise(self, exercise_id: int, update_data: ExerciseUpdate) -> ExerciseResponse:
        """Update an exercise."""
        exercise = self.repo.get_by_id(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        update_dict = update_data.model_dump(exclude_unset=True)

        # Update slug if name changes
        if update_data.name and update_data.name != exercise.name:
            existing = self.db.query(Exercise).filter(
                Exercise.name == update_data.name,
                Exercise.id != exercise_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Exercise '{update_data.name}' already exists"
                )
            update_dict['slug'] = self._generate_unique_slug(update_data.name, exclude_id=exercise_id)

        updated_exercise = self.repo.update(exercise_id, update_dict)
        return ExerciseResponse.model_validate(updated_exercise)

    def delete_exercise(self, exercise_id: int) -> dict:
        """Soft delete an exercise."""
        exercise = self.repo.get_by_id(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        self.repo.update(exercise_id, {"is_active": False})
        return {"message": "Exercise deleted successfully"}

    # ==================== DISCOVER SECTION ====================

    def get_discover_sections(self, user_id: Optional[int] = None, gender_preference: str = "male") -> DiscoverSections:
        """Get all discovery sections for the Discover screen."""
        return DiscoverSections(
            popular=self._get_section_exercises(is_popular=True, limit=10),
            featured=self._get_section_exercises(is_featured=True, limit=10),
            new_exercises=self._get_section_exercises(is_new=True, limit=10),
            stretching=self._get_section_exercises(category=ExerciseCategory.STRETCHING, limit=10),
            mobility=self._get_section_exercises(category=ExerciseCategory.MOBILITY, limit=10),
            back_pain_relief=self._get_section_exercises(
                is_rehab=True, pain_focus=PainFocus.LOWER_BACK, limit=10
            ),
            female_focused=self._get_section_exercises(gender=ExerciseGender.FEMALE, limit=10),
        )

    def search_exercises(self, filters: ExerciseFilters) -> ExerciseListResponse:
        """Search and filter exercises with pagination."""
        query = self.db.query(Exercise).filter(Exercise.is_active == True)

        # Apply filters
        if filters.muscle_group:
            query = query.filter(Exercise.muscle_group == filters.muscle_group)

        if filters.body_part:
            query = query.filter(Exercise.body_part == filters.body_part)

        if filters.equipment:
            query = query.filter(Exercise.equipment == filters.equipment)

        if filters.category:
            query = query.filter(Exercise.category == filters.category)

        if filters.difficulty:
            query = query.filter(Exercise.difficulty == filters.difficulty)

        if filters.gender:
            # Include unisex exercises when filtering by gender
            query = query.filter(
                or_(
                    Exercise.gender == filters.gender,
                    Exercise.gender == ExerciseGender.UNISEX
                )
            )

        if filters.purpose:
            query = query.filter(Exercise.purpose == filters.purpose)

        if filters.pain_focus:
            query = query.filter(Exercise.pain_focus == filters.pain_focus)

        if filters.is_rehab is not None:
            query = query.filter(Exercise.is_rehab == filters.is_rehab)

        if filters.is_popular is not None:
            query = query.filter(Exercise.is_popular == filters.is_popular)

        if filters.is_featured is not None:
            query = query.filter(Exercise.is_featured == filters.is_featured)

        if filters.is_compound is not None:
            query = query.filter(Exercise.is_compound == filters.is_compound)

        # Text search
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Exercise.name.ilike(search_term),
                    Exercise.name_de.ilike(search_term),
                    Exercise.description.ilike(search_term),
                )
            )

        # Apply sorting
        sort_column = getattr(Exercise, filters.sort_by.value, Exercise.popularity_score)
        if filters.sort_order == SortOrder.DESC:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        # Get total count
        total = query.count()
        total_pages = (total + filters.page_size - 1) // filters.page_size

        # Apply pagination
        skip = (filters.page - 1) * filters.page_size
        exercises = query.offset(skip).limit(filters.page_size).all()

        return ExerciseListResponse(
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages,
            exercises=[ExerciseSummary.model_validate(ex) for ex in exercises]
        )

    def get_rehab_exercises(self, filters: RehabFilters) -> ExerciseListResponse:
        """Get rehabilitation exercises for specific pain focus."""
        query = self.db.query(Exercise).filter(
            Exercise.is_active == True,
            Exercise.is_rehab == True,
            Exercise.pain_focus == filters.pain_focus
        )

        if filters.difficulty:
            # Include this difficulty and below
            difficulty_order = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED]
            max_idx = difficulty_order.index(filters.difficulty)
            allowed = difficulty_order[:max_idx + 1]
            query = query.filter(Exercise.difficulty.in_(allowed))

        if filters.equipment:
            query = query.filter(
                or_(
                    Exercise.equipment == filters.equipment,
                    Exercise.equipment == Equipment.BODYWEIGHT
                )
            )

        total = query.count()
        total_pages = (total + filters.page_size - 1) // filters.page_size

        skip = (filters.page - 1) * filters.page_size
        exercises = query.offset(skip).limit(filters.page_size).all()

        return ExerciseListResponse(
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages,
            exercises=[ExerciseSummary.model_validate(ex) for ex in exercises]
        )

    # ==================== USER SAVED EXERCISES ====================

    def save_exercise(self, user_id: int, exercise_id: int, notes: Optional[str] = None) -> dict:
        """Save an exercise to user's library."""
        exercise = self.repo.get_by_id(exercise_id)
        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")

        # Check if already saved
        existing = self.db.execute(
            user_saved_exercises.select().where(
                user_saved_exercises.c.user_id == user_id,
                user_saved_exercises.c.exercise_id == exercise_id
            )
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Exercise already saved")

        # Insert into saved exercises
        self.db.execute(
            user_saved_exercises.insert().values(
                user_id=user_id,
                exercise_id=exercise_id,
                saved_at=datetime.utcnow(),
                notes=notes
            )
        )

        # Update save count
        exercise.save_count += 1
        self.db.commit()

        return {"message": "Exercise saved successfully"}

    def unsave_exercise(self, user_id: int, exercise_id: int) -> dict:
        """Remove exercise from user's saved library."""
        result = self.db.execute(
            user_saved_exercises.delete().where(
                user_saved_exercises.c.user_id == user_id,
                user_saved_exercises.c.exercise_id == exercise_id
            )
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Saved exercise not found")

        # Update save count
        exercise = self.repo.get_by_id(exercise_id)
        if exercise and exercise.save_count > 0:
            exercise.save_count -= 1
            self.db.commit()

        return {"message": "Exercise removed from saved"}

    def get_saved_exercises(self, user_id: int) -> List[ExerciseSummary]:
        """Get user's saved exercises."""
        exercises = (
            self.db.query(Exercise)
            .join(user_saved_exercises, Exercise.id == user_saved_exercises.c.exercise_id)
            .filter(
                user_saved_exercises.c.user_id == user_id,
                Exercise.is_active == True
            )
            .order_by(desc(user_saved_exercises.c.saved_at))
            .all()
        )

        return [ExerciseSummary.model_validate(ex) for ex in exercises]

    def is_exercise_saved(self, user_id: int, exercise_id: int) -> bool:
        """Check if exercise is saved by user."""
        result = self.db.execute(
            user_saved_exercises.select().where(
                user_saved_exercises.c.user_id == user_id,
                user_saved_exercises.c.exercise_id == exercise_id
            )
        ).first()
        return result is not None

    # ==================== USER CUSTOM EXERCISES ====================

    def create_user_exercise(self, user_id: int, data: UserExerciseCreate) -> UserExerciseResponse:
        """Create a user's custom exercise."""
        slug = slugify(f"{user_id}-{data.name}")

        user_exercise = UserExercise(
            user_id=user_id,
            slug=slug,
            **data.model_dump()
        )

        self.db.add(user_exercise)
        self.db.commit()
        self.db.refresh(user_exercise)

        return UserExerciseResponse.model_validate(user_exercise)

    def get_user_exercises(self, user_id: int) -> List[UserExerciseResponse]:
        """Get all custom exercises created by user."""
        exercises = (
            self.db.query(UserExercise)
            .filter(
                UserExercise.user_id == user_id,
                UserExercise.is_active == True
            )
            .order_by(desc(UserExercise.created_at))
            .all()
        )

        return [UserExerciseResponse.model_validate(ex) for ex in exercises]

    def update_user_exercise(
        self, user_id: int, exercise_id: int, data: UserExerciseUpdate
    ) -> UserExerciseResponse:
        """Update a user's custom exercise."""
        exercise = self.db.query(UserExercise).filter(
            UserExercise.id == exercise_id,
            UserExercise.user_id == user_id
        ).first()

        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")

        update_dict = data.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            setattr(exercise, key, value)

        exercise.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(exercise)

        return UserExerciseResponse.model_validate(exercise)

    def delete_user_exercise(self, user_id: int, exercise_id: int) -> dict:
        """Soft delete a user's custom exercise."""
        exercise = self.db.query(UserExercise).filter(
            UserExercise.id == exercise_id,
            UserExercise.user_id == user_id
        ).first()

        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")

        exercise.is_active = False
        self.db.commit()

        return {"message": "Exercise deleted successfully"}

    # ==================== TRAIN SECTION ====================

    def get_train_overview(self, user_id: int) -> TrainOverview:
        """Get overview data for Train section - user-scoped only."""
        saved = self.get_saved_exercises(user_id)
        custom = self.get_user_exercises(user_id)
        recent = self.get_recent_exercise_history(user_id, limit=10)

        return TrainOverview(
            saved_exercises=saved,
            custom_exercises=custom,
            recent_exercises=recent,
            total_saved=len(saved),
            total_custom=len(custom)
        )

    # ==================== EXERCISE HISTORY ====================

    def log_exercise_history(self, user_id: int, data: ExerciseHistoryCreate) -> ExerciseHistoryResponse:
        """Log exercise performance history."""
        history = ExerciseHistory(
            user_id=user_id,
            exercise_id=data.exercise_id,
            user_exercise_id=data.user_exercise_id,
            exercise_name=data.exercise_name,
            workout_session_id=data.workout_session_id,
            sets_completed=data.sets_completed,
            total_reps=data.total_reps,
            total_volume=data.total_volume,
            max_weight=data.max_weight,
            duration_seconds=data.duration_seconds,
            distance_meters=data.distance_meters,
            set_details=[s.model_dump() for s in data.set_details],
            notes=data.notes,
            rating=data.rating,
            performed_at=data.performed_at or datetime.utcnow()
        )

        # Check for PRs
        if data.exercise_id:
            history.is_pr_weight = self._check_pr_weight(user_id, data.exercise_id, data.max_weight)
            history.is_pr_volume = self._check_pr_volume(user_id, data.exercise_id, data.total_volume)

        # Calculate avg weight
        if data.set_details:
            weights = [s.weight for s in data.set_details if s.weight]
            if weights:
                history.avg_weight = sum(weights) / len(weights)

        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)

        return ExerciseHistoryResponse.model_validate(history)

    def get_recent_exercise_history(self, user_id: int, limit: int = 20) -> List[ExerciseHistoryResponse]:
        """Get recent exercise history for user."""
        history = (
            self.db.query(ExerciseHistory)
            .filter(ExerciseHistory.user_id == user_id)
            .order_by(desc(ExerciseHistory.performed_at))
            .limit(limit)
            .all()
        )

        return [ExerciseHistoryResponse.model_validate(h) for h in history]

    def get_exercise_history(
        self, user_id: int, exercise_id: int, limit: int = 50
    ) -> List[ExerciseHistoryResponse]:
        """Get history for specific exercise."""
        history = (
            self.db.query(ExerciseHistory)
            .filter(
                ExerciseHistory.user_id == user_id,
                ExerciseHistory.exercise_id == exercise_id
            )
            .order_by(desc(ExerciseHistory.performed_at))
            .limit(limit)
            .all()
        )

        return [ExerciseHistoryResponse.model_validate(h) for h in history]

    # ==================== HELPER METHODS ====================

    def _generate_unique_slug(self, name: str, exclude_id: Optional[int] = None) -> str:
        """Generate unique slug for exercise name."""
        slug = slugify(name)
        query = self.db.query(Exercise).filter(Exercise.slug == slug)

        if exclude_id:
            query = query.filter(Exercise.id != exclude_id)

        if not query.first():
            return slug

        counter = 1
        while True:
            new_slug = f"{slug}-{counter}"
            query = self.db.query(Exercise).filter(Exercise.slug == new_slug)
            if exclude_id:
                query = query.filter(Exercise.id != exclude_id)
            if not query.first():
                return new_slug
            counter += 1

    def _get_section_exercises(
        self,
        limit: int = 10,
        is_popular: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        is_new: Optional[bool] = None,
        is_rehab: Optional[bool] = None,
        category: Optional[ExerciseCategory] = None,
        gender: Optional[ExerciseGender] = None,
        pain_focus: Optional[PainFocus] = None,
    ) -> List[ExerciseSummary]:
        """Get exercises for a discovery section."""
        query = self.db.query(Exercise).filter(Exercise.is_active == True)

        if is_popular is not None:
            query = query.filter(Exercise.is_popular == is_popular)
        if is_featured is not None:
            query = query.filter(Exercise.is_featured == is_featured)
        if is_new is not None:
            query = query.filter(Exercise.is_new == is_new)
        if is_rehab is not None:
            query = query.filter(Exercise.is_rehab == is_rehab)
        if category:
            query = query.filter(Exercise.category == category)
        if gender:
            query = query.filter(Exercise.gender == gender)
        if pain_focus:
            query = query.filter(Exercise.pain_focus == pain_focus)

        query = query.order_by(desc(Exercise.popularity_score)).limit(limit)
        exercises = query.all()

        return [ExerciseSummary.model_validate(ex) for ex in exercises]

    def _to_detail_response(
        self, exercise: Exercise, user_id: Optional[int] = None, gender: str = "male"
    ) -> ExerciseDetailResponse:
        """Convert exercise to detail response with computed fields."""
        base_data = ExerciseResponse.model_validate(exercise)

        # Build media based on gender
        media = ExerciseMedia(
            images=exercise.images_male if gender == "male" else (exercise.images_female or exercise.images_male),
            videos=exercise.videos_male if gender == "male" else (exercise.videos_female or exercise.videos_male),
            thumbnail=exercise.thumbnail_url,
            gif=exercise.gif_url
        )

        # Check if saved by user
        is_saved = False
        if user_id:
            is_saved = self.is_exercise_saved(user_id, exercise.id)

        # Get alternatives
        alternatives = self._get_alternatives(exercise.id)

        return ExerciseDetailResponse(
            **base_data.model_dump(),
            media=media,
            is_saved=is_saved,
            alternatives=alternatives
        )

    def _get_alternatives(self, exercise_id: int, limit: int = 5) -> List[ExerciseSummary]:
        """Get alternative exercises."""
        alt_ids = (
            self.db.query(ExerciseAlternative.alternative_id)
            .filter(ExerciseAlternative.exercise_id == exercise_id)
            .limit(limit)
            .all()
        )

        if not alt_ids:
            return []

        exercises = (
            self.db.query(Exercise)
            .filter(Exercise.id.in_([a[0] for a in alt_ids]))
            .all()
        )

        return [ExerciseSummary.model_validate(ex) for ex in exercises]

    def _check_pr_weight(
        self, user_id: int, exercise_id: int, weight: Optional[float]
    ) -> bool:
        """Check if weight is a new PR."""
        if not weight:
            return False

        max_weight = (
            self.db.query(func.max(ExerciseHistory.max_weight))
            .filter(
                ExerciseHistory.user_id == user_id,
                ExerciseHistory.exercise_id == exercise_id
            )
            .scalar()
        )

        return weight > (max_weight or 0)

    def _check_pr_volume(
        self, user_id: int, exercise_id: int, volume: Optional[float]
    ) -> bool:
        """Check if volume is a new PR."""
        if not volume:
            return False

        max_volume = (
            self.db.query(func.max(ExerciseHistory.total_volume))
            .filter(
                ExerciseHistory.user_id == user_id,
                ExerciseHistory.exercise_id == exercise_id
            )
            .scalar()
        )

        return volume > (max_volume or 0)

    # ==================== SEED DATA ====================

    def seed_from_musclewiki(self) -> dict:
        """Seed database with MuscleWiki exercise data."""
        from app.data.musclewiki_seed import get_seed_exercises
        from app.data.musclewiki_mapper import MuscleWikiMapper

        exercises = get_seed_exercises()
        created = 0
        skipped = 0

        for raw_exercise in exercises:
            mapped = MuscleWikiMapper.map_exercise(raw_exercise)

            # Check if exists
            existing = self.db.query(Exercise).filter(
                or_(
                    Exercise.slug == mapped['slug'],
                    Exercise.musclewiki_id == mapped['musclewiki_id']
                )
            ).first()

            if existing:
                skipped += 1
                continue

            exercise = Exercise(**mapped)
            self.db.add(exercise)
            created += 1

        self.db.commit()

        return {
            "message": "Seed completed",
            "created": created,
            "skipped": skipped,
            "total": len(exercises)
        }
