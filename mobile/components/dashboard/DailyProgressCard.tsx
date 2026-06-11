/**
 * DailyProgressCard - Hero card with animated calorie ring and mini metrics
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================
export interface PerformanceData {
  calories: { current: number; target: number };
  water: { current: number; target: number };
  steps: number;
  activeBurn: number;
}

export interface DailyProgressCardProps {
  performance: PerformanceData;
  onPress: () => void;
}

// ============================================================================
// ANIMATED PROGRESS RING
// ============================================================================
interface ProgressRingProps {
  progress: number;
  current: number;
  target: number;
  size?: number;
}

const AnimatedProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  current,
  target,
  size = 160,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const strokeWidth = 12;
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    const animation = Animated.timing(animatedProgress, {
      toValue: Math.min(progress, 100),
      duration: 1000,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke={colors.glassBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      <View style={styles.ringContent}>
        <Text style={styles.ringValue}>{current.toLocaleString()}</Text>
        <Text style={styles.ringUnit}>of {target.toLocaleString()} kcal</Text>
      </View>
    </View>
  );
};

// ============================================================================
// MINI METRIC CARD
// ============================================================================
interface MiniMetricProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
  suffix?: string;
}

const MiniMetricCard: React.FC<MiniMetricProps> = ({ icon, iconColor, value, label, suffix }) => (
  <View style={styles.miniMetric}>
    <View style={[styles.miniMetricIcon, { backgroundColor: `${iconColor}20` }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={styles.miniMetricValue}>
      {value}
      {suffix && <Text style={styles.miniMetricSuffix}>{suffix}</Text>}
    </Text>
    <Text style={styles.miniMetricLabel}>{label}</Text>
  </View>
);

// ============================================================================
// DAILY PROGRESS CARD
// ============================================================================
export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  performance,
  onPress,
}) => {
  const calorieProgress = performance.calories.target > 0
    ? (performance.calories.current / performance.calories.target) * 100
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.heroCard}
    >
      <LinearGradient
        colors={['rgba(74, 222, 128, 0.08)', 'rgba(167, 139, 250, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCardGradient}
      >
        <View style={styles.heroTopAccent} />

        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Daily Progress</Text>
          <View style={styles.heroTapHint}>
            <Text style={styles.heroTapHintText}>View Details</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.progressRingWrapper}>
          <AnimatedProgressRing
            progress={calorieProgress}
            current={performance.calories.current}
            target={performance.calories.target}
          />
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <MiniMetricCard
            icon="water"
            iconColor={colors.accent.blue}
            value={performance.water.current.toFixed(1)}
            suffix={`/${performance.water.target}L`}
            label="Water"
          />
          <View style={styles.metricDivider} />
          <MiniMetricCard
            icon="footsteps"
            iconColor={colors.accent.orange}
            value={performance.steps.toLocaleString()}
            label="Steps"
          />
          <View style={styles.metricDivider} />
          <MiniMetricCard
            icon="flame"
            iconColor={colors.error}
            value={performance.activeBurn.toString()}
            suffix=" kcal"
            label="Burned"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default DailyProgressCard;

const styles = StyleSheet.create({
  // Hero Card
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
    ...shadows.cardElevated,
  },
  heroCardGradient: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
  },
  heroTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  heroTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroTapHintText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  progressRingWrapper: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  ringContent: {
    alignItems: 'center',
  },
  ringValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  ringUnit: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniMetric: {
    flex: 1,
    alignItems: 'center',
  },
  miniMetricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  miniMetricValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  miniMetricSuffix: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  miniMetricLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
});
