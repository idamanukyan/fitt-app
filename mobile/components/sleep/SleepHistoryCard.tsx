/**
 * SleepHistoryCard - Elegant Sleep History Display
 * Clean UI for historical sleep entries with trends
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // minutes
  quality: number; // 1-5
  notes?: string;
}

interface SleepHistoryCardProps {
  entries: SleepEntry[];
  onSelectEntry?: (entry: SleepEntry) => void;
  onAddEntry?: () => void;
  averageDuration?: number;
  averageQuality?: number;
  streak?: number;
}

export const SleepHistoryCard: React.FC<SleepHistoryCardProps> = ({
  entries,
  onSelectEntry,
  onAddEntry,
  averageDuration = 0,
  averageQuality = 0,
  streak = 0,
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateStr: string): { day: string; weekday: string; month: string } => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 4) return colors.success;
    if (quality >= 3) return colors.primary;
    if (quality >= 2) return colors.warning;
    return colors.error;
  };

  const getQualityLabel = (quality: number): string => {
    if (quality >= 4.5) return 'Excellent';
    if (quality >= 3.5) return 'Good';
    if (quality >= 2.5) return 'Fair';
    if (quality >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  const getDurationStatus = (duration: number): { color: string; label: string } => {
    const hours = duration / 60;
    if (hours >= 7 && hours <= 9) {
      return { color: colors.success, label: 'Optimal' };
    }
    if (hours >= 6 && hours < 7) {
      return { color: colors.warning, label: 'Borderline' };
    }
    if (hours > 9 && hours <= 10) {
      return { color: colors.warning, label: 'Excessive' };
    }
    return { color: colors.error, label: 'Insufficient' };
  };

  const renderQualityDots = (quality: number) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.qualityDot,
            {
              backgroundColor: i <= quality ? getQualityColor(quality) : colors.glass,
              borderColor: i <= quality ? getQualityColor(quality) : colors.glassBorder,
            },
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="moon" size={20} color={colors.secondary} />
          <Text style={styles.headerTitle}>Sleep History</Text>
        </View>
        {onAddEntry && (
          <TouchableOpacity onPress={onAddEntry} style={styles.addButton}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.secondarySubtle }]}>
            <Ionicons name="time" size={16} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{formatDuration(averageDuration)}</Text>
            <Text style={styles.summaryLabel}>Avg Duration</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="star" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{averageQuality.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Avg Quality</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.accent.orangeGlow }]}>
            <Ionicons name="flame" size={16} color={colors.accent.orange} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{streak}</Text>
            <Text style={styles.summaryLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Entries List */}
      <ScrollView
        style={styles.entriesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.entriesContent}
      >
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No sleep entries yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking your sleep to see insights</Text>
            {onAddEntry && (
              <TouchableOpacity onPress={onAddEntry} style={styles.emptyButton}>
                <LinearGradient
                  colors={[colors.secondary, colors.secondaryDark]}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add" size={18} color={colors.white} />
                  <Text style={styles.emptyButtonText}>Add Sleep Entry</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          entries.map((entry, index) => {
            const dateInfo = formatDate(entry.date);
            const durationStatus = getDurationStatus(entry.duration);

            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => onSelectEntry?.(entry)}
                activeOpacity={0.7}
              >
                {/* Date Badge */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>{dateInfo.day}</Text>
                  <Text style={styles.dateWeekday}>{dateInfo.weekday}</Text>
                </View>

                {/* Entry Content */}
                <View style={styles.entryContent}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDuration}>{formatDuration(entry.duration)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${durationStatus.color}20` }]}>
                      <View style={[styles.statusDot, { backgroundColor: durationStatus.color }]} />
                      <Text style={[styles.statusText, { color: durationStatus.color }]}>
                        {durationStatus.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.entryTimes}>
                    <View style={styles.timeItem}>
                      <Ionicons name="bed" size={14} color={colors.textMuted} />
                      <Text style={styles.timeText}>{formatTime(entry.bedtime)}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
                    <View style={styles.timeItem}>
                      <Ionicons name="sunny" size={14} color={colors.textMuted} />
                      <Text style={styles.timeText}>{formatTime(entry.wakeTime)}</Text>
                    </View>
                  </View>

                  <View style={styles.entryQuality}>
                    <View style={styles.qualityDots}>{renderQualityDots(entry.quality)}</View>
                    <Text style={[styles.qualityLabel, { color: getQualityColor(entry.quality) }]}>
                      {getQualityLabel(entry.quality)}
                    </Text>
                  </View>
                </View>

                {/* Chevron */}
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.glassBorder,
    marginHorizontal: spacing.sm,
  },
  entriesList: {
    maxHeight: 400,
  },
  entriesContent: {
    gap: spacing.md,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
    lineHeight: 20,
  },
  dateWeekday: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  entryDuration: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  entryTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  entryQuality: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qualityDots: {
    flexDirection: 'row',
    gap: 4,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  qualityLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.white,
  },
});

export default SleepHistoryCard;
