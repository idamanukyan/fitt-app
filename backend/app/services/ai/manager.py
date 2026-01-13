"""
AI Manager

Manages multiple AI providers with auto-selection, failover, and load balancing.
"""

import os
import asyncio
import random
from typing import List, Optional, Dict, Any
from enum import Enum

from .base import (
    AIProvider,
    AIProviderType,
    AIResponse,
    Message,
    MessageRole,
    UserContext,
    FITNESS_SYSTEM_PROMPT,
)
from .openai_client import OpenAIProvider
from .gemini_client import GeminiProvider


class TaskType(str, Enum):
    """Task types for provider selection"""
    CHAT = "chat"
    WORKOUT_GENERATION = "workout_generation"
    MEAL_PLANNING = "meal_planning"
    PROGRESS_ANALYSIS = "progress_analysis"
    EXERCISE_EXPLANATION = "exercise_explanation"
    MOTIVATION = "motivation"


class AIManager:
    """
    AI Provider Manager

    Handles provider initialization, selection, and failover.
    Auto-selects best provider based on task type and availability.
    """

    # Provider preferences by task type (order matters - first = preferred)
    TASK_PREFERENCES: Dict[TaskType, List[AIProviderType]] = {
        TaskType.CHAT: [AIProviderType.OPENAI, AIProviderType.GEMINI],
        TaskType.WORKOUT_GENERATION: [AIProviderType.OPENAI, AIProviderType.GEMINI],
        TaskType.MEAL_PLANNING: [AIProviderType.GEMINI, AIProviderType.OPENAI],
        TaskType.PROGRESS_ANALYSIS: [AIProviderType.OPENAI, AIProviderType.GEMINI],
        TaskType.EXERCISE_EXPLANATION: [AIProviderType.GEMINI, AIProviderType.OPENAI],
        TaskType.MOTIVATION: [AIProviderType.OPENAI, AIProviderType.GEMINI],
    }

    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        gemini_api_key: Optional[str] = None,
    ):
        """Initialize AI Manager with API keys"""
        self.providers: Dict[AIProviderType, AIProvider] = {}
        self._availability_cache: Dict[AIProviderType, bool] = {}
        self._last_check: Dict[AIProviderType, float] = {}

        # Initialize providers with keys
        openai_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        gemini_key = gemini_api_key or os.getenv("GEMINI_API_KEY")

        if openai_key:
            self.providers[AIProviderType.OPENAI] = OpenAIProvider(openai_key)
            print("OpenAI provider initialized")

        if gemini_key:
            self.providers[AIProviderType.GEMINI] = GeminiProvider(gemini_key)
            print("Gemini provider initialized")

        if not self.providers:
            print("WARNING: No AI providers configured. Using fallback responses.")

    async def check_providers(self) -> Dict[AIProviderType, bool]:
        """Check availability of all providers"""
        results = {}

        for provider_type, provider in self.providers.items():
            try:
                is_available = await provider.check_availability()
                results[provider_type] = is_available
                self._availability_cache[provider_type] = is_available
            except Exception as e:
                print(f"Error checking {provider_type}: {e}")
                results[provider_type] = False
                self._availability_cache[provider_type] = False

        return results

    def get_available_providers(self) -> List[AIProviderType]:
        """Get list of available providers"""
        return [
            ptype for ptype, available in self._availability_cache.items()
            if available
        ]

    async def select_provider(
        self,
        task_type: TaskType = TaskType.CHAT,
        preferred: Optional[AIProviderType] = None,
    ) -> Optional[AIProvider]:
        """
        Select best provider for task

        Priority:
        1. User preference (if specified and available)
        2. Task-specific preference
        3. Any available provider
        """
        # Check if preferred provider is available
        if preferred and preferred in self.providers:
            provider = self.providers[preferred]
            if self._availability_cache.get(preferred, False):
                return provider
            # Try to verify availability
            if await provider.check_availability():
                self._availability_cache[preferred] = True
                return provider

        # Get task preferences
        preferences = self.TASK_PREFERENCES.get(task_type, list(self.providers.keys()))

        # Try providers in preference order
        for ptype in preferences:
            if ptype in self.providers:
                provider = self.providers[ptype]
                if self._availability_cache.get(ptype, False):
                    return provider
                # Verify availability
                if await provider.check_availability():
                    self._availability_cache[ptype] = True
                    return provider

        # Fallback: try any provider
        for ptype, provider in self.providers.items():
            if await provider.check_availability():
                self._availability_cache[ptype] = True
                return provider

        return None

    async def generate(
        self,
        messages: List[Message],
        user_context: Optional[UserContext] = None,
        task_type: TaskType = TaskType.CHAT,
        preferred_provider: Optional[AIProviderType] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> AIResponse:
        """
        Generate AI response with auto provider selection and failover

        Args:
            messages: Conversation messages
            user_context: User's fitness context
            task_type: Type of task for provider selection
            preferred_provider: Preferred provider (optional)
            temperature: Response creativity (0-1)
            max_tokens: Maximum response length

        Returns:
            AIResponse with content or error
        """
        # Select provider
        provider = await self.select_provider(task_type, preferred_provider)

        if not provider:
            # Return fallback response
            return self._generate_fallback_response(messages, user_context)

        # Try primary provider
        response = await provider.generate(
            messages,
            user_context,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        if response.is_success:
            return response

        # Failover to other providers
        tried = {provider.provider_type}
        for ptype, fallback_provider in self.providers.items():
            if ptype in tried:
                continue

            tried.add(ptype)
            print(f"Failing over from {provider.provider_type} to {ptype}")

            if await fallback_provider.check_availability():
                response = await fallback_provider.generate(
                    messages,
                    user_context,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )

                if response.is_success:
                    return response

        # All providers failed, return fallback
        return self._generate_fallback_response(messages, user_context)

    def _generate_fallback_response(
        self,
        messages: List[Message],
        user_context: Optional[UserContext] = None,
    ) -> AIResponse:
        """Generate template-based fallback response"""
        last_message = messages[-1].content.lower() if messages else ""

        # Categorize query and select response
        responses = {
            "workout": [
                "For effective workouts, focus on compound movements like squats, deadlifts, and presses. They work multiple muscle groups and are time-efficient. What specific muscle group are you targeting?",
                "Progressive overload is key - gradually increase weight, reps, or sets over time. Track your workouts to ensure you're making progress. What's your current routine like?",
            ],
            "nutrition": [
                "A balanced diet with adequate protein (0.7-1g per pound bodyweight) supports muscle growth and recovery. Are you tracking your macros currently?",
                "Focus on whole foods: lean proteins, complex carbs, healthy fats, and plenty of vegetables. Hydration is also crucial - aim for at least 8 glasses of water daily.",
            ],
            "motivation": [
                "Remember why you started! Set small, achievable goals and celebrate each win. Consistency beats perfection - showing up matters most.",
                "Everyone has tough days. What matters is not giving up. Try finding a workout buddy or community for accountability.",
            ],
            "injury": [
                "Please consult a healthcare professional for any injury concerns. In the meantime, rest the affected area and avoid exercises that cause pain.",
                "Listen to your body - pain is different from muscle soreness. For minor soreness, light stretching and adequate rest usually help.",
            ],
        }

        # Detect category
        category = "general"
        for key in responses.keys():
            if key in last_message:
                category = key
                break

        if category in responses:
            content = random.choice(responses[category])
        else:
            content = "I'm here to help with your fitness journey! You can ask me about workouts, nutrition, supplements, or motivation. What would you like to know?"

        return AIResponse(
            content=content,
            provider=AIProviderType.FALLBACK,
            model="hyperfit-fallback-v1",
            confidence=0.6,
            metadata={"fallback_reason": "All providers unavailable"}
        )

    async def generate_workout(
        self,
        user_context: UserContext,
        workout_type: str,
        duration_minutes: int,
        equipment: List[str],
    ) -> AIResponse:
        """Generate a custom workout"""
        prompt = f"""Create a {duration_minutes}-minute {workout_type} workout.

Available equipment: {', '.join(equipment) if equipment else 'Bodyweight only'}

Format:
1. Warm-up (3-5 min)
2. Main workout with exercises, sets, reps, and rest periods
3. Cool-down (3-5 min)

Include form tips for the main exercises."""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(
            messages,
            user_context,
            task_type=TaskType.WORKOUT_GENERATION,
            temperature=0.8,
        )

    async def generate_meal_plan(
        self,
        user_context: UserContext,
        calories: int,
        meals_per_day: int = 3,
        dietary_restrictions: Optional[List[str]] = None,
    ) -> AIResponse:
        """Generate a meal plan"""
        restrictions = ", ".join(dietary_restrictions) if dietary_restrictions else "None"

        prompt = f"""Create a one-day meal plan:

Target calories: {calories}
Meals per day: {meals_per_day}
Dietary restrictions: {restrictions}

For each meal, include:
- Name and description
- Calories and macros (protein, carbs, fat)
- Simple prep instructions"""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(
            messages,
            user_context,
            task_type=TaskType.MEAL_PLANNING,
            temperature=0.8,
        )

    async def explain_exercise(
        self,
        exercise_name: str,
        user_context: Optional[UserContext] = None,
    ) -> AIResponse:
        """Get detailed exercise explanation"""
        prompt = f"""Explain how to perform "{exercise_name}" properly:

1. Target muscles
2. Step-by-step instructions
3. Common mistakes
4. Breathing pattern
5. Beginner modifications
6. Safety tips"""

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(
            messages,
            user_context,
            task_type=TaskType.EXERCISE_EXPLANATION,
            temperature=0.5,
        )

    async def get_motivation(
        self,
        user_context: Optional[UserContext] = None,
        situation: Optional[str] = None,
    ) -> AIResponse:
        """Get motivational message"""
        prompt = "Give me some fitness motivation"
        if situation:
            prompt = f"I'm struggling with: {situation}. Can you help motivate me?"

        messages = [Message(role=MessageRole.USER, content=prompt)]
        return await self.generate(
            messages,
            user_context,
            task_type=TaskType.MOTIVATION,
            temperature=0.9,
        )


# Singleton instance
_ai_manager: Optional[AIManager] = None


def get_ai_manager() -> AIManager:
    """Get or create AI Manager singleton"""
    global _ai_manager
    if _ai_manager is None:
        _ai_manager = AIManager()
    return _ai_manager


def initialize_ai_manager(
    openai_api_key: Optional[str] = None,
    gemini_api_key: Optional[str] = None,
) -> AIManager:
    """Initialize AI Manager with API keys"""
    global _ai_manager
    _ai_manager = AIManager(openai_api_key, gemini_api_key)
    return _ai_manager
