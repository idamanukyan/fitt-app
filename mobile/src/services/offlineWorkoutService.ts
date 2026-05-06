import { v4 as uuidv4 } from 'uuid';
import { useOfflineSyncStore } from '../stores/offlineSyncStore';
import * as workoutService from '../../services/workoutService';
import { WorkoutSessionCreate, WorkoutSessionUpdate } from '../../types/workout.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emit } from './dataSyncService';

/**
 * Create a workout session, falling back to offline queue if unavailable.
 * Adds a client_id for server-side deduplication.
 */
export async function createSessionOffline(
  data: Omit<WorkoutSessionCreate, 'client_id'> & { client_id?: string }
): Promise<any | null> {
  const store = useOfflineSyncStore.getState();
  const clientId = data.client_id || uuidv4();
  const payload: WorkoutSessionCreate = { ...data, client_id: clientId } as WorkoutSessionCreate & { client_id: string };

  if (!store.isOnline) {
    store.enqueue({ type: 'create_session', payload });
    return null;
  }

  try {
    const result = await workoutService.createSession(payload);
    return result;
  } catch (error) {
    // API failed — queue for later
    store.enqueue({ type: 'create_session', payload });
    return null;
  }
}

/**
 * Update a workout session, falling back to offline queue.
 */
export async function updateSessionOffline(
  sessionId: number,
  data: WorkoutSessionUpdate
): Promise<any | null> {
  const store = useOfflineSyncStore.getState();

  if (!store.isOnline) {
    store.enqueue({ type: 'update_session', payload: { ...data, _sessionId: sessionId } as any });
    return null;
  }

  try {
    const result = await workoutService.updateSession(sessionId, data);
    return result;
  } catch (error) {
    store.enqueue({ type: 'update_session', payload: { ...data, _sessionId: sessionId } as any });
    return null;
  }
}

/**
 * Attempt to refresh the auth token silently.
 */
async function silentTokenRefresh(): Promise<boolean> {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) return false;

    const { access_token, refresh_token } = await response.json();
    await AsyncStorage.setItem('auth_token', access_token);
    if (refresh_token) {
      await AsyncStorage.setItem('refresh_token', refresh_token);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Flush the sync queue — process all pending operations in FIFO order.
 */
export async function flushSyncQueue(): Promise<void> {
  const store = useOfflineSyncStore.getState();

  if (store.isFlushing || !store.isOnline) return;
  store.setFlushing(true);

  try {
    const pendingOps = store.queue.filter((op) => op.status === 'pending');

    for (const op of pendingOps) {
      store.markSyncing(op.id);

      try {
        await processOperation(op);
        store.removeOperation(op.id);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          const refreshed = await silentTokenRefresh();
          if (refreshed) {
            try {
              await processOperation(op);
              store.removeOperation(op.id);
              continue;
            } catch {
              // Fall through to retry logic
            }
          }
        }

        store.incrementRetry(op.id);
      }
    }

    const remaining = useOfflineSyncStore.getState().queue.filter((op) => op.status === 'pending');
    if (remaining.length < pendingOps.length) {
      store.updateLastSynced();
      emit('sync_completed' as any, { syncedCount: pendingOps.length - remaining.length } as any);
    }
  } finally {
    useOfflineSyncStore.getState().setFlushing(false);
  }
}

async function processOperation(op: { type: string; payload: any }): Promise<void> {
  switch (op.type) {
    case 'create_session':
      await workoutService.createSession(op.payload);
      break;
    case 'update_session': {
      const { _sessionId, ...data } = op.payload;
      await workoutService.updateSession(_sessionId, data);
      break;
    }
    case 'complete_session': {
      const { _sessionId: id, ...rest } = op.payload;
      await workoutService.completeSession(id, rest.rating);
      break;
    }
  }
}
