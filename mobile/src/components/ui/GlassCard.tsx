/**
 * GlassCard - Reusable glassmorphic container component
 * Matches dashboard design system with glass effect
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, shadows, gradients } from '../../../design/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'glow' | 'premium';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
  glowColor?: 'primary' | 'secondary' | 'blue' | 'orange';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  contentStyle,
  noPadding = false,
  glowColor = 'primary',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.glassMedium,
          ...shadows.cardElevated,
        };
      case 'subtle':
        return {
          backgroundColor: colors.glass,
          borderWidth: 0,
        };
      case 'glow':
        return {
          backgroundColor: colors.glass,
          ...(glowColor === 'primary'
            ? shadows.primaryGlowSubtle
            : glowColor === 'secondary'
            ? shadows.secondaryGlow
            : glowColor === 'blue'
            ? shadows.blueGlow
            : shadows.orangeGlow),
        };
      case 'premium':
        return {
          backgroundColor: colors.glassMedium,
          ...shadows.secondaryGlow,
        };
      default:
        return {
          backgroundColor: colors.glass,
          ...shadows.card,
        };
    }
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'glow':
        return gradients.cardGlow;
      case 'premium':
        return gradients.cardPremium;
      default:
        return gradients.card;
    }
  };

  const cardContent = (
    <View
      style={[
        styles.container,
        getVariantStyles(),
        !noPadding && styles.padding,
        style,
      ]}
    >
      {(variant === 'glow' || variant === 'premium') && (
        <LinearGradient
          colors={getGradientColors()}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[animatedStyle, disabled && styles.disabled]}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.lg,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassCard;
