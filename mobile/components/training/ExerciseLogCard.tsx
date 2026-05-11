/**
 * ExerciseLogCard - Displays a single exercise log with set-by-set breakdown
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
import type { ExerciseLog } from '../../types/workout.types';

interface ExerciseLogCardProps {
  log: ExerciseLog;
}

interface ParsedSet {
  set: number;
  reps: number;
  weight: number;
  completed: boolean;
}

function parseSetsData(setsData: string | null): ParsedSet[] {
  if (!setsData) return [];
  try {
    return JSON.parse(setsData);
  } catch {
    return [];
  }
}

/**
 * Collapse identical consecutive sets into ranges like "1-4".
 * Two sets are "identical" when reps and weight match.
 */
function collapseSets(sets: ParsedSet[]): { label: string; reps: number; weight: number; completed: boolean; isRange: boolean }[] {
  if (sets.length === 0) return [];

  const result: { label: string; reps: number; weight: number; completed: boolean; isRange: boolean }[] = [];
  let rangeStart = 0;

  for (let i = 1; i <= sets.length; i++) {
    const prev = sets[i - 1];
    const curr = sets[i];

    if (curr && curr.reps === prev.reps && curr.weight === prev.weight) {
      continue;
    }

    // End of a run
    const startSet = sets[rangeStart];
    if (i - 1 === rangeStart) {
      result.push({
        label: String(startSet.set),
        reps: startSet.reps,
        weight: startSet.weight,
        completed: startSet.completed,
        isRange: false,
      });
    } else {
      result.push({
        label: `${startSet.set}-${prev.set}`,
        reps: startSet.reps,
        weight: startSet.weight,
        completed: true,
        isRange: true,
      });
    }
    rangeStart = i;
  }

  return result;
}

/**
 * Determine if a specific set is the PR set.
 * The PR set is the one with the highest weight (ties broken by highest reps).
 */
function findPRSetIndex(sets: ParsedSet[]): number {
  if (sets.length === 0) return -1;
  let best = 0;
  for (let i = 1; i < sets.length; i++) {
    if (
      sets[i].weight > sets[best].weight ||
      (sets[i].weight === sets[best].weight && sets[i].reps > sets[best].reps)
    ) {
      best = i;
    }
  }
  return best;
}

export const ExerciseLogCard: React.FC<ExerciseLogCardProps> = ({ log }) => {
  const sets = parseSetsData(log.sets_data);
  const collapsed = collapseSets(sets);
  const prSetIndex = log.personal_record ? findPRSetIndex(sets) : -1;

  // For collapsed view, mark the collapsed row that contains the PR set
  let prCollapsedLabel = '';
  if (prSetIndex >= 0) {
    const prSetNumber = sets[prSetIndex].set;
    const match = collapsed.find((c) => {
      if (c.isRange) {
        const [start, end] = c.label.split('-').map(Number);
        return prSetNumber >= start && prSetNumber <= end;
      }
      return Number(c.label) === prSetNumber;
    });
    if (match) prCollapsedLabel = match.label;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{log.exercise_name || `Exercise #${log.exercise_id}`}</Text>
        </View>
        {log.personal_record && (
          <View style={styles.prBadge}>
            <Ionicons name="trophy" size={11} color={colors.warning} />
            <Text style={styles.prText}>PR</Text>
          </View>
        )}
      </View>

      {/* Set table */}
      {collapsed.length > 0 && (
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>SET</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>REPS</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>WEIGHT</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.5, textAlign: 'right' }]}>✓</Text>
          </View>

          {/* Table rows */}
          {collapsed.map((row, index) => {
            const isPRRow = row.label === prCollapsedLabel;
            return (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  isPRRow && styles.prRow,
                  index < collapsed.length - 1 && styles.tableRowBorder,
                ]}
              >
                <Text style={[styles.tableCell, styles.setCellLabel, { flex: 0.8 }]}>{row.label}</Text>
                <Text style={[styles.tableCell, isPRRow && styles.prCell, { flex: 1 }]}>{row.reps}</Text>
                <Text style={[styles.tableCell, isPRRow && styles.prCell, { flex: 1 }]}>
                  {row.weight} kg{isPRRow ? ' ★' : ''}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right', color: colors.primary }]}>✓</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Footer totals */}
      <View style={styles.footer}>
        {log.max_weight != null && (
          <Text style={styles.footerText}>Max: {log.max_weight} kg</Text>
        )}
        <Text style={styles.footerText}>Vol: {log.total_volume.toLocaleString()} kg</Text>
        <Text style={styles.footerText}>{log.total_reps} reps</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  prText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.warning,
  },
  table: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.glassLight,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glassLight,
  },
  prRow: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  tableCell: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  setCellLabel: {
    color: colors.textMuted,
  },
  prCell: {
    color: colors.primary,
    fontWeight: typography.weight.semiBold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassLight,
  },
  footerText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
});

export default ExerciseLogCard;
