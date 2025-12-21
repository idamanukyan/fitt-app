/**
 * AIExerciseSessionScreen - Single exercise AI-coached workout session
 * Real-time form feedback, rep counting, and scoring
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../../design/tokens';
import { Exercise } from '../../types/exercise';
import { getExerciseById } from '../../services/exerciseService';

interface SetData {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  score: number;
  duration: number;
}

export default function AIExerciseSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  const exerciseName = params.exerciseName as string;

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  // State
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets, setTotalSets] = useState(3);
  const [currentReps, setCurrentReps] = useState(0);
  const [targetReps, setTargetReps] = useState(12);
  const [weight, setWeight] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSetTime, setCurrentSetTime] = useState(0);
  const [completedSets, setCompletedSets] = useState<SetData[]>([]);
  const [aiFormScore, setAiFormScore] = useState(100);
  const [aiFeedback, setAiFeedback] = useState('Ready to start your workout');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Timer refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load exercise on mount
  useEffect(() => {
    loadExercise();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  // Pulse animation for active state
  useEffect(() => {
    if (isActive && !isPaused && !isResting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, isPaused, isResting]);

  const loadExercise = async () => {
    try {
      const data = await getExerciseById(exerciseId);
      setExercise(data);
    } catch (error) {
      console.error('Failed to load exercise:', error);
    }
  };

  const startWorkout = () => {
    setIsActive(true);
    setIsPaused(false);
    setAiFeedback('Great! Focus on your form. I\'ll track your reps.');

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      setCurrentSetTime((prev) => prev + 1);
    }, 1000);

    // Simulate AI form feedback
    simulateAIFeedback();
  };

  const pauseWorkout = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeWorkout = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      setCurrentSetTime((prev) => prev + 1);
    }, 1000);
    simulateAIFeedback();
  };

  const simulateAIFeedback = () => {
    const feedbackMessages = [
      { message: 'Good form! Keep your back straight.', score: 95 },
      { message: 'Excellent tempo! Controlled movements.', score: 100 },
      { message: 'Watch your elbow position on the descent.', score: 85 },
      { message: 'Perfect! Full range of motion achieved.', score: 100 },
      { message: 'Slow down slightly for better control.', score: 90 },
      { message: 'Great job! Maintaining proper alignment.', score: 98 },
    ];

    const interval = setInterval(() => {
      if (!isPaused && isActive && !isResting) {
        const feedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
        setAiFeedback(feedback.message);
        setAiFormScore(feedback.score);
      }
    }, 4000);

    return () => clearInterval(interval);
  };

  const incrementReps = () => {
    if (isActive && !isPaused && !isResting) {
      const newReps = currentReps + 1;
      setCurrentReps(newReps);
      Vibration.vibrate(50);

      if (newReps >= targetReps) {
        completeSet();
      }
    }
  };

  const completeSet = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const setData: SetData = {
      setNumber: currentSet,
      reps: currentReps,
      weight,
      completed: true,
      score: aiFormScore,
      duration: currentSetTime,
    };

    setCompletedSets((prev) => [...prev, setData]);
    Vibration.vibrate([0, 100, 50, 100]);

    // Animate score
    Animated.spring(scoreAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (currentSet < totalSets) {
      // Start rest period
      setIsResting(true);
      setAiFeedback(`Set ${currentSet} complete! Rest for ${restTime} seconds.`);

      restTimerRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            if (restTimerRef.current) {
              clearInterval(restTimerRef.current);
              restTimerRef.current = null;
            }
            setIsResting(false);
            setCurrentSet((s) => s + 1);
            setCurrentReps(0);
            setCurrentSetTime(0);
            setRestTime(60);
            setAiFeedback('Ready for next set. Let\'s go!');

            // Restart main timer
            timerRef.current = setInterval(() => {
              setElapsedTime((prev) => prev + 1);
              setCurrentSetTime((prev) => prev + 1);
            }, 1000);

            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Workout complete
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);

    const avgScore = completedSets.length > 0
      ? Math.round(completedSets.reduce((acc, s) => acc + s.score, 0) / completedSets.length)
      : aiFormScore;

    const totalReps = completedSets.reduce((acc, s) => acc + s.reps, 0) + currentReps;

    Alert.alert(
      'Workout Complete!',
      `Great job!\n\nTotal Sets: ${completedSets.length + (currentReps > 0 ? 1 : 0)}\nTotal Reps: ${totalReps}\nAverage Form Score: ${avgScore}%\nDuration: ${formatTime(elapsedTime)}`,
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setShowQuitModal(false);
    router.back();
  };

  const cancelQuit = () => {
    setShowQuitModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.error;
  };

  const adjustWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, prev + delta));
  };

  const adjustTargetReps = (delta: number) => {
    setTargetReps((prev) => Math.max(1, prev + delta));
  };

  const adjustTotalSets = (delta: number) => {
    setTotalSets((prev) => Math.max(1, prev + delta));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          onPress={handleQuit}
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.exerciseTitle} numberOfLines={1}>
            {exerciseName || exercise?.name || 'Exercise'}
          </Text>
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
        </View>

        <View style={styles.setIndicator}>
          <Text style={styles.setIndicatorText}>
            {currentSet}/{totalSets}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* AI Feedback Card */}
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.aiBadgeText}>AI Coach</Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(aiFormScore)}20` }]}>
              <Text style={[styles.scoreText, { color: getScoreColor(aiFormScore) }]}>
                {aiFormScore}%
              </Text>
            </View>
          </View>
          <Text style={styles.feedbackText}>{aiFeedback}</Text>
        </View>

        {/* Rep Counter */}
        <Animated.View style={[styles.repContainer, { transform: [{ scale: pulseAnim }] }]}>
          {isResting ? (
            <>
              <Text style={styles.restLabel}>REST</Text>
              <Text style={styles.restTimer}>{restTime}s</Text>
            </>
          ) : (
            <>
              <Text style={styles.repLabel}>REPS</Text>
              <Text style={styles.repCount}>{currentReps}</Text>
              <Text style={styles.repTarget}>of {targetReps}</Text>
            </>
          )}
        </Animated.View>

        {/* Controls Grid - Only show when not active */}
        {!isActive && (
          <View style={styles.controlsGrid}>
            {/* Weight Control */}
            <View style={styles.controlCard}>
              <Text style={styles.controlLabel}>Weight (kg)</Text>
              <View style={styles.controlRow}>
                <TouchableOpacity
                  onPress={() => adjustWeight(-2.5)}
                  style={styles.controlButton}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.controlValue}>{weight}</Text>
                <TouchableOpacity
                  onPress={() => adjustWeight(2.5)}
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Target Reps Control */}
            <View style={styles.controlCard}>
              <Text style={styles.controlLabel}>Target Reps</Text>
              <View style={styles.controlRow}>
                <TouchableOpacity
                  onPress={() => adjustTargetReps(-1)}
                  style={styles.controlButton}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.controlValue}>{targetReps}</Text>
                <TouchableOpacity
                  onPress={() => adjustTargetReps(1)}
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Sets Control */}
            <View style={styles.controlCard}>
              <Text style={styles.controlLabel}>Total Sets</Text>
              <View style={styles.controlRow}>
                <TouchableOpacity
                  onPress={() => adjustTotalSets(-1)}
                  style={styles.controlButton}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.controlValue}>{totalSets}</Text>
                <TouchableOpacity
                  onPress={() => adjustTotalSets(1)}
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Completed Sets */}
        {completedSets.length > 0 && (
          <View style={styles.completedSetsCard}>
            <Text style={styles.completedSetsTitle}>Completed Sets</Text>
            {completedSets.map((set, index) => (
              <View key={index} style={styles.completedSetRow}>
                <Text style={styles.completedSetNum}>Set {set.setNumber}</Text>
                <Text style={styles.completedSetStats}>
                  {set.reps} reps @ {set.weight}kg
                </Text>
                <Text style={[styles.completedSetScore, { color: getScoreColor(set.score) }]}>
                  {set.score}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}>
        {!isActive ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startWorkout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.startButtonGradient}
            >
              <Ionicons name="play" size={24} color={colors.textInverse} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isResting ? (
          <TouchableOpacity
            style={styles.skipRestButton}
            onPress={() => {
              if (restTimerRef.current) {
                clearInterval(restTimerRef.current);
                restTimerRef.current = null;
              }
              setIsResting(false);
              setCurrentSet((s) => s + 1);
              setCurrentReps(0);
              setCurrentSetTime(0);
              setRestTime(60);
              setAiFeedback('Ready for next set. Let\'s go!');

              timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
                setCurrentSetTime((prev) => prev + 1);
              }, 1000);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.skipRestButtonText}>Skip Rest</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={styles.repButton}
              onPress={incrementReps}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.repButtonGradient}
              >
                <Ionicons name="add" size={32} color={colors.textInverse} />
                <Text style={styles.repButtonText}>TAP FOR REP</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.activeButtonsRow}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={isPaused ? resumeWorkout : pauseWorkout}
              >
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.completeSetButton}
                onPress={completeSet}
              >
                <Text style={styles.completeSetText}>Complete Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Quit Confirmation Modal */}
      <Modal
        visible={showQuitModal}
        transparent
        animationType="fade"
        onRequestClose={cancelQuit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={cancelQuit}
            />
          </View>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="warning" size={32} color={colors.warning} />
            </View>
            <Text style={styles.modalTitle}>End Workout?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to end this workout session? Your progress will be lost.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelQuit}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Keep Going</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmQuit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.error, '#CC0000']}
                  style={styles.modalConfirmGradient}
                >
                  <Text style={styles.modalConfirmText}>End Workout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  exerciseTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  timer: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  setIndicator: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  setIndicatorText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  feedbackCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  aiBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  scoreText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  feedbackText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  repContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  repLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  repCount: {
    fontSize: 96,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  repTarget: {
    fontSize: typography.size.lg,
    color: colors.textMuted,
  },
  restLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.secondary,
    letterSpacing: 2,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  controlCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  controlButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
  },
  controlValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
  completedSetsCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  completedSetsTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  completedSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  completedSetNum: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    width: 50,
  },
  completedSetStats: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  completedSetScore: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  bottomActions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: 'rgba(15,15,35,0.95)',
  },
  startButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  startButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  skipRestButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  skipRestButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.secondary,
  },
  activeControls: {
    gap: spacing.md,
  },
  repButton: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.button,
  },
  repButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  repButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  activeButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pauseButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
  },
  completeSetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  completeSetText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.success,
  },

  // Quit Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: colors.gradientStart,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.warning}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});
