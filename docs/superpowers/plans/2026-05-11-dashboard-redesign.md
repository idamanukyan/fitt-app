# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 800+ line PremiumDashboardScreen monolith with 8 decomposed, focused components backed by real API data with mock fallbacks. Card-based layout, premium wellness-tech aesthetic, web-friendly (max-width centered).

**Architecture:** New `DashboardScreen` orchestrates data fetching via `useEffect` and passes data as props to 8 child components. Each child is a single file in `mobile/components/dashboard/`. Data sources: `nutritionService` (calories/protein/water), `workoutService` (stats), `measurementService` (weight), `achievementService` (level/XP/badges), `useSleepStore` (sleep), `useTrainingStore` (streak/workouts/history). All API calls wrapped in try/catch with graceful fallback to mock data.

**Tech Stack:** React Native, Expo Router, Zustand (sleepStore, trainingStore), existing API services, design tokens (`mobile/design/tokens.ts`), Ionicons, LinearGradient, react-native-svg, react-native-safe-area-context, AsyncStorage.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `mobile/components/dashboard/index.ts` | Barrel exports for all dashboard components |
| `mobile/components/dashboard/DashboardHeader.tsx` | Time-based greeting, user name, streak pill, avatar |
| `mobile/components/dashboard/TodayActivityCard.tsx` | 4 progress rings: calories, protein, water, steps |
| `mobile/components/dashboard/NextWorkoutCard.tsx` | Green accent card with next workout info or CTA |
| `mobile/components/dashboard/QuickActionsRow.tsx` | 4 icon buttons: log meal, add water, ask AI, weigh in |
| `mobile/components/dashboard/WeeklyProgressCard.tsx` | Week dots, workout count, volume/time, PR highlight |
| `mobile/components/dashboard/BodyStatsCard.tsx` | Weight trend, sleep average, last night detail |
| `mobile/components/dashboard/AchievementsCard.tsx` | Level badge, XP bar, recent achievement icons |
| `mobile/components/dashboard/DailyInsightCard.tsx` | Blue accent card with rotating daily insight |
| `mobile/screens/DashboardScreen.tsx` | Main screen: ScrollView, data fetching, loading state |
| `mobile/app/(tabs)/dashboard.tsx` | Route file (modify to import DashboardScreen) |

---

### Task 1: Create dashboard component directory + barrel exports

**Files:**
- Create: `mobile/components/dashboard/index.ts`

- [ ] **Step 1: Create barrel export file**

Create `mobile/components/dashboard/index.ts`:

```typescript
export { DashboardHeader } from './DashboardHeader';
export { TodayActivityCard } from './TodayActivityCard';
export { NextWorkoutCard } from './NextWorkoutCard';
export { QuickActionsRow } from './QuickActionsRow';
export { WeeklyProgressCard } from './WeeklyProgressCard';
export { BodyStatsCard } from './BodyStatsCard';
export { AchievementsCard } from './AchievementsCard';
export { DailyInsightCard } from './DailyInsightCard';
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/index.ts
git commit -m "feat(dashboard): create dashboard component directory with barrel exports"
```

---

### Task 2: DashboardHeader component

**Files:**
- Create: `mobile/components/dashboard/DashboardHeader.tsx`

- [ ] **Step 1: Create DashboardHeader**

Create `mobile/components/dashboard/DashboardHeader.tsx`:

```typescript
/**
 * DashboardHeader - Time-based greeting, streak pill, profile avatar
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';

interface DashboardHeaderProps {
  userName: string;
  streak: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, streak }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>
      <View style={styles.right}>
        {streak > 0 && (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={14} color={colors.accent.orange} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getFirstInitial(userName)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  left: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.size.lg,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  userName: {
    fontSize: typography.size['3xl'],
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.size.sm,
    color: colors.accent.orange,
    fontWeight: typography.weight.bold,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
});

export default DashboardHeader;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/DashboardHeader.tsx
git commit -m "feat(dashboard): add DashboardHeader component with greeting, streak, avatar"
```

---

### Task 3: TodayActivityCard component

**Files:**
- Create: `mobile/components/dashboard/TodayActivityCard.tsx`

- [ ] **Step 1: Create TodayActivityCard**

Create `mobile/components/dashboard/TodayActivityCard.tsx`:

