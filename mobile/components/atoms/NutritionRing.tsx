/**
 * NutritionRing - Circular progress indicator for calorie tracking
 * High-tech architecture design with technical precision
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import theme from '../../utils/theme';

interface NutritionRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  unit?: string;
}

export default function NutritionRing({
  current,
  goal,
  size = 180,
  strokeWidth = 14,
  label = 'Calories',
  unit = 'kcal',
}: NutritionRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((current / goal) * 100, 100);
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  const remaining = Math.max(goal - current, 0);

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 100) return theme.colors.techGreen;
    if (percentage >= 80) return theme.colors.techCyan;
    if (percentage >= 50) return theme.colors.techBlue;
    return theme.colors.steel;
  };

  const color = getColor();

  return (
    <View style={styles.container}>
      {/* SVG Circle Progress */}
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.iron}
            strokeWidth={strokeWidth}
            fill="none"
            strokeOpacity={0.3}
          />

          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity={0.9}
          />
        </G>
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text style={styles.currentValue}>
          {Math.round(current).toLocaleString()}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
        <View style={styles.divider} />
        <Text style={styles.goalText}>
          Goal: {Math.round(goal).toLocaleString()}
        </Text>
        <Text style={[styles.remainingText, { color }]}>
          {remaining > 0 ? `${Math.round(remaining)} left` : 'Complete!'}
        </Text>
      </View>

      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.labelBar, { backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  unit: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.iron,
    marginVertical: theme.spacing.sm,
  },
  goalText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remainingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    marginTop: 4,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelBar: {
    width: 60,
    height: 2,
    marginTop: 4,
  },
});
