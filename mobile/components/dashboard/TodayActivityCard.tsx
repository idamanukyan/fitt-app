/**
 * TodayActivityCard - 4 progress rings: calories, protein, water, steps
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface MetricData {
  current: number;
  goal: number;
}

interface TodayActivityCardProps {
  calories: MetricData;
  protein: MetricData;
  water: MetricData;
  steps: MetricData;
}

// ============================================================================
// AnimatedProgressRing - Extracted and parameterized
// ============================================================================
interface ProgressRingProps {
  progress: number;
  label: string;
  value: string;
  goalLabel: string;
  color: string;
  gradientId: string;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  label,
  value,
  goalLabel,
  color,
  gradientId,
  size = 60,
  strokeWidth = 3,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(progress, 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const clampedProgress = Math.min(progress, 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={ringStyles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} />
              <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
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
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90, ${center}, ${center})`}
          />
        </Svg>
        <Text style={ringStyles.value}>{value}</Text>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
      <Text style={ringStyles.goal}>{goalLabel}</Text>
    </View>
  );
};

const ringStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 9,
    fontWeight: typography.weight.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  goal: {
    fontSize: 9,
    color: colors.textDisabled,
    marginTop: 2,
  },
});

// ============================================================================
// TodayActivityCard
// ============================================================================

function formatWater(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${ml}ml`;
}

function formatSteps(steps: number): string {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1)}k`;
  }
  return String(steps);
}

export const TodayActivityCard: React.FC<TodayActivityCardProps> = ({
  calories,
  protein,
  water,
  steps,
}) => {
  const calorieProgress = calories.goal > 0 ? (calories.current / calories.goal) * 100 : 0;
  const proteinProgress = protein.goal > 0 ? (protein.current / protein.goal) * 100 : 0;
  const waterProgress = water.goal > 0 ? (water.current / water.goal) * 100 : 0;
  const stepsProgress = steps.goal > 0 ? (steps.current / steps.goal) * 100 : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>TODAY'S ACTIVITY</Text>
      <View style={styles.ringsRow}>
        <ProgressRing
          progress={calorieProgress}
          label="Calories"
          value={String(Math.round(calories.current))}
          goalLabel={`/ ${calories.goal}`}
          color={colors.primary}
          gradientId="caloriesGrad"
        />
        <ProgressRing
          progress={proteinProgress}
          label="Protein"
          value={`${Math.round(protein.current)}g`}
          goalLabel={`/ ${protein.goal}g`}
          color={colors.secondary}
          gradientId="proteinGrad"
        />
        <ProgressRing
          progress={waterProgress}
          label="Water"
          value={formatWater(water.current)}
          goalLabel={`/ ${formatWater(water.goal)}`}
          color={colors.accent.blue}
          gradientId="waterGrad"
        />
        <ProgressRing
          progress={stepsProgress}
          label="Steps"
          value={formatSteps(steps.current)}
          goalLabel={`/ ${formatSteps(steps.goal)}`}
          color={colors.accent.orange}
          gradientId="stepsGrad"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

export default TodayActivityCard;
