/**
 * CoachInsightsTab - Full Coach Insights tab content
 * Displays AI-powered insights, correlations, and recommendations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import { InsightCard, InsightList } from './InsightCard';
import { MuscleBalanceChart, MuscleBalanceSummary } from './MuscleBalanceChart';
import { WeeklyComparisonCard } from './WeeklyComparisonCard';
import { FormAnalysisCard } from './FormIssueCard';
import { WorkoutSuggestionCard, WorkoutSuggestionList } from './WorkoutSuggestionCard';
import type {
  CoachInsightsDashboard,
  CoachInsight,
  CorrelationAnalysis,
  WorkoutRecommendation,
} from '../../types/insights.types';

interface CoachInsightsTabProps {
  dashboard: CoachInsightsDashboard;
  onRefresh?: () => Promise<void>;
  onInsightPress?: (insight: CoachInsight) => void;
  onInsightAction?: (insight: CoachInsight) => void;
  onCorrelationPress?: (correlation: CorrelationAnalysis) => void;
  onStartWorkout?: (recommendation: WorkoutRecommendation) => void;
  onViewAllInsights?: () => void;
  onViewAllRecommendations?: () => void;
  style?: object;
}

export const CoachInsightsTab: React.FC<CoachInsightsTabProps> = ({
  dashboard,
  onRefresh,
  onInsightPress,
  onInsightAction,
  onCorrelationPress,
  onStartWorkout,
  onViewAllInsights,
  onViewAllRecommendations,
  style,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const activeInsights = dashboard.insights.filter((i) => !i.isDismissed);
  const highPriorityInsights = activeInsights.filter(
    (i) => i.priority === 'high' || i.priority === 'critical'
  );

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Overall Score Card */}
      <View style={styles.scoreCard}>
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.15)', 'rgba(74, 222, 128, 0.05)']}
          style={styles.scoreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.scoreContent}>
            <View style={styles.scoreLeft}>
              <Text style={styles.scoreLabel}>Training Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>{dashboard.overallScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.trendBadge}>
                <Ionicons
                  name={
                    dashboard.scoreTrend === 'improving'
                      ? 'trending-up'
                      : dashboard.scoreTrend === 'declining'
                      ? 'trending-down'
                      : 'remove'
                  }
                  size={14}
                  color={
                    dashboard.scoreTrend === 'improving'
                      ? colors.success
                      : dashboard.scoreTrend === 'declining'
                      ? colors.error
                      : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.trendText,
                    {
                      color:
                        dashboard.scoreTrend === 'improving'
                          ? colors.success
                          : dashboard.scoreTrend === 'declining'
                          ? colors.error
                          : colors.textMuted,
                    },
                  ]}
                >
                  {dashboard.scoreChange > 0 ? '+' : ''}
                  {dashboard.scoreChange} this week
                </Text>
              </View>
            </View>
            <View style={styles.scoreRight}>
              <View style={styles.scoreBadges}>
                {dashboard.criticalCount > 0 && (
                  <View style={styles.alertBadge}>
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color={colors.error}
                    />
                    <Text style={styles.alertText}>
                      {dashboard.criticalCount} alert
                      {dashboard.criticalCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {dashboard.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {dashboard.unreadCount} new
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* High Priority Insights */}
      {highPriorityInsights.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.sectionTitle}>Needs Attention</Text>
            </View>
          </View>
          <InsightList
            insights={highPriorityInsights.slice(0, 2)}
            onInsightPress={onInsightPress}
            onInsightAction={onInsightAction}
          />
        </View>
      )}

      {/* Weekly Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>This Week</Text>
          </View>
        </View>
        <WeeklyComparisonCard summary={dashboard.weeklySummary} />
      </View>

      {/* Muscle Balance */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('balance')}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name="analytics" size={18} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Muscle Balance</Text>
          </View>
          <Ionicons
            name={expandedSection === 'balance' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
        {expandedSection === 'balance' ? (
          <MuscleBalanceChart data={dashboard.muscleBalance} variant="bar" />
        ) : (
          <MuscleBalanceSummary
            data={dashboard.muscleBalance}
            onPress={() => toggleSection('balance')}
          />
        )}
      </View>

      {/* Form Analysis */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('form')}
        >
          <View style={styles.sectionTitleRow}>
            <Ionicons name="body" size={18} color={colors.success} />
            <Text style={styles.sectionTitle}>Form Analysis</Text>
          </View>
          <Ionicons
            name={expandedSection === 'form' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
        <FormAnalysisCard
          summary={dashboard.formSummary}
          variant={expandedSection === 'form' ? 'full' : 'compact'}
          onViewAll={() => toggleSection('form')}
        />
      </View>

      {/* Correlations */}
      {dashboard.topCorrelations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="git-branch" size={18} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Key Correlations</Text>
            </View>
          </View>
          {dashboard.topCorrelations.map((correlation) => (
            <CorrelationCard
              key={correlation.id}
              correlation={correlation}
              onPress={
                onCorrelationPress
                  ? () => onCorrelationPress(correlation)
                  : undefined
              }
            />
          ))}
        </View>
      )}

      {/* Workout Recommendations */}
      {dashboard.workoutRecommendations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="fitness" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Recommended Workouts</Text>
            </View>
            {onViewAllRecommendations && dashboard.workoutRecommendations.length > 2 && (
              <TouchableOpacity onPress={onViewAllRecommendations}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          <WorkoutSuggestionList
            recommendations={dashboard.workoutRecommendations.slice(0, 2)}
            onStartWorkout={onStartWorkout}
          />
        </View>
      )}

      {/* All Insights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="bulb" size={18} color={colors.warning} />
            <Text style={styles.sectionTitle}>All Insights</Text>
            {activeInsights.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{activeInsights.length}</Text>
              </View>
            )}
          </View>
          {onViewAllInsights && activeInsights.length > 3 && (
            <TouchableOpacity onPress={onViewAllInsights}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        <InsightList
          insights={activeInsights.slice(0, 3)}
          onInsightPress={onInsightPress}
          onInsightAction={onInsightAction}
          variant="compact"
        />
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

// Correlation Card Component
interface CorrelationCardProps {
  correlation: CorrelationAnalysis;
  onPress?: () => void;
  style?: object;
}

const CorrelationCard: React.FC<CorrelationCardProps> = ({
  correlation,
  onPress,
  style,
}) => {
  const getStrengthColor = (): string => {
    switch (correlation.strength) {
      case 'very_strong':
        return colors.success;
      case 'strong':
        return colors.primary;
      case 'moderate':
        return colors.warning;
      case 'weak':
        return colors.textMuted;
      default:
        return colors.textMuted;
    }
  };

  const strengthColor = getStrengthColor();

  return (
    <TouchableOpacity
      style={[styles.correlationContainer, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.correlationHeader}>
        <View style={styles.correlationTitleRow}>
          <View
            style={[
              styles.strengthIndicator,
              { backgroundColor: strengthColor },
            ]}
          />
          <Text style={styles.correlationTitle}>{correlation.title}</Text>
        </View>
        <View
          style={[
            styles.strengthBadge,
            { backgroundColor: `${strengthColor}20` },
          ]}
        >
          <Text style={[styles.strengthText, { color: strengthColor }]}>
            {correlation.strength.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <Text style={styles.correlationDescription}>
        {correlation.description}
      </Text>

      <View style={styles.correlationInsight}>
        <Ionicons name="bulb" size={14} color={colors.warning} />
        <Text style={styles.correlationInsightText}>{correlation.insight}</Text>
      </View>

      <View style={styles.correlationMeta}>
        <Text style={styles.correlationMetaText}>
          {correlation.dataPoints} data points • {correlation.period} •{' '}
          {Math.round(correlation.confidence * 100)}% confidence
        </Text>
      </View>

      {onPress && (
        <View style={styles.correlationAction}>
          <Text style={styles.correlationActionText}>View Chart</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scoreCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  scoreGradient: {
    padding: spacing.lg,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLeft: {},
  scoreLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  scoreMax: {
    fontSize: typography.size.lg,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  trendText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  scoreRight: {},
  scoreBadges: {
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  alertText: {
    fontSize: typography.size.xs,
    color: colors.error,
    fontWeight: typography.weight.medium,
  },
  unreadBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  unreadText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  countBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  countText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.semiBold,
  },

  // Correlation card
  correlationContainer: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  correlationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  correlationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  strengthIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  correlationTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  strengthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    textTransform: 'capitalize',
  },
  correlationDescription: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  correlationInsight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  correlationInsightText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: colors.warning,
    lineHeight: 16,
  },
  correlationMeta: {
    marginBottom: spacing.sm,
  },
  correlationMetaText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  correlationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  correlationActionText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
});

export default CoachInsightsTab;
