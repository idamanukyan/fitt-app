/**
 * PRBadgeCard - Personal Record display component
 * Shows personal records with celebration styling
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../design/tokens';
import type { PersonalRecord } from '../../types/analytics.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PRBadgeCardProps {
  pr: PersonalRecord;
  size?: 'sm' | 'md' | 'lg';
  showImprovement?: boolean;
  animated?: boolean;
  style?: object;
}

export const PRBadgeCard: React.FC<PRBadgeCardProps> = ({
  pr,
  size = 'md',
  showImprovement = true,
  animated = true,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && pr.isNew) {
      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [pr.isNew, animated]);

  const getCategoryIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (pr.category) {
      case 'weight':
        return 'barbell';
      case 'reps':
        return 'repeat';
      case 'volume':
        return 'layers';
      case 'duration':
        return 'time';
      case 'form_score':
        return 'checkmark-circle';
      default:
        return 'trophy';
    }
  };

  const getCategoryColor = (): string => {
    switch (pr.category) {
      case 'weight':
        return colors.primary;
      case 'reps':
        return colors.secondary;
      case 'volume':
        return colors.accent.blue;
      case 'duration':
        return colors.accent.cyan;
      case 'form_score':
        return colors.success;
      default:
        return colors.accent.yellow;
    }
  };

  const getImprovement = (): string | null => {
    if (!showImprovement || pr.previousValue === null) return null;

    const diff = pr.value - pr.previousValue;
    const percentage = ((diff / pr.previousValue) * 100).toFixed(1);

    if (pr.category === 'weight' || pr.category === 'volume') {
      return `+${diff.toFixed(1)} ${pr.unit}`;
    }
    if (pr.category === 'reps') {
      return `+${diff} ${pr.unit}`;
    }
    return `+${percentage}%`;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          cardWidth: 140,
          iconSize: 24,
          valueSize: typography.size.lg,
          labelSize: typography.size.xs,
        };
      case 'lg':
        return {
          cardWidth: 200,
          iconSize: 36,
          valueSize: typography.size['2xl'],
          labelSize: typography.size.sm,
        };
      default:
        return {
          cardWidth: 160,
          iconSize: 28,
          valueSize: typography.size.xl,
          labelSize: typography.size.xs,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const categoryColor = getCategoryColor();
  const improvement = getImprovement();

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: sizeStyles.cardWidth, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {/* Glow effect for new PRs */}
      {pr.isNew && (
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              backgroundColor: categoryColor,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <LinearGradient
        colors={[`${categoryColor}20`, `${categoryColor}05`]}
        style={styles.gradient}
      >
        {/* Trophy Icon for new */}
        {pr.isNew && (
          <View style={styles.newBadge}>
            <Ionicons name="trophy" size={12} color={colors.accent.yellow} />
            <Text style={styles.newBadgeText}>NEW!</Text>
          </View>
        )}

        {/* Category Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${categoryColor}20` },
          ]}
        >
          <Ionicons
            name={getCategoryIcon()}
            size={sizeStyles.iconSize}
            color={categoryColor}
          />
        </View>

        {/* Value */}
        <Text style={[styles.value, { fontSize: sizeStyles.valueSize }]}>
          {pr.value}
          <Text style={styles.unit}> {pr.unit}</Text>
        </Text>

        {/* Label */}
        <Text style={[styles.label, { fontSize: sizeStyles.labelSize }]}>
          {pr.category.replace('_', ' ')}
        </Text>

        {/* Exercise Name */}
        <Text
          style={[styles.exerciseName, { fontSize: sizeStyles.labelSize }]}
          numberOfLines={1}
        >
          {pr.exerciseName}
        </Text>

        {/* Improvement */}
        {improvement && (
          <View style={styles.improvementBadge}>
            <Ionicons name="trending-up" size={12} color={colors.success} />
            <Text style={styles.improvementText}>{improvement}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

// Horizontal scrolling PR list
interface PRListProps {
  prs: PersonalRecord[];
  onPRPress?: (pr: PersonalRecord) => void;
}

export const PRBadgeList: React.FC<PRListProps> = ({ prs, onPRPress }) => {
  if (prs.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="trophy-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyText}>No personal records yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {prs.map((pr) => (
        <PRBadgeCard key={pr.id} pr={pr} size="md" />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  gradient: {
    alignItems: 'center',
    padding: spacing.lg,
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  newBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.warning,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  unit: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.textSecondary,
  },
  label: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  exerciseName: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  improvementText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.success,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});

export default PRBadgeCard;
