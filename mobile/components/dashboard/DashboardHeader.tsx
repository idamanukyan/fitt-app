/**
 * DashboardHeader - Time-based greeting, streak pill, profile avatar
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';

interface DashboardHeaderProps {
  userName: string;
  streak: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, streak }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>
      <View style={styles.right}>
        {streak > 0 && (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={14} color={colors.accent.orange} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getFirstInitial(userName)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  left: {
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.size.sm,
    color: colors.accent.orange,
    fontWeight: typography.weight.bold,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
});

export default DashboardHeader;
