"""
Chat Schemas

Pydantic schemas for AI chat system validation and serialization
"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.chat import ConversationType, MessageRole

# ===== CHAT MESSAGE SCHEMAS =====

class ChatMessageBase(BaseModel):
    """Base schema for chat messages"""
    content: str = Field(..., min_length=1, max_length=10000)
    role: MessageRole


class ChatMessageCreate(BaseModel):
    """Schema for creating a new message"""
    content: str = Field(..., min_length=1, max_length=10000)
    conversation_id: int | None = None  # If None, creates new conversation


class ChatMessageUpdate(BaseModel):
    """Schema for updating a message"""
    content: str = Field(..., min_length=1, max_length=10000)


class ChatMessage(ChatMessageBase):
    """Schema for message response"""
    id: int
    conversation_id: int
    model_used: str | None
    tokens_used: int | None
    confidence_score: int | None
    references: dict[str, Any] | None
    is_helpful: bool | None
    user_rating: int | None
    created_at: datetime
    edited_at: datetime | None

    class Config:
        from_attributes = True


# ===== CHAT CONVERSATION SCHEMAS =====

class ChatConversationBase(BaseModel):
    """Base schema for conversations"""
    title: str = Field(..., min_length=1, max_length=255)
    conversation_type: ConversationType = ConversationType.GENERAL


class ChatConversationCreate(BaseModel):
    """Schema for creating a new conversation"""
    title: str | None = "New Conversation"
    conversation_type: ConversationType = ConversationType.GENERAL
    initial_message: str | None = None  # First message content
    context: dict[str, Any] | None = None


class ChatConversationUpdate(BaseModel):
    """Schema for updating a conversation"""
    title: str | None = Field(None, min_length=1, max_length=255)
    is_active: bool | None = None
    is_pinned: bool | None = None


class ChatConversation(ChatConversationBase):
    """Schema for conversation response"""
    id: int
    user_id: int
    summary: str | None
    is_active: bool
    is_pinned: bool
    context: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime | None
    last_message_at: datetime | None
    messages: list[ChatMessage] = []

    class Config:
        from_attributes = True


class ChatConversationSummary(BaseModel):
    """Summary schema for conversation list"""
    id: int
    title: str
    conversation_type: ConversationType
    is_pinned: bool
    last_message_at: datetime | None
    message_count: int
    last_message_preview: str | None  # First 100 chars of last message

    class Config:
        from_attributes = True


# ===== CHAT REQUEST/RESPONSE SCHEMAS =====

class SendMessageRequest(BaseModel):
    """Schema for sending a message"""
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: int | None = None
    conversation_type: ConversationType | None = ConversationType.GENERAL
    include_context: bool = True  # Include user's workout/nutrition data


class SendMessageResponse(BaseModel):
    """Schema for message response with AI reply"""
    conversation_id: int
    user_message: ChatMessage
    assistant_message: ChatMessage
    conversation_type: ConversationType


class ChatContext(BaseModel):
    """User context for AI responses"""
    user_id: int
    fitness_goals: list[str] | None = []
    recent_workouts: list[dict[str, Any]] | None = []
    nutrition_preferences: dict[str, Any] | None = {}
    current_supplements: list[str] | None = []
    injury_history: list[str] | None = []
    fitness_level: str | None = None
    preferred_workout_types: list[str] | None = []


# ===== CHAT SUGGESTION SCHEMAS =====

class ChatSuggestionBase(BaseModel):
    """Base schema for chat suggestions"""
    title: str = Field(..., min_length=1, max_length=255)
    prompt: str = Field(..., min_length=1, max_length=500)
    conversation_type: ConversationType = ConversationType.GENERAL
    icon: str | None = None
    description: str | None = None


class ChatSuggestionCreate(ChatSuggestionBase):
    """Schema for creating a suggestion"""
    pass


class ChatSuggestion(ChatSuggestionBase):
    """Schema for suggestion response"""
    id: int
    is_active: bool
    popularity_score: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== CHAT FEEDBACK SCHEMAS =====

class ChatFeedbackBase(BaseModel):
    """Base schema for chat feedback"""
    message_id: int
    rating: int | None = Field(None, ge=1, le=5)
    is_helpful: bool | None = None
    feedback_text: str | None = Field(None, max_length=1000)
    is_accurate: bool | None = None
    is_relevant: bool | None = None
    is_safe: bool | None = None


class ChatFeedbackCreate(ChatFeedbackBase):
    """Schema for creating feedback"""
    pass


class ChatFeedback(ChatFeedbackBase):
    """Schema for feedback response"""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== LIST RESPONSE SCHEMAS =====

class ChatConversationListResponse(BaseModel):
    """Paginated conversation list response"""
    conversations: list[ChatConversationSummary]
    total: int
    page: int
    page_size: int
    has_more: bool


class ChatSuggestionListResponse(BaseModel):
    """Chat suggestions list response"""
    suggestions: list[ChatSuggestion]
    total: int


# ===== STREAMING RESPONSE SCHEMAS =====

class ChatStreamChunk(BaseModel):
    """Schema for streaming chat responses"""
    conversation_id: int
    message_id: int | None
    chunk: str
    is_complete: bool = False
    tokens_used: int | None = None


# ===== AI MODEL CONFIGURATION =====

class AIModelConfig(BaseModel):
    """Configuration for AI model"""
    model_name: str = "gpt-4"  # Default model
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(500, ge=50, le=2000)
    top_p: float = Field(1.0, ge=0.0, le=1.0)
    frequency_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    presence_penalty: float = Field(0.0, ge=-2.0, le=2.0)


# ===== SPECIALIZED AI REQUEST SCHEMAS =====

class GenerateWorkoutRequest(BaseModel):
    """Request for AI workout generation"""
    workout_type: str = Field(..., description="Type of workout (strength, cardio, hiit, etc.)")
    duration_minutes: int = Field(30, ge=10, le=180, description="Duration in minutes")
    equipment: list[str] = Field(default=[], description="Available equipment")
    fitness_level: str | None = Field(None, description="beginner, intermediate, advanced")
    target_muscles: list[str] | None = Field(None, description="Target muscle groups")
    preferences: dict[str, Any] | None = None


class GenerateWorkoutResponse(BaseModel):
    """Response for AI workout generation"""
    workout: str
    provider: str
    model: str
    tokens_used: int
    latency_ms: int
    confidence: float


class GenerateMealPlanRequest(BaseModel):
    """Request for AI meal plan generation"""
    target_calories: int = Field(..., ge=1000, le=5000, description="Target daily calories")
    meals_per_day: int = Field(3, ge=2, le=6, description="Number of meals per day")
    dietary_restrictions: list[str] = Field(default=[], description="Dietary restrictions")
    dietary_preferences: list[str] = Field(default=[], description="Food preferences")
    goal: str | None = Field(None, description="cut, bulk, maintain")
    allergies: list[str] | None = None


class GenerateMealPlanResponse(BaseModel):
    """Response for AI meal plan generation"""
    meal_plan: str
    provider: str
    model: str
    tokens_used: int
    latency_ms: int
    confidence: float


class ExplainExerciseRequest(BaseModel):
    """Request for AI exercise explanation"""
    exercise_name: str = Field(..., min_length=2, max_length=100)
    include_video_suggestions: bool = Field(False)
    fitness_level: str | None = None


class ExplainExerciseResponse(BaseModel):
    """Response for AI exercise explanation"""
    explanation: str
    provider: str
    model: str
    tokens_used: int
    latency_ms: int
    confidence: float


class GetMotivationRequest(BaseModel):
    """Request for AI motivation"""
    situation: str | None = Field(None, description="What you're struggling with")
    goal: str | None = None
    mood: str | None = None


class GetMotivationResponse(BaseModel):
    """Response for AI motivation"""
    message: str
    provider: str
    model: str
    tokens_used: int
    latency_ms: int
    confidence: float


class AIProviderStatus(BaseModel):
    """Status of AI providers"""
    openai_available: bool
    gemini_available: bool
    active_providers: list[str]
