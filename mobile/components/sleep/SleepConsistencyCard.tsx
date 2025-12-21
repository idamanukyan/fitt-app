/**
 * SleepConsistencyCard - Sleep Regularity Index (SRI) Display
 *
 * Features:
 * - SRI score display with gauge
 * - Bedtime/wake time consistency
 * - Social jet lag indicator
 * - Most/least consistent day
 * - Actionable recommendations
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';
import type { SleepRegularityMetrics } from '../../types/sleep.types';

interface SleepConsistencyCardProps {
  metrics: SleepRegularityMetrics;
  compact?: boolean;
}

const GAUGE_SIZE = 120;
const GAUGE_STROKE = 12;

export const SleepConsistencyCard: React.FC<SleepConsistencyCardProps> = ({
  metrics,
  compact = false,
}) => {
  const {
    sri_score,
    bedtime_consistency_score,
    wake_time_consistency_score,
    avg_bedtime,
    avg_wake_time,
    most_consistent_day,
    least_consistent_day,
    social_jet_lag_minutes,
  } = metrics;

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.primary;
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  // Get score label
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  // Calculate gauge arc
  const gaugeArc = useMemo(() => {
    const radius = (GAUGE_SIZE - GAUGE_STROKE) / 2;
    const centerX = GAUGE_SIZE / 2;
    const centerY = GAUGE_SIZE / 2;

    // Arc from -135 degrees to +135 degrees (270 degree total)
    const startAngle = -135;
    const endAngle = 135;
    const totalAngle = endAngle - startAngle;

    // Calculate progress angle
    const progressAngle = startAngle + (sri_score / 100) * totalAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const progressRad = (progressAngle * Math.PI) / 180;

    // Calculate arc path
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    const progressX = centerX + radius * Math.cos(progressRad);
    const progressY = centerY + radius * Math.sin(progressRad);

    // Large arc flag
    const largeArc = totalAngle > 180 ? 1 : 0;
    const progressLargeArc = (sri_score / 100) * totalAngle > 180 ? 1 : 0;

    const backgroundPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
    const progressPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${progressLargeArc} 1 ${progressX} ${progressY}`;

    return { backgroundPath, progressPath };
  }, [sri_score]);

  // Format social jet lag
  const formatJetLag = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get jet lag status
  const getJetLagStatus = (minutes: number): { color: string; label: string } => {
    if (minutes < 30) return { color: colors.success, label: 'Low' };
    if (minutes < 60) return { color: colors.warning, label: 'Moderate' };
    return { color: colors.error, label: 'High' };
  };

  const jetLagStatus = getJetLagStatus(social_jet_lag_minutes);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <View style={[styles.compactIcon, { backgroundColor: colors.secondarySubtle }]}>
            <Ionicons name="pulse" size={16} color={colors.secondary} />
          </View>
          <Text style={styles.compactTitle}>Sleep Regularity</Text>
        </View>
        <View style={styles.compactScore}>
          <Text style={[styles.compactScoreValue, { color: getScoreColor(sri_score) }]}>
            {sri_score}
          </Text>
          <Text style={styles.compactScoreLabel}>/100</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="pulse" size={20} color={colors.secondary} />
          <Text style={styles.title}>Sleep Regularity Index</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${getScoreColor(sri_score)}20` }]}>
          <Text style={[styles.badgeText, { color: getScoreColor(sri_score) }]}>
            {getScoreLabel(sri_score)}
          </Text>
        </View>
      </View>

      {/* Gauge */}
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE * 0.7}>
          {/* Background arc */}
          <Path
            d={gaugeArc.backgroundPath}
            stroke={colors.glassLight}
            strokeWidth={GAUGE_STROKE}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <Path
            d={gaugeArc.progressPath}
            stroke={getScoreColor(sri_score)}
            strokeWidth={GAUGE_STROKE}
            fill="transparent"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.gaugeCenter}>
          <Text style={[styles.gaugeScore, { color: getScoreColor(sri_score) }]}>
            {sri_score}
          </Text>
          <Text style={styles.gaugeLabel}>SRI Score</Text>
        </View>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        {/* Bedtime consistency */}
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <Ionicons name="moon-outline" size={16} color={colors.primary} />
            <Text style={styles.breakdownLabel}>Bedtime</Text>
          </View>
          <View style={styles.breakdownValue}>
            <Text style={styles.breakdownScore}>{bedtime_consistency_score}%</Text>
            <Text style={styles.breakdownAvg}>avg {avg_bedtime}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${bedtime_consistency_score}%`,
                  backgroundColor: getScoreColor(bedtime_consistency_score),
                },
              ]}
            />
          </View>
        </View>

        {/* Wake time consistency */}
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <Ionicons name="sunny-outline" size={16} color={colors.warning} />
            <Text style={styles.breakdownLabel}>Wake Time</Text>
          </View>
          <View style={styles.breakdownValue}>
            <Text style={styles.breakdownScore}>{wake_time_consistency_score}%</Text>
            <Text style={styles.breakdownAvg}>avg {avg_wake_time}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${wake_time_consistency_score}%`,
                  backgroundColor: getScoreColor(wake_time_consistency_score),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Social jet lag */}
      <View style={styles.jetLag}>
        <View style={styles.jetLagLeft}>
          <Ionicons name="airplane-outline" size={16} color={colors.textMuted} />
          <Text style={styles.jetLagLabel}>Social Jet Lag</Text>
        </View>
        <View style={styles.jetLagRight}>
          <Text style={[styles.jetLagValue, { color: jetLagStatus.color }]}>
            {formatJetLag(social_jet_lag_minutes)}
          </Text>
          <View style={[styles.jetLagBadge, { backgroundColor: `${jetLagStatus.color}20` }]}>
            <Text style={[styles.jetLagBadgeText, { color: jetLagStatus.color }]}>
              {jetLagStatus.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Consistency days */}
      {(most_consistent_day || least_consistent_day) && (
        <View style={styles.consistencyDays}>
          {most_consistent_day && (
            <View style={styles.consistencyDayItem}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.consistencyDayText}>
                Most consistent: <Text style={styles.consistencyDayValue}>{most_consistent_day}</Text>
              </Text>
            </View>
          )}
          {least_consistent_day && (
            <View style={styles.consistencyDayItem}>
              <Ionicons name="alert-circle" size={14} color={colors.warning} />
              <Text style={styles.consistencyDayText}>
                Least consistent: <Text style={styles.consistencyDayValue}>{least_consistent_day}</Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Recommendation */}
      {sri_score < 70 && (
        <View style={styles.recommendation}>
          <Ionicons name="bulb-outline" size={16} color={colors.warning} />
          <Text style={styles.recommendationText}>
            {sri_score < 50
              ? 'Try going to bed and waking up at the same time every day, even on weekends.'
              : 'You\'re doing well! A bit more consistency on weekends could improve your score.'}
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
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gaugeCenter: {
    position: 'absolute',
    top: GAUGE_SIZE * 0.25,
    alignItems: 'center',
  },
  gaugeScore: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
  },
  gaugeLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  breakdown: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  breakdownItem: {},
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  breakdownValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownScore: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  breakdownAvg: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glassLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  jetLag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  jetLagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jetLagLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  jetLagRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  jetLagValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
  },
  jetLagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  jetLagBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  consistencyDays: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  consistencyDayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  consistencyDayText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  consistencyDayValue: {
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  compactScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactScoreValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  compactScoreLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});

export default SleepConsistencyCard;
