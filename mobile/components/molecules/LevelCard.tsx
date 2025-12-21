/**
 * LevelCard - Display user's level and XP progress
 * High-tech architecture design
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import XPBar from '../atoms/XPBar';
import { UserLevel } from '../../types/achievement.types';

interface LevelCardProps {
  userLevel: UserLevel;
}

export default function LevelCard({ userLevel }: LevelCardProps) {
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.techBlue, theme.colors.techCyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Level Icon & Number */}
      <View style={styles.levelSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={32} color={theme.colors.black} />
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>LEVEL</Text>
          <Text style={styles.levelNumber}>{userLevel.level}</Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.xpSection}>
        <Text style={styles.xpLabel}>EXPERIENCE POINTS</Text>
        <XPBar
          currentXP={userLevel.current_xp}
          requiredXP={userLevel.xp_to_next_level}
          showLabel={true}
          height={28}
        />
        <Text style={styles.nextLevelText}>
          {userLevel.xp_to_next_level - userLevel.current_xp} XP to Level {userLevel.level + 1}
        </Text>
      </View>

      {/* Total XP Badge */}
      <View style={styles.totalXPBadge}>
        <Text style={styles.totalXPText}>
          {userLevel.total_xp.toLocaleString()} TOTAL XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.techBlue,
    ...theme.shadows.techBlueGlow,
  },
  background: {
    padding: theme.spacing.lg,
  },
  levelSection: {
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
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.black,
    lineHeight: 48,
  },
  xpSection: {
    gap: theme.spacing.sm,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  nextLevelText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.black,
    textAlign: 'center',
    opacity: 0.8,
  },
  totalXPBadge: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    alignSelf: 'center',
  },
  totalXPText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
