/**
 * DayDetailModal - Production-Ready Day Detail Component
 *
 * Features:
 * - Full measurement data display with real values
 * - Trend indicators and deltas from real calculations
 * - 7-day moving average and sparkline chart
 * - Month comparison section
 * - Edit/Delete options
 * - Animated bottom sheet
 * - Accessibility support
 */

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';
import type { Measurement, MeasurementTrends, MeasurementComparison } from '../../types/api.types';
import type { SleepEntry, SleepWeightCorrelation } from '../../types/sleep.types';
import { formatDuration, getSleepStatusInfo } from '../../utils/sleepCalculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  measurement: Measurement | null;
  trends: MeasurementTrends;
  monthComparison?: MeasurementComparison | null;
  isDeleting?: boolean;
  // Sleep data props
  sleepEntry?: SleepEntry | null;
  sleep7DayAvg?: number | null;
  sleepTrendVsLastWeek?: number | null;
  sleepWeightCorrelation?: SleepWeightCorrelation | null;
  onEditSleep?: () => void;
  onAddSleep?: () => void;
}

// Sparkline chart component
const SparklineChart: React.FC<{ data: Array<{ date: string; weight: number }>; color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) return null;

  const width = SCREEN_WIDTH - spacing.xl * 4;
  const height = 60;
  const padding = 10;

  const weights = data.map(d => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const points = weights.map((value, index) => {
    const x = padding + (index / (weights.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Path d={areaPathD} fill="url(#chartGradient)" />
      <Path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      {points.map((point, index) => (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={index === points.length - 1 ? 4 : 2}
          fill={index === points.length - 1 ? color : 'transparent'}
          stroke={index === points.length - 1 ? colors.textPrimary : 'transparent'}
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
};

// Metric card component
interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: number | null;
  unit: string;
  delta?: number | null;
  deltaLabel?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconColor,
  label,
  value,
  unit,
  delta,
  deltaLabel,
}) => {
  if (value === null || value === undefined) return null;

  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      {delta !== null && delta !== undefined && (
        <View style={styles.deltaContainer}>
          <Ionicons
            name={delta < 0 ? 'trending-down' : delta > 0 ? 'trending-up' : 'remove'}
            size={12}
            color={delta < 0 ? colors.success : delta > 0 ? colors.accent.orange : colors.textMuted}
          />
          <Text
            style={[
              styles.deltaText,
              { color: delta < 0 ? colors.success : delta > 0 ? colors.accent.orange : colors.textMuted },
            ]}
          >
            {delta > 0 ? '+' : ''}{delta.toFixed(1)} {deltaLabel || unit}
          </Text>
        </View>
      )}
    </View>
  );
};

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  measurement,
  trends,
  monthComparison,
  isDeleting = false,
  sleepEntry,
  sleep7DayAvg,
  sleepTrendVsLastWeek,
  sleepWeightCorrelation,
  onEditSleep,
  onAddSleep,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  // Format date for display
  const formattedDate = useMemo(() => {
    if (!measurement) return '';
    const date = new Date(measurement.recorded_at);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [measurement]);

  // Generate insight message based on trends
  const insightMessage = useMemo(() => {
    if (!measurement || !trends) return 'Keep tracking regularly to see your progress over time!';

    const { weight_delta, weight_trend } = trends;

    if (weight_delta !== null && weight_delta !== undefined) {
      if (weight_trend === 'down' && weight_delta < -0.3) {
        return `Great progress! You've lost ${Math.abs(weight_delta).toFixed(1)}kg since your last measurement.`;
      } else if (weight_trend === 'up' && weight_delta > 0.3) {
        return `You've gained ${weight_delta.toFixed(1)}kg since your last measurement. Check your nutrition and activity levels.`;
      } else {
        return 'Your weight is stable. Consistency is key to reaching your goals!';
      }
    }

    return 'Keep tracking regularly to see your progress over time!';
  }, [measurement, trends]);

  if (!measurement) return null;

  const hasBodyMeasurements =
    measurement.chest || measurement.waist || measurement.hips ||
    measurement.left_arm || measurement.right_arm;

  const hasAdvancedMetrics =
    measurement.water_percentage || measurement.visceral_fat ||
    measurement.resting_metabolic_rate || measurement.muscle_mass;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <View style={styles.headerBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.headerBadgeText}>Measurement recorded</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
                accessibilityLabel="Edit measurement"
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
                disabled={isDeleting}
                accessibilityLabel="Delete measurement"
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Primary Metrics */}
            <View style={styles.primaryMetrics}>
              {measurement.weight && (
                <View style={styles.primaryMetricCard}>
                  <LinearGradient
                    colors={['rgba(74, 222, 128, 0.1)', 'rgba(74, 222, 128, 0.02)']}
                    style={styles.primaryMetricGradient}
                  >
                    <Ionicons name="scale" size={28} color={colors.primary} />
                    <Text style={styles.primaryMetricValue}>
                      {measurement.weight}
                      <Text style={styles.primaryMetricUnit}> kg</Text>
                    </Text>
                    <Text style={styles.primaryMetricLabel}>Weight</Text>
                    {trends.weight_delta !== null && trends.weight_delta !== undefined && (
                      <View style={styles.primaryDelta}>
                        <Ionicons
                          name={trends.weight_delta < 0 ? 'arrow-down' : trends.weight_delta > 0 ? 'arrow-up' : 'remove'}
                          size={16}
                          color={trends.weight_delta < 0 ? colors.success : trends.weight_delta > 0 ? colors.accent.orange : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.primaryDeltaText,
                            { color: trends.weight_delta < 0 ? colors.success : trends.weight_delta > 0 ? colors.accent.orange : colors.textMuted },
                          ]}
                        >
                          {trends.weight_delta > 0 ? '+' : ''}{trends.weight_delta.toFixed(1)} kg from last
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>
              )}

              {measurement.body_fat_percentage && (
                <View style={styles.primaryMetricCard}>
                  <LinearGradient
                    colors={['rgba(251, 146, 60, 0.1)', 'rgba(251, 146, 60, 0.02)']}
                    style={styles.primaryMetricGradient}
                  >
                    <Ionicons name="fitness" size={28} color={colors.accent.orange} />
                    <Text style={styles.primaryMetricValue}>
                      {measurement.body_fat_percentage}
                      <Text style={styles.primaryMetricUnit}> %</Text>
                    </Text>
                    <Text style={styles.primaryMetricLabel}>Body Fat</Text>
                    {trends.body_fat_delta !== null && trends.body_fat_delta !== undefined && (
                      <View style={styles.primaryDelta}>
                        <Ionicons
                          name={trends.body_fat_delta < 0 ? 'arrow-down' : trends.body_fat_delta > 0 ? 'arrow-up' : 'remove'}
                          size={16}
                          color={trends.body_fat_delta < 0 ? colors.success : trends.body_fat_delta > 0 ? colors.accent.orange : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.primaryDeltaText,
                            { color: trends.body_fat_delta < 0 ? colors.success : trends.body_fat_delta > 0 ? colors.accent.orange : colors.textMuted },
                          ]}
                        >
                          {trends.body_fat_delta > 0 ? '+' : ''}{trends.body_fat_delta.toFixed(1)}% from last
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* 7-Day Trend Chart */}
            {trends.weight_history && trends.weight_history.length > 1 && (
              <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>Weight Trend (7 Days)</Text>
                <View style={styles.chartContainer}>
                  <SparklineChart data={trends.weight_history} color={colors.primary} />
                </View>
                <View style={styles.averageRow}>
                  {trends.weight_7day_avg !== null && (
                    <View style={styles.averageItem}>
                      <Text style={styles.averageLabel}>7-Day Avg:</Text>
                      <Text style={styles.averageValue}>{trends.weight_7day_avg.toFixed(1)} kg</Text>
                    </View>
                  )}
                  {trends.weight_30day_avg !== null && (
                    <View style={styles.averageItem}>
                      <Text style={styles.averageLabel}>30-Day Avg:</Text>
                      <Text style={styles.averageValue}>{trends.weight_30day_avg.toFixed(1)} kg</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Month Comparison */}
            {monthComparison && (
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionTitle}>Compare with Last Month</Text>
                <View style={styles.comparisonGrid}>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>This Month Avg</Text>
                    <Text style={styles.comparisonValue}>
                      {monthComparison.current_avg_weight?.toFixed(1) || '-'} kg
                    </Text>
                  </View>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Last Month Avg</Text>
                    <Text style={styles.comparisonValue}>
                      {monthComparison.previous_avg_weight?.toFixed(1) || '-'} kg
                    </Text>
                  </View>
                  {monthComparison.weight_difference !== null && (
                    <View style={styles.comparisonDiff}>
                      <Ionicons
                        name={monthComparison.weight_difference < 0 ? 'trending-down' : 'trending-up'}
                        size={16}
                        color={monthComparison.weight_difference < 0 ? colors.success : colors.accent.orange}
                      />
                      <Text
                        style={[
                          styles.comparisonDiffText,
                          { color: monthComparison.weight_difference < 0 ? colors.success : colors.accent.orange },
                        ]}
                      >
                        {monthComparison.weight_difference > 0 ? '+' : ''}
                        {monthComparison.weight_difference.toFixed(1)} kg
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Body Measurements */}
            {hasBodyMeasurements && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Body Measurements</Text>
                <View style={styles.metricsGrid}>
                  <MetricCard icon="body" iconColor={colors.accent.blue} label="Chest" value={measurement.chest} unit="cm" />
                  <MetricCard icon="resize" iconColor={colors.secondary} label="Waist" value={measurement.waist} unit="cm" />
                  <MetricCard icon="ellipse" iconColor={colors.accent.pink} label="Hips" value={measurement.hips} unit="cm" />
                  <MetricCard icon="accessibility" iconColor={colors.accent.cyan} label="Shoulders" value={measurement.shoulders} unit="cm" />
                  <MetricCard icon="barbell" iconColor={colors.primary} label="L. Arm" value={measurement.left_arm} unit="cm" />
                  <MetricCard icon="barbell" iconColor={colors.primary} label="R. Arm" value={measurement.right_arm} unit="cm" />
                  <MetricCard icon="walk" iconColor={colors.accent.orange} label="L. Thigh" value={measurement.left_thigh} unit="cm" />
                  <MetricCard icon="walk" iconColor={colors.accent.orange} label="R. Thigh" value={measurement.right_thigh} unit="cm" />
                </View>
              </View>
            )}

            {/* Advanced Metrics */}
            {hasAdvancedMetrics && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Advanced Metrics</Text>
                <View style={styles.metricsGrid}>
                  <MetricCard icon="barbell" iconColor={colors.primary} label="Muscle Mass" value={measurement.muscle_mass} unit="kg" />
                  <MetricCard icon="water" iconColor={colors.accent.blue} label="Water %" value={measurement.water_percentage} unit="%" />
                  <MetricCard icon="analytics" iconColor={colors.secondary} label="Visceral Fat" value={measurement.visceral_fat} unit="level" />
                  <MetricCard icon="flame" iconColor={colors.accent.orange} label="RMR" value={measurement.resting_metabolic_rate} unit="kcal" />
                </View>
              </View>
            )}

            {/* Sleep Section */}
            <View style={styles.sleepSection}>
              <View style={styles.sleepHeader}>
                <View style={styles.sleepHeaderLeft}>
                  <Ionicons name="moon" size={20} color={colors.secondary} />
                  <Text style={styles.sectionTitle}>Sleep</Text>
                </View>
                {sleepEntry ? (
                  <TouchableOpacity
                    style={styles.sleepEditButton}
                    onPress={onEditSleep}
                    accessibilityLabel="Edit sleep"
                  >
                    <Ionicons name="pencil" size={14} color={colors.primary} />
                    <Text style={styles.sleepEditText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.sleepAddButton}
                    onPress={onAddSleep}
                    accessibilityLabel="Add sleep"
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text style={styles.sleepEditText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {sleepEntry ? (
                <View style={styles.sleepContent}>
                  {/* Last Night's Sleep */}
                  <View style={styles.sleepPrimaryRow}>
                    <View style={styles.sleepPrimaryItem}>
                      <Text style={styles.sleepPrimaryLabel}>Last Night</Text>
                      <View style={styles.sleepValueRow}>
                        <Text style={[
                          styles.sleepPrimaryValue,
                          { color: getSleepStatusInfo(sleepEntry.duration_hours).color }
                        ]}>
                          {formatDuration(sleepEntry.duration_hours)}
                        </Text>
                        <View style={[
                          styles.sleepStatusBadge,
                          { backgroundColor: `${getSleepStatusInfo(sleepEntry.duration_hours).color}20` }
                        ]}>
                          <Text style={[
                            styles.sleepStatusText,
                            { color: getSleepStatusInfo(sleepEntry.duration_hours).color }
                          ]}>
                            {getSleepStatusInfo(sleepEntry.duration_hours).label}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.sleepPrimaryItem}>
                      <Text style={styles.sleepPrimaryLabel}>7-Day Avg</Text>
                      <Text style={styles.sleepPrimaryValue}>
                        {sleep7DayAvg !== null && sleep7DayAvg !== undefined
                          ? formatDuration(sleep7DayAvg)
                          : '--'}
                      </Text>
                    </View>
                  </View>

                  {/* Sleep Times */}
                  <View style={styles.sleepTimesRow}>
                    <View style={styles.sleepTimeItem}>
                      <Ionicons name="bed-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.sleepTimeLabel}>Bedtime</Text>
                      <Text style={styles.sleepTimeValue}>
                        {sleepEntry.bedtime
                          ? new Date(sleepEntry.bedtime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                          : '--'}
                      </Text>
                    </View>
                    <View style={styles.sleepTimeDivider} />
                    <View style={styles.sleepTimeItem}>
                      <Ionicons name="sunny-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.sleepTimeLabel}>Wake Time</Text>
                      <Text style={styles.sleepTimeValue}>
                        {sleepEntry.wake_time
                          ? new Date(sleepEntry.wake_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                          : '--'}
                      </Text>
                    </View>
                  </View>

                  {/* Trend vs Last Week */}
                  {sleepTrendVsLastWeek !== null && sleepTrendVsLastWeek !== undefined && (
                    <View style={styles.sleepTrendRow}>
                      <Ionicons
                        name={sleepTrendVsLastWeek > 0 ? 'trending-up' : sleepTrendVsLastWeek < 0 ? 'trending-down' : 'remove'}
                        size={16}
                        color={sleepTrendVsLastWeek > 0 ? colors.success : sleepTrendVsLastWeek < 0 ? colors.error : colors.textMuted}
                      />
                      <Text style={[
                        styles.sleepTrendText,
                        { color: sleepTrendVsLastWeek > 0 ? colors.success : sleepTrendVsLastWeek < 0 ? colors.error : colors.textMuted }
                      ]}>
                        {sleepTrendVsLastWeek > 0 ? '+' : ''}{sleepTrendVsLastWeek}% vs last week
                      </Text>
                    </View>
                  )}

                  {/* Sleep-Weight Correlation Insight */}
                  {sleepWeightCorrelation && sleepWeightCorrelation.correlation_strength !== 'none' && (
                    <View style={styles.sleepCorrelationCard}>
                      <Ionicons name="analytics" size={16} color={colors.secondary} />
                      <View style={styles.sleepCorrelationContent}>
                        <Text style={styles.sleepCorrelationText}>
                          {sleepWeightCorrelation.insight_message}
                        </Text>
                        {sleepWeightCorrelation.recommendation && (
                          <Text style={styles.sleepCorrelationRecommendation}>
                            {sleepWeightCorrelation.recommendation}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.sleepEmptyState}>
                  <Ionicons name="moon-outline" size={32} color={colors.textMuted} />
                  <Text style={styles.sleepEmptyText}>No sleep data recorded</Text>
                  <TouchableOpacity style={styles.sleepAddButtonLarge} onPress={onAddSleep}>
                    <Ionicons name="add" size={16} color={colors.textInverse} />
                    <Text style={styles.sleepAddButtonText}>Add Sleep Entry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Notes */}
            {measurement.notes && (
              <View style={styles.notesSection}>
                <View style={styles.notesHeader}>
                  <Ionicons name="document-text" size={16} color={colors.textMuted} />
                  <Text style={styles.notesTitle}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{measurement.notes}</Text>
              </View>
            )}

            {/* Insights */}
            <View style={styles.insightsSection}>
              <View style={styles.insightCard}>
                <Ionicons name="bulb" size={20} color={colors.warning} />
                <Text style={styles.insightText}>{insightMessage}</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  dateText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerBadgeText: {
    fontSize: typography.size.sm,
    color: colors.success,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: spacing.sm,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },

  // Primary Metrics
  primaryMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryMetricCard: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  primaryMetricGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  primaryMetricValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  primaryMetricUnit: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.regular,
    color: colors.textSecondary,
  },
  primaryMetricLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  primaryDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  primaryDeltaText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },

  // Chart Section
  chartSection: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  averageItem: {
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  averageValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },

  // Comparison Section
  comparisonSection: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  comparisonValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  comparisonDiff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.glassLight,
  },
  comparisonDiffText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  metricUnit: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  deltaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  deltaText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },

  // Notes
  notesSection: {
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  notesText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Insights
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  insightText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Sleep Section
  sleepSection: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sleepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sleepEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.full,
  },
  sleepAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.full,
  },
  sleepEditText: {
    fontSize: typography.size.xs,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  sleepContent: {
    gap: spacing.md,
  },
  sleepPrimaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sleepPrimaryItem: {
    alignItems: 'center',
  },
  sleepPrimaryLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  sleepValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sleepPrimaryValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  sleepStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  sleepStatusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  sleepTimesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  sleepTimeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  sleepTimeDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  sleepTimeLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  sleepTimeValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  sleepTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  sleepTrendText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  sleepCorrelationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.secondarySubtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  sleepCorrelationContent: {
    flex: 1,
  },
  sleepCorrelationText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sleepCorrelationRecommendation: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  sleepEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  sleepEmptyText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sleepAddButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  sleepAddButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textInverse,
  },
});

export default DayDetailModal;
