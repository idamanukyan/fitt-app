/**
 * FormIssueCard - Form analysis issue display
 * Shows common form issues with tips for improvement
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { FormAnalysisSummary, FormIssue, FormImprovement } from '../../types/insights.types';

interface FormIssueCardProps {
  issue: FormIssue;
  onPress?: () => void;
  style?: object;
}

export const FormIssueCard: React.FC<FormIssueCardProps> = ({
  issue,
  onPress,
  style,
}) => {
  const getSeverityColor = (): string => {
    switch (issue.severity) {
      case 'major':
        return colors.error;
      case 'moderate':
        return colors.warning;
      case 'minor':
        return colors.info;
      default:
        return colors.textMuted;
    }
  };

  const severityColor = getSeverityColor();

  return (
    <TouchableOpacity
      style={[styles.issueContainer, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      {/* Severity indicator */}
      <View style={[styles.severityBar, { backgroundColor: severityColor }]} />

      <View style={styles.issueContent}>
        {/* Header */}
        <View style={styles.issueHeader}>
          <View style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}>
            <Text style={[styles.severityText, { color: severityColor }]}>
              {issue.severity.toUpperCase()}
            </Text>
          </View>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>{issue.frequency}x</Text>
          </View>
        </View>

        {/* Issue Description */}
        <Text style={styles.issueTitle}>{issue.issue}</Text>

        {/* Affected Exercises */}
        <View style={styles.exerciseList}>
          {issue.affectedExercises.slice(0, 3).map((exercise, index) => (
            <View key={index} style={styles.exerciseChip}>
              <Text style={styles.exerciseChipText}>{exercise}</Text>
            </View>
          ))}
          {issue.affectedExercises.length > 3 && (
            <Text style={styles.moreExercises}>
              +{issue.affectedExercises.length - 3} more
            </Text>
          )}
        </View>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Ionicons name="bulb" size={14} color={colors.warning} />
          <Text style={styles.tipText}>{issue.tip}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Form Improvement Card
interface FormImprovementCardProps {
  improvement: FormImprovement;
  style?: object;
}

export const FormImprovementCard: React.FC<FormImprovementCardProps> = ({
  improvement,
  style,
}) => (
  <View style={[styles.improvementContainer, style]}>
    <View style={styles.improvementHeader}>
      <Ionicons name="trending-up" size={16} color={colors.success} />
      <Text style={styles.improvementTitle}>{improvement.area}</Text>
    </View>
    <View style={styles.improvementScores}>
      <Text style={styles.previousScore}>{improvement.previousScore}%</Text>
      <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
      <Text style={styles.currentScore}>{improvement.currentScore}%</Text>
      <View style={styles.improvementBadge}>
        <Text style={styles.improvementBadgeText}>+{improvement.improvement}</Text>
      </View>
    </View>
  </View>
);

// Full Form Analysis Summary Card
interface FormAnalysisCardProps {
  summary: FormAnalysisSummary;
  onIssuePress?: (issue: FormIssue) => void;
  onViewAll?: () => void;
  variant?: 'full' | 'compact';
  style?: object;
}

