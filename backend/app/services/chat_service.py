"""
Chat Service

Business logic for AI-powered sport-focused chatbot
Handles conversations, message generation, and contextual responses
Uses OpenAI GPT and Google Gemini with auto-selection and failover
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from app.models.chat import (
    ChatConversation, ChatMessage, ChatSuggestion,
    ChatFeedback, ConversationType, MessageRole
)
from app.schemas.chat_schemas import (
    ChatConversationCreate, ChatConversationUpdate,
    ChatMessageCreate, SendMessageRequest, ChatContext,
    ChatSuggestionCreate, ChatFeedbackCreate
)
from app.services.ai.manager import get_ai_manager, TaskType
from app.services.ai.base import (
    Message as AIMessage,
    MessageRole as AIMessageRole,
    UserContext,
    AIProviderType,
)
import random
import os
import asyncio

# Optional httpx import for API calls
try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


def _map_conversation_type_to_task_type(conv_type: ConversationType) -> TaskType:
    """Map chat conversation type to AI task type"""
    mapping = {
        ConversationType.GENERAL: TaskType.CHAT,
        ConversationType.WORKOUT: TaskType.WORKOUT_GENERATION,
        ConversationType.NUTRITION: TaskType.MEAL_PLANNING,
        ConversationType.SUPPLEMENTS: TaskType.CHAT,
        ConversationType.INJURY: TaskType.CHAT,
        ConversationType.MOTIVATION: TaskType.MOTIVATION,
        ConversationType.EQUIPMENT: TaskType.CHAT,
        ConversationType.TECHNIQUE: TaskType.EXERCISE_EXPLANATION,
    }
    return mapping.get(conv_type, TaskType.CHAT)


class AIResponseGenerator:
    """
    AI Response Generator

    Generates sport-focused AI responses based on conversation context
    Uses OpenAI GPT and Google Gemini with auto-selection and failover
    Falls back to template responses if all providers fail
    """

    # Sport and fitness knowledge base (fallback templates)
    WORKOUT_TIPS = {
        ConversationType.WORKOUT: [
            "Focus on progressive overload - gradually increase weight, reps, or sets over time.",
            "Compound exercises like squats, deadlifts, and bench press work multiple muscle groups.",
            "Rest is crucial - muscles grow during recovery, not during the workout.",
            "Maintain proper form over heavy weight to prevent injury.",
            "Track your workouts to measure progress and stay motivated.",
        ],
        ConversationType.NUTRITION: [
            "Aim for 0.7-1g of protein per pound of body weight for muscle building.",
            "Carbohydrates are your body's primary energy source for intense workouts.",
            "Healthy fats support hormone production and overall health.",
            "Hydration is key - drink water before, during, and after workouts.",
            "Meal timing can help optimize performance and recovery.",
        ],
        ConversationType.SUPPLEMENTS: [
            "Creatine monohydrate is one of the most researched and effective supplements.",
            "Protein powder is convenient but whole foods should be your primary source.",
            "Pre-workouts can boost energy but aren't necessary for everyone.",
            "Fish oil supports joint health and reduces inflammation.",
            "Vitamin D3 is essential, especially if you don't get much sun exposure.",
        ],
        ConversationType.TECHNIQUE: [
            "Focus on the mind-muscle connection - feel the muscle working.",
            "Control the negative (eccentric) portion of each rep for better results.",
            "Full range of motion ensures complete muscle activation.",
            "Breathing properly helps with stability and power generation.",
            "Video yourself to check and improve your form.",
        ],
        ConversationType.INJURY: [
            "Listen to your body - pain is different from muscle soreness.",
            "Warm up properly before intense exercise to prevent injury.",
            "Ice acute injuries within the first 48 hours to reduce inflammation.",
            "Mobility work and stretching aid in injury prevention and recovery.",
            "Consult a healthcare professional for persistent pain.",
        ],
        ConversationType.MOTIVATION: [
            "Set specific, measurable goals and track your progress.",
            "Find a workout partner or join a community for accountability.",
            "Remember why you started when motivation is low.",
            "Celebrate small wins along your fitness journey.",
            "Consistency beats perfection - show up even on tough days.",
        ],
    }

    @staticmethod
    async def call_ai_providers(
        message: str,
        conversation_type: ConversationType,
        user_context: Optional[ChatContext] = None,
        conversation_history: Optional[List[ChatMessage]] = None
    ) -> Tuple[Optional[str], Dict[str, Any]]:
        """
        Call AI providers (OpenAI/Gemini) with auto-selection and failover

        Returns:
            Tuple of (response_text, metadata)
        """
        ai_manager = get_ai_manager()

        # Build conversation messages for AI
        ai_messages = []
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                role = AIMessageRole.USER if msg.role == MessageRole.USER else AIMessageRole.ASSISTANT
                ai_messages.append(AIMessage(role=role, content=msg.content))

        # Add current message
        ai_messages.append(AIMessage(role=AIMessageRole.USER, content=message))

        # Build user context for personalization
        ai_user_context = None
        if user_context:
            ai_user_context = UserContext(
                user_id=user_context.user_id,
                fitness_level=user_context.fitness_level,
                fitness_goals=user_context.fitness_goals or [],
                dietary_preferences=user_context.nutrition_preferences.get("preferences", []) if user_context.nutrition_preferences else [],
                injuries=user_context.injury_history or [],
                supplements=user_context.current_supplements or [],
            )

        # Map conversation type to task type for provider selection
        task_type = _map_conversation_type_to_task_type(conversation_type)

        # Generate response using AI manager
        response = await ai_manager.generate(
            messages=ai_messages,
            user_context=ai_user_context,
            task_type=task_type,
            temperature=0.7,
            max_tokens=1000,
        )

        if response.is_success:
            metadata = {
                "provider": response.provider.value,
                "model": response.model,
                "tokens_used": response.tokens_used,
                "latency_ms": response.latency_ms,
                "confidence": response.confidence,
            }
            return response.content, metadata

        return None, {"error": response.error}

    @staticmethod
    def generate_response(
        message: str,
        conversation_type: ConversationType,
        user_context: Optional[ChatContext] = None,
        conversation_history: Optional[List[ChatMessage]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate AI response based on user message and context

        Returns:
            Tuple of (response_text, metadata)
        """
        # Determine conversation type from message if general
        if conversation_type == ConversationType.GENERAL:
            conversation_type = AIResponseGenerator._detect_conversation_type(message)

        # Try to get response from AI providers (OpenAI/Gemini)
        ai_response = None
        ai_metadata = {}
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If we're already in an async context, create a new task
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        asyncio.run,
                        AIResponseGenerator.call_ai_providers(
                            message, conversation_type, user_context, conversation_history
                        )
                    )
                    ai_response, ai_metadata = future.result(timeout=65)
            else:
                ai_response, ai_metadata = asyncio.run(
                    AIResponseGenerator.call_ai_providers(
                        message, conversation_type, user_context, conversation_history
                    )
                )
        except Exception as e:
            print(f"Error calling AI providers: {e}")
            ai_response = None
            ai_metadata = {"error": str(e)}

        # Use AI response or fall back to template response
        if ai_response:
            response = ai_response
            model_used = ai_metadata.get("model", "unknown")
            provider_used = ai_metadata.get("provider", "unknown")
            tokens_used = ai_metadata.get("tokens_used", 0)
            confidence = ai_metadata.get("confidence", 0.9)
        else:
            # Build context-aware response as fallback
            response = AIResponseGenerator._build_contextual_response(
                message, conversation_type, user_context, conversation_history
            )
            model_used = "hyperfit-fallback-v1"
            provider_used = "fallback"
            tokens_used = len(response.split())
            confidence = 0.6

        # Generate metadata
        metadata = {
            "model_used": model_used,
            "provider": provider_used,
            "tokens_used": tokens_used,
            "confidence_score": int(confidence * 100),
            "conversation_type": conversation_type.value,
            "references": AIResponseGenerator._generate_references(
                conversation_type, user_context
            )
        }

        return response, metadata

    @staticmethod
    def _detect_conversation_type(message: str) -> ConversationType:
        """Detect conversation type from message content"""
        message_lower = message.lower()

        keywords = {
            ConversationType.WORKOUT: [
                "workout", "exercise", "training", "gym", "lift", "routine",
                "rep", "set", "weight", "muscle", "strength"
            ],
            ConversationType.NUTRITION: [
                "nutrition", "diet", "food", "meal", "eat", "calorie",
                "protein", "carb", "fat", "vitamin", "nutrient"
            ],
            ConversationType.SUPPLEMENTS: [
                "supplement", "creatine", "protein powder", "pre-workout",
                "vitamin", "fish oil", "bcaa", "glutamine"
            ],
            ConversationType.INJURY: [
                "injury", "pain", "hurt", "sore", "strain", "sprain",
                "recovery", "rehab", "physical therapy"
            ],
            ConversationType.TECHNIQUE: [
                "form", "technique", "how to", "proper way", "correct",
                "posture", "movement", "execution"
            ],
            ConversationType.MOTIVATION: [
                "motivation", "give up", "hard", "difficult", "struggle",
                "inspire", "encourage", "keep going"
            ],
            ConversationType.EQUIPMENT: [
                "equipment", "gear", "shoes", "clothing", "accessory",
                "buy", "recommend", "brand"
            ],
        }

        # Count keyword matches for each type
        type_scores = {}
        for conv_type, words in keywords.items():
            score = sum(1 for word in words if word in message_lower)
            if score > 0:
                type_scores[conv_type] = score

        # Return type with highest score, or GENERAL if none match
        if type_scores:
            return max(type_scores.items(), key=lambda x: x[1])[0]
        return ConversationType.GENERAL

    @staticmethod
    def _build_contextual_response(
        message: str,
        conversation_type: ConversationType,
        user_context: Optional[ChatContext],
        conversation_history: Optional[List[ChatMessage]]
    ) -> str:
        """Build a contextual response using available data"""

        # Start with greeting if first message
        is_first_message = not conversation_history or len(conversation_history) == 0

        if is_first_message:
            greeting = "Hey there! I'm your HyperFit AI coach. "
        else:
            greeting = ""

        # Get relevant tip based on conversation type
        tips = AIResponseGenerator.WORKOUT_TIPS.get(
            conversation_type,
            AIResponseGenerator.WORKOUT_TIPS[ConversationType.WORKOUT]
        )
        main_response = random.choice(tips)

        # Add personalization if context available
        personalization = ""
        if user_context:
            if user_context.fitness_goals:
                goal = random.choice(user_context.fitness_goals)
                personalization = f"\n\nGiven your goal of {goal}, this is especially important for your progress. "

            if user_context.fitness_level:
                level = user_context.fitness_level
                personalization += f"As a {level} athlete, "
                if level.lower() == "beginner":
                    personalization += "focus on building a solid foundation with proper form. "
                elif level.lower() == "intermediate":
                    personalization += "you're ready to implement more advanced techniques. "
                else:
                    personalization += "you understand the importance of optimization and periodization. "

        # Add call to action
        cta = "\n\nWhat specific aspect would you like to know more about?"

        return f"{greeting}{main_response}{personalization}{cta}"

    @staticmethod
    def _generate_references(
        conversation_type: ConversationType,
        user_context: Optional[ChatContext]
    ) -> Dict[str, Any]:
        """Generate references to user's data"""
        references = {
            "conversation_type": conversation_type.value,
        }

        if user_context:
            if user_context.recent_workouts:
                references["recent_workouts_count"] = len(user_context.recent_workouts)
            if user_context.current_supplements:
                references["current_supplements"] = user_context.current_supplements
            if user_context.fitness_goals:
                references["active_goals"] = user_context.fitness_goals

        return references


