/**
 * MessageBubble - Chat Message Component
 * Neon-Brutalist design with sender/receiver distinction
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../utils/theme';

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isSender: boolean;
  senderName?: string;
}

export default function MessageBubble({
  text,
  timestamp,
  isSender,
  senderName,
}: MessageBubbleProps) {
  return (
    <View style={isSender ? styles.senderBubble : styles.receiverBubble}>
      {!isSender && senderName && (
        <Text style={styles.senderName}>{senderName.toUpperCase()}</Text>
      )}
      <Text style={styles.messageText}>{text}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  senderBubble: {
    backgroundColor: theme.colors.darkGreen,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.lightGreen,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  receiverBubble: {
    backgroundColor: theme.colors.oliveBlack,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.lightGreen,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.lightGreen,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    alignSelf: 'flex-end',
  },
});
