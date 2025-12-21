/**
 * MuscleMapVisual - Body diagram showing targeted muscles
 * Highlights primary and secondary muscles with interactive tooltips
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../../design/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Muscle group coordinates for front and back views
const MUSCLE_POSITIONS = {
  // Front view
  chest: { x: 50, y: 25, view: 'front' },
  shoulders: { x: 50, y: 18, view: 'front' },
  biceps: { x: 75, y: 32, view: 'front' },
  forearms: { x: 78, y: 45, view: 'front' },
  abs: { x: 50, y: 40, view: 'front' },
  obliques: { x: 62, y: 40, view: 'front' },
  quadriceps: { x: 45, y: 60, view: 'front' },
  adductors: { x: 50, y: 62, view: 'front' },
  tibialis: { x: 45, y: 80, view: 'front' },

  // Back view
  traps: { x: 50, y: 15, view: 'back' },
  'upper back': { x: 50, y: 22, view: 'back' },
  lats: { x: 65, y: 30, view: 'back' },
  'lower back': { x: 50, y: 38, view: 'back' },
  triceps: { x: 25, y: 32, view: 'back' },
  glutes: { x: 50, y: 50, view: 'back' },
  hamstrings: { x: 45, y: 65, view: 'back' },
  calves: { x: 45, y: 80, view: 'back' },

  // Aliases
  pectorals: { x: 50, y: 25, view: 'front' },
  deltoids: { x: 50, y: 18, view: 'front' },
  'rectus abdominis': { x: 50, y: 40, view: 'front' },
  'erector spinae': { x: 50, y: 38, view: 'back' },
  'gluteus maximus': { x: 50, y: 50, view: 'back' },
  'latissimus dorsi': { x: 65, y: 30, view: 'back' },
  trapezius: { x: 50, y: 15, view: 'back' },
  rhomboids: { x: 50, y: 22, view: 'back' },
};

interface MuscleMapVisualProps {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onMusclePress?: (muscle: string) => void;
}

export const MuscleMapVisual: React.FC<MuscleMapVisualProps> = ({
  primaryMuscles,
  secondaryMuscles = [],
  showLabels = true,
  size = 'md',
  onMusclePress,
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { width: 100, height: 180, scale: 0.5 };
      case 'lg':
        return { width: 180, height: 320, scale: 0.9 };
      default:
        return { width: 140, height: 250, scale: 0.7 };
    }
  };

  const config = getSizeConfig();

  const normalizeMuscleName = (muscle: string): string => {
    return muscle.toLowerCase().trim();
  };

  const getMusclePosition = (muscle: string) => {
    const normalized = normalizeMuscleName(muscle);
    return MUSCLE_POSITIONS[normalized as keyof typeof MUSCLE_POSITIONS];
  };

  const isPrimaryMuscle = (muscle: string): boolean => {
    return primaryMuscles.some(
      (m) => normalizeMuscleName(m) === normalizeMuscleName(muscle)
    );
  };

  const isSecondaryMuscle = (muscle: string): boolean => {
    return secondaryMuscles.some(
      (m) => normalizeMuscleName(m) === normalizeMuscleName(muscle)
    );
  };

  const handleMusclePress = (muscle: string) => {
    setSelectedMuscle(selectedMuscle === muscle ? null : muscle);
    onMusclePress?.(muscle);
  };

  // Determine which view to show based on muscles
  const hasFrontMuscles = [...primaryMuscles, ...secondaryMuscles].some((m) => {
    const pos = getMusclePosition(m);
    return pos?.view === 'front';
  });

  const hasBackMuscles = [...primaryMuscles, ...secondaryMuscles].some((m) => {
    const pos = getMusclePosition(m);
    return pos?.view === 'back';
  });

  const renderBodyOutline = (view: 'front' | 'back') => {
    // Simplified body outline paths
    const frontPath = `
      M 50 5
      C 45 5, 35 8, 35 15
      C 35 20, 40 22, 45 22
      L 30 25
      C 25 26, 20 30, 18 40
      L 15 55
      C 14 58, 15 60, 18 60
      L 30 55
      L 35 85
      L 30 95
      C 28 98, 30 100, 35 100
      L 45 95
      L 50 100
      L 55 95
      L 65 100
      C 70 100, 72 98, 70 95
      L 65 85
      L 70 55
      L 82 60
      C 85 60, 86 58, 85 55
      L 82 40
      C 80 30, 75 26, 70 25
      L 55 22
      C 60 22, 65 20, 65 15
      C 65 8, 55 5, 50 5
      Z
    `;

    return (
      <Path
        d={frontPath}
        fill={colors.bgCard}
        stroke={colors.glassBorder}
        strokeWidth={1}
        transform={view === 'back' ? 'scale(-1, 1) translate(-100, 0)' : ''}
      />
    );
  };

  const renderMuscleHighlights = (view: 'front' | 'back') => {
    const allMuscles = [...primaryMuscles, ...secondaryMuscles];
    const musclesToRender = allMuscles.filter((m) => {
      const pos = getMusclePosition(m);
      return pos?.view === view;
    });

    return musclesToRender.map((muscle) => {
      const pos = getMusclePosition(muscle);
      if (!pos) return null;

      const isPrimary = isPrimaryMuscle(muscle);
      const fillColor = isPrimary ? colors.primary : colors.secondary;
      const fillOpacity = isPrimary ? 0.6 : 0.4;
      const radius = isPrimary ? 8 : 6;

      return (
        <G key={muscle}>
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={radius}
            fill={fillColor}
            fillOpacity={fillOpacity}
          />
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={radius + 3}
            fill="transparent"
            stroke={fillColor}
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="3,3"
          />
        </G>
      );
    });
  };

  const renderView = (view: 'front' | 'back') => (
    <Svg
      width={config.width}
      height={config.height}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {renderBodyOutline(view)}
      {renderMuscleHighlights(view)}
    </Svg>
  );

  return (
    <View style={styles.container}>
      {/* View Toggle */}
      {hasFrontMuscles && hasBackMuscles && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              activeView === 'front' && styles.viewButtonActive,
            ]}
            onPress={() => setActiveView('front')}
          >
            <Text
              style={[
                styles.viewButtonText,
                activeView === 'front' && styles.viewButtonTextActive,
              ]}
            >
              Front
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              activeView === 'back' && styles.viewButtonActive,
            ]}
            onPress={() => setActiveView('back')}
          >
            <Text
              style={[
                styles.viewButtonText,
                activeView === 'back' && styles.viewButtonTextActive,
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Body Diagram */}
      <View style={styles.diagramContainer}>
        {renderView(activeView)}
      </View>

      {/* Legend */}
      {showLabels && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Primary</Text>
          </View>
          {secondaryMuscles.length > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Secondary</Text>
            </View>
          )}
        </View>
      )}

      {/* Muscle List */}
      <View style={styles.muscleList}>
        {primaryMuscles.map((muscle, index) => (
          <TouchableOpacity
            key={`primary-${index}`}
            style={[styles.muscleChip, styles.primaryChip]}
            onPress={() => handleMusclePress(muscle)}
          >
            <View style={[styles.chipDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.primaryChipText}>{muscle}</Text>
          </TouchableOpacity>
        ))}
        {secondaryMuscles.map((muscle, index) => (
          <TouchableOpacity
            key={`secondary-${index}`}
            style={[styles.muscleChip, styles.secondaryChip]}
            onPress={() => handleMusclePress(muscle)}
          >
            <View style={[styles.chipDot, { backgroundColor: colors.secondary }]} />
            <Text style={styles.secondaryChipText}>{muscle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Muscle Tooltip */}
      {selectedMuscle && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>{selectedMuscle}</Text>
          <Text style={styles.tooltipType}>
            {isPrimaryMuscle(selectedMuscle) ? 'Primary Target' : 'Secondary Target'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    padding: 2,
    marginBottom: spacing.md,
  },
  viewButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  viewButtonActive: {
    backgroundColor: colors.primarySubtle,
  },
  viewButtonText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  viewButtonTextActive: {
    color: colors.primary,
  },
  diagramContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  muscleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  primaryChip: {
    backgroundColor: colors.primarySubtle,
  },
  primaryChipText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  secondaryChip: {
    backgroundColor: colors.secondarySubtle,
  },
  secondaryChipText: {
    fontSize: typography.size.sm,
    color: colors.secondary,
    fontWeight: typography.weight.medium,
  },
  tooltip: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  tooltipType: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
});

export default MuscleMapVisual;
