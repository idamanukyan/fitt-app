/**
 * HyperFit Mock Data
 * Comprehensive test data for development and testing
 */

// ============================================================================
// USER PROFILE DATA
// ============================================================================
export const mockUserProfile = {
  id: 1,
  email: 'alex@hyperfit.com',
  firstName: 'Alex',
  lastName: 'Johnson',
  username: 'alexfit',
  avatar: 'https://i.pravatar.cc/150?img=12',
  dateOfBirth: '1992-05-15',
  gender: 'male',
  height: 180, // cm
  currentWeight: 82.5, // kg
  targetWeight: 78, // kg
  fitnessLevel: 'intermediate',
  goals: ['build_muscle', 'lose_fat', 'improve_strength'],
  memberSince: '2024-01-15',
  isPremium: true,
  streak: 12,
  totalWorkouts: 156,
  achievements: ['first_workout', '7_day_streak', '30_day_streak', 'weight_goal_reached'],
};

// ============================================================================
// BODY MEASUREMENTS
// ============================================================================
export const mockMeasurements = {
  latest: {
    id: 45,
    date: new Date().toISOString().split('T')[0],
    weight: 82.5,
    bodyFat: 16.2,
    muscleMass: 38.4,
    chest: 102,
    waist: 84,
    hips: 98,
    bicepsLeft: 36,
    bicepsRight: 36.5,
    thighLeft: 58,
    thighRight: 58.5,
    calfLeft: 38,
    calfRight: 38,
  },
  history: [
    { date: '2024-12-01', weight: 82.5, bodyFat: 16.2 },
    { date: '2024-11-24', weight: 83.1, bodyFat: 16.8 },
    { date: '2024-11-17', weight: 83.5, bodyFat: 17.1 },
    { date: '2024-11-10', weight: 84.2, bodyFat: 17.5 },
    { date: '2024-11-03', weight: 84.8, bodyFat: 18.0 },
    { date: '2024-10-27', weight: 85.3, bodyFat: 18.4 },
    { date: '2024-10-20', weight: 85.9, bodyFat: 18.8 },
    { date: '2024-10-13', weight: 86.2, bodyFat: 19.1 },
  ],
  weeklyTrend: -0.6, // kg per week
};

// ============================================================================
// NUTRITION DATA
// ============================================================================
export const mockNutritionGoals = {
  calories: 2400,
  protein: 180, // grams
  carbs: 250,
  fats: 80,
  fiber: 35,
  water: 3000, // ml
};

export const mockTodayNutrition = {
  date: new Date().toISOString().split('T')[0],
  calories: { current: 1650, target: 2400 },
  protein: { current: 125, target: 180 },
  carbs: { current: 180, target: 250 },
  fats: { current: 52, target: 80 },
  fiber: { current: 22, target: 35 },
  water: { current: 2200, target: 3000 },
};

export const mockMealsToday = [
  {
    id: 1,
    name: 'Breakfast',
    time: '07:30',
    calories: 520,
    protein: 35,
    carbs: 55,
    fats: 18,
    foods: [
      { name: 'Scrambled Eggs (3)', calories: 220, protein: 18, carbs: 2, fats: 15 },
      { name: 'Oatmeal with Banana', calories: 250, protein: 8, carbs: 48, fats: 3 },
      { name: 'Black Coffee', calories: 5, protein: 0, carbs: 0, fats: 0 },
      { name: 'Whey Protein Shake', calories: 120, protein: 24, carbs: 3, fats: 1 },
    ],
  },
  {
    id: 2,
    name: 'Lunch',
    time: '12:30',
    calories: 680,
    protein: 52,
    carbs: 65,
    fats: 22,
    foods: [
      { name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fats: 7 },
      { name: 'Brown Rice (150g cooked)', calories: 170, protein: 4, carbs: 36, fats: 1 },
      { name: 'Mixed Vegetables', calories: 80, protein: 3, carbs: 15, fats: 1 },
      { name: 'Olive Oil (1 tbsp)', calories: 120, protein: 0, carbs: 0, fats: 14 },
    ],
  },
  {
    id: 3,
    name: 'Snack',
    time: '15:30',
    calories: 280,
    protein: 22,
    carbs: 25,
    fats: 12,
    foods: [
      { name: 'Greek Yogurt (200g)', calories: 130, protein: 18, carbs: 8, fats: 3 },
      { name: 'Mixed Nuts (30g)', calories: 180, protein: 5, carbs: 6, fats: 16 },
      { name: 'Apple', calories: 95, protein: 0, carbs: 25, fats: 0 },
    ],
  },
  {
    id: 4,
    name: 'Dinner',
    time: '19:00',
    calories: 720,
    protein: 48,
    carbs: 55,
    fats: 28,
    foods: [
      { name: 'Salmon Fillet (180g)', calories: 370, protein: 40, carbs: 0, fats: 22 },
      { name: 'Sweet Potato (200g)', calories: 180, protein: 4, carbs: 42, fats: 0 },
      { name: 'Broccoli (150g)', calories: 50, protein: 4, carbs: 10, fats: 0 },
      { name: 'Butter (1 tbsp)', calories: 100, protein: 0, carbs: 0, fats: 11 },
    ],
  },
];

