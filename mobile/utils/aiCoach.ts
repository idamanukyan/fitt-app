/**
 * AI Coach Utilities
 * Core logic for pose estimation, rep counting, and form analysis
 */

import {
  PoseKeypoint,
  PoseData,
  RepState,
  RepCount,
  FormAnalysis,
  FormIssue,
  FormIssueType,
  RangeOfMotion,
  SymmetryAnalysis,
  SetScore,
  AICoachFeedback,
  ExerciseConfig,
  RepCriteria,
  FormRule,
  PoseLandmark,
} from '../types/training.types';
import { ExerciseDetail } from '../types/training.types';

// ============================================================================
// POSE ANALYSIS UTILITIES
// ============================================================================

/**
 * Calculate angle between three points (in degrees)
 */
export const calculateAngle = (
  p1: PoseKeypoint,
  p2: PoseKeypoint, // vertex
  p3: PoseKeypoint
): number => {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) -
                  Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
};

/**
 * Calculate distance between two keypoints
 */
export const calculateDistance = (p1: PoseKeypoint, p2: PoseKeypoint): number => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  );
};

/**
 * Get keypoint by landmark index
 */
export const getKeypoint = (
  keypoints: PoseKeypoint[],
  landmark: PoseLandmark
): PoseKeypoint | undefined => {
  return keypoints.find(kp => kp.landmark === landmark);
};

/**
 * Check if pose detection is reliable
 */
export const isPoseReliable = (poseData: PoseData, minConfidence: number = 0.5): boolean => {
  return poseData.confidence >= minConfidence &&
         poseData.keypoints.every(kp => kp.visibility >= 0.3);
};

/**
 * Smooth keypoints using exponential moving average
 */
export const smoothKeypoints = (
  currentKeypoints: PoseKeypoint[],
  previousKeypoints: PoseKeypoint[],
  alpha: number = 0.7 // Higher = more responsive, lower = smoother
): PoseKeypoint[] => {
  if (previousKeypoints.length === 0) return currentKeypoints;

  return currentKeypoints.map((current, index) => {
    const previous = previousKeypoints[index];
    if (!previous) return current;

    return {
      ...current,
      x: alpha * current.x + (1 - alpha) * previous.x,
      y: alpha * current.y + (1 - alpha) * previous.y,
      z: alpha * current.z + (1 - alpha) * previous.z,
    };
  });
};

// ============================================================================
// REP COUNTING LOGIC
// ============================================================================

interface RepTracker {
  phase: 'start' | 'down' | 'up';
  minAngle: number;
  maxAngle: number;
  repStartTime: number;
  lastAngle: number;
  velocity: number;
}

const repTrackers: Map<string, RepTracker> = new Map();

/**
 * Initialize rep tracker for an exercise
 */
export const initRepTracker = (exerciseId: string): void => {
  repTrackers.set(exerciseId, {
    phase: 'start',
    minAngle: 180,
    maxAngle: 0,
    repStartTime: Date.now(),
    lastAngle: 0,
    velocity: 0,
  });
};

/**
 * Track rep state and count reps
 */
export const trackRep = (
  exerciseId: string,
  poseData: PoseData,
  criteria: RepCriteria
): { counted: boolean; isValid: boolean; rom: number } => {
  let tracker = repTrackers.get(exerciseId);
  if (!tracker) {
    initRepTracker(exerciseId);
    tracker = repTrackers.get(exerciseId)!;
  }

  // Get relevant keypoints based on exercise
  const keypoints = poseData.keypoints;

  // Calculate primary angle (e.g., elbow for bicep curls)
  const primaryAngle = getPrimaryAngle(keypoints, criteria.primaryJoints);

  // Track velocity for tempo scoring
  const deltaTime = 0.033; // Assuming ~30fps
  tracker.velocity = Math.abs(primaryAngle - tracker.lastAngle) / deltaTime;
  tracker.lastAngle = primaryAngle;

  // Update min/max angles
  tracker.minAngle = Math.min(tracker.minAngle, primaryAngle);
  tracker.maxAngle = Math.max(tracker.maxAngle, primaryAngle);

  let counted = false;
  let isValid = false;

  // State machine for rep detection
  switch (tracker.phase) {
    case 'start':
      // Waiting for downward motion (eccentric)
      if (primaryAngle < criteria.startAngle - 10) {
        tracker.phase = 'down';
        tracker.repStartTime = Date.now();
      }
      break;

    case 'down':
      // In eccentric phase, looking for bottom position
      if (primaryAngle <= criteria.endAngle + criteria.returnThreshold) {
        tracker.phase = 'up';
      }
      break;

    case 'up':
      // In concentric phase, looking for return to start
      if (primaryAngle >= criteria.startAngle - criteria.returnThreshold) {
        // Rep completed!
        counted = true;

        // Check if ROM was sufficient
        const actualROM = tracker.maxAngle - tracker.minAngle;
        const requiredROM = criteria.startAngle - criteria.endAngle;
        const romPercentage = (actualROM / requiredROM) * 100;

        isValid = romPercentage >= criteria.minROM;

        // Reset for next rep
        tracker.phase = 'start';
        tracker.minAngle = 180;
        tracker.maxAngle = 0;
      }
      break;
  }

  const rom = ((tracker.maxAngle - tracker.minAngle) /
               (criteria.startAngle - criteria.endAngle)) * 100;

  return { counted, isValid, rom: Math.min(100, rom) };
};

