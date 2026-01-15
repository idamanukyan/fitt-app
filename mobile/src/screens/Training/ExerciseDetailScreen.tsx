/**
 * ExerciseDetailScreen - Full exercise details with tabs
 * Modern fitness app design with glass cards, GIF support, and muscle map
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../../design/tokens';
import { Exercise } from '../../types/exercise';
import { getExerciseById } from '../../services/exerciseService';
import { TabSelector } from '../../components/training/TabSelector';
import { GIFPlayer } from '../../components/training/GIFPlayer';
import { MuscleMapVisual } from '../../components/training/MuscleMapVisual';
import { ExerciseQuickStats, AITrackingInfo } from '../../components/training/QuickStatsRow';
import { GlassCard } from '../../components/ui/GlassCard';
import { DifficultyBadge, TypeBadge } from '../../components/ui/BadgePill';
import { AddToWorkoutModal } from '../../components/training/AddToWorkoutModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { id: 'steps', label: 'Steps' },
  { id: 'tips', label: 'Tips' },
  { id: 'mistakes', label: 'Mistakes' },
];

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.id as string;

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('steps');
  const [showAddToWorkout, setShowAddToWorkout] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    setIsLoading(true);
    try {
      const data = await getExerciseById(exerciseId);
      setExercise(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to load exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAIWorkout = () => {
    if (exercise) {
      router.push({
        pathname: '/workout/ai-session',
        params: {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
        },
      });
    }
  };

  const handleAddToWorkouts = () => {
    setShowAddToWorkout(true);
  };

  const handleAddToWorkoutConfirm = (workoutId: string | number) => {
    // The AddToWorkoutModal now handles adding the exercise to the workout
    // via the training store, so this callback just needs to close the modal
    setShowAddToWorkout(false);
  };

  const handleCreateNewWorkout = () => {
    if (exercise) {
      router.push({
        pathname: '/workout/session',
        params: {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          mode: 'new',
        },
      });
    }
  };

  const handleStartQuickWorkout = () => {
    if (exercise) {
      router.push({
        pathname: '/workout/session',
        params: {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          mode: 'quick',
        },
      });
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading exercise...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>Exercise not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'steps':
        return (
          <View style={styles.tabContent}>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{instruction}</Text>
              </View>
            ))}
          </View>
        );
      case 'tips':
        return (
          <View style={styles.tabContent}>
            {exercise.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        );
      case 'mistakes':
        return (
          <View style={styles.tabContent}>
            {exercise.mistakes.map((mistake, index) => (
              <View key={index} style={styles.mistakeItem}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.mistakeText}>{mistake}</Text>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { opacity: headerOpacity, paddingTop: insets.top },
        ]}
      >
        <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.stickyTitle} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Back Button (visible at top) */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <View style={styles.backButtonBg}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Media (GIF/Video/Image) */}
        <Animated.View style={[styles.heroContainer, { opacity: fadeAnim }]}>
          <GIFPlayer
            gifUrl={exercise.gifUrl}
            thumbnailUrl={exercise.thumbnailUrl}
            exerciseName={exercise.name}
            height={280}
            autoPlay={true}
            showControls={true}
            showFullscreenButton={true}
          />

          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.aiBadgeGradient}
            >
              <Ionicons name="sparkles" size={14} color={colors.textInverse} />
              <Text style={styles.aiBadgeText}>AI Coach Ready</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            {exercise.difficulty && (
              <DifficultyBadge difficulty={exercise.difficulty} size="md" />
            )}
            {exercise.isCompound && (
              <TypeBadge type="Compound" size="md" />
            )}
            {exercise.caloriesPerMinute && (
              <View style={styles.calorieBadge}>
                <Ionicons name="flame" size={12} color={colors.accent.orange} />
                <Text style={styles.calorieText}>
                  ~{exercise.caloriesPerMinute} cal/min
                </Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <ExerciseQuickStats
            caloriesPerMinute={exercise.caloriesPerMinute}
            difficulty={exercise.difficulty}
            suggestedSets="3-4"
            suggestedReps="8-12"
            restTime="60-90s"
            style={styles.quickStats}
          />

          {/* AI Tracking Info */}
          <AITrackingInfo
            isAISupported={true}
            trackingType="form_analysis"
            style={styles.aiInfo}
          />

          {/* Target Muscles with Visual */}
          <GlassCard variant="subtle" style={styles.muscleSection}>
            <Text style={styles.sectionTitle}>Target Muscles</Text>
            <MuscleMapVisual
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              size="md"
              showLabels={true}
            />
          </GlassCard>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <View style={styles.equipmentRow}>
              {exercise.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentChip}>
                  <Ionicons name="fitness" size={14} color={colors.secondary} />
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tabs */}
          <TabSelector
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {renderTabContent()}
        </View>
      </Animated.ScrollView>

      {/* Bottom CTAs */}
      <View
        style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleAddToWorkouts}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Add to Workouts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartAIWorkout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Ionicons name="sparkles" size={20} color={colors.textInverse} />
            <Text style={styles.primaryButtonText}>Start AI Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add to Workout Modal */}
      <AddToWorkoutModal
        visible={showAddToWorkout}
        onClose={() => setShowAddToWorkout(false)}
        exerciseId={exerciseId}
        exerciseName={exercise.name}
        onAddToWorkout={handleAddToWorkoutConfirm}
        onCreateNewWorkout={handleCreateNewWorkout}
        onStartQuickWorkout={handleStartQuickWorkout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.size.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  backLink: {
    fontSize: typography.size.base,
    color: colors.primary,
    marginTop: spacing.lg,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  aiBadge: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  aiBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  aiBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  content: {
    padding: spacing.xl,
  },
  exerciseName: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.orangeGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  calorieText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.accent.orange,
  },
  quickStats: {
    marginBottom: spacing.lg,
  },
  aiInfo: {
    marginBottom: spacing.xl,
  },
  muscleSection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  equipmentText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  tabContent: {
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.successBg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  tipText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  mistakeText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(15,15,35,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
  },
  secondaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  primaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});
