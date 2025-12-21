/**
 * AI Session Type Definitions
 * Types for AI-coached workout sessions, pose detection, and form analysis
 */

// Session states
export type AISessionState =
  | 'idle'
  | 'calibrating'
  | 'ready'
  | 'exercising'
  | 'resting'
  | 'paused'
  | 'completed'
  | 'error';

// Rep counting state machine phases
export type RepPhase =
  | 'waiting'
  | 'eccentric'
  | 'bottom'
  | 'concentric'
  | 'lockout';

// Pose keypoint names (MoveNet compatible)
export type KeypointName =
  | 'nose'
  | 'left_eye'
  | 'right_eye'
  | 'left_ear'
  | 'right_ear'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee'
  | 'left_ankle'
  | 'right_ankle';

// Single keypoint detection
export interface PoseKeypoint {
  name: KeypointName;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  score: number; // confidence 0-1
}

// Full pose detection result
export interface PoseDetectionResult {
  keypoints: PoseKeypoint[];
  score: number; // overall confidence
  timestamp: number;
}

// Pose data snapshot for history
export interface PoseDataSnapshot {
  timestamp: number;
  keypoints: PoseKeypoint[];
  repPhase: RepPhase;
  formScore: number;
  issues: string[];
}

// Joint angle calculation
export interface JointAngle {
  joint: KeypointName;
  angle: number; // degrees
  timestamp: number;
}

// Exercise-specific tracking config
export interface ExerciseTrackingConfig {
  exerciseId: string;
  exerciseName: string;
  primaryJoints: KeypointName[];
  secondaryJoints: KeypointName[];
  repDetection: RepDetectionConfig;
  formRules: FormRule[];
  targetROM: RangeOfMotion;
}

// Rep detection configuration
export interface RepDetectionConfig {
  trackingJoint: KeypointName;
  eccentricThreshold: number; // angle to enter eccentric
  bottomThreshold: number; // angle at bottom position
  concentricThreshold: number; // angle during concentric
  lockoutThreshold: number; // angle at lockout
  minRepDuration: number; // ms
  maxRepDuration: number; // ms
}

// Range of motion targets
export interface RangeOfMotion {
  minimum: number; // degrees
  optimal: number;
  maximum: number;
}

// Form analysis rule
export interface FormRule {
  id: string;
  name: string;
  description: string;
  check: FormCheckType;
  severity: 'info' | 'warning' | 'error';
  joints: KeypointName[];
  thresholds: FormThresholds;
  feedback: FormFeedback;
}

export type FormCheckType =
  | 'angle_range'
  | 'symmetry'
  | 'alignment'
  | 'stability'
  | 'tempo';

export interface FormThresholds {
  warning: number;
  error: number;
  unit?: 'degrees' | 'ratio' | 'seconds';
}

export interface FormFeedback {
  issue: string;
  correction: string;
  audioKey?: string;
}

// Real-time form issue
export interface FormIssue {
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  correction: string;
  detectedAt: number;
  resolvedAt?: number;
  affectedJoints: KeypointName[];
}

// Form issue summary for persistence
export interface FormIssueSummary {
  issue: string;
  count: number;
  avgDuration: number; // ms
  firstOccurrence: number;
  lastOccurrence: number;
}

// Set data for AI session
export interface AISetData {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  startTime: number;
  endTime: number | null;
  duration: number; // seconds
  formScore: number;
  avgTempo: number; // seconds per rep
  issues: FormIssue[];
  repData: RepData[];
  poseSnapshots: PoseDataSnapshot[];
}

// Individual rep data
export interface RepData {
  repNumber: number;
  startTime: number;
  endTime: number;
  duration: number; // ms
  eccentricDuration: number;
  concentricDuration: number;
  bottomHoldDuration: number;
  formScore: number;
  peakAngle: number;
  minAngle: number;
  rangeOfMotion: number;
  issues: string[];
}

// Persisted AI set data (simplified for storage)
export interface AISetDataPersisted {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  duration: number;
  formScore: number;
  avgTempo: number;
  issues: FormIssueSummary[];
}

// AI workout session (real-time)
export interface AIWorkoutSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  userId: string;
  state: AISessionState;
  startTime: number;
  currentSet: number;
  targetSets: number;
  restDuration: number; // seconds

  // Current set tracking
  currentReps: number;
  currentFormScore: number;
  currentPhase: RepPhase;
  currentPose: PoseDetectionResult | null;

  // Accumulated data
  sets: AISetData[];
  totalReps: number;
  avgFormScore: number;

  // Feedback
  activeFeedback: FormIssue[];
  feedbackHistory: FormIssue[];

  // Camera & detection
  isCameraReady: boolean;
  isDetectionActive: boolean;
  detectionFPS: number;

  // Calibration
  isCalibrated: boolean;
  calibrationData: CalibrationData | null;
}

// Calibration data
export interface CalibrationData {
  userHeight: number | null;
  cameraDistance: number | null;
  baselineAngles: Record<KeypointName, number>;
  timestamp: number;
}

