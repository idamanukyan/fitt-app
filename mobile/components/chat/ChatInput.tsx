/**
 * ChatInput - Premium chat input bar with attachments
 * Supports photos, videos, documents, voice, and meal logging
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatTokens } from './chatTypes';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachment?: () => void;
  onVoice?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onAttachment,
  onVoice,
  placeholder = 'Ask me anything…',
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const attachmentMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveformAnim.setValue(0);
    }
  }, [isRecording]);

  useEffect(() => {
    Animated.timing(attachmentMenuAnim, {
      toValue: showAttachmentMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showAttachmentMenu]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const handleVoicePress = () => {
    setIsRecording(!isRecording);
    onVoice?.();
  };

  const handleAttachmentPress = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  const attachmentOptions = [
    { id: 'photo', icon: 'camera', label: 'Photo', color: '#60A5FA' },
    { id: 'gallery', icon: 'images', label: 'Gallery', color: '#A78BFA' },
    { id: 'document', icon: 'document', label: 'Document', color: '#F97316' },
    { id: 'meal', icon: 'restaurant', label: 'Log Meal', color: chatTokens.colors.primaryGreen },
  ];

  return (
    <View style={styles.container}>
      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <Animated.View
          style={[
            styles.attachmentMenu,
            {
              opacity: attachmentMenuAnim,
              transform: [
                {
                  translateY: attachmentMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {attachmentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.attachmentOption}
              onPress={() => {
                setShowAttachmentMenu(false);
                onAttachment?.();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.attachmentIconCircle, { backgroundColor: `${option.color}20` }]}>
                <Ionicons name={option.icon as any} size={22} color={option.color} />
              </View>
              <Text style={styles.attachmentLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording...</Text>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            {[...Array(12)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: waveformAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 8 + Math.random() * 20],
                    }),
                    opacity: waveformAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={() => setIsRecording(false)} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Input Bar */}
      {!isRecording && (
        <View style={styles.inputContainer}>
          {/* Attachment Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleAttachmentPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showAttachmentMenu ? 'close' : 'attach'}
              size={24}
              color={showAttachmentMenu ? chatTokens.colors.primaryGreen : chatTokens.colors.textMuted}
            />
          </TouchableOpacity>

          {/* Text Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={placeholder}
              placeholderTextColor={chatTokens.colors.textMuted}
              multiline
              maxLength={2000}
              editable={!disabled}
              selectionColor={chatTokens.colors.primaryGreen}
            />
          </View>

          {/* Voice / Send Button */}
          {message.trim() ? (
            <TouchableOpacity
              style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color={chatTokens.colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleVoicePress}
              activeOpacity={0.7}
            >
              <Ionicons name="mic" size={24} color={chatTokens.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: chatTokens.colors.background,
    borderTopWidth: 1,
    borderTopColor: chatTokens.colors.greenMuted,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },

  // Attachment Menu
  attachmentMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: chatTokens.spacing.lg,
    paddingHorizontal: chatTokens.spacing.lg,
    backgroundColor: chatTokens.colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: chatTokens.colors.greenMuted,
  },
  attachmentOption: {
    alignItems: 'center',
    gap: chatTokens.spacing.sm,
  },
  attachmentIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentLabel: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.textSecondary,
  },

  // Recording Indicator
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    gap: chatTokens.spacing.md,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    ...chatTokens.typography.caption,
    color: '#EF4444',
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 32,
  },
  waveformBar: {
    width: 3,
    backgroundColor: chatTokens.colors.primaryGreen,
    borderRadius: 1.5,
  },
  cancelButton: {
    paddingHorizontal: chatTokens.spacing.md,
    paddingVertical: chatTokens.spacing.sm,
  },
  cancelText: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.textMuted,
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: chatTokens.spacing.md,
    paddingVertical: chatTokens.spacing.sm,
    gap: chatTokens.spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: chatTokens.colors.inputBg,
    borderRadius: chatTokens.borderRadius.xl,
    borderWidth: 1,
    borderColor: chatTokens.colors.greenMuted,
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? chatTokens.spacing.md : chatTokens.spacing.sm,
    maxHeight: 120,
  },
  textInput: {
    ...chatTokens.typography.body,
    color: chatTokens.colors.textPrimary,
    maxHeight: 100,
    minHeight: 24,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: chatTokens.colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: chatTokens.colors.textMuted,
  },
});
