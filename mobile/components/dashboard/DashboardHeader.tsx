/**
 * DashboardHeader - Greeting, user name, date, and weather badge
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { asIconName } from '../../types/icons';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';

export interface DashboardHeaderProps {
  greeting: string;
  userName: string;
  date: string;
  weatherIcon: string;
  weatherTemp: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  userName,
  date,
  weatherIcon,
  weatherTemp,
}) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.greeting}>{greeting},</Text>
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.dateText}>{date}</Text>
    </View>
    <View style={styles.weatherBadge}>
      <Ionicons name={asIconName(weatherIcon)} size={16} color={colors.textSecondary} />
      <Text style={styles.weatherTemp}>{weatherTemp}°</Text>
    </View>
  </View>
);

export default DashboardHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.size.lg,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  userName: {
    fontSize: typography.size['3xl'],
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  weatherTemp: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.semiBold,
  },
});
