/**
 * QuickActionsRow - 2x2 grid of quick action buttons
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================
export interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  action: string;
}

export interface QuickActionsRowProps {
  actions: QuickAction[];
  onAction: (action: string) => void;
}

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================
interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, color, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{ width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2 }}
    >
      <View style={styles.quickAction}>
        <View style={[styles.quickActionIconWrap, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// QUICK ACTIONS ROW
// ============================================================================
export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  actions,
  onAction,
}) => (
  <View style={styles.quickActionsGrid}>
    {actions.map((item) => (
      <QuickActionButton
        key={item.action}
        icon={item.icon}
        label={item.label}
        color={item.color}
        onPress={() => onAction(item.action)}
      />
    ))}
  </View>
);

export default QuickActionsRow;

const styles = StyleSheet.create({
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  quickAction: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
});
