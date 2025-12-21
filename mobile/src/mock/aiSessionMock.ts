/**
 * AI Session Mock Data
 * Sample data for AI-coached workout sessions, pose detection, and form analysis
 */

import type {
  AIWorkoutSessionPersisted,
  AISetDataPersisted,
  FormIssueSummary,
  ExerciseTrackingConfig,
  FormRule,
  PoseKeypoint,
  PoseDetectionResult,
  RepData,
} from '../types/ai-session.types';
import { EXERCISE_TRACKING_PRESETS, COMMON_FORM_RULES } from '../types/ai-session.types';

// Generate dates
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Mock persisted AI sessions
export const mockAISessions: AIWorkoutSessionPersisted[] = [
  {
    id: 'ai-session-1',
    exerciseId: 'bicep-curl',
    exerciseName: 'Bicep Curl',
    userId: 'user-123',
    startTime: getDateString(0),
    endTime: getDateString(0),
    duration: 480, // 8 minutes

    totalSets: 3,
    totalReps: 30,
    totalVolume: 450, // 15kg x 30 reps
    avgFormScore: 88,
    overallScore: 85,

    sets: [
      {
        setNumber: 1,
        targetReps: 10,
        actualReps: 10,
        weight: 15,
        duration: 45,
        formScore: 85,
        avgTempo: 3.5,
        issues: [
          { issue: 'Slight elbow drift', count: 2, avgDuration: 800, firstOccurrence: 5000, lastOccurrence: 35000 },
        ],
      },
      {
        setNumber: 2,
        targetReps: 10,
        actualReps: 10,
        weight: 15,
        duration: 48,
        formScore: 90,
        avgTempo: 3.8,
        issues: [],
      },
      {
        setNumber: 3,
        targetReps: 10,
        actualReps: 10,
        weight: 15,
        duration: 52,
        formScore: 88,
        avgTempo: 4.2,
        issues: [
          { issue: 'Rep tempo slowing', count: 3, avgDuration: 1200, firstOccurrence: 25000, lastOccurrence: 48000 },
        ],
      },
    ],

    formSummary: {
      avgScore: 88,
      bestSetScore: 90,
      worstSetScore: 85,
      commonIssues: [
        { issue: 'Slight elbow drift', count: 2, avgDuration: 800, firstOccurrence: 5000, lastOccurrence: 35000 },
        { issue: 'Rep tempo slowing', count: 3, avgDuration: 1200, firstOccurrence: 25000, lastOccurrence: 48000 },
      ],
      improvements: ['Controlled eccentric phase', 'Maintained neutral spine'],
    },

    xpEarned: 175, // 150 base + 25 for good form
    achievementsUnlocked: [],
    exerciseConfig: null,
  },
  {
    id: 'ai-session-2',
    exerciseId: 'squat',
    exerciseName: 'Barbell Squat',
    userId: 'user-123',
    startTime: getDateString(2),
    endTime: getDateString(2),
    duration: 720, // 12 minutes

    totalSets: 4,
    totalReps: 32,
    totalVolume: 3200, // 100kg x 32 reps
    avgFormScore: 75,
    overallScore: 72,

    sets: [
      {
        setNumber: 1,
        targetReps: 8,
        actualReps: 8,
        weight: 100,
        duration: 55,
        formScore: 78,
        avgTempo: 4.5,
        issues: [
          { issue: 'Slight knee cave', count: 2, avgDuration: 500, firstOccurrence: 15000, lastOccurrence: 45000 },
        ],
      },
      {
        setNumber: 2,
        targetReps: 8,
        actualReps: 8,
        weight: 100,
        duration: 58,
        formScore: 76,
        avgTempo: 4.8,
        issues: [
          { issue: 'Slight knee cave', count: 3, avgDuration: 600, firstOccurrence: 10000, lastOccurrence: 50000 },
        ],
      },
      {
        setNumber: 3,
        targetReps: 8,
        actualReps: 8,
        weight: 100,
        duration: 62,
        formScore: 72,
        avgTempo: 5.2,
        issues: [
          { issue: 'Forward lean', count: 4, avgDuration: 700, firstOccurrence: 8000, lastOccurrence: 55000 },
          { issue: 'Slight knee cave', count: 2, avgDuration: 500, firstOccurrence: 20000, lastOccurrence: 40000 },
        ],
      },
      {
        setNumber: 4,
        targetReps: 8,
        actualReps: 8,
        weight: 100,
        duration: 65,
        formScore: 74,
        avgTempo: 5.5,
        issues: [
          { issue: 'Forward lean', count: 3, avgDuration: 600, firstOccurrence: 12000, lastOccurrence: 58000 },
        ],
      },
    ],

    formSummary: {
      avgScore: 75,
      bestSetScore: 78,
      worstSetScore: 72,
      commonIssues: [
        { issue: 'Slight knee cave', count: 7, avgDuration: 550, firstOccurrence: 10000, lastOccurrence: 50000 },
        { issue: 'Forward lean', count: 7, avgDuration: 650, firstOccurrence: 8000, lastOccurrence: 58000 },
      ],
      improvements: ['Good depth achieved', 'Consistent tempo'],
    },

    xpEarned: 150,
    achievementsUnlocked: [],
    exerciseConfig: null,
  },
  {
    id: 'ai-session-3',
    exerciseId: 'push-up',
    exerciseName: 'Push-up',
    userId: 'user-123',
    startTime: getDateString(5),
    endTime: getDateString(5),
    duration: 420, // 7 minutes

    totalSets: 3,
    totalReps: 45,
    totalVolume: 0, // bodyweight
    avgFormScore: 92,
    overallScore: 90,

    sets: [
      {
        setNumber: 1,
        targetReps: 15,
        actualReps: 15,
        weight: 0,
        duration: 42,
        formScore: 94,
        avgTempo: 2.8,
        issues: [],
      },
      {
        setNumber: 2,
        targetReps: 15,
        actualReps: 15,
        weight: 0,
        duration: 45,
        formScore: 92,
        avgTempo: 3.0,
        issues: [],
      },
      {
        setNumber: 3,
        targetReps: 15,
        actualReps: 15,
        weight: 0,
        duration: 50,
        formScore: 90,
        avgTempo: 3.3,
        issues: [
          { issue: 'Hip sag', count: 2, avgDuration: 400, firstOccurrence: 35000, lastOccurrence: 45000 },
        ],
      },
    ],

    formSummary: {
      avgScore: 92,
      bestSetScore: 94,
      worstSetScore: 90,
      commonIssues: [
        { issue: 'Hip sag', count: 2, avgDuration: 400, firstOccurrence: 35000, lastOccurrence: 45000 },
      ],
      improvements: ['Excellent elbow tracking', 'Full range of motion', 'Strong core engagement'],
    },

    xpEarned: 200, // 150 base + 50 for excellent form
    achievementsUnlocked: ['ach-perfect-set'],
    exerciseConfig: null,
  },
];

