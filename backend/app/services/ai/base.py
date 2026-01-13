"""
AI Provider Base Classes

Abstract base for AI providers with common interfaces and types.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime


class AIProviderType(str, Enum):
    """Available AI providers"""
    OPENAI = "openai"
    GEMINI = "gemini"
    FALLBACK = "fallback"  # Template-based responses


class MessageRole(str, Enum):
    """Message roles in conversation"""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class Message:
    """Chat message structure"""
    role: MessageRole
    content: str
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class AIResponse:
    """Standardized AI response"""
    content: str
    provider: AIProviderType
    model: str
    tokens_used: int = 0
    latency_ms: int = 0
    confidence: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

    @property
    def is_success(self) -> bool:
        return self.error is None and len(self.content) > 0


@dataclass
class UserContext:
    """User context for personalized responses"""
    user_id: int
    fitness_level: Optional[str] = None  # beginner, intermediate, advanced
    fitness_goals: List[str] = field(default_factory=list)
    recent_workouts: List[Dict] = field(default_factory=list)
    current_weight: Optional[float] = None
    target_weight: Optional[float] = None
    dietary_preferences: List[str] = field(default_factory=list)
    injuries: List[str] = field(default_factory=list)
    supplements: List[str] = field(default_factory=list)
    preferred_workout_time: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None


# System prompts for fitness context
FITNESS_SYSTEM_PROMPT = """You are HyperFit AI, an expert fitness and wellness coach assistant.

Your expertise includes:
- Workout programming and exercise technique
- Nutrition and meal planning
- Supplement guidance
- Injury prevention and recovery
- Motivation and mindset coaching
- Progress tracking and goal setting

Guidelines:
1. Provide evidence-based advice backed by sports science
2. Be encouraging but realistic about expectations
3. Always prioritize safety - recommend consulting professionals for medical concerns
4. Personalize advice based on user's fitness level and goals
5. Keep responses concise but comprehensive
6. Use specific numbers and actionable recommendations when possible
7. Ask clarifying questions when needed for better advice

Safety rules:
- Never recommend extreme diets or dangerous exercises
- Always suggest medical consultation for injuries or health concerns
- Be mindful of eating disorder triggers in nutrition advice
- Don't provide specific medical diagnoses or treatments"""


WORKOUT_SPECIALIST_PROMPT = """You are a workout programming specialist. Focus on:
- Exercise selection and programming
- Progressive overload principles
- Form and technique cues
- Rest and recovery optimization
- Periodization strategies"""


NUTRITION_SPECIALIST_PROMPT = """You are a sports nutrition specialist. Focus on:
- Macro and micronutrient guidance
- Meal timing and frequency
- Hydration strategies
- Supplement recommendations (evidence-based only)
- Diet adjustments for goals (cut/bulk/maintain)"""


class AIProvider(ABC):
    """Abstract base class for AI providers"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._is_available = False

    @property
    @abstractmethod
    def provider_type(self) -> AIProviderType:
        """Return the provider type"""
        pass

    @property
    @abstractmethod
    def default_model(self) -> str:
        """Return the default model name"""
        pass

    @abstractmethod
    async def generate(
        self,
        messages: List[Message],
        user_context: Optional[UserContext] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> AIResponse:
        """Generate a response from the AI provider"""
        pass

    @abstractmethod
    async def check_availability(self) -> bool:
        """Check if the provider is available and API key is valid"""
        pass

    def build_system_prompt(
        self,
        user_context: Optional[UserContext] = None,
        specialist_prompt: Optional[str] = None
    ) -> str:
        """Build system prompt with user context"""
        prompt = FITNESS_SYSTEM_PROMPT

        if specialist_prompt:
            prompt += f"\n\n{specialist_prompt}"

        if user_context:
            context_parts = []

            if user_context.fitness_level:
                context_parts.append(f"User fitness level: {user_context.fitness_level}")

            if user_context.fitness_goals:
                goals = ", ".join(user_context.fitness_goals)
                context_parts.append(f"User goals: {goals}")

            if user_context.current_weight and user_context.target_weight:
                context_parts.append(
                    f"Current weight: {user_context.current_weight}kg, "
                    f"Target: {user_context.target_weight}kg"
                )

            if user_context.dietary_preferences:
                prefs = ", ".join(user_context.dietary_preferences)
                context_parts.append(f"Dietary preferences: {prefs}")

            if user_context.injuries:
                injuries = ", ".join(user_context.injuries)
                context_parts.append(f"Current injuries/limitations: {injuries}")

            if user_context.age:
                context_parts.append(f"Age: {user_context.age}")

            if user_context.gender:
                context_parts.append(f"Gender: {user_context.gender}")

            if context_parts:
                prompt += "\n\nUser Context:\n" + "\n".join(f"- {p}" for p in context_parts)

        return prompt
