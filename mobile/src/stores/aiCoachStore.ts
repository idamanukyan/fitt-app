/**
 * AI Coach Store
 * Zustand store for managing AI workout session state
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AIWorkoutSession,
  AIWorkoutSessionPersisted,
  AISetData,
  AISetDataPersisted,
  AISessionState,
  RepPhase,
  PoseDetectionResult,
  FormIssue,
  FormIssueSummary,
  ExerciseTrackingConfig,
  CalibrationData,
} from '../types/ai-session.types';
import { aiSessionData } from '../mock/aiSessionMock';

// Generate unique session ID
const generateSessionId = (): string => {
  return `ai-session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

// Convert form issues to summary
const summarizeFormIssues = (issues: FormIssue[]): FormIssueSummary[] => {
  const issueMap = new Map<string, FormIssueSummary>();

  for (const issue of issues) {
    const existing = issueMap.get(issue.message);
    if (existing) {
      existing.count++;
      existing.avgDuration =
        (existing.avgDuration * (existing.count - 1) +
          (issue.resolvedAt || issue.detectedAt) -
          issue.detectedAt) /
        existing.count;
      existing.lastOccurrence = issue.detectedAt;
    } else {
      issueMap.set(issue.message, {
        issue: issue.message,
        count: 1,
        avgDuration: 0,
        firstOccurrence: issue.detectedAt,
        lastOccurrence: issue.detectedAt,
      });
    }
  }

  return Array.from(issueMap.values());
};

// Store state interface
interface AICoachState {
  // Current session
  session: AIWorkoutSession | null;
  isSessionActive: boolean;

  // Session history
  sessionHistory: AIWorkoutSessionPersisted[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions - Session
  startSession: (
    exerciseId: string,
    exerciseName: string,
    config?: ExerciseTrackingConfig
  ) => void;
  endSession: () => Promise<AIWorkoutSessionPersisted | null>;
  pauseSession: () => void;
  resumeSession: () => void;

  // Actions - Set tracking
  startSet: (targetReps: number, weight: number) => void;
  endSet: () => void;
  updateReps: (repCount: number) => void;

  // Actions - Pose & Form
  updatePose: (pose: PoseDetectionResult) => void;
  updateFormScore: (score: number) => void;
  addFormIssue: (issue: FormIssue) => void;
  resolveFormIssue: (ruleId: string) => void;

  // Actions - Camera
  setCameraReady: (ready: boolean) => void;
  setDetectionActive: (active: boolean) => void;
  setCalibrationData: (data: CalibrationData) => void;

  // Actions - State
  setSessionState: (state: AISessionState) => void;
  setRepPhase: (phase: RepPhase) => void;

  // Actions - Data
  loadSessionHistory: () => Promise<void>;
  clearSessionHistory: () => Promise<void>;
}

// Create the store
export const useAICoachStore = create<AICoachState>((set, get) => ({
  // Initial state
  session: null,
  isSessionActive: false,
  sessionHistory: [],
  isLoading: false,
  error: null,

  // Start a new AI session
  startSession: (exerciseId, exerciseName, config) => {
    const session: AIWorkoutSession = {
      id: generateSessionId(),
      exerciseId,
      exerciseName,
      userId: 'user-123', // Would come from auth
      state: 'calibrating',
      startTime: Date.now(),
      currentSet: 0,
      targetSets: 3,
      restDuration: 90,

      currentReps: 0,
      currentFormScore: 100,
      currentPhase: 'waiting',
      currentPose: null,

      sets: [],
      totalReps: 0,
      avgFormScore: 0,

      activeFeedback: [],
      feedbackHistory: [],

      isCameraReady: false,
      isDetectionActive: false,
      detectionFPS: 0,

      isCalibrated: false,
      calibrationData: null,
    };

    set({
      session,
      isSessionActive: true,
      error: null,
    });

    console.log('[AICoachStore] Session started:', session.id);
  },

  // End session and persist
  endSession: async () => {
    const { session } = get();
    if (!session) return null;

    const endTime = Date.now();
    const duration = Math.round((endTime - session.startTime) / 1000);

    // Calculate totals
    const totalSets = session.sets.length;
    const totalReps = session.sets.reduce((sum, s) => sum + s.actualReps, 0);
    const totalVolume = session.sets.reduce(
      (sum, s) => sum + s.actualReps * s.weight,
      0
    );
    const avgFormScore =
      totalSets > 0
        ? session.sets.reduce((sum, s) => sum + s.formScore, 0) / totalSets
        : 0;

    // Calculate overall score
    const overallScore = Math.round(
      avgFormScore * 0.6 +
        (totalReps / (session.targetSets * 10)) * 40 // Assume 10 reps per set target
    );

    // Convert sets to persisted format
    const persistedSets: AISetDataPersisted[] = session.sets.map((s) => ({
      setNumber: s.setNumber,
      targetReps: s.targetReps,
      actualReps: s.actualReps,
      weight: s.weight,
      duration: s.duration,
      formScore: s.formScore,
      avgTempo: s.avgTempo,
      issues: summarizeFormIssues(s.issues),
    }));

    // Create persisted session
    const persistedSession: AIWorkoutSessionPersisted = {
      id: session.id,
      exerciseId: session.exerciseId,
      exerciseName: session.exerciseName,
      userId: session.userId,
      startTime: new Date(session.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,

      totalSets,
      totalReps,
      totalVolume,
      avgFormScore: Math.round(avgFormScore),
      overallScore,

      sets: persistedSets,

      formSummary: {
        avgScore: Math.round(avgFormScore),
        bestSetScore: Math.max(...session.sets.map((s) => s.formScore), 0),
        worstSetScore: Math.min(
          ...session.sets.map((s) => s.formScore),
          100
        ),
        commonIssues: summarizeFormIssues(session.feedbackHistory),
        improvements: [],
      },

      xpEarned: 150 + (avgFormScore > 80 ? 50 : 0),
      achievementsUnlocked: avgFormScore >= 95 ? ['ach-perfect-set'] : [],
      exerciseConfig: null,
    };

    // Save to storage
    try {
      const history = [...get().sessionHistory, persistedSession];
      await AsyncStorage.setItem(
        '@hyperfit_ai_sessions',
        JSON.stringify(history.slice(-50)) // Keep last 50 sessions
      );

      set({
        session: null,
        isSessionActive: false,
        sessionHistory: history,
      });

      console.log('[AICoachStore] Session ended and saved:', persistedSession.id);
      return persistedSession;
    } catch (error) {
      console.error('[AICoachStore] Failed to save session:', error);
      set({ error: 'Failed to save session' });
      return null;
    }
  },

  // Pause session
  pauseSession: () => {
    set((state) => ({
      session: state.session
        ? { ...state.session, state: 'paused' }
        : null,
    }));
  },

  // Resume session
  resumeSession: () => {
    set((state) => ({
      session: state.session
        ? { ...state.session, state: 'ready' }
        : null,
    }));
  },

  // Start a new set
  startSet: (targetReps, weight) => {
    const { session } = get();
    if (!session) return;

    const setNumber = session.currentSet + 1;
    const newSet: AISetData = {
      setNumber,
      targetReps,
      actualReps: 0,
      weight,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      formScore: 100,
      avgTempo: 0,
      issues: [],
      repData: [],
      poseSnapshots: [],
    };

    set({
      session: {
        ...session,
        state: 'exercising',
        currentSet: setNumber,
        currentReps: 0,
        currentFormScore: 100,
        currentPhase: 'waiting',
        sets: [...session.sets, newSet],
        activeFeedback: [],
      },
    });

    console.log('[AICoachStore] Set', setNumber, 'started');
  },

  // End current set
  endSet: () => {
    const { session } = get();
    if (!session || session.sets.length === 0) return;

    const endTime = Date.now();
    const updatedSets = [...session.sets];
    const currentSetIndex = updatedSets.length - 1;
    const currentSet = updatedSets[currentSetIndex];

    currentSet.endTime = endTime;
    currentSet.duration = Math.round((endTime - currentSet.startTime) / 1000);
    currentSet.actualReps = session.currentReps;
    currentSet.formScore = session.currentFormScore;
    currentSet.issues = [...session.activeFeedback];

    // Calculate total stats
    const totalReps = updatedSets.reduce((sum, s) => sum + s.actualReps, 0);
    const avgFormScore =
      updatedSets.reduce((sum, s) => sum + s.formScore, 0) / updatedSets.length;

    const isComplete = session.currentSet >= session.targetSets;

    set({
      session: {
        ...session,
        state: isComplete ? 'completed' : 'resting',
        sets: updatedSets,
        totalReps,
        avgFormScore,
        currentPhase: 'waiting',
        feedbackHistory: [
          ...session.feedbackHistory,
          ...session.activeFeedback,
        ],
        activeFeedback: [],
      },
    });

    console.log('[AICoachStore] Set', session.currentSet, 'ended');
  },

  // Update rep count
  updateReps: (repCount) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, currentReps: repCount }
        : null,
    }));
  },

  // Update current pose
  updatePose: (pose) => {
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            currentPose: pose,
            detectionFPS: 15, // Would be calculated from actual frame rate
          }
        : null,
    }));
  },

  // Update form score
  updateFormScore: (score) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, currentFormScore: score }
        : null,
    }));
  },

  // Add form issue
  addFormIssue: (issue) => {
    const { session } = get();
    if (!session) return;

    // Check if already active
    const exists = session.activeFeedback.some((f) => f.ruleId === issue.ruleId);
    if (exists) return;

    set({
      session: {
        ...session,
        activeFeedback: [...session.activeFeedback, issue],
      },
    });
  },

  // Resolve form issue
  resolveFormIssue: (ruleId) => {
    const { session } = get();
    if (!session) return;

    const updatedFeedback = session.activeFeedback.map((f) =>
      f.ruleId === ruleId ? { ...f, resolvedAt: Date.now() } : f
    );

    set({
      session: {
        ...session,
        activeFeedback: updatedFeedback.filter((f) => !f.resolvedAt),
        feedbackHistory: [
          ...session.feedbackHistory,
          ...updatedFeedback.filter((f) => f.resolvedAt),
        ],
      },
    });
  },

  // Set camera ready state
  setCameraReady: (ready) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, isCameraReady: ready }
        : null,
    }));
  },

  // Set detection active state
  setDetectionActive: (active) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, isDetectionActive: active }
        : null,
    }));
  },

  // Set calibration data
  setCalibrationData: (data) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, calibrationData: data, isCalibrated: true }
        : null,
    }));
  },

  // Set session state
  setSessionState: (newState) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, state: newState }
        : null,
    }));
  },

  // Set rep phase
  setRepPhase: (phase) => {
    set((state) => ({
      session: state.session
        ? { ...state.session, currentPhase: phase }
        : null,
    }));
  },

  // Load session history from storage
  loadSessionHistory: async () => {
    set({ isLoading: true });

    try {
      const stored = await AsyncStorage.getItem('@hyperfit_ai_sessions');
      const history: AIWorkoutSessionPersisted[] = stored
        ? JSON.parse(stored)
        : aiSessionData.sessions; // Use mock data if no stored data

      set({
        sessionHistory: history,
        isLoading: false,
      });

      console.log('[AICoachStore] Loaded', history.length, 'sessions');
    } catch (error) {
      console.error('[AICoachStore] Failed to load history:', error);
      set({
        sessionHistory: aiSessionData.sessions,
        isLoading: false,
        error: 'Failed to load session history',
      });
    }
  },

  // Clear session history
  clearSessionHistory: async () => {
    try {
      await AsyncStorage.removeItem('@hyperfit_ai_sessions');
      set({ sessionHistory: [] });
      console.log('[AICoachStore] History cleared');
    } catch (error) {
      console.error('[AICoachStore] Failed to clear history:', error);
      set({ error: 'Failed to clear history' });
    }
  },
}));

export default useAICoachStore;
