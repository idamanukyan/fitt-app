/**
 * TrainingStreakCard - Workout streak display component
 * Shows current streak with fire animation and best streak comparison
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { TrainingStreak } from '../../types/gamification.types';

interface TrainingStreakCardProps {
  streak: TrainingStreak;
  variant?: 'full' | 'compact';
  style?: object;
}

export const TrainingStreakCard: React.FC<TrainingStreakCardProps> = ({
  streak,
  variant = 'full',
  style,
}) => {
  const flameAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak.isActive && streak.currentDays > 0) {
      // Flame flicker animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.sin,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.sin,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation for hot streaks
      if (streak.currentDays >= 7) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [streak.isActive, streak.currentDays]);

  const getStreakMessage = (): string => {
    if (!streak.isActive) {
      return 'Start a new streak today!';
    }
    if (streak.currentDays === 1) {
      return 'Great start! Keep it going!';
    }
    if (streak.currentDays < 7) {
      return `${7 - streak.currentDays} days to weekly bonus!`;
    }
    if (streak.currentDays < 14) {
      return 'Amazing! Keep the fire burning!';
    }
    if (streak.currentDays < 30) {
      return 'On fire! Legendary streak!';
    }
    return 'UNSTOPPABLE! 🔥';
  };

  const getFlameColor = (): string => {
    if (streak.currentDays >= 30) return colors.error;
    if (streak.currentDays >= 14) return colors.accent.orange;
    if (streak.currentDays >= 7) return colors.warning;
    return colors.accent.yellow;
  };

  const flameScale = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const flameOpacity = flameAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.8],
  });

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <LinearGradient
          colors={[`${getFlameColor()}20`, `${getFlameColor()}05`]}
          style={styles.compactGradient}
        >
          <Animated.View
            style={{ transform: [{ scale: flameScale }], opacity: flameOpacity }}
          >
            <Ionicons name="flame" size={20} color={getFlameColor()} />
          </Animated.View>
          <Text style={[styles.compactDays, { color: getFlameColor() }]}>
            {streak.currentDays}
          </Text>
          <Text style={styles.compactLabel}>days</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 146, 60, 0.05)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Flame Icon with Animation */}
          <Animated.View
            style={[
              styles.flameContainer,
              {
                transform: [{ scale: flameScale }],
                opacity: flameOpacity,
              },
            ]}
          >
            <View
              style={[
                styles.flameBg,
                { backgroundColor: `${getFlameColor()}30` },
              ]}
            >
              <Ionicons name="flame" size={40} color={getFlameColor()} />
            </View>
          </Animated.View>

          {/* Streak Info */}
          <View style={styles.streakInfo}>
            <View style={styles.streakRow}>
              <Text style={styles.streakDays}>{streak.currentDays}</Text>
              <Text style={styles.streakUnit}>day streak</Text>
            </View>
            <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Best Streak */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="trophy" size={14} color={colors.accent.yellow} />
            </View>
            <View>
              <Text style={styles.statValue}>{streak.longestStreak}</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </View>

          {/* Weekly Goal */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={14} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>
                {streak.weeklyProgress}/{streak.weeklyGoal}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* Freezes */}
          {streak.freezesAvailable > 0 && (
            <View style={styles.statItem}>
              <View style={[styles.statIcon, styles.freezeIcon]}>
                <Ionicons name="snow" size={14} color={colors.info} />
              </View>
              <View>
                <Text style={styles.statValue}>{streak.freezesAvailable}</Text>
                <Text style={styles.statLabel}>Freezes</Text>
              </View>
            </View>
          )}
        </View>

        {/* Weekly Progress Bar */}
        <View style={styles.weeklyProgress}>
          <View style={styles.weeklyProgressBg}>
            {Array.from({ length: streak.weeklyGoal }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.weeklyProgressDot,
                  i < streak.weeklyProgress && styles.weeklyProgressDotFilled,
                ]}
              >
                {i < streak.weeklyProgress && (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color={colors.textInverse}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Mini streak indicator for headers
interface MiniStreakProps {
  days: number;
  isActive: boolean;
  style?: object;
}

export const MiniStreak: React.FC<MiniStreakProps> = ({
  days,
  isActive,
  style,
}) => {
  if (days === 0) return null;

  return (
    <View style={[styles.miniContainer, style]}>
      <Ionicons
        name="flame"
        size={14}
        color={isActive ? colors.accent.orange : colors.textMuted}
      />
      <Text
        style={[
          styles.miniText,
          { color: isActive ? colors.accent.orange : colors.textMuted },
        ]}
      >
        {days}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  gradient: {
    padding: spacing.lg,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flameContainer: {
    marginRight: spacing.lg,
  },
  flameBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakDays: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  streakUnit: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  streakMessage: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeIcon: {
    backgroundColor: colors.infoBg,
  },
  statValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  weeklyProgress: {
    marginTop: spacing.md,
  },
  weeklyProgressBg: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  weeklyProgressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyProgressDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Compact variant
  compactContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  compactDays: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  compactLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // Mini variant
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
  },
});

export default TrainingStreakCard;