// Mock exercise tracking configs
export const mockExerciseTrackingConfigs: Record<string, ExerciseTrackingConfig> = {
  'bicep-curl': {
    exerciseId: 'bicep-curl',
    exerciseName: 'Bicep Curl',
    primaryJoints: ['right_elbow', 'left_elbow'],
    secondaryJoints: ['right_shoulder', 'left_shoulder', 'right_wrist', 'left_wrist'],
    repDetection: {
      trackingJoint: 'right_elbow',
      eccentricThreshold: 150,
      bottomThreshold: 170,
      concentricThreshold: 90,
      lockoutThreshold: 50,
      minRepDuration: 1000,
      maxRepDuration: 6000,
    },
    formRules: [
      {
        id: 'elbow-position',
        name: 'Elbow Position',
        description: 'Keep elbows pinned to your sides',
        check: 'alignment',
        severity: 'warning',
        joints: ['right_elbow', 'right_hip'],
        thresholds: { warning: 15, error: 25, unit: 'degrees' },
        feedback: {
          issue: 'Elbow drifting forward',
          correction: 'Keep your elbows pinned to your sides',
        },
      },
      {
        id: 'wrist-neutral',
        name: 'Wrist Position',
        description: 'Keep wrists neutral, not flexed',
        check: 'alignment',
        severity: 'info',
        joints: ['right_wrist', 'right_elbow'],
        thresholds: { warning: 20, error: 35, unit: 'degrees' },
        feedback: {
          issue: 'Wrist curling',
          correction: 'Keep your wrists straight',
        },
      },
      ...COMMON_FORM_RULES.filter(r => r.id === 'bilateral_symmetry' || r.id === 'rep_tempo'),
    ],
    targetROM: {
      minimum: 100,
      optimal: 120,
      maximum: 140,
    },
  },
  'squat': {
    exerciseId: 'squat',
    exerciseName: 'Barbell Squat',
    primaryJoints: ['right_knee', 'left_knee', 'right_hip', 'left_hip'],
    secondaryJoints: ['right_ankle', 'left_ankle', 'right_shoulder', 'left_shoulder'],
    repDetection: EXERCISE_TRACKING_PRESETS.squat as any,
    formRules: [
      {
        id: 'knee-tracking',
        name: 'Knee Tracking',
        description: 'Knees should track over toes',
        check: 'alignment',
        severity: 'warning',
        joints: ['right_knee', 'right_ankle'],
        thresholds: { warning: 10, error: 20, unit: 'degrees' },
        feedback: {
          issue: 'Knee caving inward',
          correction: 'Push your knees out in line with your toes',
        },
      },
      {
        id: 'depth',
        name: 'Squat Depth',
        description: 'Hip crease should go below knee',
        check: 'angle_range',
        severity: 'info',
        joints: ['right_hip', 'right_knee'],
        thresholds: { warning: 90, error: 110, unit: 'degrees' },
        feedback: {
          issue: 'Not hitting depth',
          correction: 'Go deeper until hip crease is below knee level',
        },
      },
      ...COMMON_FORM_RULES.filter(r => r.id === 'spine_neutral' || r.id === 'bilateral_symmetry'),
    ],
    targetROM: {
      minimum: 80,
      optimal: 100,
      maximum: 120,
    },
  },
};

