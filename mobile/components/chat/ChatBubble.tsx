/**
 * ChatBubble - Message bubble component with animations
 * Supports AI, Coach, and User message styles
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatTokens, Message, MessageStatus } from './chatTypes';

interface ChatBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  onLongPress?: () => void;
}

export default function ChatBubble({
  message,
  showTimestamp = true,
  onLongPress,
}: ChatBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: chatTokens.animation.messageFadeIn,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: chatTokens.animation.messageFadeIn,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatusIcon = (status?: MessageStatus) => {
    if (!isUser || !status) return null;

    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color={chatTokens.colors.sent} />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color={chatTokens.colors.sent} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color={chatTokens.colors.delivered} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color={chatTokens.colors.read} />;
      case 'failed':
        return <Ionicons name="alert-circle" size={12} color={chatTokens.colors.error} />;
      default:
        return null;
    }
  };

  const renderAttachments = () => {
    if (!message.attachments?.length) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {message.attachments.map((attachment) => (
          <TouchableOpacity key={attachment.id} style={styles.attachmentThumbnail}>
            {attachment.type === 'image' || attachment.type === 'video' ? (
              <Image
                source={{ uri: attachment.thumbnail || attachment.uri }}
                style={styles.attachmentImage}
              />
            ) : (
              <View style={styles.documentAttachment}>
                <Ionicons name="document" size={24} color={chatTokens.colors.primaryGreen} />
                <Text style={styles.documentName} numberOfLines={1}>
                  {attachment.name}
                </Text>
              </View>
            )}
            {attachment.type === 'video' && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={32} color={chatTokens.colors.textPrimary} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.containerUser : styles.containerOther,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={onLongPress}
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleOther,
          chatTokens.shadows.bubble,
        ]}
      >
        {/* Sender label for AI */}
        {isAI && (
          <View style={styles.senderLabel}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={12} color={chatTokens.colors.primaryGreen} />
            </View>
            <Text style={styles.senderName}>HyperFit AI</Text>
          </View>
        )}

        {/* Message content */}
        <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
          {message.content}
        </Text>

        {/* Attachments */}
        {renderAttachments()}

        {/* Timestamp and status */}
        {showTimestamp && (
          <View style={styles.metaRow}>
            <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
              {formatTime(message.timestamp)}
            </Text>
            {renderStatusIcon(message.status)}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.xs,
    maxWidth: '85%',
  },
  containerUser: {
    alignSelf: 'flex-end',
  },
  containerOther: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: chatTokens.borderRadius.md,
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
  },
  bubbleUser: {
    backgroundColor: chatTokens.colors.userBubble,
    borderBottomRightRadius: chatTokens.spacing.xs,
  },
  bubbleOther: {
    backgroundColor: chatTokens.colors.aiBubble,
    borderBottomLeftRadius: chatTokens.spacing.xs,
  },
  senderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: chatTokens.spacing.xs,
  },
  aiIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: chatTokens.colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: chatTokens.spacing.xs,
  },
  senderName: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.primaryGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    ...chatTokens.typography.body,
    color: chatTokens.colors.textPrimary,
  },
  messageTextUser: {
    color: chatTokens.colors.textOnGreen,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: chatTokens.spacing.sm,
    gap: chatTokens.spacing.xs,
  },
  timestamp: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.textMuted,
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: chatTokens.spacing.sm,
    gap: chatTokens.spacing.sm,
  },
  attachmentThumbnail: {
    width: 120,
    height: 90,
    borderRadius: chatTokens.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: chatTokens.colors.cardBg,
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentAttachment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: chatTokens.spacing.sm,
  },
  documentName: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.textSecondary,
    marginTop: chatTokens.spacing.xs,
    textAlign: 'center',
  },
});
