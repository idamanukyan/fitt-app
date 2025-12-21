/**
 * Rep Counting Service
 * State machine for counting exercise repetitions based on pose data
 */

import type {
  RepPhase,
  RepData,
  PoseDetectionResult,
  KeypointName,
  RepDetectionConfig,
} from '../types/ai-session.types';
import {
  getKeypoint,
  calculateAngle,
  isKeypointVisible,
} from './poseDetectionService';

// State machine for rep phases
interface RepState {
  currentPhase: RepPhase;
  repStartTime: number | null;
  phaseStartTime: number;
  eccentricStartTime: number | null;
  bottomTime: number | null;
  concentricStartTime: number | null;
  peakAngle: number;
  minAngle: number;
  angleHistory: number[];
  formIssues: string[];
}

// Default rep counting state
const createInitialState = (): RepState => ({
  currentPhase: 'waiting',
  repStartTime: null,
  phaseStartTime: Date.now(),
  eccentricStartTime: null,
  bottomTime: null,
  concentricStartTime: null,
  peakAngle: 0,
  minAngle: 180,
  angleHistory: [],
  formIssues: [],
});

// Service state
let state: RepState = createInitialState();
let config: RepDetectionConfig | null = null;
let currentRep = 0;
let totalReps = 0;
let repHistory: RepData[] = [];

// Callbacks
type RepCallback = (rep: RepData) => void;
type PhaseCallback = (phase: RepPhase, angle: number) => void;
let onRepComplete: RepCallback | null = null;
let onPhaseChange: PhaseCallback | null = null;

/**
 * Initialize rep counting for an exercise
 */
export function initialize(
  exerciseConfig: RepDetectionConfig,
  callbacks?: {
    onRepComplete?: RepCallback;
    onPhaseChange?: PhaseCallback;
  }
): void {
  config = exerciseConfig;
  state = createInitialState();
  currentRep = 0;
  totalReps = 0;
  repHistory = [];

  if (callbacks) {
    onRepComplete = callbacks.onRepComplete || null;
    onPhaseChange = callbacks.onPhaseChange || null;
  }

  console.log('[RepCounting] Initialized for', exerciseConfig.trackingJoint);
}

/**
 * Process a pose and update rep count
 * Returns current rep count and phase info
 */
export function processPose(
  pose: PoseDetectionResult
): {
  repCount: number;
  currentPhase: RepPhase;
  currentAngle: number;
  isNewRep: boolean;
  formIssues: string[];
} {
  if (!config) {
    return {
      repCount: totalReps,
      currentPhase: 'waiting',
      currentAngle: 0,
      isNewRep: false,
      formIssues: [],
    };
  }

  // Get tracking joint angle
  const angle = getTrackingAngle(pose);
  if (angle === null) {
    return {
      repCount: totalReps,
      currentPhase: state.currentPhase,
      currentAngle: 0,
      isNewRep: false,
      formIssues: [],
    };
  }

  // Update angle tracking
  state.angleHistory.push(angle);
  if (state.angleHistory.length > 30) {
    state.angleHistory.shift();
  }
  state.peakAngle = Math.max(state.peakAngle, angle);
  state.minAngle = Math.min(state.minAngle, angle);

  // Process state machine
  const previousPhase = state.currentPhase;
  const isNewRep = processStateMachine(angle);

  // Notify phase change
  if (state.currentPhase !== previousPhase && onPhaseChange) {
    onPhaseChange(state.currentPhase, angle);
  }

  return {
    repCount: totalReps,
    currentPhase: state.currentPhase,
    currentAngle: angle,
    isNewRep,
    formIssues: [...state.formIssues],
  };
}

/**
 * Get tracking angle from pose based on config
 */
