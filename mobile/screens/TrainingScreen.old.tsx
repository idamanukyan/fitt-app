/**
 * TrainingScreen - Complete workout management with tabs
 * Tabs: Discover (Templates), My Workouts, History
 * High-tech architecture design
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import {
  getWorkoutTemplates,
  getMyWorkouts,
  getWorkoutSessions,
  searchExercises,
  toggleFavorite,
  formatWorkoutType,
} from '../services/workoutService';
import {
  WorkoutTemplateSummary,
  UserWorkout,
  WorkoutSessionSummary,
  Exercise,
  MuscleGroup,
  Equipment,
} from '../types/workout.types';
import WorkoutTemplateCard from '../components/molecules/WorkoutTemplateCard';
import ActiveWorkoutCard from '../components/molecules/ActiveWorkoutCard';
import WorkoutSessionCard from '../components/molecules/WorkoutSessionCard';
import ExerciseCard from '../components/atoms/ExerciseCard';

type Tab = 'discover' | 'workouts' | 'history';

const muscleGroups = ['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'LEGS', 'ARMS', 'ABS', 'CARDIO'];

export default function TrainingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Discover Tab State
  const [templates, setTemplates] = useState<WorkoutTemplateSummary[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showingExercises, setShowingExercises] = useState(false);

  // My Workouts Tab State
  const [myWorkouts, setMyWorkouts] = useState<UserWorkout[]>([]);

  // History Tab State
  const [sessions, setSessions] = useState<WorkoutSessionSummary[]>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'discover') {
        await loadTemplates();
      } else if (activeTab === 'workouts') {
        await loadMyWorkouts();
      } else if (activeTab === 'history') {
        await loadSessions();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await getWorkoutTemplates(1, 20, {
        is_featured: true,
      });
      setTemplates(response.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadMyWorkouts = async () => {
    try {
      const workouts = await getMyWorkouts(true);
      setMyWorkouts(workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await getWorkoutSessions(1, 20, true);
      setSessions(response.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setShowingExercises(false);
      return;
    }

    try {
      const results = await searchExercises(query);
      setExercises(results);
      setShowingExercises(true);
    } catch (error) {
      console.error('Error searching exercises:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTemplatePress = (templateId: number) => {
    router.push(`/workout-detail/${templateId}`);
  };

  const handleWorkoutPress = (workoutId: number) => {
    router.push(`/workout-detail/${workoutId}?type=user`);
  };

  const handleSessionPress = (sessionId: number) => {
    router.push(`/workout-history-detail/${sessionId}`);
  };

  const handleExercisePress = (exerciseId: number) => {
    router.push(`/exercise-detail/${exerciseId}`);
  };

  const handleStartWorkout = (workoutId: number) => {
    router.push(`/workout-session/${workoutId}`);
  };

  const handleToggleFavorite = async (workoutId: number) => {
    try {
      await toggleFavorite(workoutId);
      await loadMyWorkouts();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
        onPress={() => setActiveTab('discover')}
        activeOpacity={0.8}
      >
        {activeTab === 'discover' ? (
          <LinearGradient
            colors={[theme.colors.techBlue, theme.colors.techCyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tabGradient}
          >
            <Ionicons name="compass" size={18} color={theme.colors.black} />
            <Text style={styles.tabTextActive}>DISCOVER</Text>
          </LinearGradient>
        ) : (
          <>
            <Ionicons name="compass-outline" size={18} color={theme.colors.steel} />
            <Text style={styles.tabText}>DISCOVER</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
        onPress={() => setActiveTab('workouts')}
        activeOpacity={0.8}
      >
        {activeTab === 'workouts' ? (
          <LinearGradient
            colors={[theme.colors.techBlue, theme.colors.techCyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tabGradient}
          >
            <Ionicons name="barbell" size={18} color={theme.colors.black} />
            <Text style={styles.tabTextActive}>MY WORKOUTS</Text>
          </LinearGradient>
        ) : (
          <>
            <Ionicons name="barbell-outline" size={18} color={theme.colors.steel} />
            <Text style={styles.tabText}>MY WORKOUTS</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        onPress={() => setActiveTab('history')}
        activeOpacity={0.8}
      >
        {activeTab === 'history' ? (
          <LinearGradient
            colors={[theme.colors.techBlue, theme.colors.techCyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tabGradient}
          >
            <Ionicons name="time" size={18} color={theme.colors.black} />
            <Text style={styles.tabTextActive}>HISTORY</Text>
          </LinearGradient>
        ) : (
          <>
            <Ionicons name="time-outline" size={18} color={theme.colors.steel} />
            <Text style={styles.tabText}>HISTORY</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.steel} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === 'discover'
              ? 'Search workouts & exercises...'
              : activeTab === 'workouts'
              ? 'Search my workouts...'
              : 'Search history...'
          }
          placeholderTextColor={theme.colors.steelDark}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setShowingExercises(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.steel} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMuscleGroupFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterScrollContent}
    >
      {muscleGroups.map((group) => (
        <TouchableOpacity
          key={group}
          onPress={() => setSelectedMuscleGroup(group)}
          activeOpacity={0.8}
        >
          {selectedMuscleGroup === group ? (
            <LinearGradient
              colors={[theme.colors.techBlue, theme.colors.techCyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.filterChipActive}
            >
              <Text style={styles.filterChipTextActive}>{group}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{group}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDiscoverTab = () => (
    <View style={styles.tabContent}>
      {showingExercises ? (
        <>
          <Text style={styles.sectionTitle}>
            EXERCISES ({exercises.length})
          </Text>
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onPress={() => handleExercisePress(exercise.id)}
              compact
            />
          ))}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            FEATURED TEMPLATES ({templates.length})
          </Text>
          {templates.map((template) => (
            <WorkoutTemplateCard
              key={template.id}
              template={template}
              onPress={() => handleTemplatePress(template.id)}
            />
          ))}
        </>
      )}

      {!showingExercises && !isLoading && templates.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="barbell-outline" size={64} color={theme.colors.iron} />
          <Text style={styles.emptyText}>NO TEMPLATES AVAILABLE</Text>
          <Text style={styles.emptySubtext}>Check back soon for new workouts</Text>
        </View>
      )}
    </View>
  );

  const renderMyWorkoutsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        ACTIVE WORKOUTS ({myWorkouts.length})
      </Text>

      {myWorkouts.map((workout) => (
        <ActiveWorkoutCard
          key={workout.id}
          workout={workout}
          onPress={() => handleWorkoutPress(workout.id)}
          onStart={() => handleStartWorkout(workout.id)}
          onFavorite={() => handleToggleFavorite(workout.id)}
        />
      ))}

      {!isLoading && myWorkouts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={64} color={theme.colors.iron} />
          <Text style={styles.emptyText}>NO WORKOUTS YET</Text>
          <Text style={styles.emptySubtext}>
            Browse templates in Discover to get started
          </Text>
        </View>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        WORKOUT HISTORY ({sessions.length})
      </Text>

      {sessions.map((session) => (
        <WorkoutSessionCard
          key={session.id}
          session={session}
          onPress={() => handleSessionPress(session.id)}
        />
      ))}

      {!isLoading && sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.iron} />
          <Text style={styles.emptyText}>NO WORKOUT HISTORY</Text>
          <Text style={styles.emptySubtext}>
            Complete your first workout to see it here
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techBlue}
            colors={[theme.colors.techBlue]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>TRAINING</Text>
            <Text style={styles.subtitle}>BUILD YOUR STRENGTH</Text>
          </View>

          {/* Tabs */}
          {renderTabs()}

          {/* Search Bar */}
          {renderSearchBar()}

          {/* Muscle Group Filter (Discover tab only) */}
          {activeTab === 'discover' && !showingExercises && renderMuscleGroupFilter()}

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.techBlue} />
              <Text style={styles.loadingText}>LOADING...</Text>
            </View>
          )}

          {/* Tab Content */}
          {!isLoading && (
            <>
              {activeTab === 'discover' && renderDiscoverTab()}
              {activeTab === 'workouts' && renderMyWorkoutsTab()}
              {activeTab === 'history' && renderHistoryTab()}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    overflow: 'hidden',
  },
  tabActive: {
    borderColor: theme.colors.techBlue,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.steel,
    letterSpacing: 1,
  },
  tabTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 1,
  },
  searchContainer: {
    marginBottom: theme.spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontWeight: '500',
  },
  filterScroll: {
    marginBottom: theme.spacing.lg,
  },
  filterScrollContent: {
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  filterChipActive: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.steel,
    letterSpacing: 1,
  },
  filterChipTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 1,
  },
  tabContent: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techBlue,
    fontWeight: '700',
    letterSpacing: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.steelDark,
    letterSpacing: 2,
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.iron,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    maxWidth: '80%',
  },
});
