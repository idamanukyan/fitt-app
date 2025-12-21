"""
Chat Routes

API endpoints for AI-powered sport-focused chatbot
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.chat import ConversationType
from app.schemas.chat_schemas import (
    ChatConversation, ChatConversationSummary, ChatConversationCreate,
    ChatConversationUpdate, ChatConversationListResponse,
    ChatMessage, SendMessageRequest, SendMessageResponse,
    ChatSuggestion, ChatSuggestionListResponse,
    ChatFeedback, ChatFeedbackCreate, ChatContext
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


# ===== CONVERSATION ENDPOINTS =====

@router.get("/conversations", response_model=ChatConversationListResponse)
async def get_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    include_archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's chat conversations

    Returns paginated list of conversations with last message preview
    """
    conversations, total = ChatService.get_user_conversations(
        db, current_user.id, skip, limit, include_archived
    )

    # Build conversation summaries
    summaries = []
    for conv in conversations:
        last_message = conv.messages[-1] if conv.messages else None
        summary = ChatConversationSummary(
            id=conv.id,
            title=conv.title,
            conversation_type=conv.conversation_type,
            is_pinned=conv.is_pinned,
            last_message_at=conv.last_message_at,
            message_count=len(conv.messages),
            last_message_preview=last_message.content[:100] if last_message else None
        )
        summaries.append(summary)

    return ChatConversationListResponse(
        conversations=summaries,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        has_more=(skip + limit) < total
    )


@router.post("/conversations", response_model=ChatConversation, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ChatConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new chat conversation

    Optionally include an initial message
    """
    conversation = ChatService.create_conversation(
        db, current_user.id, conversation_data
    )

    # If initial message provided, send it
    if conversation_data.initial_message:
        ChatService.send_message(
            db,
            current_user.id,
            SendMessageRequest(
                message=conversation_data.initial_message,
                conversation_id=conversation.id,
                conversation_type=conversation_data.conversation_type
            )
        )
        db.refresh(conversation)

    return conversation


@router.get("/conversations/{conversation_id}", response_model=ChatConversation)
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get conversation by ID with full message history"""
    conversation = ChatService.get_conversation_by_id(
        db, conversation_id, current_user.id
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.put("/conversations/{conversation_id}", response_model=ChatConversation)
async def update_conversation(
    conversation_id: int,
    update_data: ChatConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update conversation (title, archive, pin)"""
    conversation = ChatService.update_conversation(
        db, conversation_id, current_user.id, update_data
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation and all its messages"""
    success = ChatService.delete_conversation(
        db, conversation_id, current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return None


# ===== MESSAGE ENDPOINTS =====

@router.post("/messages", response_model=SendMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message and receive AI response

    Creates new conversation if conversation_id not provided
    """
    # Build user context if requested
    user_context = None
    if message_request.include_context:
        user_context = ChatContext(
            user_id=current_user.id,
            fitness_goals=[],  # TODO: Fetch from user profile/goals
            recent_workouts=[],  # TODO: Fetch recent workout logs
            nutrition_preferences={},  # TODO: Fetch nutrition preferences
            current_supplements=[],  # TODO: Fetch active supplements
            injury_history=[],  # TODO: Fetch injury history
            fitness_level=None,  # TODO: Fetch from user profile
            preferred_workout_types=[]  # TODO: Fetch preferences
        )

    try:
        user_message, assistant_message = ChatService.send_message(
            db, current_user.id, message_request, user_context
        )

        return SendMessageResponse(
            conversation_id=user_message.conversation_id,
            user_message=user_message,
            assistant_message=assistant_message,
            conversation_type=message_request.conversation_type
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessage])
async def get_conversation_messages(
    conversation_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages for a conversation"""
    messages = ChatService.get_conversation_messages(
        db, conversation_id, current_user.id, skip, limit
    )

    if messages is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return messages


# ===== FEEDBACK ENDPOINTS =====

@router.post("/messages/{message_id}/feedback", response_model=ChatFeedback, status_code=status.HTTP_201_CREATED)
async def submit_message_feedback(
    message_id: int,
    feedback_data: ChatFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit feedback for an AI response"""
    try:
        feedback = ChatService.submit_feedback(
            db, current_user.id, message_id, feedback_data
        )
        return feedback
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to submit feedback"
        )


# ===== SUGGESTION ENDPOINTS =====

@router.get("/suggestions", response_model=ChatSuggestionListResponse)
async def get_suggestions(
    conversation_type: Optional[ConversationType] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get chat suggestions/prompts

    Helps users start conversations with pre-defined prompts
    """
    suggestions = ChatService.get_suggestions(
        db, conversation_type, limit
    )

    return ChatSuggestionListResponse(
        suggestions=suggestions,
        total=len(suggestions)
    )


# ===== UTILITY ENDPOINTS =====

@router.get("/types", response_model=List[dict])
async def get_conversation_types():
    """Get available conversation types"""
    types = []
    for conv_type in ConversationType:
        types.append({
            "value": conv_type.value,
            "label": conv_type.value.replace("_", " ").title(),
            "icon": _get_type_icon(conv_type)
        })
    return types


def _get_type_icon(conv_type: ConversationType) -> str:
    """Get icon name for conversation type"""
    icons = {
        ConversationType.GENERAL: "chatbubble-ellipses",
        ConversationType.WORKOUT: "barbell",
        ConversationType.NUTRITION: "nutrition",
        ConversationType.SUPPLEMENTS: "fitness",
        ConversationType.INJURY: "medical",
        ConversationType.MOTIVATION: "flash",
        ConversationType.EQUIPMENT: "cart",
        ConversationType.TECHNIQUE: "body",
    }
    return icons.get(conv_type, "chatbubble")