function getTrackingAngle(pose: PoseDetectionResult): number | null {
  if (!config) return null;

  const trackingJoint = config.trackingJoint;

  // Define joint triplets for angle calculation
  const jointTriplets: Record<KeypointName, [KeypointName, KeypointName, KeypointName]> = {
    right_elbow: ['right_shoulder', 'right_elbow', 'right_wrist'],
    left_elbow: ['left_shoulder', 'left_elbow', 'left_wrist'],
    right_knee: ['right_hip', 'right_knee', 'right_ankle'],
    left_knee: ['left_hip', 'left_knee', 'left_ankle'],
    right_hip: ['right_shoulder', 'right_hip', 'right_knee'],
    left_hip: ['left_shoulder', 'left_hip', 'left_knee'],
    right_shoulder: ['right_elbow', 'right_shoulder', 'right_hip'],
    left_shoulder: ['left_elbow', 'left_shoulder', 'left_hip'],
    // Other joints default to null
    nose: ['left_eye', 'nose', 'right_eye'],
    left_eye: ['left_ear', 'left_eye', 'nose'],
    right_eye: ['nose', 'right_eye', 'right_ear'],
    left_ear: ['left_eye', 'left_ear', 'left_shoulder'],
    right_ear: ['right_eye', 'right_ear', 'right_shoulder'],
    left_wrist: ['left_elbow', 'left_wrist', 'left_hip'],
    right_wrist: ['right_elbow', 'right_wrist', 'right_hip'],
    left_ankle: ['left_knee', 'left_ankle', 'left_hip'],
    right_ankle: ['right_knee', 'right_ankle', 'right_hip'],
  };

  const triplet = jointTriplets[trackingJoint];
  if (!triplet) return null;

  const pointA = getKeypoint(pose, triplet[0]);
  const pointB = getKeypoint(pose, triplet[1]);
  const pointC = getKeypoint(pose, triplet[2]);

  if (
    !isKeypointVisible(pointA) ||
    !isKeypointVisible(pointB) ||
    !isKeypointVisible(pointC)
  ) {
    return null;
  }

  return calculateAngle(pointA!, pointB!, pointC!);
}

/**
 * Process state machine transitions
 * Returns true if a new rep was completed
 */
function processStateMachine(angle: number): boolean {
  if (!config) return false;

  const now = Date.now();
  let isNewRep = false;

  switch (state.currentPhase) {
    case 'waiting':
      // Wait for starting position (lockout)
      if (angle <= config.lockoutThreshold) {
        transitionTo('lockout', now);
      }
      break;

    case 'lockout':
      // Start eccentric when angle increases past threshold
      if (angle >= config.eccentricThreshold) {
        state.repStartTime = now;
        state.eccentricStartTime = now;
        state.peakAngle = angle;
        state.minAngle = angle;
        state.formIssues = [];
        transitionTo('eccentric', now);
      }
      break;

    case 'eccentric':
      // Track max angle, transition to bottom
      if (angle >= config.bottomThreshold) {
        state.bottomTime = now;
        transitionTo('bottom', now);
      }
      // Check for too fast eccentric
      if (now - (state.eccentricStartTime || now) < 500) {
        if (!state.formIssues.includes('Fast eccentric')) {
          state.formIssues.push('Fast eccentric');
        }
      }
      break;

    case 'bottom':
      // Start concentric when angle decreases
      if (angle <= config.concentricThreshold) {
        state.concentricStartTime = now;
        transitionTo('concentric', now);
      }
      // Penalize too long bottom hold (loss of tension)
      const bottomDuration = now - (state.bottomTime || now);
      if (bottomDuration > 2000) {
        if (!state.formIssues.includes('Lost tension at bottom')) {
          state.formIssues.push('Lost tension at bottom');
        }
      }
      break;

    case 'concentric':
      // Complete rep when back to lockout
      if (angle <= config.lockoutThreshold) {
        isNewRep = completeRep(now);
        transitionTo('lockout', now);
      }
      break;
  }

  return isNewRep;
}

/**
 * Transition to a new phase
 */
function transitionTo(newPhase: RepPhase, timestamp: number): void {
  state.currentPhase = newPhase;
  state.phaseStartTime = timestamp;
}

/**
 * Complete a rep and record data
 */
