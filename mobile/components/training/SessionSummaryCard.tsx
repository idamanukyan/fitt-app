/**
 * SessionSummaryCard - Summary stats, AI form score, and pending sync badge
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

interface SessionStats {
  totalVolume: number;
  totalReps: number;
  totalExercises: number;
  caloriesBurned: number | null;
}

interface SessionSummaryCardProps {
  stats: SessionStats;
  aiScore?: number;
  isPendingSync?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return colors.success;
  if (score >= 75) return colors.primary;
  if (score >= 60) return colors.warning;
  return colors.error;
};

const statTiles: { key: keyof SessionStats; label: string; color: string; bgColor: string; borderColor: string }[] = [
  {
    key: 'totalVolume',
    label: 'Volume (kg)',
    color: colors.primary,
    bgColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.15)',
  },
  {
    key: 'totalReps',
    label: 'Total Reps',
    color: colors.secondary,
    bgColor: 'rgba(167, 139, 250, 0.08)',
    borderColor: 'rgba(167, 139, 250, 0.15)',
  },
  {
    key: 'totalExercises',
    label: 'Exercises',
    color: colors.accent.blue,
    bgColor: 'rgba(96, 165, 250, 0.08)',
    borderColor: 'rgba(96, 165, 250, 0.15)',
  },
  {
    key: 'caloriesBurned',
    label: 'Calories',
    color: colors.accent.orange,
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.15)',
  },
];

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  stats,
  aiScore,
  isPendingSync = false,
}) => {
  return (
    <View>
      {/* Pending sync badge */}
      {isPendingSync && (
        <View style={styles.syncBadge}>
          <Ionicons name="time-outline" size={14} color={colors.warning} />
          <Text style={styles.syncBadgeText}>
            Pending sync — will upload when you're back online
          </Text>
        </View>
      )}

      {/* Stat tiles */}
      <View style={styles.tilesRow}>
        {statTiles.map((tile) => {
          const value = stats[tile.key];
          const displayValue = value != null ? (tile.key === 'totalVolume' ? value.toLocaleString() : String(value)) : '—';
          return (
            <View
              key={tile.key}
              style={[
                styles.tile,
                { backgroundColor: tile.bgColor, borderColor: tile.borderColor },
              ]}
            >
              <Text style={[styles.tileValue, { color: tile.color }]}>{displayValue}</Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </View>
          );
        })}
      </View>

      {/* AI Form Score */}
      {aiScore != null && (
        <View style={styles.aiScoreCard}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(aiScore) }]}>
            <Text style={[styles.scoreValue, { color: getScoreColor(aiScore) }]}>{aiScore}</Text>
          </View>
          <View style={styles.aiScoreText}>
            <Text style={styles.aiScoreTitle}>AI Form Score</Text>
            <Text style={styles.aiScoreDesc}>
              {aiScore >= 90
                ? 'Excellent form throughout the session'
                : aiScore >= 75
                ? 'Good form with minor corrections needed'
                : aiScore >= 60
                ? 'Moderate form — review flagged exercises'
                : 'Form needs attention — check exercise details'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  syncBadgeText: {
    flex: 1,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.warning,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tileValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  tileLabel: {
    fontSize: 10,
    color: colors.textDisabled,
    marginTop: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  aiScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scoreValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  aiScoreText: {
    flex: 1,
  },
  aiScoreTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  aiScoreDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default SessionSummaryCard;
