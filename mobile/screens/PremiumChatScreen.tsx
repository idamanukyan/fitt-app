/**
 * PremiumChatScreen - Two-Mode Chat System
 * Mode 1: Chat with AI (with Smart Suggestions)
 * Mode 2: Chat with Coaches (Directory + 1:1 Chat)
 *
 * Design: Olive Black + Green Premium Wellness Aesthetic
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatBubble from '../components/chat/ChatBubble';
import SmartSuggestions from '../components/chat/SmartSuggestions';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInput from '../components/chat/ChatInput';
import CoachListItem from '../components/chat/CoachListItem';
import QuickActions, { QuickAction } from '../components/chat/QuickActions';
import {
  chatTokens,
  Message,
  Coach,
  SmartSuggestion,
  mockCoaches,
  convertBackendMessage,
  ConversationType,
} from '../components/chat/chatTypes';
import { chatService } from '../services/chatService';
import { aiService } from '../services/aiService';
import { ChatConversationSummary, AIProviderStatus } from '../types/chat';

// HyperFit AI - Conversational fitness coach
// Short, direct, human tone - like texting your trainer

const fitnessResponses = {
  // Today's workout - conversational, compact
  todayWorkout: `Alright, here's what we're doing today (45 min):

**Warm-up** — 2 min of movement, get the blood flowing

**Main Block**
• Goblet Squat — 4×10
• DB Bench Press — 4×8
• Bent-Over Row — 4×10
(60s rest between sets)

**Supersets**
• Lunges + Shoulder Press — 3×10 each
• Curls + Dips — 3×12 each
(45s rest)

**Finisher** — Plank 45s, mountain climbers 30s, repeat 2x

Stretch it out after. Let me know how it goes.`,

  // Quick workout
  quickWorkout: `30 min, let's make it count:

**Quick warm-up** — jumping jacks, arm circles, done in 2 min

**Circuit** — 4 rounds, 60s rest between
• Goblet Squat ×12
• Push-ups ×12
• DB Rows ×10 each arm
• Reverse Lunges ×8 each
• Plank 30s

That's it. Simple but effective.`,

  // Push
  push: `Push day — chest, shoulders, triceps:

**Warm-up** — arm circles, light press ×10

**Main lifts**
• Bench Press — 4×6-8 (90s rest)
• Incline DB Press — 3×10 (60s)
• OHP — 3×8 (90s)

**Accessories**
• Cable Flyes — 3×12
• Lateral Raises — 3×15
• Tricep Pushdowns — 3×12

Control the negatives on bench. That's where the growth is.`,

  // Pull
  pull: `Pull day — back and biceps:

**Warm-up** — band pull-aparts, light lat work

**Main lifts**
• Deadlift — 4×5 (2-3 min rest)
• Pull-ups — 4×8 (90s)
• Barbell Row — 4×8 (90s)

**Accessories**
• Cable Rows — 3×12
• Face Pulls — 3×15
• Curls — 3×10

Squeeze at the top of every row. That's the game.`,

  // Legs
  legs: `Leg day:

**Warm-up** — BW squats, leg swings, glute bridges

**Main lifts**
• Back Squat — 4×6-8 (2 min rest)
• RDL — 4×10 (90s)
• Walking Lunges — 3×10 each

**Accessories**
• Leg Press — 3×12
• Leg Curls — 3×12
• Calf Raises — 4×15

Go deep on squats. Parallel minimum.`,

  // Upper
  upper: `Upper body session:

**Warm-up** — arm circles, light press

**Push**
• Bench — 4×8 (90s)
• OHP — 3×10 (60s)

**Pull**
• Rows — 4×8 (90s)
• Lat Pulldown — 3×10 (60s)

**Arms** (superset)
• Curls + Pushdowns — 3×12 each

Face pulls to finish — 3×15. Done.`,

  // Lower
  lower: `Lower body:

**Warm-up** — squats, bridges, leg swings

**Quads**
• Squat — 4×8 (2 min)
• Leg Press — 3×12 (60s)

**Posterior**
• RDL — 4×10 (90s)
• Leg Curls — 3×12 (60s)

**Single leg**
• Bulgarian Split Squat — 3×8 each
• Calf Raises — 4×15

RDLs build everything. Don't skip them.`,

  // Full body
  fullBody: `Full body — hitting everything:

**Warm-up** — 2 min, get moving

**Compounds**
• Squat — 4×8
• Bench — 4×8
• Row — 4×8
• RDL — 3×10
• OHP — 3×10
(90s rest on main lifts)

**Finishers**
• Pull-ups — 2×10
• Dips — 2×12
• Plank — 2×45s

All the big patterns in one session.`,

  // Nutrition - conversational
  nutrition: `Nutrition basics:

**Protein** — 0.8-1g per lb. Non-negotiable.
**Carbs** — fuel your training, don't fear them.
**Fats** — 0.3-0.4g per lb for hormones.

Simple day: eggs + oats for breakfast, chicken + rice for lunch, salmon + sweet potato for dinner. Protein shake if you're short.

Drink 3L water. Eat protein at every meal. That's 80% of it.`,

  // Protein
  protein: `Protein targets:

Aim for 0.8-1g per lb bodyweight. 180 lbs = ~150-180g daily.

**Good sources:** chicken (31g/100g), beef (26g), salmon (25g), eggs (13g for 2), greek yogurt (10g).

Split it across meals — 35-50g each time. Powder helps fill gaps but real food first.`,

  // Supplements
  supplements: `Supplements — what actually works:

**Worth it:**
• Creatine — 5g daily, proven
• Protein powder — convenience
• Vitamin D — if you're deficient

**Maybe:**
• Caffeine pre-workout
• Fish oil for joints

**Skip:** BCAAs, fat burners, test boosters. Waste of money.

Food, sleep, training first. Supplements are the last 5%.`,

  // Motivation
  motivation: `Real talk:

Motivation comes and goes. Discipline is what gets results.

Set your schedule and treat it like a meeting. Prep the night before. On days you don't feel like it — those are the most important days to show up.

What's actually blocking you? Let's figure it out.`,

  // General
  general: `Hey — I'm your HyperFit coach.

Tell me what you need:
• "Workout for today"
• "I have 30 minutes"
• "Push day"
• "Nutrition help"

What are we working on?`,

  // Make it harder
  harder: `To bump intensity:
• Drop rest to 45s
• Add 5-10% weight
• Slow the negatives (3 sec down)
• Add 1-2 reps per set

Pick one or two of those. Don't change everything at once.`,
};

// Detect time constraints from message
const getTimeLimit = (message: string): number | null => {
  const timeMatch = message.match(/(\d+)\s*(min|minute)/i);
  if (timeMatch) return parseInt(timeMatch[1]);
  if (message.includes('quick') || message.includes('short')) return 30;
  return null;
};

const generateLocalAIResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  const timeLimit = getTimeLimit(message);

  // "Make it harder" / intensity adjustment
  if (message.includes('harder') || message.includes('more intense') || message.includes('bump it up') || message.includes('increase') || message.includes('challenge')) {
    return fitnessResponses.harder;
  }

  // Quick workout (30 min or less)
  if (timeLimit && timeLimit <= 30) {
    return fitnessResponses.quickWorkout;
  }

  // "Today" or generic workout request → give a complete workout
  if (message.includes('today') || (message.includes('workout') && !message.includes('plan') && !message.includes('program') && !message.includes('split'))) {
    if (message.includes('push')) return fitnessResponses.push;
    if (message.includes('pull')) return fitnessResponses.pull;
    if (message.includes('leg') || message.includes('lower')) return fitnessResponses.legs;
    if (message.includes('upper')) return fitnessResponses.upper;
    if (message.includes('full body') || message.includes('fullbody')) return fitnessResponses.fullBody;
    return fitnessResponses.todayWorkout;
  }

  // Specific workout types
  if (message.includes('push')) return fitnessResponses.push;
  if (message.includes('pull')) return fitnessResponses.pull;
  if (message.includes('leg') || message.includes('lower body') || message.includes('lower day')) return fitnessResponses.legs;
  if (message.includes('upper')) return fitnessResponses.upper;
  if (message.includes('full body') || message.includes('fullbody')) return fitnessResponses.fullBody;

  // Exercise / gym / training → give workout
  if (message.includes('exercise') || message.includes('training') || message.includes('gym') || message.includes('lift')) {
    return fitnessResponses.todayWorkout;
  }

  // Protein
  if (message.includes('protein')) return fitnessResponses.protein;

  // Nutrition
  if (message.includes('nutrition') || message.includes('diet') || message.includes('food') || message.includes('eat') || message.includes('meal') || message.includes('macro') || message.includes('calorie')) {
    return fitnessResponses.nutrition;
  }

  // Supplements
  if (message.includes('supplement') || message.includes('creatine') || message.includes('vitamin') || message.includes('pre-workout') || message.includes('preworkout')) {
    return fitnessResponses.supplements;
  }

  // Motivation
  if (message.includes('motivat') || message.includes('tired') || message.includes('give up') || message.includes('consistent') || message.includes('discipline') || message.includes('stuck') || message.includes('lazy')) {
    return fitnessResponses.motivation;
  }

  // Default
  return fitnessResponses.general;
};

type ChatMode = 'ai' | 'coaches';
type CoachViewMode = 'directory' | 'chat';

export default function PremiumChatScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ChatMode>('ai');
  const [coachViewMode, setCoachViewMode] = useState<CoachViewMode>('directory');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Chat State
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AIProviderStatus | null>(null);

  // Coach Chat State
  const [coachMessages, setCoachMessages] = useState<Message[]>([]);

  // Animation
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Load conversations and check AI status on mount
  useEffect(() => {
    loadConversations();
    checkAIStatus();
  }, []);

  // Check AI provider status
  const checkAIStatus = async () => {
    try {
      const status = await aiService.getStatus();
      setAiStatus(status);
      console.log('AI providers:', status.active_providers);
    } catch (err) {
      console.log('AI status check failed, using local fallback');
    }
  };

  // Load conversations from API (with fallback to local mode)
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from backend
      try {
        const response = await chatService.conversations.getConversations(1, 20, false);
        setConversations(response.conversations);

        // If there's a recent conversation, load its messages
        if (response.conversations.length > 0) {
          const latestConv = response.conversations[0];
          await loadConversationMessages(latestConv.id);
          return;
        }
      } catch (apiError) {
        console.log('Backend unavailable, using local AI mode');
      }

      // Show welcome message (for new users or when backend unavailable)
      const providers = aiStatus?.active_providers || [];
      const providerInfo = providers.length > 0
        ? `\n\n✨ Powered by ${providers.join(' & ').toUpperCase()}`
        : '';

      setAiMessages([{
        id: 'welcome',
        sender: 'ai',
        content: `Hello! I'm your HyperFit AI coach! I can help you with:\n\n• **Workout Plans** - Custom routines for your goals\n• **Nutrition Advice** - Meal plans and macro guidance\n• **Exercise Form** - Proper technique tips\n• **Motivation** - Stay on track with encouragement\n\nWhat would you like to discuss today?${providerInfo}`,
        timestamp: new Date(),
        status: 'read',
      }]);

    } catch (err: any) {
      console.error('Error loading conversations:', err);
      // Show welcome message even on error
      setAiMessages([{
        id: 'welcome',
        sender: 'ai',
        content: "Hello! I'm your HyperFit AI coach. How can I help you today?",
        timestamp: new Date(),
        status: 'read',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a specific conversation
  const loadConversationMessages = async (conversationId: number) => {
    try {
      const messages = await chatService.messages.getMessages(conversationId, 0, 50);
      setCurrentConversationId(conversationId);
      setAiMessages(messages.map(convertBackendMessage));
    } catch (err: any) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    Animated.timing(tabIndicatorAnim, {
      toValue: activeTab === 'ai' ? 0 : 1,
      duration: chatTokens.animation.tabSwitch,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  // Handlers
  const handleTabChange = (tab: ChatMode) => {
    setActiveTab(tab);
    if (tab === 'coaches') {
      setCoachViewMode('directory');
      setSelectedCoach(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isSending) return;

    // Add user message immediately for responsive UI
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
    };

    if (activeTab === 'ai') {
      setAiMessages((prev) => [...prev, tempUserMessage]);
      setIsAiTyping(true);
      setIsSending(true);

      // Update user message status to sent
      setAiMessages((prev) =>
        prev.map(m => m.id === tempUserMessage.id
          ? { ...m, status: 'sent' as const }
          : m
        )
      );

      try {
        let aiResponseContent: string;
        let usedBackend = false;

        // Try backend API first
        try {
          let response;
          if (currentConversationId) {
            response = await chatService.continueConversation(currentConversationId, content);
          } else {
            response = await chatService.startConversation(content, ConversationType.GENERAL);
            setCurrentConversationId(response.conversation_id);
          }

          // Update user message with backend data
          const userMessage = convertBackendMessage(response.user_message);
          const aiMessage = convertBackendMessage(response.assistant_message);

          setAiMessages((prev) => {
            const filtered = prev.filter(m => m.id !== tempUserMessage.id);
            return [...filtered, { ...userMessage, status: 'read' }, aiMessage];
          });
          usedBackend = true;

        } catch (apiError) {
          console.log('Backend unavailable, using local AI');

          // Use local AI response
          aiResponseContent = generateLocalAIResponse(content);

          // Simulate typing delay for natural feel
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            content: aiResponseContent,
            timestamp: new Date(),
            status: 'read',
          };

          setAiMessages((prev) => {
            const updated = prev.map(m => m.id === tempUserMessage.id
              ? { ...m, status: 'read' as const }
              : m
            );
            return [...updated, aiMessage];
          });
        }

      } catch (err: any) {
        console.error('Error sending message:', err);
        setAiMessages((prev) =>
          prev.map(m => m.id === tempUserMessage.id
            ? { ...m, status: 'failed' as const }
            : m
          )
        );
        Alert.alert('Error', 'Failed to send message. Please try again.');
      } finally {
        setIsAiTyping(false);
        setIsSending(false);
      }
    } else {
      setCoachMessages((prev) => [...prev, tempUserMessage]);
    }

    setTimeout(() => scrollToBottom(), 100);
  };

  const handleSuggestionPress = (suggestion: SmartSuggestion) => {
    console.log('Suggestion pressed:', suggestion);
    // Handle meal logging or navigation
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
    setCoachViewMode('chat');
    // Load coach messages
    setCoachMessages([
      {
        id: '1',
        sender: 'coach',
        content: `Hey! I'm ${coach.name}, your ${coach.specialty} coach. How can I help you today?`,
        timestamp: new Date(Date.now() - 86400000),
        status: 'read',
      },
    ]);
  };

  const handleBackToDirectory = () => {
    setCoachViewMode('directory');
    setSelectedCoach(null);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const filteredCoaches = mockCoaches.filter((coach) =>
    coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Functions
  const renderSegmentedControl = () => (
    <View style={styles.segmentedControl}>
      <Animated.View
        style={[
          styles.segmentIndicator,
          {
            transform: [
              {
                translateX: tabIndicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 160],
                }),
              },
            ],
          },
        ]}
      />
      <TouchableOpacity
        style={styles.segmentButton}
        onPress={() => handleTabChange('ai')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.segmentText,
            activeTab === 'ai' && styles.segmentTextActive,
          ]}
        >
          Chat AI
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.segmentButton}
        onPress={() => handleTabChange('coaches')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.segmentText,
            activeTab === 'coaches' && styles.segmentTextActive,
          ]}
        >
          Coaches
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAIChat = () => (
    <KeyboardAvoidingView
      style={styles.flex1}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 60}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={chatTokens.colors.primaryGreen} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={aiMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View>
                <ChatBubble message={item} />
                {item.smartSuggestions && (
                  <SmartSuggestions
                    suggestions={item.smartSuggestions}
                    macrosSummary={item.macrosSummary}
                    onSuggestionPress={handleSuggestionPress}
                  />
                )}
              </View>
            )}
            ListFooterComponent={<TypingIndicator visible={isAiTyping} />}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={chatTokens.colors.textMuted} />
                <Text style={styles.emptyChatText}>Start a conversation!</Text>
              </View>
            }
            ListHeaderComponent={
              aiMessages.length <= 1 ? (
                <QuickActions
                  onActionPress={handleQuickAction}
                  disabled={isSending}
                />
              ) : null
            }
            onContentSizeChange={() => scrollToBottom()}
          />
        </>
      )}
      <ChatInput onSend={handleSendMessage} disabled={isSending} />
    </KeyboardAvoidingView>
  );

  const renderCoachDirectory = () => (
    <View style={styles.flex1}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={chatTokens.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search coaches..."
            placeholderTextColor={chatTokens.colors.textMuted}
            selectionColor={chatTokens.colors.primaryGreen}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={chatTokens.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addCoachButton}>
          <Ionicons name="add" size={24} color={chatTokens.colors.primaryGreen} />
        </TouchableOpacity>
      </View>

      {/* Coach List */}
      <FlatList
        data={filteredCoaches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CoachListItem coach={item} onPress={() => handleCoachSelect(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={chatTokens.colors.textMuted} />
            <Text style={styles.emptyStateText}>No coaches found</Text>
          </View>
        }
      />
    </View>
  );

  const renderCoachChat = () => {
    if (!selectedCoach) return null;

    return (
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}
      >
        {/* Coach Chat Header */}
        <View style={styles.coachChatHeader}>
          <TouchableOpacity onPress={handleBackToDirectory} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={chatTokens.colors.textPrimary} />
          </TouchableOpacity>

          <Image source={{ uri: selectedCoach.avatar }} style={styles.coachHeaderAvatar} />

          <View style={styles.coachHeaderInfo}>
            <Text style={styles.coachHeaderName}>{selectedCoach.name}</Text>
            <Text style={styles.coachHeaderStatus}>
              {selectedCoach.isOnline ? (
                <Text style={styles.onlineText}>Online</Text>
              ) : (
                `Responds in ${selectedCoach.responseTime}`
              )}
            </Text>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={chatTokens.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={coachMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatBubble
              message={{ ...item, sender: item.sender === 'coach' ? 'ai' : 'user' }}
            />
          )}
          onContentSizeChange={() => scrollToBottom()}
        />

        <ChatInput onSend={handleSendMessage} placeholder="Message your coach..." />
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {renderSegmentedControl()}
      </View>

      {/* Content */}
      {activeTab === 'ai' && renderAIChat()}
      {activeTab === 'coaches' && coachViewMode === 'directory' && renderCoachDirectory()}
      {activeTab === 'coaches' && coachViewMode === 'chat' && renderCoachChat()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: chatTokens.colors.background,
  },
  flex1: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: chatTokens.spacing.lg,
    paddingBottom: chatTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: chatTokens.colors.greenMuted,
  },
  headerTitle: {
    ...chatTokens.typography.h1,
    color: chatTokens.colors.textPrimary,
    marginBottom: chatTokens.spacing.md,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: chatTokens.colors.cardBg,
    borderRadius: chatTokens.borderRadius.lg,
    padding: 4,
    position: 'relative',
  },
  segmentIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 156,
    height: 36,
    backgroundColor: chatTokens.colors.primaryGreen,
    borderRadius: chatTokens.borderRadius.md,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: chatTokens.spacing.sm,
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    ...chatTokens.typography.h3,
    color: chatTokens.colors.textSecondary,
  },
  segmentTextActive: {
    color: chatTokens.colors.background,
  },

  // Message List
  messageList: {
    paddingVertical: chatTokens.spacing.md,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    gap: chatTokens.spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: chatTokens.colors.inputBg,
    borderRadius: chatTokens.borderRadius.md,
    paddingHorizontal: chatTokens.spacing.md,
    paddingVertical: chatTokens.spacing.sm,
    gap: chatTokens.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...chatTokens.typography.body,
    color: chatTokens.colors.textPrimary,
  },
  addCoachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: chatTokens.colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    ...chatTokens.typography.body,
    color: chatTokens.colors.textMuted,
    marginTop: chatTokens.spacing.md,
  },

  // Coach Chat Header
  coachChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    backgroundColor: chatTokens.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: chatTokens.colors.greenMuted,
  },
  backButton: {
    marginRight: chatTokens.spacing.md,
  },
  coachHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: chatTokens.spacing.md,
  },
  coachHeaderInfo: {
    flex: 1,
  },
  coachHeaderName: {
    ...chatTokens.typography.h3,
    color: chatTokens.colors.textPrimary,
  },
  coachHeaderStatus: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.textMuted,
  },
  onlineText: {
    color: chatTokens.colors.online,
  },
  menuButton: {
    padding: chatTokens.spacing.sm,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: chatTokens.spacing.md,
  },
  loadingText: {
    ...chatTokens.typography.body,
    color: chatTokens.colors.textMuted,
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.sm,
    gap: chatTokens.spacing.sm,
  },
  errorText: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.error,
    flex: 1,
  },
  retryText: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.primaryGreen,
  },

  // Empty Chat
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: chatTokens.spacing.md,
  },
  emptyChatText: {
    ...chatTokens.typography.body,
    color: chatTokens.colors.textMuted,
  },
});
