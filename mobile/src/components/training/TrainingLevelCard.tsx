/**
 * TrainingLevelCard - XP and level display component
 * Shows current level, XP progress, and level title
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import { XPProgressRing } from '../ui/ProgressRing';
import type { GamificationState, LevelThreshold } from '../../types/gamification.types';
import { LEVEL_THRESHOLDS } from '../../types/gamification.types';

interface TrainingLevelCardProps {
  state: GamificationState;
  variant?: 'full' | 'compact' | 'mini';
  onPress?: () => void;
  style?: object;
}

export const TrainingLevelCard: React.FC<TrainingLevelCardProps> = ({
  state,
  variant = 'full',
  onPress,
  style,
}) => {
  const currentLevel = state.currentLevelInfo;
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel.level + 1);

  const formatXP = (xp: number): string => {
    if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}k`;
    }
    return xp.toString();
  };

  if (variant === 'mini') {
    return (
      <TouchableOpacity
        style={[styles.miniContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
      >
        <LinearGradient
          colors={[`${currentLevel.color}30`, `${currentLevel.color}10`]}
          style={styles.miniGradient}
        >
          <Ionicons
            name={currentLevel.badge as any}
            size={16}
            color={currentLevel.color}
          />
          <Text style={[styles.miniLevel, { color: currentLevel.color }]}>
            Lvl {state.level}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
      >
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.15)', 'rgba(167, 139, 250, 0.05)']}
          style={styles.compactGradient}
        >
          <View style={styles.compactLeft}>
            <View
              style={[
                styles.compactIconBg,
                { backgroundColor: `${currentLevel.color}30` },
              ]}
            >
              <Ionicons
                name={currentLevel.badge as any}
                size={24}
                color={currentLevel.color}
              />
            </View>
            <View>
              <Text style={styles.compactTitle}>{currentLevel.title}</Text>
              <Text style={styles.compactXP}>
                {formatXP(state.currentXP)} XP
              </Text>
            </View>
          </View>
          <View style={styles.compactRight}>
            <Text style={styles.compactLevel}>LVL {state.level}</Text>
            <View style={styles.compactProgressBg}>
              <View
                style={[
                  styles.compactProgressFill,
                  { width: `${state.levelProgress * 100}%` },
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Full variant
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <LinearGradient
        colors={['rgba(167, 139, 250, 0.15)', 'rgba(74, 222, 128, 0.05)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.leftSection}>
          {/* Level Ring */}
          <XPProgressRing
            current={state.currentXP - currentLevel.minXP}
            max={currentLevel.maxXP - currentLevel.minXP}
            level={state.level}
            size="lg"
          />
        </View>

        <View style={styles.rightSection}>
          {/* Title & Badge */}
          <View style={styles.titleRow}>
            <Ionicons
              name={currentLevel.badge as any}
              size={20}
              color={currentLevel.color}
            />
            <Text style={[styles.title, { color: currentLevel.color }]}>
              {currentLevel.title}
            </Text>
          </View>

          {/* XP Info */}
          <View style={styles.xpRow}>
            <Text style={styles.currentXP}>{formatXP(state.currentXP)}</Text>
            <Text style={styles.xpLabel}> XP</Text>
            {nextLevel && (
              <Text style={styles.nextXP}>
                {' '}
                / {formatXP(nextLevel.minXP)}
              </Text>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[colors.secondary, colors.secondaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${state.levelProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {state.xpToNextLevel} XP to Level {state.level + 1}
            </Text>
          </View>

          {/* Recent XP Gain */}
          {state.recentXPGains.length > 0 && (
            <View style={styles.recentGain}>
              <Ionicons name="add-circle" size={14} color={colors.success} />
              <Text style={styles.recentGainText}>
                +{state.recentXPGains[0].xpAmount} {state.recentXPGains[0].description}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Weekly XP Summary
interface WeeklyXPSummaryProps {
  totalXP: number;
  dailyXP: number[];
  style?: object;
}

export const WeeklyXPSummary: React.FC<WeeklyXPSummaryProps> = ({
  totalXP,
  dailyXP,
  style,
}) => {
  const maxDaily = Math.max(...dailyXP, 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={[styles.weeklyContainer, style]}>
      <View style={styles.weeklyHeader}>
        <Text style={styles.weeklyTitle}>This Week</Text>
        <View style={styles.weeklyTotal}>
          <Ionicons name="star" size={14} color={colors.secondary} />
          <Text style={styles.weeklyTotalText}>{totalXP} XP</Text>
        </View>
      </View>
      <View style={styles.weeklyBars}>
        {dailyXP.map((xp, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(xp / maxDaily) * 100}%`,
                    backgroundColor:
                      index === dailyXP.length - 1
                        ? colors.secondary
                        : colors.secondarySubtle,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{days[index]}</Text>
          </View>
        ))}
      </View>
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
    flexDirection: 'row',
    padding: spacing.lg,
  },
  leftSection: {
    marginRight: spacing.lg,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  currentXP: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  xpLabel: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  nextXP: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.glass,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  recentGain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recentGainText: {
    fontSize: typography.size.xs,
    color: colors.success,
    fontWeight: typography.weight.medium,
  },

  // Compact variant
  compactContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactXP: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactLevel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  compactProgressBg: {
    width: 60,
    height: 4,
    backgroundColor: colors.glass,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },

  // Mini variant
  miniContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  miniGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  miniLevel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },

  // Weekly summary
  weeklyContainer: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weeklyTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  weeklyTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  weeklyTotalText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.secondary,
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flex: 1,
    width: 16,
    backgroundColor: colors.glass,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default TrainingLevelCard;
