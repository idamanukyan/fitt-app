/**
 * MacroBar - Horizontal progress bar for macronutrients
 * High-tech architecture design with industrial precision
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
  icon?: string;
}

export default function MacroBar({
  label,
  current,
  goal,
  unit = 'g',
  color,
  icon,
}: MacroBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);
  const isComplete = current >= goal;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.valuesContainer}>
          <Text style={[styles.currentValue, isComplete && styles.completeValue]}>
            {Math.round(current)}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.goalValue}>{Math.round(goal)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.barContainer}>
        {/* Background Bar */}
        <View style={[styles.barBackground, { borderColor: color }]}>
          {/* Progress Fill */}
          {percentage > 0 && (
            <LinearGradient
              colors={[color, `${color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: `${percentage}%` }]}
            />
          )}
        </View>

        {/* Percentage Label */}
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isComplete ? (
            <Text style={{ color: theme.colors.techGreen }}>✓ Goal Reached</Text>
          ) : (
            <Text style={styles.remainingText}>
              {Math.round(remaining)}{unit} remaining
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currentValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  completeValue: {
    color: theme.colors.techGreen,
  },
  separator: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '400',
    color: theme.colors.steelDark,
  },
  goalValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    color: theme.colors.steel,
  },
  unit: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  percentageContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  footer: {
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
  },
  remainingText: {
    color: theme.colors.steel,
  },
});
