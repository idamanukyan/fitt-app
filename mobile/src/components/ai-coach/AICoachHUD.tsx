/**
 * AICoachHUD - Heads Up Display for AI workout session
 * Shows rep counter, form score, set progress, and timer
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, radius } from '../../../design/tokens';
import { FormScoreRing } from '../ui/ProgressRing';
import type { AISessionState, RepPhase, FormIssue } from '../../types/ai-session.types';

interface AICoachHUDProps {
  sessionState: AISessionState;
  currentSet: number;
  targetSets: number;
  currentReps: number;
  targetReps: number;
  formScore: number;
  repPhase: RepPhase;
  elapsedTime: number; // seconds
  restTimeRemaining?: number; // seconds
  activeFeedback: FormIssue[];
  onPause?: () => void;
  onResume?: () => void;
  onEndSet?: () => void;
  onSkipRest?: () => void;
}

export const AICoachHUD: React.FC<AICoachHUDProps> = ({
  sessionState,
  currentSet,
  targetSets,
  currentReps,
  targetReps,
  formScore,
  repPhase,
  elapsedTime,
  restTimeRemaining,
  activeFeedback,
  onPause,
  onResume,
  onEndSet,
  onSkipRest,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const repAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for active state
  useEffect(() => {
    if (sessionState === 'exercising') {
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
  }, [sessionState]);

  // Rep counter animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(repAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(repAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentReps]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = (phase: RepPhase): string => {
    switch (phase) {
      case 'waiting':
        return 'Ready';
      case 'eccentric':
        return 'Lowering';
      case 'bottom':
        return 'Bottom';
      case 'concentric':
        return 'Lifting';
      case 'lockout':
        return 'Top';
      default:
        return phase;
    }
  };

  const getPhaseColor = (phase: RepPhase): string => {
    switch (phase) {
      case 'eccentric':
        return colors.info;
      case 'bottom':
        return colors.warning;
      case 'concentric':
        return colors.primary;
      case 'lockout':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const renderRestingOverlay = () => {
    if (sessionState !== 'resting' || restTimeRemaining === undefined) {
      return null;
    }

    return (
      <View style={styles.restingOverlay}>
        <BlurView intensity={60} style={StyleSheet.absoluteFillObject} />
        <View style={styles.restingContent}>
          <Text style={styles.restingTitle}>Rest Time</Text>
          <Text style={styles.restingTime}>{formatTime(restTimeRemaining)}</Text>
          <Text style={styles.restingSubtitle}>
            Set {currentSet} of {targetSets} complete
          </Text>
          <TouchableOpacity
            style={styles.skipRestButton}
            onPress={onSkipRest}
            activeOpacity={0.8}
          >
            <Text style={styles.skipRestText}>Skip Rest</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Bar - Session Info */}
      <View style={styles.topBar}>
        <BlurView intensity={50} style={StyleSheet.absoluteFillObject} />
        <View style={styles.topBarContent}>
          {/* Timer */}
          <View style={styles.timerSection}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>

          {/* Set Progress */}
          <View style={styles.setProgress}>
            <Text style={styles.setProgressText}>
              Set {currentSet}/{targetSets}
            </Text>
            <View style={styles.setProgressBar}>
              {Array.from({ length: targetSets }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.setProgressDot,
                    i < currentSet && styles.setProgressDotComplete,
                    i === currentSet - 1 &&
                      sessionState === 'exercising' &&
                      styles.setProgressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Pause/Resume Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={sessionState === 'paused' ? onResume : onPause}
          >
            <Ionicons
              name={sessionState === 'paused' ? 'play' : 'pause'}
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center - Rep Counter & Phase */}
      {sessionState === 'exercising' && (
        <View style={styles.centerSection}>
          {/* Rep Counter */}
          <Animated.View
            style={[
              styles.repCounterContainer,
              { transform: [{ scale: repAnim }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(74, 222, 128, 0.15)', 'rgba(74, 222, 128, 0.05)']}
              style={styles.repCounterBg}
            >
              <Text style={styles.repCounterLabel}>REPS</Text>
              <Text style={styles.repCounterValue}>{currentReps}</Text>
              <Text style={styles.repCounterTarget}>of {targetReps}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Phase Indicator */}
          <View style={styles.phaseIndicator}>
            <View
              style={[
                styles.phaseDot,
                { backgroundColor: getPhaseColor(repPhase) },
              ]}
            />
            <Text
              style={[styles.phaseText, { color: getPhaseColor(repPhase) }]}
            >
              {getPhaseLabel(repPhase)}
            </Text>
          </View>
        </View>
      )}

      {/* Form Feedback */}
      {activeFeedback.length > 0 && sessionState === 'exercising' && (
        <View style={styles.feedbackSection}>
          {activeFeedback.slice(0, 2).map((feedback, index) => (
            <View
              key={feedback.ruleId}
              style={[
                styles.feedbackItem,
                feedback.severity === 'error' && styles.feedbackError,
                feedback.severity === 'warning' && styles.feedbackWarning,
              ]}
            >
              <Ionicons
                name={
                  feedback.severity === 'error'
                    ? 'alert-circle'
                    : 'warning-outline'
                }
                size={16}
                color={
                  feedback.severity === 'error' ? colors.error : colors.warning
                }
              />
              <Text style={styles.feedbackText}>{feedback.correction}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bottom Bar - Form Score & End Set */}
      <View style={styles.bottomBar}>
        <BlurView intensity={50} style={StyleSheet.absoluteFillObject} />
        <View style={styles.bottomBarContent}>
          {/* Form Score */}
          <Animated.View
            style={[
              styles.formScoreSection,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <FormScoreRing score={formScore} size="sm" showLabel={false} />
            <View style={styles.formScoreText}>
              <Text style={styles.formScoreLabel}>Form</Text>
              <Text
                style={[
                  styles.formScoreValue,
                  formScore >= 80 && styles.formScoreGood,
                  formScore < 60 && styles.formScoreBad,
                ]}
              >
                {Math.round(formScore)}%
              </Text>
            </View>
          </Animated.View>

          {/* End Set Button */}
          {sessionState === 'exercising' && (
            <TouchableOpacity
              style={styles.endSetButton}
              onPress={onEndSet}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.endSetButtonGradient}
              >
                <Text style={styles.endSetButtonText}>End Set</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.textInverse}
                />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Resting Overlay */}
      {renderRestingOverlay()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    borderRadius: radius.lg,
    margin: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  setProgress: {
    alignItems: 'center',
  },
  setProgressText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  setProgressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  setProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  setProgressDotComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  setProgressDotActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  centerSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  repCounterContainer: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  repCounterBg: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  repCounterLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
    letterSpacing: 2,
  },
  repCounterValue: {
    fontSize: 72,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginVertical: -spacing.sm,
  },
  repCounterTarget: {
    fontSize: typography.size.base,
    color: colors.textMuted,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  feedbackSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  feedbackError: {
    backgroundColor: colors.errorBg,
    borderLeftColor: colors.error,
  },
  feedbackWarning: {
    backgroundColor: colors.warningBg,
    borderLeftColor: colors.warning,
  },
  feedbackText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  bottomBar: {
    borderRadius: radius.lg,
    margin: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  formScoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  formScoreText: {
    gap: 2,
  },
  formScoreLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  formScoreValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  formScoreGood: {
    color: colors.success,
  },
  formScoreBad: {
    color: colors.error,
  },
  endSetButton: {
    flex: 1,
    maxWidth: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  endSetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  endSetButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  restingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restingContent: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  restingTitle: {
    fontSize: typography.size.lg,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  restingTime: {
    fontSize: 64,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  restingSubtitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  skipRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skipRestText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
});

export default AICoachHUD;
