# Workout Session Detail Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full detail screen for viewing past workout sessions with set-by-set breakdowns, AI form score, stats, notes, rating, share action, and offline-pending session support.

**Architecture:** New Expo Router screen at `/workout/session/[id]` decomposed into 3 components (SessionHeader, SessionSummaryCard, ExerciseLogCard). Data fetched from `workoutService.getSessionById()` for synced sessions or read from `offlineSyncStore` queue for pending sessions. Navigation triggered from `handleHistoryPress` in TrainingScreen.

**Tech Stack:** React Native, Expo Router, Zustand (offlineSyncStore), existing workoutService API client, design tokens, Ionicons, LinearGradient, React Native Share API.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `mobile/components/training/SessionHeader.tsx` | Back button, share action, workout title, date, rating stars, time range |
| `mobile/components/training/SessionSummaryCard.tsx` | 4 stat tiles, AI form score card, pending sync badge |
| `mobile/components/training/ExerciseLogCard.tsx` | Exercise name, muscle group, set table, PR badge, per-exercise totals |
| `mobile/app/workout/session/[id].tsx` | Route screen — data fetching, ScrollView layout, loading/error/empty states |
| `mobile/app/workout/_layout.tsx` | Add `session/[id]` route to stack (modify existing) |
| `mobile/screens/TrainingScreen.tsx` | Wire `handleHistoryPress` to navigate (modify existing) |
| `mobile/components/training/index.ts` | Export new components (modify existing) |

---

### Task 1: ExerciseLogCard Component

**Files:**
- Create: `mobile/components/training/ExerciseLogCard.tsx`

This is the most reusable and self-contained component — no dependencies on other new files.

- [ ] **Step 1: Create ExerciseLogCard**

Create `mobile/components/training/ExerciseLogCard.tsx`:

```typescript
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
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit --pretty 2>&1 | grep -E "ExerciseLogCard|error" | head -20
```

Expected: No errors related to ExerciseLogCard.