```typescript
/**
 * TodayActivityCard - 4 progress rings: calories, protein, water, steps
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface MetricData {
  current: number;
  goal: number;
}

interface TodayActivityCardProps {
  calories: MetricData;
  protein: MetricData;
  water: MetricData;
  steps: MetricData;
}

// ============================================================================
// AnimatedProgressRing - Extracted and parameterized
// ============================================================================
interface ProgressRingProps {
  progress: number;
  label: string;
  value: string;
  goalLabel: string;
  color: string;
  gradientId: string;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  label,
  value,
  goalLabel,
  color,
  gradientId,
  size = 60,
  strokeWidth = 3,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(progress, 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const clampedProgress = Math.min(progress, 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={ringStyles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} />
              <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </SvgGradient>
          </Defs>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={ringRadius}
            stroke={colors.glassBorder}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={center}
            cy={center}
            r={ringRadius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90, ${center}, ${center})`}
          />
        </Svg>
        <Text style={ringStyles.value}>{value}</Text>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
      <Text style={ringStyles.goal}>{goalLabel}</Text>
    </View>
  );
};

const ringStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 9,
    fontWeight: typography.weight.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  goal: {
    fontSize: 9,
    color: colors.textDisabled,
    marginTop: 2,
  },
});

// ============================================================================
// TodayActivityCard
// ============================================================================

function formatWater(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${ml}ml`;
}

function formatSteps(steps: number): string {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1)}k`;
  }
  return String(steps);
}

