/**
 * Chat Types
 *
 * TypeScript interfaces for AI chat system
 */

// ===== ENUMS =====

export enum ConversationType {
  GENERAL = 'general',
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  SUPPLEMENTS = 'supplements',
  INJURY = 'injury',
  MOTIVATION = 'motivation',
  EQUIPMENT = 'equipment',
  TECHNIQUE = 'technique',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// ===== CHAT MESSAGE TYPES =====

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  model_used?: string;
  tokens_used?: number;
  confidence_score?: number;
  references?: Record<string, any>;
  is_helpful?: boolean;
  user_rating?: number;
  created_at: string;
  edited_at?: string;
}

export interface ChatMessageCreate {
  content: string;
  conversation_id?: number;
}

// ===== CONVERSATION TYPES =====

export interface ChatConversation {
  id: number;
  user_id: number;
  title: string;
  conversation_type: ConversationType;
  summary?: string;
  is_active: boolean;
  is_pinned: boolean;
  context?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  last_message_at?: string;
  messages: ChatMessage[];
}

export interface ChatConversationSummary {
  id: number;
  title: string;
  conversation_type: ConversationType;
  is_pinned: boolean;
  last_message_at?: string;
  message_count: number;
  last_message_preview?: string;
}

export interface ChatConversationCreate {
  title?: string;
  conversation_type?: ConversationType;
  initial_message?: string;
  context?: Record<string, any>;
}

export interface ChatConversationUpdate {
  title?: string;
  is_active?: boolean;
  is_pinned?: boolean;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface SendMessageRequest {
  message: string;
  conversation_id?: number;
  conversation_type?: ConversationType;
  include_context?: boolean;
}

export interface SendMessageResponse {
  conversation_id: number;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  conversation_type: ConversationType;
}

// ===== SUGGESTION TYPES =====

export interface ChatSuggestion {
  id: number;
  title: string;
  prompt: string;
  conversation_type: ConversationType;
  icon?: string;
  description?: string;
  is_active: boolean;
  popularity_score: number;
  created_at: string;
}

export interface ChatSuggestionListResponse {
  suggestions: ChatSuggestion[];
  total: number;
}

// ===== FEEDBACK TYPES =====

export interface ChatFeedbackCreate {
  message_id: number;
  rating?: number;
  is_helpful?: boolean;
  feedback_text?: string;
  is_accurate?: boolean;
  is_relevant?: boolean;
  is_safe?: boolean;
}

export interface ChatFeedback extends ChatFeedbackCreate {
  id: number;
  user_id: number;
  created_at: string;
}

// ===== LIST RESPONSE TYPES =====

export interface ChatConversationListResponse {
  conversations: ChatConversationSummary[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ===== UTILITY TYPES =====

export interface ConversationTypeOption {
  value: ConversationType;
  label: string;
  icon: string;
  description?: string;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get icon name for conversation type
 */
export const getConversationTypeIcon = (type: ConversationType): string => {
  const icons: Record<ConversationType, string> = {
    [ConversationType.GENERAL]: 'chatbubble-ellipses',
    [ConversationType.WORKOUT]: 'barbell',
    [ConversationType.NUTRITION]: 'nutrition',
    [ConversationType.SUPPLEMENTS]: 'fitness',
    [ConversationType.INJURY]: 'medical',
    [ConversationType.MOTIVATION]: 'flash',
    [ConversationType.EQUIPMENT]: 'cart',
    [ConversationType.TECHNIQUE]: 'body',
  };
  return icons[type] || 'chatbubble';
};

/**
 * Get label for conversation type
 */
export const getConversationTypeLabel = (type: ConversationType): string => {
  const labels: Record<ConversationType, string> = {
    [ConversationType.GENERAL]: 'General',
    [ConversationType.WORKOUT]: 'Workout',
    [ConversationType.NUTRITION]: 'Nutrition',
    [ConversationType.SUPPLEMENTS]: 'Supplements',
    [ConversationType.INJURY]: 'Injury & Recovery',
    [ConversationType.MOTIVATION]: 'Motivation',
    [ConversationType.EQUIPMENT]: 'Equipment',
    [ConversationType.TECHNIQUE]: 'Technique',
  };
  return labels[type] || type;
};

/**
 * Get color for conversation type
 */
export const getConversationTypeColor = (type: ConversationType): string => {
  const colors: Record<ConversationType, string> = {
    [ConversationType.GENERAL]: '#8B5CF6', // Purple
    [ConversationType.WORKOUT]: '#EF4444', // Red
    [ConversationType.NUTRITION]: '#10B981', // Green
    [ConversationType.SUPPLEMENTS]: '#F59E0B', // Amber
    [ConversationType.INJURY]: '#3B82F6', // Blue
    [ConversationType.MOTIVATION]: '#EC4899', // Pink
    [ConversationType.EQUIPMENT]: '#6366F1', // Indigo
    [ConversationType.TECHNIQUE]: '#14B8A6', // Teal
  };
  return colors[type] || '#8B5CF6';
};

/**
 * Format time ago (e.g., "2 hours ago", "3 days ago")
 */
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;

  return date.toLocaleDateString();
};

/**
 * Get all conversation type options
 */
export const getAllConversationTypes = (): ConversationTypeOption[] => {
  return Object.values(ConversationType).map((type) => ({
    value: type,
    label: getConversationTypeLabel(type),
    icon: getConversationTypeIcon(type),
  }));
};

/**
 * Truncate text to max length
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// ===== AI SPECIALIZED TYPES =====

export interface GenerateWorkoutRequest {
  workout_type: string;
  duration_minutes: number;
  equipment: string[];
  fitness_level?: string;
  target_muscles?: string[];
  preferences?: Record<string, any>;
}

export interface GenerateWorkoutResponse {
  workout: string;
  provider: string;
  model: string;
  tokens_used: number;
  latency_ms: number;
  confidence: number;
}

export interface GenerateMealPlanRequest {
  target_calories: number;
  meals_per_day: number;
  dietary_restrictions: string[];
  dietary_preferences: string[];
  goal?: string;
  allergies?: string[];
}

export interface GenerateMealPlanResponse {
  meal_plan: string;
  provider: string;
  model: string;
  tokens_used: number;
  latency_ms: number;
  confidence: number;
}

export interface ExplainExerciseRequest {
  exercise_name: string;
  include_video_suggestions?: boolean;
  fitness_level?: string;
}

export interface ExplainExerciseResponse {
  explanation: string;
  provider: string;
  model: string;
  tokens_used: number;
  latency_ms: number;
  confidence: number;
}

export interface GetMotivationRequest {
  situation?: string;
  goal?: string;
  mood?: string;
}

export interface GetMotivationResponse {
  message: string;
  provider: string;
  model: string;
  tokens_used: number;
  latency_ms: number;
  confidence: number;
}

export interface AIProviderStatus {
  openai_available: boolean;
  gemini_available: boolean;
  active_providers: string[];
}
