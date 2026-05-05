# Offline-First Workout Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to track workout sessions offline and automatically sync when connectivity returns, with pre-cached exercises for offline browsing.

**Architecture:** Zustand persist store as an offline write queue, NetInfo listener for connectivity detection, offline-aware service wrapper that routes writes to API or queue, and a pre-cache hook that downloads exercise data for saved workouts on launch.

**Tech Stack:** Zustand 5 + persist middleware, @react-native-community/netinfo, AsyncStorage, existing cache.ts system, existing workoutService/dataSyncService.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `mobile/src/stores/offlineSyncStore.ts` | Persisted Zustand store holding the sync queue, connectivity state, and flush logic |
| `mobile/src/hooks/useNetworkStatus.ts` | Wraps NetInfo, debounces status changes, triggers flush on reconnect |
| `mobile/src/services/offlineWorkoutService.ts` | Offline-aware wrapper — routes to API or queue based on connectivity |
| `mobile/src/hooks/usePreCacheWorkouts.ts` | Pre-caches exercise details for user's saved workouts on launch |
| `mobile/src/components/atoms/OfflineIndicator.tsx` | Subtle offline badge + toast overlay |
| `mobile/src/services/dataSyncService.ts` | Add `sync_completed` event type (modify existing) |
| `mobile/types/workout.types.ts` | Add `client_id` to `WorkoutSessionCreate` (modify existing) |
| `mobile/app/_layout.tsx` | Mount OfflineIndicator and useNetworkStatus (modify existing) |
| `backend/app/schemas/workout_schemas.py` | Add `client_id` field (modify existing) |
| `backend/app/services/workout_service.py` | Idempotent session creation by `client_id` (modify existing) |

---

### Task 1: Install Dependencies

**Files:**
- Modify: `mobile/package.json`

- [ ] **Step 1: Install @react-native-community/netinfo**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx expo install @react-native-community/netinfo
```

- [ ] **Step 2: Install uuid for generating client IDs**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx expo install uuid && npm install --save-dev @types/uuid
```

- [ ] **Step 3: Verify install**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && grep -E "netinfo|uuid" package.json
```

Expected: both packages listed in dependencies.

- [ ] **Step 4: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add package.json package-lock.json && git commit -m "chore: add netinfo and uuid dependencies for offline support"
```

---

### Task 2: Backend — Add client_id for Idempotent Session Creation

**Files:**
- Modify: `backend/app/schemas/workout_schemas.py`
- Modify: `backend/app/models/workout.py`
- Modify: `backend/app/services/workout_service.py`
- Test: `backend/tests/test_offline_sync.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_offline_sync.py`:

```python
"""Tests for offline sync / idempotent session creation."""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def get_auth_headers(client: TestClient) -> dict:
    """Register and login a test user, return auth headers."""
    email = f"offline_test_{datetime.now().timestamp()}@test.com"
    client.post("/api/auth/register", json={
        "email": email,
        "password": "TestPass123!",
        "full_name": "Offline Tester",
        "role": "user"
    })
    response = client.post("/api/auth/login", json={
        "email": email,
        "password": "TestPass123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_session_with_client_id():
    """Session creation accepts client_id field."""
    headers = get_auth_headers(client)
    session_data = {
        "client_id": "test-uuid-12345",
        "started_at": "2024-01-15T10:00:00",
        "is_completed": True,
        "duration_minutes": 45,
        "total_volume": 5000,
        "total_reps": 100,
        "total_exercises": 5,
        "exercise_logs": []
    }
    response = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response.status_code == 201
    assert response.json()["client_id"] == "test-uuid-12345"


def test_duplicate_client_id_returns_existing_session():
    """Submitting the same client_id twice returns the first session (idempotent)."""
    headers = get_auth_headers(client)
    session_data = {
        "client_id": "dedup-uuid-99999",
        "started_at": "2024-01-15T10:00:00",
        "is_completed": True,
        "duration_minutes": 30,
        "total_volume": 3000,
        "total_reps": 60,
        "total_exercises": 3,
        "exercise_logs": []
    }

    # First creation
    response1 = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response1.status_code == 201
    session_id_1 = response1.json()["id"]

    # Second creation with same client_id
    response2 = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response2.status_code == 200
    session_id_2 = response2.json()["id"]

    # Same session returned
    assert session_id_1 == session_id_2


def test_create_session_without_client_id_still_works():
    """Sessions without client_id work normally (backwards compat)."""
    headers = get_auth_headers(client)
    session_data = {
        "started_at": "2024-01-15T10:00:00",
        "is_completed": False,
        "total_volume": 0,
        "total_reps": 0,
        "total_exercises": 0,
        "exercise_logs": []
    }
    response = client.post("/api/workouts/sessions", json=session_data, headers=headers)
    assert response.status_code == 201
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/ida/Desktop/projects/hyperfit/backend && python -m pytest tests/test_offline_sync.py -v
```