export const TodayActivityCard: React.FC<TodayActivityCardProps> = ({
  calories,
  protein,
  water,
  steps,
}) => {
  const calorieProgress = calories.goal > 0 ? (calories.current / calories.goal) * 100 : 0;
  const proteinProgress = protein.goal > 0 ? (protein.current / protein.goal) * 100 : 0;
  const waterProgress = water.goal > 0 ? (water.current / water.goal) * 100 : 0;
  const stepsProgress = steps.goal > 0 ? (steps.current / steps.goal) * 100 : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>TODAY'S ACTIVITY</Text>
      <View style={styles.ringsRow}>
        <ProgressRing
          progress={calorieProgress}
          label="Calories"
          value={String(Math.round(calories.current))}
          goalLabel={`/ ${calories.goal}`}
          color={colors.primary}
          gradientId="caloriesGrad"
        />
        <ProgressRing
          progress={proteinProgress}
          label="Protein"
          value={`${Math.round(protein.current)}g`}
          goalLabel={`/ ${protein.goal}g`}
          color={colors.secondary}
          gradientId="proteinGrad"
        />
        <ProgressRing
          progress={waterProgress}
          label="Water"
          value={formatWater(water.current)}
          goalLabel={`/ ${formatWater(water.goal)}`}
          color={colors.accent.blue}
          gradientId="waterGrad"
        />
        <ProgressRing
          progress={stepsProgress}
          label="Steps"
          value={formatSteps(steps.current)}
          goalLabel={`/ ${formatSteps(steps.goal)}`}
          color={colors.accent.orange}
          gradientId="stepsGrad"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

export default TodayActivityCard;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/TodayActivityCard.tsx
git commit -m "feat(dashboard): add TodayActivityCard with 4 animated progress rings"
```

---

### Task 4: NextWorkoutCard component

**Files:**
- Create: `mobile/components/dashboard/NextWorkoutCard.tsx`

- [ ] **Step 1: Create NextWorkoutCard**

Create `mobile/components/dashboard/NextWorkoutCard.tsx`:

```typescript
/**
 * NextWorkoutCard - Green accent glass card showing next scheduled workout
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface NextWorkoutCardProps {
  workout: {
    name: string;
    duration: number;
    exerciseCount: number;
  } | null;
  onStartWorkout: () => void;
  onCreateWorkout: () => void;
}

export const NextWorkoutCard: React.FC<NextWorkoutCardProps> = ({
  workout,
  onStartWorkout,
  onCreateWorkout,
}) => {
  if (!workout) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCreateWorkout}
        style={styles.emptyCard}
      >
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Create Your First Workout</Text>
          <Text style={styles.emptySubtitle}>Build a routine to get started</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(74, 222, 128, 0.08)', 'rgba(74, 222, 128, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.topAccent} />
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.label}>NEXT WORKOUT</Text>
            <Text style={styles.title}>{workout.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{workout.duration} min</Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="barbell-outline" size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{workout.exerciseCount} exercises</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onStartWorkout}
            style={styles.playButton}
          >
            <LinearGradient
              colors={gradients.buttonPrimary as unknown as string[]}
              style={styles.playButtonGradient}
            >
              <Ionicons name="play" size={20} color={colors.textInverse} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: radius.xl,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: typography.size.xs,
    color: colors.textDisabled,
  },
  playButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  playButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    borderStyle: 'dashed',
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});

export default NextWorkoutCard;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/NextWorkoutCard.tsx
git commit -m "feat(dashboard): add NextWorkoutCard with workout info and empty CTA"
```

---

### Task 5: QuickActionsRow component

**Files:**
- Create: `mobile/components/dashboard/QuickActionsRow.tsx`

- [ ] **Step 1: Create QuickActionsRow**

Create `mobile/components/dashboard/QuickActionsRow.tsx`:

```typescript
/**
 * QuickActionsRow - 4 icon buttons for common actions
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface QuickActionsRowProps {
  onLogMeal: () => void;
  onAddWater: () => void;
  onAskAI: () => void;
  onWeighIn: () => void;
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={styles.actionButton}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onLogMeal,
  onAddWater,
  onAskAI,
  onWeighIn,
}) => {
  return (
    <View style={styles.container}>
      <ActionButton
        icon="camera"
        label="Log Meal"
        color={colors.primary}
        onPress={onLogMeal}
      />
      <ActionButton
        icon="water"
        label="Add Water"
        color={colors.accent.blue}
        onPress={onAddWater}
      />
      <ActionButton
        icon="chatbubbles"
        label="Ask AI"
        color={colors.secondary}
        onPress={onAskAI}
      />
      <ActionButton
        icon="scale"
        label="Weigh In"
        color={colors.accent.orange}
        onPress={onWeighIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
});

export default QuickActionsRow;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/QuickActionsRow.tsx
git commit -m "feat(dashboard): add QuickActionsRow with 4 action buttons"
```

---

### Task 6: WeeklyProgressCard component

**Files:**
- Create: `mobile/components/dashboard/WeeklyProgressCard.tsx`

- [ ] **Step 1: Create WeeklyProgressCard**

Create `mobile/components/dashboard/WeeklyProgressCard.tsx`:

```typescript
/**
 * WeeklyProgressCard - Week progress dots, workout count, volume/time, PR highlight
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface WeeklyProgressCardProps {
  workoutsCompleted: number;
  workoutsTarget: number;
  weekDays: boolean[];
  totalVolume: number;
  totalTime: number;
  latestPR: {
    name: string;
    detail: string;
    date: string;
  } | null;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  return `${kg.toLocaleString()} kg`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getTodayDayIndex(): number {
  const day = new Date().getDay();
  // Convert from Sunday=0 to Monday=0
  return day === 0 ? 6 : day - 1;
}

export const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
  workoutsCompleted,
  workoutsTarget,
  weekDays,
  totalVolume,
  totalTime,
  latestPR,
}) => {
  const todayIndex = getTodayDayIndex();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <Text style={styles.workoutCount}>
          {workoutsCompleted} / {workoutsTarget} workouts
        </Text>
      </View>

      {/* Week dots */}
      <View style={styles.dotsRow}>
        {DAY_LABELS.map((label, index) => {
          const isCompleted = weekDays[index] === true;
          const isToday = index === todayIndex;

          return (
            <View key={index} style={styles.dayColumn}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isToday && !isCompleted && styles.dotToday,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={10} color={colors.textInverse} />
                )}
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Stat boxes */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
          <Text style={styles.statLabel}>VOLUME</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
          <Text style={styles.statLabel}>TIME</Text>
        </View>
      </View>

      {/* PR highlight */}
      {latestPR && (
        <View style={styles.prRow}>
          <View style={styles.prIconWrap}>
            <Ionicons name="trophy" size={14} color={colors.warning} />
          </View>
          <View style={styles.prInfo}>
            <Text style={styles.prName}>{latestPR.name}</Text>
            <Text style={styles.prDetail}>{latestPR.detail}</Text>
          </View>
          <Text style={styles.prDate}>{latestPR.date}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  workoutCount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotToday: {
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: typography.weight.medium,
    color: colors.textDisabled,
    textTransform: 'uppercase',
  },
  dayLabelToday: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  prIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prInfo: {
    flex: 1,
  },
  prName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  prDetail: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  prDate: {
    fontSize: typography.size.xs,
    color: colors.textDisabled,
  },
});

export default WeeklyProgressCard;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/WeeklyProgressCard.tsx
git commit -m "feat(dashboard): add WeeklyProgressCard with dots, stats, and PR highlight"
```

---

### Task 7: BodyStatsCard component

**Files:**
- Create: `mobile/components/dashboard/BodyStatsCard.tsx`

- [ ] **Step 1: Create BodyStatsCard**

Create `mobile/components/dashboard/BodyStatsCard.tsx`:

```typescript
/**
 * BodyStatsCard - Weight trend, sleep average, last night detail
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface BodyStatsCardProps {
  weight: {
    current: number | null;
    weeklyDelta: number | null;
  };
  sleep: {
    sevenDayAvg: number | null;
    status: 'optimal' | 'on_track' | 'borderline' | 'insufficient';
    statusLabel: string;
    statusColor: string;
    lastNight: {
      duration: string;
      bedtime: string;
      wakeTime: string;
    } | null;
  };
  onLogSleep?: () => void;
  onWeightPress?: () => void;
  onSleepPress?: () => void;
}

export const BodyStatsCard: React.FC<BodyStatsCardProps> = ({
  weight,
  sleep,
  onLogSleep,
  onWeightPress,
  onSleepPress,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>BODY STATS</Text>

      {/* Two sub-cards */}
      <View style={styles.statsRow}>
        {/* Weight */}
        <TouchableOpacity
          style={styles.statCard}
          activeOpacity={onWeightPress ? 0.7 : 1}
          onPress={onWeightPress}
        >
          <Text style={styles.statTitle}>Weight</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>
              {weight.current != null ? weight.current.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statUnit}>kg</Text>
          </View>
          {weight.weeklyDelta != null && weight.weeklyDelta !== 0 && (
            <View style={styles.deltaRow}>
              <Ionicons
                name={weight.weeklyDelta < 0 ? 'trending-down' : 'trending-up'}
                size={14}
                color={weight.weeklyDelta < 0 ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.deltaText,
                  { color: weight.weeklyDelta < 0 ? colors.success : colors.error },
                ]}
              >
                {Math.abs(weight.weeklyDelta).toFixed(1)} kg
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sleep Average */}
        <TouchableOpacity
          style={styles.statCard}
          activeOpacity={onSleepPress ? 0.7 : 1}
          onPress={onSleepPress}
        >
          <View style={styles.sleepTitleRow}>
            <Text style={styles.statTitle}>Sleep Avg</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
          </View>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: sleep.statusColor }]}>
              {sleep.sevenDayAvg != null ? sleep.sevenDayAvg.toFixed(1) : '--'}
            </Text>
            <Text style={styles.statUnit}>hrs</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${sleep.statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: sleep.statusColor }]} />
            <Text style={[styles.statusText, { color: sleep.statusColor }]}>
              {sleep.statusLabel}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Last night row */}
      {sleep.lastNight ? (
        <TouchableOpacity
          style={styles.lastNightRow}
          activeOpacity={onSleepPress ? 0.7 : 1}
          onPress={onSleepPress}
        >
          <View style={styles.moonIconWrap}>
            <Ionicons name="moon" size={16} color={colors.secondary} />
          </View>
          <View style={styles.lastNightContent}>
            <Text style={styles.lastNightLabel}>Last night</Text>
            <Text style={[styles.lastNightDuration, { color: colors.secondary }]}>
              {sleep.lastNight.duration}
            </Text>
          </View>
          <Text style={styles.lastNightTimes}>
            {sleep.lastNight.bedtime} - {sleep.lastNight.wakeTime}
          </Text>
        </TouchableOpacity>
      ) : onLogSleep ? (
        <TouchableOpacity
          style={styles.logSleepRow}
          activeOpacity={0.7}
          onPress={onLogSleep}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.logSleepText}>Log last night's sleep</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glassLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statTitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sleepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statUnit: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  deltaText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.weight.medium,
  },
  lastNightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.md,
  },
  moonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastNightContent: {
    flex: 1,
  },
  lastNightLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  lastNightDuration: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
  },
  lastNightTimes: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  logSleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  logSleepText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
});

