/**
 * HyperFit Design System - Reusable Components
 *
 * Premium, unified components matching Login/Register aesthetic
 * Use these components throughout the app for consistency
 */

import React, { ReactNode, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
  componentTokens,
  animation,
} from './tokens';

// ============================================================================
// HFCARD - Glassmorphism Card Component
// ============================================================================
interface HFCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glow' | 'outline';
  glowColor?: string;
  onPress?: () => void;
  animated?: boolean;
}

export const HFCard: React.FC<HFCardProps> = ({
  children,
  style,
  variant = 'default',
  glowColor,
  onPress,
  animated = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.duration.normal,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...animation.easing.spring,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...animation.easing.spring,
      }).start();
    }
  };

  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.glassMedium,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          ...shadows.cardElevated,
        };
      case 'glow':
        return {
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: glowColor || colors.primaryBorder,
          ...(glowColor
            ? { ...shadows.primaryGlow, shadowColor: glowColor }
            : shadows.primaryGlowSubtle),
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.glassBorder,
        };
      default:
        return {
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          ...shadows.card,
        };
    }
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        getCardStyle(),
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

// ============================================================================
// HFBUTTON - Premium Button Component
// ============================================================================
interface HFButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const HFButton: React.FC<HFButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      ...animation.easing.spring,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...animation.easing.spring,
    }).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          fontSize: typography.size.sm,
          iconSize: 16,
        };
      case 'lg':
        return {
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing['3xl'],
          fontSize: typography.size.md,
          iconSize: 22,
        };
      default:
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing['2xl'],
          fontSize: typography.size.base,
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const renderContent = () => {
    const textColor =
      variant === 'primary'
        ? colors.textInverse
        : variant === 'danger'
        ? colors.error
        : variant === 'secondary'
        ? colors.primary
        : colors.textSecondary;

    return (
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            color={textColor}
            size="small"
            style={{ marginRight: icon ? spacing.sm : 0 }}
          />
        ) : icon && iconPosition === 'left' ? (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={textColor}
            style={{ marginRight: spacing.sm }}
          />
        ) : null}
        <Text
          style={[
            styles.buttonText,
            {
              fontSize: sizeStyles.fontSize,
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>
        {!loading && icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={textColor}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>
    );
  };

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? colors.textMuted : colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: colors.glassLight,
        };
      case 'danger':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? colors.textMuted : colors.error,
        };
      default:
        return {};
    }
  };

  if (variant === 'primary' && !isDisabled) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={fullWidth ? { width: '100%' } : undefined}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              {
                paddingVertical: sizeStyles.paddingVertical,
                paddingHorizontal: sizeStyles.paddingHorizontal,
              },
              shadows.button,
              style,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Animated.View
        style={[
          styles.button,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            opacity: isDisabled ? 0.5 : 1,
          },
          getButtonStyle(),
          style,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {renderContent()}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// HFMETRIC - Metric Display Component
// ============================================================================
interface HFMetricProps {
  value: string | number;
  label: string;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const HFMetric: React.FC<HFMetricProps> = ({
  value,
  label,
  unit,
  icon,
  iconColor = colors.primary,
  trend,
  trendValue,
  size = 'md',
  style,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          valueSize: typography.size.xl,
          labelSize: typography.size.xs,
          unitSize: typography.size.sm,
          iconSize: 18,
        };
      case 'lg':
        return {
          valueSize: typography.size['4xl'],
          labelSize: typography.size.base,
          unitSize: typography.size.lg,
          iconSize: 28,
        };
      default:
        return {
          valueSize: typography.size['3xl'],
          labelSize: typography.size.sm,
          unitSize: typography.size.base,
          iconSize: 22,
        };
    }
  };

  const sizes = getSizeStyles();

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getTrendIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <View style={[styles.metric, style]}>
      {icon && (
        <View style={[styles.metricIconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon} size={sizes.iconSize} color={iconColor} />
        </View>
      )}
      <View style={styles.metricContent}>
        <View style={styles.metricValueRow}>
          <Text style={[styles.metricValue, { fontSize: sizes.valueSize }]}>
            {value}
          </Text>
          {unit && (
            <Text style={[styles.metricUnit, { fontSize: sizes.unitSize }]}>
              {unit}
            </Text>
          )}
        </View>
        <Text style={[styles.metricLabel, { fontSize: sizes.labelSize }]}>
          {label}
        </Text>
        {trend && trendValue && (
          <View style={styles.metricTrend}>
            <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
            <Text style={[styles.metricTrendText, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// HFPROGRESSRING - Animated Progress Ring
// ============================================================================
interface HFProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export const HFProgressRing: React.FC<HFProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = colors.primary,
  backgroundColor = colors.glassBorder,
  showLabel = true,
  label,
  animated = true,
  style,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: animation.duration.slow,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle - needs AnimatedCircle for animation */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      {showLabel && (
        <View style={[StyleSheet.absoluteFill, styles.progressLabel]}>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
          {label && <Text style={styles.progressLabelText}>{label}</Text>}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// HFSECTIONTITLE - Section Header Component
// ============================================================================
interface HFSectionTitleProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const HFSectionTitle: React.FC<HFSectionTitleProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action.label}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// HFBADGE - Badge/Chip Component
// ============================================================================
interface HFBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const HFBadge: React.FC<HFBadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.secondarySubtle, text: colors.secondary };
      case 'success':
        return { bg: colors.successBg, text: colors.success };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning };
      case 'error':
        return { bg: colors.errorBg, text: colors.error };
      case 'info':
        return { bg: colors.infoBg, text: colors.info };
      default:
        return { bg: colors.primarySubtle, text: colors.primary };
    }
  };

  const badgeColors = getColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          paddingVertical: isSmall ? spacing.xs : spacing.sm,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 12 : 14}
          color={badgeColors.text}
          style={{ marginRight: spacing.xs }}
        />
      )}
      <Text
        style={[
          styles.badgeText,
          {
            color: badgeColors.text,
            fontSize: isSmall ? typography.size.xs : typography.size.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ============================================================================
// HFDIVIDER - Divider Component
// ============================================================================
interface HFDividerProps {
  style?: ViewStyle;
  label?: string;
}

export const HFDivider: React.FC<HFDividerProps> = ({ style, label }) => {
  if (label) {
    return (
      <View style={[styles.dividerContainer, style]}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }

  return <View style={[styles.divider, style]} />;
};

// ============================================================================
// HFGRADIENTBACKGROUND - Full Screen Gradient Background
// ============================================================================
interface HFGradientBackgroundProps {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'reverse';
  style?: ViewStyle;
}

export const HFGradientBackground: React.FC<HFGradientBackgroundProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  const getGradient = () => {
    switch (variant) {
      case 'subtle':
        return gradients.backgroundSubtle;
      case 'reverse':
        return gradients.backgroundReverse;
      default:
        return gradients.background;
    }
  };

  return (
    <LinearGradient
      colors={getGradient() as unknown as string[]}
      style={[styles.gradientBackground, style]}
    >
      {children}
    </LinearGradient>
  );
};

// ============================================================================
// HFICON - Themed Icon with Background
// ============================================================================
interface HFIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const HFIcon: React.FC<HFIconProps> = ({
  name,
  color = colors.primary,
  size = 24,
  backgroundColor,
  style,
}) => {
  const bgColor = backgroundColor || `${color}20`;
  const containerSize = size * 1.8;

  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  // Card
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },

  // Button
  button: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: typography.weight.semiBold,
    letterSpacing: 0.5,
  },

  // Metric
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  metricContent: {
    flex: 1,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
  },
  metricUnit: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metricTrendText: {
    fontSize: typography.size.xs,
    marginLeft: spacing.xs,
  },

  // Progress Ring
  progressLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  progressLabelText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Section Title
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    marginRight: spacing.xs,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: typography.weight.medium,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
  },

  // Gradient Background
  gradientBackground: {
    flex: 1,
  },

  // Icon Container
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Export all components
export default {
  HFCard,
  HFButton,
  HFMetric,
  HFProgressRing,
  HFSectionTitle,
  HFBadge,
  HFDivider,
  HFGradientBackground,
  HFIcon,
};
