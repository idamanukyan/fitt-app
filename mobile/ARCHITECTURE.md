# Mobile State Management Conventions

This document defines when and how to use each state management tool in the HyperFit mobile app. Every new feature should follow these conventions to keep the codebase consistent and predictable.

## Overview

| Tool | Purpose | Persistence | Examples |
|------|---------|-------------|----------|
| **Zustand** | Client-side persistent state | AsyncStorage (survives restarts) | Workouts, sleep, measurements, offline queue |
| **React Context** | Session-scoped global state | Memory only (cleared on logout/restart) | Auth, analytics, theme |
| **React Query** | Server state caching | In-memory with configurable TTL | API responses (planned) |

---

## Zustand -- Client-Side Persistent State

Use Zustand for data the user owns locally: offline-capable records, user preferences, cached domain data, and anything that must survive app restarts.

### When to use

- Offline-first data (workouts, sleep entries, measurements)
- Client-side queues that sync when connectivity returns
- Local UI state shared across multiple screens (filters, search queries)
- Data that must persist across app restarts via AsyncStorage

### Conventions

1. **One store per domain.** Each feature area gets its own store file.
2. **Persist with the `persist` middleware** and `createJSONStorage(()=> AsyncStorage)` when data must survive restarts.
3. **Co-locate actions with state.** Define all mutations inside the store's `create()` call -- never mutate store state from outside.
4. **Use selectors** to subscribe to the smallest slice of state a component needs, avoiding unnecessary re-renders.

### Project examples

| Store | Path | What it manages |
|-------|------|-----------------|
| `exerciseStore` | `stores/exerciseStore.ts` | Discover sections, search, filters, saved exercises, exercise history |
| `trainingStore` | `stores/trainingStore.ts` | Exercises, saved workouts, workout history, AI session state |
| `sleepStore` | `stores/sleepStore.ts` | Sleep entries, calendar data, trends, monthly summaries |
| `measurementStore` | `stores/measurementStore.ts` | Body measurements, calendar data, trend calculations |
| `wellnessStore` | `stores/wellnessStore.ts` | Cross-feature wellness correlations (sleep + measurements) |
| `aiCoachStore` | `src/stores/aiCoachStore.ts` | AI workout session lifecycle, pose detection, form analysis |
| `offlineSyncStore` | `src/stores/offlineSyncStore.ts` | Pending operations queue, online/offline status, sync state |

### Code pattern

```ts
// stores/exampleStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExampleState {
  items: Item[];
  isLoading: boolean;
  addItem: (item: Item) => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),

      reset: () => set({ items: [], isLoading: false }),
    }),
    {
      name: '@hyperfit_example',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Using selectors in components:**

```tsx
// Only re-renders when `items` changes, not when `isLoading` changes
const items = useExampleStore((s) => s.items);
```

---

## React Context -- Session-Scoped Global State

Use React Context for state that is global to the current session but does not need to persist independently in AsyncStorage. Typical uses: authentication, analytics, and theme/locale.

### When to use

- Auth state (current user, tokens, login/logout flow)
- App-wide services that need initialization (analytics, feature flags)
- Theme or locale that applies to every screen
- State that should reset on logout

### Conventions

1. **One context per concern.** Keep auth, analytics, and theme in separate contexts.
2. **Always provide a custom hook** (e.g. `useAuth()`) that throws if used outside the provider -- never call `useContext(SomeContext)` directly in components.
3. **Keep providers near the root** of the component tree, typically in `app/_layout.tsx`.
4. **Avoid putting frequently-changing data in Context.** If a value updates on every frame or keystroke, use Zustand or local component state instead.

### Project examples

| Context | Path | What it manages |
|---------|------|-----------------|
| `AuthContext` | `context/AuthContext.tsx` | User object, login/register/logout, role checks, OAuth |
| `SupplementsContext` | `contexts/SupplementsContext.tsx` | Supplement list, intake tracking, notifications |
| `AnalyticsContext` | `contexts/AnalyticsContext.tsx` | Analytics initialization, event tracking, screen tracking |

### Code pattern

```tsx
// context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

---

## React Query -- Server State Caching

Use React Query (`@tanstack/react-query`) for caching and synchronizing server (API) responses. It handles request deduplication, background refetching, cache invalidation, and loading/error states automatically.

> **Status:** React Query is installed (`@tanstack/react-query ^5.90.12`) but not yet integrated. The project currently handles API caching manually via a custom `cache.ts` helper (`src/storage/cache.ts`) with TTL-based AsyncStorage caching. New API-fetching features should adopt React Query; existing features can be migrated incrementally.

### When to use

- Any GET request to the backend that multiple components may need
- Paginated or infinite-scroll lists from the API
- Mutations (POST/PUT/DELETE) that should optimistically update cached data
- Data that is authoritative on the server and only cached locally for performance

### Conventions

1. **Wrap the app in `QueryClientProvider`** in the root layout.
2. **Use query keys that mirror the API path**, e.g. `['workouts', workoutId]`.
3. **Set stale times** based on how frequently the data changes -- use the TTL constants already defined in `src/storage/cache.ts` as a guide.
4. **Pair mutations with `invalidateQueries`** to keep caches consistent after writes.
5. **Do not duplicate server state into Zustand.** If data comes from an API, let React Query own it.

### Code pattern

```tsx
// hooks/useWorkouts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyWorkouts, createWorkout } from '../services/workoutService';

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: getMyWorkouts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
```

---

## Decision Flowchart

When adding new state, ask these questions in order:

1. **Does the data come from our API and is the server the source of truth?**
   Yes --> **React Query**

2. **Must the data persist across app restarts or work offline?**
   Yes --> **Zustand** with `persist` middleware

3. **Is it session-scoped global state (auth, theme, analytics)?**
   Yes --> **React Context**

4. **Is it local to a single screen or component?**
   Yes --> **React `useState` / `useReducer`** (no global tool needed)

---

## Caching Layer

The project includes a general-purpose cache helper at `src/storage/cache.ts` that provides TTL-based AsyncStorage caching. It is used by service files and the `usePreCacheWorkouts` hook (`src/hooks/usePreCacheWorkouts.ts`) to cache exercise details for offline access.

For new server-state caching, prefer React Query over manual cache helpers. The existing `cache.ts` utilities remain valid for pre-caching and offline-first scenarios where React Query is not a good fit (e.g., eagerly caching data the user has not requested yet).

---

## File Organization

```
mobile/
  context/          # React Context providers (auth, theme)
  contexts/         # Additional context providers (supplements, analytics)
  stores/           # Zustand stores (top-level feature stores)
  src/
    stores/         # Zustand stores (AI coach, offline sync)
    storage/        # Cache helpers, supplement storage
    hooks/          # Custom hooks (pre-caching, etc.)
  services/         # API clients and service layers
  hooks/            # Feature hooks (weather, etc.)
```

> **Note:** The `context/` and `contexts/` directories should be consolidated into a single `contexts/` directory in a future cleanup.
