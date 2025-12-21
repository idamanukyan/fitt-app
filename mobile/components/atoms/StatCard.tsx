/**
 * StatCard - Brutalist stat display with neon accent
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendPositive = true,
}: StatCardProps) {
  return (
    <View style={styles.container}>
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.lightGreen}
          />
        </View>
      )}

      {/* Value */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {value}
          {unit && <Text style={styles.unit}> {unit}</Text>}
        </Text>

        {/* Trend */}
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trendPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trendPositive ? theme.colors.lightGreen : theme.colors.error}
            />
            <Text
              style={[
                styles.trend,
                { color: trendPositive ? theme.colors.lightGreen : theme.colors.error },
              ]}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minWidth: 100,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  valueContainer: {
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  unit: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '400',
    color: theme.colors.darkGray,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: 4,
  },
  trend: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