- [ ] **Step 3: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit && git add mobile/components/training/ExerciseLogCard.tsx && git commit -m "feat: add ExerciseLogCard component with set table and PR highlighting"
```

---

### Task 2: SessionSummaryCard Component

**Files:**
- Create: `mobile/components/training/SessionSummaryCard.tsx`

- [ ] **Step 1: Create SessionSummaryCard**

Create `mobile/components/training/SessionSummaryCard.tsx`:

```typescript
/**
 * SessionSummaryCard - Summary stats, AI form score, and pending sync badge
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

interface SessionStats {
  totalVolume: number;
  totalReps: number;
  totalExercises: number;
  caloriesBurned: number | null;
}

interface SessionSummaryCardProps {
  stats: SessionStats;
  aiScore?: number;
  isPendingSync?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return colors.success;
  if (score >= 75) return colors.primary;
  if (score >= 60) return colors.warning;
  return colors.error;
};

const statTiles: { key: keyof SessionStats; label: string; color: string; bgColor: string; borderColor: string }[] = [
  {
    key: 'totalVolume',
    label: 'Volume (kg)',
    color: colors.primary,
    bgColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.15)',
  },
  {
    key: 'totalReps',
    label: 'Total Reps',
    color: colors.secondary,
    bgColor: 'rgba(167, 139, 250, 0.08)',
    borderColor: 'rgba(167, 139, 250, 0.15)',
  },
  {
    key: 'totalExercises',
    label: 'Exercises',
    color: colors.accent.blue,
    bgColor: 'rgba(96, 165, 250, 0.08)',
    borderColor: 'rgba(96, 165, 250, 0.15)',
  },
  {
    key: 'caloriesBurned',
    label: 'Calories',
    color: colors.accent.orange,
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.15)',
  },
];

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  stats,
  aiScore,
  isPendingSync = false,
}) => {
  return (
    <View>
      {/* Pending sync badge */}
      {isPendingSync && (
        <View style={styles.syncBadge}>
          <Ionicons name="time-outline" size={14} color={colors.warning} />
          <Text style={styles.syncBadgeText}>
            Pending sync — will upload when you're back online
          </Text>
        </View>
      )}

      {/* Stat tiles */}
      <View style={styles.tilesRow}>
        {statTiles.map((tile) => {
          const value = stats[tile.key];
          const displayValue = value != null ? (tile.key === 'totalVolume' ? value.toLocaleString() : String(value)) : '—';
          return (
            <View
              key={tile.key}
              style={[
                styles.tile,
                { backgroundColor: tile.bgColor, borderColor: tile.borderColor },
              ]}
            >
              <Text style={[styles.tileValue, { color: tile.color }]}>{displayValue}</Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </View>
          );
        })}
      </View>

      {/* AI Form Score */}
      {aiScore != null && (
        <View style={styles.aiScoreCard}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(aiScore) }]}>
            <Text style={[styles.scoreValue, { color: getScoreColor(aiScore) }]}>{aiScore}</Text>
          </View>
          <View style={styles.aiScoreText}>
            <Text style={styles.aiScoreTitle}>AI Form Score</Text>
            <Text style={styles.aiScoreDesc}>
              {aiScore >= 90
                ? 'Excellent form throughout the session'
                : aiScore >= 75
                ? 'Good form with minor corrections needed'
                : aiScore >= 60
                ? 'Moderate form — review flagged exercises'
                : 'Form needs attention — check exercise details'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  syncBadgeText: {
    flex: 1,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.warning,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tileValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  tileLabel: {
    fontSize: 10,
    color: colors.textDisabled,
    marginTop: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  aiScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scoreValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  aiScoreText: {
    flex: 1,
  },
  aiScoreTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  aiScoreDesc: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default SessionSummaryCard;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit --pretty 2>&1 | grep -E "SessionSummaryCard|error" | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit && git add mobile/components/training/SessionSummaryCard.tsx && git commit -m "feat: add SessionSummaryCard with stat tiles, AI score, and sync badge"
```

---

### Task 3: SessionHeader Component

**Files:**
- Create: `mobile/components/training/SessionHeader.tsx`

- [ ] **Step 1: Create SessionHeader**

Create `mobile/components/training/SessionHeader.tsx`:

```typescript
/**
 * SessionHeader - Navigation bar, workout title, date, rating, and time details
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';
import type { WorkoutSession } from '../../types/workout.types';
import type { ExerciseLog } from '../../types/workout.types';

interface SessionHeaderProps {
  session: WorkoutSession;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function buildShareText(session: WorkoutSession): string {
  const title = session.title || 'Workout';
  const date = formatDate(session.started_at);
  const duration = session.duration_minutes ? `${session.duration_minutes} min` : '';
  const volume = `${session.total_volume.toLocaleString()} kg volume`;
  const reps = `${session.total_reps} reps`;
  const exercises = `${session.total_exercises} exercises`;

  const header = `${title} — ${date}`;
  const stats = [duration, volume, reps, exercises].filter(Boolean).join(' · ');

  const exerciseLines = session.exercise_logs.map((log: ExerciseLog) => {
    const name = log.exercise_name || `Exercise #${log.exercise_id}`;
    const sets = `${log.total_sets} sets`;
    const maxW = log.max_weight ? `Max ${log.max_weight}kg` : '';
    const pr = log.personal_record ? ' 🏆 PR' : '';
    return `${name}: ${[sets, maxW].filter(Boolean).join(' · ')}${pr}`;
  });

  return `${header}\n${stats}\n\n${exerciseLines.join('\n')}\n\nTracked with HyperFit`;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({ session }) => {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({ message: buildShareText(session) });
    } catch {
      // User cancelled or share failed — no action needed
    }
  };

  return (
    <View>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Workout Detail</Text>
        <TouchableOpacity style={styles.navButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Title area */}
      <View style={styles.titleArea}>
        <Text style={styles.workoutTitle}>{session.title || 'Workout'}</Text>
        <Text style={styles.date}>{formatDate(session.started_at)}</Text>

        {/* Rating stars */}
        {session.rating != null && session.rating > 0 && (
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={18}
                color={star <= (session.rating ?? 0) ? colors.warning : colors.textDisabled}
              />
            ))}
          </View>
        )}

        {/* Time details */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatTime(session.started_at)}
            {session.ended_at ? ` → ${formatTime(session.ended_at)}` : ''}
          </Text>
          {session.duration_minutes != null && (
            <>
              <Text style={styles.timeDot}>·</Text>
              <Text style={styles.timeText}>{session.duration_minutes} min</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  titleArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  workoutTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  timeDot: {
    fontSize: typography.size.xs,
    color: colors.textDisabled,
  },
});

