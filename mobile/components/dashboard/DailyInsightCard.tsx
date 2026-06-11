/**
 * DailyInsightCard - Warning-themed card with rotating insight text
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';

export interface DailyInsightCardProps {
  insight: string;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ insight }) => (
  <View style={styles.insightCard}>
    <View style={styles.insightIcon}>
      <Ionicons name="bulb" size={18} color={colors.warning} />
    </View>
    <Text style={styles.insightText}>{insight}</Text>
  </View>
);

export default DailyInsightCard;

const styles = StyleSheet.create({
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  insightText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