// Sample pose detection result
export const mockPoseDetectionResult: PoseDetectionResult = {
  keypoints: [
    { name: 'nose', x: 0.5, y: 0.15, score: 0.95 },
    { name: 'left_eye', x: 0.48, y: 0.13, score: 0.92 },
    { name: 'right_eye', x: 0.52, y: 0.13, score: 0.93 },
    { name: 'left_ear', x: 0.45, y: 0.14, score: 0.88 },
    { name: 'right_ear', x: 0.55, y: 0.14, score: 0.87 },
    { name: 'left_shoulder', x: 0.4, y: 0.28, score: 0.95 },
    { name: 'right_shoulder', x: 0.6, y: 0.28, score: 0.96 },
    { name: 'left_elbow', x: 0.35, y: 0.42, score: 0.92 },
    { name: 'right_elbow', x: 0.65, y: 0.42, score: 0.93 },
    { name: 'left_wrist', x: 0.38, y: 0.55, score: 0.88 },
    { name: 'right_wrist', x: 0.62, y: 0.55, score: 0.89 },
    { name: 'left_hip', x: 0.42, y: 0.55, score: 0.94 },
    { name: 'right_hip', x: 0.58, y: 0.55, score: 0.95 },
    { name: 'left_knee', x: 0.4, y: 0.72, score: 0.91 },
    { name: 'right_knee', x: 0.6, y: 0.72, score: 0.92 },
    { name: 'left_ankle', x: 0.4, y: 0.88, score: 0.87 },
    { name: 'right_ankle', x: 0.6, y: 0.88, score: 0.88 },
  ],
  score: 0.91,
  timestamp: Date.now(),
};

// Sample rep data
export const mockRepData: RepData[] = [
  {
    repNumber: 1,
    startTime: 0,
    endTime: 3500,
    duration: 3500,
    eccentricDuration: 1500,
    concentricDuration: 1200,
    bottomHoldDuration: 800,
    formScore: 92,
    peakAngle: 45,
    minAngle: 170,
    rangeOfMotion: 125,
    issues: [],
  },
  {
    repNumber: 2,
    startTime: 3500,
    endTime: 7200,
    duration: 3700,
    eccentricDuration: 1600,
    concentricDuration: 1300,
    bottomHoldDuration: 800,
    formScore: 88,
    peakAngle: 48,
    minAngle: 168,
    rangeOfMotion: 120,
    issues: ['Slight elbow drift'],
  },
  {
    repNumber: 3,
    startTime: 7200,
    endTime: 11000,
    duration: 3800,
    eccentricDuration: 1700,
    concentricDuration: 1400,
    bottomHoldDuration: 700,
    formScore: 90,
    peakAngle: 46,
    minAngle: 172,
    rangeOfMotion: 126,
    issues: [],
  },
];

// AI session history summary
export const mockAISessionHistory = {
  totalSessions: 12,
  totalDuration: 5400, // 90 minutes
  avgFormScore: 82,
  formScoreImprovement: 12, // % improvement from first session
  mostPracticedExercise: 'Bicep Curl',
  sessionsThisWeek: 3,
  lastSessionDate: getDateString(0),
  exerciseBreakdown: [
    { exerciseId: 'bicep-curl', exerciseName: 'Bicep Curl', sessions: 5, avgScore: 86 },
    { exerciseId: 'squat', exerciseName: 'Barbell Squat', sessions: 4, avgScore: 75 },
    { exerciseId: 'push-up', exerciseName: 'Push-up', sessions: 3, avgScore: 90 },
  ],
};

// Export all mock AI session data
export const aiSessionData = {
  sessions: mockAISessions,
  trackingConfigs: mockExerciseTrackingConfigs,
  samplePose: mockPoseDetectionResult,
  sampleReps: mockRepData,
  history: mockAISessionHistory,
};

export default aiSessionData;
