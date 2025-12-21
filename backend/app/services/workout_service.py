"""
Workout service with business logic.

Manages workout templates, user workouts, sessions, and exercise logs.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from fastapi import HTTPException, status
from slugify import slugify
import json

from app.models.workout import (
    WorkoutTemplate,
    WorkoutTemplateExercise,
    UserWorkout,
    WorkoutExercise,
    WorkoutSession,
    ExerciseLog,
    WorkoutType
)
from app.models.exercise import Exercise
from app.repositories.base_repository import BaseRepository
from app.schemas.workout_schemas import (
    WorkoutTemplateCreate,
    WorkoutTemplateUpdate,
    WorkoutTemplateResponse,
    WorkoutTemplateSummary,
    WorkoutTemplateListResponse,
    WorkoutTemplateExerciseResponse,
    UserWorkoutCreate,
    UserWorkoutUpdate,
    UserWorkoutResponse,
    UserWorkoutSummary,
    UserWorkoutListResponse,
    WorkoutExerciseResponse,
    WorkoutSessionCreate,
    WorkoutSessionUpdate,
    WorkoutSessionResponse,
    WorkoutSessionSummary,
    WorkoutSessionListResponse,
    ExerciseLogResponse,
    WorkoutStats
)


class WorkoutService:
    """Workout business logic service."""

    def __init__(self, db: Session):
        self.db = db

    # ========== Workout Templates ==========

    def create_template(
        self,
        template_data: WorkoutTemplateCreate,
        created_by_user_id: Optional[int] = None,
        is_coach: bool = False
    ) -> WorkoutTemplateResponse:
        """
        Create a workout template.

        Args:
            template_data: Template creation data
            created_by_user_id: ID of creating user
            is_coach: Whether creator is a coach

        Returns:
            Created template

        Raises:
            HTTPException: If template name already exists
        """
        # Generate slug
        slug = slugify(template_data.name)

        # Check slug uniqueness
        counter = 1
        original_slug = slug
        while self.db.query(WorkoutTemplate).filter(
            WorkoutTemplate.slug == slug
        ).first():
            slug = f"{original_slug}-{counter}"
            counter += 1

        # Create template
        template = WorkoutTemplate(
            name=template_data.name,
            slug=slug,
            description=template_data.description,
            workout_type=template_data.workout_type,
            difficulty_level=template_data.difficulty_level,
            duration_minutes=template_data.duration_minutes,
            calories_burned=template_data.calories_burned,
            is_public=template_data.is_public,
            is_premium=template_data.is_premium,
            is_featured=template_data.is_featured,
            thumbnail_url=template_data.thumbnail_url,
            video_url=template_data.video_url,
            created_by_user_id=created_by_user_id,
            created_by_coach=is_coach
        )

        self.db.add(template)
        self.db.flush()

        # Add exercises to template
        for exercise_data in template_data.exercises:
            # Verify exercise exists
            exercise = self.db.query(Exercise).filter(
                Exercise.id == exercise_data.exercise_id
            ).first()
            if not exercise:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Exercise {exercise_data.exercise_id} not found"
                )

            template_exercise = WorkoutTemplateExercise(
                template_id=template.id,
                exercise_id=exercise_data.exercise_id,
                order_index=exercise_data.order_index,
                sets=exercise_data.sets,
                reps=exercise_data.reps,
                duration_seconds=exercise_data.duration_seconds,
                rest_seconds=exercise_data.rest_seconds,
                notes=exercise_data.notes
            )
            self.db.add(template_exercise)

        self.db.commit()
        self.db.refresh(template)

        return self._build_template_response(template)

    def get_template_by_id(self, template_id: int) -> WorkoutTemplateResponse:
        """Get template by ID."""
        template = (
            self.db.query(WorkoutTemplate)
            .options(joinedload(WorkoutTemplate.template_exercises))
            .filter(WorkoutTemplate.id == template_id)
            .first()
        )

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout template not found"
            )

        return self._build_template_response(template)

    def update_template(
        self,
        template_id: int,
        update_data: WorkoutTemplateUpdate,
        user_id: int
    ) -> WorkoutTemplateResponse:
        """Update a workout template."""
        template = self.db.query(WorkoutTemplate).filter(
            WorkoutTemplate.id == template_id
        ).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout template not found"
            )

        # Check ownership (only creator can update)
        if template.created_by_user_id and template.created_by_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this template"
            )

        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(template, field, value)

        self.db.commit()
        self.db.refresh(template)

        return self._build_template_response(template)

    def delete_template(self, template_id: int, user_id: int) -> dict:
        """Delete a workout template (soft delete)."""
        template = self.db.query(WorkoutTemplate).filter(
            WorkoutTemplate.id == template_id
        ).first()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout template not found"
            )

        # Check ownership
        if template.created_by_user_id and template.created_by_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this template"
            )

        template.is_active = False
        self.db.commit()

        return {"message": "Template deleted successfully"}

    def list_templates(
        self,
        page: int = 1,
        page_size: int = 20,
        workout_type: Optional[WorkoutType] = None,
        is_featured: Optional[bool] = None,
        is_public: bool = True
    ) -> WorkoutTemplateListResponse:
        """List workout templates with filters."""
        query = self.db.query(WorkoutTemplate).filter(
            WorkoutTemplate.is_active == True
        )

        if is_public:
            query = query.filter(WorkoutTemplate.is_public == True)

        if workout_type:
            query = query.filter(WorkoutTemplate.workout_type == workout_type)

        if is_featured is not None:
            query = query.filter(WorkoutTemplate.is_featured == is_featured)

        # Order by popularity
        query = query.order_by(desc(WorkoutTemplate.times_used))

        total = query.count()
        skip = (page - 1) * page_size
        templates = query.offset(skip).limit(page_size).all()

        summaries = [
            WorkoutTemplateSummary.model_validate(t) for t in templates
        ]

        return WorkoutTemplateListResponse(
            total=total,
            page=page,
            page_size=page_size,
            templates=summaries
        )

    # ========== User Workouts ==========

    def create_user_workout(
        self,
        user_id: int,
        workout_data: UserWorkoutCreate
    ) -> UserWorkoutResponse:
        """Create a user workout."""
        # If based on template, verify it exists
        if workout_data.template_id:
            template = self.db.query(WorkoutTemplate).filter(
                WorkoutTemplate.id == workout_data.template_id
            ).first()
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workout template not found"
                )

            # Increment template usage
            template.times_used += 1

        # Create user workout
        user_workout = UserWorkout(
            user_id=user_id,
            template_id=workout_data.template_id,
            name=workout_data.name,
            description=workout_data.description,
            workout_type=workout_data.workout_type
        )

        self.db.add(user_workout)
        self.db.flush()

        # Add exercises
        for exercise_data in workout_data.exercises:
            exercise = self.db.query(Exercise).filter(
                Exercise.id == exercise_data.exercise_id
            ).first()
            if not exercise:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Exercise {exercise_data.exercise_id} not found"
                )

            workout_exercise = WorkoutExercise(
                user_workout_id=user_workout.id,
                exercise_id=exercise_data.exercise_id,
                order_index=exercise_data.order_index,
                sets=exercise_data.sets,
                reps=exercise_data.reps,
                duration_seconds=exercise_data.duration_seconds,
                rest_seconds=exercise_data.rest_seconds,
                notes=exercise_data.notes
            )
            self.db.add(workout_exercise)

        self.db.commit()
        self.db.refresh(user_workout)

        return self._build_user_workout_response(user_workout)

    def get_user_workout(self, user_id: int, workout_id: int) -> UserWorkoutResponse:
        """Get user workout by ID."""
        workout = (
            self.db.query(UserWorkout)
            .options(joinedload(UserWorkout.workout_exercises))
            .filter(
                UserWorkout.id == workout_id,
                UserWorkout.user_id == user_id
            )
            .first()
        )

        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        return self._build_user_workout_response(workout)

    def list_user_workouts(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        is_active: Optional[bool] = None,
        is_favorite: Optional[bool] = None
    ) -> UserWorkoutListResponse:
        """List user's workouts."""
        query = self.db.query(UserWorkout).filter(UserWorkout.user_id == user_id)

        if is_active is not None:
            query = query.filter(UserWorkout.is_active == is_active)

        if is_favorite is not None:
            query = query.filter(UserWorkout.is_favorite == is_favorite)

        total = query.count()
        skip = (page - 1) * page_size
        workouts = query.offset(skip).limit(page_size).all()

        summaries = [UserWorkoutSummary.model_validate(w) for w in workouts]

        return UserWorkoutListResponse(
            total=total,
            page=page,
            page_size=page_size,
            workouts=summaries
        )

    def update_user_workout(
        self,
        user_id: int,
        workout_id: int,
        update_data: UserWorkoutUpdate
    ) -> UserWorkoutResponse:
        """Update user workout."""
        workout = self.db.query(UserWorkout).filter(
            UserWorkout.id == workout_id,
            UserWorkout.user_id == user_id
        ).first()

        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(workout, field, value)

        self.db.commit()
        self.db.refresh(workout)

        return self._build_user_workout_response(workout)

    def delete_user_workout(self, user_id: int, workout_id: int) -> dict:
        """Delete user workout."""
        workout = self.db.query(UserWorkout).filter(
            UserWorkout.id == workout_id,
            UserWorkout.user_id == user_id
        ).first()

        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        self.db.delete(workout)
        self.db.commit()

        return {"message": "Workout deleted successfully"}

    # ========== Workout Sessions ==========

    def create_session(
        self,
        user_id: int,
        session_data: WorkoutSessionCreate
    ) -> WorkoutSessionResponse:
        """Create a workout session."""
        # Verify user workout if provided
        if session_data.user_workout_id:
            user_workout = self.db.query(UserWorkout).filter(
                UserWorkout.id == session_data.user_workout_id,
                UserWorkout.user_id == user_id
            ).first()
            if not user_workout:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User workout not found"
                )

        # Create session
        session = WorkoutSession(
            user_id=user_id,
            user_workout_id=session_data.user_workout_id,
            title=session_data.title,
            notes=session_data.notes,
            started_at=session_data.started_at,
            ended_at=session_data.ended_at,
            duration_minutes=session_data.duration_minutes,
            total_volume=session_data.total_volume,
            total_reps=session_data.total_reps,
            total_exercises=session_data.total_exercises,
            calories_burned=session_data.calories_burned,
            is_completed=session_data.is_completed,
            rating=session_data.rating
        )

        self.db.add(session)
        self.db.flush()

        # Add exercise logs
        for log_data in session_data.exercise_logs:
            exercise = self.db.query(Exercise).filter(
                Exercise.id == log_data.exercise_id
            ).first()
            if not exercise:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Exercise {log_data.exercise_id} not found"
                )

            exercise_log = ExerciseLog(
                workout_session_id=session.id,
                exercise_id=log_data.exercise_id,
                order_index=log_data.order_index,
                sets_data=log_data.sets_data,
                total_sets=log_data.total_sets,
                total_reps=log_data.total_reps,
                max_weight=log_data.max_weight,
                total_volume=log_data.total_volume,
                duration_seconds=log_data.duration_seconds,
                distance_km=log_data.distance_km,
                notes=log_data.notes,
                personal_record=log_data.personal_record
            )
            self.db.add(exercise_log)

        # Update user workout stats if completed
        if session_data.is_completed and session_data.user_workout_id:
            user_workout = self.db.query(UserWorkout).filter(
                UserWorkout.id == session_data.user_workout_id
            ).first()
            if user_workout:
                user_workout.times_completed += 1
                user_workout.last_completed = session_data.ended_at or datetime.utcnow()

        self.db.commit()
        self.db.refresh(session)

        return self._build_session_response(session)

    def get_session(self, user_id: int, session_id: int) -> WorkoutSessionResponse:
        """Get workout session by ID."""
        session = (
            self.db.query(WorkoutSession)
            .options(joinedload(WorkoutSession.exercise_logs))
            .filter(
                WorkoutSession.id == session_id,
                WorkoutSession.user_id == user_id
            )
            .first()
        )

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout session not found"
            )

        return self._build_session_response(session)

    def list_sessions(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        is_completed: Optional[bool] = None
    ) -> WorkoutSessionListResponse:
        """List user's workout sessions."""
        query = self.db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user_id
        )

        if is_completed is not None:
            query = query.filter(WorkoutSession.is_completed == is_completed)

        query = query.order_by(desc(WorkoutSession.started_at))

        total = query.count()
        skip = (page - 1) * page_size
        sessions = query.offset(skip).limit(page_size).all()

        summaries = [WorkoutSessionSummary.model_validate(s) for s in sessions]

        return WorkoutSessionListResponse(
            total=total,
            page=page,
            page_size=page_size,
            sessions=summaries
        )

    def update_session(
        self,
        user_id: int,
        session_id: int,
        update_data: WorkoutSessionUpdate
    ) -> WorkoutSessionResponse:
        """Update workout session."""
        session = self.db.query(WorkoutSession).filter(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == user_id
        ).first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout session not found"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(session, field, value)

        self.db.commit()
        self.db.refresh(session)

        return self._build_session_response(session)

    def get_workout_stats(self, user_id: int) -> WorkoutStats:
        """Get user workout statistics."""
        total_workouts = self.db.query(UserWorkout).filter(
            UserWorkout.user_id == user_id
        ).count()

        total_sessions = self.db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user_id
        ).count()

        completed_sessions = self.db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.is_completed == True
        ).count()

        # Aggregate stats
        stats = self.db.query(
            func.sum(WorkoutSession.total_volume).label('total_volume'),
            func.sum(WorkoutSession.total_reps).label('total_reps'),
            func.sum(WorkoutSession.total_exercises).label('total_exercises'),
            func.avg(WorkoutSession.duration_minutes).label('avg_duration'),
            func.sum(WorkoutSession.duration_minutes).label('total_duration')
        ).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.is_completed == True
        ).first()

        return WorkoutStats(
            total_workouts=total_workouts,
            total_sessions=total_sessions,
            completed_sessions=completed_sessions,
            total_volume_kg=float(stats.total_volume or 0),
            total_reps=int(stats.total_reps or 0),
            total_exercises=int(stats.total_exercises or 0),
            average_duration_minutes=float(stats.avg_duration or 0),
            favorite_muscle_group=None,  # TODO: Calculate from exercise logs
            total_workout_time_minutes=int(stats.total_duration or 0)
        )

    # ========== Helper Methods ==========

    def _build_template_response(
        self,
        template: WorkoutTemplate
    ) -> WorkoutTemplateResponse:
        """Build template response with exercises."""
        exercises = []
        for te in template.template_exercises:
            exercise = self.db.query(Exercise).filter(
                Exercise.id == te.exercise_id
            ).first()
            exercises.append(
                WorkoutTemplateExerciseResponse(
                    id=te.id,
                    exercise_id=te.exercise_id,
                    exercise_name=exercise.name if exercise else None,
                    order_index=te.order_index,
                    sets=te.sets,
                    reps=te.reps,
                    duration_seconds=te.duration_seconds,
                    rest_seconds=te.rest_seconds,
                    notes=te.notes
                )
            )

        response_data = WorkoutTemplateResponse.model_validate(template)
        response_data.exercises = exercises
        return response_data

    def _build_user_workout_response(
        self,
        workout: UserWorkout
    ) -> UserWorkoutResponse:
        """Build user workout response with exercises."""
        exercises = []
        for we in workout.workout_exercises:
            exercise = self.db.query(Exercise).filter(
                Exercise.id == we.exercise_id
            ).first()
            exercises.append(
                WorkoutExerciseResponse(
                    id=we.id,
                    exercise_id=we.exercise_id,
                    exercise_name=exercise.name if exercise else None,
                    order_index=we.order_index,
                    sets=we.sets,
                    reps=we.reps,
                    duration_seconds=we.duration_seconds,
                    rest_seconds=we.rest_seconds,
                    notes=we.notes
                )
            )

        response_data = UserWorkoutResponse.model_validate(workout)
        response_data.exercises = exercises
        return response_data

    def _build_session_response(
        self,
        session: WorkoutSession
    ) -> WorkoutSessionResponse:
        """Build session response with exercise logs."""
        logs = []
        for log in session.exercise_logs:
            exercise = self.db.query(Exercise).filter(
                Exercise.id == log.exercise_id
            ).first()
            logs.append(
                ExerciseLogResponse(
                    id=log.id,
                    exercise_id=log.exercise_id,
                    exercise_name=exercise.name if exercise else None,
                    order_index=log.order_index,
                    sets_data=log.sets_data,
                    total_sets=log.total_sets,
                    total_reps=log.total_reps,
                    max_weight=log.max_weight,
                    total_volume=log.total_volume,
                    duration_seconds=log.duration_seconds,
                    distance_km=log.distance_km,
                    notes=log.notes,
                    personal_record=log.personal_record,
                    created_at=log.created_at
                )
            )

        response_data = WorkoutSessionResponse.model_validate(session)
        response_data.exercise_logs = logs
        return response_data
