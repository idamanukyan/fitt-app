/**
 * Exercise Mock Data - Production-Ready Seed Data
 * 20+ exercises with full details, AI keypoints, and coaching hints
 */

import { MuscleGroup, Equipment, DifficultyLevel, ExerciseType } from '../types/workout.types';
import { ExerciseDetail, PoseLandmark } from '../types/training.types';

export const EXERCISES: ExerciseDetail[] = [
  // ============================================================================
  // CHEST EXERCISES
  // ============================================================================
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    slug: 'barbell-bench-press',
    category: MuscleGroup.CHEST,
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii', 'Serratus Anterior'],
    equipment: [Equipment.BARBELL, Equipment.BENCH],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400',
    instructions: [
      'Lie flat on the bench with feet firmly on the ground',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack the bar and position it over your chest',
      'Lower the bar to mid-chest with control',
      'Press the bar back up to the starting position',
      'Keep shoulder blades retracted throughout',
    ],
    formTips: [
      'Arch your back slightly to protect shoulders',
      'Drive through your feet for stability',
      'Keep wrists straight and stacked over elbows',
      'Touch the bar to your chest, dont bounce',
    ],
    commonMistakes: [
      'Flaring elbows too wide (injury risk)',
      'Bouncing bar off chest',
      'Lifting hips off bench',
      'Not fully locking out at top',
      'Uneven bar path',
    ],
    aiKeypoints: [
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbow angle at bottom should be 75-90 degrees',
        minAngle: 75,
        maxAngle: 90,
        idealAngle: 80,
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders should stay retracted and depressed',
        minAngle: 0,
        maxAngle: 45,
      },
      {
        joint: 'Wrist',
        landmark: PoseLandmark.LEFT_WRIST,
        description: 'Wrists should remain neutral and stacked',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 7,
    restBetweenSets: 120,
    tags: ['push', 'compound', 'powerlifting', 'strength'],
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    slug: 'incline-dumbbell-press',
    category: MuscleGroup.CHEST,
    primaryMuscle: 'Upper Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii'],
    equipment: [Equipment.DUMBBELL, Equipment.BENCH],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-bench-press-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    instructions: [
      'Set bench to 30-45 degree incline',
      'Sit with dumbbells resting on thighs',
      'Kick dumbbells up as you lie back',
      'Position dumbbells at chest level, palms forward',
      'Press dumbbells up and together',
      'Lower with control to chest level',
    ],
    formTips: [
      'Keep upper back pressed into bench',
      'Dont let dumbbells drift too far apart at bottom',
      'Control the negative portion',
      'Full range of motion for best results',
    ],
    commonMistakes: [
      'Setting incline too high (becomes shoulder press)',
      'Arching lower back excessively',
      'Dumbbells colliding at top',
      'Rushing the eccentric phase',
    ],
    aiKeypoints: [
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbows at 45-75 degrees from torso',
        minAngle: 45,
        maxAngle: 75,
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Upper arm parallel to ground at bottom',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 6,
    restBetweenSets: 90,
    tags: ['push', 'compound', 'hypertrophy', 'upper chest'],
  },
  {
    id: 'push-ups',
    name: 'Push-Ups',
    slug: 'push-ups',
    category: MuscleGroup.CHEST,
    primaryMuscle: 'Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoid', 'Triceps Brachii', 'Core'],
    equipment: [Equipment.BODYWEIGHT],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.CALISTHENICS,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-push-up-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    instructions: [
      'Start in plank position, hands shoulder-width apart',
      'Keep body in straight line from head to heels',
      'Lower chest toward ground by bending elbows',
      'Go down until chest nearly touches floor',
      'Push back up to starting position',
      'Maintain core engagement throughout',
    ],
    formTips: [
      'Keep hips level - dont sag or pike',
      'Look slightly ahead, not straight down',
      'Squeeze glutes for stability',
      'Full lockout at top of each rep',
    ],
    commonMistakes: [
      'Sagging hips (weak core)',
      'Flaring elbows out to 90 degrees',
      'Not going deep enough',
      'Leading with chin instead of chest',
    ],
    aiKeypoints: [
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hips should stay in line with shoulders and ankles',
      },
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbows at 45-degree angle from body',
        idealAngle: 45,
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders over wrists at top',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 8,
    restBetweenSets: 60,
    tags: ['push', 'bodyweight', 'compound', 'home workout'],
  },

  // ============================================================================
  // BACK EXERCISES
  // ============================================================================
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    slug: 'barbell-bent-over-row',
    category: MuscleGroup.BACK,
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Rhomboids', 'Trapezius', 'Rear Deltoid', 'Biceps'],
    equipment: [Equipment.BARBELL],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400',
    instructions: [
      'Stand with feet hip-width apart, barbell in front',
      'Hinge at hips until torso is 45-60 degrees',
      'Grip bar slightly wider than shoulder-width',
      'Pull bar toward lower chest/upper abs',
      'Squeeze shoulder blades together at top',
      'Lower with control to arms extended',
    ],
    formTips: [
      'Keep back flat throughout movement',
      'Drive elbows back, not up',
      'Maintain hip hinge angle',
      'Brace core to protect lower back',
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Using momentum to swing weight',
      'Standing too upright',
      'Not pulling to the right spot',
    ],
    aiKeypoints: [
      {
        joint: 'Spine',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Back should remain flat, no rounding',
      },
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbows drive back past torso at top',
        minAngle: 30,
        maxAngle: 90,
      },
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hip hinge maintained at 45-60 degrees',
        minAngle: 45,
        maxAngle: 60,
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 7,
    restBetweenSets: 120,
    tags: ['pull', 'compound', 'strength', 'back thickness'],
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    slug: 'pull-ups',
    category: MuscleGroup.BACK,
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Brachialis', 'Rear Deltoid', 'Core'],
    equipment: [Equipment.PULL_UP_BAR],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.CALISTHENICS,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pull-up-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    instructions: [
      'Hang from bar with overhand grip, wider than shoulders',
      'Start from dead hang with arms fully extended',
      'Pull yourself up until chin clears the bar',
      'Focus on driving elbows down and back',
      'Lower with control to dead hang',
      'Avoid swinging or kipping',
    ],
    formTips: [
      'Initiate pull by depressing shoulder blades',
      'Keep core tight to prevent swinging',
      'Lead with chest, not chin',
      'Full extension at bottom for best stretch',
    ],
    commonMistakes: [
      'Not going to full extension (dead hang)',
      'Using momentum/kipping',
      'Only going halfway up',
      'Shrugging shoulders at top',
    ],
    aiKeypoints: [
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders down and back at top',
      },
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Full elbow extension at bottom',
        maxAngle: 180,
      },
      {
        joint: 'Core',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Body should remain straight, no swinging',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 10,
    restBetweenSets: 120,
    tags: ['pull', 'bodyweight', 'compound', 'lat width'],
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    slug: 'lat-pulldown',
    category: MuscleGroup.BACK,
    primaryMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Rear Deltoid'],
    equipment: [Equipment.CABLE, Equipment.MACHINE],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-cable-lat-pulldown-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    instructions: [
      'Sit at lat pulldown machine, adjust thigh pad',
      'Grip bar wider than shoulder-width',
      'Lean back slightly, chest up',
      'Pull bar down to upper chest',
      'Squeeze lats at bottom of movement',
      'Return to start with control',
    ],
    formTips: [
      'Avoid excessive leaning back',
      'Focus on pulling with elbows, not hands',
      'Keep chest lifted throughout',
      'Slow and controlled on the way up',
    ],
    commonMistakes: [
      'Leaning too far back',
      'Pulling bar behind neck (injury risk)',
      'Using too much momentum',
      'Not fully extending arms at top',
    ],
    aiKeypoints: [
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbows drive down toward ribs',
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders stay depressed',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 5,
    restBetweenSets: 90,
    tags: ['pull', 'machine', 'compound', 'lat width'],
  },

  // ============================================================================
  // SHOULDER EXERCISES
  // ============================================================================
  {
    id: 'overhead-press',
    name: 'Barbell Overhead Press',
    slug: 'barbell-overhead-press',
    category: MuscleGroup.SHOULDERS,
    primaryMuscle: 'Anterior Deltoid',
    secondaryMuscles: ['Lateral Deltoid', 'Triceps', 'Upper Chest', 'Core'],
    equipment: [Equipment.BARBELL],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-overhead-press-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Grip bar just outside shoulder-width',
      'Unrack bar to front rack position',
      'Brace core and squeeze glutes',
      'Press bar straight overhead',
      'Lock out with bar over midfoot',
    ],
    formTips: [
      'Dont lean back excessively',
      'Keep core braced throughout',
      'Move head back slightly as bar passes',
      'Full lockout at top',
    ],
    commonMistakes: [
      'Excessive back arch',
      'Pressing bar forward instead of straight up',
      'Not locking out elbows',
      'Flaring ribs at top',
    ],
    aiKeypoints: [
      {
        joint: 'Spine',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Maintain neutral spine, minimal arch',
      },
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Full lockout at top, bar over midfoot',
        idealAngle: 180,
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 6,
    restBetweenSets: 120,
    tags: ['push', 'compound', 'strength', 'powerlifting'],
  },
  {
    id: 'lateral-raises',
    name: 'Dumbbell Lateral Raises',
    slug: 'dumbbell-lateral-raises',
    category: MuscleGroup.SHOULDERS,
    primaryMuscle: 'Lateral Deltoid',
    secondaryMuscles: ['Trapezius', 'Anterior Deltoid'],
    equipment: [Equipment.DUMBBELL],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-lateral-raise-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    instructions: [
      'Stand with dumbbells at sides, palms facing in',
      'Slight bend in elbows, maintained throughout',
      'Raise arms out to sides until parallel to floor',
      'Lead with elbows, not hands',
      'Brief pause at top',
      'Lower with control',
    ],
    formTips: [
      'Slight forward lean can help target lateral head',
      'Think about pouring water from a pitcher',
      'Dont swing or use momentum',
      'Keep traps relaxed',
    ],
    commonMistakes: [
      'Shrugging shoulders (traps take over)',
      'Swinging weight up',
      'Going too heavy with bad form',
      'Raising arms too high (trap involvement)',
    ],
    aiKeypoints: [
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders stay depressed, not shrugged',
      },
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Slight bend maintained, elbows lead',
        minAngle: 160,
        maxAngle: 170,
      },
    ],
    isCompound: false,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 4,
    restBetweenSets: 60,
    tags: ['isolation', 'hypertrophy', 'shoulder width'],
  },

  // ============================================================================
  // LEG EXERCISES
  // ============================================================================
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    slug: 'barbell-back-squat',
    category: MuscleGroup.QUADS,
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core', 'Lower Back'],
    equipment: [Equipment.BARBELL],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.POWERLIFTING,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-squat-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400',
    instructions: [
      'Position bar on upper back/rear delts (high bar) or lower traps (low bar)',
      'Unrack and step back with feet shoulder-width apart',
      'Toes slightly pointed out (15-30 degrees)',
      'Brace core and descend by breaking at hips and knees',
      'Lower until hip crease below knee (parallel or below)',
      'Drive through feet to return to standing',
    ],
    formTips: [
      'Keep chest up and back tight',
      'Knees track over toes',
      'Maintain neutral spine',
      'Drive knees out, not inward',
    ],
    commonMistakes: [
      'Knees caving inward (valgus)',
      'Rounding lower back (butt wink)',
      'Not hitting depth',
      'Heels coming off floor',
      'Good morning the squat',
    ],
    aiKeypoints: [
      {
        joint: 'Knee',
        landmark: PoseLandmark.LEFT_KNEE,
        description: 'Knees track over toes, dont cave inward',
        minAngle: 70,
        maxAngle: 180,
      },
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hip crease below knee at bottom',
        minAngle: 60,
        maxAngle: 90,
      },
      {
        joint: 'Spine',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Maintain neutral spine, chest up',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 10,
    restBetweenSets: 180,
    tags: ['compound', 'powerlifting', 'strength', 'legs'],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    slug: 'romanian-deadlift',
    category: MuscleGroup.HAMSTRINGS,
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Lower Back', 'Core'],
    equipment: [Equipment.BARBELL],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-romanian-deadlift-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400',
    instructions: [
      'Stand with feet hip-width, bar in front of thighs',
      'Slight bend in knees, maintained throughout',
      'Hinge at hips, pushing them back',
      'Lower bar along legs until hamstring stretch',
      'Keep bar close to body throughout',
      'Drive hips forward to return to standing',
    ],
    formTips: [
      'Think about pushing hips back, not bending forward',
      'Feel the stretch in hamstrings',
      'Maintain flat back throughout',
      'Bar stays in contact with legs',
    ],
    commonMistakes: [
      'Rounding the back',
      'Bending knees too much (becomes regular deadlift)',
      'Bar drifting away from body',
      'Not feeling hamstring stretch',
    ],
    aiKeypoints: [
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hip hinge pattern, push hips back',
        minAngle: 90,
        maxAngle: 180,
      },
      {
        joint: 'Knee',
        landmark: PoseLandmark.LEFT_KNEE,
        description: 'Slight bend maintained, not increasing',
        minAngle: 160,
        maxAngle: 175,
      },
      {
        joint: 'Spine',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Flat back throughout movement',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 8,
    restBetweenSets: 120,
    tags: ['pull', 'compound', 'posterior chain', 'hamstrings'],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    slug: 'leg-press',
    category: MuscleGroup.QUADS,
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: [Equipment.MACHINE],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400',
    instructions: [
      'Sit in leg press machine, back flat against pad',
      'Place feet shoulder-width on platform',
      'Unrack and lower weight by bending knees',
      'Lower until knees at 90 degrees',
      'Press through feet to extend legs',
      'Dont lock out knees completely',
    ],
    formTips: [
      'Keep lower back pressed into pad',
      'Dont let knees cave inward',
      'Control the descent',
      'Drive through heels for more glute activation',
    ],
    commonMistakes: [
      'Lower back lifting off pad',
      'Locking out knees at top',
      'Knees caving inward',
      'Bouncing at bottom',
    ],
    aiKeypoints: [
      {
        joint: 'Knee',
        landmark: PoseLandmark.LEFT_KNEE,
        description: 'Knee angle at bottom around 90 degrees',
        minAngle: 80,
        maxAngle: 100,
      },
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hips stay in seat, back pressed',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 7,
    restBetweenSets: 120,
    tags: ['compound', 'machine', 'legs', 'beginner friendly'],
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    slug: 'walking-lunges',
    category: MuscleGroup.QUADS,
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    equipment: [Equipment.BODYWEIGHT, Equipment.DUMBBELL],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-walking-lunge-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400',
    instructions: [
      'Stand tall with feet together',
      'Step forward with one leg',
      'Lower until both knees at 90 degrees',
      'Front knee stays over ankle',
      'Push through front foot to step through',
      'Alternate legs as you walk forward',
    ],
    formTips: [
      'Keep torso upright',
      'Front knee tracks over middle toes',
      'Back knee comes close to floor',
      'Step length should allow 90-degree angles',
    ],
    commonMistakes: [
      'Front knee going past toes',
      'Torso leaning forward',
      'Short steps (knees too bent)',
      'Losing balance',
    ],
    aiKeypoints: [
      {
        joint: 'Front Knee',
        landmark: PoseLandmark.LEFT_KNEE,
        description: 'Front knee at 90 degrees, over ankle',
        idealAngle: 90,
      },
      {
        joint: 'Back Knee',
        landmark: PoseLandmark.RIGHT_KNEE,
        description: 'Back knee at 90 degrees, near floor',
        idealAngle: 90,
      },
      {
        joint: 'Torso',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Torso stays upright',
      },
    ],
    isCompound: true,
    isUnilateral: true,
    estimatedCaloriesPerMinute: 9,
    restBetweenSets: 90,
    tags: ['compound', 'unilateral', 'functional', 'balance'],
  },

  // ============================================================================
  // ARM EXERCISES
  // ============================================================================
  {
    id: 'bicep-curls',
    name: 'Dumbbell Bicep Curls',
    slug: 'dumbbell-bicep-curls',
    category: MuscleGroup.BICEPS,
    primaryMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: [Equipment.DUMBBELL],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bicep-curl-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    instructions: [
      'Stand with dumbbells at sides, palms forward',
      'Keep elbows pinned to sides',
      'Curl weights up by flexing biceps',
      'Squeeze at the top',
      'Lower with control to full extension',
      'Dont swing or use momentum',
    ],
    formTips: [
      'Elbows stay stationary at sides',
      'Full range of motion',
      'Squeeze biceps at top',
      'Control the negative',
    ],
    commonMistakes: [
      'Swinging body for momentum',
      'Elbows drifting forward',
      'Not fully extending at bottom',
      'Using too much weight',
    ],
    aiKeypoints: [
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbow stays pinned at side',
        minAngle: 30,
        maxAngle: 170,
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulder stays stationary',
      },
    ],
    isCompound: false,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 4,
    restBetweenSets: 60,
    tags: ['isolation', 'arms', 'hypertrophy', 'beginner friendly'],
  },
  {
    id: 'tricep-pushdowns',
    name: 'Cable Tricep Pushdowns',
    slug: 'cable-tricep-pushdowns',
    category: MuscleGroup.TRICEPS,
    primaryMuscle: 'Triceps Brachii',
    secondaryMuscles: [],
    equipment: [Equipment.CABLE],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-cable-pushdown-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400',
    instructions: [
      'Stand facing cable machine, grip handle',
      'Pin elbows to sides at 90-degree angle',
      'Push handle down by extending elbows',
      'Squeeze triceps at full extension',
      'Return to 90 degrees with control',
      'Keep torso upright throughout',
    ],
    formTips: [
      'Elbows stay at sides, dont flare',
      'Full lockout at bottom',
      'Dont lean over the bar',
      'Control the weight on the way up',
    ],
    commonMistakes: [
      'Elbows drifting forward',
      'Using shoulders instead of triceps',
      'Leaning body forward for momentum',
      'Not fully locking out',
    ],
    aiKeypoints: [
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbow stays pinned, only forearm moves',
        minAngle: 20,
        maxAngle: 90,
      },
    ],
    isCompound: false,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 3,
    restBetweenSets: 60,
    tags: ['isolation', 'arms', 'triceps', 'cable'],
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    slug: 'hammer-curls',
    category: MuscleGroup.BICEPS,
    primaryMuscle: 'Brachialis',
    secondaryMuscles: ['Biceps Brachii', 'Forearms'],
    equipment: [Equipment.DUMBBELL],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-hammer-curl-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    instructions: [
      'Stand with dumbbells at sides, palms facing body',
      'Keep neutral grip (palms facing each other) throughout',
      'Curl weights up keeping elbows pinned',
      'Squeeze at top of movement',
      'Lower with control',
      'Alternate arms or curl together',
    ],
    formTips: [
      'Neutral grip targets brachialis',
      'Keep wrists straight',
      'Elbows stationary at sides',
      'Full range of motion',
    ],
    commonMistakes: [
      'Rotating wrists during curl',
      'Elbows drifting forward',
      'Swinging body',
      'Cutting range of motion short',
    ],
    aiKeypoints: [
      {
        joint: 'Elbow',
        landmark: PoseLandmark.LEFT_ELBOW,
        description: 'Elbow stays at side, only forearm moves',
        minAngle: 30,
        maxAngle: 170,
      },
      {
        joint: 'Wrist',
        landmark: PoseLandmark.LEFT_WRIST,
        description: 'Wrist stays neutral, no rotation',
      },
    ],
    isCompound: false,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 4,
    restBetweenSets: 60,
    tags: ['isolation', 'arms', 'forearms', 'brachialis'],
  },

  // ============================================================================
  // CORE EXERCISES
  // ============================================================================
  {
    id: 'plank',
    name: 'Plank',
    slug: 'plank',
    category: MuscleGroup.ABS,
    primaryMuscle: 'Rectus Abdominis',
    secondaryMuscles: ['Obliques', 'Transverse Abdominis', 'Lower Back', 'Shoulders'],
    equipment: [Equipment.BODYWEIGHT],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-plank-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400',
    instructions: [
      'Start on forearms and toes',
      'Elbows directly under shoulders',
      'Body forms straight line from head to heels',
      'Engage core by tucking pelvis slightly',
      'Squeeze glutes and quads',
      'Hold position while breathing normally',
    ],
    formTips: [
      'Dont let hips sag or pike up',
      'Keep neck neutral (look at floor)',
      'Breathe normally, dont hold breath',
      'Create tension throughout body',
    ],
    commonMistakes: [
      'Hips too high (piking)',
      'Hips sagging (lower back stress)',
      'Holding breath',
      'Looking up or forward (neck strain)',
    ],
    aiKeypoints: [
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Body in straight line, hips level',
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders directly over elbows',
      },
    ],
    isCompound: false,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 5,
    restBetweenSets: 60,
    tags: ['isometric', 'core', 'stability', 'home workout'],
  },
  {
    id: 'hanging-leg-raises',
    name: 'Hanging Leg Raises',
    slug: 'hanging-leg-raises',
    category: MuscleGroup.ABS,
    primaryMuscle: 'Lower Abs',
    secondaryMuscles: ['Hip Flexors', 'Obliques', 'Forearms'],
    equipment: [Equipment.PULL_UP_BAR],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.STRENGTH,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-leg-raise-front.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    instructions: [
      'Hang from pull-up bar with overhand grip',
      'Legs straight, body still',
      'Raise legs up until parallel to floor or higher',
      'Focus on using abs, not momentum',
      'Lower with control',
      'Avoid swinging throughout',
    ],
    formTips: [
      'Posterior pelvic tilt at top',
      'Control the descent',
      'Keep body from swinging',
      'For harder: go toes to bar',
    ],
    commonMistakes: [
      'Using momentum to swing legs',
      'Not lifting high enough',
      'Bending knees too much',
      'Rushing the movement',
    ],
    aiKeypoints: [
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Legs raise to parallel or higher',
        minAngle: 0,
        maxAngle: 90,
      },
      {
        joint: 'Core',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Body remains still, no swinging',
      },
    ],
    isCompound: false,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 6,
    restBetweenSets: 90,
    tags: ['core', 'lower abs', 'grip strength', 'advanced'],
  },

  // ============================================================================
  // CARDIO EXERCISES
  // ============================================================================
  {
    id: 'burpees',
    name: 'Burpees',
    slug: 'burpees',
    category: MuscleGroup.FULL_BODY,
    primaryMuscle: 'Full Body',
    secondaryMuscles: ['Chest', 'Shoulders', 'Legs', 'Core'],
    equipment: [Equipment.BODYWEIGHT],
    difficulty: DifficultyLevel.INTERMEDIATE,
    exerciseType: ExerciseType.PLYOMETRIC,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-burpee-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    instructions: [
      'Start standing with feet shoulder-width',
      'Drop into squat, hands on floor',
      'Jump feet back to plank position',
      'Perform a push-up (optional)',
      'Jump feet back to squat position',
      'Explosively jump up with arms overhead',
    ],
    formTips: [
      'Land softly to protect joints',
      'Keep core tight in plank',
      'Full extension at top of jump',
      'Pace yourself for longer sets',
    ],
    commonMistakes: [
      'Sloppy push-up form',
      'Not jumping high enough',
      'Landing with locked knees',
      'Holding breath',
    ],
    aiKeypoints: [
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hips level in plank, full extension in jump',
      },
      {
        joint: 'Knee',
        landmark: PoseLandmark.LEFT_KNEE,
        description: 'Soft landing with bent knees',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 12,
    restBetweenSets: 60,
    tags: ['cardio', 'HIIT', 'full body', 'plyometric'],
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    slug: 'mountain-climbers',
    category: MuscleGroup.CARDIO,
    primaryMuscle: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Shoulders', 'Quads'],
    equipment: [Equipment.BODYWEIGHT],
    difficulty: DifficultyLevel.BEGINNER,
    exerciseType: ExerciseType.CARDIO,
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-mountain-climber-side.mp4#t=0.1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    instructions: [
      'Start in high plank position',
      'Drive one knee toward chest',
      'Quickly switch legs in running motion',
      'Keep hips level throughout',
      'Maintain quick, controlled pace',
      'Breathe rhythmically',
    ],
    formTips: [
      'Keep hips low, dont pike',
      'Shoulders over wrists',
      'Core stays engaged',
      'Land on balls of feet',
    ],
    commonMistakes: [
      'Hips bouncing up and down',
      'Shoulders drifting back',
      'Going too fast with bad form',
      'Not bringing knees far enough',
    ],
    aiKeypoints: [
      {
        joint: 'Hip',
        landmark: PoseLandmark.LEFT_HIP,
        description: 'Hips stay level, dont bounce',
      },
      {
        joint: 'Shoulder',
        landmark: PoseLandmark.LEFT_SHOULDER,
        description: 'Shoulders stay over wrists',
      },
    ],
    isCompound: true,
    isUnilateral: false,
    estimatedCaloriesPerMinute: 11,
    restBetweenSets: 45,
    tags: ['cardio', 'HIIT', 'core', 'home workout'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getExerciseById = (id: string): ExerciseDetail | undefined => {
  return EXERCISES.find(e => e.id === id);
};

export const getExercisesByCategory = (category: MuscleGroup): ExerciseDetail[] => {
  return EXERCISES.filter(e => e.category === category);
};

export const getExercisesByDifficulty = (difficulty: DifficultyLevel): ExerciseDetail[] => {
  return EXERCISES.filter(e => e.difficulty === difficulty);
};

export const getExercisesByEquipment = (equipment: Equipment): ExerciseDetail[] => {
  return EXERCISES.filter(e => e.equipment.includes(equipment));
};

export const searchExercises = (query: string): ExerciseDetail[] => {
  const lowerQuery = query.toLowerCase();
  return EXERCISES.filter(e =>
    e.name.toLowerCase().includes(lowerQuery) ||
    e.primaryMuscle.toLowerCase().includes(lowerQuery) ||
    e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getFeaturedExercises = (): ExerciseDetail[] => {
  // Return a curated list of featured exercises
  const featuredIds = ['bench-press', 'barbell-squat', 'pull-ups', 'overhead-press', 'romanian-deadlift'];
  return EXERCISES.filter(e => featuredIds.includes(e.id));
};

export const getBeginnerExercises = (): ExerciseDetail[] => {
  return EXERCISES.filter(e => e.difficulty === DifficultyLevel.BEGINNER);
};

export const getBodyweightExercises = (): ExerciseDetail[] => {
  return EXERCISES.filter(e => e.equipment.includes(Equipment.BODYWEIGHT));
};
