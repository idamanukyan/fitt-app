# Dashboard Redesign — Design Spec

## Summary

Full rebuild of the user dashboard with a card-based section layout, premium wellness-tech aesthetic, and real data from backend APIs. Replaces the current PremiumDashboardScreen (800+ line monolith with mock data) with 8 decomposed components backed by existing API endpoints and Zustand stores.

## Scope

- **In scope:** Complete dashboard rebuild with 8 section components, real API integration, shared design tokens, web-friendly layout (max-width centered)
- **Out of scope:** New backend endpoints, wearable device integration, social/leaderboard features, coach dashboard (separate screen)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout style | Card-based sections | Spacious, premium feel, clear visual hierarchy, good for scrolling |
| Rebuild vs restructure | Full rebuild | Current screen is 800+ lines with inline components, mock data, duplicated tokens |
| Priority sections | Activity + Workout Progress + Quick Actions | User's top 3 picks; these get prime real estate at top |
| Component decomposition | 8 focused components + 1 screen | Each section is its own component file — testable, maintainable |
| Data sources | Real APIs with mock fallback | Use existing endpoints (nutrition, workouts, sleep, achievements) with graceful fallback |

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `mobile/screens/DashboardScreen.tsx` | Main screen — ScrollView layout, data fetching orchestration, loading state |
| `mobile/components/dashboard/DashboardHeader.tsx` | Greeting (time-based), streak pill, profile avatar |
| `mobile/components/dashboard/TodayActivityCard.tsx` | 4 progress rings: calories, protein, water, steps with goals |
| `mobile/components/dashboard/NextWorkoutCard.tsx` | Green CTA card with workout name, metadata, play button |
| `mobile/components/dashboard/QuickActionsRow.tsx` | 4 icon buttons: log meal, add water, ask AI, weigh in |
| `mobile/components/dashboard/WeeklyProgressCard.tsx` | Week dots, workout count, volume/time stats, latest PR |
| `mobile/components/dashboard/BodyStatsCard.tsx` | Weight with weekly trend, sleep 7-day average, last night detail |
| `mobile/components/dashboard/AchievementsCard.tsx` | XP level bar, level badge, 3 recent achievement icons |
| `mobile/components/dashboard/DailyInsightCard.tsx` | AI tip with lightbulb icon, blue accent card |
| `mobile/components/dashboard/index.ts` | Barrel exports for all dashboard components |

### Modified Files

| File | Change |
|------|--------|
| `mobile/app/(tabs)/dashboard.tsx` | Import new DashboardScreen instead of PremiumDashboardScreen |

### Deleted Files

| File | Reason |
|------|--------|
| `mobile/screens/PremiumDashboardScreen.tsx` | Replaced by new DashboardScreen + decomposed components |

## Screen Layout (top to bottom)

### 1. DashboardHeader

- Time-based greeting: "Good morning/afternoon/evening"
- User's first name (from AsyncStorage `user_data`)
- Streak flame pill (orange accent, shows current workout streak count)
- Profile avatar circle (first initial, green accent)

### 2. TodayActivityCard

Glass card with 4 progress rings in a row:

| Metric | Color | Data Source |
|--------|-------|-------------|
| Calories | Green (`primary`) | `GET /api/nutrition/summary` → `calories.current` / `GET /api/nutrition/goals` → `calories` |
| Protein | Purple (`secondary`) | `GET /api/nutrition/summary` → `protein.current` / goals |
| Water | Blue (`accent.blue`) | `GET /api/nutrition/summary` → `water.current` / `GET /api/nutrition/goals` → `water_ml` |
| Steps | Orange (`accent.orange`) | Mock data (10k goal) — no wearable integration yet |

Each ring shows: value inside circle, label below, goal below label. Rings are SVG `AnimatedProgressRing` components with animated stroke-dashoffset.

### 3. NextWorkoutCard

- Green gradient border card (not solid — subtle glass with green tint)
- "NEXT WORKOUT" label
- Workout title (from first saved workout or first template)
- Metadata: duration + exercise count
- Green play button (navigates to `/workout/session` or training tab)
- Data: `trainingStore.savedWorkouts[0]` or `GET /api/workouts/user-workouts`
- If no workouts: show "Create Your First Workout" CTA linking to training tab

### 4. QuickActionsRow

4 equal-width icon buttons in a row:

| Action | Icon | Navigation |
|--------|------|------------|
| Log Meal | Camera emoji | `/(tabs)/nutrition` or meal logging screen |
| Add Water | Water emoji | Triggers water log API call + toast |
| Ask AI | Robot emoji | `/(tabs)/chat` |
| Weigh In | Scale emoji | `/measurements` |

