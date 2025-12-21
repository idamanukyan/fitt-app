/**
 * Chat Service
 *
 * API service for AI chat system
 */
import api from './api';
import {
  ChatConversation,
  ChatConversationSummary,
  ChatConversationCreate,
  ChatConversationUpdate,
  ChatConversationListResponse,
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
  ChatSuggestion,
  ChatSuggestionListResponse,
  ChatFeedbackCreate,
  ChatFeedback,
  ConversationType,
} from '../types/chat';

const CHAT_BASE_URL = '/api/v6/chat';

export const chatService = {
  // ===== CONVERSATION ENDPOINTS =====

  conversations: {
    /**
     * Get user's conversations
     */
    getConversations: async (
      page: number = 1,
      pageSize: number = 20,
      includeArchived: boolean = false
    ): Promise<ChatConversationListResponse> => {
      const skip = (page - 1) * pageSize;
      const response = await api.get<ChatConversationListResponse>(
        `${CHAT_BASE_URL}/conversations`,
        {
          params: {
            skip,
            limit: pageSize,
            include_archived: includeArchived,
          },
        }
      );
      return response.data;
    },

    /**
     * Get conversation by ID
     */
    getConversation: async (conversationId: number): Promise<ChatConversation> => {
      const response = await api.get<ChatConversation>(
        `${CHAT_BASE_URL}/conversations/${conversationId}`
      );
      return response.data;
    },

    /**
     * Create a new conversation
     */
    createConversation: async (
      conversationData: ChatConversationCreate
    ): Promise<ChatConversation> => {
      const response = await api.post<ChatConversation>(
        `${CHAT_BASE_URL}/conversations`,
        conversationData
      );
      return response.data;
    },

    /**
     * Update conversation
     */
    updateConversation: async (
      conversationId: number,
      updateData: ChatConversationUpdate
    ): Promise<ChatConversation> => {
      const response = await api.put<ChatConversation>(
        `${CHAT_BASE_URL}/conversations/${conversationId}`,
        updateData
      );
      return response.data;
    },

    /**
     * Delete conversation
     */
    deleteConversation: async (conversationId: number): Promise<void> => {
      await api.delete(`${CHAT_BASE_URL}/conversations/${conversationId}`);
    },

    /**
     * Pin/unpin conversation
     */
    togglePin: async (
      conversationId: number,
      isPinned: boolean
    ): Promise<ChatConversation> => {
      return chatService.conversations.updateConversation(conversationId, {
        is_pinned: isPinned,
      });
    },

    /**
     * Archive/unarchive conversation
     */
    toggleArchive: async (
      conversationId: number,
      isActive: boolean
    ): Promise<ChatConversation> => {
      return chatService.conversations.updateConversation(conversationId, {
        is_active: isActive,
      });
    },
  },

  // ===== MESSAGE ENDPOINTS =====

  messages: {
    /**
     * Send a message
     */
    sendMessage: async (
      messageRequest: SendMessageRequest
    ): Promise<SendMessageResponse> => {
      const response = await api.post<SendMessageResponse>(
        `${CHAT_BASE_URL}/messages`,
        messageRequest
      );
      return response.data;
    },

    /**
     * Get messages for a conversation
     */
    getMessages: async (
      conversationId: number,
      skip: number = 0,
      limit: number = 50
    ): Promise<ChatMessage[]> => {
      const response = await api.get<ChatMessage[]>(
        `${CHAT_BASE_URL}/conversations/${conversationId}/messages`,
        {
          params: {
            skip,
            limit,
          },
        }
      );
      return response.data;
    },

    /**
     * Submit feedback for a message
     */
    submitFeedback: async (
      messageId: number,
      feedbackData: ChatFeedbackCreate
    ): Promise<ChatFeedback> => {
      const response = await api.post<ChatFeedback>(
        `${CHAT_BASE_URL}/messages/${messageId}/feedback`,
        feedbackData
      );
      return response.data;
    },

    /**
     * Rate a message (thumbs up/down)
     */
    rateMessage: async (
      messageId: number,
      isHelpful: boolean
    ): Promise<ChatFeedback> => {
      return chatService.messages.submitFeedback(messageId, {
        message_id: messageId,
        is_helpful: isHelpful,
      });
    },
  },

  // ===== SUGGESTION ENDPOINTS =====

  suggestions: {
    /**
     * Get chat suggestions
     */
    getSuggestions: async (
      conversationType?: ConversationType,
      limit: number = 10
    ): Promise<ChatSuggestionListResponse> => {
      const params: any = { limit };
      if (conversationType) {
        params.conversation_type = conversationType;
      }

      const response = await api.get<ChatSuggestionListResponse>(
        `${CHAT_BASE_URL}/suggestions`,
        { params }
      );
      return response.data;
    },
  },

  // ===== UTILITY FUNCTIONS =====

  /**
   * Start a new conversation with initial message
   */
  startConversation: async (
    message: string,
    conversationType: ConversationType = ConversationType.GENERAL
  ): Promise<SendMessageResponse> => {
    return chatService.messages.sendMessage({
      message,
      conversation_type: conversationType,
      include_context: true,
    });
  },

  /**
   * Continue an existing conversation
   */
  continueConversation: async (
    conversationId: number,
    message: string,
    includeContext: boolean = true
  ): Promise<SendMessageResponse> => {
    return chatService.messages.sendMessage({
      message,
      conversation_id: conversationId,
      include_context: includeContext,
    });
  },

  /**
   * Get recent conversations (shortcut)
   */
  getRecentConversations: async (
    limit: number = 10
  ): Promise<ChatConversationSummary[]> => {
    const response = await chatService.conversations.getConversations(1, limit, false);
    return response.conversations;
  },

  /**
   * Search conversations by title
   */
  searchConversations: async (query: string): Promise<ChatConversationSummary[]> => {
    // Note: This is a client-side filter. Ideally, the backend should support search
    const response = await chatService.conversations.getConversations(1, 100, false);
    return response.conversations.filter((conv) =>
      conv.title.toLowerCase().includes(query.toLowerCase())
    );
  },
};

export default chatService;
