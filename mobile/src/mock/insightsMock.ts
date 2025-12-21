/**
 * Coach Insights Mock Data
 * Sample data for AI-powered recommendations, correlations, and insights
 */

import type {
  CoachInsight,
  CorrelationAnalysis,
  CoachInsightsDashboard,
  WeeklySummary,
  MuscleBalanceAnalysis,
  FormAnalysisSummary,
  WorkoutRecommendation,
  PerformanceCorrelationData,
} from '../types/insights.types';

// Generate dates
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Individual insights
export const mockInsights: CoachInsight[] = [
  {
    id: 'insight-1',
    category: 'recovery',
    priority: 'high',
    title: 'Recovery Alert',
    description: 'Your legs have been worked 4 times this week. Consider a rest day.',
    detailedExplanation:
      'Working the same muscle group too frequently can lead to overtraining and reduced gains. Your leg muscles need 48-72 hours to fully recover.',
    actionType: 'rest_recommendation',
    actionLabel: 'View Recovery Plan',
    icon: 'bed-outline',
    iconColor: '#F87171',
    createdAt: getDateString(0),
    expiresAt: getDateString(-1),
    isDismissed: false,
    isRead: false,
    relatedData: {
      muscleGroup: 'Legs',
      metricName: 'Weekly Sessions',
      currentValue: 4,
      targetValue: 2,
    },
  },
  {
    id: 'insight-2',
    category: 'sleep',
    priority: 'medium',
    title: 'Sleep-Performance Link',
    description: 'Your form scores are 15% higher after 7+ hours of sleep.',
    detailedExplanation:
      'We noticed a strong correlation between your sleep duration and workout performance. On days following 7+ hours of sleep, your average form score is 85% vs 70% on less sleep.',
    actionType: 'sleep_optimization',
    actionLabel: 'View Sleep Tips',
    icon: 'moon-outline',
    iconColor: '#A78BFA',
    createdAt: getDateString(1),
    expiresAt: getDateString(-6),
    isDismissed: false,
    isRead: true,
    relatedData: {
      metricName: 'Form Score Improvement',
      currentValue: 15,
      unit: '%',
      trendDirection: 'up',
    },
  },
  {
    id: 'insight-3',
    category: 'balance',
    priority: 'medium',
    title: 'Push/Pull Imbalance',
    description: 'Your push volume is 35% higher than pull. Add more rows and pull-ups.',
    detailedExplanation:
      'An imbalanced push-to-pull ratio can lead to shoulder issues and poor posture. Aim for a 1:1 or 1:1.2 push to pull ratio for optimal shoulder health.',
    actionType: 'exercise_swap',
    actionLabel: 'Suggested Exercises',
    icon: 'swap-horizontal-outline',
    iconColor: '#FBBF24',
    createdAt: getDateString(2),
    expiresAt: null,
    isDismissed: false,
    isRead: true,
    relatedData: {
      metricName: 'Push/Pull Ratio',
      currentValue: 1.35,
      targetValue: 1.0,
    },
  },
  {
    id: 'insight-4',
    category: 'progression',
    priority: 'low',
    title: 'Progressive Overload Ready',
    description: 'Bench press plateau detected. Time to increase weight by 2.5kg.',
    detailedExplanation:
      'You\'ve successfully completed 3x8 at 100kg for the past 3 sessions. Your form score has been consistently above 80%. This indicates you\'re ready for the next weight increment.',
    actionType: 'volume_adjustment',
    actionLabel: 'Update Weight',
    icon: 'trending-up-outline',
    iconColor: '#4ADE80',
    createdAt: getDateString(3),
    expiresAt: null,
    isDismissed: false,
    isRead: false,
    relatedData: {
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      currentValue: 100,
      targetValue: 102.5,
      unit: 'kg',
      trendDirection: 'up',
    },
  },
  {
    id: 'insight-5',
    category: 'form',
    priority: 'high',
    title: 'Form Improvement Needed',
    description: 'Your squat depth has decreased by 20% over the past week.',
    detailedExplanation:
      'AI analysis shows your squat depth has been getting shallower. This may be due to fatigue or flexibility issues. Consider reducing weight and focusing on full range of motion.',
    actionType: 'form_focus',
    actionLabel: 'View Form Tips',
    icon: 'alert-circle-outline',
    iconColor: '#F87171',
    createdAt: getDateString(0),
    expiresAt: getDateString(-2),
    isDismissed: false,
    isRead: false,
    relatedData: {
      exerciseId: 'squat',
      exerciseName: 'Barbell Squat',
      metricName: 'Depth',
      currentValue: -20,
      unit: '%',
      trendDirection: 'down',
    },
  },
];

