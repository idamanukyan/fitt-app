/**
 * Chat System Types & Design Tokens
 * Premium Olive Black + Green Design System
 */

import { MessageRole, ConversationType, ChatMessage as BackendChatMessage } from '../../types/chat';

// Re-export for convenience
export { MessageRole, ConversationType };
export type { BackendChatMessage };

// ============================================================================
// DESIGN TOKENS
// ============================================================================
export const chatTokens = {
  colors: {
    // Backgrounds
    background: '#0D0F0D',
    cardBg: '#151916',
    inputBg: '#1A1D1A',

    // Message Bubbles
    aiBubble: '#1A1D1A',          // Olive black for AI/Coach
    userBubble: '#166534',         // Deep green for user
    userBubbleLight: '#15803D',    // Lighter green variant

    // Accent Colors
    primaryGreen: '#4ADE80',
    secondaryGreen: '#22C55E',
    deepGreen: '#166534',
    greenMuted: 'rgba(74, 222, 128, 0.15)',
    greenBorder: 'rgba(74, 222, 128, 0.3)',
    greenGlow: 'rgba(74, 222, 128, 0.2)',

    // Text
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textOnGreen: '#FFFFFF',

    // Status
    online: '#4ADE80',
    offline: '#6B7280',
    typing: '#4ADE80',

    // Read Receipts
    sent: '#6B7280',
    delivered: '#9CA3AF',
    read: '#4ADE80',

    // Semantic
    unreadBadge: '#4ADE80',
    error: '#F87171',
    warning: '#FBBF24',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  typography: {
    h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 18, fontWeight: '600' as const },
    h3: { fontSize: 16, fontWeight: '600' as const },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    caption: { fontSize: 12, fontWeight: '500' as const },
    small: { fontSize: 11, fontWeight: '400' as const },
    micro: { fontSize: 10, fontWeight: '500' as const },
  },

  animation: {
    messageFadeIn: 200,
    typingPulse: 900,
    tabSwitch: 250,
    buttonPress: 100,
  },

  shadows: {
    bubble: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export type MessageSender = 'user' | 'ai' | 'coach';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type AttachmentType = 'image' | 'video' | 'document' | 'meal';

export interface Attachment {
  id: string;
  type: AttachmentType;
  uri: string;
  thumbnail?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface MacrosSummary {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface SmartSuggestion {
  id: string;
  label: string;
  icon?: string;
  action: 'log_meal' | 'view_recipe' | 'add_workout' | 'navigate';
  payload?: any;
  macros?: MacrosSummary;
}

export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: Attachment[];
  smartSuggestions?: SmartSuggestion[];
  macrosSummary?: MacrosSummary;
  replyTo?: string;
  isTyping?: boolean;
  // Backend fields for tracking
  backendId?: number;
  conversationId?: number;
}

// Helper to convert backend ChatMessage to UI Message
export const convertBackendMessage = (
  msg: BackendChatMessage
): Message => ({
  id: msg.id.toString(),
  backendId: msg.id,
  conversationId: msg.conversation_id,
  sender: msg.role === MessageRole.USER ? 'user' : 'ai',
  content: msg.content,
  timestamp: new Date(msg.created_at),
  status: 'read',
});

export interface Coach {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  isOnline: boolean;
  responseTime: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isVerified?: boolean;
}

export interface ChatThread {
  id: string;
  type: 'ai' | 'coach';
  coach?: Coach;
  messages: Message[];
  lastActivity: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================
export const mockAIMessages: Message[] = [
  {
    id: '1',
    sender: 'ai',
    content: "Good morning! I noticed you haven't logged breakfast yet. What did you have today?",
    timestamp: new Date(Date.now() - 3600000),
    status: 'read',
  },
  {
    id: '2',
    sender: 'user',
    content: 'I had eggs and toast with avocado',
    timestamp: new Date(Date.now() - 3500000),
    status: 'read',
  },
  {
    id: '3',
    sender: 'ai',
    content: "Great choice! That's a solid protein-rich breakfast. Here are some options I can log for you:",
    timestamp: new Date(Date.now() - 3400000),
    status: 'read',
    smartSuggestions: [
      { id: 's1', label: '2 Scrambled Eggs', icon: '🥚', action: 'log_meal', macros: { calories: 180, protein: 12, carbs: 2, fats: 14 } },
      { id: 's2', label: 'Whole Wheat Toast', icon: '🍞', action: 'log_meal', macros: { calories: 120, protein: 4, carbs: 22, fats: 2 } },
      { id: 's3', label: 'Half Avocado', icon: '🥑', action: 'log_meal', macros: { calories: 160, protein: 2, carbs: 9, fats: 15 } },
    ],
    macrosSummary: { calories: 460, protein: 18, carbs: 33, fats: 31 },
  },
];

export const mockCoaches: Coach[] = [
  {
    id: 'c1',
    name: 'Sarah Mitchell',
    avatar: 'https://i.pravatar.cc/150?img=1',
    specialty: 'Strength & Conditioning',
    isOnline: true,
    responseTime: '~30min',
    lastMessage: 'Great progress on your deadlifts! Let me know...',
    lastMessageTime: new Date(Date.now() - 1800000),
    unreadCount: 2,
    isVerified: true,
  },
  {
    id: 'c2',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    specialty: 'Nutrition Coach',
    isOnline: false,
    responseTime: '~2h',
    lastMessage: 'Your meal plan for next week is ready',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    isVerified: true,
  },
  {
    id: 'c3',
    name: 'Elena Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=5',
    specialty: 'Yoga & Mobility',
    isOnline: true,
    responseTime: '~1h',
    lastMessage: 'How did the hip opener sequence feel?',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 1,
    isVerified: false,
  },
];