/**
 * Get primary angle for rep counting based on exercise
 */
const getPrimaryAngle = (keypoints: PoseKeypoint[], joints: PoseLandmark[]): number => {
  if (joints.length < 3) return 0;

  const p1 = getKeypoint(keypoints, joints[0]);
  const p2 = getKeypoint(keypoints, joints[1]);
  const p3 = getKeypoint(keypoints, joints[2]);

  if (!p1 || !p2 || !p3) return 0;

  return calculateAngle(p1, p2, p3);
};

// ============================================================================
// FORM CORRECTION ENGINE
// ============================================================================

/**
 * Analyze form and detect issues
 */
export const analyzeForm = (
  poseData: PoseData,
  formRules: FormRule[]
): FormAnalysis => {
  const issues: FormIssue[] = [];
  let totalScore = 100;

  for (const rule of formRules) {
    const violation = checkFormRule(poseData, rule);
    if (violation) {
      issues.push(violation);

      // Deduct points based on severity
      switch (violation.severity) {
        case 'critical':
          totalScore -= 30;
          break;
        case 'moderate':
          totalScore -= 15;
          break;
        case 'minor':
          totalScore -= 5;
          break;
      }
    }
  }

  const suggestions = issues.map(issue => issue.fix);

  return {
    isCorrect: issues.length === 0,
    score: Math.max(0, totalScore),
    issues,
    suggestions,
  };
};

/**
 * Check a specific form rule
 */
const checkFormRule = (poseData: PoseData, rule: FormRule): FormIssue | null => {
  const keypoints = poseData.keypoints;

  switch (rule.condition) {
    case 'angle_range': {
      if (rule.joints.length < 3) return null;

      const p1 = getKeypoint(keypoints, rule.joints[0]);
      const p2 = getKeypoint(keypoints, rule.joints[1]);
      const p3 = getKeypoint(keypoints, rule.joints[2]);

      if (!p1 || !p2 || !p3) return null;

      const angle = calculateAngle(p1, p2, p3);
      const { minAngle, maxAngle } = rule.params;

      if ((minAngle && angle < minAngle) || (maxAngle && angle > maxAngle)) {
        return {
          type: getIssueTypeFromRule(rule.id),
          severity: rule.severity,
          description: rule.message,
          fix: rule.fix,
          affectedJoints: rule.joints,
        };
      }
      break;
    }

    case 'alignment': {
      // Check if joints are aligned (e.g., shoulder-elbow-wrist)
      if (rule.joints.length < 2) return null;

      const points = rule.joints.map(j => getKeypoint(keypoints, j)).filter(Boolean);
      if (points.length < 2) return null;

      // Check deviation from straight line
      // Simplified: just check x-axis alignment
      const tolerance = rule.params.tolerance || 20;
      const xValues = points.map(p => p!.x);
      const xRange = Math.max(...xValues) - Math.min(...xValues);

      if (xRange > tolerance) {
        return {
          type: getIssueTypeFromRule(rule.id),
          severity: rule.severity,
          description: rule.message,
          fix: rule.fix,
          affectedJoints: rule.joints,
        };
      }
      break;
    }

    case 'symmetry': {
      // Compare left and right side
      const threshold = rule.params.symmetryThreshold || 15;
      const symmetry = analyzeSymmetry(keypoints);

      if (symmetry.difference > threshold) {
        return {
          type: FormIssueType.ASYMMETRIC_MOTION,
          severity: rule.severity,
          description: rule.message,
          fix: rule.fix,
          affectedJoints: rule.joints,
        };
      }
      break;
    }

    case 'velocity': {
      // Check if movement is too fast
      const maxVelocity = rule.params.maxVelocity || 500;
      // Would need velocity tracking - simplified here
      break;
    }
  }

  return null;
};

