"""
AI Routes

Specialized AI endpoints for workout generation, meal planning, and more.
Uses OpenAI GPT and Google Gemini with auto-selection.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.chat_schemas import (
    GenerateWorkoutRequest, GenerateWorkoutResponse,
    GenerateMealPlanRequest, GenerateMealPlanResponse,
    ExplainExerciseRequest, ExplainExerciseResponse,
    GetMotivationRequest, GetMotivationResponse,
    AIProviderStatus,
)
from app.services.ai.manager import get_ai_manager, initialize_ai_manager
from app.services.ai.base import UserContext, AIProviderType

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/status", response_model=AIProviderStatus)
async def get_ai_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get status of AI providers

    Returns availability of OpenAI and Gemini providers
    """
    ai_manager = get_ai_manager()
    availability = await ai_manager.check_providers()

    active = [ptype.value for ptype, available in availability.items() if available]

    return AIProviderStatus(
        openai_available=availability.get(AIProviderType.OPENAI, False),
        gemini_available=availability.get(AIProviderType.GEMINI, False),
        active_providers=active
    )


@router.post("/workout", response_model=GenerateWorkoutResponse)
async def generate_workout(
    request: GenerateWorkoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a custom AI workout plan

    Creates a personalized workout based on user preferences and equipment
    """
    ai_manager = get_ai_manager()

    # Build user context
    user_context = UserContext(
        user_id=current_user.id,
        fitness_level=request.fitness_level,
    )

    try:
        response = await ai_manager.generate_workout(
            user_context=user_context,
            workout_type=request.workout_type,
            duration_minutes=request.duration_minutes,
            equipment=request.equipment,
        )

        if not response.is_success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI generation failed: {response.error}"
            )

        return GenerateWorkoutResponse(
            workout=response.content,
            provider=response.provider.value,
            model=response.model,
            tokens_used=response.tokens_used,
            latency_ms=response.latency_ms,
            confidence=response.confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating workout: {str(e)}"
        )


@router.post("/meal-plan", response_model=GenerateMealPlanResponse)
async def generate_meal_plan(
    request: GenerateMealPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a custom AI meal plan

    Creates a personalized meal plan based on calories and dietary requirements
    """
    ai_manager = get_ai_manager()

    # Build user context
    user_context = UserContext(
        user_id=current_user.id,
        dietary_preferences=request.dietary_preferences,
    )

    # Combine restrictions and allergies
    dietary_restrictions = request.dietary_restrictions.copy()
    if request.allergies:
        dietary_restrictions.extend([f"allergic to {a}" for a in request.allergies])

    try:
        response = await ai_manager.generate_meal_plan(
            user_context=user_context,
            calories=request.target_calories,
            meals_per_day=request.meals_per_day,
            dietary_restrictions=dietary_restrictions,
        )

        if not response.is_success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI generation failed: {response.error}"
            )

        return GenerateMealPlanResponse(
            meal_plan=response.content,
            provider=response.provider.value,
            model=response.model,
            tokens_used=response.tokens_used,
            latency_ms=response.latency_ms,
            confidence=response.confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating meal plan: {str(e)}"
        )


@router.post("/explain-exercise", response_model=ExplainExerciseResponse)
async def explain_exercise(
    request: ExplainExerciseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed AI explanation of an exercise

    Returns form tips, target muscles, common mistakes, and modifications
    """
    ai_manager = get_ai_manager()

    # Build user context
    user_context = UserContext(
        user_id=current_user.id,
        fitness_level=request.fitness_level,
    ) if request.fitness_level else None

    try:
        response = await ai_manager.explain_exercise(
            exercise_name=request.exercise_name,
            user_context=user_context,
        )

        if not response.is_success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI generation failed: {response.error}"
            )

        return ExplainExerciseResponse(
            explanation=response.content,
            provider=response.provider.value,
            model=response.model,
            tokens_used=response.tokens_used,
            latency_ms=response.latency_ms,
            confidence=response.confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error explaining exercise: {str(e)}"
        )


@router.post("/motivation", response_model=GetMotivationResponse)
async def get_motivation(
    request: GetMotivationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-generated motivational message

    Returns personalized motivation based on current situation
    """
    ai_manager = get_ai_manager()

    # Build user context
    user_context = UserContext(
        user_id=current_user.id,
        fitness_goals=[request.goal] if request.goal else [],
    )

    try:
        response = await ai_manager.get_motivation(
            user_context=user_context,
            situation=request.situation,
        )

        if not response.is_success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"AI generation failed: {response.error}"
            )

        return GetMotivationResponse(
            message=response.content,
            provider=response.provider.value,
            model=response.model,
            tokens_used=response.tokens_used,
            latency_ms=response.latency_ms,
            confidence=response.confidence,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting motivation: {str(e)}"
        )
