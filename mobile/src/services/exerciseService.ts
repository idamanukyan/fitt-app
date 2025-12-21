/**
 * Exercise Service - WGER API Integration with Caching
 */

import { Exercise, ExerciseSearchResult, Difficulty } from '../types/exercise';
import {
  getFromCache,
  saveToCache,
  TTL,
  searchCacheKey,
  exerciseCacheKey,
} from '../storage/cache';
import {
  MOCK_EXERCISES,
  getMockExercisesByCategory,
  searchMockExercises,
  getMockExerciseById,
} from '../mock/exercises';

const WGER_BASE_URL = 'https://wger.de/api/v2';

// WGER API Response Types
interface WGERExercise {
  id: number;
  uuid: string;
  name: string;
  exercise_base: number;
  description: string;
  creation_date: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  language: number;
  license: number;
  license_author: string;
  variations: number[];
}

interface WGERExerciseInfo {
  id: number;
  name: string;
  aliases: string[];
  uuid: string;
  exercise_base_id: number;
  description: string;
  created: string;
  category: { id: number; name: string };
  muscles: { id: number; name: string; name_en: string; is_front: boolean }[];
  muscles_secondary: { id: number; name: string; name_en: string; is_front: boolean }[];
  equipment: { id: number; name: string }[];
  language: { id: number; short_name: string };
  images: { id: number; uuid: string; image: string; is_main: boolean }[];
  videos: { id: number; uuid: string; video: string }[];
}

interface WGERSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WGERExercise[];
}

interface WGERExerciseInfoResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WGERExerciseInfo[];
}

// Muscle ID to Name mapping
const MUSCLE_MAP: Record<number, string> = {
  1: 'Biceps',
  2: 'Shoulders',
  3: 'Serratus',
  4: 'Chest',
  5: 'Triceps',
  6: 'Abs',
  7: 'Calves',
  8: 'Glutes',
  9: 'Traps',
  10: 'Quads',
  11: 'Hamstrings',
  12: 'Lats',
  13: 'Brachialis',
  14: 'Obliques',
  15: 'Soleus',
};

// Equipment ID to Name mapping
const EQUIPMENT_MAP: Record<number, string> = {
  1: 'Barbell',
  2: 'SZ-Bar',
  3: 'Dumbbell',
  4: 'Gym Mat',
  5: 'Swiss Ball',
  6: 'Pull-up Bar',
  7: 'Bodyweight',
  8: 'Bench',
  9: 'Incline Bench',
  10: 'Kettlebell',
};

// Category ID to Name mapping
const CATEGORY_MAP: Record<number, string> = {
  8: 'Arms',
  9: 'Legs',
  10: 'Abs',
  11: 'Chest',
  12: 'Back',
  13: 'Shoulders',
  14: 'Calves',
  15: 'Cardio',
};

/**
 * Normalize WGER exercise to our Exercise type
 */
function normalizeExercise(wgerExercise: WGERExerciseInfo): Exercise {
  const primaryMuscles = wgerExercise.muscles.map(m => m.name_en || m.name);
  const secondaryMuscles = wgerExercise.muscles_secondary.map(m => m.name_en || m.name);
  const equipment = wgerExercise.equipment.map(e => e.name);

  // Get main image if available
  const mainImage = wgerExercise.images.find(img => img.is_main) || wgerExercise.images[0];
  const thumbnailUrl = mainImage ? mainImage.image : null;

  // Parse description for instructions
  const description = wgerExercise.description || '';
  const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
  const instructions = cleanDescription
    ? cleanDescription.split(/[.!]/).filter(s => s.trim().length > 10).map(s => s.trim())
    : [];

  // Determine difficulty based on equipment and compound nature
  let difficulty: Difficulty = 'Intermediate';
  const isCompound = primaryMuscles.length + secondaryMuscles.length > 2;
  if (equipment.includes('Bodyweight') && !isCompound) {
    difficulty = 'Beginner';
  } else if (equipment.includes('Barbell') && isCompound) {
    difficulty = 'Intermediate';
  }

  return {
    id: `wger-${wgerExercise.id}`,
    name: wgerExercise.name,
    primaryMuscles,
    secondaryMuscles,
    equipment: equipment.length > 0 ? equipment : ['Bodyweight'],
    difficulty,
    instructions: instructions.length > 0 ? instructions : ['Perform the exercise with proper form'],
    tips: generateTips(primaryMuscles),
    mistakes: generateMistakes(primaryMuscles),
    gifUrl: null, // WGER doesn't provide GIFs
    thumbnailUrl,
    category: wgerExercise.category?.name || 'General',
    isCompound,
    caloriesPerMinute: isCompound ? 7 : 4,
  };
}

/**
 * Generate tips based on muscle group
 */
function generateTips(muscles: string[]): string[] {
  const tips: string[] = ['Focus on controlled movement', 'Breathe steadily throughout'];

  if (muscles.some(m => m.toLowerCase().includes('chest'))) {
    tips.push('Keep shoulder blades retracted');
  }
  if (muscles.some(m => m.toLowerCase().includes('back') || m.toLowerCase().includes('lat'))) {
    tips.push('Lead with your elbows');
  }
  if (muscles.some(m => m.toLowerCase().includes('leg') || m.toLowerCase().includes('quad'))) {
    tips.push('Keep knees tracking over toes');
  }

  return tips;
}

/**
 * Generate common mistakes based on muscle group
 */
