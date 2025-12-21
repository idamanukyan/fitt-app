/**
 * Mock Data Index
 * Export all mock data modules
 */

export { analyticsData, default as analyticsDataDefault } from './analyticsMock';
export { gamificationData, default as gamificationDataDefault } from './gamificationMock';
export { insightsData, default as insightsDataDefault } from './insightsMock';
export { aiSessionData, default as aiSessionDataDefault } from './aiSessionMock';

// Re-export specific items for convenience
export {
  mockAnalyticsSummary7d,
  mockAnalyticsSummary30d,
  mockRecentPRs,
  mockMuscleGroupDistribution,
  mockBenchPressAnalytics,
  mockDailyWorkoutSummaries,
} from './analyticsMock';

export {
  mockGamificationState,
  mockTrainingStreak,
  mockAchievements,
  mockAchievementProgress,
  mockChallenges,
  mockRecentXPGains,
  mockLeaderboard,
} from './gamificationMock';

export {
  mockCoachInsightsDashboard,
  mockInsights,
  mockCorrelations,
  mockWeeklySummary,
  mockMuscleBalance,
  mockFormSummary,
  mockWorkoutRecommendations,
  mockCorrelationData,
} from './insightsMock';

export {
  mockAISessions,
  mockExerciseTrackingConfigs,
  mockPoseDetectionResult,
  mockRepData,
  mockAISessionHistory,
} from './aiSessionMock';
