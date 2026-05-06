/**
 * @jest-environment node
 */
import { useOfflineSyncStore } from '../stores/offlineSyncStore';

// Mock the workout service
jest.mock('../../services/workoutService', () => ({
  createSession: jest.fn(),
  updateSession: jest.fn(),
  completeSession: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

import * as workoutService from '../../services/workoutService';
import { createSessionOffline, updateSessionOffline, flushSyncQueue } from '../services/offlineWorkoutService';

const mockCreateSession = workoutService.createSession as jest.MockedFunction<typeof workoutService.createSession>;
const mockUpdateSession = workoutService.updateSession as jest.MockedFunction<typeof workoutService.updateSession>;

beforeEach(() => {
  useOfflineSyncStore.getState().reset();
  jest.clearAllMocks();
});

describe('offlineWorkoutService', () => {
  describe('createSessionOffline', () => {
    it('calls API directly when online', async () => {
      useOfflineSyncStore.getState().setOnline(true);
      mockCreateSession.mockResolvedValue({ id: 1 } as any);

      const data = { started_at: '2024-01-15T10:00:00', exercise_logs: [] };
      const result = await createSessionOffline(data);

      expect(mockCreateSession).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
      expect(useOfflineSyncStore.getState().queue).toHaveLength(0);
    });

    it('enqueues when offline', async () => {
      useOfflineSyncStore.getState().setOnline(false);

      const data = { started_at: '2024-01-15T10:00:00', exercise_logs: [] };
      const result = await createSessionOffline(data);

      expect(mockCreateSession).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(useOfflineSyncStore.getState().queue).toHaveLength(1);
      expect(useOfflineSyncStore.getState().queue[0].type).toBe('create_session');
    });

    it('enqueues when API call fails', async () => {
      useOfflineSyncStore.getState().setOnline(true);
      mockCreateSession.mockRejectedValue(new Error('Network Error'));

      const data = { started_at: '2024-01-15T10:00:00', exercise_logs: [] };
      const result = await createSessionOffline(data);

      expect(result).toBeNull();
      expect(useOfflineSyncStore.getState().queue).toHaveLength(1);
    });
  });

  describe('flushSyncQueue', () => {
    it('processes pending operations in order', async () => {
      useOfflineSyncStore.getState().setOnline(true);
      mockCreateSession.mockResolvedValue({ id: 1 } as any);

      // Manually enqueue
      useOfflineSyncStore.getState().enqueue({
        type: 'create_session',
        payload: { client_id: 'uuid-1', started_at: '2024-01-15T10:00:00', exercise_logs: [] },
      });
      useOfflineSyncStore.getState().enqueue({
        type: 'create_session',
        payload: { client_id: 'uuid-2', started_at: '2024-01-15T11:00:00', exercise_logs: [] },
      });

      await flushSyncQueue();

      expect(mockCreateSession).toHaveBeenCalledTimes(2);
      expect(useOfflineSyncStore.getState().queue).toHaveLength(0);
    });

    it('skips failed operations', async () => {
      useOfflineSyncStore.getState().setOnline(true);

      useOfflineSyncStore.getState().enqueue({
        type: 'create_session',
        payload: { client_id: 'uuid-fail', started_at: '2024-01-15T10:00:00', exercise_logs: [] },
      });

      // Mark as failed
      const opId = useOfflineSyncStore.getState().queue[0].id;
      useOfflineSyncStore.getState().markFailed(opId);

      await flushSyncQueue();

      expect(mockCreateSession).not.toHaveBeenCalled();
      // Failed ops remain in queue
      expect(useOfflineSyncStore.getState().queue).toHaveLength(1);
    });
  });
});
