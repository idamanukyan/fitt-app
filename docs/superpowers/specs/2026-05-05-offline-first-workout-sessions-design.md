# Offline-First Workout Sessions — Design Spec

## Summary

Add offline-first capability to workout sessions so users can track workouts without connectivity (common in gyms) and have data sync automatically when back online. Includes pre-caching exercises from user's saved workouts for offline browsing.

## Scope

- **In scope:** Workout session creation/completion offline, exercise pre-caching for user's workouts, automatic sync on reconnect, subtle offline UI indicators
- **Out of scope:** Offline writes for nutrition/measurements/other features, background sync when app is closed, full exercise library download, conflict merging across devices

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Sessions + exercise browsing | Covers the real gym scenario |
| Conflict resolution | Silent token refresh + auto-flush | Existing refresh token infra, no user friction |
| UX when offline | Subtle indicator + toasts | Non-intrusive, user barely notices |
| Exercise caching | Pre-cache user's workouts on launch | Guarantees users can do their planned workouts |
| Sync trigger | Foreground only (NetInfo listener) | Simpler, iOS background unreliable anyway |
| Architecture | Zustand persist + custom sync queue | Fits existing patterns, minimal new deps |

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `mobile/src/stores/offlineSyncStore.ts` | Zustand store (AsyncStorage persisted) — holds sync queue and connectivity state |
| `mobile/src/hooks/useNetworkStatus.ts` | Hook wrapping `@react-native-community/netinfo` — exposes `isOnline`, triggers sync on reconnect |
| `mobile/src/services/offlineWorkoutService.ts` | Offline-aware wrapper around `workoutService` — routes to API or queue |
| `mobile/src/hooks/usePreCacheWorkouts.ts` | Pre-caches exercises for user's saved workouts on app launch |
| `mobile/src/components/atoms/OfflineIndicator.tsx` | Subtle offline badge + toast notifications |

### Modified Files

| File | Change |
|------|--------|
| `mobile/src/screens/Training/AIExerciseSessionScreen.tsx` | Use `offlineWorkoutService` instead of direct `workoutService` |
| `mobile/src/services/dataSyncService.ts` | Add `'sync_completed'` event type |
| `mobile/app/_layout.tsx` | Mount `OfflineIndicator` and `useNetworkStatus` at root |
| `backend/app/schemas/workout_schemas.py` | Add `client_id` field for deduplication |
| `backend/app/services/workout_service.py` | Idempotent session creation (dedup by `client_id`) |

## Sync Queue Design

### Data Structures

```typescript
interface PendingOperation {
  id: string                    // UUID for deduplication
  type: 'create_session' | 'update_session' | 'complete_session'
  payload: WorkoutSessionCreate | WorkoutSessionUpdate
  createdAt: string             // ISO timestamp
  retryCount: number
  status: 'pending' | 'syncing' | 'failed'
}

interface OfflineSyncState {
  isOnline: boolean
  queue: PendingOperation[]
  lastSyncedAt: string | null

  // Actions
  enqueue(op: Omit<PendingOperation, 'id' | 'createdAt' | 'retryCount' | 'status'>): void
  flush(): Promise<void>
  setOnline(status: boolean): void
  removeOperation(id: string): void
  markFailed(id: string): void
}
```

### Data Flow

```
User completes workout
    ↓
offlineWorkoutService.createSession(data)
    ↓
┌─ isOnline? ─────────────────────┐
│  YES: call workoutService API   │
│        → success → done         │
│        → failure → enqueue      │
│  NO:  enqueue to sync store     │
│        → show "saved offline"   │
└─────────────────────────────────┘

NetInfo detects reconnect
    ↓
useNetworkStatus fires setOnline(true)
    ↓
Silent token refresh (if expired)
    ↓
flush() processes queue FIFO
    ↓
Each op: call API → success → remove from queue
                  → failure (401) → refresh token → retry
                  → failure (other) → increment retryCount
                  → retryCount >= 3 → markFailed, skip
    ↓
Toast: "Workout synced"
    ↓
dataSyncService.emit('sync_completed')
    → invalidates related caches
```

### Queue Constraints

- **Max size:** 50 operations (oldest dropped if exceeded)
- **Retry cap:** 3 attempts per operation
- **Ordering:** FIFO strict — `create_session` must complete before `update_session` for same workout
- **Mutex:** `flush()` is no-op if already in progress
- **Debounce:** NetInfo status changes debounced by 2 seconds

## Exercise Pre-Caching

### Strategy

On app launch (when online), fetch and cache exercise details for all exercises in the user's saved workouts.

### Logic

1. App mounts + `isOnline` is true
2. Fetch user's workouts via `getMyWorkouts()`
3. Extract all unique exercise IDs from workout exercises
4. For each exercise ID not already in valid cache:
   - Fetch exercise detail from API
   - Store in existing cache system (7-day TTL)
5. Batch max 5 concurrent requests to avoid API hammering
6. Runs silently — no UI, non-blocking

### Offline Fallback

- Exercise data cached → show full detail
- Exercise not cached + offline → show minimal info (name/ID from workout data, no full detail page)

## UI & Notifications

### OfflineIndicator

- Mounted at root layout (visible across all screens)
- Small pill/badge, only visible when offline
- Does not shift layout or overlap critical elements

### Toast Notifications

| Trigger | Message | Duration |
|---------|---------|----------|
| Goes offline | "You're offline — workouts will sync when you're back" | 3s |
| Sync completes | "Workout synced" | 2s |
| Sync fails (3 retries exhausted) | "Couldn't sync workout — will retry later" | 4s |

### Workout Session UI

No changes. Training screen works identically online or offline.

## Error Handling & Edge Cases

### Token Expiry While Offline

- Access token expires during offline workout (30+ min)
- On reconnect: `flush()` gets 401 → refresh token → retry
- If refresh token also expired → prompt login → flush after re-auth

### App Killed Mid-Workout

- Zustand persist saves queue to AsyncStorage on every `enqueue()`
- Active session already persisted in `aiCoachStore` (existing)
- On next app open: queue restored, flush triggers if online

### Duplicate Prevention

- Each `PendingOperation` has a UUID
- Backend accepts `client_id` field on `WorkoutSessionCreate`
- If session with same `client_id` exists, return existing (idempotent)

### Network Flapping

- Debounce NetInfo changes by 2 seconds before triggering flush
- `flush()` guarded by mutex flag

### Storage Pressure

- Queue capped at 50 operations
- Exercise cache uses existing TTL eviction (7-day)

## Dependencies

### New Package

- `@react-native-community/netinfo` — network state detection (if not already installed)

### Existing Infrastructure Leveraged

- Zustand + `zustand/middleware` persist (already used by `aiCoachStore`)
- AsyncStorage (already used throughout)
- `cache.ts` TTL system (already has exercise caching)
- `dataSyncService.ts` event system
- Refresh token endpoint (`POST /api/auth/refresh`)

## Testing Strategy

- Unit tests for `offlineSyncStore` (enqueue, flush, retry, dedup)
- Unit tests for `offlineWorkoutService` (routes correctly based on connectivity)
- Integration test: simulate offline → enqueue → reconnect → verify API called
- Backend: test idempotent session creation with `client_id`
