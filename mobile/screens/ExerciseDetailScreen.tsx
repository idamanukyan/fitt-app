/**
 * ExerciseDetailScreen - Full Exercise Details
 *
 * Features:
 * - Gender-specific video/image display
 * - Full instructions, tips, common mistakes
 * - Save/unsave functionality
 * - Alternative exercises
 * - Add to workout action
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import theme from '../utils/theme';
import ExerciseCard from '../components/atoms/ExerciseCard';
import { useExerciseStore } from '../stores/exerciseStore';
import type {
  ExerciseDetailResponse,
  ExerciseSummary,
  ExerciseGender,
} from '../types/exercise.types';
import {
  formatMuscleGroup,
  formatEquipment,
  getDifficultyColor,
  getExerciseMedia,
} from '../types/exercise.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = 280;

type RouteParams = {
  ExerciseDetail: {
    exerciseId: number;
    exerciseName: string;
  };
};

export default function ExerciseDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ExerciseDetail'>>();
  const { exerciseId, exerciseName } = route.params || {};

  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState<'instructions' | 'tips' | 'alternatives'>('instructions');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [videoStatus, setVideoStatus] = useState<any>({});

  // Store state
  const {
    currentExercise,
    detailLoading,
    detailError,
    isExerciseSaved,
    preferredGender,
    fetchExerciseById,
    toggleSave,
    clearCurrentExercise,
  } = useExerciseStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (exerciseId) {
      fetchExerciseById(exerciseId);
    }

    return () => {
      clearCurrentExercise();
    };
  }, [exerciseId]);

  const handleSavePress = async () => {
    if (!exerciseId) return;
    try {
      await toggleSave(exerciseId);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleAddToWorkout = () => {
    navigation.navigate('AddToWorkout', {
      exerciseId,
      exerciseName: currentExercise?.name || exerciseName,
    });
  };

  const handleAlternativePress = (exercise: ExerciseSummary) => {
    navigation.push('ExerciseDetail', {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    });
  };

  const getMedia = useCallback(() => {
    if (!currentExercise) return { images: [], videos: [], thumbnail: null, gif: null };
    return getExerciseMedia(currentExercise, preferredGender);
  }, [currentExercise, preferredGender]);

  const media = getMedia();
  const allMedia = [...media.videos, ...media.images];
  const currentMediaIsVideo = mediaIndex < media.videos.length;
  const currentMediaUrl = allMedia[mediaIndex];

  const getDiffColor = (diff: string) => getDifficultyColor(diff as any);

  const renderMediaDots = () => {
    if (allMedia.length <= 1) return null;

    return (
      <View style={styles.mediaDots}>
        {allMedia.map((_, index) => (
          <View
            key={index}
            style={[
              styles.mediaDot,
              mediaIndex === index && styles.mediaDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderMedia = () => {
    if (!currentMediaUrl) {
      return (
        <View style={styles.mediaPlaceholder}>
          <LinearGradient
            colors={theme.gradients.techBlue}
            style={styles.mediaGradient}
          />
          <Ionicons name="fitness-outline" size={64} color={theme.colors.white} />
        </View>
      );
    }

    if (currentMediaIsVideo) {
      return (
        <Video
          source={{ uri: currentMediaUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
          onPlaybackStatusUpdate={setVideoStatus}
        />
      );
    }

    return (
      <Image
        source={{ uri: currentMediaUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    );
  };

  const renderTab = (tab: typeof activeTab, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.tabActive]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInstructions = () => {
    if (!currentExercise?.instructions?.length) {
      return <Text style={styles.noContent}>No instructions available</Text>;
    }

    return (
      <View style={styles.tabContent}>
        {currentExercise.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTips = () => {
    const tips = currentExercise?.tips || [];
    const mistakes = currentExercise?.common_mistakes || [];

    if (tips.length === 0 && mistakes.length === 0) {
      return <Text style={styles.noContent}>No tips available</Text>;
    }

    return (
      <View style={styles.tabContent}>
        {tips.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>TIPS</Text>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.techGreen} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {mistakes.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>COMMON MISTAKES</Text>
            {mistakes.map((mistake, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="close-circle" size={16} color={theme.colors.techRed} />
                <Text style={styles.tipText}>{mistake}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAlternatives = () => {
    const alternatives = currentExercise?.alternatives || [];

    if (alternatives.length === 0) {
      return <Text style={styles.noContent}>No alternatives available</Text>;
    }

    return (
      <View style={styles.tabContent}>
        {alternatives.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPress={() => handleAlternativePress(exercise)}
            variant="compact"
          />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'instructions':
        return renderInstructions();
      case 'tips':
        return renderTips();
      case 'alternatives':
        return renderAlternatives();
      default:
        return null;
    }
  };

  // Loading state
  if (detailLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>LOADING EXERCISE...</Text>
      </View>
    );
  }

  // Error state
  if (detailError) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient colors={theme.gradients.background} style={StyleSheet.absoluteFill} />
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.techRed} />
        <Text style={styles.errorTitle}>Failed to load exercise</Text>
        <Text style={styles.errorText}>{detailError}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => exerciseId && fetchExerciseById(exerciseId)}
        >
          <Text style={styles.errorButtonText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentExercise) return null;

  const isSaved = exerciseId ? isExerciseSaved(exerciseId) : false;
  const diffColor = getDiffColor(currentExercise.difficulty);

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePress}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? theme.colors.techBlue : theme.colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Media Section */}
          <View style={styles.mediaContainer}>
            {renderMedia()}
            {renderMediaDots()}

            {/* Media Navigation */}
            {allMedia.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.mediaNav, styles.mediaNavLeft]}
                  onPress={() => setMediaIndex((prev) => Math.max(0, prev - 1))}
                  disabled={mediaIndex === 0}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={mediaIndex === 0 ? theme.colors.steelDark : theme.colors.white}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mediaNav, styles.mediaNavRight]}
                  onPress={() => setMediaIndex((prev) => Math.min(allMedia.length - 1, prev + 1))}
                  disabled={mediaIndex === allMedia.length - 1}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={mediaIndex === allMedia.length - 1 ? theme.colors.steelDark : theme.colors.white}
                  />
                </TouchableOpacity>
              </>
            )}

            {/* Video indicator */}
            {currentMediaIsVideo && (
              <View style={styles.videoIndicator}>
                <Ionicons name="play" size={12} color={theme.colors.white} />
                <Text style={styles.videoIndicatorText}>VIDEO</Text>
              </View>
            )}
          </View>

          {/* Exercise Info */}
          <View style={styles.content}>
            <Text style={styles.title}>{currentExercise.name.toUpperCase()}</Text>

            {/* Badges */}
            <View style={styles.badges}>
              <View style={[styles.badge, { borderColor: theme.colors.techBlue }]}>
                <Text style={[styles.badgeText, { color: theme.colors.techBlue }]}>
                  {formatMuscleGroup(currentExercise.muscle_group as any)}
                </Text>
              </View>
              <View style={[styles.badge, { borderColor: theme.colors.steel }]}>
                <Ionicons name="barbell-outline" size={12} color={theme.colors.steel} />
                <Text style={[styles.badgeText, { color: theme.colors.steel }]}>
                  {formatEquipment(currentExercise.equipment as any)}
                </Text>
              </View>
              <View style={[styles.badge, { borderColor: diffColor }]}>
                <Text style={[styles.badgeText, { color: diffColor }]}>
                  {currentExercise.difficulty.toUpperCase()}
                </Text>
              </View>
              {currentExercise.is_compound && (
                <View style={[styles.badge, { borderColor: theme.colors.techCyan }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.techCyan }]}>
                    COMPOUND
                  </Text>
                </View>
              )}
              {currentExercise.is_rehab && (
                <View style={[styles.badge, { borderColor: theme.colors.techGreen }]}>
                  <Ionicons name="medkit" size={12} color={theme.colors.techGreen} />
                  <Text style={[styles.badgeText, { color: theme.colors.techGreen }]}>
                    REHAB
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {currentExercise.description && (
              <Text style={styles.description}>{currentExercise.description}</Text>
            )}

            {/* Secondary Muscles */}
            {currentExercise.secondary_muscles && currentExercise.secondary_muscles.length > 0 && (
              <View style={styles.secondaryMuscles}>
                <Text style={styles.secondaryLabel}>ALSO TARGETS:</Text>
                <Text style={styles.secondaryText}>
                  {currentExercise.secondary_muscles.map((m: string) => formatMuscleGroup(m as any)).join(', ')}
                </Text>
              </View>
            )}

            {/* Pain Warning */}
            {currentExercise.pain_warning && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color={theme.colors.techOrange} />
                <Text style={styles.warningText}>{currentExercise.pain_warning}</Text>
              </View>
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
              {renderTab('instructions', 'INSTRUCTIONS')}
              {renderTab('tips', 'TIPS')}
              {renderTab('alternatives', `ALT (${currentExercise.alternatives?.length || 0})`)}
            </View>

            {/* Tab Content */}
            {renderContent()}

            {/* Tracking Info */}
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingTitle}>TRACKING</Text>
              <View style={styles.trackingRow}>
                {currentExercise.tracks_weight && (
                  <View style={styles.trackingItem}>
                    <Ionicons name="barbell" size={16} color={theme.colors.techBlue} />
                    <Text style={styles.trackingText}>Weight</Text>
                  </View>
                )}
                {currentExercise.tracks_reps && (
                  <View style={styles.trackingItem}>
                    <Ionicons name="repeat" size={16} color={theme.colors.techBlue} />
                    <Text style={styles.trackingText}>Reps</Text>
                  </View>
                )}
                {currentExercise.tracks_time && (
                  <View style={styles.trackingItem}>
                    <Ionicons name="time" size={16} color={theme.colors.techBlue} />
                    <Text style={styles.trackingText}>Time</Text>
                  </View>
                )}
                {currentExercise.tracks_distance && (
                  <View style={styles.trackingItem}>
                    <Ionicons name="map" size={16} color={theme.colors.techBlue} />
                    <Text style={styles.trackingText}>Distance</Text>
                  </View>
                )}
              </View>
              <View style={styles.defaultsRow}>
                <Text style={styles.defaultsText}>
                  Default: {currentExercise.default_sets} sets x {currentExercise.default_reps} reps
                  {currentExercise.default_rest_seconds && ` • ${currentExercise.default_rest_seconds}s rest`}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToWorkout}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={theme.gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color={theme.colors.black} />
            <Text style={styles.addButtonText}>ADD TO WORKOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

  // Loading / Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.techBlue,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  errorButton: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
  },
  errorButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Media
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: MEDIA_HEIGHT,
    backgroundColor: theme.colors.concreteDark,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaDots: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  mediaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mediaDotActive: {
    backgroundColor: theme.colors.white,
  },
  mediaNav: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaNavLeft: {
    left: theme.spacing.md,
  },
  mediaNavRight: {
    right: theme.spacing.md,
  },
  videoIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  videoIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },

  // Content
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    backgroundColor: theme.colors.concreteDark,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steel,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  secondaryMuscles: {
    marginBottom: theme.spacing.md,
  },
  secondaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 1,
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techCyan,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.techOrange + '15',
    borderWidth: 1,
    borderColor: theme.colors.techOrange + '40',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techOrange,
    lineHeight: 20,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabActive: {
    backgroundColor: theme.colors.techBlue,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: theme.colors.black,
  },
  tabContent: {
    marginBottom: theme.spacing.lg,
  },
  noContent: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },

  // Instructions
  instructionItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.techBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  instructionNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.black,
  },
  instructionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    lineHeight: 22,
  },

  // Tips
  tipsSection: {
    marginBottom: theme.spacing.lg,
  },
  tipsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steel,
    lineHeight: 20,
  },

  // Tracking Info
  trackingInfo: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  trackingTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.steelDark,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  trackingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  defaultsRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  defaultsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
  },

  // Bottom Action
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.black,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  addButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 2,
  },
});
