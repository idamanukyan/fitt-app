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
