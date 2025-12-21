/**
 * ClientCard - Coach Dashboard Client Card Component
 * Neon-Brutalist design with Caribbean Green accent
 * Used in Coach Dashboard to display client information
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

interface ClientCardProps {
  clientName: string;
  lastActive: string;
  progress: number;
  onPress?: () => void;
}

export default function ClientCard({
  clientName,
  lastActive,
  progress,
  onPress,
}: ClientCardProps) {
  return (
    <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.8}>
      {/* Avatar Circle */}
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={32} color={theme.colors.lightGreen} />
      </View>

      {/* Client Info */}
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{clientName.toUpperCase()}</Text>
        <Text style={styles.lastActive}>{lastActive}</Text>
        <View style={styles.progressBarSmall}>
          <LinearGradient
            colors={theme.gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
          />
        </View>
      </View>

      {/* Progress Ring */}
      <View style={styles.progressRing}>
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  clientCard: {
    width: '47%',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.lightGreenBorder,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.darkGreen,
    borderWidth: 2,
    borderColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  clientInfo: {
    width: '100%',
    alignItems: 'center',
  },
  clientName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  lastActive: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    marginBottom: theme.spacing.sm,
  },
  progressBarSmall: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.darkGreen,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
  },
  progressRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  progressPercentage: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.lightGreen,
  },
});