export default SessionHeader;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit --pretty 2>&1 | grep -E "SessionHeader|error" | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit && git add mobile/components/training/SessionHeader.tsx && git commit -m "feat: add SessionHeader with navigation, title, rating, and share"
```

---

### Task 4: Export New Components

**Files:**
- Modify: `mobile/components/training/index.ts`

- [ ] **Step 1: Add exports to barrel file**

Append to the end of `mobile/components/training/index.ts`:

```typescript
// Session Detail Components
export { SessionHeader } from './SessionHeader';
export { SessionSummaryCard } from './SessionSummaryCard';
export { ExerciseLogCard } from './ExerciseLogCard';
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit && git add mobile/components/training/index.ts && git commit -m "feat: export session detail components from training barrel"
```

---

### Task 5: Session Detail Screen Route

**Files:**
- Create: `mobile/app/workout/session/[id].tsx`
- Modify: `mobile/app/workout/_layout.tsx`

- [ ] **Step 1: Add route to workout stack layout**

In `mobile/app/workout/_layout.tsx`, add a `Stack.Screen` entry for the new route. Insert after the existing `<Stack.Screen name="session"` block (before the `ai-session` screen):

```typescript
      <Stack.Screen name="session/[id]" />
```

- [ ] **Step 2: Create the detail screen**

Create `mobile/app/workout/session/[id].tsx`:

```typescript
/**
 * Workout Session Detail Screen
 * Shows full breakdown of a past workout session
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  typography,
  spacing,
  radius,
  gradients,
} from '../../../design/tokens';
import { getSessionById } from '../../../services/workoutService';
import { useOfflineSyncStore } from '../../../src/stores/offlineSyncStore';
import { SessionHeader } from '../../../components/training/SessionHeader';
import { SessionSummaryCard } from '../../../components/training/SessionSummaryCard';
import { ExerciseLogCard } from '../../../components/training/ExerciseLogCard';
import type { WorkoutSession } from '../../../types/workout.types';

interface PendingSessionData {
  session: WorkoutSession;
  isPending: true;
}

/**
 * Try to find a pending session in the offline queue by client_id.
 * Returns a WorkoutSession-shaped object built from queue payload.
 */
function findPendingSession(id: string): PendingSessionData | null {
  const queue = useOfflineSyncStore.getState().queue;
  const pendingOp = queue.find(
    (op) => op.type === 'create_session' && (op.payload as any).client_id === id
  );

  if (!pendingOp) return null;

  const payload = pendingOp.payload as any;
  return {
    isPending: true,
    session: {
      id: 0,
      user_id: 0,
      user_workout_id: payload.user_workout_id ?? null,
      title: payload.title ?? null,
      notes: payload.notes ?? null,
      started_at: payload.started_at,
      ended_at: payload.ended_at ?? null,
      duration_minutes: payload.duration_minutes ?? null,
      total_volume: payload.total_volume ?? 0,
      total_reps: payload.total_reps ?? 0,
      total_exercises: payload.total_exercises ?? 0,
      calories_burned: payload.calories_burned ?? null,
      is_completed: payload.is_completed ?? false,
      rating: payload.rating ?? null,
      created_at: pendingOp.createdAt,
      exercise_logs: (payload.exercise_logs ?? []).map((log: any, index: number) => ({
        id: 0,
        exercise_id: log.exercise_id,
        exercise_name: log.exercise_name ?? undefined,
        order_index: log.order_index ?? index,
        sets_data: log.sets_data ?? null,
        total_sets: log.total_sets ?? 0,
        total_reps: log.total_reps ?? 0,
        max_weight: log.max_weight ?? null,
        total_volume: log.total_volume ?? 0,
        duration_seconds: log.duration_seconds ?? null,
        distance_km: log.distance_km ?? null,
        notes: log.notes ?? null,
        personal_record: log.personal_record ?? false,
        created_at: pendingOp.createdAt,
      })),
    },
  };
}

