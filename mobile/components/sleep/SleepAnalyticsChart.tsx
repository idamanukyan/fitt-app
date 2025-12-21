/**
 * SleepAnalyticsChart - Production-Ready Sleep Analytics Component
 *
 * Features:
 * - 7-day and 30-day view toggle
 * - Duration bar chart with goal line
 * - Optional quality overlay
 * - Animated transitions
 * - Touch interactions for day details
 * - Responsive design
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Rect,
  Line,
  Text as SvgText,
  G,
  Circle,
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';
import type { SleepAnalyticsData, SleepChartDataPoint } from '../../types/sleep.types';
import { formatDuration, getSleepStatusInfo } from '../../utils/sleepCalculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepAnalyticsChartProps {
  data7Day: SleepAnalyticsData;
  data30Day: SleepAnalyticsData;
  onDayPress?: (date: string) => void;
  showQualityOverlay?: boolean;
}

type ViewMode = '7day' | '30day';

const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 20, bottom: 40, left: 40, right: 16 };

export const SleepAnalyticsChart: React.FC<SleepAnalyticsChartProps> = ({
  data7Day,
  data30Day,
  onDayPress,
  showQualityOverlay = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('7day');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const data = viewMode === '7day' ? data7Day : data30Day;
  const entries = data.entries;

  // Calculate chart dimensions
  const chartWidth = SCREEN_WIDTH - spacing.xl * 2 - CHART_PADDING.left - CHART_PADDING.right;
  const barWidth = viewMode === '7day'
    ? (chartWidth / 7) - 8
    : (chartWidth / 30) - 2;
  const maxBarHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // Calculate scale
  const maxDuration = Math.max(
    10, // Minimum scale
    ...entries.filter(e => e.duration_hours !== null).map(e => e.duration_hours as number)
  );
  const scale = maxBarHeight / maxDuration;

  // Format day label
  const formatDayLabel = useCallback((date: string, index: number): string => {
    const d = new Date(date);
    if (viewMode === '7day') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    } else {
      // Show every 5th day for 30-day view
      if (index % 5 === 0) {
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }
      return '';
    }
  }, [viewMode]);

  // Get bar color based on status
  const getBarColor = useCallback((entry: SleepChartDataPoint): string => {
    if (entry.duration_hours === null) return 'transparent';
    const info = getSleepStatusInfo(entry.duration_hours);
    return info.color;
  }, []);

  // Handle bar press
  const handleBarPress = useCallback((index: number) => {
    const entry = entries[index];
    setSelectedDayIndex(selectedDayIndex === index ? null : index);
    if (entry.duration_hours !== null && onDayPress) {
      onDayPress(entry.date);
    }
  }, [entries, selectedDayIndex, onDayPress]);

  // Render chart bars
  const renderBars = useMemo(() => {
    return entries.map((entry, index) => {
      const barHeight = entry.duration_hours !== null
        ? Math.max(4, entry.duration_hours * scale)
        : 0;
      const x = CHART_PADDING.left + (index * (chartWidth / entries.length)) + (barWidth / 2);
      const y = CHART_HEIGHT - CHART_PADDING.bottom - barHeight;
      const isSelected = selectedDayIndex === index;

      return (
        <G key={entry.date}>
          {/* Bar */}
          {entry.duration_hours !== null && (
            <Rect
              x={x - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={viewMode === '7day' ? 4 : 2}
              fill={getBarColor(entry)}
              opacity={isSelected ? 1 : 0.8}
              onPress={() => handleBarPress(index)}
            />
          )}

          {/* No data indicator */}
          {entry.duration_hours === null && (
            <Circle
              cx={x}
              cy={CHART_HEIGHT - CHART_PADDING.bottom - 4}
              r={3}
              fill={colors.textMuted}
              opacity={0.5}
            />
          )}

          {/* Quality overlay dot */}
          {showQualityOverlay && entry.sleep_quality !== null && viewMode === '7day' && (
            <Circle
              cx={x}
              cy={y - 8}
              r={4}
              fill={colors.secondary}
              stroke={colors.bgCard}
              strokeWidth={2}
            />
          )}

          {/* X-axis label */}
          {viewMode === '7day' || index % 5 === 0 ? (
            <SvgText
              x={x}
              y={CHART_HEIGHT - CHART_PADDING.bottom + 16}
              textAnchor="middle"
              fontSize={10}
              fill={colors.textMuted}
            >
              {formatDayLabel(entry.date, index)}
            </SvgText>
          ) : null}
        </G>
      );
    });
  }, [entries, viewMode, scale, barWidth, chartWidth, selectedDayIndex, showQualityOverlay, getBarColor, handleBarPress, formatDayLabel]);

  // Y-axis labels
  const yAxisLabels = useMemo(() => {
    const labels = [0, Math.ceil(maxDuration / 2), Math.ceil(maxDuration)];
    return labels.map((value) => {
      const y = CHART_HEIGHT - CHART_PADDING.bottom - (value * scale);
      return (
        <G key={value}>
          <SvgText
            x={CHART_PADDING.left - 8}
            y={y + 4}
            textAnchor="end"
            fontSize={10}
            fill={colors.textMuted}
          >
            {value}h
          </SvgText>
          <Line
            x1={CHART_PADDING.left}
            y1={y}
            x2={CHART_PADDING.left + chartWidth}
            y2={y}
            stroke={colors.divider}
            strokeDasharray="4,4"
            strokeWidth={0.5}
          />
        </G>
      );
    });
  }, [maxDuration, scale, chartWidth]);

  // Goal line
  const goalLineY = CHART_HEIGHT - CHART_PADDING.bottom - (data.goal_target * scale);

  // Selected day info
  const selectedEntry = selectedDayIndex !== null ? entries[selectedDayIndex] : null;

  return (
    <View style={styles.container}>
      {/* Header with toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Duration</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === '7day' && styles.toggleButtonActive]}
            onPress={() => setViewMode('7day')}
          >
            <Text style={[styles.toggleText, viewMode === '7day' && styles.toggleTextActive]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === '30day' && styles.toggleButtonActive]}
            onPress={() => setViewMode('30day')}
          >
            <Text style={[styles.toggleText, viewMode === '30day' && styles.toggleTextActive]}>
              30 Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {data.avg_duration !== null ? formatDuration(data.avg_duration) : '--'}
          </Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.stat}>
          <View style={styles.trendContainer}>
            {data.trend && (
              <Ionicons
                name={data.trend === 'improving' ? 'trending-up' : data.trend === 'declining' ? 'trending-down' : 'remove'}
                size={16}
                color={data.trend === 'improving' ? colors.success : data.trend === 'declining' ? colors.error : colors.textMuted}
              />
            )}
            <Text style={[
              styles.statValue,
              data.trend === 'improving' && { color: colors.success },
              data.trend === 'declining' && { color: colors.error },
            ]}>
              {data.trend_percentage !== null ? `${data.trend_percentage > 0 ? '+' : ''}${data.trend_percentage}%` : '--'}
            </Text>
          </View>
          <Text style={styles.statLabel}>vs Previous</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {data.days_meeting_goal}/{entries.filter(e => e.duration_hours !== null).length}
          </Text>
          <Text style={styles.statLabel}>Goal Met</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <Svg
          width={SCREEN_WIDTH - spacing.xl * 2}
          height={CHART_HEIGHT}
        >
          <Defs>
            <SvgGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.5" />
            </SvgGradient>
          </Defs>

          {/* Y-axis labels and grid lines */}
          {yAxisLabels}

          {/* Goal line */}
          <Line
            x1={CHART_PADDING.left}
            y1={goalLineY}
            x2={CHART_PADDING.left + chartWidth}
            y2={goalLineY}
            stroke={colors.warning}
            strokeWidth={1.5}
            strokeDasharray="6,4"
          />
          <SvgText
            x={CHART_PADDING.left + chartWidth + 4}
            y={goalLineY + 4}
            fontSize={10}
            fill={colors.warning}
          >
            Goal
          </SvgText>

          {/* Bars */}
          {renderBars}
        </Svg>
      </View>

      {/* Selected day tooltip */}
      {selectedEntry && selectedEntry.duration_hours !== null && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>
            {new Date(selectedEntry.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <View style={styles.tooltipRow}>
            <Ionicons name="moon" size={14} color={colors.primary} />
            <Text style={styles.tooltipValue}>
              {formatDuration(selectedEntry.duration_hours)}
            </Text>
            {selectedEntry.sleep_quality !== null && (
              <>
                <Text style={styles.tooltipDivider}>|</Text>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.tooltipValue}>{selectedEntry.sleep_quality}/100</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Optimal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>Borderline</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Insufficient</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderColor: colors.warning }]} />
          <Text style={styles.legendText}>Goal</Text>
        </View>
      </View>
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
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.glassLight,
    borderRadius: radius.full,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stat: {
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartWrapper: {
    marginVertical: spacing.sm,
  },
  tooltip: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  tooltipDate: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tooltipValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  tooltipDivider: {
    color: colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLine: {
    width: 16,
    height: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
});

export default SleepAnalyticsChart;
