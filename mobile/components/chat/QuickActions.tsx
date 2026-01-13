/**
 * QuickActions Component
 *
 * Quick action buttons for specialized AI features
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatTokens } from './chatTypes';

export interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  prompt: string;
}

interface QuickActionsProps {
  onActionPress: (action: QuickAction) => void;
  disabled?: boolean;
}

export const defaultQuickActions: QuickAction[] = [
  {
    id: 'workout',
    label: 'Workout',
    icon: 'barbell-outline',
    color: '#EF4444',
    prompt: 'Create a workout for me today',
  },
  {
    id: 'meal-plan',
    label: 'Meal Plan',
    icon: 'restaurant-outline',
    color: '#10B981',
    prompt: 'Help me plan my meals for today',
  },
  {
    id: 'exercise',
    label: 'Exercise Tips',
    icon: 'body-outline',
    color: '#3B82F6',
    prompt: 'Explain how to do a proper deadlift',
  },
  {
    id: 'motivation',
    label: 'Motivation',
    icon: 'flash-outline',
    color: '#F59E0B',
    prompt: 'I need some motivation today',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: 'nutrition-outline',
    color: '#8B5CF6',
    prompt: 'What should I eat for muscle gain?',
  },
  {
    id: 'recovery',
    label: 'Recovery',
    icon: 'medical-outline',
    color: '#EC4899',
    prompt: 'How can I improve my recovery after workouts?',
  },
];

export default function QuickActions({ onActionPress, disabled = false }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {defaultQuickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              { borderColor: action.color },
              disabled && styles.disabled,
            ]}
            onPress={() => onActionPress(action)}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
              <Ionicons name={action.icon} size={20} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: chatTokens.spacing.md,
  },
  title: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.textMuted,
    paddingHorizontal: chatTokens.spacing.lg,
    marginBottom: chatTokens.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: chatTokens.spacing.lg,
    gap: chatTokens.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: chatTokens.colors.cardBg,
    borderRadius: chatTokens.borderRadius.lg,
    paddingVertical: chatTokens.spacing.sm,
    paddingHorizontal: chatTokens.spacing.md,
    borderWidth: 1,
    gap: chatTokens.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    ...chatTokens.typography.body,
    color: chatTokens.colors.textPrimary,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});
