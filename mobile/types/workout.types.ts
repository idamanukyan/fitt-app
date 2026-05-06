/**
 * Workout Type Definitions
 * Matching backend schemas for exercises, workout templates, user workouts, and sessions
 */

// ========== Exercise Types ==========

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  OBLIQUES = 'obliques',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  FULL_BODY = 'full_body',
  CARDIO = 'cardio',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  KETTLEBELL = 'kettlebell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  RESISTANCE_BAND = 'resistance_band',
  MEDICINE_BALL = 'medicine_ball',
  FOAM_ROLLER = 'foam_roller',
  PULL_UP_BAR = 'pull_up_bar',
  BENCH = 'bench',
  NONE = 'none',
}

export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  PLYOMETRIC = 'plyometric',
  POWERLIFTING = 'powerlifting',
  OLYMPIC_WEIGHTLIFTING = 'olympic_weightlifting',
  CALISTHENICS = 'calisthenics',
  STRETCHING = 'stretching',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface Exercise {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  muscle_group: MuscleGroup;
  secondary_muscles: string | null;
  exercise_type: ExerciseType;
  equipment: Equipment;
  difficulty: DifficultyLevel;
  instructions: string | null;
  form_tips: string | null;
  common_mistakes: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  gif_url: string | null;
  is_compound: boolean;
  is_unilateral: boolean;
  is_popular: boolean;
  is_active: boolean;
  tracks_weight: boolean;
  tracks_reps: boolean;
  tracks_time: boolean;
  tracks_distance: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ExerciseFilters {
  muscle_group?: MuscleGroup;
  equipment?: Equipment;
  exercise_type?: ExerciseType;
  difficulty?: DifficultyLevel;
  search?: string;
  is_popular?: boolean;
}

// ========== Workout Template Types ==========

export enum WorkoutType {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  POWERLIFTING = 'powerlifting',
  CARDIO = 'cardio',
  HIIT = 'hiit',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  CROSSFIT = 'crossfit',
  BODYWEIGHT = 'bodyweight',
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  FULL_BODY = 'full_body',
  UPPER_BODY = 'upper_body',
  LOWER_BODY = 'lower_body',
  PUSH = 'push',
  PULL = 'pull',
  LEGS = 'legs',
}

export interface WorkoutTemplateExercise {
  id: number;
  exercise_id: number;
  exercise_name?: string;
  order_index: number;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
  notes: string | null;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  workout_type: WorkoutType;
  difficulty_level: string | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  is_public: boolean;
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_by_user_id: number | null;
  created_by_coach: boolean;
  thumbnail_url: string | null;
  video_url: string | null;
  times_used: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string | null;
  exercises: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateSummary {
  id: number;
  name: string;
  slug: string;
  workout_type: WorkoutType;
  difficulty_level: string | null;
  duration_minutes: number | null;
  is_premium: boolean;
  is_featured: boolean;
  thumbnail_url: string | null;
  times_used: number;
  rating_average: number;
}

export interface WorkoutTemplateListResponse {
  total: number;
  page: number;
  page_size: number;
  templates: WorkoutTemplateSummary[];
}

// ========== User Workout Types ==========

export interface WorkoutExercise {
  id: number;
  exercise_id: number;
  exercise_name?: string;
  order_index: number;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
  notes: string | null;
}

export interface UserWorkout {
  id: number;
  user_id: number;
  template_id: number | null;
  name: string;
  description: string | null;
  workout_type: WorkoutType;
  is_active: boolean;
  is_favorite: boolean;
  times_completed: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string | null;
  exercises: WorkoutExercise[];
}

export interface UserWorkoutSummary {
  id: number;
  name: string;
  workout_type: WorkoutType;
  is_favorite: boolean;
  times_completed: number;
  last_completed: string | null;
}

export interface UserWorkoutCreate {
  template_id?: number;
  name: string;
  description?: string;
  workout_type: WorkoutType;
  exercises: {
    exercise_id: number;
    order_index: number;
    sets?: number;
    reps?: number;
    duration_seconds?: number;
    rest_seconds?: number;
    notes?: string;
  }[];
}

export interface UserWorkoutUpdate {
  name?: string;
  description?: string;
  workout_type?: WorkoutType;
  is_active?: boolean;
  is_favorite?: boolean;
}

// ========== Workout Session Types ==========

export interface SetData {
  set: number;
  reps?: number;
  weight?: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: number;
  exercise_id: number;
  exercise_name?: string;
  order_index: number;
  sets_data: string | null;
  total_sets: number;
  total_reps: number;
  max_weight: number | null;
  total_volume: number;
  duration_seconds: number | null;
  distance_km: number | null;
  notes: string | null;
  personal_record: boolean;
  created_at: string;
}

export interface WorkoutSession {
  id: number;
  user_id: number;
  user_workout_id: number | null;
  title: string | null;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  total_volume: number;
  total_reps: number;
  total_exercises: number;
  calories_burned: number | null;
  is_completed: boolean;
  rating: number | null;
  created_at: string;
  exercise_logs: ExerciseLog[];
}

export interface WorkoutSessionSummary {
  id: number;
  title: string | null;
  started_at: string;
  duration_minutes: number | null;
  total_exercises: number;
  total_volume: number;
  is_completed: boolean;
  rating: number | null;
}

export interface WorkoutSessionCreate {
  client_id?: string;
  user_workout_id?: number;
  title?: string;
  notes?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  total_volume?: number;
  total_reps?: number;
  total_exercises?: number;
  calories_burned?: number;
  is_completed?: boolean;
  rating?: number;
  exercise_logs: {
    exercise_id: number;
    order_index: number;
    sets_data?: string;
    total_sets?: number;
    total_reps?: number;
    max_weight?: number;
    total_volume?: number;
    duration_seconds?: number;
    distance_km?: number;
    notes?: string;
    personal_record?: boolean;
  }[];
}

export interface WorkoutSessionUpdate {
  title?: string;
  notes?: string;
  ended_at?: string;
  duration_minutes?: number;
  total_volume?: number;
  total_reps?: number;
  total_exercises?: number;
  calories_burned?: number;
  is_completed?: boolean;
  rating?: number;
}

// ========== Statistics Types ==========

export interface WorkoutStats {
  total_workouts: number;
  total_sessions: number;
  completed_sessions: number;
  total_volume_kg: number;
  total_reps: number;
  total_exercises: number;
  average_duration_minutes: number;
  favorite_muscle_group: string | null;
  total_workout_time_minutes: number;
}