class ChatService:
    """Service for managing chat conversations and messages"""

    @staticmethod
    def get_user_conversations(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        include_archived: bool = False
    ) -> Tuple[List[ChatConversation], int]:
        """Get user's conversations with pagination"""
        query = db.query(ChatConversation).filter(
            ChatConversation.user_id == user_id
        )

        if not include_archived:
            query = query.filter(ChatConversation.is_active == True)

        total = query.count()

        conversations = query.order_by(
            desc(ChatConversation.is_pinned),
            desc(ChatConversation.updated_at)
        ).offset(skip).limit(limit).all()

        return conversations, total

    @staticmethod
    def get_conversation_by_id(
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> Optional[ChatConversation]:
        """Get conversation by ID (with user ownership check)"""
        return db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id
        ).first()

    @staticmethod
    def create_conversation(
        db: Session,
        user_id: int,
        conversation_data: ChatConversationCreate
    ) -> ChatConversation:
        """Create a new conversation"""
        conversation = ChatConversation(
            user_id=user_id,
            title=conversation_data.title or "New Conversation",
            conversation_type=conversation_data.conversation_type,
            context=conversation_data.context or {}
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def update_conversation(
        db: Session,
        conversation_id: int,
        user_id: int,
        update_data: ChatConversationUpdate
    ) -> Optional[ChatConversation]:
        """Update conversation details"""
        conversation = ChatService.get_conversation_by_id(db, conversation_id, user_id)

        if not conversation:
            return None

        if update_data.title:
            conversation.title = update_data.title
        if update_data.is_active is not None:
            conversation.is_active = update_data.is_active
        if update_data.is_pinned is not None:
            conversation.is_pinned = update_data.is_pinned

        conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def delete_conversation(
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> bool:
        """Delete a conversation"""
        conversation = ChatService.get_conversation_by_id(db, conversation_id, user_id)

        if not conversation:
            return False

        db.delete(conversation)
        db.commit()

        return True

    @staticmethod
    def send_message(
        db: Session,
        user_id: int,
        message_request: SendMessageRequest,
        user_context: Optional[ChatContext] = None
    ) -> Tuple[ChatMessage, ChatMessage]:
        """
        Send a message and get AI response

        Returns:
            Tuple of (user_message, assistant_message)
        """
        # Get or create conversation
        if message_request.conversation_id:
            conversation = ChatService.get_conversation_by_id(
                db, message_request.conversation_id, user_id
            )
            if not conversation:
                raise ValueError("Conversation not found")
        else:
            # Create new conversation
            conversation = ChatService.create_conversation(
                db,
                user_id,
                ChatConversationCreate(
                    title=message_request.message[:50] + "...",
                    conversation_type=message_request.conversation_type
                )
            )

        # Create user message
        user_message = ChatMessage(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=message_request.message
        )
        db.add(user_message)
        db.flush()

        # Get conversation history
        conversation_history = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation.id
        ).order_by(ChatMessage.created_at).limit(10).all()

        # Generate AI response
        response_text, metadata = AIResponseGenerator.generate_response(
            message_request.message,
            conversation.conversation_type,
            user_context,
            conversation_history
        )

        # Create assistant message
        assistant_message = ChatMessage(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=response_text,
            model_used=metadata.get("model_used"),
            tokens_used=metadata.get("tokens_used"),
            confidence_score=metadata.get("confidence_score"),
            references=metadata.get("references")
        )
        db.add(assistant_message)

        # Update conversation
        conversation.last_message_at = datetime.utcnow()
        conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)

        return user_message, assistant_message

    @staticmethod
    def get_conversation_messages(
        db: Session,
        conversation_id: int,
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get messages for a conversation"""
        conversation = ChatService.get_conversation_by_id(db, conversation_id, user_id)

        if not conversation:
            return []

        messages = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conversation_id
        ).order_by(ChatMessage.created_at).offset(skip).limit(limit).all()

        return messages

    @staticmethod
    def submit_feedback(
        db: Session,
        user_id: int,
        message_id: int,
        feedback_data: ChatFeedbackCreate
    ) -> ChatFeedback:
        """Submit feedback for an AI response"""
        feedback = ChatFeedback(
            user_id=user_id,
            message_id=message_id,
            rating=feedback_data.rating,
            is_helpful=feedback_data.is_helpful,
            feedback_text=feedback_data.feedback_text,
            is_accurate=feedback_data.is_accurate,
            is_relevant=feedback_data.is_relevant,
            is_safe=feedback_data.is_safe
        )

        db.add(feedback)

        # Update message feedback
        message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
        if message:
            message.is_helpful = feedback_data.is_helpful
            message.user_rating = feedback_data.rating

        db.commit()
        db.refresh(feedback)

        return feedback

    @staticmethod
    def get_suggestions(
        db: Session,
        conversation_type: Optional[ConversationType] = None,
        limit: int = 10
    ) -> List[ChatSuggestion]:
        """Get chat suggestions"""
        query = db.query(ChatSuggestion).filter(ChatSuggestion.is_active == True)

        if conversation_type:
            query = query.filter(ChatSuggestion.conversation_type == conversation_type)

        suggestions = query.order_by(
            desc(ChatSuggestion.popularity_score)
        ).limit(limit).all()

        return suggestions
