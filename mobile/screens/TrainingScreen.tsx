/**
 * TrainingScreen - Redesigned Training Page
 * Matches Dashboard design system with modern UI components
 *
 * Features:
 * - Modern pill-style tabs and filters
 * - Dashboard-style search input
 * - Exercise cards with AI badges
 * - Exercise detail modal with GIF preview
 * - AI-coached workout sessions
 * - Saved workouts management
 * - Workout history with AI scores
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../design/tokens';
import { useTrainingStore } from '../stores/trainingStore';
import {
  TrainingTabs,
  TrainingTab,
  CategoryPills,
  SearchInput,
  ExerciseCard,
  ExerciseDetailModal,
  AIWorkoutSession,
  WorkoutHistoryCard,
  SavedWorkoutCard,
  CoachInsightsTab,
  AddToWorkoutModal,
} from '../components/training';
import type { ExerciseDetail, SavedWorkout, TrainingHistoryEntry } from '../types/training.types';
import { mockCoachInsightsDashboard } from '../src/mock/insightsMock';

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Store state
  const {
    exercises,
    featuredExercises,
    filteredExercises,
    searchQuery,
    selectedCategory,
    savedWorkouts,
    workoutHistory,
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
    getRecentHistory,
    getTotalWorkouts,
    getAverageScore,
    getStreak,
  } = useTrainingStore();

  // Local state
  const [activeTab, setActiveTab] = useState<TrainingTab>('discover');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showAISession, setShowAISession] = useState(false);
  const [showAddToWorkoutModal, setShowAddToWorkoutModal] = useState(false);
  const [exerciseForWorkout, setExerciseForWorkout] = useState<ExerciseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleExercisePress = useCallback((exercise: ExerciseDetail) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  }, []);

  const handleStartAIWorkout = useCallback((exercise: ExerciseDetail) => {
    setShowExerciseModal(false);
    setSelectedExercise(exercise);
    setTimeout(() => setShowAISession(true), 300);
  }, []);

  const handleAddToWorkouts = useCallback((exercise: ExerciseDetail) => {
    setShowExerciseModal(false);
    setExerciseForWorkout(exercise);
    setTimeout(() => setShowAddToWorkoutModal(true), 300);
  }, []);

  const handleAISessionComplete = useCallback((sessionData: any) => {
    setShowAISession(false);
    // Session data is already saved by the AI session component
  }, []);

  const handleWorkoutPress = useCallback((workout: SavedWorkout) => {
    router.push({
      pathname: '/workout/[id]',
      params: { id: workout.id },
    });
  }, [router]);

  const handleWorkoutStart = useCallback((workout: SavedWorkout) => {
    // Start first exercise in workout
    if (workout.exercises.length > 0) {
      const exerciseId = workout.exercises[0].exerciseId;
      const exercise = exercises.find(e => e.id === exerciseId);
      if (exercise) {
        handleStartAIWorkout(exercise);
      }
    }
  }, [exercises, handleStartAIWorkout]);

  const handleHistoryPress = useCallback((entry: TrainingHistoryEntry) => {
    // TODO: Show history detail
    console.log('History entry pressed:', entry.exerciseName);
  }, []);

  // Get display data
  const displayExercises = searchQuery.length > 0 || selectedCategory !== 'all'
    ? filteredExercises
    : activeTab === 'discover' ? featuredExercises : filteredExercises;

  const recentHistory = getRecentHistory(10);

  // Render tab content
  const renderDiscoverTab = () => (
    <View style={styles.tabContent}>
      {/* Category Filter Pills */}
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Stats Summary Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primarySubtle }]}>
              <Ionicons name="trophy" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{getTotalWorkouts()}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.secondarySubtle }]}>
              <Ionicons name="star" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{getAverageScore()}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
              <Ionicons name="flame" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{getStreak()}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? `Results (${displayExercises.length})` : 'Featured Exercises'}
        </Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <View style={styles.exerciseList}>
        {displayExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPress={() => handleExercisePress(exercise)}
            showAIBadge
          />
        ))}
      </View>

      {displayExercises.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No exercises found</Text>
          <Text style={styles.emptySubtitle}>Try a different search or category</Text>
        </View>
      )}
    </View>
  );

  const renderWorkoutsTab = () => (
    <View style={styles.tabContent}>
      {/* Quick Add Button */}
      <TouchableOpacity style={styles.addWorkoutButton} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.buttonPrimary as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addWorkoutGradient}
        >
          <Ionicons name="add-circle" size={24} color={colors.textInverse} />
          <Text style={styles.addWorkoutText}>Create New Workout</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Workouts ({savedWorkouts.length})</Text>
      </View>

      {/* Saved Workouts List */}
      <View style={styles.workoutList}>
        {savedWorkouts.map((workout) => (
          <SavedWorkoutCard
            key={workout.id}
            workout={workout}
            onPress={() => handleWorkoutPress(workout)}
            onStart={() => handleWorkoutStart(workout)}
            onFavorite={() => toggleFavorite(workout.id)}
          />
        ))}
      </View>

      {savedWorkouts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved workouts</Text>
          <Text style={styles.emptySubtitle}>Create a workout to get started</Text>
        </View>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentHistory.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* History List */}
      <View style={styles.historyList}>
        {recentHistory.map((entry) => (
          <WorkoutHistoryCard
            key={entry.id}
            entry={entry}
            onPress={() => handleHistoryPress(entry)}
          />
        ))}
      </View>

      {recentHistory.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No workout history</Text>
          <Text style={styles.emptySubtitle}>Complete a workout to see it here</Text>
        </View>
      )}
    </View>
  );

  const renderInsightsTab = () => (
    <CoachInsightsTab
      dashboard={mockCoachInsightsDashboard}
      onRefresh={async () => {
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
      }}
      onInsightPress={(insight) => {
        console.log('Insight pressed:', insight.title);
      }}
      onInsightAction={(insight) => {
        console.log('Insight action:', insight.actionType);
      }}
      onCorrelationPress={(correlation) => {
        console.log('Correlation pressed:', correlation.title);
      }}
      onStartWorkout={(recommendation) => {
        console.log('Start workout:', recommendation.title);
        // Could navigate to workout or start first exercise
        if (recommendation.exercises && recommendation.exercises.length > 0) {
          const firstExerciseId = recommendation.exercises[0].exerciseId;
          const exercise = exercises.find(e => e.id === firstExerciseId);
          if (exercise) {
            handleStartAIWorkout(exercise);
          }
        }
      }}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.background as unknown as string[]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Training</Text>
              <Text style={styles.subtitle}>Build your perfect workout</Text>
            </View>
            <TouchableOpacity style={styles.aiButton} activeOpacity={0.8}>
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                style={styles.aiButtonGradient}
              >
                <Ionicons name="sparkles" size={18} color={colors.textInverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              activeTab === 'discover'
                ? 'Search exercises...'
                : activeTab === 'workouts'
                ? 'Search my workouts...'
                : 'Search history...'
            }
          />

          {/* Tabs */}
          <TrainingTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {activeTab === 'discover' && renderDiscoverTab()}
              {activeTab === 'workouts' && renderWorkoutsTab()}
              {activeTab === 'history' && renderHistoryTab()}
              {activeTab === 'insights' && renderInsightsTab()}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        visible={showExerciseModal}
        exercise={selectedExercise}
        onClose={() => setShowExerciseModal(false)}
        onStartAIWorkout={handleStartAIWorkout}
        onAddToWorkouts={handleAddToWorkouts}
      />

      {/* AI Workout Session */}
      {selectedExercise && (
        <AIWorkoutSession
          visible={showAISession}
          exercise={selectedExercise}
          onClose={() => setShowAISession(false)}
          onComplete={handleAISessionComplete}
        />
      )}

      {/* Add to Workout Modal */}
      {exerciseForWorkout && (
        <AddToWorkoutModal
          visible={showAddToWorkoutModal}
          onClose={() => setShowAddToWorkoutModal(false)}
          exerciseId={exerciseForWorkout.id}
          exerciseName={exerciseForWorkout.name}
          onAddToWorkout={() => setShowAddToWorkoutModal(false)}
          onCreateNewWorkout={() => {
            setShowAddToWorkoutModal(false);
            router.push({
              pathname: '/workout/session',
              params: {
                exerciseId: exerciseForWorkout.id,
                exerciseName: exerciseForWorkout.name,
                mode: 'new',
              },
            });
          }}
          onStartQuickWorkout={() => {
            setShowAddToWorkoutModal(false);
            router.push({
              pathname: '/workout/session',
              params: {
                exerciseId: exerciseForWorkout.id,
                exerciseName: exerciseForWorkout.name,
                mode: 'quick',
              },
            });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  aiButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  aiButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  tabContent: {
    paddingTop: spacing.md,
  },
  statsCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.divider,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  exerciseList: {
    paddingHorizontal: spacing.xl,
  },
  workoutList: {
    paddingHorizontal: spacing.xl,
  },
  historyList: {
    paddingHorizontal: spacing.xl,
  },
  addWorkoutButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  addWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  addWorkoutText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