// Correlation analyses
export const mockCorrelations: CorrelationAnalysis[] = [
  {
    id: 'corr-1',
    type: 'sleep_performance',
    title: 'Sleep Duration vs Form Score',
    description: 'Strong positive correlation between sleep and workout quality',
    strength: 'strong',
    coefficient: 0.78,
    confidence: 0.92,
    dataPoints: 45,
    period: '30 days',
    insight: 'Every additional hour of sleep correlates with a 5-point increase in form score.',
    recommendation: 'Aim for 7-8 hours of sleep before important workouts.',
    chartData: {
      xLabel: 'Sleep Duration',
      yLabel: 'Form Score',
      xUnit: 'hours',
      yUnit: '%',
      points: [
        { x: 5, y: 65, date: getDateString(28) },
        { x: 6, y: 72, date: getDateString(25) },
        { x: 7, y: 82, date: getDateString(21) },
        { x: 7.5, y: 85, date: getDateString(18) },
        { x: 8, y: 88, date: getDateString(14) },
        { x: 6.5, y: 75, date: getDateString(10) },
        { x: 7, y: 80, date: getDateString(7) },
        { x: 8, y: 90, date: getDateString(3) },
        { x: 7.5, y: 86, date: getDateString(0) },
      ],
      trendLine: { slope: 5.2, intercept: 35, startX: 5, endX: 8 },
    },
  },
  {
    id: 'corr-2',
    type: 'consistency_progress',
    title: 'Workout Frequency vs Strength Gains',
    description: 'Moderate correlation between consistency and progress',
    strength: 'moderate',
    coefficient: 0.62,
    confidence: 0.85,
    dataPoints: 60,
    period: '60 days',
    insight: 'Training 4+ times per week shows 20% faster strength progression.',
    recommendation: 'Maintain at least 4 training sessions per week for optimal gains.',
    chartData: {
      xLabel: 'Weekly Sessions',
      yLabel: 'Weekly Volume Increase',
      yUnit: '%',
      points: [
        { x: 2, y: 2, date: getDateString(56) },
        { x: 3, y: 4, date: getDateString(49) },
        { x: 4, y: 6, date: getDateString(42) },
        { x: 5, y: 8, date: getDateString(35) },
        { x: 4, y: 7, date: getDateString(28) },
        { x: 3, y: 3, date: getDateString(21) },
        { x: 5, y: 9, date: getDateString(14) },
        { x: 4, y: 6, date: getDateString(7) },
        { x: 5, y: 8, date: getDateString(0) },
      ],
      trendLine: { slope: 1.8, intercept: -1.5, startX: 2, endX: 5 },
    },
  },
  {
    id: 'corr-3',
    type: 'rest_recovery',
    title: 'Rest Days vs Performance',
    description: 'Weak correlation - rest days show minimal impact',
    strength: 'weak',
    coefficient: 0.25,
    confidence: 0.72,
    dataPoints: 30,
    period: '30 days',
    insight: 'Your recovery rate is good. Rest days have minimal impact on performance.',
    recommendation: 'Continue your current rest day schedule.',
    chartData: {
      xLabel: 'Rest Days Before',
      yLabel: 'Session Performance',
      yUnit: '%',
      points: [
        { x: 0, y: 82, date: getDateString(25) },
        { x: 1, y: 85, date: getDateString(21) },
        { x: 2, y: 86, date: getDateString(17) },
        { x: 1, y: 83, date: getDateString(13) },
        { x: 0, y: 80, date: getDateString(9) },
        { x: 2, y: 87, date: getDateString(5) },
        { x: 1, y: 84, date: getDateString(1) },
      ],
      trendLine: { slope: 1.5, intercept: 81, startX: 0, endX: 2 },
    },
  },
];

