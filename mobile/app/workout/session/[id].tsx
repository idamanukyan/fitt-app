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
