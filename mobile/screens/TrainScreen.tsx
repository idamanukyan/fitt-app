/**
 * TrainScreen - User's Personal Exercise Library (Train Section)
 *
 * User-scoped content only:
 * - Saved exercises from Discover
 * - Custom user-created exercises
 * - Recent exercise history
 * - Quick actions to start workout
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import theme from '../utils/theme';
import ExerciseCard from '../components/atoms/ExerciseCard';
import { useExerciseStore } from '../stores/exerciseStore';
import type {
  ExerciseSummary,
  UserExerciseResponse,
  ExerciseHistoryResponse,
} from '../types/exercise.types';

// Tab options
type TabType = 'saved' | 'custom' | 'history';

export default function TrainScreen() {
  const navigation = useNavigation<any>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('saved');

  // Store state
  const {
    trainOverview,
    trainLoading,
    trainError,
    savedExercises,
    customExercises,
    recentHistory,
    isExerciseSaved,
    fetchTrainOverview,
    unsaveExercise,
    deleteCustomExercise,
    toggleSave,
  } = useExerciseStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTrainOverview();
    }, [fetchTrainOverview])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrainOverview();
    setRefreshing(false);
  }, [fetchTrainOverview]);

  const handleExercisePress = (exerciseId: number, exerciseName: string) => {
    navigation.navigate('ExerciseDetail', {
      exerciseId,
      exerciseName,
    });
  };

  const handleCustomExercisePress = (exercise: UserExerciseResponse) => {
    navigation.navigate('CustomExerciseDetail', {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    });
  };

  const handleHistoryPress = (history: ExerciseHistoryResponse) => {
    if (history.exercise_id) {
      navigation.navigate('ExerciseDetail', {
        exerciseId: history.exercise_id,
        exerciseName: history.exercise_name,
      });
    }
  };

  const handleUnsavePress = async (exerciseId: number) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await unsaveExercise(exerciseId);
            } catch (error) {
              console.error('Failed to unsave:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteCustom = async (exerciseId: number) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this custom exercise? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomExercise(exerciseId);
            } catch (error) {
              console.error('Failed to delete:', error);
            }
          },
        },
      ]
    );
  };

  const handleCreateCustom = () => {
    navigation.navigate('CreateExercise');
  };

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutSession');
  };

  const handleBrowseExercises = () => {
    navigation.navigate('Discover');
  };

  const renderTab = (tab: TabType, label: string, count: number) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.tabActive]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
      <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
        <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSavedExercises = () => {
    if (savedExercises.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={48} color={theme.colors.steelDark} />
          </View>
          <Text style={styles.emptyTitle}>NO SAVED EXERCISES</Text>
          <Text style={styles.emptyText}>
            Browse the Discover section to find and save exercises to your personal library
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleBrowseExercises}>
            <LinearGradient
              colors={theme.gradients.buttonPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="compass-outline" size={20} color={theme.colors.black} />
              <Text style={styles.emptyButtonText}>BROWSE EXERCISES</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={savedExercises}
        keyExtractor={(item) => String(item.exercise.id)}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item.exercise}
            onPress={() => handleExercisePress(item.exercise.id, item.exercise.name)}
            onSavePress={() => handleUnsavePress(item.exercise.id)}
            isSaved={true}
            variant="compact"
          />
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    );
  };

  const renderCustomExercises = () => {
    return (
      <View>
        {/* Create Custom Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateCustom}>
          <View style={styles.createIcon}>
            <Ionicons name="add" size={24} color={theme.colors.techBlue} />
          </View>
          <View style={styles.createContent}>
            <Text style={styles.createTitle}>CREATE CUSTOM EXERCISE</Text>
            <Text style={styles.createSubtitle}>Add your own exercise to the library</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.steelDark} />
        </TouchableOpacity>

        {customExercises.length === 0 ? (
          <View style={styles.emptyStateSmall}>
            <Text style={styles.emptyTextSmall}>
              You haven't created any custom exercises yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={customExercises}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.customCard}
                onPress={() => handleCustomExercisePress(item)}
                activeOpacity={0.8}
              >
                <View style={styles.customThumb}>
                  <Ionicons name="barbell-outline" size={24} color={theme.colors.techBlue} />
                </View>
                <View style={styles.customContent}>
                  <Text style={styles.customTitle} numberOfLines={1}>
                    {item.name.toUpperCase()}
                  </Text>
                  <Text style={styles.customMeta}>
                    {item.muscle_group.replace(/_/g, ' ').toUpperCase()} • {item.equipment.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.customDelete}
                  onPress={() => handleDeleteCustom(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.techRed} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.steelDark} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  const renderHistory = () => {
    if (recentHistory.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={48} color={theme.colors.steelDark} />
          </View>
          <Text style={styles.emptyTitle}>NO WORKOUT HISTORY</Text>
          <Text style={styles.emptyText}>
            Start a workout to track your exercise history and see your progress
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleStartWorkout}>
            <LinearGradient
              colors={theme.gradients.buttonSecondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="play" size={20} color={theme.colors.black} />
              <Text style={styles.emptyButtonText}>START WORKOUT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={recentHistory}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.historyCard}
            onPress={() => handleHistoryPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.historyLeft}>
              <View style={styles.historyIcon}>
                <Ionicons name="fitness" size={20} color={theme.colors.techBlue} />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {item.exercise_name.toUpperCase()}
                </Text>
                <Text style={styles.historyMeta}>
                  {item.sets_completed} sets • {item.total_reps} reps
                  {item.max_weight && ` • ${item.max_weight}kg max`}
                </Text>
              </View>
            </View>
            <View style={styles.historyRight}>
              {(item.is_pr_weight || item.is_pr_volume) && (
                <View style={styles.prBadge}>
                  <Ionicons name="trophy" size={12} color={theme.colors.black} />
                  <Text style={styles.prText}>PR</Text>
                </View>
              )}
              <Text style={styles.historyDate}>
                {new Date(item.performed_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'saved':
        return renderSavedExercises();
      case 'custom':
        return renderCustomExercises();
      case 'history':
        return renderHistory();
      default:
        return null;
    }
  };

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
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>TRAIN</Text>
            <Text style={styles.subtitle}>YOUR EXERCISE LIBRARY</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={handleStartWorkout}>
              <LinearGradient
                colors={theme.gradients.techBlue}
                style={styles.quickActionGradient}
              >
                <Ionicons name="play" size={24} color={theme.colors.white} />
                <Text style={styles.quickActionText}>START WORKOUT</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={handleBrowseExercises}>
              <View style={styles.quickActionSecondary}>
                <Ionicons name="compass-outline" size={24} color={theme.colors.techBlue} />
                <Text style={styles.quickActionTextSecondary}>DISCOVER</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Summary */}
          {trainOverview && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{trainOverview.total_saved}</Text>
                <Text style={styles.statLabel}>SAVED</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{trainOverview.total_custom}</Text>
                <Text style={styles.statLabel}>CUSTOM</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{recentHistory.length}</Text>
                <Text style={styles.statLabel}>RECENT</Text>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabs}>
            {renderTab('saved', 'SAVED', savedExercises.length)}
            {renderTab('custom', 'CUSTOM', customExercises.length)}
            {renderTab('history', 'HISTORY', recentHistory.length)}
          </View>

          {/* Loading State */}
          {trainLoading && !refreshing && (
            <ActivityIndicator color={theme.colors.techBlue} style={styles.loader} />
          )}

          {/* Error State */}
          {trainError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={32} color={theme.colors.techRed} />
              <Text style={styles.errorText}>{trainError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTrainOverview}>
                <Text style={styles.retryText}>RETRY</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          {!trainLoading && !trainError && renderContent()}
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
    paddingBottom: theme.spacing['4xl'],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techGreen,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickAction: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  quickActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    borderRadius: theme.borderRadius.md,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  quickActionTextSecondary: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  tabActive: {
    backgroundColor: theme.colors.techBlue,
  },
  tabText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: theme.colors.black,
  },
  tabBadge: {
    backgroundColor: theme.colors.iron,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: theme.colors.concreteDark,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.steelDark,
  },
  tabBadgeTextActive: {
    color: theme.colors.white,
  },

  // List
  listContent: {
    paddingBottom: theme.spacing.md,
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingVertical: theme.spacing['3xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.concrete,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  emptyButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 1,
  },
  emptyStateSmall: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTextSmall: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    textAlign: 'center',
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.techBlue + '40',
    borderStyle: 'dashed',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.techBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  createContent: {
    flex: 1,
  },
  createTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  createSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
    marginTop: 2,
  },

  // Custom Card
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  customThumb: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  customContent: {
    flex: 1,
  },
  customTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  customMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
    marginTop: 2,
  },
  customDelete: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },

  // History Card
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.techBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  historyMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.techOrange,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  prText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.5,
  },

  // Loading & Error
  loader: {
    marginVertical: theme.spacing.xl,
  },
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techRed,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
  },
  retryText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },
});
