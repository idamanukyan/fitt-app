"""
Chat Models

AI-powered sport-focused chatbot models
Supports conversations, message history, and context-aware responses
"""
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean,
    ForeignKey, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ConversationType(enum.Enum):
    """Type of conversation"""
    GENERAL = "general"  # General fitness questions
    WORKOUT = "workout"  # Workout-related
    NUTRITION = "nutrition"  # Nutrition advice
    SUPPLEMENTS = "supplements"  # Supplement recommendations
    INJURY = "injury"  # Injury prevention/recovery
    MOTIVATION = "motivation"  # Motivational support
    EQUIPMENT = "equipment"  # Equipment recommendations
    TECHNIQUE = "technique"  # Exercise technique


class MessageRole(enum.Enum):
    """Message sender role"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatConversation(Base):
    """
    Chat Conversation
    Represents a conversation thread between user and AI
    """
    __tablename__ = "chat_conversations"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Conversation Details
    title = Column(String(255), nullable=False)  # Auto-generated or custom
    conversation_type = Column(
        SQLEnum(ConversationType),
        default=ConversationType.GENERAL,
        nullable=False,
        index=True
    )

    # Metadata
    summary = Column(Text)  # AI-generated summary
    is_active = Column(Boolean, default=True)  # Active or archived
    is_pinned = Column(Boolean, default=False)  # Pinned conversations

    # Context (stored as JSON for flexibility)
    context = Column(JSON)  # User context, preferences, goals

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_message_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="chat_conversations")
    messages = relationship(
        "ChatMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )

    def __repr__(self):
        return f"<ChatConversation(id={self.id}, user_id={self.user_id}, title='{self.title}')>"


class ChatMessage(Base):
    """
    Chat Message
    Individual message in a conversation
    """
    __tablename__ = "chat_messages"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    conversation_id = Column(
        Integer,
        ForeignKey("chat_conversations.id"),
        nullable=False,
        index=True
    )

    # Message Details
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)

    # AI Metadata (for assistant messages)
    model_used = Column(String(100))  # e.g., "gpt-4", "claude-3"
    tokens_used = Column(Integer)
    confidence_score = Column(Integer)  # 0-100

    # References (for contextual responses)
    references = Column(JSON)  # References to workouts, supplements, etc.

    # User Feedback
    is_helpful = Column(Boolean)  # User feedback on AI response
    user_rating = Column(Integer)  # 1-5 star rating

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    edited_at = Column(DateTime(timezone=True))

    # Relationships
    conversation = relationship("ChatConversation", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, conversation_id={self.conversation_id}, role={self.role.value})>"


class ChatSuggestion(Base):
    """
    Chat Suggestions
    Pre-defined or AI-generated conversation starters
    """
    __tablename__ = "chat_suggestions"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Suggestion Details
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)  # The actual message to send
    conversation_type = Column(
        SQLEnum(ConversationType),
        default=ConversationType.GENERAL,
        nullable=False,
        index=True
    )

    # Display
    icon = Column(String(50))  # Icon name for UI
    description = Column(Text)

    # Metadata
    is_active = Column(Boolean, default=True)
    popularity_score = Column(Integer, default=0)  # Track usage

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<ChatSuggestion(id={self.id}, title='{self.title}')>"


class ChatFeedback(Base):
    """
    Chat Feedback
    User feedback on AI responses for improvement
    """
    __tablename__ = "chat_feedback"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False, index=True)

    # Feedback Details
    rating = Column(Integer)  # 1-5 stars
    is_helpful = Column(Boolean)
    feedback_text = Column(Text)

    # Categories
    is_accurate = Column(Boolean)
    is_relevant = Column(Boolean)
    is_safe = Column(Boolean)  # For health/fitness advice safety

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User")
    message = relationship("ChatMessage")

    def __repr__(self):
        return f"<ChatFeedback(id={self.id}, message_id={self.message_id}, rating={self.rating})>"