const getIssueTypeFromRule = (ruleId: string): FormIssueType => {
  const mapping: Record<string, FormIssueType> = {
    'back_position': FormIssueType.BACK_ROUNDED,
    'knee_valgus': FormIssueType.KNEES_CAVING,
    'elbow_flare': FormIssueType.ELBOW_FLARE,
    'stance': FormIssueType.STANCE_TOO_NARROW,
    'asymmetry': FormIssueType.ASYMMETRIC_MOTION,
    'rom': FormIssueType.INCOMPLETE_ROM,
  };
  return mapping[ruleId] || FormIssueType.INCOMPLETE_ROM;
};

// ============================================================================
// SYMMETRY ANALYSIS
// ============================================================================

/**
 * Analyze left/right body symmetry
 */
export const analyzeSymmetry = (keypoints: PoseKeypoint[]): SymmetryAnalysis => {
  // Compare key joint pairs
  const pairs: [PoseLandmark, PoseLandmark][] = [
    [PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],
    [PoseLandmark.LEFT_ELBOW, PoseLandmark.RIGHT_ELBOW],
    [PoseLandmark.LEFT_WRIST, PoseLandmark.RIGHT_WRIST],
    [PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],
    [PoseLandmark.LEFT_KNEE, PoseLandmark.RIGHT_KNEE],
    [PoseLandmark.LEFT_ANKLE, PoseLandmark.RIGHT_ANKLE],
  ];

  let leftScore = 0;
  let rightScore = 0;
  let validPairs = 0;

  for (const [leftLandmark, rightLandmark] of pairs) {
    const left = getKeypoint(keypoints, leftLandmark);
    const right = getKeypoint(keypoints, rightLandmark);

    if (left && right && left.visibility > 0.5 && right.visibility > 0.5) {
      // Compare y-positions (should be similar for symmetry)
      const yDiff = Math.abs(left.y - right.y);
      leftScore += left.y < right.y ? 1 : 0;
      rightScore += right.y < left.y ? 1 : 0;
      validPairs++;
    }
  }

  const difference = Math.abs(leftScore - rightScore) / Math.max(validPairs, 1) * 100;

  return {
    leftScore: (leftScore / validPairs) * 100,
    rightScore: (rightScore / validPairs) * 100,
    difference,
    isBalanced: difference < 15,
    dominantSide: difference < 15 ? 'balanced' : (leftScore > rightScore ? 'left' : 'right'),
  };
};

// ============================================================================
// SCORING SYSTEM
// ============================================================================

/**
 * Calculate set score based on multiple factors
 */
export const calculateSetScore = (
  reps: number,
  validReps: number,
  formAnalyses: FormAnalysis[],
  symmetryAnalyses: SymmetryAnalysis[],
  tempoScores: number[]
): SetScore => {
  // Form score: average of all form analyses
  const formScore = formAnalyses.length > 0
    ? formAnalyses.reduce((sum, fa) => sum + fa.score, 0) / formAnalyses.length
    : 100;

  // ROM score: percentage of valid reps
  const romScore = reps > 0 ? (validReps / reps) * 100 : 100;

  // Symmetry score: average balance
  const symmetryScore = symmetryAnalyses.length > 0
    ? symmetryAnalyses.reduce((sum, sa) => sum + (sa.isBalanced ? 100 : 100 - sa.difference), 0) / symmetryAnalyses.length
    : 100;

  // Tempo score: consistency of movement speed
  const tempoScore = tempoScores.length > 0
    ? tempoScores.reduce((sum, t) => sum + t, 0) / tempoScores.length
    : 100;

  // Overall score: weighted average
  const overall = (
    formScore * 0.40 +    // Form is most important
    romScore * 0.30 +     // ROM ensures full muscle activation
    tempoScore * 0.15 +   // Tempo for muscle time under tension
    symmetryScore * 0.15  // Symmetry for balanced development
  );

  return {
    overall: Math.round(overall),
    formScore: Math.round(formScore),
    romScore: Math.round(romScore),
    tempoScore: Math.round(tempoScore),
    symmetryScore: Math.round(symmetryScore),
    reps,
    validReps,
  };
};

// ============================================================================
// AI FEEDBACK GENERATION
// ============================================================================

const ENCOURAGEMENT_MESSAGES = [
  'Great form! Keep it up!',
  'Perfect rep!',
  'Youre crushing it!',
  'Excellent control!',
  'Thats the way!',
  'Strong work!',
];

const CELEBRATION_MESSAGES = [
  'Set complete! Amazing work!',
  'Crushed that set!',
  'New personal best!',
  'Youre on fire today!',
];

