/**
 * AICoachOverlay - Real-time AI Form Feedback Overlay
 * Displays pose skeleton, form score, rep counter, and AI feedback
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  colors,
  typography,
  spacing,
  radius,
  gradients,
} from '../../design/tokens';
import type { FormAnalysis, AICoachFeedback, PoseKeypoint } from '../../types/training.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AICoachOverlayProps {
  isActive: boolean;
  formScore: number;
  repCount: number;
  targetReps: number;
  currentSet: number;
  targetSets: number;
  feedback: AICoachFeedback | null;
  formAnalysis: FormAnalysis | null;
  poseKeypoints?: PoseKeypoint[];
}

export const AICoachOverlay: React.FC<AICoachOverlayProps> = ({
  isActive,
  formScore,
  repCount,
  targetReps,
  currentSet,
  targetSets,
  feedback,
  formAnalysis,
  poseKeypoints,
}) => {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scoreAnim, {
      toValue: formScore,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [formScore]);

  useEffect(() => {
    if (feedback) {
      feedbackAnim.setValue(0);
      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [feedback]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return colors.success;
    if (score >= 75) return colors.accent.cyan;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getFeedbackIcon = (type: AICoachFeedback['type']): string => {
    switch (type) {
      case 'encouragement':
        return 'thumbs-up';
      case 'correction':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'celebration':
        return 'trophy';
      default:
        return 'information-circle';
    }
  };

  const getFeedbackColor = (type: AICoachFeedback['type']): string => {
    switch (type) {
      case 'encouragement':
        return colors.success;
      case 'correction':
        return colors.warning;
      case 'warning':
        return colors.error;
      case 'celebration':
        return colors.accent.yellow;
      default:
        return colors.primary;
    }
  };

  const scoreColor = getScoreColor(formScore);
  const scoreWidth = scoreAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Stats Bar */}
      <View style={styles.topBar}>
        <BlurView intensity={60} style={styles.topBarBlur}>
          <View style={styles.topBarContent}>
            {/* Form Score */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreHeader}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.scoreLabel}>Form Score</Text>
              </View>
              <Animated.Text style={[styles.scoreValue, { color: scoreColor }]}>
                {Math.round(formScore)}
              </Animated.Text>
              <View style={styles.scoreBarBg}>
                <Animated.View
                  style={[
                    styles.scoreBarFill,
                    { width: scoreWidth, backgroundColor: scoreColor },
                  ]}
                />
              </View>
            </View>

            {/* Rep Counter */}
            <Animated.View style={[styles.repContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.repCount}>{repCount}</Text>
              <Text style={styles.repTarget}>/ {targetReps}</Text>
              <Text style={styles.repLabel}>REPS</Text>
            </Animated.View>

            {/* Set Counter */}
            <View style={styles.setContainer}>
              <Text style={styles.setLabel}>Set</Text>
              <Text style={styles.setValue}>
                {currentSet} <Text style={styles.setOf}>of</Text> {targetSets}
              </Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Form Issues Indicator */}
      {formAnalysis && formAnalysis.issues.length > 0 && (
        <View style={styles.issuesContainer}>
          <BlurView intensity={50} style={styles.issuesBlur}>
            {formAnalysis.issues.slice(0, 2).map((issue, index) => (
              <View
                key={index}
                style={[
                  styles.issueChip,
                  {
                    backgroundColor:
                      issue.severity === 'critical'
                        ? colors.errorBg
                        : issue.severity === 'moderate'
                        ? colors.warningBg
                        : colors.infoBg,
                  },
                ]}
              >
                <Ionicons
                  name={issue.severity === 'critical' ? 'alert-circle' : 'information-circle'}
                  size={14}
                  color={
                    issue.severity === 'critical'
                      ? colors.error
                      : issue.severity === 'moderate'
                      ? colors.warning
                      : colors.info
                  }
                />
                <Text
                  style={[
                    styles.issueText,
                    {
                      color:
                        issue.severity === 'critical'
                          ? colors.error
                          : issue.severity === 'moderate'
                          ? colors.warning
                          : colors.info,
                    },
                  ]}
                >
                  {issue.description}
                </Text>
              </View>
            ))}
          </BlurView>
        </View>
      )}

      {/* AI Feedback Toast */}
      {feedback && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackAnim,
              transform: [
                {
                  translateY: feedbackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[`${getFeedbackColor(feedback.type)}30`, `${getFeedbackColor(feedback.type)}10`]}
            style={styles.feedbackGradient}
          >
            <View
              style={[
                styles.feedbackIconContainer,
                { backgroundColor: `${getFeedbackColor(feedback.type)}30` },
              ]}
            >
              <Ionicons
                name={getFeedbackIcon(feedback.type) as any}
                size={24}
                color={getFeedbackColor(feedback.type)}
              />
            </View>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Active Indicator */}
      {isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.activeText}>AI TRACKING</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    overflow: 'hidden',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topBarBlur: {
    padding: spacing.lg,
    paddingTop: spacing['3xl'],
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreContainer: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  scoreLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
  },
  scoreBarBg: {
    height: 4,
    backgroundColor: colors.glass,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  repContainer: {
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  repCount: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    color: colors.primary,
    lineHeight: 44,
  },
  repTarget: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginTop: -4,
  },
  repLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  setContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },
  setLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  setValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  setOf: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.textMuted,
  },
  issuesContainer: {
    position: 'absolute',
    top: 140,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  issuesBlur: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  issueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  issueText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    flex: 1,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 120,
    left: spacing.lg,
    right: spacing.lg,
  },
  feedbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.md,
  },
  feedbackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  activeIndicator: {
    position: 'absolute',
    top: spacing['3xl'] + 10,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  activeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
});

export default AICoachOverlay;