export const mockWaterLog = [
  { time: '07:00', amount: 500 },
  { time: '09:30', amount: 350 },
  { time: '11:00', amount: 400 },
  { time: '13:00', amount: 350 },
  { time: '15:00', amount: 300 },
  { time: '17:30', amount: 300 },
];

// ============================================================================
// WORKOUT DATA
// ============================================================================
export const mockWorkoutTemplates = [
  {
    id: 1,
    name: 'Push Day A',
    category: 'strength',
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    duration: 55,
    difficulty: 'intermediate',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 90 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: 60 },
      { name: 'Standing Overhead Press', sets: 3, reps: '8-10', rest: 90 },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: 45 },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: 45 },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: 45 },
      { name: 'Overhead Tricep Extension', sets: 2, reps: '15', rest: 45 },
    ],
  },
  {
    id: 2,
    name: 'Pull Day A',
    category: 'strength',
    targetMuscles: ['back', 'biceps', 'rear_delts'],
    duration: 55,
    difficulty: 'intermediate',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5', rest: 180 },
      { name: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: 90 },
      { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: 90 },
      { name: 'Seated Cable Rows', sets: 3, reps: '10-12', rest: 60 },
      { name: 'Face Pulls', sets: 3, reps: '15-20', rest: 45 },
      { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: 45 },
      { name: 'Hammer Curls', sets: 2, reps: '12-15', rest: 45 },
    ],
  },
  {
    id: 3,
    name: 'Leg Day',
    category: 'strength',
    targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    duration: 60,
    difficulty: 'intermediate',
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: 120 },
      { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: 90 },
      { name: 'Walking Lunges', sets: 3, reps: '10 each', rest: 60 },
      { name: 'Leg Press', sets: 3, reps: '12-15', rest: 60 },
      { name: 'Leg Curls', sets: 3, reps: '12-15', rest: 45 },
      { name: 'Leg Extensions', sets: 3, reps: '12-15', rest: 45 },
      { name: 'Standing Calf Raises', sets: 4, reps: '15-20', rest: 45 },
    ],
  },
  {
    id: 4,
    name: 'Upper Body',
    category: 'strength',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms'],
    duration: 50,
    difficulty: 'intermediate',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8', rest: 90 },
      { name: 'Barbell Rows', sets: 4, reps: '8', rest: 90 },
      { name: 'Overhead Press', sets: 3, reps: '10', rest: 60 },
      { name: 'Lat Pulldown', sets: 3, reps: '10', rest: 60 },
      { name: 'Bicep Curls', sets: 3, reps: '12', rest: 45 },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12', rest: 45 },
    ],
  },
  {
    id: 5,
    name: 'Full Body Circuit',
    category: 'conditioning',
    targetMuscles: ['full_body'],
    duration: 35,
    difficulty: 'beginner',
    exercises: [
      { name: 'Goblet Squat', sets: 4, reps: '12', rest: 60 },
      { name: 'Push-ups', sets: 4, reps: '12', rest: 60 },
      { name: 'Dumbbell Rows', sets: 4, reps: '10 each', rest: 60 },
      { name: 'Reverse Lunges', sets: 4, reps: '8 each', rest: 60 },
      { name: 'Plank', sets: 4, reps: '30 sec', rest: 60 },
    ],
  },
];

export const mockRecentWorkouts = [
  {
    id: 101,
    templateId: 1,
    name: 'Push Day A',
    date: '2024-12-04',
    duration: 58,
    totalVolume: 12450,
    exercises: [
      { name: 'Barbell Bench Press', sets: [
        { weight: 80, reps: 8 }, { weight: 85, reps: 7 }, { weight: 85, reps: 6 }, { weight: 80, reps: 8 }
      ]},
      { name: 'Incline Dumbbell Press', sets: [
        { weight: 30, reps: 10 }, { weight: 32, reps: 9 }, { weight: 32, reps: 8 }
      ]},
      { name: 'Standing Overhead Press', sets: [
        { weight: 50, reps: 8 }, { weight: 52, reps: 7 }, { weight: 50, reps: 8 }
      ]},
    ],
    personalRecords: [
      { exercise: 'Barbell Bench Press', type: 'weight', value: 85, unit: 'kg' }
    ],
  },
  {
    id: 100,
    templateId: 2,
    name: 'Pull Day A',
    date: '2024-12-03',
    duration: 62,
    totalVolume: 14200,
    exercises: [],
    personalRecords: [],
  },
  {
    id: 99,
    templateId: 3,
    name: 'Leg Day',
    date: '2024-12-02',
    duration: 55,
    totalVolume: 18500,
    exercises: [],
    personalRecords: [
      { exercise: 'Barbell Back Squat', type: 'weight', value: 120, unit: 'kg' }
    ],
  },
  {
    id: 98,
    templateId: 1,
    name: 'Push Day A',
    date: '2024-12-01',
    duration: 52,
    totalVolume: 11800,
    exercises: [],
    personalRecords: [],
  },
  {
    id: 97,
    templateId: 2,
    name: 'Pull Day A',
    date: '2024-11-30',
    duration: 58,
    totalVolume: 13900,
    exercises: [],
    personalRecords: [],
  },
];

