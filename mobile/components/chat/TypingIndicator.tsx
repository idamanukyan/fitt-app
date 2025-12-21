/**
 * TypingIndicator - Animated 3 dots typing indicator
 * Smooth pulse animation with 900ms fade
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { chatTokens } from './chatTypes';

interface TypingIndicatorProps {
  visible?: boolean;
}

export default function TypingIndicator({ visible = true }: TypingIndicatorProps) {
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Create staggered pulsing animation
      const createPulse = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: chatTokens.animation.typingPulse / 2,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.3,
              duration: chatTokens.animation.typingPulse / 2,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const pulse1 = createPulse(dot1Anim, 0);
      const pulse2 = createPulse(dot2Anim, 150);
      const pulse3 = createPulse(dot3Anim, 300);

      pulse1.start();
      pulse2.start();
      pulse3.start();

      return () => {
        pulse1.stop();
        pulse2.stop();
        pulse3.stop();
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.bubble}>
        <Animated.View
          style={[
            styles.dot,
            { opacity: dot1Anim, transform: [{ scale: dot1Anim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { opacity: dot2Anim, transform: [{ scale: dot2Anim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { opacity: dot3Anim, transform: [{ scale: dot3Anim }] },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.sm,
    alignSelf: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: chatTokens.colors.aiBubble,
    borderRadius: chatTokens.borderRadius.md,
    borderBottomLeftRadius: chatTokens.spacing.xs,
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    gap: chatTokens.spacing.sm,
    ...chatTokens.shadows.bubble,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: chatTokens.colors.primaryGreen,
  },
});
