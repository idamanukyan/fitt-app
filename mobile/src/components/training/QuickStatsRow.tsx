/**
 * QuickStatsRow - Horizontal stats display for exercise detail
 * Shows calories, difficulty, sets/reps suggestions, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius } from '../../../design/tokens';

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}

interface QuickStatsRowProps {
  stats: StatItem[];
  style?: object;
}

export const QuickStatsRow: React.FC<QuickStatsRowProps> = ({ stats, style }) => {
  return (
    <View style={[styles.container, style]}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${stat.color || colors.primary}20` },
            ]}
          >
            <Ionicons
              name={stat.icon}
              size={18}
              color={stat.color || colors.primary}
            />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

// Pre-configured stats row for exercises
interface ExerciseQuickStatsProps {
  caloriesPerMinute?: number;
  difficulty?: string;
  suggestedSets?: string;
  suggestedReps?: string;
  restTime?: string;
  style?: object;
}

export const ExerciseQuickStats: React.FC<ExerciseQuickStatsProps> = ({
  caloriesPerMinute,
  difficulty,
  suggestedSets = '3-4',
  suggestedReps = '8-12',
  restTime = '60-90s',
  style,
}) => {
  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'advanced':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const stats: StatItem[] = [];

  if (caloriesPerMinute) {
    stats.push({
      icon: 'flame',
      label: 'cal/min',
      value: `~${caloriesPerMinute}`,
      color: colors.accent.orange,
    });
  }

  stats.push({
    icon: 'layers-outline',
    label: 'sets',
    value: suggestedSets,
    color: colors.primary,
  });

  stats.push({
    icon: 'repeat',
    label: 'reps',
    value: suggestedReps,
    color: colors.secondary,
  });

  stats.push({
    icon: 'time-outline',
    label: 'rest',
    value: restTime,
    color: colors.info,
  });

  if (difficulty) {
    stats.push({
      icon: 'speedometer-outline',
      label: 'level',
      value: difficulty,
      color: getDifficultyColor(difficulty),
    });
  }

  return <QuickStatsRow stats={stats} style={style} />;
};

// Compact version for cards
interface CompactStatsProps {
  stats: Array<{ icon: keyof typeof Ionicons.glyphMap; value: string | number }>;
  style?: object;
}

export const CompactStats: React.FC<CompactStatsProps> = ({ stats, style }) => {
  return (
    <View style={[styles.compactContainer, style]}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.compactItem}>
            <Ionicons name={stat.icon} size={14} color={colors.textMuted} />
            <Text style={styles.compactValue}>{stat.value}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

// AI tracking info row
interface AITrackingInfoProps {
  isAISupported: boolean;
  trackingType?: 'pose' | 'rep_count' | 'form_analysis';
  style?: object;
}

export const AITrackingInfo: React.FC<AITrackingInfoProps> = ({
  isAISupported,
  trackingType = 'form_analysis',
  style,
}) => {
  if (!isAISupported) {
    return (
      <View style={[styles.aiInfoContainer, styles.aiUnsupported, style]}>
        <Ionicons name="sparkles-outline" size={18} color={colors.textMuted} />
        <View style={styles.aiInfoText}>
          <Text style={styles.aiInfoLabel}>AI Tracking</Text>
          <Text style={styles.aiInfoUnavailable}>Not available for this exercise</Text>
        </View>
      </View>
    );
  }

  const getTrackingLabel = () => {
    switch (trackingType) {
      case 'pose':
        return 'Pose detection enabled';
      case 'rep_count':
        return 'Rep counting enabled';
      case 'form_analysis':
      default:
        return 'Form analysis enabled';
    }
  };

  return (
    <View style={[styles.aiInfoContainer, style]}>
      <LinearGradient
        colors={[colors.primarySubtle, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.aiIconContainer}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
      </View>
      <View style={styles.aiInfoText}>
        <Text style={styles.aiInfoLabel}>AI Coach Ready</Text>
        <Text style={styles.aiInfoValue}>{getTrackingLabel()}</Text>
      </View>
      <View style={styles.aiFeatures}>
        <View style={styles.aiFeatureItem}>
          <Ionicons name="body-outline" size={14} color={colors.primary} />
        </View>
        <View style={styles.aiFeatureItem}>
          <Ionicons name="analytics-outline" size={14} color={colors.primary} />
        </View>
        <View style={styles.aiFeatureItem}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactValue: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.glassBorder,
    marginHorizontal: spacing.sm,
  },
  aiInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  aiUnsupported: {
    borderColor: colors.glassBorder,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aiInfoText: {
    flex: 1,
  },
  aiInfoLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  aiInfoValue: {
    fontSize: typography.size.xs,
    color: colors.primary,
    marginTop: 2,
  },
  aiInfoUnavailable: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  aiFeatures: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  aiFeatureItem: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuickStatsRow;
