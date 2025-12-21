/**
 * Mock Exercise Data - Fallback when API fails
 */

import { Exercise } from '../types/exercise';

export const MOCK_EXERCISES: Exercise[] = [
  {
    id: 'mock-1',
    name: 'Barbell Bench Press',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Lie flat on a bench with feet firmly on the ground',
      'Grip the bar slightly wider than shoulder width',
      'Unrack and lower the bar to mid-chest',
      'Press the bar back up to full extension',
      'Keep shoulder blades retracted throughout',
    ],
    tips: [
      'Arch your back slightly for shoulder protection',
      'Drive through your feet for stability',
      'Keep wrists straight and stacked',
    ],
    mistakes: [
      'Flaring elbows too wide',
      'Bouncing bar off chest',
      'Lifting hips off bench',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400',
    category: 'Chest',
    isCompound: true,
    caloriesPerMinute: 7,
  },
  {
    id: 'mock-2',
    name: 'Pull-Ups',
    primaryMuscles: ['Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: ['Pull-up Bar'],
    difficulty: 'Intermediate',
    instructions: [
      'Hang from bar with overhand grip wider than shoulders',
      'Start from dead hang with arms extended',
      'Pull yourself up until chin clears bar',
      'Lower with control to starting position',
    ],
    tips: [
      'Initiate by depressing shoulder blades',
      'Lead with chest, not chin',
      'Keep core tight to prevent swinging',
    ],
    mistakes: [
      'Using momentum/kipping',
      'Not going to full extension',
      'Shrugging shoulders at top',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    category: 'Back',
    isCompound: true,
    caloriesPerMinute: 10,
  },
  {
    id: 'mock-3',
    name: 'Barbell Back Squat',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Lower Back'],
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'Intermediate',
    instructions: [
      'Position bar on upper back',
      'Unrack and step back with feet shoulder-width apart',
      'Brace core and descend by breaking at hips and knees',
      'Lower until hip crease is below knee',
      'Drive through feet to return to standing',
    ],
    tips: [
      'Keep chest up and back tight',
      'Knees track over toes',
      'Drive knees out, not inward',
    ],
    mistakes: [
      'Knees caving inward',
      'Rounding lower back',
      'Not hitting depth',
      'Heels coming off floor',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400',
    category: 'Legs',
    isCompound: true,
    caloriesPerMinute: 10,
  },
  {
    id: 'mock-4',
    name: 'Overhead Press',
    primaryMuscles: ['Shoulders', 'Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Grip bar just outside shoulder width',
      'Unrack bar to front rack position',
      'Press bar straight overhead',
      'Lock out with bar over midfoot',
    ],
    tips: [
      'Brace core throughout',
      'Move head back slightly as bar passes',
      'Full lockout at top',
    ],
    mistakes: [
      'Excessive back arch',
      'Pressing bar forward',
      'Not locking out elbows',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400',
    category: 'Shoulders',
    isCompound: true,
    caloriesPerMinute: 6,
  },
  {
    id: 'mock-5',
    name: 'Dumbbell Bicep Curls',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with dumbbells at sides, palms forward',
      'Keep elbows pinned to sides',
      'Curl weights up by flexing biceps',
      'Squeeze at the top',
      'Lower with control to full extension',
    ],
    tips: [
      'Elbows stay stationary at sides',
      'Full range of motion',
      'Control the negative',
    ],
    mistakes: [
      'Swinging body for momentum',
      'Elbows drifting forward',
      'Not fully extending at bottom',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    category: 'Biceps',
    isCompound: false,
    caloriesPerMinute: 4,
  },
  {
    id: 'mock-6',
    name: 'Tricep Pushdowns',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    instructions: [
      'Stand facing cable machine',
      'Grip handle with elbows at 90 degrees',
      'Push handle down by extending elbows',
      'Squeeze triceps at full extension',
      'Return to 90 degrees with control',
    ],
    tips: [
      'Elbows stay at sides',
      'Full lockout at bottom',
      'Control the weight up',
    ],
    mistakes: [
      'Elbows drifting forward',
      'Using shoulders',
      'Leaning forward for momentum',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400',
    category: 'Triceps',
    isCompound: false,
    caloriesPerMinute: 3,
  },
  {
    id: 'mock-7',
    name: 'Romanian Deadlift',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    instructions: [
      'Stand with feet hip-width, bar in front of thighs',
      'Slight bend in knees maintained throughout',
      'Hinge at hips, pushing them back',
      'Lower bar along legs until hamstring stretch',
      'Drive hips forward to return to standing',
    ],
    tips: [
      'Think about pushing hips back',
      'Feel the stretch in hamstrings',
      'Bar stays in contact with legs',
    ],
    mistakes: [
      'Rounding the back',
      'Bending knees too much',
      'Bar drifting away from body',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400',
    category: 'Legs',
    isCompound: true,
    caloriesPerMinute: 8,
  },
  {
    id: 'mock-8',
    name: 'Lat Pulldown',
    primaryMuscles: ['Lats', 'Back'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    instructions: [
      'Sit at lat pulldown machine',
      'Grip bar wider than shoulder-width',
      'Lean back slightly, chest up',
      'Pull bar down to upper chest',
      'Return to start with control',
    ],
    tips: [
      'Focus on pulling with elbows',
      'Keep chest lifted',
      'Slow and controlled on the way up',
    ],
    mistakes: [
      'Leaning too far back',
      'Pulling bar behind neck',
      'Using too much momentum',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    category: 'Back',
    isCompound: true,
    caloriesPerMinute: 5,
  },
  {
    id: 'mock-9',
    name: 'Dumbbell Lateral Raises',
    primaryMuscles: ['Shoulders', 'Lateral Deltoids'],
    secondaryMuscles: ['Trapezius'],
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with dumbbells at sides',
      'Slight bend in elbows maintained',
      'Raise arms to sides until parallel',
      'Lead with elbows, not hands',
      'Lower with control',
    ],
    tips: [
      'Keep traps relaxed',
      'Think about pouring water',
      'Dont swing or use momentum',
    ],
    mistakes: [
      'Shrugging shoulders',
      'Swinging weight up',
      'Going too heavy',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    category: 'Shoulders',
    isCompound: false,
    caloriesPerMinute: 4,
  },
  {
    id: 'mock-10',
    name: 'Plank',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: ['Shoulders', 'Lower Back'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Start on forearms and toes',
      'Elbows directly under shoulders',
      'Body forms straight line',
      'Engage core by tucking pelvis',
      'Hold position while breathing',
    ],
    tips: [
      'Dont let hips sag or pike',
      'Keep neck neutral',
      'Breathe normally',
    ],
    mistakes: [
      'Hips too high',
      'Hips sagging',
      'Holding breath',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400',
    category: 'Core',
    isCompound: false,
    caloriesPerMinute: 5,
  },
  {
    id: 'mock-11',
    name: 'Push-Ups',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Start in plank position, hands shoulder-width',
      'Keep body in straight line',
      'Lower chest toward ground',
      'Go until chest nearly touches',
      'Push back up to start',
    ],
    tips: [
      'Keep hips level',
      'Squeeze glutes for stability',
      'Full lockout at top',
    ],
    mistakes: [
      'Sagging hips',
      'Flaring elbows to 90 degrees',
      'Not going deep enough',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    category: 'Chest',
    isCompound: true,
    caloriesPerMinute: 8,
  },
  {
    id: 'mock-12',
    name: 'Leg Press',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: ['Leg Press Machine'],
    difficulty: 'Beginner',
    instructions: [
      'Sit with back flat against pad',
      'Place feet shoulder-width on platform',
      'Unrack and lower by bending knees',
      'Lower until knees at 90 degrees',
      'Press through feet to extend',
    ],
    tips: [
      'Keep lower back pressed into pad',
      'Dont let knees cave inward',
      'Control the descent',
    ],
    mistakes: [
      'Lower back lifting off pad',
      'Locking out knees at top',
      'Bouncing at bottom',
    ],
    gifUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400',
    category: 'Legs',
    isCompound: true,
    caloriesPerMinute: 7,
  },
];

/**
 * Get mock exercises by category
 */
export function getMockExercisesByCategory(category: string): Exercise[] {
  if (category === 'all') return MOCK_EXERCISES;
  return MOCK_EXERCISES.filter(
    e => e.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Search mock exercises
 */
export function searchMockExercises(query: string): Exercise[] {
  const q = query.toLowerCase();
  return MOCK_EXERCISES.filter(
    e =>
      e.name.toLowerCase().includes(q) ||
      e.primaryMuscles.some(m => m.toLowerCase().includes(q)) ||
      e.category?.toLowerCase().includes(q)
  );
}

/**
 * Get mock exercise by ID
 */
export function getMockExerciseById(id: string): Exercise | null {
  return MOCK_EXERCISES.find(e => e.id === id) || null;
}