// Weekly summary
export const mockWeeklySummary: WeeklySummary = {
  weekStartDate: getDateString(6),
  weekEndDate: getDateString(0),
  workoutsCompleted: 5,
  workoutsPlanned: 5,
  totalVolume: 69000,
  volumeChange: 12,
  avgFormScore: 82,
  formScoreChange: 5,
  avgSleepHours: 7.2,
  sleepChange: 0.5,
  streakDays: 7,
  xpEarned: 520,
  prsAchieved: 3,
  highlights: [
    'New PR on Bench Press (102.5kg)',
    'Best form score week ever (avg 82%)',
    'Completed 7-day streak!',
  ],
  areasToImprove: [
    'Leg training frequency (only 1 session)',
    'Pull exercises volume (35% below push)',
  ],
};

// Muscle balance analysis
export const mockMuscleBalance: MuscleBalanceAnalysis = {
  overallBalance: 72,
  muscleGroups: [
    { name: 'Chest', volume: 18500, targetVolume: 15000, percentage: 123, status: 'optimal', lastWorked: getDateString(1), daysSinceLastWorked: 1 },
    { name: 'Back', volume: 12000, targetVolume: 18000, percentage: 67, status: 'undertrained', lastWorked: getDateString(3), daysSinceLastWorked: 3 },
    { name: 'Shoulders', volume: 8400, targetVolume: 8000, percentage: 105, status: 'optimal', lastWorked: getDateString(1), daysSinceLastWorked: 1 },
    { name: 'Biceps', volume: 4800, targetVolume: 5000, percentage: 96, status: 'optimal', lastWorked: getDateString(1), daysSinceLastWorked: 1 },
    { name: 'Triceps', volume: 5600, targetVolume: 5000, percentage: 112, status: 'optimal', lastWorked: getDateString(1), daysSinceLastWorked: 1 },
    { name: 'Legs', volume: 8500, targetVolume: 20000, percentage: 43, status: 'undertrained', lastWorked: getDateString(5), daysSinceLastWorked: 5 },
    { name: 'Core', volume: 2100, targetVolume: 3000, percentage: 70, status: 'undertrained', lastWorked: getDateString(2), daysSinceLastWorked: 2 },
  ],
  imbalances: [
    {
      primaryMuscle: 'Chest',
      secondaryMuscle: 'Back',
      ratio: 1.54,
      idealRatio: 1.0,
      severity: 'moderate',
      recommendation: 'Add 2 more back exercises per week',
    },
    {
      primaryMuscle: 'Upper Body',
      secondaryMuscle: 'Lower Body',
      ratio: 2.1,
      idealRatio: 1.2,
      severity: 'severe',
      recommendation: 'Prioritize leg training - aim for 2 leg days per week',
    },
  ],
  recommendations: [
    'Add a dedicated back day to balance push/pull ratio',
    'Include at least 2 leg sessions per week',
    'Consider adding more core work at the end of sessions',
  ],
};

// Form analysis summary
export const mockFormSummary: FormAnalysisSummary = {
  avgScore: 82,
  scoreChange: 5,
  totalAISessions: 12,
  commonIssues: [
    {
      issue: 'Spine rounding during squats',
      frequency: 8,
      affectedExercises: ['Barbell Squat', 'Deadlift'],
      severity: 'moderate',
      tip: 'Engage your core and think "chest up" throughout the movement',
    },
    {
      issue: 'Incomplete range of motion',
      frequency: 5,
      affectedExercises: ['Bench Press', 'Bicep Curl'],
      severity: 'minor',
      tip: 'Focus on full extension and contraction on each rep',
    },
    {
      issue: 'Asymmetric movement pattern',
      frequency: 3,
      affectedExercises: ['Shoulder Press', 'Lat Pulldown'],
      severity: 'minor',
      tip: 'Use a mirror or reduce weight to focus on balanced movement',
    },
  ],
  improvements: [
    { area: 'Bicep Curl Form', previousScore: 72, currentScore: 88, improvement: 16 },
    { area: 'Push-up Depth', previousScore: 68, currentScore: 82, improvement: 14 },
    { area: 'Squat Stability', previousScore: 75, currentScore: 80, improvement: 5 },
  ],
  exercisesNeedingWork: [
    {
      exerciseId: 'squat',
      exerciseName: 'Barbell Squat',
      avgFormScore: 72,
      commonIssues: ['Spine rounding', 'Knee cave'],
      recommendation: 'Focus on mobility work and consider box squats',
    },
    {
      exerciseId: 'deadlift',
      exerciseName: 'Deadlift',
      avgFormScore: 75,
      commonIssues: ['Lower back rounding'],
      recommendation: 'Work on hip hinge pattern with lighter weights',
    },
  ],
};

