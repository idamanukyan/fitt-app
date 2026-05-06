/**
 * Data Sync Service
 * Coordinates data synchronization across stores and invalidates caches
 * Handles cross-store events for sleep, measurements, and workouts
 */

import { invalidateRelatedCaches } from '../storage/cache';

// Event types
type SyncEventType =
  | 'workout_completed'
  | 'workout_deleted'
  | 'sleep_entry_changed'
  | 'measurement_changed'
  | 'ai_session_completed'
  | 'achievement_unlocked'
  | 'streak_updated'
  | 'sync_completed';

// Event payload types
interface WorkoutEvent {
  workoutId: string;
  exerciseIds: string[];
  muscleGroups: string[];
  totalVolume: number;
  duration: number;
}

interface SleepEvent {
  date: string;
  duration: number;
  quality: number;
}

interface MeasurementEvent {
  type: string;
  value: number;
  date: string;
}

interface AISessionEvent {
  sessionId: string;
  exerciseId: string;
  formScore: number;
  reps: number;
  xpEarned: number;
}

interface AchievementEvent {
  achievementId: string;
  name: string;
  xpReward: number;
}

interface StreakEvent {
  currentDays: number;
  isNewRecord: boolean;
}

interface SyncCompletedEvent {
  syncedCount: number;
}

type SyncEventPayload =
  | WorkoutEvent
  | SleepEvent
  | MeasurementEvent
  | AISessionEvent
  | AchievementEvent
  | StreakEvent
  | SyncCompletedEvent;

// Subscriber callback type
type EventCallback<T = SyncEventPayload> = (payload: T) => void;

// Store subscribers
const subscribers: Map<SyncEventType, Set<EventCallback>> = new Map();

// Event queue for batching
let eventQueue: Array<{ type: SyncEventType; payload: SyncEventPayload }> = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY = 100; // ms

/**
 * Subscribe to sync events
 */
export function subscribe<T extends SyncEventPayload>(
  eventType: SyncEventType,
  callback: EventCallback<T>
): () => void {
  if (!subscribers.has(eventType)) {
    subscribers.set(eventType, new Set());
  }

  const callbacks = subscribers.get(eventType)!;
  callbacks.add(callback as EventCallback);

  // Return unsubscribe function
  return () => {
    callbacks.delete(callback as EventCallback);
    if (callbacks.size === 0) {
      subscribers.delete(eventType);
    }
  };
}

/**
 * Emit a sync event
 */
export function emit(
  eventType: SyncEventType,
  payload: SyncEventPayload
): void {
  eventQueue.push({ type: eventType, payload });

  // Debounce flush
  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }
  flushTimeout = setTimeout(flushEventQueue, FLUSH_DELAY);
}

/**
 * Flush event queue and notify subscribers
 */
async function flushEventQueue(): Promise<void> {
  const events = [...eventQueue];
  eventQueue = [];
  flushTimeout = null;

  // Group events by type
  const eventsByType = new Map<SyncEventType, SyncEventPayload[]>();
  for (const event of events) {
    if (!eventsByType.has(event.type)) {
      eventsByType.set(event.type, []);
    }
    eventsByType.get(event.type)!.push(event.payload);
  }

  // Process each event type
  for (const [eventType, payloads] of eventsByType) {
    await processEvents(eventType, payloads);
  }
}

/**
 * Process events and notify subscribers
 */
async function processEvents(
  eventType: SyncEventType,
  payloads: SyncEventPayload[]
): Promise<void> {
  console.log(`[DataSync] Processing ${payloads.length} ${eventType} events`);

  // Invalidate relevant caches
  switch (eventType) {
    case 'workout_completed':
    case 'workout_deleted':
      await invalidateRelatedCaches('workout');
      break;
    case 'sleep_entry_changed':
      await invalidateRelatedCaches('sleep');
      break;
    case 'measurement_changed':
      await invalidateRelatedCaches('measurement');
      break;
    case 'ai_session_completed':
      await invalidateRelatedCaches('ai_session');
      break;
    case 'sync_completed':
      await invalidateRelatedCaches('workout');
      break;
    // Other events don't need cache invalidation
  }

  // Notify subscribers
  const callbacks = subscribers.get(eventType);
  if (callbacks) {
    for (const callback of callbacks) {
      for (const payload of payloads) {
        try {
          callback(payload);
        } catch (error) {
          console.error(`[DataSync] Subscriber error for ${eventType}:`, error);
        }
      }
    }
  }
}

// Convenience methods for common events

/**
 * Notify that a workout was completed
 */
export function notifyWorkoutCompleted(data: WorkoutEvent): void {
  emit('workout_completed', data);
}

/**
 * Notify that a sleep entry changed
 */
export function notifySleepChanged(data: SleepEvent): void {
  emit('sleep_entry_changed', data);
}

/**
 * Notify that a measurement changed
 */
export function notifyMeasurementChanged(data: MeasurementEvent): void {
  emit('measurement_changed', data);
}

/**
 * Notify that an AI session completed
 */
