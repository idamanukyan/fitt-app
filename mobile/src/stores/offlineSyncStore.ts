import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { WorkoutSessionCreate, WorkoutSessionUpdate } from '../../types/workout.types';

const MAX_QUEUE_SIZE = 50;
const MAX_RETRIES = 3;

export type OperationType = 'create_session' | 'update_session' | 'complete_session';

export interface PendingOperation {
  id: string;
  type: OperationType;
  payload: WorkoutSessionCreate | WorkoutSessionUpdate;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

interface OfflineSyncState {
  isOnline: boolean;
  queue: PendingOperation[];
  lastSyncedAt: string | null;
  isFlushing: boolean;

  // Actions
  enqueue: (op: { type: OperationType; payload: WorkoutSessionCreate | WorkoutSessionUpdate }) => void;
  removeOperation: (id: string) => void;
  markFailed: (id: string) => void;
  markSyncing: (id: string) => void;
  incrementRetry: (id: string) => void;
  setOnline: (status: boolean) => void;
  setFlushing: (status: boolean) => void;
  updateLastSynced: () => void;
  reset: () => void;
}

const initialState = {
  isOnline: true,
  queue: [] as PendingOperation[],
  lastSyncedAt: null as string | null,
  isFlushing: false,
};

export const useOfflineSyncStore = create<OfflineSyncState>()(
  persist(
    (set, get) => ({
      ...initialState,

      enqueue: (op) => {
        const operation: PendingOperation = {
          id: uuidv4(),
          type: op.type,
          payload: op.payload,
          createdAt: new Date().toISOString(),
          retryCount: 0,
          status: 'pending',
        };

        set((state) => {
          const newQueue = [...state.queue, operation];
          // Cap at MAX_QUEUE_SIZE, dropping oldest
          if (newQueue.length > MAX_QUEUE_SIZE) {
            return { queue: newQueue.slice(newQueue.length - MAX_QUEUE_SIZE) };
          }
          return { queue: newQueue };
        });
      },

      removeOperation: (id) => {
        set((state) => ({
          queue: state.queue.filter((op) => op.id !== id),
        }));
      },

      markFailed: (id) => {
        set((state) => ({
          queue: state.queue.map((op) =>
            op.id === id ? { ...op, status: 'failed' as const } : op
          ),
        }));
      },

      markSyncing: (id) => {
        set((state) => ({
          queue: state.queue.map((op) =>
            op.id === id ? { ...op, status: 'syncing' as const } : op
          ),
        }));
      },

      incrementRetry: (id) => {
        set((state) => ({
          queue: state.queue.map((op) => {
            if (op.id !== id) return op;
            const newRetryCount = op.retryCount + 1;
            return {
              ...op,
              retryCount: newRetryCount,
              status: newRetryCount >= MAX_RETRIES ? ('failed' as const) : op.status,
            };
          }),
        }));
      },

      setOnline: (status) => set({ isOnline: status }),

      setFlushing: (status) => set({ isFlushing: status }),

      updateLastSynced: () => set({ lastSyncedAt: new Date().toISOString() }),

      reset: () => set(initialState),
    }),
    {
      name: '@hyperfit_offline_sync',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queue: state.queue,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