export default function WorkoutSessionDetailScreen() {
  const router = useRouter();
  const { id, aiScore: aiScoreParam } = useLocalSearchParams<{ id: string; aiScore?: string }>();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isPendingSync, setIsPendingSync] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (!id) return;
    loadSession(id);
  }, [id]);

  useEffect(() => {
    if (session) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [session]);

  async function loadSession(sessionId: string) {
    setIsLoading(true);
    setError(null);

    // Check offline queue first
    const pending = findPendingSession(sessionId);
    if (pending) {
      setSession(pending.session);
      setIsPendingSync(true);
      setIsLoading(false);
      return;
    }

    // Fetch from API
    try {
      const numericId = Number(sessionId);
      if (isNaN(numericId)) {
        setError('Invalid session ID');
        setIsLoading(false);
        return;
      }
      const data = await getSessionById(numericId);
      setSession(data);
      setIsPendingSync(false);
    } catch (err) {
      setError('Failed to load workout session');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <LinearGradient colors={gradients.background} style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }

  if (error || !session) {
    return (
      <LinearGradient colors={gradients.background} style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Session not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => id && loadSession(id)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // AI score is local-only (not in API response), passed via route params from TrainingScreen
  const aiScore = aiScoreParam ? Number(aiScoreParam) : undefined;

  return (
    <LinearGradient colors={gradients.background} style={{ flex: 1, paddingTop: insets.top }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SessionHeader session={session} />

          <View style={styles.body}>
            <SessionSummaryCard
              stats={{
                totalVolume: session.total_volume,
                totalReps: session.total_reps,
                totalExercises: session.total_exercises,
                caloriesBurned: session.calories_burned,
              }}
              aiScore={aiScore}
              isPendingSync={isPendingSync}
            />

            {/* Exercise logs */}
            {session.exercise_logs.length > 0 && (
              <View>
                <Text style={styles.sectionLabel}>EXERCISES</Text>
                {session.exercise_logs.map((log) => (
                  <ExerciseLogCard key={log.id || log.exercise_id} log={log} />
                ))}
              </View>
            )}

            {/* Notes */}
            {session.notes && (
              <View>
                <Text style={styles.sectionLabel}>NOTES</Text>
                <View style={styles.notesCard}>
                  <Text style={styles.notesText}>{session.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  retryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  backLink: {
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  body: {
    paddingHorizontal: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  notesCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  notesText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: typography.size.sm * 1.5,
  },
});
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit --pretty 2>&1 | grep -E "session/\[id\]|error" | head -20
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit && git add mobile/app/workout/session/ mobile/app/workout/_layout.tsx && git commit -m "feat: add workout session detail screen with offline support"
```

---

### Task 6: Wire Navigation from TrainingScreen

**Files:**
- Modify: `mobile/screens/TrainingScreen.tsx`

- [ ] **Step 1: Update handleHistoryPress**

In `mobile/screens/TrainingScreen.tsx`, replace the `handleHistoryPress` callback (lines 145-148):

**Old code:**
```typescript
  const handleHistoryPress = useCallback((entry: TrainingHistoryEntry) => {
    // TODO: Show history detail
    console.log('History entry pressed:', entry.exerciseName);
  }, []);
```

**New code:**
```typescript
  const handleHistoryPress = useCallback((entry: TrainingHistoryEntry) => {
    router.push({
      pathname: '/workout/session/[id]',
      params: { id: entry.id, aiScore: String(entry.aiScore) },
    });
  }, [router]);
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit --pretty 2>&1 | grep -E "TrainingScreen|error" | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit && git add mobile/screens/TrainingScreen.tsx && git commit -m "feat: wire workout history card to session detail screen"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run full TypeScript check**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 2: Run existing tests to ensure no regressions**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest --no-coverage 2>&1 | tail -20
```

Expected: All existing tests pass.

- [ ] **Step 3: Verify the route exists in file structure**

```bash
ls -la /Users/ida/Desktop/projects/hyperfit/mobile/app/workout/session/
```

Expected: `[id].tsx` exists.

- [ ] **Step 4: Verify all new components are exported**

```bash
grep -E "SessionHeader|SessionSummaryCard|ExerciseLogCard" /Users/ida/Desktop/projects/hyperfit/mobile/components/training/index.ts
```

Expected: All 3 exports present.