export const mockWorkoutStats = {
  thisWeek: {
    workouts: 4,
    totalDuration: 227,
    totalVolume: 56950,
    avgDuration: 57,
  },
  thisMonth: {
    workouts: 18,
    totalDuration: 1026,
    totalVolume: 285000,
    avgDuration: 57,
  },
  allTime: {
    workouts: 156,
    totalDuration: 8892,
    totalVolume: 2340000,
  },
  streakDays: 12,
  longestStreak: 21,
  favoriteExercise: 'Barbell Bench Press',
  strongestLift: { exercise: 'Deadlift', weight: 160, unit: 'kg' },
};

// ============================================================================
// EXERCISES DATABASE
// ============================================================================
export const mockExercises = [
  // Chest
  { id: 1, name: 'Barbell Bench Press', muscle: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 2, name: 'Incline Dumbbell Press', muscle: 'chest', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 3, name: 'Cable Flyes', muscle: 'chest', equipment: 'cable', difficulty: 'beginner' },
  { id: 4, name: 'Push-ups', muscle: 'chest', equipment: 'bodyweight', difficulty: 'beginner' },
  { id: 5, name: 'Dumbbell Flyes', muscle: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },

  // Back
  { id: 10, name: 'Deadlift', muscle: 'back', equipment: 'barbell', difficulty: 'advanced' },
  { id: 11, name: 'Pull-ups', muscle: 'back', equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: 12, name: 'Barbell Rows', muscle: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 13, name: 'Lat Pulldown', muscle: 'back', equipment: 'cable', difficulty: 'beginner' },
  { id: 14, name: 'Seated Cable Rows', muscle: 'back', equipment: 'cable', difficulty: 'beginner' },

  // Shoulders
  { id: 20, name: 'Overhead Press', muscle: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 21, name: 'Lateral Raises', muscle: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 22, name: 'Face Pulls', muscle: 'shoulders', equipment: 'cable', difficulty: 'beginner' },
  { id: 23, name: 'Arnold Press', muscle: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate' },

  // Legs
  { id: 30, name: 'Barbell Back Squat', muscle: 'quads', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 31, name: 'Romanian Deadlift', muscle: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 32, name: 'Leg Press', muscle: 'quads', equipment: 'machine', difficulty: 'beginner' },
  { id: 33, name: 'Walking Lunges', muscle: 'quads', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 34, name: 'Leg Curls', muscle: 'hamstrings', equipment: 'machine', difficulty: 'beginner' },
  { id: 35, name: 'Calf Raises', muscle: 'calves', equipment: 'machine', difficulty: 'beginner' },

  // Arms
  { id: 40, name: 'Barbell Curls', muscle: 'biceps', equipment: 'barbell', difficulty: 'beginner' },
  { id: 41, name: 'Hammer Curls', muscle: 'biceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 42, name: 'Tricep Pushdowns', muscle: 'triceps', equipment: 'cable', difficulty: 'beginner' },
  { id: 43, name: 'Skull Crushers', muscle: 'triceps', equipment: 'barbell', difficulty: 'intermediate' },

  // Core
  { id: 50, name: 'Plank', muscle: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { id: 51, name: 'Cable Crunches', muscle: 'core', equipment: 'cable', difficulty: 'beginner' },
  { id: 52, name: 'Hanging Leg Raises', muscle: 'core', equipment: 'bodyweight', difficulty: 'intermediate' },
];

// ============================================================================
// SUPPLEMENTS DATA
// ============================================================================
export const mockSupplements = [
  {
    id: 1,
    name: 'Creatine Monohydrate',
    brand: 'Optimum Nutrition',
    category: 'performance',
    servingSize: '5g',
    servingsRemaining: 45,
    totalServings: 60,
    dailyDose: 1,
    timeOfDay: 'any',
    takenToday: true,
    benefits: ['Strength', 'Power', 'Muscle Recovery'],
  },
  {
    id: 2,
    name: 'Whey Protein Isolate',
    brand: 'MyProtein',
    category: 'protein',
    servingSize: '30g',
    servingsRemaining: 28,
    totalServings: 33,
    dailyDose: 2,
    timeOfDay: 'post-workout',
    takenToday: true,
    benefits: ['Muscle Building', 'Recovery'],
  },
  {
    id: 3,
    name: 'Vitamin D3',
    brand: 'NOW Foods',
    category: 'vitamin',
    servingSize: '5000 IU',
    servingsRemaining: 120,
    totalServings: 180,
    dailyDose: 1,
    timeOfDay: 'morning',
    takenToday: false,
    benefits: ['Bone Health', 'Immune Support', 'Mood'],
  },
  {
    id: 4,
    name: 'Fish Oil Omega-3',
    brand: 'Nordic Naturals',
    category: 'health',
    servingSize: '2 capsules',
    servingsRemaining: 60,
    totalServings: 90,
    dailyDose: 1,
    timeOfDay: 'with meals',
    takenToday: false,
    benefits: ['Joint Health', 'Heart Health', 'Brain Function'],
  },
  {
    id: 5,
    name: 'Pre-Workout',
    brand: 'Ghost',
    category: 'performance',
    servingSize: '1 scoop',
    servingsRemaining: 12,
    totalServings: 30,
    dailyDose: 1,
    timeOfDay: 'pre-workout',
    takenToday: true,
    benefits: ['Energy', 'Focus', 'Pump'],
  },
  {
    id: 6,
    name: 'ZMA',
    brand: 'Optimum Nutrition',
    category: 'recovery',
    servingSize: '3 capsules',
    servingsRemaining: 30,
    totalServings: 30,
    dailyDose: 1,
    timeOfDay: 'before bed',
    takenToday: false,
    benefits: ['Sleep Quality', 'Recovery', 'Testosterone Support'],
  },
];

export const mockSupplementLog = [
  { date: '2024-12-05', supplements: [1, 2, 5] },
  { date: '2024-12-04', supplements: [1, 2, 3, 4, 5, 6] },
  { date: '2024-12-03', supplements: [1, 2, 3, 4, 6] },
  { date: '2024-12-02', supplements: [1, 2, 4, 5, 6] },
  { date: '2024-12-01', supplements: [1, 2, 3, 4, 5, 6] },
];

// ============================================================================
// SHOP DATA
// ============================================================================
export const mockShopProducts = [
  {
    id: 1,
    name: 'Whey Protein Isolate',
    brand: 'Optimum Nutrition',
    category: 'protein',
    price: 59.99,
    originalPrice: 74.99,
    rating: 4.8,
    reviews: 2340,
    image: 'https://placehold.co/200x200/1a1d1a/4ade80?text=Whey',
    flavors: ['Chocolate', 'Vanilla', 'Strawberry'],
    sizes: ['2lb', '5lb', '10lb'],
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: 'Creatine Monohydrate',
    brand: 'Thorne',
    category: 'performance',
    price: 34.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 1876,
    image: 'https://placehold.co/200x200/1a1d1a/4ade80?text=Creatine',
    flavors: ['Unflavored'],
    sizes: ['300g', '500g'],
    inStock: true,
    featured: true,
  },
  {
    id: 3,
    name: 'Pre-Workout Energy',
    brand: 'Ghost',
    category: 'performance',
    price: 44.99,
    originalPrice: 49.99,
    rating: 4.7,
    reviews: 1234,
    image: 'https://placehold.co/200x200/1a1d1a/4ade80?text=Pre',
    flavors: ['Blue Raspberry', 'Sour Watermelon', 'Mango'],
    sizes: ['20 servings', '40 servings'],
    inStock: true,
    featured: false,
  },
  {
    id: 4,
    name: 'Omega-3 Fish Oil',
    brand: 'Nordic Naturals',
    category: 'health',
    price: 27.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 3456,
    image: 'https://placehold.co/200x200/1a1d1a/4ade80?text=Omega',
    flavors: ['Lemon'],
    sizes: ['60 softgels', '120 softgels'],
    inStock: true,
    featured: false,
  },
  {
    id: 5,
    name: 'Vitamin D3 5000 IU',
    brand: 'NOW Foods',
    category: 'vitamin',
    price: 12.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 5678,
    image: 'https://placehold.co/200x200/1a1d1a/4ade80?text=VitD',
    flavors: [],
    sizes: ['120 softgels', '240 softgels'],
    inStock: true,
    featured: false,
  },
  {
    id: 6,
    name: 'BCAA Recovery',
    brand: 'Scivation',
    category: 'recovery',
    price: 29.99,
    originalPrice: 34.99,
    rating: 4.6,
    reviews: 987,
    image: 'https://placehold.co/200x200/1a1d1a/4ade80?text=BCAA',
    flavors: ['Grape', 'Watermelon', 'Green Apple'],
    sizes: ['30 servings'],
    inStock: false,
    featured: false,
  },
];

// ============================================================================
// COACHES DATA
// ============================================================================
export const mockCoaches = [
  {
    id: 'c1',
    name: 'Sarah Mitchell',
    avatar: 'https://i.pravatar.cc/150?img=1',
    specialty: 'Strength & Conditioning',
    certifications: ['CSCS', 'NSCA-CPT'],
    experience: 8,
    rating: 4.9,
    reviews: 234,
    isOnline: true,
    responseTime: '~30min',
    hourlyRate: 75,
    bio: 'Former collegiate athlete specializing in powerlifting and athletic performance.',
    clients: 45,
    isVerified: true,
  },
  {
    id: 'c2',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    specialty: 'Nutrition Coach',
    certifications: ['PN-L2', 'RD'],
    experience: 6,
    rating: 4.8,
    reviews: 189,
    isOnline: false,
    responseTime: '~2h',
    hourlyRate: 60,
    bio: 'Registered dietitian helping clients achieve sustainable results through flexible dieting.',
    clients: 62,
    isVerified: true,
  },
  {
    id: 'c3',
    name: 'Elena Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=5',
    specialty: 'Yoga & Mobility',
    certifications: ['RYT-500', 'FMS'],
    experience: 10,
    rating: 4.9,
    reviews: 312,
    isOnline: true,
    responseTime: '~1h',
    hourlyRate: 55,
    bio: 'Combining yoga with functional movement to improve performance and prevent injury.',
    clients: 78,
    isVerified: true,
  },
  {
    id: 'c4',
    name: 'David Chen',
    avatar: 'https://i.pravatar.cc/150?img=8',
    specialty: 'Bodybuilding',
    certifications: ['IFBB Pro', 'NASM-CPT'],
    experience: 12,
    rating: 4.7,
    reviews: 156,
    isOnline: false,
    responseTime: '~4h',
    hourlyRate: 85,
    bio: 'IFBB Pro competitor with 12 years of coaching experience in contest prep.',
    clients: 28,
    isVerified: true,
  },
];

// ============================================================================
// ACHIEVEMENTS DATA
// ============================================================================
export const mockAchievements = [
  {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🏋️',
    unlockedAt: '2024-01-15',
    category: 'milestone',
  },
  {
    id: '7_day_streak',
    name: 'One Week Strong',
    description: 'Maintain a 7-day workout streak',
    icon: '🔥',
    unlockedAt: '2024-01-22',
    category: 'streak',
  },
  {
    id: '30_day_streak',
    name: 'Monthly Warrior',
    description: 'Maintain a 30-day workout streak',
    icon: '💪',
    unlockedAt: '2024-02-15',
    category: 'streak',
  },
  {
    id: 'weight_goal_reached',
    name: 'Goal Crusher',
    description: 'Reach your target weight',
    icon: '🎯',
    unlockedAt: '2024-11-20',
    category: 'milestone',
  },
  {
    id: '100_workouts',
    name: 'Century Club',
    description: 'Complete 100 workouts',
    icon: '💯',
    unlockedAt: '2024-08-10',
    category: 'milestone',
  },
  {
    id: 'bench_100kg',
    name: 'Triple Digits',
    description: 'Bench press 100kg',
    icon: '🏆',
    unlockedAt: '2024-09-15',
    category: 'strength',
  },
];

export const mockLockedAchievements = [
  {
    id: '90_day_streak',
    name: 'Quarterly Champion',
    description: 'Maintain a 90-day workout streak',
    icon: '👑',
    category: 'streak',
    progress: 12,
    target: 90,
  },
  {
    id: '500_workouts',
    name: 'Fitness Legend',
    description: 'Complete 500 workouts',
    icon: '🌟',
    category: 'milestone',
    progress: 156,
    target: 500,
  },
  {
    id: 'deadlift_200kg',
    name: 'Iron Will',
    description: 'Deadlift 200kg',
    icon: '⚡',
    category: 'strength',
    progress: 160,
    target: 200,
  },
];

// ============================================================================
// PROGRESS PHOTOS
// ============================================================================
export const mockProgressPhotos = [
  {
    id: 1,
    date: '2024-12-01',
    frontPhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Front+Dec',
    sidePhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Side+Dec',
    backPhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Back+Dec',
    weight: 82.5,
    bodyFat: 16.2,
    notes: 'Feeling leaner, abs starting to show',
  },
  {
    id: 2,
    date: '2024-11-01',
    frontPhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Front+Nov',
    sidePhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Side+Nov',
    backPhoto: null,
    weight: 84.8,
    bodyFat: 18.0,
    notes: 'Starting cut phase',
  },
  {
    id: 3,
    date: '2024-10-01',
    frontPhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Front+Oct',
    sidePhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Side+Oct',
    backPhoto: 'https://placehold.co/300x400/1a1d1a/4ade80?text=Back+Oct',
    weight: 86.2,
    bodyFat: 19.1,
    notes: 'End of bulk, good muscle gains',
  },
];

// ============================================================================
// DAILY INSIGHTS
// ============================================================================
export const mockInsights = [
  "You're on a 12-day streak! Keep it up! 🔥",
  "Your bench press has improved 8% this month.",
  "Try adding more protein to dinner - you're 20g short today.",
  "Great job hitting your water goal 5 days in a row!",
  "Tomorrow is leg day - don't skip it! 🦵",
  "You've burned 12,450 calories this week through workouts.",
  "Your sleep average is 7.2 hours - aim for 8 for better recovery.",
  "You set a new PR on deadlifts last session!",
];

// ============================================================================
// QUICK STATS FOR DASHBOARD
// ============================================================================
export const mockDashboardStats = {
  caloriesProgress: 69, // percentage
  proteinProgress: 69,
  waterProgress: 73,
  stepsToday: 8432,
  stepsGoal: 10000,
  sleepLastNight: 7.5,
  restingHeartRate: 58,
  activeMinutesToday: 45,
  weeklyWorkouts: 4,
  weeklyWorkoutsGoal: 5,
};

// ============================================================================
// STATISTICS DATA (for statistics/measurements page)
// ============================================================================
export const mockStatistics = {
  // Overview stats
  overview: {
    totalWorkouts: 156,
    totalCaloriesBurned: 78500,
    totalMinutesTrained: 8892,
    averageWorkoutDuration: 57,
    currentStreak: 12,
    longestStreak: 21,
    perfectWeeks: 8,
    consistencyScore: 87, // percentage
  },

  // Weekly activity data (last 7 days)
  weeklyActivity: [
    { day: 'Mon', workouts: 1, duration: 55, calories: 420 },
    { day: 'Tue', workouts: 1, duration: 62, calories: 480 },
    { day: 'Wed', workouts: 0, duration: 0, calories: 0 },
    { day: 'Thu', workouts: 1, duration: 58, calories: 450 },
    { day: 'Fri', workouts: 1, duration: 52, calories: 390 },
    { day: 'Sat', workouts: 0, duration: 0, calories: 0 },
    { day: 'Sun', workouts: 1, duration: 60, calories: 460 },
  ],

  // Monthly workout distribution
  monthlyWorkouts: [
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 16 },
    { month: 'Mar', count: 20 },
    { month: 'Apr', count: 15 },
    { month: 'May', count: 19 },
    { month: 'Jun', count: 17 },
    { month: 'Jul', count: 21 },
    { month: 'Aug', count: 18 },
    { month: 'Sep', count: 16 },
    { month: 'Oct', count: 19 },
    { month: 'Nov', count: 20 },
    { month: 'Dec', count: 14 },
  ],

  // Weight progress over time (last 12 weeks)
  weightProgress: [
    { week: 'W1', weight: 86.2, date: '2024-09-15' },
    { week: 'W2', weight: 85.9, date: '2024-09-22' },
    { week: 'W3', weight: 85.5, date: '2024-09-29' },
    { week: 'W4', weight: 85.3, date: '2024-10-06' },
    { week: 'W5', weight: 84.8, date: '2024-10-13' },
    { week: 'W6', weight: 84.5, date: '2024-10-20' },
    { week: 'W7', weight: 84.2, date: '2024-10-27' },
    { week: 'W8', weight: 83.8, date: '2024-11-03' },
    { week: 'W9', weight: 83.5, date: '2024-11-10' },
    { week: 'W10', weight: 83.1, date: '2024-11-17' },
    { week: 'W11', weight: 82.8, date: '2024-11-24' },
    { week: 'W12', weight: 82.5, date: '2024-12-01' },
  ],

  // Body composition tracking
  bodyComposition: [
    { date: '2024-09-01', bodyFat: 19.5, muscleMass: 36.8 },
    { date: '2024-10-01', bodyFat: 18.5, muscleMass: 37.4 },
    { date: '2024-11-01', bodyFat: 17.5, muscleMass: 37.9 },
    { date: '2024-12-01', bodyFat: 16.2, muscleMass: 38.4 },
  ],

  // Nutrition averages (last 30 days)
  nutritionAverages: {
    avgCalories: 2180,
    avgProtein: 165,
    avgCarbs: 225,
    avgFats: 72,
    avgWater: 2.6, // liters
    calorieGoalHitRate: 78, // percentage of days hitting goal
    proteinGoalHitRate: 85,
  },

  // Daily nutrition history (last 7 days)
  nutritionHistory: [
    { date: '2024-12-01', calories: 2350, protein: 175, carbs: 240, fats: 78, water: 2.8 },
    { date: '2024-12-02', calories: 2180, protein: 168, carbs: 220, fats: 70, water: 2.5 },
    { date: '2024-12-03', calories: 2420, protein: 182, carbs: 255, fats: 82, water: 3.0 },
    { date: '2024-12-04', calories: 2050, protein: 158, carbs: 210, fats: 65, water: 2.4 },
    { date: '2024-12-05', calories: 2280, protein: 172, carbs: 235, fats: 75, water: 2.7 },
    { date: '2024-12-06', calories: 1950, protein: 145, carbs: 200, fats: 62, water: 2.2 },
    { date: '2024-12-07', calories: 2150, protein: 165, carbs: 220, fats: 70, water: 2.5 },
  ],

  // Strength progress (personal records over time)
  strengthProgress: {
    benchPress: [
      { date: '2024-01-15', weight: 70 },
      { date: '2024-03-01', weight: 75 },
      { date: '2024-05-15', weight: 80 },
      { date: '2024-08-01', weight: 82.5 },
      { date: '2024-10-15', weight: 85 },
    ],
    squat: [
      { date: '2024-01-15', weight: 90 },
      { date: '2024-03-01', weight: 100 },
      { date: '2024-05-15', weight: 110 },
      { date: '2024-08-01', weight: 115 },
      { date: '2024-10-15', weight: 120 },
    ],
    deadlift: [
      { date: '2024-01-15', weight: 120 },
      { date: '2024-03-01', weight: 130 },
      { date: '2024-05-15', weight: 140 },
      { date: '2024-08-01', weight: 150 },
      { date: '2024-10-15', weight: 160 },
    ],
    overheadPress: [
      { date: '2024-01-15', weight: 45 },
      { date: '2024-03-01', weight: 47.5 },
      { date: '2024-05-15', weight: 50 },
      { date: '2024-08-01', weight: 52.5 },
      { date: '2024-10-15', weight: 55 },
    ],
  },

  // Current personal records
  personalRecords: [
    { exercise: 'Deadlift', weight: 160, unit: 'kg', date: '2024-10-15', improvement: '+10kg' },
    { exercise: 'Squat', weight: 120, unit: 'kg', date: '2024-10-15', improvement: '+5kg' },
    { exercise: 'Bench Press', weight: 85, unit: 'kg', date: '2024-10-15', improvement: '+2.5kg' },
    { exercise: 'Overhead Press', weight: 55, unit: 'kg', date: '2024-10-15', improvement: '+2.5kg' },
    { exercise: 'Barbell Row', weight: 80, unit: 'kg', date: '2024-09-20', improvement: '+5kg' },
    { exercise: 'Pull-ups', weight: 15, unit: 'reps', date: '2024-11-01', improvement: '+3 reps' },
  ],

  // Sleep tracking (last 7 days)
  sleepData: [
    { date: '2024-12-01', hours: 7.5, quality: 85 },
    { date: '2024-12-02', hours: 6.8, quality: 72 },
    { date: '2024-12-03', hours: 8.2, quality: 92 },
    { date: '2024-12-04', hours: 7.0, quality: 78 },
    { date: '2024-12-05', hours: 7.8, quality: 88 },
    { date: '2024-12-06', hours: 6.5, quality: 65 },
    { date: '2024-12-07', hours: 7.5, quality: 82 },
  ],

  // Steps tracking (last 7 days)
  stepsData: [
    { date: '2024-12-01', steps: 9245, goal: 10000 },
    { date: '2024-12-02', steps: 11320, goal: 10000 },
    { date: '2024-12-03', steps: 7850, goal: 10000 },
    { date: '2024-12-04', steps: 8432, goal: 10000 },
    { date: '2024-12-05', steps: 10150, goal: 10000 },
    { date: '2024-12-06', steps: 6720, goal: 10000 },
    { date: '2024-12-07', steps: 8945, goal: 10000 },
  ],

  // Workout type distribution
  workoutTypeDistribution: [
    { type: 'Strength Training', count: 95, percentage: 61 },
    { type: 'Cardio', count: 28, percentage: 18 },
    { type: 'HIIT', count: 18, percentage: 12 },
    { type: 'Flexibility/Yoga', count: 15, percentage: 9 },
  ],

  // Muscle group focus distribution
  muscleGroupFocus: [
    { muscle: 'Chest', sessions: 28, color: '#4ADE80' },
    { muscle: 'Back', sessions: 30, color: '#60A5FA' },
    { muscle: 'Legs', sessions: 25, color: '#A78BFA' },
    { muscle: 'Shoulders', sessions: 22, color: '#FB923C' },
    { muscle: 'Arms', sessions: 26, color: '#F472B6' },
    { muscle: 'Core', sessions: 35, color: '#22D3EE' },
  ],

  // Goals and progress
  goals: [
    {
      id: 1,
      name: 'Reach 80kg',
      type: 'weight',
      target: 80,
      current: 82.5,
      unit: 'kg',
      startValue: 86.2,
      progress: 60,
      deadline: '2025-01-31',
    },
    {
      id: 2,
      name: 'Bench 90kg',
      type: 'strength',
      target: 90,
      current: 85,
      unit: 'kg',
      startValue: 70,
      progress: 75,
      deadline: '2025-03-01',
    },
    {
      id: 3,
      name: 'Body Fat under 15%',
      type: 'body_composition',
      target: 15,
      current: 16.2,
      unit: '%',
      startValue: 19.5,
      progress: 73,
      deadline: '2025-02-15',
    },
    {
      id: 4,
      name: '200 Total Workouts',
      type: 'workouts',
      target: 200,
      current: 156,
      unit: 'workouts',
      startValue: 0,
      progress: 78,
      deadline: null,
    },
  ],

  // Comparison stats (this week vs last week)
  weeklyComparison: {
    workouts: { current: 4, previous: 5, change: -20 },
    duration: { current: 227, previous: 285, change: -20 },
    calories: { current: 2200, previous: 2100, change: 5 },
    steps: { current: 62662, previous: 58420, change: 7 },
    sleep: { current: 7.3, previous: 7.1, change: 3 },
    water: { current: 18.2, previous: 17.5, change: 4 },
  },

  // Heart rate zones (for cardio tracking)
  heartRateZones: {
    restingHR: 58,
    maxHR: 188,
    zones: [
      { name: 'Recovery', range: '94-112 bpm', timeInZone: 45, percentage: 15 },
      { name: 'Fat Burn', range: '113-131 bpm', timeInZone: 120, percentage: 40 },
      { name: 'Cardio', range: '132-150 bpm', timeInZone: 90, percentage: 30 },
      { name: 'Peak', range: '151-169 bpm', timeInZone: 30, percentage: 10 },
      { name: 'Maximum', range: '170-188 bpm', timeInZone: 15, percentage: 5 },
    ],
  },

  // Body measurements history
  measurementsHistory: [
    {
      date: '2024-12-01',
      weight: 82.5,
      bodyFat: 16.2,
      chest: 102,
      waist: 84,
      hips: 98,
      bicepsLeft: 36,
      bicepsRight: 36.5,
      thighLeft: 58,
      thighRight: 58.5,
    },
    {
      date: '2024-11-01',
      weight: 84.8,
      bodyFat: 18.0,
      chest: 101,
      waist: 86,
      hips: 99,
      bicepsLeft: 35.5,
      bicepsRight: 36,
      thighLeft: 57.5,
      thighRight: 58,
    },
    {
      date: '2024-10-01',
      weight: 86.2,
      bodyFat: 19.1,
      chest: 100,
      waist: 88,
      hips: 100,
      bicepsLeft: 35,
      bicepsRight: 35.5,
      thighLeft: 57,
      thighRight: 57.5,
    },
  ],
};

// ============================================================================
// FOOD DATABASE (for meal logging)
// ============================================================================
export const mockFoodDatabase = [
  { id: 1, name: 'Chicken Breast (grilled)', serving: '100g', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { id: 2, name: 'Brown Rice (cooked)', serving: '100g', calories: 112, protein: 2.6, carbs: 24, fats: 0.9 },
  { id: 3, name: 'Broccoli', serving: '100g', calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  { id: 4, name: 'Salmon (baked)', serving: '100g', calories: 208, protein: 20, carbs: 0, fats: 13 },
  { id: 5, name: 'Sweet Potato', serving: '100g', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
  { id: 6, name: 'Eggs (whole)', serving: '1 large', calories: 78, protein: 6, carbs: 0.6, fats: 5 },
  { id: 7, name: 'Oatmeal (dry)', serving: '40g', calories: 152, protein: 5.3, carbs: 27, fats: 2.7 },
  { id: 8, name: 'Greek Yogurt (plain)', serving: '170g', calories: 100, protein: 17, carbs: 6, fats: 0.7 },
  { id: 9, name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
  { id: 10, name: 'Almonds', serving: '28g', calories: 164, protein: 6, carbs: 6, fats: 14 },
  { id: 11, name: 'Whey Protein Shake', serving: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 1 },
  { id: 12, name: 'Avocado', serving: '1/2 fruit', calories: 160, protein: 2, carbs: 9, fats: 15 },
  { id: 13, name: 'Olive Oil', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fats: 14 },
  { id: 14, name: 'Beef (lean)', serving: '100g', calories: 250, protein: 26, carbs: 0, fats: 15 },
  { id: 15, name: 'Quinoa (cooked)', serving: '100g', calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
];

export default {
  mockUserProfile,
  mockMeasurements,
  mockNutritionGoals,
  mockTodayNutrition,
  mockMealsToday,
  mockWaterLog,
  mockWorkoutTemplates,
  mockRecentWorkouts,
  mockWorkoutStats,
  mockExercises,
  mockSupplements,
  mockSupplementLog,
  mockShopProducts,
  mockCoaches,
  mockAchievements,
  mockLockedAchievements,
  mockProgressPhotos,
  mockInsights,
  mockDashboardStats,
  mockStatistics,
  mockFoodDatabase,
};
