/**
 * ChatScreen - Neon-Brutalist Messaging Screen
 * Message thread with MessageBubble components
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from "../utils/theme";
import MessageBubble from "../components/molecules/MessageBubble";
import NeonInput from "../components/atoms/NeonInput";

// Mock conversation data
const mockMessages = [
  {
    id: 1,
    text: "Hey! How's your training going this week?",
    timestamp: "10:30 AM",
    isSender: false,
    senderName: "Coach Sarah",
  },
  {
    id: 2,
    text: "Great! I completed all 4 workouts and hit new personal records on squats and deadlifts.",
    timestamp: "10:32 AM",
    isSender: true,
  },
  {
    id: 3,
    text: "That's amazing progress! What were your numbers?",
    timestamp: "10:33 AM",
    isSender: false,
    senderName: "Coach Sarah",
  },
  {
    id: 4,
    text: "Squat: 225 lbs x 5 reps, Deadlift: 315 lbs x 3 reps",
    timestamp: "10:35 AM",
    isSender: true,
  },
  {
    id: 5,
    text: "Excellent! You're making consistent progress. Let's increase the volume next week and add some accessory work.",
    timestamp: "10:37 AM",
    isSender: false,
    senderName: "Coach Sarah",
  },
  {
    id: 6,
    text: "Sounds good! Should I add more core exercises too?",
    timestamp: "10:40 AM",
    isSender: true,
  },
  {
    id: 7,
    text: "Absolutely. I'll update your program tonight. Check it tomorrow morning.",
    timestamp: "10:42 AM",
    isSender: false,
    senderName: "Coach Sarah",
  },
];

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scroll to bottom on mount
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.contactInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color={theme.colors.lightGreen} />
          </View>
          <View>
            <Text style={styles.contactName}>COACH SARAH</Text>
            <Text style={styles.contactStatus}>Active now</Text>
          </View>
        </View>
      </View>

      {/* Message Thread */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messageThread}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              timestamp={msg.timestamp}
              isSender={msg.isSender}
              senderName={msg.senderName}
            />
          ))}
        </Animated.View>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <NeonInput
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            style={styles.input}
            onSubmitEditing={handleSend}
          />
        </View>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendButtonGradient}
          >
            <Ionicons name="send" size={20} color={theme.colors.black} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    backgroundColor: theme.colors.oliveBlack,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGreen,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing.md,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkGreen,
    borderWidth: 2,
    borderColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  contactStatus: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.lightGreen,
    marginTop: 2,
  },
  messageThread: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
  },
  inputBar: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.black,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGreen,
    gap: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
