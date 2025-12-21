/**
 * MuscleBalanceChart - Muscle group balance visualization
 * Shows volume distribution across muscle groups with status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Polygon, Text as SvgText, G } from 'react-native-svg';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { MuscleBalanceAnalysis, MuscleGroupBalance } from '../../types/insights.types';

interface MuscleBalanceChartProps {
  data: MuscleBalanceAnalysis;
  variant?: 'radar' | 'bar' | 'list';
  onMusclePress?: (muscle: MuscleGroupBalance) => void;
  style?: object;
}

export const MuscleBalanceChart: React.FC<MuscleBalanceChartProps> = ({
  data,
  variant = 'bar',
  onMusclePress,
  style,
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'overtrained':
        return colors.warning;
      case 'undertrained':
        return colors.error;
      case 'optimal':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'overtrained':
        return 'warning';
      case 'undertrained':
        return 'alert-circle';
      case 'optimal':
        return 'checkmark-circle';
      default:
        return 'remove-circle';
    }
  };

  // Radar chart rendering
  const renderRadarChart = () => {
    const size = 200;
    const center = size / 2;
    const maxRadius = 80;
    const muscleGroups = data.muscleGroups.slice(0, 6); // Max 6 for radar
    const angleStep = (2 * Math.PI) / muscleGroups.length;

    // Create radar points
    const radarPoints = muscleGroups.map((muscle, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const normalizedValue = Math.min(muscle.percentage / 100, 1.5);
      const radius = maxRadius * normalizedValue;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        label: muscle.name,
        labelX: center + (maxRadius + 20) * Math.cos(angle),
        labelY: center + (maxRadius + 20) * Math.sin(angle),
      };
    });

    const polygonPoints = radarPoints.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <View style={styles.radarContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circles */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={maxRadius * scale}
              fill="none"
              stroke={colors.glassBorder}
              strokeWidth={1}
            />
          ))}

          {/* Axis lines */}
          {muscleGroups.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return (
              <Line
                key={i}
                x1={center}
                y1={center}
                x2={center + maxRadius * Math.cos(angle)}
                y2={center + maxRadius * Math.sin(angle)}
                stroke={colors.glassBorder}
                strokeWidth={1}
              />
            );
          })}

          {/* Data polygon */}
          <Polygon
            points={polygonPoints}
            fill={`${colors.primary}30`}
            stroke={colors.primary}
            strokeWidth={2}
          />

          {/* Data points */}
          {radarPoints.map((point, i) => (
            <Circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={getStatusColor(muscleGroups[i].status)}
            />
          ))}

          {/* Labels */}
          {radarPoints.map((point, i) => (
            <SvgText
              key={`label-${i}`}
              x={point.labelX}
              y={point.labelY}
              fontSize={10}
              fill={colors.textSecondary}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {point.label}
            </SvgText>
          ))}
        </Svg>

        {/* Balance Score */}
        <View style={styles.balanceScore}>
          <Text style={styles.balanceValue}>{data.overallBalance}%</Text>
          <Text style={styles.balanceLabel}>Balance</Text>
        </View>
      </View>
    );
  };

  // Bar chart rendering
  const renderBarChart = () => {
    const maxPercentage = Math.max(
      ...data.muscleGroups.map((m) => m.percentage),
      100
    );

    return (
      <View style={styles.barContainer}>
        {data.muscleGroups.map((muscle, index) => (
          <TouchableOpacity
            key={muscle.name}
            style={styles.barRow}
            onPress={() => onMusclePress?.(muscle)}
            activeOpacity={onMusclePress ? 0.7 : 1}
          >
            <View style={styles.barLabelContainer}>
              <Ionicons
                name={getStatusIcon(muscle.status)}
                size={14}
                color={getStatusColor(muscle.status)}
              />
              <Text style={styles.barLabel}>{muscle.name}</Text>
            </View>
            <View style={styles.barWrapper}>
              <View style={styles.barBackground}>
                {/* Target line */}
                <View style={[styles.targetLine, { left: `${(100 / maxPercentage) * 100}%` }]} />
                {/* Value bar */}
                <LinearGradient
                  colors={[getStatusColor(muscle.status), `${getStatusColor(muscle.status)}80`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.barFill,
                    { width: `${(muscle.percentage / maxPercentage) * 100}%` },
                  ]}
                />
              </View>
              <Text style={[styles.barPercentage, { color: getStatusColor(muscle.status) }]}>
                {muscle.percentage}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // List view rendering
  const renderListView = () => (
    <View style={styles.listContainer}>
      {data.muscleGroups.map((muscle) => (
        <TouchableOpacity
          key={muscle.name}
          style={styles.listItem}
          onPress={() => onMusclePress?.(muscle)}
          activeOpacity={onMusclePress ? 0.7 : 1}
        >
          <View style={styles.listHeader}>
            <View style={styles.listTitleRow}>
              <Ionicons
                name={getStatusIcon(muscle.status)}
                size={18}
                color={getStatusColor(muscle.status)}
              />
              <Text style={styles.listTitle}>{muscle.name}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(muscle.status)}20` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(muscle.status) },
                ]}
              >
                {muscle.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.listStats}>
            <View style={styles.listStat}>
              <Text style={styles.listStatValue}>
                {muscle.volume.toLocaleString()}
              </Text>
              <Text style={styles.listStatLabel}>Volume</Text>
            </View>
            <View style={styles.listStat}>
              <Text style={styles.listStatValue}>
                {muscle.targetVolume.toLocaleString()}
              </Text>
              <Text style={styles.listStatLabel}>Target</Text>
            </View>
            <View style={styles.listStat}>
              <Text
                style={[
                  styles.listStatValue,
                  { color: getStatusColor(muscle.status) },
                ]}
              >
                {muscle.percentage}%
              </Text>
              <Text style={styles.listStatLabel}>of Target</Text>
            </View>
          </View>

          {muscle.daysSinceLastWorked > 0 && (
            <Text style={styles.lastWorked}>
              Last trained {muscle.daysSinceLastWorked} day{muscle.daysSinceLastWorked > 1 ? 's' : ''} ago
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Muscle Balance</Text>
          <Text style={styles.subtitle}>
            {data.overallBalance >= 80
              ? 'Well balanced'
              : data.overallBalance >= 60
              ? 'Minor imbalances'
              : 'Needs attention'}
          </Text>
        </View>
        <View
          style={[
            styles.scoreBadge,
            {
              backgroundColor:
                data.overallBalance >= 80
                  ? colors.successBg
                  : data.overallBalance >= 60
                  ? colors.warningBg
                  : colors.errorBg,
            },
          ]}
        >
          <Text
            style={[
              styles.scoreText,
              {
                color:
                  data.overallBalance >= 80
                    ? colors.success
                    : data.overallBalance >= 60
                    ? colors.warning
                    : colors.error,
              },
            ]}
          >
            {data.overallBalance}%
          </Text>
        </View>
      </View>

      {/* Chart */}
      {variant === 'radar' && renderRadarChart()}
      {variant === 'bar' && renderBarChart()}
      {variant === 'list' && renderListView()}

      {/* Imbalance Warnings */}
      {data.imbalances.length > 0 && (
        <View style={styles.imbalanceSection}>
          <Text style={styles.imbalanceTitle}>Imbalances Detected</Text>
          {data.imbalances.map((imbalance, index) => (
            <View key={index} style={styles.imbalanceItem}>
              <Ionicons
                name="warning"
                size={14}
                color={
                  imbalance.severity === 'severe'
                    ? colors.error
                    : imbalance.severity === 'moderate'
                    ? colors.warning
                    : colors.info
                }
              />
              <View style={styles.imbalanceContent}>
                <Text style={styles.imbalanceText}>
                  {imbalance.primaryMuscle} vs {imbalance.secondaryMuscle}:{' '}
                  {imbalance.ratio.toFixed(2)}x (ideal: {imbalance.idealRatio}x)
                </Text>
                <Text style={styles.imbalanceRec}>{imbalance.recommendation}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Compact muscle balance summary
interface MuscleBalanceSummaryProps {
  data: MuscleBalanceAnalysis;
  onPress?: () => void;
  style?: object;
}

export const MuscleBalanceSummary: React.FC<MuscleBalanceSummaryProps> = ({
  data,
  onPress,
  style,
}) => {
  const undertrainedCount = data.muscleGroups.filter(
    (m) => m.status === 'undertrained'
  ).length;
  const overtrainedCount = data.muscleGroups.filter(
    (m) => m.status === 'overtrained'
  ).length;

  return (
    <TouchableOpacity
      style={[styles.summaryContainer, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.summaryHeader}>
        <Ionicons name="analytics" size={20} color={colors.primary} />
        <Text style={styles.summaryTitle}>Muscle Balance</Text>
        <Text style={styles.summaryScore}>{data.overallBalance}%</Text>
      </View>

      <View style={styles.summaryStats}>
        {undertrainedCount > 0 && (
          <View style={styles.summaryStat}>
            <View
              style={[styles.summaryDot, { backgroundColor: colors.error }]}
            />
            <Text style={styles.summaryStatText}>
              {undertrainedCount} undertrained
            </Text>
          </View>
        )}
        {overtrainedCount > 0 && (
          <View style={styles.summaryStat}>
            <View
              style={[styles.summaryDot, { backgroundColor: colors.warning }]}
            />
            <Text style={styles.summaryStatText}>
              {overtrainedCount} overtrained
            </Text>
          </View>
        )}
        {undertrainedCount === 0 && overtrainedCount === 0 && (
          <View style={styles.summaryStat}>
            <View
              style={[styles.summaryDot, { backgroundColor: colors.success }]}
            />
            <Text style={styles.summaryStatText}>All muscles optimal</Text>
          </View>
        )}
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textMuted}
          style={styles.summaryChevron}
        />
      )}
    </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  scoreText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },

  // Radar chart
  radarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  balanceScore: {
    position: 'absolute',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -15 }],
  },
  balanceValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  balanceLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // Bar chart
  barContainer: {
    gap: spacing.md,
  },
  barRow: {
    gap: spacing.xs,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  barLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.glass,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  targetLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  barPercentage: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    width: 40,
    textAlign: 'right',
  },

  // List view
  listContainer: {
    gap: spacing.md,
  },
  listItem: {
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textTransform: 'capitalize',
  },
  listStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  listStat: {
    alignItems: 'center',
  },
  listStatValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  listStatLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  lastWorked: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Imbalance section
  imbalanceSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  imbalanceTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  imbalanceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  imbalanceContent: {
    flex: 1,
  },
  imbalanceText: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  imbalanceRec: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Summary component
  summaryContainer: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  summaryScore: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  summaryStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginLeft: spacing.md,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryStatText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  summaryChevron: {
    marginLeft: spacing.sm,
  },
});

export default MuscleBalanceChart;