function completeRep(endTime: number): boolean {
  if (!state.repStartTime || !config) return false;

  const duration = endTime - state.repStartTime;

  // Validate rep duration
  if (duration < config.minRepDuration) {
    console.log('[RepCounting] Rep too fast, ignoring');
    return false;
  }
  if (duration > config.maxRepDuration) {
    console.log('[RepCounting] Rep too slow, ignoring');
    return false;
  }

  currentRep++;
  totalReps++;

  const repData: RepData = {
    repNumber: currentRep,
    startTime: state.repStartTime,
    endTime,
    duration,
    eccentricDuration: state.bottomTime
      ? state.bottomTime - (state.eccentricStartTime || state.repStartTime)
      : duration / 2,
    concentricDuration: state.concentricStartTime
      ? endTime - state.concentricStartTime
      : duration / 2,
    bottomHoldDuration: state.concentricStartTime && state.bottomTime
      ? state.concentricStartTime - state.bottomTime
      : 0,
    formScore: calculateRepFormScore(),
    peakAngle: state.peakAngle,
    minAngle: state.minAngle,
    rangeOfMotion: state.peakAngle - state.minAngle,
    issues: [...state.formIssues],
  };

  repHistory.push(repData);

  // Notify callback
  if (onRepComplete) {
    onRepComplete(repData);
  }

  // Reset for next rep
  state.repStartTime = null;
  state.eccentricStartTime = null;
  state.bottomTime = null;
  state.concentricStartTime = null;
  state.peakAngle = 0;
  state.minAngle = 180;
  state.formIssues = [];

  console.log(`[RepCounting] Rep ${currentRep} completed in ${duration}ms`);

  return true;
}

/**
 * Calculate form score for current rep
 */
function calculateRepFormScore(): number {
  let score = 100;

  // Deduct for each form issue
  score -= state.formIssues.length * 10;

  // Deduct for incomplete ROM (if config available)
  if (config) {
    const rom = state.peakAngle - state.minAngle;
    const expectedROM = config.bottomThreshold - config.lockoutThreshold;
    const romPercentage = rom / expectedROM;
    if (romPercentage < 0.8) {
      score -= (1 - romPercentage) * 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get current rep count
 */
export function getRepCount(): number {
  return totalReps;
}

/**
 * Get current phase
 */
export function getCurrentPhase(): RepPhase {
  return state.currentPhase;
}

/**
 * Get rep history
 */
export function getRepHistory(): RepData[] {
  return [...repHistory];
}

/**
 * Get last completed rep
 */
export function getLastRep(): RepData | null {
  return repHistory.length > 0 ? repHistory[repHistory.length - 1] : null;
}

/**
 * Get average rep data
 */
export function getAverageRepData(): {
  avgDuration: number;
  avgFormScore: number;
  avgROM: number;
} | null {
  if (repHistory.length === 0) return null;

  const sum = repHistory.reduce(
    (acc, rep) => ({
      duration: acc.duration + rep.duration,
      formScore: acc.formScore + rep.formScore,
      rom: acc.rom + rep.rangeOfMotion,
    }),
    { duration: 0, formScore: 0, rom: 0 }
  );

  return {
    avgDuration: sum.duration / repHistory.length,
    avgFormScore: sum.formScore / repHistory.length,
    avgROM: sum.rom / repHistory.length,
  };
}

/**
 * Reset for a new set
 */
export function resetForNewSet(): void {
  state = createInitialState();
  currentRep = 0;
  repHistory = [];
  console.log('[RepCounting] Reset for new set');
}

/**
 * Reset everything
 */
export function reset(): void {
  state = createInitialState();
  config = null;
  currentRep = 0;
  totalReps = 0;
  repHistory = [];
  onRepComplete = null;
  onPhaseChange = null;
  console.log('[RepCounting] Full reset');
}

export default {
  initialize,
  processPose,
  getRepCount,
  getCurrentPhase,
  getRepHistory,
  getLastRep,
  getAverageRepData,
  resetForNewSet,
  reset,
};