export default BodyStatsCard;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/BodyStatsCard.tsx
git commit -m "feat(dashboard): add BodyStatsCard with weight trend and sleep data"
```

---

### Task 8: AchievementsCard component

**Files:**
- Create: `mobile/components/dashboard/AchievementsCard.tsx`

- [ ] **Step 1: Create AchievementsCard**

Create `mobile/components/dashboard/AchievementsCard.tsx`:

```typescript
/**
 * AchievementsCard - Level badge, XP progress bar, recent achievement icons
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

interface AchievementsCardProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  recentBadges: { emoji: string; name: string }[];
  onViewAll?: () => void;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  level,
  currentXP,
  nextLevelXP,
  recentBadges,
  onViewAll,
}) => {
  const xpProgress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;
  const clampedProgress = Math.min(xpProgress, 100);
  const remainingSlots = Math.max(0, 3 - recentBadges.length);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>LEVEL & ACHIEVEMENTS</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Level + XP row */}
      <View style={styles.levelRow}>
        {/* Level badge */}
        <LinearGradient
          colors={gradients.buttonSecondary as unknown as string[]}
          style={styles.levelBadge}
        >
          <Text style={styles.levelNumber}>{level}</Text>
        </LinearGradient>

        {/* XP bar */}
        <View style={styles.xpSection}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <View style={styles.xpBarBg}>
            <LinearGradient
              colors={gradients.progressPurple as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.xpBarFill, { width: `${clampedProgress}%` }]}
            />
          </View>
          <Text style={styles.xpText}>
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </Text>
        </View>
      </View>

      {/* Recent badges */}
      <View style={styles.badgesRow}>
        {recentBadges.slice(0, 3).map((badge, index) => (
          <View key={index} style={styles.badgeItem}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>
              {badge.name}
            </Text>
          </View>
        ))}
        {remainingSlots > 0 && (
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIcon, styles.badgePlaceholder]}>
              <Text style={styles.badgeMoreText}>+{remainingSlots}</Text>
            </View>
            <Text style={styles.badgeName}>more</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  viewAll: {
    fontSize: typography.size.sm,
    color: colors.secondary,
    fontWeight: typography.weight.medium,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
  xpSection: {
    flex: 1,
  },
  levelLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: colors.glassLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeName: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  badgePlaceholder: {
    borderStyle: 'dashed',
  },
  badgeMoreText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textDisabled,
  },
});