export const FormAnalysisCard: React.FC<FormAnalysisCardProps> = ({
  summary,
  onIssuePress,
  onViewAll,
  variant = 'full',
  style,
}) => {
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onViewAll}
        activeOpacity={onViewAll ? 0.8 : 1}
        disabled={!onViewAll}
      >
        <View style={styles.compactHeader}>
          <View style={[styles.compactIconBg, { backgroundColor: colors.successBg }]}>
            <Ionicons name="body" size={18} color={colors.success} />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle}>Form Score</Text>
            <Text style={styles.compactSubtitle}>
              {summary.totalAISessions} AI sessions
            </Text>
          </View>
          <View style={styles.compactScore}>
            <Text style={styles.compactScoreValue}>{summary.avgScore}%</Text>
            {summary.scoreChange !== 0 && (
              <View
                style={[
                  styles.compactChangeBadge,
                  {
                    backgroundColor:
                      summary.scoreChange > 0 ? colors.successBg : colors.errorBg,
                  },
                ]}
              >
                <Ionicons
                  name={summary.scoreChange > 0 ? 'trending-up' : 'trending-down'}
                  size={10}
                  color={summary.scoreChange > 0 ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.compactChangeText,
                    { color: summary.scoreChange > 0 ? colors.success : colors.error },
                  ]}
                >
                  {summary.scoreChange > 0 ? '+' : ''}
                  {summary.scoreChange}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Mini issues preview */}
        {summary.commonIssues.length > 0 && (
          <View style={styles.compactIssues}>
            <Ionicons name="warning" size={12} color={colors.warning} />
            <Text style={styles.compactIssuesText}>
              {summary.commonIssues.length} area
              {summary.commonIssues.length > 1 ? 's' : ''} need attention
            </Text>
          </View>
        )}

        {onViewAll && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textMuted}
            style={styles.compactChevron}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="body" size={20} color={colors.success} />
          <Text style={styles.title}>Form Analysis</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{summary.avgScore}%</Text>
            {summary.scoreChange !== 0 && (
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      summary.scoreChange > 0 ? colors.successBg : colors.errorBg,
                  },
                ]}
              >
                <Ionicons
                  name={summary.scoreChange > 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={summary.scoreChange > 0 ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: summary.scoreChange > 0 ? colors.success : colors.error },
                  ]}
                >
                  {summary.scoreChange > 0 ? '+' : ''}
                  {summary.scoreChange}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{summary.totalAISessions}</Text>
          <Text style={styles.statLabel}>AI Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{summary.commonIssues.length}</Text>
          <Text style={styles.statLabel}>Issues Found</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{summary.improvements.length}</Text>
          <Text style={styles.statLabel}>Improvements</Text>
        </View>
      </View>

      {/* Improvements Section */}
      {summary.improvements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Improvements</Text>
          <View style={styles.improvementsList}>
            {summary.improvements.slice(0, 3).map((improvement, index) => (
              <FormImprovementCard key={index} improvement={improvement} />
            ))}
          </View>
        </View>
      )}

      {/* Common Issues Section */}
      {summary.commonIssues.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Areas to Improve</Text>
            {onViewAll && summary.commonIssues.length > 2 && (
              <TouchableOpacity onPress={onViewAll}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          {summary.commonIssues.slice(0, 2).map((issue, index) => (
            <FormIssueCard
              key={index}
              issue={issue}
              onPress={onIssuePress ? () => onIssuePress(issue) : undefined}
            />
          ))}
        </View>
      )}

      {/* Exercises Needing Work */}
      {summary.exercisesNeedingWork.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Exercises</Text>
          {summary.exercisesNeedingWork.slice(0, 2).map((exercise, index) => (
            <View key={index} style={styles.focusExercise}>
              <View style={styles.focusHeader}>
                <Text style={styles.focusName}>{exercise.exerciseName}</Text>
                <View
                  style={[
                    styles.focusScoreBadge,
                    {
                      backgroundColor:
                        exercise.avgFormScore >= 80
                          ? colors.successBg
                          : exercise.avgFormScore >= 60
                          ? colors.warningBg
                          : colors.errorBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.focusScoreText,
                      {
                        color:
                          exercise.avgFormScore >= 80
                            ? colors.success
                            : exercise.avgFormScore >= 60
                            ? colors.warning
                            : colors.error,
                      },
                    ]}
                  >
                    {exercise.avgFormScore}%
                  </Text>
                </View>
              </View>
              <Text style={styles.focusIssues}>
                {exercise.commonIssues.join(' • ')}
              </Text>
              <Text style={styles.focusRec}>{exercise.recommendation}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  headerRight: {},
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  changeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.lg,
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
    backgroundColor: colors.glassBorder,
    marginVertical: spacing.xs,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  improvementsList: {
    gap: spacing.sm,
  },

  // Issue card
  issueContainer: {
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  severityBar: {
    width: 4,
  },
  issueContent: {
    flex: 1,
    padding: spacing.md,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  severityText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  frequencyBadge: {
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  frequencyText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  issueTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  exerciseChip: {
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  exerciseChipText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  moreExercises: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    alignSelf: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: colors.warning,
    lineHeight: 16,
  },

  // Improvement card
  improvementContainer: {
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  improvementTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  improvementScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previousScore: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  currentScore: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.success,
  },
  improvementBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: 'auto',
  },
  improvementBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },

  // Focus exercise
  focusExercise: {
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  focusName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  focusScoreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  focusScoreText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },
  focusIssues: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  focusRec: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Compact variant
  compactContainer: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  compactScore: {
    alignItems: 'flex-end',
  },
  compactScoreValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  compactChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm,
    marginTop: 2,
  },
  compactChangeText: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
  },
  compactIssues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  compactIssuesText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  compactChevron: {
    marginLeft: spacing.sm,
  },
});

export default FormIssueCard;
