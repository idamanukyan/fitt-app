import { useEffect, useRef } from 'react';
import { useOfflineSyncStore } from '../stores/offlineSyncStore';
import { getMyWorkouts, getExerciseById } from '../../services/workoutService';
import { getFromCache, saveToCache, TTL } from '../storage/cache';
import { Exercise } from '../../types/workout.types';

const MAX_CONCURRENT = 5;
const EXERCISE_CACHE_KEY = (id: number) => `exercise_detail_${id}`;

/**
 * Pre-caches exercise details for all exercises in the user's saved workouts.
 * Runs once on mount when online. Non-blocking, silent.
 */
export function usePreCacheWorkouts() {
  const isOnline = useOfflineSyncStore((s) => s.isOnline);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isOnline || hasRun.current) return;
    hasRun.current = true;

    preCacheExercises().catch((err) => {
      console.warn('[PreCache] Failed to pre-cache exercises:', err);
      // Reset so it can retry next time
      hasRun.current = false;
    });
  }, [isOnline]);
}

async function preCacheExercises(): Promise<void> {
  // Fetch user's workouts
  const workouts = await getMyWorkouts();

  // Extract unique exercise IDs
  const exerciseIds = new Set<number>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      exerciseIds.add(exercise.exercise_id);
    }
  }

  // Filter out already-cached exercises
  const uncachedIds: number[] = [];
  for (const id of exerciseIds) {
    const cached = await getFromCache<Exercise>(EXERCISE_CACHE_KEY(id));
    if (!cached) {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length === 0) return;

  // Fetch in batches of MAX_CONCURRENT
  for (let i = 0; i < uncachedIds.length; i += MAX_CONCURRENT) {
    const batch = uncachedIds.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.allSettled(
      batch.map((id) => getExerciseById(id))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        await saveToCache(
          EXERCISE_CACHE_KEY(result.value.id),
          result.value,
          TTL.EXERCISE_DETAIL
        );
      }
    }
  }

  console.log(`[PreCache] Cached ${uncachedIds.length} exercises for offline use`);
}
