/**
 * CoachInsightsCard - AI Coach Insights Tab
 * Shows weak muscles, suggested workouts, form issues, and weekly changes
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
import type { TrainingHistoryEntry, ExerciseDetail } from '../../types/training.types';

interface CoachInsightsCardProps {
  history: TrainingHistoryEntry[];
  exercises: ExerciseDetail[];
  onSelectWorkout?: (type: string) => void;
  onSelectExercise?: (exerciseId: string) => void;
}

interface MuscleBalance {
  muscle: string;
  workouts: number;
  avgScore: number;
  status: 'strong' | 'balanced' | 'weak' | 'neglected';
  recommendation?: string;
}

interface FormIssueInsight {
  issue: string;
  frequency: number;
  affectedExercises: string[];
  tip: string;
}

interface WeeklyChange {
  metric: string;
  value: number;
  change: number;
  unit: string;
  icon: string;
  color: string;
}

export const CoachInsightsCard: React.FC<CoachInsightsCardProps> = ({
  history,
  exercises,
  onSelectWorkout,
  onSelectExercise,
}) => {
  // Analyze muscle balance
  const getMuscleBalance = (): MuscleBalance[] => {
    const muscleData: Record<string, { workouts: number; totalScore: number }> = {};
    const allMuscles = [
      'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
      'Quads', 'Hamstrings', 'Glutes', 'Core', 'Calves'
    ];

    // Initialize all muscles
    allMuscles.forEach(muscle => {
      muscleData[muscle] = { workouts: 0, totalScore: 0 };
    });

    // Count workouts per muscle from history
    history.forEach(entry => {
      const exercise = exercises.find(e => e.id === entry.exerciseId);
      if (exercise) {
        const muscle = exercise.primaryMuscle;
        const normalizedMuscle = allMuscles.find(m =>
          muscle.toLowerCase().includes(m.toLowerCase())
        ) || 'Core';

        if (muscleData[normalizedMuscle]) {
          muscleData[normalizedMuscle].workouts++;
          muscleData[normalizedMuscle].totalScore += entry.aiScore;
        }
      }
    });

    const maxWorkouts = Math.max(...Object.values(muscleData).map(m => m.workouts), 1);

    return allMuscles.map(muscle => {
      const data = muscleData[muscle];
      const avgScore = data.workouts > 0 ? Math.round(data.totalScore / data.workouts) : 0;
      const ratio = data.workouts / maxWorkouts;

      let status: MuscleBalance['status'];
      let recommendation: string | undefined;

      if (data.workouts === 0) {
        status = 'neglected';
        recommendation = `Add ${muscle.toLowerCase()} exercises to your routine`;
      } else if (ratio < 0.3) {
        status = 'weak';
        recommendation = `Train ${muscle.toLowerCase()} more frequently`;
      } else if (avgScore >= 85) {
        status = 'strong';
      } else {
        status = 'balanced';
      }

      return {
        muscle,
        workouts: data.workouts,
        avgScore,
        status,
        recommendation,
      };
    });
  };

  // Get suggested workouts based on weak areas
  const getSuggestedWorkouts = (): { type: string; reason: string; icon: string }[] => {
    const muscleBalance = getMuscleBalance();
    const suggestions: { type: string; reason: string; icon: string }[] = [];

    const weakMuscles = muscleBalance.filter(m => m.status === 'weak' || m.status === 'neglected');

    if (weakMuscles.some(m => ['Chest', 'Shoulders', 'Triceps'].includes(m.muscle))) {
      suggestions.push({
        type: 'Push Day',
        reason: 'Strengthen chest, shoulders & triceps',
        icon: 'hand-left',
      });
    }

    if (weakMuscles.some(m => ['Back', 'Biceps'].includes(m.muscle))) {
      suggestions.push({
        type: 'Pull Day',
        reason: 'Build back and bicep strength',
        icon: 'hand-right',
      });
    }

    if (weakMuscles.some(m => ['Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(m.muscle))) {
      suggestions.push({
        type: 'Leg Day',
        reason: 'Don\'t skip leg day!',
        icon: 'footsteps',
      });
    }

    if (weakMuscles.some(m => m.muscle === 'Core')) {
      suggestions.push({
        type: 'Core Focus',
        reason: 'Improve stability and posture',
        icon: 'body',
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'Full Body',
        reason: 'Maintain your balanced progress',
        icon: 'fitness',
      });
    }

    return suggestions.slice(0, 3);
  };

  // Analyze common form issues
  const getFormIssues = (): FormIssueInsight[] => {
    // This would normally come from AI analysis
    // For now, generate based on low scores
    const lowScoreExercises = history.filter(h => h.formScore < 80);
    const issues: FormIssueInsight[] = [];

    const exerciseMap = new Map<string, number[]>();
    lowScoreExercises.forEach(h => {
      const scores = exerciseMap.get(h.exerciseName) || [];
      scores.push(h.formScore);
      exerciseMap.set(h.exerciseName, scores);
    });

    exerciseMap.forEach((scores, exerciseName) => {
      if (scores.length >= 2) {
        const exercise = exercises.find(e => e.name === exerciseName);
        if (exercise && exercise.commonMistakes.length > 0) {
          issues.push({
            issue: exercise.commonMistakes[0],
            frequency: scores.length,
            affectedExercises: [exerciseName],
            tip: exercise.formTips[0] || 'Focus on form over weight',
          });
        }
      }
    });

    return issues.slice(0, 3);
  };

  // Get weekly performance changes
  const getWeeklyChanges = (): WeeklyChange[] => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = history.filter(h => new Date(h.date) >= weekAgo);
    const lastWeek = history.filter(h => {
      const date = new Date(h.date);
      return date >= twoWeeksAgo && date < weekAgo;
    });

    const thisWeekScore = thisWeek.length > 0
      ? Math.round(thisWeek.reduce((sum, h) => sum + h.aiScore, 0) / thisWeek.length)
      : 0;
    const lastWeekScore = lastWeek.length > 0
      ? Math.round(lastWeek.reduce((sum, h) => sum + h.aiScore, 0) / lastWeek.length)
      : 0;

    const thisWeekVolume = thisWeek.reduce((sum, h) => sum + (h.weight || 0) * h.reps, 0);
    const lastWeekVolume = lastWeek.reduce((sum, h) => sum + (h.weight || 0) * h.reps, 0);

    const thisWeekCalories = thisWeek.reduce((sum, h) => sum + h.calories, 0);
    const lastWeekCalories = lastWeek.reduce((sum, h) => sum + h.calories, 0);

    return [
      {
        metric: 'Avg Score',
        value: thisWeekScore,
        change: thisWeekScore - lastWeekScore,
        unit: '',
        icon: 'star',
        color: colors.accent.yellow,
      },
      {
        metric: 'Volume',
        value: thisWeekVolume,
        change: lastWeekVolume > 0 ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100) : 0,
        unit: '%',
        icon: 'barbell',
        color: colors.secondary,
      },
      {
        metric: 'Calories',
        value: thisWeekCalories,
        change: thisWeekCalories - lastWeekCalories,
        unit: '',
        icon: 'flame',
        color: colors.accent.orange,
      },
    ];
  };

  const muscleBalance = getMuscleBalance();
  const suggestedWorkouts = getSuggestedWorkouts();
  const formIssues = getFormIssues();
  const weeklyChanges = getWeeklyChanges();

  const weakMuscles = muscleBalance.filter(m => m.status === 'weak' || m.status === 'neglected');
  const strongMuscles = muscleBalance.filter(m => m.status === 'strong');

  const getStatusColor = (status: MuscleBalance['status']): string => {
    switch (status) {
      case 'strong': return colors.success;
      case 'balanced': return colors.primary;
      case 'weak': return colors.warning;
      case 'neglected': return colors.error;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primaryGlow, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Coach Insights</Text>
            <Text style={styles.headerSubtitle}>Personalized recommendations</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Weekly Changes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week vs Last Week</Text>
        <View style={styles.changesRow}>
          {weeklyChanges.map((change, index) => (
            <View key={index} style={styles.changeItem}>
              <View style={[styles.changeIcon, { backgroundColor: `${change.color}20` }]}>
                <Ionicons name={change.icon as any} size={16} color={change.color} />
              </View>
              <Text style={styles.changeValue}>
                {change.value >= 1000 ? `${(change.value / 1000).toFixed(1)}k` : change.value}
              </Text>
              <View style={[
                styles.changeBadge,
                { backgroundColor: change.change >= 0 ? colors.successBg : colors.errorBg }
              ]}>
                <Ionicons
                  name={change.change >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={10}
                  color={change.change >= 0 ? colors.success : colors.error}
                />
                <Text style={[
                  styles.changeText,
                  { color: change.change >= 0 ? colors.success : colors.error }
                ]}>
                  {Math.abs(change.change)}{change.unit}
                </Text>
              </View>
              <Text style={styles.changeLabel}>{change.metric}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Muscle Balance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muscle Balance</Text>

        {weakMuscles.length > 0 && (
          <View style={styles.muscleAlert}>
            <Ionicons name="alert-circle" size={16} color={colors.warning} />
            <Text style={styles.muscleAlertText}>
              {weakMuscles.length} muscle group{weakMuscles.length > 1 ? 's' : ''} need{weakMuscles.length === 1 ? 's' : ''} attention
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.muscleList}
        >
          {muscleBalance.map((muscle, index) => (
            <View
              key={index}
              style={[
                styles.muscleChip,
                { borderColor: getStatusColor(muscle.status) }
              ]}
            >
              <View style={[styles.muscleIndicator, { backgroundColor: getStatusColor(muscle.status) }]} />
              <Text style={styles.muscleName}>{muscle.muscle}</Text>
              <Text style={[styles.muscleStatus, { color: getStatusColor(muscle.status) }]}>
                {muscle.workouts}x
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Suggested Workouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested Next Workout</Text>
        <View style={styles.suggestionsList}>
          {suggestedWorkouts.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionCard}
              onPress={() => onSelectWorkout?.(suggestion.type)}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name={suggestion.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.suggestionText}>
                <Text style={styles.suggestionTitle}>{suggestion.type}</Text>
                <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Form Issues */}
      {formIssues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Form Focus Areas</Text>
          {formIssues.map((issue, index) => (
            <View key={index} style={styles.issueCard}>
              <View style={styles.issueHeader}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={styles.issueTitle}>{issue.issue}</Text>
              </View>
              <Text style={styles.issueTip}>
                <Text style={styles.tipLabel}>Tip: </Text>
                {issue.tip}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Strong Points */}
      {strongMuscles.length > 0 && (
        <View style={styles.section}>
          <View style={styles.strongHeader}>
            <Ionicons name="trophy" size={16} color={colors.accent.yellow} />
            <Text style={styles.sectionTitle}>Your Strengths</Text>
          </View>
          <Text style={styles.strongText}>
            Great form on {strongMuscles.map(m => m.muscle.toLowerCase()).join(', ')} exercises!
            Keep up the excellent work.
          </Text>
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
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  changesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  changeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
  },
  changeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  changeValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
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
  changeLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  muscleAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  muscleAlertText: {
    fontSize: typography.size.sm,
    color: colors.warning,
    fontWeight: typography.weight.medium,
  },
  muscleList: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  muscleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  muscleName: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  muscleStatus: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  suggestionReason: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  issueCard: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  issueTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.warning,
    flex: 1,
  },
  issueTip: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tipLabel: {
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  strongHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  strongText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default CoachInsightsCard;
