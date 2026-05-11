/**
 * DailyInsightCard - Blue accent card with rotating insight text
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

interface DailyInsightCardProps {
  insight: string;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ insight }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="bulb" size={18} color={colors.accent.blue} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Daily Insight</Text>
        <Text style={styles.insightText}>{insight}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default DailyInsightCard;
