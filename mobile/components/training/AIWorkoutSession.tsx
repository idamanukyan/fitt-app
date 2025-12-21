/**
 * AIWorkoutSession - Real-Time AI-Coached Workout Screen
 * Camera preview with skeleton overlay, rep counting, and form feedback
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../design/tokens';
import type { ExerciseDetail } from '../../types/training.types';
import type {
  AIWorkoutSession as AIWorkoutSessionType,
  AISetData,
  SetScore,
  FormAnalysis,
  AICoachFeedback,
} from '../../types/training.types';
import { AI_COACH_TIPS } from '../../utils/aiCoach';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AIWorkoutSessionProps {
  visible: boolean;
  exercise: ExerciseDetail;
  onClose: () => void;
  onComplete: (sessionData: AIWorkoutSessionType) => void;
}

// Simulated pose data for demonstration
interface SimulatedPose {
  keypoints: { x: number; y: number; visible: boolean }[];
}

export const AIWorkoutSession: React.FC<AIWorkoutSessionProps> = ({
  visible,
  exercise,
  onClose,
  onComplete,
}) => {
  const insets = useSafeAreaInsets();
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const repCountAnimation = useRef(new Animated.Value(1)).current;

  // Session state
  const [sessionState, setSessionState] = useState<'preparing' | 'active' | 'rest' | 'complete'>('preparing');
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState(0);
  const [targetReps] = useState(10);
  const [targetSets] = useState(3);

  // Timer state
  const [restTimeRemaining, setRestTimeRemaining] = useState(exercise.restBetweenSets);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  // AI feedback state
  const [currentFeedback, setCurrentFeedback] = useState<AICoachFeedback | null>(null);
  const [formScore, setFormScore] = useState(100);
  const [isFormCorrect, setIsFormCorrect] = useState(true);

  // Set data collection
  const [setData, setSetData] = useState<AISetData[]>([]);
  const [currentSetScore, setCurrentSetScore] = useState<SetScore>({
    overall: 0,
    formScore: 100,
    romScore: 100,
    tempoScore: 100,
    symmetryScore: 100,
    reps: 0,
    validReps: 0,
  });

  // Countdown state
  const [countdown, setCountdown] = useState(5);

  // Simulated pose for visualization
  const [simulatedPose, setSimulatedPose] = useState<SimulatedPose | null>(null);

  // Countdown timer before starting
  useEffect(() => {
    if (sessionState === 'preparing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && sessionState === 'preparing') {
      setSessionState('active');
    }
  }, [countdown, sessionState]);

  // Workout duration timer
  useEffect(() => {
    if (sessionState === 'active') {
      const timer = setInterval(() => {
        setWorkoutDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionState]);

  // Rest timer
  useEffect(() => {
    if (sessionState === 'rest' && restTimeRemaining > 0) {
      const timer = setTimeout(() => setRestTimeRemaining(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sessionState === 'rest' && restTimeRemaining === 0) {
      // Start next set
      if (currentSet < targetSets) {
        setCurrentSet(s => s + 1);
        setCurrentReps(0);
        setRestTimeRemaining(exercise.restBetweenSets);
        setSessionState('active');
      } else {
        setSessionState('complete');
      }
    }
  }, [sessionState, restTimeRemaining, currentSet, targetSets, exercise.restBetweenSets]);

  // Simulated pose updates (in production, this would come from MediaPipe/TensorFlow.js)
  useEffect(() => {
    if (sessionState === 'active') {
      const interval = setInterval(() => {
        // Simulate pose detection with random slight movements
        const basePose = generateBasePose();
        setSimulatedPose(basePose);

        // Randomly trigger rep counts for demo
        if (Math.random() > 0.95 && currentReps < targetReps) {
          handleRepCompleted();
        }

        // Randomly show form feedback
        if (Math.random() > 0.98) {
          showFormFeedback();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [sessionState, currentReps, targetReps]);

  const generateBasePose = (): SimulatedPose => {
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2 - 50;
    const jitter = () => (Math.random() - 0.5) * 10;

    return {
      keypoints: [
        // Head
        { x: centerX + jitter(), y: centerY - 150 + jitter(), visible: true },
        // Shoulders
        { x: centerX - 60 + jitter(), y: centerY - 100 + jitter(), visible: true },
        { x: centerX + 60 + jitter(), y: centerY - 100 + jitter(), visible: true },
        // Elbows
        { x: centerX - 80 + jitter(), y: centerY - 20 + jitter(), visible: true },
        { x: centerX + 80 + jitter(), y: centerY - 20 + jitter(), visible: true },
        // Wrists
        { x: centerX - 90 + jitter(), y: centerY + 60 + jitter(), visible: true },
        { x: centerX + 90 + jitter(), y: centerY + 60 + jitter(), visible: true },
        // Hips
        { x: centerX - 40 + jitter(), y: centerY + 50 + jitter(), visible: true },
        { x: centerX + 40 + jitter(), y: centerY + 50 + jitter(), visible: true },
        // Knees
        { x: centerX - 45 + jitter(), y: centerY + 150 + jitter(), visible: true },
        { x: centerX + 45 + jitter(), y: centerY + 150 + jitter(), visible: true },
        // Ankles
        { x: centerX - 50 + jitter(), y: centerY + 250 + jitter(), visible: true },
        { x: centerX + 50 + jitter(), y: centerY + 250 + jitter(), visible: true },
      ],
    };
  };

  const handleRepCompleted = () => {
    const newReps = currentReps + 1;
    setCurrentReps(newReps);

    // Animate rep counter
    Animated.sequence([
      Animated.timing(repCountAnimation, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(repCountAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show encouragement
    if (newReps === targetReps) {
      showFeedback('Set complete! Great work!', 'celebration');

      // Save set data
      const newSetData: AISetData = {
        setNumber: currentSet,
        reps: newReps,
        validReps: newReps,
        score: currentSetScore,
        formIssues: [],
        duration: workoutDuration,
        restTime: exercise.restBetweenSets,
        startTime: Date.now() - workoutDuration * 1000,
        endTime: Date.now(),
      };
      setSetData(prev => [...prev, newSetData]);

      // Move to rest or complete
      if (currentSet < targetSets) {
        setTimeout(() => setSessionState('rest'), 1500);
      } else {
        setTimeout(() => setSessionState('complete'), 1500);
      }
    } else if (newReps % 3 === 0) {
      showFeedback('Keep it up! Perfect form!', 'encouragement');
    }
  };

  const showFormFeedback = () => {
    const isGood = Math.random() > 0.3;
    setIsFormCorrect(isGood);
    setFormScore(isGood ? 95 + Math.floor(Math.random() * 5) : 70 + Math.floor(Math.random() * 15));

    if (!isGood) {
      showFeedback('Keep your back straight!', 'correction');
    }
  };

  const showFeedback = (message: string, type: AICoachFeedback['type']) => {
    setCurrentFeedback({
      message,
      type,
      priority: 1,
      timestamp: Date.now(),
    });

    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(feedbackAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setCurrentFeedback(null));
  };

  const handleClose = () => {
    Alert.alert(
      'End Workout?',
      'Are you sure you want to end this workout early?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => onClose(),
        },
      ]
    );
  };

  const handleComplete = () => {
    const session: AIWorkoutSessionType = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      startTime: Date.now() - workoutDuration * 1000,
      endTime: Date.now(),
      sets: setData,
      currentSet,
      isActive: false,
      totalScore: setData.reduce((sum, s) => sum + s.score.overall, 0) / setData.length || 0,
      feedback: [],
    };
    onComplete(session);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFeedbackColor = (type: AICoachFeedback['type']): string => {
    switch (type) {
      case 'celebration':
        return colors.primary;
      case 'encouragement':
        return colors.success;
      case 'correction':
        return colors.warning;
      case 'warning':
        return colors.error;
      default:
        return colors.textPrimary;
    }
  };

  // Render skeleton overlay
  const renderSkeleton = () => {
    if (!simulatedPose) return null;

    const kp = simulatedPose.keypoints;
    const connections = [
      // Torso
      [0, 1], [0, 2], [1, 7], [2, 8], [7, 8],
      // Arms
      [1, 3], [3, 5], [2, 4], [4, 6],
      // Legs
      [7, 9], [9, 11], [8, 10], [10, 12],
    ];

    return (
      <Svg style={StyleSheet.absoluteFillObject}>
        {/* Connections */}
        {connections.map(([i, j], idx) => (
          <Line
            key={`line-${idx}`}
            x1={kp[i].x}
            y1={kp[i].y}
            x2={kp[j].x}
            y2={kp[j].y}
            stroke={isFormCorrect ? colors.primary : colors.warning}
            strokeWidth={3}
            opacity={0.8}
          />
        ))}
        {/* Keypoints */}
        {kp.map((point, idx) => (
          <Circle
            key={`point-${idx}`}
            cx={point.x}
            cy={point.y}
            r={8}
            fill={isFormCorrect ? colors.primary : colors.warning}
            opacity={0.9}
          />
        ))}
      </Svg>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Camera Preview Placeholder (would be real camera in production) */}
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Skeleton Overlay */}
        {sessionState === 'active' && renderSkeleton()}

        {/* Top HUD */}
        <View style={[styles.topHud, { paddingTop: insets.top + spacing.md }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <BlurView intensity={60} style={styles.blurBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDuration}>{formatTime(workoutDuration)}</Text>
          </View>

          <View style={styles.formIndicator}>
            <BlurView intensity={60} style={styles.blurBtn}>
              <Ionicons
                name={isFormCorrect ? 'checkmark-circle' : 'alert-circle'}
                size={24}
                color={isFormCorrect ? colors.success : colors.warning}
              />
            </BlurView>
          </View>
        </View>

        {/* Preparing Countdown */}
        {sessionState === 'preparing' && (
          <View style={styles.countdownContainer}>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </View>
            <Text style={styles.countdownText}>Get Ready!</Text>
            <Text style={styles.tipText}>
              {AI_COACH_TIPS.loading[countdown % AI_COACH_TIPS.loading.length]}
            </Text>
          </View>
        )}

        {/* Active Workout UI */}
        {sessionState === 'active' && (
          <>
            {/* Rep Counter */}
            <View style={styles.repCounterContainer}>
              <Animated.View style={[styles.repCounter, { transform: [{ scale: repCountAnimation }] }]}>
                <Text style={styles.repCountNumber}>{currentReps}</Text>
                <Text style={styles.repCountLabel}>/ {targetReps}</Text>
              </Animated.View>
              <Text style={styles.setLabel}>Set {currentSet} of {targetSets}</Text>
            </View>

            {/* Form Score */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scoreNumber, { color: formScore >= 80 ? colors.success : colors.warning }]}>
                  {formScore}
                </Text>
                <Text style={styles.scoreLabel}>Form</Text>
              </View>
            </View>
          </>
        )}

        {/* Rest Timer */}
        {sessionState === 'rest' && (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Rest Time</Text>
            <View style={styles.restTimerCircle}>
              <Text style={styles.restTimerNumber}>{restTimeRemaining}</Text>
            </View>
            <Text style={styles.restNextSet}>Next: Set {currentSet + 1}</Text>
            <TouchableOpacity
              style={styles.skipRestBtn}
              onPress={() => setRestTimeRemaining(0)}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Complete Screen */}
        {sessionState === 'complete' && (
          <View style={styles.completeContainer}>
            <View style={styles.completeBadge}>
              <Ionicons name="trophy" size={64} color={colors.warning} />
            </View>
            <Text style={styles.completeTitle}>Workout Complete!</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{setData.length}</Text>
                  <Text style={styles.summaryLabel}>Sets</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {setData.reduce((sum, s) => sum + s.reps, 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Reps</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatTime(workoutDuration)}</Text>
                  <Text style={styles.summaryLabel}>Duration</Text>
                </View>
              </View>

              <View style={styles.overallScoreContainer}>
                <Text style={styles.overallScoreLabel}>Overall Score</Text>
                <View style={styles.overallScoreCircle}>
                  <Text style={styles.overallScoreNumber}>
                    {Math.round(setData.reduce((sum, s) => sum + s.score.overall, 0) / setData.length) || 95}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                style={styles.completeBtnGradient}
              >
                <Text style={styles.completeBtnText}>Save Workout</Text>
                <Ionicons name="checkmark" size={20} color={colors.textInverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Feedback Toast */}
        {currentFeedback && (
          <Animated.View
            style={[
              styles.feedbackToast,
              {
                opacity: feedbackAnimation,
                transform: [{
                  translateY: feedbackAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
                borderColor: getFeedbackColor(currentFeedback.type),
              },
            ]}
          >
            <Ionicons
              name={
                currentFeedback.type === 'celebration' ? 'star' :
                currentFeedback.type === 'encouragement' ? 'checkmark-circle' :
                currentFeedback.type === 'correction' ? 'information-circle' :
                'warning'
              }
              size={24}
              color={getFeedbackColor(currentFeedback.type)}
            />
            <Text style={[styles.feedbackText, { color: getFeedbackColor(currentFeedback.type) }]}>
              {currentFeedback.message}
            </Text>
          </Animated.View>
        )}

        {/* Bottom Quick Actions */}
        {sessionState === 'active' && (
          <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setSessionState('rest')}
            >
              <BlurView intensity={60} style={styles.actionBtnBlur}>
                <Ionicons name="pause" size={28} color={colors.textPrimary} />
                <Text style={styles.actionBtnText}>Rest</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.repBtn}
              onPress={handleRepCompleted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                style={styles.repBtnGradient}
              >
                <Ionicons name="add" size={32} color={colors.textInverse} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setSessionState('complete')}
            >
              <BlurView intensity={60} style={styles.actionBtnBlur}>
                <Ionicons name="checkmark-done" size={28} color={colors.textPrimary} />
                <Text style={styles.actionBtnText}>Done</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  topHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  closeBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  blurBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  exerciseInfo: {
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  exerciseDuration: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  formIndicator: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  countdownText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.xl,
  },
  tipText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  repCounterContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  repCounter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  repCountNumber: {
    fontSize: 96,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  repCountLabel: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  setLabel: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  scoreContainer: {
    position: 'absolute',
    top: 280,
    right: spacing.xl,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  scoreLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  restContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  restTimerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 4,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTimerNumber: {
    fontSize: 72,
    fontWeight: typography.weight.bold,
    color: colors.secondary,
  },
  restNextSet: {
    fontSize: typography.size.lg,
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  skipRestBtn: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
  },
  skipRestText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  completeBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  completeTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  overallScoreContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  overallScoreLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  overallScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySubtle,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallScoreNumber: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  completeBtn: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  completeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  completeBtnText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  feedbackToast: {
    position: 'absolute',
    bottom: 200,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 2,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  feedbackText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  actionBtn: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  actionBtnBlur: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
  },
  actionBtnText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  repBtn: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.button,
  },
  repBtnGradient: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
});

export default AIWorkoutSession;
