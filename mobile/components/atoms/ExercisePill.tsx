/**
 * ExercisePill - Small pill component for muscle group or equipment display
 * High-tech architecture style
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

interface ExercisePillProps {
  label: string;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium';
}

export default function ExercisePill({
  label,
  color = theme.colors.techBlue,
  icon,
  variant = 'outline',
  size = 'small',
}: ExercisePillProps) {
  const getContainerStyle = () => {
    const base = [
      styles.container,
      size === 'medium' && styles.containerMedium,
    ];

    switch (variant) {
      case 'primary':
        return [...base, styles.primaryContainer, { backgroundColor: color }];
      case 'secondary':
        return [...base, styles.secondaryContainer, { backgroundColor: color + '20' }];
      case 'outline':
      default:
        return [...base, styles.outlineContainer, { borderColor: color }];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.black;
      case 'secondary':
      case 'outline':
      default:
        return color;
    }
  };

  return (
    <View style={getContainerStyle()}>
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'medium' ? 12 : 10}
          color={getTextColor()}
        />
      )}
      <Text
        style={[
          styles.text,
          size === 'medium' && styles.textMedium,
          { color: getTextColor() },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  containerMedium: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  primaryContainer: {
    // backgroundColor set dynamically
  },
  secondaryContainer: {
    // backgroundColor set dynamically
  },
  outlineContainer: {
    borderWidth: 1,
    backgroundColor: theme.colors.concreteDark + '40',
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textMedium: {
    fontSize: 11,
    letterSpacing: 1,
  },
});