export default AchievementsCard;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/AchievementsCard.tsx
git commit -m "feat(dashboard): add AchievementsCard with level badge and XP bar"
```

---

### Task 9: DailyInsightCard component

**Files:**
- Create: `mobile/components/dashboard/DailyInsightCard.tsx`

- [ ] **Step 1: Create DailyInsightCard**

Create `mobile/components/dashboard/DailyInsightCard.tsx`:

```typescript
/**
 * DailyInsightCard - Blue accent card with rotating insight text
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';

interface DailyInsightCardProps {
  insight: string;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ insight }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="bulb" size={18} color={colors.accent.blue} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Daily Insight</Text>
        <Text style={styles.insightText}>{insight}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: typography.weight.semiBold,
    color: colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default DailyInsightCard;
```

- [ ] **Step 2: Commit**

```
git add mobile/components/dashboard/DailyInsightCard.tsx
git commit -m "feat(dashboard): add DailyInsightCard with blue accent styling"
```

---

### Task 10: DashboardScreen -- main screen

**Files:**
- Create: `mobile/screens/DashboardScreen.tsx`

- [ ] **Step 1: Create DashboardScreen**

Create `mobile/screens/DashboardScreen.tsx`:

```typescript
/**
 * DashboardScreen - Main dashboard with card-based layout
 *
 * Orchestrates data fetching and passes data as props to child components.
 * All API calls wrapped in try/catch with graceful fallback to mock data.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design System
import {
  colors,
  gradients,
  typography,
  spacing,
  animation,
} from '../design/tokens';

// Components
import {
  DashboardHeader,
  TodayActivityCard,
  NextWorkoutCard,
  QuickActionsRow,
  WeeklyProgressCard,
  BodyStatsCard,
  AchievementsCard,
  DailyInsightCard,
} from '../components/dashboard';

// Services
import { getTodaySummary, getNutritionGoal, logWater } from '../services/nutritionService';
import { getWorkoutStats } from '../services/workoutService';
import { measurementService } from '../services/measurementService';
import { achievementService } from '../services/achievementService';

// Stores
import { useSleepStore } from '../stores/sleepStore';
import { useTrainingStore } from '../stores/trainingStore';

// Sleep utils
import {
  formatDuration,
  getSleepStatusInfo,
  formatTimeDisplay,
} from '../utils/sleepCalculations';

// Mock data fallbacks
import {
  mockTodayNutrition,
  mockMeasurements,
  mockDashboardStats,
  mockInsights,
} from '../data/mockData';

// Types
import type { UserStats } from '../types/achievement.types';

// ============================================================================
// DAILY INSIGHTS
// ============================================================================
const DAILY_INSIGHTS = [
  'Consistency beats perfection. Keep showing up and the results will follow.',
  'Hydration tip: drink a glass of water before every meal to boost metabolism.',
  'Try progressive overload: add 2.5kg to your main lifts each week.',
  'Sleep is recovery. Aim for 7-9 hours to maximize muscle growth.',
  'Post-workout protein within 30 minutes helps optimize muscle repair.',
  'Active recovery days are just as important as training days.',
  'Track your workouts to see progress you might not notice in the mirror.',
];

function getDailyInsight(): string {
  const dayOfWeek = new Date().getDay();
  return DAILY_INSIGHTS[dayOfWeek % DAILY_INSIGHTS.length];
}

// ============================================================================
// DASHBOARD STATE
// ============================================================================
interface DashboardState {
  userName: string;
  streak: number;
  calories: { current: number; goal: number };
  protein: { current: number; goal: number };
  water: { current: number; goal: number };
  steps: { current: number; goal: number };
  nextWorkout: { name: string; duration: number; exerciseCount: number } | null;
  workoutsCompleted: number;
  workoutsTarget: number;
  weekDays: boolean[];
  totalVolume: number;
  totalTime: number;
  latestPR: { name: string; detail: string; date: string } | null;
  weight: { current: number | null; weeklyDelta: number | null };
  sleepAvg: number | null;
  sleepStatus: 'optimal' | 'on_track' | 'borderline' | 'insufficient';
  sleepStatusLabel: string;
  sleepStatusColor: string;
  lastNightSleep: { duration: string; bedtime: string; wakeTime: string } | null;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  recentBadges: { emoji: string; name: string }[];
  insight: string;
}

const DEFAULT_STATE: DashboardState = {
  userName: 'Athlete',
  streak: 0,
  calories: { current: 0, goal: 2200 },
  protein: { current: 0, goal: 150 },
  water: { current: 0, goal: 3000 },
  steps: { current: 0, goal: 10000 },
  nextWorkout: null,
  workoutsCompleted: 0,
  workoutsTarget: 5,
  weekDays: [false, false, false, false, false, false, false],
  totalVolume: 0,
  totalTime: 0,
  latestPR: null,
  weight: { current: null, weeklyDelta: null },
  sleepAvg: null,
  sleepStatus: 'insufficient',
  sleepStatusLabel: 'No data',
  sleepStatusColor: colors.textDisabled,
  lastNightSleep: null,
  level: 1,
  currentXP: 0,
  nextLevelXP: 1000,
  recentBadges: [],
  insight: getDailyInsight(),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // State
  const [data, setData] = useState<DashboardState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stores
  const {
    fetchAllRecentEntries: fetchSleepEntries,
    get7DayAverage: getSleep7DayAvg,
    getRecentEntries: getRecentSleepEntries,
  } = useSleepStore();

  const {
    savedWorkouts,
    workoutHistory,
    getStreak,
  } = useTrainingStore();

  // ========================================
  // DATA LOADING
  // ========================================
  const loadDashboardData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Fetch sleep data
      await fetchSleepEntries();

      // Get user info from AsyncStorage
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : null;
      const userName = user?.first_name || user?.username || 'Athlete';

      // Get streak from training store
      const streak = getStreak();

      // --- Nutrition ---
      let calories = { current: mockTodayNutrition.calories.current, goal: mockTodayNutrition.calories.target };
      let protein = { current: mockTodayNutrition.protein.current, goal: mockTodayNutrition.protein.target };
      let water = { current: mockTodayNutrition.water.current, goal: mockTodayNutrition.water.target };

      try {
        const [summaryResult, goalResult] = await Promise.allSettled([
          getTodaySummary(),
          getNutritionGoal(),
        ]);

        if (summaryResult.status === 'fulfilled') {
          const s = summaryResult.value;
          calories.current = Math.round(s.calories?.current || calories.current);
          protein.current = Math.round(s.protein?.current || protein.current);
          water.current = Math.round(s.water?.current || water.current);
        }
        if (goalResult.status === 'fulfilled') {
          const g = goalResult.value;
          calories.goal = g.calories || calories.goal;
          protein.goal = g.protein || protein.goal;
          water.goal = g.water_ml || water.goal;
        }
      } catch {
        // Use mock data
      }

      // --- Steps (mock for now, no wearable integration) ---
      const steps = { current: mockDashboardStats.stepsToday, goal: mockDashboardStats.stepsGoal };

      // --- Next workout ---
      let nextWorkout: DashboardState['nextWorkout'] = null;
      if (savedWorkouts.length > 0) {
        const w = savedWorkouts[0];
        nextWorkout = {
          name: w.name,
          duration: w.exercises.length * 8, // Estimate ~8min per exercise
          exerciseCount: w.exercises.length,
        };
      }

      // --- Weekly progress ---
      const today = new Date();
      const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayIndex);
      weekStart.setHours(0, 0, 0, 0);

      const weekHistory = workoutHistory.filter(h => {
        const hDate = new Date(h.date);
        return hDate >= weekStart && hDate <= today;
      });

      // Build weekDays array
      const weekDays = [false, false, false, false, false, false, false];
      weekHistory.forEach(h => {
        const hDate = new Date(h.date);
        const hDay = hDate.getDay() === 0 ? 6 : hDate.getDay() - 1;
        weekDays[hDay] = true;
      });

      const workoutsCompleted = weekDays.filter(Boolean).length;
      const totalVolume = weekHistory.reduce((sum, h) => sum + (h.weight || 0) * (h.reps || 0), 0);
      const totalTime = weekHistory.reduce((sum, h) => sum + Math.round((h.duration || 0) / 60), 0);

      // Find latest PR
      let latestPR: DashboardState['latestPR'] = null;
      const prEntry = weekHistory.find(h => h.personalRecord);
      if (prEntry) {
        latestPR = {
          name: prEntry.exerciseName,
          detail: `${prEntry.weight || 0}kg x ${prEntry.reps || 0}`,
          date: new Date(prEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      }

      // --- Weight ---
      let weightData: DashboardState['weight'] = { current: null, weeklyDelta: null };
      try {
        const latestMeasurement = await measurementService.getLatestMeasurement();
        if (latestMeasurement && latestMeasurement.weight) {
          weightData.current = latestMeasurement.weight;
          // Calculate weekly delta from measurement history
          const allMeasurements = await measurementService.getMeasurements({ limit: 10 });
          if (allMeasurements.length >= 2) {
            const sorted = [...allMeasurements].sort(
              (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
            );
            const latest = sorted[0]?.weight;
            const weekAgo = sorted.find(m => {
              const daysDiff = (new Date().getTime() - new Date(m.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff >= 5;
            });
            if (latest && weekAgo?.weight) {
              weightData.weeklyDelta = Number((latest - weekAgo.weight).toFixed(1));
            }
          }
        }
      } catch {
        weightData = {
          current: mockMeasurements.latest.weight,
          weeklyDelta: mockMeasurements.weeklyTrend,
        };
      }

      // --- Sleep ---
      const sleepAvg = getSleep7DayAvg();
      const sleepStatusInfo = getSleepStatusInfo(sleepAvg);

      let lastNightSleep: DashboardState['lastNightSleep'] = null;
      const recentSleep = getRecentSleepEntries(1);
      if (recentSleep.length > 0) {
        const entry = recentSleep[0];
        lastNightSleep = {
          duration: formatDuration(entry.duration_hours),
          bedtime: formatTimeDisplay(entry.bedtime),
          wakeTime: formatTimeDisplay(entry.wake_time),
        };
      }

      // --- Achievements ---
      let level = 1;
      let currentXP = 0;
      let nextLevelXP = 1000;
      let recentBadges: { emoji: string; name: string }[] = [];

      try {
        const userStats: UserStats = await achievementService.getUserStats();
        level = userStats.level.level;
        currentXP = userStats.level.current_xp;
        nextLevelXP = userStats.level.xp_to_next_level;

        const unlocked = await achievementService.getUnlockedAchievements();
        recentBadges = unlocked
          .slice(-3)
          .reverse()
          .map(ua => ({
            emoji: ua.achievement.icon_name || '🏆',
            name: ua.achievement.name,
          }));
      } catch {
        // Use defaults
      }

      // --- Daily insight ---
      const insight = getDailyInsight();

      setData({
        userName,
        streak,
        calories,
        protein,
        water,
        steps,
        nextWorkout,
        workoutsCompleted,
        workoutsTarget: 5,
        weekDays,
        totalVolume,
        totalTime,
        latestPR,
        weight: weightData,
        sleepAvg,
        sleepStatus: sleepStatusInfo.status as DashboardState['sleepStatus'],
        sleepStatusLabel: sleepStatusInfo.label,
        sleepStatusColor: sleepStatusInfo.color,
        lastNightSleep,
        level,
        currentXP,
        nextLevelXP,
        recentBadges,
        insight,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchSleepEntries, getSleep7DayAvg, getRecentSleepEntries, savedWorkouts, workoutHistory, getStreak]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: animation.easing.spring.friction,
        tension: animation.easing.spring.tension,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => loadDashboardData(true), [loadDashboardData]);

  // ========================================
  // QUICK ACTION HANDLERS
  // ========================================
  const handleLogMeal = () => {
    router.push('/(tabs)/log-meal');
  };

  const handleAddWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await logWater({ amount_ml: 250, date: today });
      // Refresh to show updated water
      loadDashboardData(true);
    } catch {
      // Silently fail
    }
  };

  const handleAskAI = () => {
    router.push('/(tabs)/chat');
  };

  const handleWeighIn = () => {
    router.push('/(tabs)/measurements');
  };

  const handleStartWorkout = () => {
    router.push('/(tabs)/training');
  };

  const handleCreateWorkout = () => {
    router.push('/(tabs)/training');
  };

  const handleViewAchievements = () => {
    router.push('/achievements');
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (isLoading) {
    return (
      <LinearGradient colors={gradients.background as unknown as string[]} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </LinearGradient>
    );
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <LinearGradient colors={gradients.background as unknown as string[]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing['2xl'],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View
          style={[
            styles.contentWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <DashboardHeader
            userName={data.userName}
            streak={data.streak}
          />

          <TodayActivityCard
            calories={data.calories}
            protein={data.protein}
            water={data.water}
            steps={data.steps}
          />

          <NextWorkoutCard
            workout={data.nextWorkout}
            onStartWorkout={handleStartWorkout}
            onCreateWorkout={handleCreateWorkout}
          />

          <QuickActionsRow
            onLogMeal={handleLogMeal}
            onAddWater={handleAddWater}
            onAskAI={handleAskAI}
            onWeighIn={handleWeighIn}
          />

          <WeeklyProgressCard
            workoutsCompleted={data.workoutsCompleted}
            workoutsTarget={data.workoutsTarget}
            weekDays={data.weekDays}
            totalVolume={data.totalVolume}
            totalTime={data.totalTime}
            latestPR={data.latestPR}
          />

          <BodyStatsCard
            weight={data.weight}
            sleep={{
              sevenDayAvg: data.sleepAvg,
              status: data.sleepStatus,
              statusLabel: data.sleepStatusLabel,
              statusColor: data.sleepStatusColor,
              lastNight: data.lastNightSleep,
            }}
            onWeightPress={handleWeighIn}
          />

          <AchievementsCard
            level={data.level}
            currentXP={data.currentXP}
            nextLevelXP={data.nextLevelXP}
            recentBadges={data.recentBadges}
            onViewAll={handleViewAchievements}
          />

          <DailyInsightCard insight={data.insight} />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center', width: '100%' } : {}),
  },
  contentWrap: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
```

- [ ] **Step 2: Commit**

```
git add mobile/screens/DashboardScreen.tsx
git commit -m "feat(dashboard): add DashboardScreen with data fetching and all section components"
```

---

### Task 11: Wire up route + cleanup

**Files:**
- Modify: `mobile/app/(tabs)/dashboard.tsx`

- [ ] **Step 1: Update route file**

Replace the contents of `mobile/app/(tabs)/dashboard.tsx` with:

```typescript
import DashboardScreen from '../../screens/DashboardScreen';

export default DashboardScreen;
```

- [ ] **Step 2: Commit**

```
git add mobile/app/(tabs)/dashboard.tsx
git commit -m "feat(dashboard): wire up new DashboardScreen in route file"
```

Note: `PremiumDashboardScreen.tsx` is kept as a backup initially. It can be deleted in a follow-up cleanup once the new dashboard is verified working.

---

### Task 12: Final verification

- [ ] **Step 1: TypeScript check**

```bash
cd mobile && npx tsc --noEmit
```

Fix any type errors that surface. Common issues to watch for:
- Import paths (verify `../../design/tokens` vs `../design/tokens` based on file depth)
- `gradients.background as unknown as string[]` cast for LinearGradient
- Optional chaining on nullable API responses

- [ ] **Step 2: Verify file structure**

```bash
ls -la mobile/components/dashboard/
```

Expected files:
```
index.ts
DashboardHeader.tsx
TodayActivityCard.tsx
NextWorkoutCard.tsx
QuickActionsRow.tsx
WeeklyProgressCard.tsx
BodyStatsCard.tsx
AchievementsCard.tsx
DailyInsightCard.tsx
```

- [ ] **Step 3: Run existing tests**

```bash
cd mobile && npm test -- --passWithNoTests
```

- [ ] **Step 4: Final commit (if fixes were needed)**

```
git add -A
git commit -m "fix(dashboard): resolve TypeScript errors from dashboard redesign"
```
