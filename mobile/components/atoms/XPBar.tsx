/**
 * XPBar - Progress bar for XP to next level
 * High-tech architecture design
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';

interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  showLabel?: boolean;
  height?: number;
}

export default function XPBar({
  currentXP,
  requiredXP,
  showLabel = true,
  height = 24,
}: XPBarProps) {
  const percentage = Math.min((currentXP / requiredXP) * 100, 100);

  return (
    <View style={styles.container}>
      {/* Progress Bar Background */}
      <View style={[styles.barBackground, { height }]}>
        {/* Progress Fill */}
        <LinearGradient
          colors={[theme.colors.techBlue, theme.colors.techCyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${percentage}%` }]}
        />

        {/* XP Label */}
        {showLabel && (
          <View style={styles.labelContainer}>
            <Text style={styles.xpText}>
              {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
            </Text>
          </View>
        )}
      </View>

      {/* Percentage Label */}
      {showLabel && (
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    flex: 1,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: theme.colors.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.techBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    minWidth: 40,
    textAlign: 'right',
  },
});
