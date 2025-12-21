/**
 * Form Analysis Service
 * Analyzes pose data for form issues and provides real-time feedback
 */

import type {
  PoseDetectionResult,
  FormRule,
  FormIssue,
  KeypointName,
  RepPhase,
} from '../types/ai-session.types';
import { COMMON_FORM_RULES } from '../types/ai-session.types';
import {
  getKeypoint,
  calculateAngle,
  calculateDistance,
  isKeypointVisible,
} from './poseDetectionService';

// Form analysis configuration
interface FormAnalysisConfig {
  rules: FormRule[];
  feedbackCooldown: number; // ms between same feedback
  maxActiveIssues: number;
  formScoreWeight: {
    angle: number;
    symmetry: number;
    stability: number;
    tempo: number;
  };
}

const DEFAULT_CONFIG: FormAnalysisConfig = {
  rules: COMMON_FORM_RULES,
  feedbackCooldown: 3000, // 3 seconds between same warning
  maxActiveIssues: 3,
  formScoreWeight: {
    angle: 0.4,
    symmetry: 0.2,
    stability: 0.2,
    tempo: 0.2,
  },
};

// Service state
let config = DEFAULT_CONFIG;
let activeIssues: Map<string, FormIssue> = new Map();
let issueHistory: FormIssue[] = [];
let lastFeedbackTime: Map<string, number> = new Map();
let poseHistory: PoseDetectionResult[] = [];
let baselineAngles: Map<string, number> = new Map();

// Callbacks
type FeedbackCallback = (issue: FormIssue) => void;
let onFeedback: FeedbackCallback | null = null;

/**
 * Initialize form analysis with custom rules
 */
export function initialize(
  customRules?: FormRule[],
  callbacks?: { onFeedback?: FeedbackCallback }
): void {
  if (customRules) {
    config = { ...config, rules: [...COMMON_FORM_RULES, ...customRules] };
  }
  if (callbacks?.onFeedback) {
    onFeedback = callbacks.onFeedback;
  }

  activeIssues.clear();
  issueHistory = [];
  lastFeedbackTime.clear();
  poseHistory = [];
  baselineAngles.clear();

  console.log('[FormAnalysis] Initialized with', config.rules.length, 'rules');
}

/**
 * Analyze pose for form issues
 * Returns current form score and active issues
 */
export function analyzePose(
  pose: PoseDetectionResult,
  currentPhase: RepPhase
): {
  formScore: number;
  activeIssues: FormIssue[];
  newIssues: FormIssue[];
} {
  // Store pose history for stability analysis
  poseHistory.push(pose);
  if (poseHistory.length > 30) {
    poseHistory.shift();
  }

  const newIssues: FormIssue[] = [];
  let angleScore = 100;
  let symmetryScore = 100;
  let stabilityScore = 100;

  // Run each rule
  for (const rule of config.rules) {
    const result = checkRule(rule, pose, currentPhase);

    if (result.issue) {
      // Check cooldown
      const lastTime = lastFeedbackTime.get(rule.id) || 0;
      const now = Date.now();

      if (now - lastTime >= config.feedbackCooldown) {
        // Add or update issue
        const formIssue: FormIssue = {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: rule.feedback.issue,
          correction: rule.feedback.correction,
          detectedAt: now,
          affectedJoints: rule.joints,
        };

        if (!activeIssues.has(rule.id)) {
          newIssues.push(formIssue);
          activeIssues.set(rule.id, formIssue);
          issueHistory.push(formIssue);

          if (onFeedback) {
            onFeedback(formIssue);
          }
        }

        lastFeedbackTime.set(rule.id, now);
      }

      // Update scores
      const penalty = result.severity === 'error' ? 15 : result.severity === 'warning' ? 10 : 5;
      switch (rule.check) {
        case 'angle_range':
        case 'alignment':
          angleScore -= penalty;
          break;
        case 'symmetry':
          symmetryScore -= penalty;
          break;
        case 'stability':
          stabilityScore -= penalty;
          break;
      }
    } else {
      // Issue resolved
      if (activeIssues.has(rule.id)) {
        const issue = activeIssues.get(rule.id)!;
        issue.resolvedAt = Date.now();
        activeIssues.delete(rule.id);
      }
    }
  }

  // Calculate tempo score if we have history
  const tempoScore = calculateTempoScore();

  // Calculate weighted form score
  const formScore = Math.max(
    0,
    Math.min(
      100,
      angleScore * config.formScoreWeight.angle +
        symmetryScore * config.formScoreWeight.symmetry +
        stabilityScore * config.formScoreWeight.stability +
        tempoScore * config.formScoreWeight.tempo
    )
  );

  return {
    formScore,
    activeIssues: Array.from(activeIssues.values()),
    newIssues,
  };
}

