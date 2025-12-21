/**
 * ProgressRing - Animated circular progress indicator
 * Premium wellness aesthetic with green accent
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import theme from '../../utils/theme';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  current: number;
  target: number;
  unit?: string;
  label?: string;
}

export default function ProgressRing({
  progress,
  size = 180,
  strokeWidth = 12,
  current,
  target,
  unit = 'kcal',
  label = 'Daily Goal',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={theme.colors.oliveBlack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.techGreen}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={[styles.centerContent, { width: size, height: size }]}>
        <Text style={styles.currentValue}>
          {current.toLocaleString()}
        </Text>
        <Text style={styles.targetValue}>
          / {target.toLocaleString()} {unit}
        </Text>
        <Text style={styles.label}>
          {label} · {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentValue: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.techGreen,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
