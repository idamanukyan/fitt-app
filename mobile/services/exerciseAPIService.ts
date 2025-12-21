/**
 * Exercise API Service - Integration with External Exercise Databases
 * Supports: ExerciseDB (RapidAPI), WGER, API Ninjas
 */

import { ExerciseDetail, PoseLandmark } from '../types/training.types';
import { MuscleGroup, Equipment, DifficultyLevel, ExerciseType } from '../types/workout.types';

// API Configuration
const API_CONFIG = {
  exerciseDB: {
    baseUrl: 'https://exercisedb.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY || 'demo-key',
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    },
  },
  wger: {
    baseUrl: 'https://wger.de/api/v2',
    headers: {
      'Accept': 'application/json',
    },
  },
  apiNinjas: {
    baseUrl: 'https://api.api-ninjas.com/v1',
    headers: {
      'X-Api-Key': process.env.EXPO_PUBLIC_API_NINJAS_KEY || 'demo-key',
    },
  },
};

// ============================================================================
// TYPES
// ============================================================================

interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles: string[];
  instructions: string[];
}

interface WGERExercise {
  id: number;
  name: string;
  description: string;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  category: number;
}

interface APINinjasExercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

// ============================================================================
// MAPPERS
// ============================================================================

const mapBodyPartToMuscleGroup = (bodyPart: string): MuscleGroup => {
  const mapping: Record<string, MuscleGroup> = {
    'chest': MuscleGroup.CHEST,
    'back': MuscleGroup.BACK,
    'shoulders': MuscleGroup.SHOULDERS,
    'upper arms': MuscleGroup.BICEPS,
    'lower arms': MuscleGroup.FOREARMS,
    'upper legs': MuscleGroup.QUADS,
    'lower legs': MuscleGroup.CALVES,
    'waist': MuscleGroup.ABS,
    'cardio': MuscleGroup.CARDIO,
  };
  return mapping[bodyPart.toLowerCase()] || MuscleGroup.FULL_BODY;
};

const mapEquipmentString = (equipment: string): Equipment[] => {
  const mapping: Record<string, Equipment> = {
    'barbell': Equipment.BARBELL,
    'dumbbell': Equipment.DUMBBELL,
    'cable': Equipment.CABLE,
    'machine': Equipment.MACHINE,
    'body weight': Equipment.BODYWEIGHT,
    'kettlebell': Equipment.KETTLEBELL,
    'band': Equipment.RESISTANCE_BAND,
    'ez barbell': Equipment.BARBELL,
    'smith machine': Equipment.MACHINE,
    'leverage machine': Equipment.MACHINE,
  };
  return [mapping[equipment.toLowerCase()] || Equipment.NONE];
};

const mapDifficultyString = (difficulty: string): DifficultyLevel => {
  const mapping: Record<string, DifficultyLevel> = {
    'beginner': DifficultyLevel.BEGINNER,
    'intermediate': DifficultyLevel.INTERMEDIATE,
    'advanced': DifficultyLevel.ADVANCED,
    'expert': DifficultyLevel.EXPERT,
  };
  return mapping[difficulty.toLowerCase()] || DifficultyLevel.INTERMEDIATE;
};

const generateAIKeypoints = (target: string, bodyPart: string): ExerciseDetail['aiKeypoints'] => {
  // Generate basic AI keypoints based on target muscle
  const keypoints: ExerciseDetail['aiKeypoints'] = [];

  if (bodyPart.includes('arm') || target.includes('biceps') || target.includes('triceps')) {
    keypoints.push({
      joint: 'Elbow',
      landmark: PoseLandmark.LEFT_ELBOW,
      description: 'Elbow stays pinned at side',
      minAngle: 30,
      maxAngle: 170,
    });
  }

  if (bodyPart.includes('leg') || target.includes('quad') || target.includes('glute')) {
    keypoints.push({
      joint: 'Knee',
      landmark: PoseLandmark.LEFT_KNEE,
      description: 'Knee tracks over toes',
      minAngle: 70,
      maxAngle: 180,
    });
    keypoints.push({
      joint: 'Hip',
      landmark: PoseLandmark.LEFT_HIP,
      description: 'Hip hinge maintained',
      minAngle: 60,
      maxAngle: 180,
    });
  }

  if (bodyPart.includes('chest') || bodyPart.includes('shoulder')) {
    keypoints.push({
      joint: 'Shoulder',
      landmark: PoseLandmark.LEFT_SHOULDER,
      description: 'Shoulders stay retracted',
    });
    keypoints.push({
      joint: 'Elbow',
      landmark: PoseLandmark.LEFT_ELBOW,
      description: 'Elbow angle controlled',
      minAngle: 45,
      maxAngle: 90,
    });
  }

  if (bodyPart.includes('back')) {
    keypoints.push({
      joint: 'Spine',
      landmark: PoseLandmark.LEFT_HIP,
      description: 'Back remains flat',
    });
  }

  return keypoints.length > 0 ? keypoints : [{
    joint: 'Core',
    landmark: PoseLandmark.LEFT_HIP,
    description: 'Maintain core stability',
  }];
};

