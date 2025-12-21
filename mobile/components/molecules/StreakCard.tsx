/**
 * StreakCard - Display user's activity streak
 * High-tech architecture design with animated fire gradient
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { UserStreak } from '../../types/achievement.types';

interface StreakCardProps {
  streak: UserStreak;
}

export default function StreakCard({ streak }: StreakCardProps) {
  const isActive = streak.current_streak > 0;

  return (
    <View style={styles.container}>
      {/* Background Gradient - Fire colors for active streak */}
      <LinearGradient
        colors={
          isActive
            ? [theme.colors.techOrange, theme.colors.techRed]
            : [theme.colors.concrete, theme.colors.concreteDark]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Top Section - Current Streak */}
      <View style={styles.mainSection}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="flame"
            size={40}
            color={isActive ? theme.colors.black : theme.colors.steelDark}
          />
        </View>
        <View style={styles.streakInfo}>
          <Text style={[styles.streakLabel, !isActive && styles.inactiveText]}>
            CURRENT STREAK
          </Text>
          <Text style={[styles.streakNumber, !isActive && styles.inactiveText]}>
            {streak.current_streak} {streak.current_streak === 1 ? 'DAY' : 'DAYS'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Longest Streak */}
        <View style={styles.statItem}>
          <Ionicons
            name="trophy-outline"
            size={20}
            color={isActive ? theme.colors.black : theme.colors.steel}
          />
          <Text style={[styles.statLabel, !isActive && styles.inactiveText]}>BEST</Text>
          <Text style={[styles.statValue, !isActive && styles.inactiveText]}>
            {streak.longest_streak}
          </Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Total Active Days */}
        <View style={styles.statItem}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={isActive ? theme.colors.black : theme.colors.steel}
          />
          <Text style={[styles.statLabel, !isActive && styles.inactiveText]}>TOTAL DAYS</Text>
          <Text style={[styles.statValue, !isActive && styles.inactiveText]}>
            {streak.total_active_days}
          </Text>
        </View>
      </View>

      {/* Motivation Message */}
      {isActive ? (
        <View style={styles.motivationBadge}>
          <Text style={styles.motivationText}>🔥 KEEP IT BURNING!</Text>
        </View>
      ) : (
        <View style={styles.motivationBadge}>
          <Text style={[styles.motivationText, styles.inactiveText]}>
            START YOUR STREAK TODAY
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.techOrange,
  },
  background: {
    padding: theme.spacing.lg,
  },
  mainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.black,
    lineHeight: 32,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginVertical: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  verticalDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.black,
  },
  motivationBadge: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    alignSelf: 'center',
  },
  motivationText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  inactiveText: {
    color: theme.colors.steel,
  },
});
