/**
 * AchievementsCard - Level badge, XP progress bar, recent achievement icons
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface AchievementsCardProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  recentBadges: { emoji: string; name: string }[];
  onViewAll?: () => void;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  level,
  currentXP,
  nextLevelXP,
  recentBadges,
  onViewAll,
}) => {
  const xpProgress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;
  const clampedProgress = Math.min(xpProgress, 100);
  const remainingSlots = Math.max(0, 3 - recentBadges.length);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>LEVEL & ACHIEVEMENTS</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Level + XP row */}
      <View style={styles.levelRow}>
        {/* Level badge */}
        <LinearGradient
          colors={gradients.buttonSecondary as unknown as string[]}
          style={styles.levelBadge}
        >
          <Text style={styles.levelNumber}>{level}</Text>
        </LinearGradient>

        {/* XP bar */}
        <View style={styles.xpSection}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <View style={styles.xpBarBg}>
            <LinearGradient
              colors={gradients.progressPurple as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.xpBarFill, { width: `${clampedProgress}%` }]}
            />
          </View>
          <Text style={styles.xpText}>
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </Text>
        </View>
      </View>

      {/* Recent badges */}
      <View style={styles.badgesRow}>
        {recentBadges.slice(0, 3).map((badge, index) => (
          <View key={index} style={styles.badgeItem}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>
              {badge.name}
            </Text>
          </View>
        ))}
        {remainingSlots > 0 && (
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIcon, styles.badgePlaceholder]}>
              <Text style={styles.badgeMoreText}>+{remainingSlots}</Text>
            </View>
            <Text style={styles.badgeName}>more</Text>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  viewAll: {
    fontSize: typography.size.sm,
    color: colors.secondary,
    fontWeight: typography.weight.medium,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
  xpSection: {
    flex: 1,
  },
  levelLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: colors.glassLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeName: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  badgePlaceholder: {
    borderStyle: 'dashed',
  },
  badgeMoreText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textDisabled,
  },
});

export default AchievementsCard;