/**
 * Generate AI coach feedback based on current state
 */
export const generateFeedback = (
  formAnalysis: FormAnalysis,
  repCount: RepCount,
  isSetComplete: boolean
): AICoachFeedback => {
  const now = Date.now();

  // Priority 1: Form corrections
  if (formAnalysis.issues.length > 0) {
    const criticalIssue = formAnalysis.issues.find(i => i.severity === 'critical');
    if (criticalIssue) {
      return {
        message: criticalIssue.fix,
        type: 'warning',
        priority: 1,
        timestamp: now,
      };
    }

    const moderateIssue = formAnalysis.issues.find(i => i.severity === 'moderate');
    if (moderateIssue) {
      return {
        message: moderateIssue.fix,
        type: 'correction',
        priority: 2,
        timestamp: now,
      };
    }
  }

  // Priority 2: Set completion celebration
  if (isSetComplete) {
    return {
      message: CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)],
      type: 'celebration',
      priority: 2,
      timestamp: now,
    };
  }

  // Priority 3: Encouragement for good form
  if (formAnalysis.isCorrect && repCount.total > 0 && repCount.total % 3 === 0) {
    return {
      message: ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)],
      type: 'encouragement',
      priority: 3,
      timestamp: now,
    };
  }

  return {
    message: '',
    type: 'encouragement',
    priority: 4,
    timestamp: now,
  };
};

// ============================================================================
// EXERCISE-SPECIFIC CONFIGURATIONS
// ============================================================================

export const getExerciseConfig = (exercise: ExerciseDetail): ExerciseConfig => {
  // Generate exercise-specific configuration based on exercise type
  const configs: Record<string, Partial<ExerciseConfig>> = {
    'bicep-curls': {
      repCriteria: {
        primaryJoints: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
        startAngle: 160,
        endAngle: 40,
        returnThreshold: 15,
        minROM: 70,
      },
      formRules: [
        {
          id: 'elbow_position',
          name: 'Elbow Position',
          joints: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_HIP],
          condition: 'alignment',
          params: { tolerance: 30 },
          severity: 'moderate',
          message: 'Keep elbows pinned to your sides',
          fix: 'Lock your elbows at your sides - only your forearms should move',
        },
      ],
    },
    'barbell-squat': {
      repCriteria: {
        primaryJoints: [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
        startAngle: 170,
        endAngle: 70,
        returnThreshold: 20,
        minROM: 80,
      },
      formRules: [
        {
          id: 'knee_valgus',
          name: 'Knee Position',
          joints: [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
          condition: 'alignment',
          params: { tolerance: 25 },
          severity: 'critical',
          message: 'Knees are caving inward',
          fix: 'Push your knees out over your toes',
        },
        {
          id: 'depth',
          name: 'Squat Depth',
          joints: [PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
          condition: 'angle_range',
          params: { maxAngle: 100 },
          severity: 'moderate',
          message: 'Go deeper - hip crease below knee',
          fix: 'Lower until your hip crease is below your knee',
        },
      ],
    },
    'push-ups': {
      repCriteria: {
        primaryJoints: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
        startAngle: 170,
        endAngle: 80,
        returnThreshold: 15,
        minROM: 75,
      },
      formRules: [
        {
          id: 'hip_sag',
          name: 'Hip Position',
          joints: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_ANKLE],
          condition: 'angle_range',
          params: { minAngle: 160, maxAngle: 200 },
          severity: 'moderate',
          message: 'Keep your body in a straight line',
          fix: 'Engage your core and squeeze your glutes',
        },
      ],
    },
  };

  const defaultConfig: ExerciseConfig = {
    exerciseId: exercise.id,
    repCriteria: {
      primaryJoints: [PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
      startAngle: 160,
      endAngle: 60,
      returnThreshold: 15,
      minROM: 70,
    },
    formRules: [],
    targetSets: 3,
    targetReps: 10,
    restTime: exercise.restBetweenSets,
  };

  return {
    ...defaultConfig,
    ...configs[exercise.id],
  };
};

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

export const AI_COACH_TIPS = {
  loading: [
    'Ensure good lighting for best tracking',
    'Position camera at mid-body height',
    'Stand 6-8 feet from camera',
    'Wear fitted clothing for better detection',
  ],
  general: [
    'Focus on form over speed',
    'Breathe steadily throughout',
    'Full range of motion is key',
    'Control the eccentric (lowering) phase',
  ],
  recovery: [
    'Take rest days seriously',
    'Sleep 7-9 hours for optimal recovery',
    'Stay hydrated between sets',
    'Stretch after your workout',
  ],
};
