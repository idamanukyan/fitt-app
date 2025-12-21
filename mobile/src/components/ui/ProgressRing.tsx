/**
 * ProgressRing - Circular progress indicator component
 * Matches dashboard design system with animated fill
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../../design/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type ProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ProgressRingProps {
  progress: number; // 0-100
  variant?: ProgressVariant;
  size?: ProgressSize;
  strokeWidth?: number;
  showValue?: boolean;
  valueFormat?: 'percent' | 'fraction' | 'custom';
  customValue?: string;
  label?: string;
  animated?: boolean;
  duration?: number;
  useGradient?: boolean;
  trackColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  variant = 'primary',
  size = 'md',
  strokeWidth: customStrokeWidth,
  showValue = true,
  valueFormat = 'percent',
  customValue,
  label,
  animated = true,
  duration = 1000,
  useGradient = true,
  trackColor,
  style,
  children,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    if (animated) {
      animatedProgress.value = withTiming(clampedProgress, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      animatedProgress.value = clampedProgress;
    }
  }, [progress, animated, duration]);

  const getSizeConfig = (): {
    diameter: number;
    strokeWidth: number;
    fontSize: number;
    labelSize: number;
  } => {
    switch (size) {
      case 'xs':
        return { diameter: 40, strokeWidth: 3, fontSize: 11, labelSize: 8 };
      case 'sm':
        return { diameter: 60, strokeWidth: 4, fontSize: 14, labelSize: 10 };
      case 'lg':
        return { diameter: 120, strokeWidth: 8, fontSize: 28, labelSize: 13 };
      case 'xl':
        return { diameter: 160, strokeWidth: 10, fontSize: 36, labelSize: 15 };
      default: // md
        return { diameter: 80, strokeWidth: 6, fontSize: 20, labelSize: 11 };
    }
  };

  const getVariantColors = (): { start: string; end: string; solid: string } => {
    switch (variant) {
      case 'primary':
        return { start: '#4ADE80', end: '#22C55E', solid: colors.primary };
      case 'secondary':
        return { start: '#A78BFA', end: '#7C3AED', solid: colors.secondary };
      case 'success':
        return { start: '#4ADE80', end: '#16A34A', solid: colors.success };
      case 'warning':
        return { start: '#FBBF24', end: '#F59E0B', solid: colors.warning };
      case 'error':
        return { start: '#F87171', end: '#EF4444', solid: colors.error };
      case 'info':
        return { start: '#60A5FA', end: '#3B82F6', solid: colors.info };
      default:
        return { start: '#4ADE80', end: '#22C55E', solid: colors.primary };
    }
  };

  const sizeConfig = getSizeConfig();
  const variantColors = getVariantColors();
  const strokeWidth = customStrokeWidth || sizeConfig.strokeWidth;
  const radius = (sizeConfig.diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = sizeConfig.diameter / 2;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const getDisplayValue = (): string => {
    if (customValue) return customValue;
    switch (valueFormat) {
      case 'percent':
        return `${Math.round(progress)}%`;
      case 'fraction':
        return `${Math.round(progress)}/100`;
      default:
        return `${Math.round(progress)}%`;
    }
  };

  const gradientId = `progress-gradient-${variant}-${Math.random().toString(36).slice(2)}`;

  return (
    <View style={[styles.container, { width: sizeConfig.diameter, height: sizeConfig.diameter }, style]}>
      <Svg width={sizeConfig.diameter} height={sizeConfig.diameter}>
        {useGradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={variantColors.start} />
              <Stop offset="100%" stopColor={variantColors.end} />
            </LinearGradient>
          </Defs>
        )}

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor || colors.glass}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={useGradient ? `url(#${gradientId})` : variantColors.solid}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {children ? (
          children
        ) : showValue ? (
          <View style={styles.valueContainer}>
            <Text
              style={[
                styles.value,
                { fontSize: sizeConfig.fontSize, color: variantColors.solid },
              ]}
            >
              {getDisplayValue()}
            </Text>
            {label && (
              <Text style={[styles.label, { fontSize: sizeConfig.labelSize }]}>
                {label}
              </Text>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

// Pre-configured variants for common use cases
interface ScoreRingProps {
  score: number; // 0-100
  size?: ProgressSize;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const FormScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  showLabel = true,
  style,
}) => {
  const getVariant = (): ProgressVariant => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  return (
    <ProgressRing
      progress={score}
      variant={getVariant()}
      size={size}
      label={showLabel ? 'Form' : undefined}
      style={style}
    />
  );
};

export const XPProgressRing: React.FC<{
  current: number;
  max: number;
  level: number;
  size?: ProgressSize;
  style?: ViewStyle;
}> = ({ current, max, level, size = 'lg', style }) => {
  const progress = max > 0 ? (current / max) * 100 : 0;

  return (
    <ProgressRing
      progress={progress}
      variant="secondary"
      size={size}
      showValue={false}
      style={style}
    >
      <View style={styles.xpContent}>
        <Text style={styles.levelText}>LVL</Text>
        <Text style={styles.levelNumber}>{level}</Text>
      </View>
    </ProgressRing>
  );
};

export const WorkoutProgressRing: React.FC<{
  completed: number;
  total: number;
  size?: ProgressSize;
  style?: ViewStyle;
}> = ({ completed, total, size = 'md', style }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <ProgressRing
      progress={progress}
      variant="primary"
      size={size}
      customValue={`${completed}/${total}`}
      label="sets"
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    alignItems: 'center',
  },
  value: {
    fontWeight: typography.weight.bold,
  },
  label: {
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
    marginTop: 2,
  },
  xpContent: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
    letterSpacing: 1,
  },
  levelNumber: {
    fontSize: 24,
    color: colors.secondary,
    fontWeight: typography.weight.bold,
    marginTop: -2,
  },
});

export default ProgressRing;
