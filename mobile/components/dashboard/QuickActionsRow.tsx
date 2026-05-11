/**
 * QuickActionsRow - 4 icon buttons for common actions
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface QuickActionsRowProps {
  onLogMeal: () => void;
  onAddWater: () => void;
  onAskAI: () => void;
  onWeighIn: () => void;
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={styles.actionButton}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onLogMeal,
  onAddWater,
  onAskAI,
  onWeighIn,
}) => {
  return (
    <View style={styles.container}>
      <ActionButton
        icon="camera"
        label="Log Meal"
        color={colors.primary}
        onPress={onLogMeal}
      />
      <ActionButton
        icon="water"
        label="Add Water"
        color={colors.accent.blue}
        onPress={onAddWater}
      />
      <ActionButton
        icon="chatbubbles"
        label="Ask AI"
        color={colors.secondary}
        onPress={onAskAI}
      />
      <ActionButton
        icon="scale"
        label="Weigh In"
        color={colors.accent.orange}
        onPress={onWeighIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
});

export default QuickActionsRow;