function generateMistakes(muscles: string[]): string[] {
  const mistakes: string[] = ['Using momentum instead of control'];

  if (muscles.some(m => m.toLowerCase().includes('chest'))) {
    mistakes.push('Flaring elbows too wide');
  }
  if (muscles.some(m => m.toLowerCase().includes('back'))) {
    mistakes.push('Rounding the back');
  }
  if (muscles.some(m => m.toLowerCase().includes('bicep'))) {
    mistakes.push('Swinging body for momentum');
  }

  return mistakes;
}

/**
 * Search exercises by query
 */
export async function searchExercises(query: string): Promise<ExerciseSearchResult> {
  const cacheKey = searchCacheKey(query);

  // Check cache first
  const cached = await getFromCache<Exercise[]>(cacheKey);
  if (cached) {
    return { exercises: cached, fromCache: true, isMock: false };
  }

  try {
    // Fetch from WGER API
    const response = await fetch(
      `${WGER_BASE_URL}/exerciseinfo/?language=2&limit=50&search=${encodeURIComponent(query)}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: WGERExerciseInfoResponse = await response.json();
    const exercises = data.results.map(normalizeExercise);

    // Cache results
    await saveToCache(cacheKey, exercises, TTL.SEARCH_RESULTS);

    return { exercises, fromCache: false, isMock: false };
  } catch (error) {
    console.warn('WGER API failed, using mock data:', error);
    const mockResults = searchMockExercises(query);
    return { exercises: mockResults, fromCache: false, isMock: true };
  }
}

/**
 * Get exercises by muscle group
 */
export async function getExercisesByMuscle(muscleId: number): Promise<ExerciseSearchResult> {
  const cacheKey = searchCacheKey('', muscleId);

  // Check cache first
  const cached = await getFromCache<Exercise[]>(cacheKey);
  if (cached) {
    return { exercises: cached, fromCache: true, isMock: false };
  }

  try {
    const response = await fetch(
      `${WGER_BASE_URL}/exerciseinfo/?language=2&limit=50&muscles=${muscleId}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: WGERExerciseInfoResponse = await response.json();
    const exercises = data.results.map(normalizeExercise);

    // Cache results
    await saveToCache(cacheKey, exercises, TTL.SEARCH_RESULTS);

    return { exercises, fromCache: false, isMock: false };
  } catch (error) {
    console.warn('WGER API failed, using mock data:', error);
    const muscleName = MUSCLE_MAP[muscleId] || 'all';
    const mockResults = getMockExercisesByCategory(muscleName);
    return { exercises: mockResults, fromCache: false, isMock: true };
  }
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id: string | number): Promise<Exercise | null> {
  const stringId = String(id);

  // Handle mock IDs
  if (stringId.startsWith('mock-')) {
    return getMockExerciseById(stringId);
  }

  // Handle WGER IDs
  const wgerId = stringId.startsWith('wger-') ? stringId.replace('wger-', '') : stringId;
  const cacheKey = exerciseCacheKey(wgerId);

  // Check cache first
  const cached = await getFromCache<Exercise>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${WGER_BASE_URL}/exerciseinfo/${wgerId}/`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: WGERExerciseInfo = await response.json();
    const exercise = normalizeExercise(data);

    // Cache result
    await saveToCache(cacheKey, exercise, TTL.EXERCISE_DETAIL);

    return exercise;
  } catch (error) {
    console.warn('WGER API failed, trying mock data:', error);
    // Try to find in mock by name similarity
    return getMockExerciseById(stringId) || MOCK_EXERCISES[0];
  }
}

/**
 * Get featured/popular exercises
 */
export async function getFeaturedExercises(): Promise<ExerciseSearchResult> {
  const cacheKey = 'featured_exercises';

  // Check cache first
  const cached = await getFromCache<Exercise[]>(cacheKey);
  if (cached) {
    return { exercises: cached, fromCache: true, isMock: false };
  }

  try {
    // Fetch popular compound exercises
    const response = await fetch(
      `${WGER_BASE_URL}/exerciseinfo/?language=2&limit=20`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: WGERExerciseInfoResponse = await response.json();
    const exercises = data.results
      .map(normalizeExercise)
      .filter(e => e.name.length > 3) // Filter out empty/short names
      .slice(0, 12);

    // Cache results
    await saveToCache(cacheKey, exercises, TTL.SEARCH_RESULTS);

    return { exercises, fromCache: false, isMock: false };
  } catch (error) {
    console.warn('WGER API failed, using mock data:', error);
    return { exercises: MOCK_EXERCISES, fromCache: false, isMock: true };
  }
}

/**
 * Get exercises by category name
 */
export async function getExercisesByCategory(category: string): Promise<ExerciseSearchResult> {
  if (category === 'all') {
    return getFeaturedExercises();
  }

  // Find muscle ID for category
  const categoryLower = category.toLowerCase();
  let muscleId: number | null = null;

  for (const [id, name] of Object.entries(MUSCLE_MAP)) {
    if (name.toLowerCase().includes(categoryLower)) {
      muscleId = parseInt(id);
      break;
    }
  }

  if (muscleId) {
    return getExercisesByMuscle(muscleId);
  }

  // Fallback to search
  return searchExercises(category);
}

export default {
  searchExercises,
  getExercisesByMuscle,
  getExerciseById,
  getFeaturedExercises,
  getExercisesByCategory,
};