export function notifyAISessionCompleted(data: AISessionEvent): void {
  emit('ai_session_completed', data);
}

/**
 * Notify that an achievement was unlocked
 */
export function notifyAchievementUnlocked(data: AchievementEvent): void {
  emit('achievement_unlocked', data);
}

/**
 * Notify that the streak was updated
 */
export function notifyStreakUpdated(data: StreakEvent): void {
  emit('streak_updated', data);
}

/**
 * Notify that sync is completed
 */
export function notifySyncCompleted(data: SyncCompletedEvent): void {
  emit('sync_completed', data);
}

// Cross-store correlation helpers

/**
 * Get sleep data for a date range (for correlation analysis)
 * In production, this would fetch from the sleep store
 */
export async function getSleepDataForPeriod(
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; duration: number; quality: number }>> {
  // Mock implementation
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      duration: 6 + Math.random() * 2.5,
      quality: Math.floor(Math.random() * 3) + 3,
    };
  });
}

/**
 * Get measurements for a date range (for correlation analysis)
 * In production, this would fetch from the measurements store
 */
export async function getMeasurementsForPeriod(
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; weight: number | null }>> {
  // Mock implementation
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      weight: Math.random() > 0.7 ? 80 + Math.random() * 5 : null,
    };
  });
}

/**
 * Get workout performance for a date range
 * In production, this would fetch from the training store
 */
export async function getWorkoutDataForPeriod(
  startDate: string,
  endDate: string
): Promise<
  Array<{
    date: string;
    score: number | null;
    formScore: number | null;
    volume: number | null;
  }>
> {
  // Mock implementation
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const hadWorkout = Math.random() > 0.35;
    return {
      date: date.toISOString().split('T')[0],
      score: hadWorkout ? 70 + Math.random() * 25 : null,
      formScore: hadWorkout ? 65 + Math.random() * 30 : null,
      volume: hadWorkout ? 10000 + Math.random() * 10000 : null,
    };
  });
}

/**
 * Calculate correlation between two data series
 */
export function calculateCorrelation(
  seriesA: number[],
  seriesB: number[]
): { coefficient: number; strength: 'weak' | 'moderate' | 'strong' | 'very_strong' } {
  if (seriesA.length !== seriesB.length || seriesA.length < 3) {
    return { coefficient: 0, strength: 'weak' };
  }

  const n = seriesA.length;
  const meanA = seriesA.reduce((a, b) => a + b, 0) / n;
  const meanB = seriesB.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumSqA = 0;
  let sumSqB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = seriesA[i] - meanA;
    const diffB = seriesB[i] - meanB;
    numerator += diffA * diffB;
    sumSqA += diffA * diffA;
    sumSqB += diffB * diffB;
  }

  const denominator = Math.sqrt(sumSqA * sumSqB);
  const coefficient = denominator === 0 ? 0 : numerator / denominator;

  const absCoeff = Math.abs(coefficient);
  let strength: 'weak' | 'moderate' | 'strong' | 'very_strong' = 'weak';
  if (absCoeff >= 0.8) strength = 'very_strong';
  else if (absCoeff >= 0.6) strength = 'strong';
  else if (absCoeff >= 0.4) strength = 'moderate';

  return { coefficient, strength };
}

/**
 * Build correlation data from multiple sources
 */
export async function buildCorrelationData(
  startDate: string,
  endDate: string
): Promise<
  Array<{
    date: string;
    sleepDuration: number | null;
    sleepQuality: number | null;
    weight: number | null;
    workoutScore: number | null;
    formScore: number | null;
  }>
> {
  const [sleep, measurements, workouts] = await Promise.all([
    getSleepDataForPeriod(startDate, endDate),
    getMeasurementsForPeriod(startDate, endDate),
    getWorkoutDataForPeriod(startDate, endDate),
  ]);

  // Merge by date
  const dateMap = new Map<
    string,
    {
      date: string;
      sleepDuration: number | null;
      sleepQuality: number | null;
      weight: number | null;
      workoutScore: number | null;
      formScore: number | null;
    }
  >();

  for (const s of sleep) {
    dateMap.set(s.date, {
      date: s.date,
      sleepDuration: s.duration,
      sleepQuality: s.quality,
      weight: null,
      workoutScore: null,
      formScore: null,
    });
  }

  for (const m of measurements) {
    const existing = dateMap.get(m.date);
    if (existing) {
      existing.weight = m.weight;
    }
  }

  for (const w of workouts) {
    const existing = dateMap.get(w.date);
    if (existing) {
      existing.workoutScore = w.score;
      existing.formScore = w.formScore;
    }
  }

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export default {
  subscribe,
  emit,
  notifyWorkoutCompleted,
  notifySleepChanged,
  notifyMeasurementChanged,
  notifyAISessionCompleted,
  notifyAchievementUnlocked,
  notifyStreakUpdated,
  notifySyncCompleted,
  getSleepDataForPeriod,
  getMeasurementsForPeriod,
  getWorkoutDataForPeriod,
  calculateCorrelation,
  buildCorrelationData,
};
