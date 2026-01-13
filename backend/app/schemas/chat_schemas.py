"""
Chat Schemas

Pydantic schemas for AI chat system validation and serialization
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.chat import ConversationType, MessageRole


# ===== CHAT MESSAGE SCHEMAS =====

class ChatMessageBase(BaseModel):
    """Base schema for chat messages"""
    content: str = Field(..., min_length=1, max_length=10000)
    role: MessageRole


class ChatMessageCreate(BaseModel):
    """Schema for creating a new message"""
    content: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[int] = None  # If None, creates new conversation


class ChatMessageUpdate(BaseModel):
    """Schema for updating a message"""
    content: str = Field(..., min_length=1, max_length=10000)


class ChatMessage(ChatMessageBase):
    """Schema for message response"""
    id: int
    conversation_id: int
    model_used: Optional[str]
    tokens_used: Optional[int]
    confidence_score: Optional[int]
    references: Optional[Dict[str, Any]]
    is_helpful: Optional[bool]
    user_rating: Optional[int]
    created_at: datetime
    edited_at: Optional[datetime]

    class Config:
        from_attributes = True


# ===== CHAT CONVERSATION SCHEMAS =====

class ChatConversationBase(BaseModel):
    """Base schema for conversations"""
    title: str = Field(..., min_length=1, max_length=255)
    conversation_type: ConversationType = ConversationType.GENERAL


class ChatConversationCreate(BaseModel):
    """Schema for creating a new conversation"""
    title: Optional[str] = "New Conversation"
    conversation_type: ConversationType = ConversationType.GENERAL
    initial_message: Optional[str] = None  # First message content
    context: Optional[Dict[str, Any]] = None


class ChatConversationUpdate(BaseModel):
    """Schema for updating a conversation"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None


class ChatConversation(ChatConversationBase):
    """Schema for conversation response"""
    id: int
    user_id: int
    summary: Optional[str]
    is_active: bool
    is_pinned: bool
    context: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]
    last_message_at: Optional[datetime]
    messages: List[ChatMessage] = []

    class Config:
        from_attributes = True


class ChatConversationSummary(BaseModel):
    """Summary schema for conversation list"""
    id: int
    title: str
    conversation_type: ConversationType
    is_pinned: bool
    last_message_at: Optional[datetime]
    message_count: int
    last_message_preview: Optional[str]  # First 100 chars of last message

    class Config:
        from_attributes = True


# ===== CHAT REQUEST/RESPONSE SCHEMAS =====

class SendMessageRequest(BaseModel):
    """Schema for sending a message"""
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[int] = None
    conversation_type: Optional[ConversationType] = ConversationType.GENERAL
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
    fitness_goals: Optional[List[str]] = []
    recent_workouts: Optional[List[Dict[str, Any]]] = []
    nutrition_preferences: Optional[Dict[str, Any]] = {}
    current_supplements: Optional[List[str]] = []
    injury_history: Optional[List[str]] = []
    fitness_level: Optional[str] = None
    preferred_workout_types: Optional[List[str]] = []


# ===== CHAT SUGGESTION SCHEMAS =====

class ChatSuggestionBase(BaseModel):
    """Base schema for chat suggestions"""
    title: str = Field(..., min_length=1, max_length=255)
    prompt: str = Field(..., min_length=1, max_length=500)
    conversation_type: ConversationType = ConversationType.GENERAL
    icon: Optional[str] = None
    description: Optional[str] = None


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
    rating: Optional[int] = Field(None, ge=1, le=5)
    is_helpful: Optional[bool] = None
    feedback_text: Optional[str] = Field(None, max_length=1000)
    is_accurate: Optional[bool] = None
    is_relevant: Optional[bool] = None
    is_safe: Optional[bool] = None


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
    conversations: List[ChatConversationSummary]
    total: int
    page: int
    page_size: int
    has_more: bool


class ChatSuggestionListResponse(BaseModel):
    """Chat suggestions list response"""
    suggestions: List[ChatSuggestion]
    total: int


# ===== STREAMING RESPONSE SCHEMAS =====

class ChatStreamChunk(BaseModel):
    """Schema for streaming chat responses"""
    conversation_id: int
    message_id: Optional[int]
    chunk: str
    is_complete: bool = False
    tokens_used: Optional[int] = None


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
    equipment: List[str] = Field(default=[], description="Available equipment")
    fitness_level: Optional[str] = Field(None, description="beginner, intermediate, advanced")
    target_muscles: Optional[List[str]] = Field(None, description="Target muscle groups")
    preferences: Optional[Dict[str, Any]] = None


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
    dietary_restrictions: List[str] = Field(default=[], description="Dietary restrictions")
    dietary_preferences: List[str] = Field(default=[], description="Food preferences")
    goal: Optional[str] = Field(None, description="cut, bulk, maintain")
    allergies: Optional[List[str]] = None


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
    fitness_level: Optional[str] = None


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
    situation: Optional[str] = Field(None, description="What you're struggling with")
    goal: Optional[str] = None
    mood: Optional[str] = None


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
    active_providers: List[str]