Expected: FAIL — `client_id` field not recognized.

- [ ] **Step 3: Add client_id to WorkoutSession model**

In `backend/app/models/workout.py`, add to the `WorkoutSession` class:

```python
client_id = Column(String(100), nullable=True, unique=True, index=True)
```

- [ ] **Step 4: Add client_id to schemas**

In `backend/app/schemas/workout_schemas.py`, add to `WorkoutSessionCreate`:

```python
client_id: Optional[str] = Field(None, max_length=100, description="Client-generated UUID for deduplication")
```

Add to `WorkoutSessionResponse`:

```python
client_id: Optional[str]
```

- [ ] **Step 5: Implement idempotent creation in service**

In `backend/app/services/workout_service.py`, modify the `create_session` method. At the top of the method, before creating the session, add:

```python
# Idempotent check: if client_id provided, return existing session
if session_data.client_id:
    existing = self.db.query(WorkoutSession).filter(
        WorkoutSession.client_id == session_data.client_id,
        WorkoutSession.user_id == user_id
    ).first()
    if existing:
        return self._session_to_response(existing)
```

When creating the new `WorkoutSession` object, include:

```python
client_id=session_data.client_id,
```

- [ ] **Step 6: Create migration**

```bash
cd /Users/ida/Desktop/projects/hyperfit/backend && alembic revision --autogenerate -m "add client_id to workout_session"
```

Then apply:

```bash
cd /Users/ida/Desktop/projects/hyperfit/backend && alembic upgrade head
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
cd /Users/ida/Desktop/projects/hyperfit/backend && python -m pytest tests/test_offline_sync.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 8: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/backend && git add -A && git commit -m "feat(backend): add client_id for idempotent workout session creation"
```

---

### Task 3: Offline Sync Store (Zustand)

**Files:**
- Create: `mobile/src/stores/offlineSyncStore.ts`
- Create: `mobile/src/__tests__/offlineSyncStore.test.ts`

- [ ] **Step 1: Write the failing test**

Create `mobile/src/__tests__/offlineSyncStore.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest src/__tests__/offlineSyncStore.test.ts --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the store**

Create `mobile/src/stores/offlineSyncStore.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest src/__tests__/offlineSyncStore.test.ts --no-coverage
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/stores/offlineSyncStore.ts src/__tests__/offlineSyncStore.test.ts && git commit -m "feat: add offline sync store with queue management"
```

---

### Task 4: Offline Workout Service

**Files:**
- Create: `mobile/src/services/offlineWorkoutService.ts`
- Create: `mobile/src/__tests__/offlineWorkoutService.test.ts`

- [ ] **Step 1: Write the failing test**

Create `mobile/src/__tests__/offlineWorkoutService.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest src/__tests__/offlineWorkoutService.test.ts --no-coverage
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the service**

Create `mobile/src/services/offlineWorkoutService.ts`:

```typescript
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
  const payload: WorkoutSessionCreate = { ...data, client_id: clientId };

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
 * Returns true if successful.
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
 * Called when connectivity is restored.
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
          // Try silent token refresh
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

    // If any ops were successfully synced, update timestamp and notify
    const remaining = useOfflineSyncStore.getState().queue.filter((op) => op.status === 'pending');
    if (remaining.length < pendingOps.length) {
      store.updateLastSynced();
      emit('sync_completed' as any, { syncedCount: pendingOps.length - remaining.length });
    }
  } finally {
    useOfflineSyncStore.getState().setFlushing(false);
  }
}

/**
 * Process a single queued operation.
 */
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest src/__tests__/offlineWorkoutService.test.ts --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/services/offlineWorkoutService.ts src/__tests__/offlineWorkoutService.test.ts && git commit -m "feat: add offline workout service with queue flush logic"
```

---

### Task 5: Network Status Hook

**Files:**
- Create: `mobile/src/hooks/useNetworkStatus.ts`