// ============================================================================
// EXERCISEDB API (Primary - Has GIFs)
// ============================================================================

export const fetchExercisesFromExerciseDB = async (
  limit: number = 50,
  offset: number = 0
): Promise<ExerciseDetail[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.exerciseDB.baseUrl}/exercises?limit=${limit}&offset=${offset}`,
      { headers: API_CONFIG.exerciseDB.headers }
    );

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    const data: ExerciseDBExercise[] = await response.json();
    return data.map(mapExerciseDBToDetail);
  } catch (error) {
    console.error('ExerciseDB fetch error:', error);
    return [];
  }
};

export const fetchExercisesByBodyPart = async (bodyPart: string): Promise<ExerciseDetail[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.exerciseDB.baseUrl}/exercises/bodyPart/${bodyPart}`,
      { headers: API_CONFIG.exerciseDB.headers }
    );

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    const data: ExerciseDBExercise[] = await response.json();
    return data.map(mapExerciseDBToDetail);
  } catch (error) {
    console.error('ExerciseDB fetch error:', error);
    return [];
  }
};

export const fetchExercisesByTarget = async (target: string): Promise<ExerciseDetail[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.exerciseDB.baseUrl}/exercises/target/${target}`,
      { headers: API_CONFIG.exerciseDB.headers }
    );

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    const data: ExerciseDBExercise[] = await response.json();
    return data.map(mapExerciseDBToDetail);
  } catch (error) {
    console.error('ExerciseDB fetch error:', error);
    return [];
  }
};

export const searchExerciseDBByName = async (name: string): Promise<ExerciseDetail[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.exerciseDB.baseUrl}/exercises/name/${encodeURIComponent(name)}`,
      { headers: API_CONFIG.exerciseDB.headers }
    );

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    const data: ExerciseDBExercise[] = await response.json();
    return data.map(mapExerciseDBToDetail);
  } catch (error) {
    console.error('ExerciseDB search error:', error);
    return [];
  }
};

const mapExerciseDBToDetail = (exercise: ExerciseDBExercise): ExerciseDetail => ({
  id: `exercisedb-${exercise.id}`,
  name: exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1),
  slug: exercise.name.toLowerCase().replace(/\s+/g, '-'),
  category: mapBodyPartToMuscleGroup(exercise.bodyPart),
  primaryMuscle: exercise.target.charAt(0).toUpperCase() + exercise.target.slice(1),
  secondaryMuscles: exercise.secondaryMuscles.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
  equipment: mapEquipmentString(exercise.equipment),
  difficulty: DifficultyLevel.INTERMEDIATE, // ExerciseDB doesn't provide difficulty
  exerciseType: ExerciseType.STRENGTH,
  gifUrl: exercise.gifUrl,
  thumbnailUrl: exercise.gifUrl, // Use GIF as thumbnail
  instructions: exercise.instructions,
  formTips: generateFormTips(exercise.target),
  commonMistakes: generateCommonMistakes(exercise.target),
  aiKeypoints: generateAIKeypoints(exercise.target, exercise.bodyPart),
  isCompound: exercise.secondaryMuscles.length > 1,
  isUnilateral: exercise.name.toLowerCase().includes('single') || exercise.name.toLowerCase().includes('one'),
  estimatedCaloriesPerMinute: estimateCalories(exercise.bodyPart),
  restBetweenSets: estimateRest(exercise.bodyPart),
  tags: [exercise.bodyPart, exercise.target, exercise.equipment].filter(Boolean),
});

// ============================================================================
// WGER API (Open Source - Good Descriptions)
// ============================================================================

export const fetchExercisesFromWGER = async (
  limit: number = 50,
  offset: number = 0,
  language: number = 2 // English
): Promise<ExerciseDetail[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.wger.baseUrl}/exercise/?language=${language}&limit=${limit}&offset=${offset}`,
      { headers: API_CONFIG.wger.headers }
    );

    if (!response.ok) {
      throw new Error(`WGER API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map(mapWGERToDetail);
  } catch (error) {
    console.error('WGER fetch error:', error);
    return [];
  }
};

