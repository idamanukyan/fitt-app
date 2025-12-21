/**
 * WorkoutAnalyticsCard - Workout History Analytics with PR Badges
 * Displays performance trends, PRs, calories, and streaks
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../design/tokens';
import type { TrainingHistoryEntry } from '../../types/training.types';

interface WorkoutAnalyticsCardProps {
  history: TrainingHistoryEntry[];
  streak: number;
  averageScore: number;
  totalWorkouts: number;
  onViewDetails?: () => void;
}

interface PRBadge {
  exerciseName: string;
  type: 'weight' | 'reps' | 'score';
  value: number;
  previousValue: number;
  date: string;
}

export const WorkoutAnalyticsCard: React.FC<WorkoutAnalyticsCardProps> = ({
  history,
  streak,
  averageScore,
  totalWorkouts,
  onViewDetails,
}) => {
  // Calculate weekly progress
  const getWeeklyData = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = history.filter(h => new Date(h.date) >= weekAgo);
    const previousWeek = history.filter(h => {
      const date = new Date(h.date);
      return date >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date < weekAgo;
    });

    const thisWeekWorkouts = thisWeek.length;
    const previousWeekWorkouts = previousWeek.length;
    const workoutChange = previousWeekWorkouts > 0
      ? Math.round(((thisWeekWorkouts - previousWeekWorkouts) / previousWeekWorkouts) * 100)
      : 100;

    const thisWeekCalories = thisWeek.reduce((sum, h) => sum + h.calories, 0);
    const thisWeekVolume = thisWeek.reduce((sum, h) => sum + (h.weight || 0) * h.reps, 0);

    return {
      workouts: thisWeekWorkouts,
      workoutChange,
      calories: thisWeekCalories,
      volume: thisWeekVolume,
    };
  };

  // Find Personal Records
  const getPRs = (): PRBadge[] => {
    const prs: PRBadge[] = [];
    const exerciseMaxes: Record<string, { weight: number; reps: number; score: number }> = {};

    // Sort history by date (oldest first)
    const sortedHistory = [...history].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedHistory.forEach(entry => {
      const key = entry.exerciseId;
      if (!exerciseMaxes[key]) {
        exerciseMaxes[key] = { weight: 0, reps: 0, score: 0 };
      }

      const current = exerciseMaxes[key];

      if (entry.weight && entry.weight > current.weight) {
        if (current.weight > 0) {
          prs.push({
            exerciseName: entry.exerciseName,
            type: 'weight',
            value: entry.weight,
            previousValue: current.weight,
            date: entry.date,
          });
        }
        current.weight = entry.weight;
      }

      if (entry.aiScore > current.score) {
        if (current.score > 0 && entry.aiScore - current.score >= 5) {
          prs.push({
            exerciseName: entry.exerciseName,
            type: 'score',
            value: entry.aiScore,
            previousValue: current.score,
            date: entry.date,
          });
        }
        current.score = entry.aiScore;
      }
    });

    // Return most recent PRs (last 5)
    return prs.slice(-5).reverse();
  };

  // Get performance trend (last 7 entries)
  const getPerformanceTrend = () => {
    const recentHistory = history.slice(0, 7).reverse();
    return recentHistory.map(h => ({
      score: h.aiScore,
      date: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
    }));
  };

  const weeklyData = getWeeklyData();
  const prs = getPRs();
  const performanceTrend = getPerformanceTrend();
  const maxScore = Math.max(...performanceTrend.map(p => p.score), 100);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return colors.success;
    if (score >= 75) return colors.accent.cyan;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Performance Analytics</Text>
        </View>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="flame" size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondarySubtle }]}>
            <Ionicons name="star" size={18} color={colors.secondary} />
          </View>
          <Text style={styles.statValue}>{averageScore}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.infoBg }]}>
            <Ionicons name="barbell" size={18} color={colors.info} />
          </View>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
      </View>

      {/* Performance Trend Chart */}
      {performanceTrend.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>7-Day Performance</Text>
          <View style={styles.chartContainer}>
            {performanceTrend.map((point, index) => {
              const height = (point.score / maxScore) * 80;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.chartBarContainer}>
                    <LinearGradient
                      colors={[getScoreColor(point.score), `${getScoreColor(point.score)}60`]}
                      style={[styles.chartBarFill, { height }]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{point.date}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Weekly Summary */}
      <View style={styles.weeklySection}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weeklyGrid}>
          <View style={styles.weeklyItem}>
            <Text style={styles.weeklyValue}>{weeklyData.workouts}</Text>
            <Text style={styles.weeklyLabel}>Workouts</Text>
            {weeklyData.workoutChange !== 0 && (
              <View style={[
                styles.changeBadge,
                { backgroundColor: weeklyData.workoutChange > 0 ? colors.successBg : colors.errorBg }
              ]}>
                <Ionicons
                  name={weeklyData.workoutChange > 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={weeklyData.workoutChange > 0 ? colors.success : colors.error}
                />
                <Text style={[
                  styles.changeText,
                  { color: weeklyData.workoutChange > 0 ? colors.success : colors.error }
                ]}>
                  {Math.abs(weeklyData.workoutChange)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.weeklyItem}>
            <Text style={styles.weeklyValue}>{weeklyData.calories.toLocaleString()}</Text>
            <Text style={styles.weeklyLabel}>Calories</Text>
          </View>

          <View style={styles.weeklyItem}>
            <Text style={styles.weeklyValue}>
              {weeklyData.volume >= 1000
                ? `${(weeklyData.volume / 1000).toFixed(1)}k`
                : weeklyData.volume}
            </Text>
            <Text style={styles.weeklyLabel}>Volume (kg)</Text>
          </View>
        </View>
      </View>

      {/* Personal Records */}
      {prs.length > 0 && (
        <View style={styles.prSection}>
          <View style={styles.prHeader}>
            <Ionicons name="trophy" size={18} color={colors.accent.yellow} />
            <Text style={styles.sectionTitle}>Recent PRs</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prList}
          >
            {prs.map((pr, index) => (
              <View key={index} style={styles.prCard}>
                <LinearGradient
                  colors={[colors.accent.yellowGlow, 'transparent']}
                  style={styles.prGradient}
                >
                  <View style={styles.prIconContainer}>
                    <Ionicons
                      name={pr.type === 'weight' ? 'barbell' : pr.type === 'score' ? 'star' : 'repeat'}
                      size={16}
                      color={colors.accent.yellow}
                    />
                  </View>
                  <Text style={styles.prExercise} numberOfLines={1}>
                    {pr.exerciseName}
                  </Text>
                  <Text style={styles.prValue}>
                    {pr.value}{pr.type === 'weight' ? 'kg' : pr.type === 'score' ? '' : ' reps'}
                  </Text>
                  <View style={styles.prImprovement}>
                    <Ionicons name="arrow-up" size={10} color={colors.success} />
                    <Text style={styles.prImprovementText}>
                      +{pr.value - pr.previousValue}{pr.type === 'weight' ? 'kg' : ''}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.glassBorder,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: spacing.sm,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    width: 24,
    height: 80,
    backgroundColor: colors.glass,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: radius.sm,
  },
  chartLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  weeklySection: {
    marginBottom: spacing.lg,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
  },
  weeklyValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  weeklyLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  changeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },
  prSection: {
    marginTop: spacing.sm,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  prList: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  prCard: {
    width: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.accent.yellowGlow,
  },
  prGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  prIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.yellowGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  prExercise: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  prValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  prImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  prImprovementText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.success,
  },
});

export default WorkoutAnalyticsCard;
