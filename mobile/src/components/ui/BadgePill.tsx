/**
 * BadgePill - Difficulty/type/status badge component
 * Matches dashboard design system with color variants
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../../design/tokens';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'orange'
  | 'pink';

type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgePillProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  outlined?: boolean;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const BadgePill: React.FC<BadgePillProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  icon,
  outlined = false,
  dot = false,
  style,
  textStyle,
}) => {
  const getVariantColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primarySubtle,
          text: colors.primary,
          border: colors.primaryBorder,
        };
      case 'secondary':
        return {
          bg: colors.secondarySubtle,
          text: colors.secondary,
          border: 'rgba(167, 139, 250, 0.4)',
        };
      case 'success':
        return {
          bg: colors.successBg,
          text: colors.success,
          border: 'rgba(74, 222, 128, 0.4)',
        };
      case 'warning':
        return {
          bg: colors.warningBg,
          text: colors.warning,
          border: 'rgba(251, 191, 36, 0.4)',
        };
      case 'error':
        return {
          bg: colors.errorBg,
          text: colors.error,
          border: 'rgba(248, 113, 113, 0.4)',
        };
      case 'info':
        return {
          bg: colors.infoBg,
          text: colors.info,
          border: 'rgba(96, 165, 250, 0.4)',
        };
      case 'neutral':
        return {
          bg: colors.glass,
          text: colors.textSecondary,
          border: colors.glassBorder,
        };
      case 'purple':
        return {
          bg: 'rgba(167, 139, 250, 0.15)',
          text: colors.secondary,
          border: 'rgba(167, 139, 250, 0.4)',
        };
      case 'orange':
        return {
          bg: 'rgba(251, 146, 60, 0.15)',
          text: colors.accent.orange,
          border: 'rgba(251, 146, 60, 0.4)',
        };
      case 'pink':
        return {
          bg: 'rgba(244, 114, 182, 0.15)',
          text: colors.accent.pink,
          border: 'rgba(244, 114, 182, 0.4)',
        };
      default:
        return {
          bg: colors.primarySubtle,
          text: colors.primary,
          border: colors.primaryBorder,
        };
    }
  };

  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconSize: number;
    dotSize: number;
  } => {
    switch (size) {
      case 'xs':
        return {
          container: {
            paddingVertical: 2,
            paddingHorizontal: spacing.xs,
            borderRadius: radius.sm,
          },
          text: {
            fontSize: 10,
          },
          iconSize: 10,
          dotSize: 4,
        };
      case 'md':
        return {
          container: {
            paddingVertical: spacing.xs + 2,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
          },
          text: {
            fontSize: typography.size.sm,
          },
          iconSize: 14,
          dotSize: 8,
        };
      default: // sm
        return {
          container: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.sm,
          },
          text: {
            fontSize: typography.size.xs,
          },
          iconSize: 12,
          dotSize: 6,
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: outlined ? 'transparent' : variantColors.bg,
          borderWidth: outlined ? 1 : 0,
          borderColor: variantColors.border,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              backgroundColor: variantColors.text,
            },
          ]}
        />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantColors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: variantColors.text },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

// Helper component for difficulty badges
interface DifficultyBadgeProps {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  size = 'sm',
  style,
}) => {
  const getVariant = (): BadgeVariant => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <BadgePill
      label={difficulty}
      variant={getVariant()}
      size={size}
      dot
      style={style}
    />
  );
};

// Helper component for exercise type badges
interface TypeBadgeProps {
  type: 'Compound' | 'Isolation' | 'Cardio' | 'Flexibility' | string;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  size = 'sm',
  style,
}) => {
  const getConfig = (): { variant: BadgeVariant; icon?: keyof typeof Ionicons.glyphMap } => {
    switch (type?.toLowerCase()) {
      case 'compound':
        return { variant: 'purple', icon: 'layers-outline' };
      case 'isolation':
        return { variant: 'info', icon: 'locate-outline' };
      case 'cardio':
        return { variant: 'orange', icon: 'heart-outline' };
      case 'flexibility':
        return { variant: 'pink', icon: 'body-outline' };
      default:
        return { variant: 'neutral' };
    }
  };

  const config = getConfig();

  return (
    <BadgePill
      label={type}
      variant={config.variant}
      icon={config.icon}
      size={size}
      style={style}
    />
  );
};

// Helper component for status badges
interface StatusBadgeProps {
  status: 'active' | 'completed' | 'pending' | 'failed' | 'paused' | string;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  style,
}) => {
  const getConfig = (): { variant: BadgeVariant; icon?: keyof typeof Ionicons.glyphMap } => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { variant: 'primary', icon: 'play-outline' };
      case 'completed':
        return { variant: 'success', icon: 'checkmark-outline' };
      case 'pending':
        return { variant: 'warning', icon: 'time-outline' };
      case 'failed':
        return { variant: 'error', icon: 'close-outline' };
      case 'paused':
        return { variant: 'info', icon: 'pause-outline' };
      default:
        return { variant: 'neutral' };
    }
  };

  const config = getConfig();

  return (
    <BadgePill
      label={status}
      variant={config.variant}
      icon={config.icon}
      size={size}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: typography.weight.medium,
  },
  icon: {
    marginRight: 4,
  },
  dot: {
    borderRadius: 999,
    marginRight: 6,
  },
});

export default BadgePill;