const mapWGERToDetail = (exercise: WGERExercise): ExerciseDetail => ({
  id: `wger-${exercise.id}`,
  name: exercise.name,
  slug: exercise.name.toLowerCase().replace(/\s+/g, '-'),
  category: MuscleGroup.FULL_BODY, // Would need muscle mapping
  primaryMuscle: 'Primary Muscle',
  secondaryMuscles: [],
  equipment: [Equipment.NONE],
  difficulty: DifficultyLevel.INTERMEDIATE,
  exerciseType: ExerciseType.STRENGTH,
  gifUrl: '',
  thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  instructions: exercise.description ? [exercise.description] : [],
  formTips: [],
  commonMistakes: [],
  aiKeypoints: [],
  isCompound: exercise.muscles.length > 1,
  isUnilateral: false,
  estimatedCaloriesPerMinute: 5,
  restBetweenSets: 90,
  tags: [],
});

// ============================================================================
// API NINJAS (Simple & Fast)
// ============================================================================

export const fetchExercisesFromAPINinjas = async (
  muscle?: string,
  type?: string,
  difficulty?: string
): Promise<ExerciseDetail[]> => {
  try {
    const params = new URLSearchParams();
    if (muscle) params.append('muscle', muscle);
    if (type) params.append('type', type);
    if (difficulty) params.append('difficulty', difficulty);

    const response = await fetch(
      `${API_CONFIG.apiNinjas.baseUrl}/exercises?${params.toString()}`,
      { headers: API_CONFIG.apiNinjas.headers }
    );

    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status}`);
    }

    const data: APINinjasExercise[] = await response.json();
    return data.map(mapAPINinjasToDetail);
  } catch (error) {
    console.error('API Ninjas fetch error:', error);
    return [];
  }
};

const mapAPINinjasToDetail = (exercise: APINinjasExercise): ExerciseDetail => ({
  id: `ninjas-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`,
  name: exercise.name,
  slug: exercise.name.toLowerCase().replace(/\s+/g, '-'),
  category: mapBodyPartToMuscleGroup(exercise.muscle),
  primaryMuscle: exercise.muscle.charAt(0).toUpperCase() + exercise.muscle.slice(1),
  secondaryMuscles: [],
  equipment: mapEquipmentString(exercise.equipment),
  difficulty: mapDifficultyString(exercise.difficulty),
  exerciseType: mapExerciseType(exercise.type),
  gifUrl: '',
  thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  instructions: exercise.instructions.split('. ').filter(Boolean),
  formTips: generateFormTips(exercise.muscle),
  commonMistakes: generateCommonMistakes(exercise.muscle),
  aiKeypoints: generateAIKeypoints(exercise.muscle, exercise.muscle),
  isCompound: exercise.type === 'compound',
  isUnilateral: exercise.name.toLowerCase().includes('single'),
  estimatedCaloriesPerMinute: estimateCalories(exercise.muscle),
  restBetweenSets: estimateRest(exercise.muscle),
  tags: [exercise.muscle, exercise.type, exercise.difficulty, exercise.equipment].filter(Boolean),
});

const mapExerciseType = (type: string): ExerciseType => {
  const mapping: Record<string, ExerciseType> = {
    'strength': ExerciseType.STRENGTH,
    'stretching': ExerciseType.STRETCHING,
    'plyometrics': ExerciseType.PLYOMETRIC,
    'cardio': ExerciseType.CARDIO,
    'olympic_weightlifting': ExerciseType.OLYMPIC_WEIGHTLIFTING,
    'strongman': ExerciseType.POWERLIFTING,
    'powerlifting': ExerciseType.POWERLIFTING,
  };
  return mapping[type.toLowerCase()] || ExerciseType.STRENGTH;
};

// ============================================================================
// HELPER GENERATORS
// ============================================================================

const generateFormTips = (target: string): string[] => {
  const tips: Record<string, string[]> = {
    'chest': ['Keep shoulder blades retracted', 'Control the negative', 'Full range of motion'],
    'back': ['Lead with elbows', 'Squeeze shoulder blades', 'Keep back flat'],
    'shoulders': ['Avoid excessive arching', 'Control the weight', 'Full lockout at top'],
    'biceps': ['Keep elbows pinned', 'Squeeze at the top', 'Full extension at bottom'],
    'triceps': ['Elbows stay stationary', 'Full lockout', 'Control the negative'],
    'quads': ['Knees track over toes', 'Drive through heels', 'Keep chest up'],
    'glutes': ['Squeeze at the top', 'Mind-muscle connection', 'Full hip extension'],
    'hamstrings': ['Feel the stretch', 'Hips back first', 'Maintain flat back'],
    'abs': ['Brace your core', 'Control breathing', 'Avoid neck strain'],
  };

  const key = Object.keys(tips).find(k => target.toLowerCase().includes(k));
  return tips[key || 'chest'] || ['Focus on form', 'Control the movement', 'Breathe properly'];
};

const generateCommonMistakes = (target: string): string[] => {
  const mistakes: Record<string, string[]> = {
    'chest': ['Bouncing the weight', 'Flaring elbows', 'Incomplete range of motion'],
    'back': ['Using momentum', 'Rounding the back', 'Not squeezing at contraction'],
    'shoulders': ['Excessive back arch', 'Using too much weight', 'Shrugging'],
    'biceps': ['Swinging body', 'Partial reps', 'Elbows moving forward'],
    'triceps': ['Flaring elbows', 'Using shoulders', 'Rushing the movement'],
    'quads': ['Knees caving in', 'Not hitting depth', 'Rising with hips first'],
    'glutes': ['Not squeezing', 'Lower back taking over', 'Rushing through reps'],
    'hamstrings': ['Rounding back', 'Bending knees too much', 'Not feeling stretch'],
    'abs': ['Using momentum', 'Holding breath', 'Neck strain'],
  };

  const key = Object.keys(mistakes).find(k => target.toLowerCase().includes(k));
  return mistakes[key || 'chest'] || ['Poor form', 'Using momentum', 'Not full range'];
};

const estimateCalories = (bodyPart: string): number => {
  const calorieMap: Record<string, number> = {
    'chest': 7,
    'back': 8,
    'legs': 10,
    'upper legs': 10,
    'lower legs': 6,
    'shoulders': 6,
    'upper arms': 4,
    'lower arms': 3,
    'waist': 5,
    'cardio': 12,
  };
  return calorieMap[bodyPart.toLowerCase()] || 5;
};

const estimateRest = (bodyPart: string): number => {
  const restMap: Record<string, number> = {
    'chest': 120,
    'back': 120,
    'legs': 180,
    'upper legs': 180,
    'lower legs': 90,
    'shoulders': 90,
    'upper arms': 60,
    'lower arms': 45,
    'waist': 60,
    'cardio': 30,
  };
  return restMap[bodyPart.toLowerCase()] || 90;
};

// ============================================================================
// UNIFIED FETCH (with fallback)
// ============================================================================

export const fetchExercisesUnified = async (
  options: {
    source?: 'exercisedb' | 'wger' | 'ninjas' | 'all';
    limit?: number;
    muscle?: string;
    bodyPart?: string;
  } = {}
): Promise<ExerciseDetail[]> => {
  const { source = 'exercisedb', limit = 50, muscle, bodyPart } = options;

  try {
    switch (source) {
      case 'exercisedb':
        if (bodyPart) {
          return await fetchExercisesByBodyPart(bodyPart);
        }
        return await fetchExercisesFromExerciseDB(limit);

      case 'wger':
        return await fetchExercisesFromWGER(limit);

      case 'ninjas':
        return await fetchExercisesFromAPINinjas(muscle);

      case 'all':
        const [exerciseDB, wger, ninjas] = await Promise.allSettled([
          fetchExercisesFromExerciseDB(Math.floor(limit / 3)),
          fetchExercisesFromWGER(Math.floor(limit / 3)),
          fetchExercisesFromAPINinjas(muscle),
        ]);

        return [
          ...(exerciseDB.status === 'fulfilled' ? exerciseDB.value : []),
          ...(wger.status === 'fulfilled' ? wger.value : []),
          ...(ninjas.status === 'fulfilled' ? ninjas.value : []),
        ];

      default:
        return await fetchExercisesFromExerciseDB(limit);
    }
  } catch (error) {
    console.error('Unified fetch error:', error);
    return [];
  }
};

export default {
  fetchExercisesFromExerciseDB,
  fetchExercisesByBodyPart,
  fetchExercisesByTarget,
  searchExerciseDBByName,
  fetchExercisesFromWGER,
  fetchExercisesFromAPINinjas,
  fetchExercisesUnified,
};
