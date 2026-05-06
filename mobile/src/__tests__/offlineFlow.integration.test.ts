/**
 * Integration test: simulates going offline, creating a session,
 * coming back online, and verifying the queue flushes.
 */
import { useOfflineSyncStore } from '../stores/offlineSyncStore';
import { createSessionOffline, flushSyncQueue } from '../services/offlineWorkoutService';

jest.mock('../../services/workoutService', () => ({
  createSession: jest.fn(),
  updateSession: jest.fn(),
  completeSession: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: () => `uuid-${Date.now()}-${Math.random()}`,
}));

import * as workoutService from '../../services/workoutService';

const mockCreateSession = workoutService.createSession as jest.MockedFunction<typeof workoutService.createSession>;

beforeEach(() => {
  useOfflineSyncStore.getState().reset();
  jest.clearAllMocks();
});

describe('Offline flow integration', () => {
  it('full cycle: offline create → reconnect → flush → synced', async () => {
    // 1. Go offline
    useOfflineSyncStore.getState().setOnline(false);

    // 2. Create a session while offline
    const result = await createSessionOffline({
      started_at: '2024-01-15T10:00:00',
      ended_at: '2024-01-15T11:00:00',
      duration_minutes: 60,
      total_volume: 5000,
      total_reps: 100,
      total_exercises: 5,
      is_completed: true,
      exercise_logs: [
        {
          exercise_id: 1,
          order_index: 0,
          sets_data: JSON.stringify([
            { set: 1, reps: 10, weight: 60, completed: true },
            { set: 2, reps: 8, weight: 60, completed: true },
          ]),
          total_sets: 2,
          total_reps: 18,
          max_weight: 60,
          total_volume: 1080,
        },
      ],
    });

    // Returns null (queued, not sent)
    expect(result).toBeNull();
    expect(useOfflineSyncStore.getState().queue).toHaveLength(1);
    expect(mockCreateSession).not.toHaveBeenCalled();

    // 3. Come back online
    useOfflineSyncStore.getState().setOnline(true);
    mockCreateSession.mockResolvedValue({ id: 42 } as any);

    // 4. Flush the queue (simulates what useNetworkStatus triggers)
    await flushSyncQueue();

    // 5. Verify synced
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        started_at: '2024-01-15T10:00:00',
        is_completed: true,
        client_id: expect.any(String),
      })
    );
    expect(useOfflineSyncStore.getState().queue).toHaveLength(0);
    expect(useOfflineSyncStore.getState().lastSyncedAt).not.toBeNull();
  });

  it('retry logic: increments retryCount on failure', async () => {
    useOfflineSyncStore.getState().setOnline(false);

    await createSessionOffline({
      started_at: '2024-01-15T10:00:00',
      exercise_logs: [],
    });

    useOfflineSyncStore.getState().setOnline(true);
    mockCreateSession.mockRejectedValue(new Error('Server Error'));

    await flushSyncQueue();

    const queue = useOfflineSyncStore.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].retryCount).toBe(1);
    expect(queue[0].status).not.toBe('failed'); // Not failed yet (< 3 retries)
  });
});
