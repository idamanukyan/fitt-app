/**
 * InsightCard - AI Coach Insight display component
 * Shows individual insights with category icons and action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { CoachInsight } from '../../types/insights.types';

interface InsightCardProps {
  insight: CoachInsight;
  onPress?: () => void;
  onAction?: () => void;
  onDismiss?: () => void;
  variant?: 'full' | 'compact';
  style?: object;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onPress,
  onAction,
  onDismiss,
  variant = 'full',
  style,
}) => {
  const getPriorityColor = (): string => {
    switch (insight.priority) {
      case 'critical':
        return colors.error;
      case 'high':
        return colors.accent.orange;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.textMuted;
    }
  };

  const priorityColor = getPriorityColor();

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
      >
        <View
          style={[
            styles.compactIconBg,
            { backgroundColor: `${insight.iconColor}20` },
          ]}
        >
          <Ionicons
            name={insight.icon as any}
            size={18}
            color={insight.iconColor}
          />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {insight.title}
          </Text>
          <Text style={styles.compactDescription} numberOfLines={1}>
            {insight.description}
          </Text>
        </View>
        {!insight.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[`${insight.iconColor}15`, `${insight.iconColor}05`]}
        style={styles.gradient}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

        {/* Header Row */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${insight.iconColor}20` },
            ]}
          >
            <Ionicons
              name={insight.icon as any}
              size={24}
              color={insight.iconColor}
            />
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{insight.title}</Text>
              {!insight.isRead && <View style={styles.unreadBadge} />}
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.category, { color: priorityColor }]}>
                {insight.priority.toUpperCase()}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.category}>{insight.category}</Text>
            </View>
          </View>

          {onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description}>{insight.description}</Text>

        {/* Detailed Explanation (if expanded or available) */}
        {insight.detailedExplanation && (
          <Text style={styles.explanation}>{insight.detailedExplanation}</Text>
        )}

        {/* Related Data */}
        {insight.relatedData && (
          <View style={styles.relatedData}>
            {insight.relatedData.exerciseName && (
              <View style={styles.dataChip}>
                <Ionicons name="barbell" size={12} color={colors.textSecondary} />
                <Text style={styles.dataChipText}>
                  {insight.relatedData.exerciseName}
                </Text>
              </View>
            )}
            {insight.relatedData.muscleGroup && (
              <View style={styles.dataChip}>
                <Ionicons name="body" size={12} color={colors.textSecondary} />
                <Text style={styles.dataChipText}>
                  {insight.relatedData.muscleGroup}
                </Text>
              </View>
            )}
            {insight.relatedData.currentValue !== undefined && (
              <View style={styles.dataChip}>
                <Ionicons
                  name={
                    insight.relatedData.trendDirection === 'up'
                      ? 'trending-up'
                      : insight.relatedData.trendDirection === 'down'
                      ? 'trending-down'
                      : 'remove'
                  }
                  size={12}
                  color={
                    insight.relatedData.trendDirection === 'up'
                      ? colors.success
                      : insight.relatedData.trendDirection === 'down'
                      ? colors.error
                      : colors.textSecondary
                  }
                />
                <Text style={styles.dataChipText}>
                  {insight.relatedData.currentValue}
                  {insight.relatedData.unit}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        {insight.actionLabel && onAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <Text style={[styles.actionText, { color: insight.iconColor }]}>
              {insight.actionLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={insight.iconColor}
            />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Insight List component for displaying multiple insights
interface InsightListProps {
  insights: CoachInsight[];
  onInsightPress?: (insight: CoachInsight) => void;
  onInsightAction?: (insight: CoachInsight) => void;
  onInsightDismiss?: (insight: CoachInsight) => void;
  maxItems?: number;
  variant?: 'full' | 'compact';
  style?: object;
}

export const InsightList: React.FC<InsightListProps> = ({
  insights,
  onInsightPress,
  onInsightAction,
  onInsightDismiss,
  maxItems,
  variant = 'full',
  style,
}) => {
  const displayInsights = maxItems ? insights.slice(0, maxItems) : insights;

  if (displayInsights.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Ionicons name="checkmark-circle" size={32} color={colors.success} />
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>No new insights at this time.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.listContainer, style]}>
      {displayInsights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          variant={variant}
          onPress={onInsightPress ? () => onInsightPress(insight) : undefined}
          onAction={onInsightAction ? () => onInsightAction(insight) : undefined}
          onDismiss={onInsightDismiss ? () => onInsightDismiss(insight) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  gradient: {
    padding: spacing.lg,
    position: 'relative',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  category: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  separator: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  explanation: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  relatedData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dataChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  dataChipText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  actionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  compactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  compactDescription: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },

  // List container
  listContainer: {
    gap: spacing.md,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  emptyTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default InsightCard;
