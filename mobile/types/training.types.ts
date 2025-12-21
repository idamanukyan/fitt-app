/**
 * Training Types - Extended Exercise and AI Coach Types
 * Production-ready type definitions for the training system
 */

import { MuscleGroup, Equipment, DifficultyLevel, ExerciseType } from './workout.types';

// ============================================================================
// EXTENDED EXERCISE TYPES
// ============================================================================

export interface ExerciseDetail {
  id: string;
  name: string;
  slug: string;
  category: MuscleGroup;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: Equipment[];
  difficulty: DifficultyLevel;
  exerciseType: ExerciseType;
  gifUrl: string;
  thumbnailUrl: string;
  videoUrl?: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  aiKeypoints: AIKeypoint[];
  isCompound: boolean;
  isUnilateral: boolean;
  estimatedCaloriesPerMinute: number;
  restBetweenSets: number; // seconds
  tags: string[];
}

export interface AIKeypoint {
  joint: string;
  landmark: PoseLandmark;
  description: string;
  minAngle?: number;
  maxAngle?: number;
  idealAngle?: number;
}

// MediaPipe Pose Landmarks
export enum PoseLandmark {
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

// ============================================================================
// AI COACH TYPES
// ============================================================================

export interface PoseKeypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
  landmark: PoseLandmark;
}

export interface PoseData {
  keypoints: PoseKeypoint[];
  timestamp: number;
  confidence: number;
}

export interface RepState {
  phase: 'start' | 'eccentric' | 'concentric' | 'end';
  progress: number; // 0-100
  isValid: boolean;
}

export interface RepCount {
  total: number;
  valid: number;
  invalid: number;
  currentSet: number;
}

export interface FormAnalysis {
  isCorrect: boolean;
  score: number; // 0-100
  issues: FormIssue[];
  suggestions: string[];
}

export interface FormIssue {
  type: FormIssueType;
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
  fix: string;
  affectedJoints: PoseLandmark[];
}

export enum FormIssueType {
  BACK_ROUNDED = 'back_rounded',
  BACK_HYPEREXTENDED = 'back_hyperextended',
  KNEES_CAVING = 'knees_caving',
  KNEES_OVER_TOES = 'knees_over_toes',
  STANCE_TOO_NARROW = 'stance_too_narrow',
  STANCE_TOO_WIDE = 'stance_too_wide',
  ASYMMETRIC_MOTION = 'asymmetric_motion',
  INCOMPLETE_ROM = 'incomplete_rom',
  TOO_FAST = 'too_fast',
  ELBOW_FLARE = 'elbow_flare',
  HEAD_POSITION = 'head_position',
  WRIST_ALIGNMENT = 'wrist_alignment',
  HIP_SHIFT = 'hip_shift',
  SHOULDER_SHRUG = 'shoulder_shrug',
}

export interface RangeOfMotion {
  current: number; // degrees
  target: number; // degrees
  percentage: number; // 0-100
  isComplete: boolean;
}

export interface SymmetryAnalysis {
  leftScore: number;
  rightScore: number;
  difference: number;
  isBalanced: boolean;
  dominantSide: 'left' | 'right' | 'balanced';
}

export interface SetScore {
  overall: number; // 0-100
  formScore: number;
  romScore: number;
  tempoScore: number;
  symmetryScore: number;
  reps: number;
  validReps: number;
}

export interface AICoachFeedback {
  message: string;
  type: 'encouragement' | 'correction' | 'warning' | 'celebration';
  priority: number;
  timestamp: number;
}

export interface ExerciseConfig {
  exerciseId: string;
  repCriteria: RepCriteria;
  formRules: FormRule[];
  targetSets: number;
  targetReps: number;
  restTime: number;
}

export interface RepCriteria {
  primaryJoints: PoseLandmark[];
  startAngle: number;
  endAngle: number;
  returnThreshold: number;
  minROM: number; // Minimum range of motion percentage required
}

export interface FormRule {
  id: string;
  name: string;
  joints: PoseLandmark[];
  condition: 'angle_range' | 'alignment' | 'symmetry' | 'velocity';
  params: FormRuleParams;
  severity: 'minor' | 'moderate' | 'critical';
  message: string;
  fix: string;
}

export interface FormRuleParams {
  minAngle?: number;
  maxAngle?: number;
  tolerance?: number;
  maxVelocity?: number;
  symmetryThreshold?: number;
}

// ============================================================================
// WORKOUT SESSION TYPES
// ============================================================================

export interface AIWorkoutSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  startTime: number;
  endTime?: number;
  sets: AISetData[];
  currentSet: number;
  isActive: boolean;
  totalScore: number;
  feedback: AICoachFeedback[];
}

export interface AISetData {
  setNumber: number;
  reps: number;
  validReps: number;
  score: SetScore;
  formIssues: FormIssue[];
  duration: number;
  restTime: number;
  startTime: number;
  endTime?: number;
}

// ============================================================================
// TRAINING HISTORY TYPES
// ============================================================================

export interface TrainingHistoryEntry {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  aiScore: number;
  formScore: number;
  duration: number;
  calories: number;
  notes?: string;
  personalRecord: boolean;
}

export interface PerformanceCorrelation {
  sleepScore: number | null;
  energyLevel: number | null;
  performanceScore: number;
  date: string;
}

// ============================================================================
// MY WORKOUTS TYPES
// ============================================================================

export interface SavedWorkout {
  id: string;
  name: string;
  description?: string;
  exercises: SavedWorkoutExercise[];
  scheduledDay?: DayOfWeek;
  lastCompleted?: string;
  timesCompleted: number;
  averageScore: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedWorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  restTime: number;
  notes?: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// ============================================================================
// CATEGORY FILTER TYPES
// ============================================================================

export interface CategoryFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
  muscleGroup?: MuscleGroup;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: 'all', name: 'All', icon: 'apps', color: '#4ADE80' },
  { id: 'chest', name: 'Chest', icon: 'body', color: '#60A5FA' },
  { id: 'back', name: 'Back', icon: 'body', color: '#A78BFA' },
  { id: 'shoulders', name: 'Shoulders', icon: 'body', color: '#FB923C' },
  { id: 'legs', name: 'Legs', icon: 'body', color: '#F472B6' },
  { id: 'arms', name: 'Arms', icon: 'body', color: '#22D3EE' },
  { id: 'abs', name: 'Core', icon: 'body', color: '#FBBF24' },
  { id: 'cardio', name: 'Cardio', icon: 'heart', color: '#F87171' },
];
