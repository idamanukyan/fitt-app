/**
 * GradientButton - Primary/secondary gradient button component
 * Matches dashboard design system with animated press effects
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, shadows, gradients } from '../../../design/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'primary':
        return gradients.buttonPrimary;
      case 'secondary':
        return gradients.buttonSecondary;
      case 'danger':
        return ['#F87171', '#EF4444'] as const;
      default:
        return gradients.buttonPrimary;
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
          },
          text: {
            fontSize: typography.size.sm,
          },
          iconSize: 16,
        };
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.lg + 2,
            paddingHorizontal: spacing['2xl'],
            borderRadius: radius.xl,
          },
          text: {
            fontSize: typography.size.md,
          },
          iconSize: 22,
        };
      default:
        return {
          container: {
            paddingVertical: spacing.md + 2,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.lg,
          },
          text: {
            fontSize: typography.size.base,
          },
          iconSize: 18,
        };
    }
  };

  const getShadowStyle = () => {
    if (disabled || variant === 'outline' || variant === 'ghost') {
      return {};
    }
    switch (variant) {
      case 'primary':
        return shadows.button;
      case 'secondary':
        return shadows.buttonSecondary;
      case 'danger':
        return {
          shadowColor: '#F87171',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
        };
      default:
        return shadows.button;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return colors.textInverse;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.textSecondary;
      default:
        return colors.textInverse;
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    const textColor = getTextColor();
    const content = (
      <>
        {icon && iconPosition === 'left' && !loading && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={textColor}
            style={styles.iconLeft}
          />
        )}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={styles.loader}
          />
        ) : (
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === 'right' && !loading && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={textColor}
            style={styles.iconRight}
          />
        )}
      </>
    );

    if (variant === 'outline' || variant === 'ghost') {
      return (
        <View
          style={[
            styles.container,
            sizeStyles.container,
            variant === 'outline' && styles.outline,
            variant === 'ghost' && styles.ghost,
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
            style,
          ]}
        >
          {content}
        </View>
      );
    }

    return (
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.container,
          sizeStyles.container,
          getShadowStyle(),
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        {content}
      </LinearGradient>
    );
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, fullWidth && styles.fullWidth]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weight.semiBold,
    textAlign: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: colors.glassLight,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  loader: {
    marginHorizontal: spacing.sm,
  },
});

export default GradientButton;