/**
 * Check a single form rule
 */
function checkRule(
  rule: FormRule,
  pose: PoseDetectionResult,
  currentPhase: RepPhase
): { issue: boolean; severity: 'info' | 'warning' | 'error' } {
  switch (rule.check) {
    case 'alignment':
      return checkAlignment(rule, pose);
    case 'symmetry':
      return checkSymmetry(rule, pose);
    case 'angle_range':
      return checkAngleRange(rule, pose, currentPhase);
    case 'stability':
      return checkStability(rule, pose);
    case 'tempo':
      return checkTempo(rule);
    default:
      return { issue: false, severity: 'info' };
  }
}

/**
 * Check joint alignment
 */
function checkAlignment(
  rule: FormRule,
  pose: PoseDetectionResult
): { issue: boolean; severity: 'info' | 'warning' | 'error' } {
  if (rule.joints.length < 3) {
    return { issue: false, severity: 'info' };
  }

  const points = rule.joints.map((j) => getKeypoint(pose, j));
  if (points.some((p) => !isKeypointVisible(p))) {
    return { issue: false, severity: 'info' };
  }

  const angle = calculateAngle(points[0]!, points[1]!, points[2]!);
  const expectedAngle = baselineAngles.get(rule.id) || 180;
  const deviation = Math.abs(angle - expectedAngle);

  if (deviation >= rule.thresholds.error) {
    return { issue: true, severity: 'error' };
  }
  if (deviation >= rule.thresholds.warning) {
    return { issue: true, severity: 'warning' };
  }

  return { issue: false, severity: 'info' };
}

/**
 * Check bilateral symmetry
 */
function checkSymmetry(
  rule: FormRule,
  pose: PoseDetectionResult
): { issue: boolean; severity: 'info' | 'warning' | 'error' } {
  // Get left and right pairs
  const leftJoints = rule.joints.filter((j) => j.startsWith('left_'));
  const rightJoints = rule.joints.filter((j) => j.startsWith('right_'));

  if (leftJoints.length === 0 || rightJoints.length === 0) {
    return { issue: false, severity: 'info' };
  }

  // Calculate average position difference
  let totalDiff = 0;
  let count = 0;

  for (let i = 0; i < leftJoints.length; i++) {
    const leftPoint = getKeypoint(pose, leftJoints[i]);
    const rightName = leftJoints[i].replace('left_', 'right_') as KeypointName;
    const rightPoint = getKeypoint(pose, rightName);

    if (isKeypointVisible(leftPoint) && isKeypointVisible(rightPoint)) {
      // Mirror the right x coordinate for comparison
      const mirroredRightX = 1 - rightPoint!.x;
      const diffX = Math.abs(leftPoint!.x - mirroredRightX);
      const diffY = Math.abs(leftPoint!.y - rightPoint!.y);
      totalDiff += Math.sqrt(diffX * diffX + diffY * diffY);
      count++;
    }
  }

  if (count === 0) {
    return { issue: false, severity: 'info' };
  }

  const avgDiff = totalDiff / count;

  if (avgDiff >= rule.thresholds.error) {
    return { issue: true, severity: 'error' };
  }
  if (avgDiff >= rule.thresholds.warning) {
    return { issue: true, severity: 'warning' };
  }

  return { issue: false, severity: 'info' };
}

/**
 * Check angle within expected range
 */