- [ ] **Step 1: Implement the hook**

Create `mobile/src/hooks/useNetworkStatus.ts`:

```typescript
import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useOfflineSyncStore } from '../stores/offlineSyncStore';
import { flushSyncQueue } from '../services/offlineWorkoutService';

const DEBOUNCE_MS = 2000;

/**
 * Hook that monitors network connectivity and triggers sync on reconnect.
 * Mount once at root layout level.
 */
export function useNetworkStatus() {
  const setOnline = useOfflineSyncStore((s) => s.setOnline);
  const isOnline = useOfflineSyncStore((s) => s.isOnline);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;

      // Debounce to avoid flapping
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setOnline(connected);

        if (connected && wasOffline.current) {
          // Just came back online — flush the queue
          flushSyncQueue();
        }

        wasOffline.current = !connected;
      }, DEBOUNCE_MS);
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? false;
      setOnline(connected);
      wasOffline.current = !connected;
    });

    return () => {
      unsubscribe();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [setOnline]);

  return { isOnline };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/hooks/useNetworkStatus.ts && git commit -m "feat: add useNetworkStatus hook with debounced reconnect detection"
```

---

### Task 6: Offline Indicator Component

**Files:**
- Create: `mobile/src/components/atoms/OfflineIndicator.tsx`

- [ ] **Step 1: Implement the component**

Create `mobile/src/components/atoms/OfflineIndicator.tsx`:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useOfflineSyncStore } from '../../stores/offlineSyncStore';

type ToastType = 'offline' | 'synced' | 'failed';

interface ToastConfig {
  message: string;
  duration: number;
  type: ToastType;
}

const TOAST_CONFIGS: Record<ToastType, ToastConfig> = {
  offline: { message: "You're offline — workouts will sync when you're back", duration: 3000, type: 'offline' },
  synced: { message: 'Workout synced', duration: 2000, type: 'synced' },
  failed: { message: "Couldn't sync workout — will retry later", duration: 4000, type: 'failed' },
};