Each button: glass card background, colored icon container, label below.

### 5. WeeklyProgressCard

- Section label "THIS WEEK" with workout count (e.g., "3 / 5 workouts")
- 7 day-of-week progress dots (green filled for completed, gray for remaining, dashed border for today)
- Day labels: M T W T F S S
- Two stat boxes: total volume (kg) and total time
- PR highlight row (if any PR this week): trophy icon, exercise name, weight x reps, date
- Data: `GET /api/workouts/stats` → `thisWeek` object, or `trainingStore.workoutHistory`
- PR data: scan recent history entries where `personalRecord === true`

### 6. BodyStatsCard

- Section label "BODY STATS"
- Two side-by-side sub-cards:
  - **Weight:** current weight (large number + "kg"), weekly delta with arrow (green down = good if losing, context-aware)
  - **Sleep Avg:** 7-day average hours (large number + "hrs"), status dot + label (Optimal/On Track/Needs Improvement)
- Last night sleep row: moon icon, bedtime → wake time, duration in purple
- Data: `useSleepStore` for sleep, `GET /measurements/latest` for weight
- Log sleep button if no recent entry

### 7. AchievementsCard

- Section label "LEVEL & ACHIEVEMENTS" with "View all →" link
- Level badge: large number in purple gradient box
- XP progress bar: current XP / next level XP, purple gradient fill
- Level label: "Level N"
- 3 recent achievement icons (emoji + name), plus a dashed "N more..." placeholder
- Data: `GET /api/achievements/user` for level/XP/streak, `GET /api/achievements/user/unlocked` for badges
- "View all" navigates to `/achievements`

### 8. DailyInsightCard

- Blue accent glass card
- Lightbulb icon in blue container
- "Daily Insight" label
- Insight text — for now uses a rotating array of mock insights (later can be AI-generated)
- Rotates daily based on `new Date().getDay()`

## Data Flow

```
DashboardScreen mounts
  ↓ useEffect → loadDashboardData()
  ↓
  ├─ fetchNutrition() → GET /api/nutrition/summary + /goals
  ├─ fetchWorkoutStats() → GET /api/workouts/stats
  ├─ fetchMeasurements() → GET /measurements/latest
  ├─ fetchAchievements() → GET /api/achievements/user
  ├─ useSleepStore → already loaded (Zustand persist)
  └─ useTrainingStore → already loaded (Zustand persist)
  ↓
  All data passed as props to child components
  ↓
  Each component handles its own empty/loading state
```

### Error Handling

- Each API call wrapped in try/catch with graceful fallback to mock data
- Individual sections show independently — if nutrition API fails, workout card still shows
- Pull-to-refresh on ScrollView reloads all data
- Network-offline: sections show cached data from Zustand stores + "Offline" indicator (existing OfflineIndicator component)

## States

| State | Display |
|-------|---------|
| Loading | Skeleton placeholders for each card (pulsing gray rectangles matching card shapes) |
| Loaded | Full dashboard with real data |
| Error (individual section) | Section shows mock/fallback data, no error banner |
| Empty (no workouts) | NextWorkoutCard shows "Create Your First Workout" CTA |
| Empty (no sleep data) | BodyStatsCard sleep section shows "Log Sleep" button |
| Empty (no achievements) | AchievementsCard shows Level 1 with 0 XP, empty badge slots |
| Pull to refresh | RefreshControl triggers full data reload |

## Styling

All styling uses design tokens from `mobile/design/tokens.ts`:
- Background: `gradients.background` via LinearGradient
- Cards: `colors.glass` + `colors.glassBorder` + `radius.xl` (20px)
- Section labels: 10px uppercase, `colors.textDisabled`, letter-spacing 1.5px
- Stat values: `typography.size.lg` (20px) bold white
- Sub-labels: 9px uppercase muted
- Card gaps: `spacing.md` (12px) between cards
- Screen padding: `spacing.xl` (20px) horizontal
- Max-width on web: 480px centered (matches mobile feel)
- Progress rings: 60px diameter, 3px stroke width
- Animations: fade-in on mount (250ms), progress rings animate on appear

## Dependencies

- No new packages required
- Uses: existing design tokens, existing Zustand stores (sleepStore, trainingStore), existing services (workoutService, nutritionService, achievementService, measurementService), existing AnimatedProgressRing component (can be extracted from current dashboard), LinearGradient, Ionicons, react-native-safe-area-context