function checkAngleRange(
  rule: FormRule,
  pose: PoseDetectionResult,
  currentPhase: RepPhase
): { issue: boolean; severity: 'info' | 'warning' | 'error' } {
  if (rule.joints.length < 2) {
    return { issue: false, severity: 'info' };
  }

  const points = rule.joints.map((j) => getKeypoint(pose, j));
  if (points.some((p) => !isKeypointVisible(p))) {
    return { issue: false, severity: 'info' };
  }

  // For 2 joints, calculate angle from vertical
  // For 3+ joints, calculate joint angle
  let angle: number;
  if (points.length >= 3) {
    angle = calculateAngle(points[0]!, points[1]!, points[2]!);
  } else {
    // Angle from vertical
    const dx = points[1]!.x - points[0]!.x;
    const dy = points[1]!.y - points[0]!.y;
    angle = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  }

  // Only check during relevant phases
  if (currentPhase === 'bottom') {
    if (angle < rule.thresholds.warning) {
      return { issue: true, severity: 'warning' };
    }
  }

  return { issue: false, severity: 'info' };
}

/**
 * Check pose stability over time
 */
function checkStability(
  rule: FormRule,
  pose: PoseDetectionResult
): { issue: boolean; severity: 'info' | 'warning' | 'error' } {
  if (poseHistory.length < 10) {
    return { issue: false, severity: 'info' };
  }

  // Calculate variance in key joint positions
  const recentPoses = poseHistory.slice(-10);
  let totalVariance = 0;
  let count = 0;

  for (const joint of rule.joints) {
    const positions = recentPoses
      .map((p) => getKeypoint(p, joint))
      .filter(isKeypointVisible) as PoseDetectionResult['keypoints'];

    if (positions.length < 5) continue;

    const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
    const avgY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;

    const variance = positions.reduce((sum, p) => {
      const dx = p.x - avgX;
      const dy = p.y - avgY;
      return sum + dx * dx + dy * dy;
    }, 0) / positions.length;

    totalVariance += Math.sqrt(variance);
    count++;
  }

  if (count === 0) {
    return { issue: false, severity: 'info' };
  }

  const avgVariance = totalVariance / count;

  // Convert variance to a reasonable threshold comparison
  if (avgVariance >= 0.05) {
    return { issue: true, severity: 'warning' };
  }

  return { issue: false, severity: 'info' };
}

/**
 * Check rep tempo consistency
 */
function checkTempo(
  rule: FormRule
): { issue: boolean; severity: 'info' | 'warning' | 'error' } {
  // This would integrate with rep counting service
  // For now, return no issue
  return { issue: false, severity: 'info' };
}

/**
 * Calculate tempo consistency score
 */
function calculateTempoScore(): number {
  // Would analyze rep timing consistency
  // For now, return base score
  return 85;
}

/**
 * Set baseline angles for calibration
 */
export function calibrate(pose: PoseDetectionResult): void {
  for (const rule of config.rules) {
    if (rule.check === 'alignment' && rule.joints.length >= 3) {
      const points = rule.joints.map((j) => getKeypoint(pose, j));
      if (points.every(isKeypointVisible)) {
        const angle = calculateAngle(points[0]!, points[1]!, points[2]!);
        baselineAngles.set(rule.id, angle);
      }
    }
  }
  console.log('[FormAnalysis] Calibrated with', baselineAngles.size, 'baseline angles');
}

/**
 * Get form score from history
 */
export function getAverageFormScore(): number {
  if (issueHistory.length === 0) return 100;

  const issuePenalty = issueHistory.length * 5;
  return Math.max(0, 100 - issuePenalty);
}

/**
 * Get issue summary
 */
export function getIssueSummary(): {
  totalIssues: number;
  byType: Record<string, number>;
  mostCommon: string | null;
} {
  const byType: Record<string, number> = {};

  for (const issue of issueHistory) {
    byType[issue.ruleName] = (byType[issue.ruleName] || 0) + 1;
  }

  let mostCommon: string | null = null;
  let maxCount = 0;

  for (const [name, count] of Object.entries(byType)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = name;
    }
  }

  return {
    totalIssues: issueHistory.length,
    byType,
    mostCommon,
  };
}

/**
 * Clear active issues
 */
export function clearActiveIssues(): void {
  activeIssues.clear();
}

/**
 * Reset everything
 */
export function reset(): void {
  config = DEFAULT_CONFIG;
  activeIssues.clear();
  issueHistory = [];
  lastFeedbackTime.clear();
  poseHistory = [];
  baselineAngles.clear();
  onFeedback = null;
  console.log('[FormAnalysis] Reset');
}

export default {
  initialize,
  analyzePose,
  calibrate,
  getAverageFormScore,
  getIssueSummary,
  clearActiveIssues,
  reset,
};
