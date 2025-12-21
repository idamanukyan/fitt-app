/**
 * ExerciseDetailModal - Full Exercise Details with GIF Preview
 * Includes instructions, muscles, and AI coaching options
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../design/tokens';
import type { ExerciseDetail } from '../../types/training.types';
import { DifficultyLevel } from '../../types/workout.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive video height based on screen size (16:9 aspect ratio capped)
const VIDEO_ASPECT_RATIO = 4 / 3;
const VIDEO_HEIGHT = Math.min(SCREEN_WIDTH * VIDEO_ASPECT_RATIO * 0.65, SCREEN_HEIGHT * 0.45);

interface ExerciseDetailModalProps {
  visible: boolean;
  exercise: ExerciseDetail | null;
  onClose: () => void;
  onStartAIWorkout: (exercise: ExerciseDetail) => void;
  onAddToWorkouts: (exercise: ExerciseDetail) => void;
}

const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case DifficultyLevel.BEGINNER:
      return colors.success;
    case DifficultyLevel.INTERMEDIATE:
      return colors.warning;
    case DifficultyLevel.ADVANCED:
      return colors.accent.orange;
    case DifficultyLevel.EXPERT:
      return colors.error;
    default:
      return colors.textMuted;
  }
};

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  visible,
  exercise,
  onClose,
  onStartAIWorkout,
  onAddToWorkouts,
}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);
  const [activeSection, setActiveSection] = useState<'instructions' | 'tips' | 'mistakes'>('instructions');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(false);

  if (!exercise) return null;

  // Check if media is a video/GIF (mp4, webm, gif)
  // Priority: gifUrl > videoUrl > thumbnailUrl (if it's a video)
  const isVideoMedia = exercise.gifUrl || exercise.videoUrl ||
    exercise.thumbnailUrl?.match(/\.(mp4|webm|gif|mov)$/i);
  const mediaUrl = exercise.gifUrl || exercise.videoUrl || exercise.thumbnailUrl;

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsVideoLoading(false);
      setIsVideoPlaying(status.isPlaying);
    }
  };

  const togglePlayback = async () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const difficultyColor = getDifficultyColor(exercise.difficulty);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.background as unknown as string[]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Animated Header */}
        <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
          <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
          <View style={styles.stickyHeaderContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stickyTitle} numberOfLines={1}>
              {exercise.name}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </Animated.View>

        {/* Floating Close Button - OUTSIDE ScrollView for guaranteed tap response */}
        <View style={[styles.floatingCloseContainer, { top: insets.top + spacing.md }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButtonFloat}
            activeOpacity={0.7}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <View style={styles.closeButtonBg}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* GIF/Video Preview - Responsive & Aesthetic */}
          <TouchableOpacity
            style={[styles.mediaContainer, { height: VIDEO_HEIGHT }]}
            activeOpacity={0.95}
            onPress={isVideoMedia ? togglePlayback : undefined}
            onPressIn={() => setShowPlayButton(true)}
            onPressOut={() => setTimeout(() => setShowPlayButton(false), 1500)}
          >
            {isVideoMedia ? (
              <>
                <Video
                  ref={videoRef}
                  source={{ uri: mediaUrl }}
                  style={[styles.mediaVideo, { height: VIDEO_HEIGHT }]}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={true}
                  isLooping={true}
                  isMuted={true}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                  posterSource={{ uri: exercise.thumbnailUrl }}
                  usePoster={isVideoLoading}
                />
                {/* Grayscale/Muted aesthetic overlay */}
                <View style={styles.aestheticOverlay} pointerEvents="none" />
                {/* Subtle vignette for premium look */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(0,0,0,0.4)']}
                  locations={[0, 0.2, 0.8, 1]}
                  style={styles.vignetteOverlay}
                  pointerEvents="none"
                />
                {/* Loading indicator with shimmer effect */}
                {isVideoLoading && (
                  <View style={styles.videoLoadingOverlay}>
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.textPrimary} />
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  </View>
                )}
                {/* Minimal play/pause indicator */}
                {(showPlayButton || !isVideoPlaying) && !isVideoLoading && (
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons
                        name={isVideoPlaying ? 'pause' : 'play'}
                        size={28}
                        color="rgba(255,255,255,0.95)"
                      />
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                <Image
                  source={{ uri: exercise.thumbnailUrl }}
                  style={[styles.mediaImage, { height: VIDEO_HEIGHT }]}
                  resizeMode="cover"
                />
                {/* Grayscale overlay for static images too */}
                <View style={styles.aestheticOverlay} pointerEvents="none" />
              </>
            )}
            {/* Bottom gradient fade */}
            <LinearGradient
              colors={['transparent', 'rgba(15,15,35,0.6)', colors.gradientStart]}
              locations={[0, 0.5, 1]}
              style={styles.mediaOverlay}
              pointerEvents="none"
            />

            {/* AI Badge */}
            <View style={styles.aiBadgeLarge}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.aiBadgeGradient}
              >
                <Ionicons name="sparkles" size={14} color={colors.textInverse} />
                <Text style={styles.aiBadgeText}>AI Coach Ready</Text>
              </LinearGradient>
            </View>

            {/* Minimal video indicator */}
            {isVideoMedia && !isVideoLoading && (
              <View style={styles.videoBadge}>
                <View style={[
                  styles.liveIndicator,
                  { backgroundColor: isVideoPlaying ? colors.success : colors.textMuted }
                ]} />
                <Text style={styles.videoBadgeText}>
                  {isVideoPlaying ? 'LIVE' : 'PAUSED'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Exercise Info */}
          <View style={styles.infoSection}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>

            <View style={styles.badgeRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
                <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                  {exercise.difficulty}
                </Text>
              </View>

              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{exercise.exerciseType}</Text>
              </View>

              {exercise.isCompound && (
                <View style={styles.compoundBadge}>
                  <Text style={styles.compoundText}>Compound</Text>
                </View>
              )}
            </View>

            {/* Target Muscles */}
            <View style={styles.muscleSection}>
              <Text style={styles.sectionTitle}>Target Muscles</Text>
              <View style={styles.muscleRow}>
                <View style={styles.primaryMuscle}>
                  <Ionicons name="radio-button-on" size={16} color={colors.primary} />
                  <Text style={styles.primaryMuscleText}>{exercise.primaryMuscle}</Text>
                </View>
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <View key={index} style={styles.secondaryMuscle}>
                    <Ionicons name="radio-button-off" size={14} color={colors.textMuted} />
                    <Text style={styles.secondaryMuscleText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Equipment */}
            <View style={styles.equipmentSection}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              <View style={styles.equipmentList}>
                {exercise.equipment.map((eq, index) => (
                  <View key={index} style={styles.equipmentChip}>
                    <Ionicons name="fitness" size={14} color={colors.secondary} />
                    <Text style={styles.equipmentText}>{eq.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tabs for Instructions/Tips/Mistakes */}
            <View style={styles.tabRow}>
              {(['instructions', 'tips', 'mistakes'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeSection === tab && styles.tabActive]}
                  onPress={() => setActiveSection(tab)}
                >
                  <Text style={[styles.tabText, activeSection === tab && styles.tabTextActive]}>
                    {tab === 'instructions' ? 'Steps' : tab === 'tips' ? 'Tips' : 'Mistakes'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeSection === 'instructions' && (
                <View style={styles.listContainer}>
                  {exercise.instructions.map((instruction, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.listText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeSection === 'tips' && (
                <View style={styles.listContainer}>
                  {exercise.formTips.map((tip, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      <Text style={styles.listText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {activeSection === 'mistakes' && (
                <View style={styles.listContainer}>
                  {exercise.commonMistakes.map((mistake, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="alert-circle" size={20} color={colors.error} />
                      <Text style={styles.listText}>{mistake}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* AI Keypoints Preview */}
            <View style={styles.aiSection}>
              <View style={styles.aiSectionHeader}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text style={styles.aiSectionTitle}>AI Tracking Points</Text>
              </View>
              <Text style={styles.aiSectionDesc}>
                The AI Coach will monitor {exercise.aiKeypoints.length} key body positions to ensure perfect form.
              </Text>
              <View style={styles.keypointList}>
                {exercise.aiKeypoints.slice(0, 3).map((kp, index) => (
                  <View key={index} style={styles.keypointItem}>
                    <View style={styles.keypointDot} />
                    <Text style={styles.keypointText}>{kp.joint}: {kp.description}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="flame" size={24} color={colors.accent.orange} />
                <Text style={styles.statValue}>~{exercise.estimatedCaloriesPerMinute}</Text>
                <Text style={styles.statLabel}>cal/min</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color={colors.secondary} />
                <Text style={styles.statValue}>{exercise.restBetweenSets}s</Text>
                <Text style={styles.statLabel}>rest time</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="body" size={24} color={colors.accent.blue} />
                <Text style={styles.statValue}>{exercise.secondaryMuscles.length + 1}</Text>
                <Text style={styles.statLabel}>muscles</Text>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        {/* Bottom Action Buttons */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onAddToWorkouts(exercise)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Add to Workouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onStartAIWorkout(exercise)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradients.buttonPrimary as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="sparkles" size={20} color={colors.textInverse} />
              <Text style={styles.primaryButtonText}>Start AI Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
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
  stickyTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingCloseContainer: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 999, // Above everything
    elevation: 999, // Android elevation
  },
  closeButtonFloat: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mediaContainer: {
    position: 'relative',
    backgroundColor: '#0a0a14', // Deep dark for premium feel
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    backgroundColor: '#0a0a14',
  },
  mediaVideo: {
    width: '100%',
    backgroundColor: '#0a0a14',
  },
  // Grayscale/desaturated overlay for muted aesthetic
  aestheticOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 30, 0.15)', // Slight cool tint
    // Mix blend mode not available in RN, so we use tint overlay
  },
  // Vignette effect for cinematic look
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,20,0.7)',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  videoBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  videoBadgeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.weight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  aiBadgeLarge: {
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
  infoSection: {
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
    marginBottom: spacing.xl,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    textTransform: 'capitalize',
  },
  typeBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  typeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.secondary,
    textTransform: 'capitalize',
  },
  compoundBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  compoundText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  muscleSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryMuscle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  primaryMuscleText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  secondaryMuscle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  secondaryMuscleText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  equipmentSection: {
    marginBottom: spacing.xl,
  },
  equipmentList: {
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
    textTransform: 'capitalize',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.primarySubtle,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.semiBold,
  },
  tabContent: {
    marginBottom: spacing.xl,
  },
  listContainer: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  listText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  aiSection: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aiSectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  aiSectionDesc: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  keypointList: {
    gap: spacing.sm,
  },
  keypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  keypointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  keypointText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
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

export default ExerciseDetailModal;