// Persisted AI workout session
export interface AIWorkoutSessionPersisted {
  id: string;
  exerciseId: string;
  exerciseName: string;
  userId: string;
  startTime: string; // ISO date
  endTime: string; // ISO date
  duration: number; // seconds

  // Summary
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  avgFormScore: number;
  overallScore: number; // 0-100

  // Set data
  sets: AISetDataPersisted[];

  // Form summary
  formSummary: {
    avgScore: number;
    bestSetScore: number;
    worstSetScore: number;
    commonIssues: FormIssueSummary[];
    improvements: string[];
  };

  // XP earned
  xpEarned: number;
  achievementsUnlocked: string[];

  // Metadata
  exerciseConfig: ExerciseTrackingConfig | null;
}

// Session completion result
export interface AISessionCompletionResult {
  session: AIWorkoutSessionPersisted;
  xpAwarded: number;
  achievements: string[];
  personalRecords: string[];
  insights: string[];
  nextWorkoutSuggestion?: string;
}

// Audio feedback types
export type AudioFeedbackType =
  | 'rep_counted'
  | 'set_complete'
  | 'form_warning'
  | 'form_error'
  | 'encouragement'
  | 'rest_over'
  | 'session_complete';

// Audio feedback event
export interface AudioFeedbackEvent {
  type: AudioFeedbackType;
  message: string;
  priority: number; // higher = more important
  timestamp: number;
}

// Exercise tracking presets
export const EXERCISE_TRACKING_PRESETS: Record<string, Partial<RepDetectionConfig>> = {
  bicep_curl: {
    trackingJoint: 'right_elbow',
    eccentricThreshold: 150,
    bottomThreshold: 170,
    concentricThreshold: 90,
    lockoutThreshold: 50,
    minRepDuration: 1000,
    maxRepDuration: 6000,
  },
  squat: {
    trackingJoint: 'right_knee',
    eccentricThreshold: 160,
    bottomThreshold: 100,
    concentricThreshold: 140,
    lockoutThreshold: 170,
    minRepDuration: 1500,
    maxRepDuration: 8000,
  },
  push_up: {
    trackingJoint: 'right_elbow',
    eccentricThreshold: 150,
    bottomThreshold: 90,
    concentricThreshold: 130,
    lockoutThreshold: 160,
    minRepDuration: 1000,
    maxRepDuration: 5000,
  },
  shoulder_press: {
    trackingJoint: 'right_elbow',
    eccentricThreshold: 100,
    bottomThreshold: 90,
    concentricThreshold: 140,
    lockoutThreshold: 170,
    minRepDuration: 1500,
    maxRepDuration: 6000,
  },
  deadlift: {
    trackingJoint: 'right_hip',
    eccentricThreshold: 160,
    bottomThreshold: 90,
    concentricThreshold: 140,
    lockoutThreshold: 175,
    minRepDuration: 2000,
    maxRepDuration: 8000,
  },
  lat_pulldown: {
    trackingJoint: 'right_elbow',
    eccentricThreshold: 150,
    bottomThreshold: 60,
    concentricThreshold: 120,
    lockoutThreshold: 160,
    minRepDuration: 1500,
    maxRepDuration: 6000,
  },
};

// Common form rules
export const COMMON_FORM_RULES: FormRule[] = [
  {
    id: 'spine_neutral',
    name: 'Spine Neutrality',
    description: 'Keep your spine in a neutral position',
    check: 'alignment',
    severity: 'warning',
    joints: ['left_shoulder', 'left_hip', 'left_knee'],
    thresholds: { warning: 15, error: 25, unit: 'degrees' },
    feedback: {
      issue: 'Spine rounding detected',
      correction: 'Keep your back straight and core engaged',
    },
  },
  {
    id: 'knee_tracking',
    name: 'Knee Tracking',
    description: 'Knees should track over toes',
    check: 'alignment',
    severity: 'warning',
    joints: ['left_knee', 'left_ankle'],
    thresholds: { warning: 10, error: 20, unit: 'degrees' },
    feedback: {
      issue: 'Knee caving inward',
      correction: 'Push your knees out in line with your toes',
    },
  },
  {
    id: 'bilateral_symmetry',
    name: 'Bilateral Symmetry',
    description: 'Both sides should move equally',
    check: 'symmetry',
    severity: 'info',
    joints: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'],
    thresholds: { warning: 0.1, error: 0.2, unit: 'ratio' },
    feedback: {
      issue: 'Asymmetric movement detected',
      correction: 'Focus on moving both sides equally',
    },
  },
  {
    id: 'rep_tempo',
    name: 'Rep Tempo',
    description: 'Maintain consistent tempo',
    check: 'tempo',
    severity: 'info',
    joints: [],
    thresholds: { warning: 1.5, error: 3, unit: 'seconds' },
    feedback: {
      issue: 'Inconsistent rep speed',
      correction: 'Control the weight through the full range of motion',
    },
  },
];
