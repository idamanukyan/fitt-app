/**
 * Exercise Types - Normalized exercise model
 */

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty?: Difficulty;
  instructions: string[];
  tips: string[];
  mistakes: string[];
  gifUrl?: string | null;
  thumbnailUrl?: string | null;
  category?: string;
  isCompound?: boolean;
  caloriesPerMinute?: number;
}

export interface MuscleGroup {
  id: number;
  name: string;
  nameEn: string;
  isFront: boolean;
}

export interface ExerciseSearchResult {
  exercises: Exercise[];
  fromCache: boolean;
  isMock: boolean;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  icon: string;
  muscleId?: number;
}

export const MUSCLE_CATEGORIES: ExerciseCategory[] = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'chest', name: 'Chest', icon: 'body', muscleId: 4 },
  { id: 'back', name: 'Back', icon: 'fitness', muscleId: 12 },
  { id: 'shoulders', name: 'Shoulders', icon: 'body', muscleId: 2 },
  { id: 'biceps', name: 'Biceps', icon: 'arm', muscleId: 1 },
  { id: 'triceps', name: 'Triceps', icon: 'arm', muscleId: 5 },
  { id: 'legs', name: 'Legs', icon: 'walk', muscleId: 10 },
  { id: 'abs', name: 'Core', icon: 'body', muscleId: 6 },
  { id: 'glutes', name: 'Glutes', icon: 'body', muscleId: 8 },
];
