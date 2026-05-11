# Workout Session Detail Screen — Design Spec

## Summary

Add a full detail screen for viewing past workout sessions. Users tap a workout history card on the Training tab and navigate to a dedicated screen showing the complete session breakdown: summary stats, AI form score, exercise-by-exercise set data, notes, rating, and a share action. Supports both synced and offline-pending sessions.

## Scope

- **In scope:** Session detail screen, 3 reusable components, navigation from history card, offline-pending session display, share action (native share sheet)
- **Out of scope:** Editing past sessions, comparing sessions side-by-side, exercise-level navigation (tapping an exercise to see its history), social sharing with custom graphics

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| View type | Full detail screen (not modal) | More room for set-by-set breakdown, follows AchievementDetailScreen pattern |
| Architecture | Route + 3 decomposed components | Matches existing patterns, keeps files focused and testable |
| Offline sessions | Show with "pending sync" badge | Users want to review what they just logged, even offline |
| Data source | API fetch for synced, offline queue for pending | `getSessionById()` already exists; pending ops are in offlineSyncStore |
| Share | Native share sheet (React Native Share API) | Simple text summary, no custom graphics needed |

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `mobile/app/workout/session/[id].tsx` | Expo Router screen — data fetching, layout, loading/error states |
| `mobile/components/workout/SessionHeader.tsx` | Back button, share action, workout title, date, rating stars, time range |
| `mobile/components/workout/SessionSummaryCard.tsx` | 4 stat tiles (volume, reps, exercises, calories), AI form score card, pending sync badge |
| `mobile/components/workout/ExerciseLogCard.tsx` | Exercise name + muscle group, set table, PR badge, per-exercise totals |

### Modified Files

| File | Change |
|------|--------|
| `mobile/screens/TrainingScreen.tsx` | `handleHistoryPress` → `router.push(/workout/session/${entry.id})` |

## Screen Layout (top to bottom)

### 1. SessionHeader

- Back button (left, glass background, green arrow) — `router.back()`
- "Workout Detail" title (center)
- Share button (right, glass background) — triggers native share
- Below: workout name (24px bold), date (13px muted), rating stars (1-5, yellow filled / gray empty), time range + duration (11px muted)

### 2. Pending Sync Badge (conditional)

- Only shown when session comes from offline queue (not yet synced)
- Yellow warning style: `warningBg` background, `warning` border/text
- Clock icon + "Pending sync — will upload when you're back online"

### 3. SessionSummaryCard — Stats

4 tiles in a row, each with colored background/border:

| Stat | Color | Source |
|------|-------|--------|
| Volume (kg) | Green (`primary`) | `total_volume` |
| Total Reps | Purple (`secondary`) | `total_reps` |
| Exercises | Blue (`accent.blue`) | `total_exercises` |
| Calories | Orange (`accent.orange`) | `calories_burned` |

### 4. SessionSummaryCard — AI Form Score

- Score circle (56px, bordered with score color, score number inside)
- "AI Form Score" label + description text
- Score color thresholds: >=90 green, >=75 primary, >=60 warning, <60 error

### 5. ExerciseLogCard (repeated per exercise)

- Header: exercise name (15px semibold) + muscle group tag (12px muted) + PR badge (if `personal_record`)
- Set table with columns: Set | Reps | Weight | Completed checkmark
  - Header row: uppercase muted labels
  - Data rows: white text, green checkmark for completed sets
  - PR set row: green highlighted background + text + star icon
  - Identical sets collapsed (e.g., "1-4" instead of 4 rows)
- Footer: per-exercise totals (max weight, total volume, total reps) in muted text

### 6. Notes Section

- Section label "Notes" (uppercase, muted)
- Glass card with note text (14px, secondary color, 1.5 line height)
- Hidden entirely if no notes

### 7. Share Button

- Full-width green gradient button (`buttonPrimary` gradient)
- "Share Workout" label in inverse text
- Triggers `Share.share()` with a text summary of the workout

## Data Flow

```
TrainingScreen
  ↓ handleHistoryPress(entry)
  ↓ router.push(`/workout/session/${entry.id}`)

[id].tsx screen mounts
  ↓ useLocalSearchParams() → { id }
  ↓
  ├─ Check offlineSyncStore queue for pending op with matching client_id
  │   (TrainingHistoryEntry.id maps to the queue operation's payload.client_id)
  │   → Found: build session data from queue payload, show sync badge
  │
  └─ Not in queue: call getSessionById(Number(id)) via workoutService
      → Success: render full session
      → Error: show error state with retry
```

### Share Content Format

```
Chest & Triceps — May 10, 2026
52 min · 5,240 kg volume · 86 reps · 5 exercises

Bench Press: 3 sets · Max 80kg 🏆 PR
Incline Dumbbell Press: 3 sets · Max 26kg
Tricep Pushdown: 4 sets · Max 25kg

Tracked with HyperFit
```

## States

| State | Display |
|-------|---------|
| Loading | `ActivityIndicator` centered (green, on dark background) |
| Error | Error message + "Try Again" button |
| Synced session | Full detail, no sync badge |
| Pending sync session | Full detail from queue data + yellow sync badge |
| No notes | Notes section hidden |
| No rating | Stars section hidden |
| No AI score | AI score card hidden |

## Styling

All styling uses design tokens from `mobile/design/tokens.ts`:
- Background: `gradientStart` (#0F0F23)
- Cards: `glass` background + `glassBorder` + `radius.xl` (20px)
- Stat tiles: colored with `primarySubtle`/`secondarySubtle` pattern at 0.08 opacity
- Typography: system font hierarchy per token scale
- Animations: fade-in on mount using `Animated` API (250ms normal duration)

## Dependencies

- No new packages required
- Uses: `expo-router`, `react-native` Share API, `@expo/vector-icons` (Ionicons), `expo-linear-gradient`, existing design tokens, existing `workoutService`, existing `offlineSyncStore`