// Workout recommendations
export const mockWorkoutRecommendations: WorkoutRecommendation[] = [
  {
    id: 'rec-1',
    type: 'suggested_workout',
    title: 'Back & Biceps Focus',
    description: 'Address your push/pull imbalance with this pull-focused workout',
    reason: 'Your back volume is 33% below target this week',
    priority: 'high',
    exercises: [
      { exerciseId: 'pull-ups', exerciseName: 'Pull-ups', sets: 4, reps: '8-12', reason: 'Compound back builder' },
      { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', sets: 4, reps: '8-10', reason: 'Targets mid-back' },
      { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', sets: 3, reps: '10-12', reason: 'Lat width' },
      { exerciseId: 'face-pull', exerciseName: 'Face Pull', sets: 3, reps: '15-20', reason: 'Rear delt health' },
      { exerciseId: 'bicep-curl', exerciseName: 'Bicep Curl', sets: 3, reps: '10-12' },
    ],
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
    estimatedDuration: 55,
    estimatedCalories: 320,
  },
  {
    id: 'rec-2',
    type: 'muscle_focus',
    title: 'Leg Day Reminder',
    description: 'Your legs are undertrained. Time for leg day!',
    reason: 'Only 1 leg session in the past 7 days',
    priority: 'high',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
    estimatedDuration: 60,
    estimatedCalories: 400,
  },
  {
    id: 'rec-3',
    type: 'deload',
    title: 'Consider a Deload',
    description: 'You\'ve trained hard for 4 weeks straight',
    reason: 'Volume has increased 20% each week. Recovery is important.',
    priority: 'medium',
  },
];

// Performance correlation data (for cross-store sync)
export const mockCorrelationData: PerformanceCorrelationData[] = Array.from(
  { length: 30 },
  (_, i) => ({
    date: getDateString(29 - i),
    sleepDuration: 6 + Math.random() * 2.5,
    sleepQuality: Math.floor(Math.random() * 3) + 3,
    weight: 82 + Math.random() * 2 - 1,
    workoutScore: Math.random() > 0.3 ? 70 + Math.random() * 25 : null,
    formScore: Math.random() > 0.3 ? 65 + Math.random() * 30 : null,
    volumeLifted: Math.random() > 0.3 ? 10000 + Math.random() * 10000 : null,
    intensity: Math.random() > 0.3 ? 60 + Math.random() * 35 : null,
    energyLevel: Math.floor(Math.random() * 3) + 3,
    soreness: Math.floor(Math.random() * 3) + 1,
  })
);

// Full coach insights dashboard
export const mockCoachInsightsDashboard: CoachInsightsDashboard = {
  userId: 'user-123',
  generatedAt: new Date().toISOString(),

  overallScore: 78,
  scoreChange: 5,
  scoreTrend: 'improving',

  insights: mockInsights,
  unreadCount: 3,
  criticalCount: 2,

  topCorrelations: mockCorrelations.slice(0, 2),

  weeklySummary: mockWeeklySummary,
  muscleBalance: mockMuscleBalance,
  formSummary: mockFormSummary,

  workoutRecommendations: mockWorkoutRecommendations,
};

// Export all mock insights data
export const insightsData = {
  dashboard: mockCoachInsightsDashboard,
  insights: mockInsights,
  correlations: mockCorrelations,
  weeklySummary: mockWeeklySummary,
  muscleBalance: mockMuscleBalance,
  formSummary: mockFormSummary,
  recommendations: mockWorkoutRecommendations,
  correlationData: mockCorrelationData,
};

export default insightsData;
