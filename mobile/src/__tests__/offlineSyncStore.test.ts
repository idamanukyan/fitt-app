/**
 * @jest-environment node
 */
import { useOfflineSyncStore } from '../stores/offlineSyncStore';

// Reset store between tests
beforeEach(() => {
  useOfflineSyncStore.getState().reset();
});

describe('offlineSyncStore', () => {
  it('enqueues a pending operation', () => {
    const { enqueue } = useOfflineSyncStore.getState();

    enqueue({
      type: 'create_session',
      payload: {
        client_id: 'test-uuid-1',
        started_at: '2024-01-15T10:00:00',
        exercise_logs: [],
      },
    });

    const { queue } = useOfflineSyncStore.getState();
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('create_session');
    expect(queue[0].status).toBe('pending');
    expect(queue[0].retryCount).toBe(0);
    expect(queue[0].id).toBeDefined();
  });

  it('removes an operation by id', () => {
    const { enqueue } = useOfflineSyncStore.getState();

    enqueue({
      type: 'create_session',
      payload: { client_id: 'uuid-1', started_at: '2024-01-15T10:00:00', exercise_logs: [] },
    });

    const { queue, removeOperation } = useOfflineSyncStore.getState();
    removeOperation(queue[0].id);

    expect(useOfflineSyncStore.getState().queue).toHaveLength(0);
  });

  it('marks operation as failed after max retries', () => {
    const { enqueue } = useOfflineSyncStore.getState();

    enqueue({
      type: 'create_session',
      payload: { client_id: 'uuid-2', started_at: '2024-01-15T10:00:00', exercise_logs: [] },
    });

    const { queue, markFailed } = useOfflineSyncStore.getState();
    markFailed(queue[0].id);

    expect(useOfflineSyncStore.getState().queue[0].status).toBe('failed');
  });

  it('caps queue at 50 operations', () => {
    const { enqueue } = useOfflineSyncStore.getState();

    for (let i = 0; i < 55; i++) {
      enqueue({
        type: 'create_session',
        payload: { client_id: `uuid-${i}`, started_at: '2024-01-15T10:00:00', exercise_logs: [] },
      });
    }

    expect(useOfflineSyncStore.getState().queue).toHaveLength(50);
  });

  it('tracks online/offline state', () => {
    const { setOnline } = useOfflineSyncStore.getState();

    setOnline(false);
    expect(useOfflineSyncStore.getState().isOnline).toBe(false);

    setOnline(true);
    expect(useOfflineSyncStore.getState().isOnline).toBe(true);
  });
});