export function OfflineIndicator() {
  const isOnline = useOfflineSyncStore((s) => s.isOnline);
  const lastSyncedAt = useOfflineSyncStore((s) => s.lastSyncedAt);
  const queue = useOfflineSyncStore((s) => s.queue);
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const prevOnline = useRef(isOnline);
  const prevLastSynced = useRef(lastSyncedAt);

  // Show toast on state transitions
  useEffect(() => {
    if (prevOnline.current && !isOnline) {
      showToast('offline');
    }
    prevOnline.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (lastSyncedAt && lastSyncedAt !== prevLastSynced.current) {
      showToast('synced');
    }
    prevLastSynced.current = lastSyncedAt;
  }, [lastSyncedAt]);

  // Check for failed ops
  useEffect(() => {
    const failedOps = queue.filter((op) => op.status === 'failed');
    if (failedOps.length > 0) {
      showToast('failed');
    }
  }, [queue]);

  function showToast(type: ToastType) {
    const config = TOAST_CONFIGS[type];
    setToast(config);

    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(config.duration),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  return (
    <>
      {/* Offline badge */}
      {!isOnline && (
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Offline</Text>
        </View>
      )}

      {/* Toast */}
      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 9999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F87171',
    marginRight: 6,
  },
  badgeText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 50, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/components/atoms/OfflineIndicator.tsx && git commit -m "feat: add OfflineIndicator component with badge and toast"
```

---

### Task 7: Pre-Cache Workouts Hook

**Files:**
- Create: `mobile/src/hooks/usePreCacheWorkouts.ts`

- [ ] **Step 1: Implement the hook**

Create `mobile/src/hooks/usePreCacheWorkouts.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/hooks/usePreCacheWorkouts.ts && git commit -m "feat: add usePreCacheWorkouts hook for offline exercise browsing"
```

---

### Task 8: Update dataSyncService with sync_completed Event

**Files:**
- Modify: `mobile/src/services/dataSyncService.ts`

- [ ] **Step 1: Add sync_completed to event types**

In `mobile/src/services/dataSyncService.ts`, update the `SyncEventType` type:

```typescript
type SyncEventType =
  | 'workout_completed'
  | 'workout_deleted'
  | 'sleep_entry_changed'
  | 'measurement_changed'
  | 'ai_session_completed'
  | 'achievement_unlocked'
  | 'streak_updated'
  | 'sync_completed';
```

Add the event payload interface:

```typescript
interface SyncCompletedEvent {
  syncedCount: number;
}
```

Add it to the `SyncEventPayload` union:

```typescript
type SyncEventPayload =
  | WorkoutEvent
  | SleepEvent
  | MeasurementEvent
  | AISessionEvent
  | AchievementEvent
  | StreakEvent
  | SyncCompletedEvent;
```

Add a case in `processEvents` for `sync_completed`:

```typescript
case 'sync_completed':
  await invalidateRelatedCaches('workout');
  break;
```

Add a convenience method:

```typescript
export function notifySyncCompleted(data: SyncCompletedEvent): void {
  emit('sync_completed', data);
}
```

And add it to the default export.

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/services/dataSyncService.ts && git commit -m "feat: add sync_completed event to dataSyncService"
```

---

### Task 9: Update Frontend Types — Add client_id

**Files:**
- Modify: `mobile/types/workout.types.ts`

- [ ] **Step 1: Add client_id to WorkoutSessionCreate**

In `mobile/types/workout.types.ts`, add `client_id` to the `WorkoutSessionCreate` interface:

```typescript
export interface WorkoutSessionCreate {
  client_id?: string;
  user_workout_id?: number;
  title?: string;
  notes?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  total_volume?: number;
  total_reps?: number;
  total_exercises?: number;
  calories_burned?: number;
  is_completed?: boolean;
  rating?: number;
  exercise_logs: {
    exercise_id: number;
    order_index: number;
    sets_data?: string;
    total_sets?: number;
    total_reps?: number;
    max_weight?: number;
    total_volume?: number;
    duration_seconds?: number;
    distance_km?: number;
    notes?: string;
    personal_record?: boolean;
  }[];
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add types/workout.types.ts && git commit -m "feat: add client_id to WorkoutSessionCreate type"
```

---

### Task 10: Mount Offline Infrastructure in Root Layout

**Files:**
- Modify: `mobile/app/_layout.tsx`

- [ ] **Step 1: Add imports and mount hooks/components**

Update `mobile/app/_layout.tsx`:

```typescript
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../context/AuthContext';
import { SupplementsProvider } from '../contexts/SupplementsContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import i18n, { initI18n } from '../src/i18n';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { usePreCacheWorkouts } from '../src/hooks/usePreCacheWorkouts';
import { OfflineIndicator } from '../src/components/atoms/OfflineIndicator';

export const unstable_settings = {
  initialRouteName: 'index',
};

function OfflineProvider({ children }: { children: React.ReactNode }) {
  useNetworkStatus();
  usePreCacheWorkouts();
  return (
    <>
      {children}
      <OfflineIndicator />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F23' }}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AnalyticsProvider>
          <SupplementsProvider>
            <OfflineProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)/login" />
                  <Stack.Screen name="(auth)/register" />
                  <Stack.Screen name="(onboarding)" />
                  <Stack.Screen name="(coach-onboarding)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(coach-tabs)" />
                  <Stack.Screen name="supplements" />
                  <Stack.Screen name="workout" />
                  <Stack.Screen name="nutrition" />
                  <Stack.Screen name="achievements" />
                  <Stack.Screen name="progress-photos" />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </OfflineProvider>
          </SupplementsProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add app/_layout.tsx && git commit -m "feat: mount offline infrastructure in root layout"
```

---

### Task 11: Integration Test — End-to-End Offline Flow

**Files:**
- Create: `mobile/src/__tests__/offlineFlow.integration.test.ts`

- [ ] **Step 1: Write the integration test**

Create `mobile/src/__tests__/offlineFlow.integration.test.ts`:

```typescript
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
    expect(queue[0].status).toBe('pending'); // Not failed yet (< 3 retries)
  });
});
```

- [ ] **Step 2: Run all offline tests**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest src/__tests__/offline --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && git add src/__tests__/offlineFlow.integration.test.ts && git commit -m "test: add integration test for offline workout flow"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run all mobile tests**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx jest --no-coverage
```

Expected: All tests PASS.

- [ ] **Step 2: Run backend tests**

```bash
cd /Users/ida/Desktop/projects/hyperfit/backend && python -m pytest -v
```

Expected: All tests PASS.

- [ ] **Step 3: TypeScript type check**

```bash
cd /Users/ida/Desktop/projects/hyperfit/mobile && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A && git commit -m "fix: address any issues from final verification"
```
