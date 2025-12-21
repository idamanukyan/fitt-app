import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function NeonButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  size = 'large',
  style,
}: NeonButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for primary button
  useEffect(() => {
    if (variant === 'primary' && !disabled && !loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [variant, disabled, loading]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getGradientColors = () => {
    if (disabled) {
      return [theme.colors.oliveBlack, theme.colors.oliveBlack];
    }
    switch (variant) {
      case 'primary':
        return theme.gradients.buttonPrimary;
      case 'secondary':
        return theme.gradients.buttonSecondary;
      default:
        return [theme.colors.transparent, theme.colors.transparent];
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 48;
      case 'large':
        return 56;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 25],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.button,
          variant === 'outline' && styles.outlineButton,
          { height: getHeight() },
        ]}
      >
        {variant !== 'outline' ? (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              {
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            {/* Animated Glow Effect */}
            {variant === 'primary' && !disabled && !loading && (
              <Animated.View
                style={[
                  styles.glowContainer,
                  {
                    shadowOpacity: glowOpacity,
                    shadowRadius: glowRadius,
                  },
                ]}
              />
            )}

            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text
                style={[
                  styles.text,
                  size === 'small' && styles.textSmall,
                  disabled && styles.textDisabled,
                ]}
              >
                {title}
              </Text>
            )}
          </LinearGradient>
        ) : (
          <>
            {loading ? (
              <ActivityIndicator color={theme.colors.lightGreen} />
            ) : (
              <Text
                style={[
                  styles.text,
                  styles.outlineText,
                  size === 'small' && styles.textSmall,
                  disabled && styles.textDisabled,
                ]}
              >
                {title}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.lightGreen,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  outlineText: {
    color: theme.colors.lightGreen,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
