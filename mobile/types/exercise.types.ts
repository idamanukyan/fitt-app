/**
 * Exercise Types - MuscleWiki-based Exercise Library Types
 * Matches backend schema for Discover and Train sections.
 *
 * Key concepts:
 * - DISCOVER: Global exercise library (read-only for users)
 * - TRAIN: User-owned content (saved exercises, custom exercises, history)
 * - Gender variants: Male/female demonstration media
 * - Rehab: Pain-focused exercises with contraindications
 * - i18n: English + German support
 */

// ============================================================================
// ENUMS - Matching backend exactly
// ============================================================================

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  OBLIQUES = 'obliques',
  CORE = 'core',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  HIP_FLEXORS = 'hip_flexors',
  ADDUCTORS = 'adductors',
  ABDUCTORS = 'abductors',
  TRAPS = 'traps',
  LATS = 'lats',
  LOWER_BACK = 'lower_back',
  NECK = 'neck',
  FULL_BODY = 'full_body',
}

export enum BodyPart {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  CORE = 'core',
  LEGS = 'legs',
  GLUTES = 'glutes',
  FULL_BODY = 'full_body',
}

export enum Equipment {
  BODYWEIGHT = 'bodyweight',
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  KETTLEBELL = 'kettlebell',
  MACHINE = 'machine',
  CABLE = 'cable',
  SMITH_MACHINE = 'smith_machine',
  EZ_BAR = 'ez_bar',
  TRAP_BAR = 'trap_bar',
  RESISTANCE_BAND = 'resistance_band',
  MEDICINE_BALL = 'medicine_ball',
  STABILITY_BALL = 'stability_ball',
  FOAM_ROLLER = 'foam_roller',
  PULL_UP_BAR = 'pull_up_bar',
  DIP_BARS = 'dip_bars',
  BENCH = 'bench',
  BOX = 'box',
  TRX = 'trx',
  NONE = 'none',
  OTHER = 'other',
}

export enum ExerciseCategory {
  STRENGTH = 'strength',
  STRETCHING = 'stretching',
  MOBILITY = 'mobility',
  REHAB = 'rehab',
  CARDIO = 'cardio',
  PLYOMETRIC = 'plyometric',
  POWERLIFTING = 'powerlifting',
  OLYMPIC = 'olympic',
  CALISTHENICS = 'calisthenics',
  YOGA = 'yoga',
  WARMUP = 'warmup',
  COOLDOWN = 'cooldown',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum ExerciseGender {
  MALE = 'male',
  FEMALE = 'female',
  UNISEX = 'unisex',
}

export enum ExercisePurpose {
  HYPERTROPHY = 'hypertrophy',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  POWER = 'power',
  FAT_LOSS = 'fat_loss',
  REHAB = 'rehab',
  PAIN_RELIEF = 'pain_relief',
  FLEXIBILITY = 'flexibility',
  WARMUP = 'warmup',
  COOLDOWN = 'cooldown',
  GENERAL_FITNESS = 'general_fitness',
}

export enum PainFocus {
  LOWER_BACK = 'lower_back',
  UPPER_BACK = 'upper_back',
  NECK = 'neck',
  KNEES = 'knees',
  SHOULDERS = 'shoulders',
  HIPS = 'hips',
  ANKLES = 'ankles',
  WRISTS = 'wrists',
  ELBOWS = 'elbows',
}

export enum ForceType {
  PUSH = 'push',
  PULL = 'pull',
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export enum MovementPattern {
  HORIZONTAL_PUSH = 'horizontal_push',
  HORIZONTAL_PULL = 'horizontal_pull',
  VERTICAL_PUSH = 'vertical_push',
  VERTICAL_PULL = 'vertical_pull',
  SQUAT = 'squat',
  HINGE = 'hinge',
  LUNGE = 'lunge',
  ROTATION = 'rotation',
  CARRY = 'carry',
  ISOLATION = 'isolation',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ExerciseSortField {
  NAME = 'name',
  POPULARITY = 'popularity_score',
  CREATED = 'created_at',
  DIFFICULTY = 'difficulty',
}

// ============================================================================
// MEDIA TYPES
// ============================================================================

export interface ExerciseMedia {
  images: string[];
  videos: string[];
  thumbnail: string | null;
  gif: string | null;
}

// ============================================================================
// EXERCISE SUMMARY (List views)
// ============================================================================

export interface ExerciseSummary {
  id: number;
  name: string;
  slug: string;
  muscle_group: MuscleGroup;
  body_part: BodyPart;
  equipment: Equipment;
  difficulty: DifficultyLevel;
  category: ExerciseCategory;
  gender: ExerciseGender;
  is_popular: boolean;
  is_featured: boolean;
  is_rehab: boolean;
  thumbnail_url: string | null;
  source: string;
}

// ============================================================================
// EXERCISE FULL RESPONSE (Detail views)
// ============================================================================

export interface ExerciseResponse {
  id: number;
  name: string;
  name_de: string | null;
  slug: string;
  description: string | null;
  description_de: string | null;

  // Classification
  muscle_group: MuscleGroup;
  body_part: BodyPart;
  secondary_muscles: string[];
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: DifficultyLevel;
  gender: ExerciseGender;

  // Purpose & Rehab
  purpose: ExercisePurpose | null;
  pain_focus: PainFocus | null;
  is_rehab: boolean;
  pain_warning: string | null;
  contraindications: string[];

  // Movement
  force_type: ForceType | null;
  movement_pattern: MovementPattern | null;
  is_compound: boolean;
  is_unilateral: boolean;

  // Media - raw
  images_male: string[];
  images_female: string[];
  videos_male: string[];
  videos_female: string[];
  thumbnail_url: string | null;
  gif_url: string | null;

  // Instructions
  instructions: string[];
  instructions_de: string[];
  tips: string[];
  tips_de: string[];
  common_mistakes: string[];
  common_mistakes_de: string[];

  // Source
  source: string;
  musclewiki_id: string | null;
  external_url: string | null;

  // Stats
  popularity_score: number;
  view_count: number;
  save_count: number;
  is_popular: boolean;
  is_featured: boolean;
  is_new: boolean;

  // Tracking
  tracks_weight: boolean;
  tracks_reps: boolean;
  tracks_time: boolean;
  tracks_distance: boolean;
  default_sets: number;
  default_reps: number;
  default_rest_seconds: number;

  // Status
  is_active: boolean;
  requires_spotter: boolean;

  // Timestamps
  created_at: string;
  updated_at: string | null;
}

export interface ExerciseDetailResponse extends ExerciseResponse {
  media: ExerciseMedia;
  is_saved: boolean;
  alternatives: ExerciseSummary[];
}

// ============================================================================
// EXERCISE LIST RESPONSE (Pagination)
// ============================================================================

export interface ExerciseListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  exercises: ExerciseSummary[];
}

// ============================================================================
// DISCOVER SECTIONS
// ============================================================================

export interface DiscoverSections {
  popular: ExerciseSummary[];
  featured: ExerciseSummary[];
  new_exercises: ExerciseSummary[];
  stretching: ExerciseSummary[];
  mobility: ExerciseSummary[];
  back_pain_relief: ExerciseSummary[];
  female_focused: ExerciseSummary[];
}

// ============================================================================
// FILTERS
// ============================================================================

export interface ExerciseFilters {
  // Basic filters
  muscle_group?: MuscleGroup;
  body_part?: BodyPart;
  equipment?: Equipment;
  category?: ExerciseCategory;
  difficulty?: DifficultyLevel;
  gender?: ExerciseGender;

  // Purpose & Rehab
  purpose?: ExercisePurpose;
  pain_focus?: PainFocus;
  is_rehab?: boolean;

  // Discovery flags
  is_popular?: boolean;
  is_featured?: boolean;
  is_compound?: boolean;

  // Search
  search?: string;

  // Sorting
  sort_by?: ExerciseSortField;
  sort_order?: SortOrder;

  // Pagination
  page?: number;
  page_size?: number;
}

export interface RehabFilters {
  pain_focus: PainFocus;
  difficulty?: DifficultyLevel;
  equipment?: Equipment;
  page?: number;
  page_size?: number;
}

// ============================================================================
// USER EXERCISE (Custom exercises - Train section only)
// ============================================================================

export interface UserExerciseCreate {
  name: string;
  description?: string;
  muscle_group: MuscleGroup;
  body_part: BodyPart;
  secondary_muscles?: string[];
  category?: ExerciseCategory;
  equipment?: Equipment;
  difficulty?: DifficultyLevel;
  instructions?: string[];
  tips?: string[];
  images?: string[];
  videos?: string[];
  tracks_weight?: boolean;
  tracks_reps?: boolean;
  tracks_time?: boolean;
}

export interface UserExerciseUpdate {
  name?: string;
  description?: string;
  muscle_group?: MuscleGroup;
  body_part?: BodyPart;
  secondary_muscles?: string[];
  category?: ExerciseCategory;
  equipment?: Equipment;
  difficulty?: DifficultyLevel;
  instructions?: string[];
  tips?: string[];
  images?: string[];
  videos?: string[];
  tracks_weight?: boolean;
  tracks_reps?: boolean;
  tracks_time?: boolean;
  is_active?: boolean;
}

export interface UserExerciseResponse {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string | null;
  muscle_group: MuscleGroup;
  body_part: BodyPart;
  secondary_muscles: string[];
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: DifficultyLevel;
  instructions: string[];
  tips: string[];
  images: string[];
  videos: string[];
  tracks_weight: boolean;
  tracks_reps: boolean;
  tracks_time: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// ============================================================================
// EXERCISE HISTORY
// ============================================================================

export interface SetDetail {
  set_number: number;
  reps: number;
  weight?: number;
  rpe?: number; // Rate of perceived exertion 1-10
  rest_seconds?: number;
  notes?: string;
}

export interface ExerciseHistoryCreate {
  exercise_id?: number;
  user_exercise_id?: number;
  exercise_name: string;
  workout_session_id?: number;
  sets_completed: number;
  total_reps: number;
  total_volume?: number;
  max_weight?: number;
  duration_seconds?: number;
  distance_meters?: number;
  set_details?: SetDetail[];
  notes?: string;
  rating?: number; // 1-5
  performed_at?: string;
}

export interface ExerciseHistoryResponse {
  id: number;
  user_id: number;
  exercise_id: number | null;
  user_exercise_id: number | null;
  exercise_name: string;
  workout_session_id: number | null;
  sets_completed: number;
  total_reps: number;
  total_volume: number | null;
  max_weight: number | null;
  avg_weight: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  set_details: SetDetail[];
  is_pr_weight: boolean;
  is_pr_reps: boolean;
  is_pr_volume: boolean;
  notes: string | null;
  rating: number | null;
  performed_at: string;
}

// ============================================================================
// SAVED EXERCISES
// ============================================================================

export interface SaveExerciseRequest {
  exercise_id: number;
  notes?: string;
}

export interface SavedExerciseResponse {
  exercise: ExerciseSummary;
  saved_at: string;
  notes: string | null;
}

// ============================================================================
// TRAIN SECTION OVERVIEW
// ============================================================================

export interface TrainOverview {
  saved_exercises: ExerciseSummary[];
  custom_exercises: UserExerciseResponse[];
  recent_exercises: ExerciseHistoryResponse[];
  total_saved: number;
  total_custom: number;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkSaveRequest {
  exercise_ids: number[];
}

export interface BulkRemoveRequest {
  exercise_ids: number[];
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

export interface MuscleGroupFilter {
  id: MuscleGroup | 'all';
  name: string;
  icon: string;
  color: string;
}

export interface BodyPartFilter {
  id: BodyPart;
  name: string;
  icon: string;
  muscles: MuscleGroup[];
}

export interface EquipmentFilter {
  id: Equipment;
  name: string;
  icon: string;
}

export interface CategoryFilter {
  id: ExerciseCategory;
  name: string;
  icon: string;
  description: string;
}

export interface PainFocusFilter {
  id: PainFocus;
  name: string;
  icon: string;
  description: string;
}

// ============================================================================
// FILTER OPTION CONSTANTS
// ============================================================================

export const MUSCLE_GROUP_FILTERS: MuscleGroupFilter[] = [
  { id: 'all', name: 'All', icon: 'apps', color: '#4ADE80' },
  { id: MuscleGroup.CHEST, name: 'Chest', icon: 'body', color: '#60A5FA' },
  { id: MuscleGroup.BACK, name: 'Back', icon: 'body', color: '#A78BFA' },
  { id: MuscleGroup.SHOULDERS, name: 'Shoulders', icon: 'body', color: '#FB923C' },
  { id: MuscleGroup.BICEPS, name: 'Biceps', icon: 'body', color: '#22D3EE' },
  { id: MuscleGroup.TRICEPS, name: 'Triceps', icon: 'body', color: '#34D399' },
  { id: MuscleGroup.FOREARMS, name: 'Forearms', icon: 'body', color: '#FBBF24' },
  { id: MuscleGroup.ABS, name: 'Abs', icon: 'body', color: '#F472B6' },
  { id: MuscleGroup.CORE, name: 'Core', icon: 'body', color: '#F472B6' },
  { id: MuscleGroup.QUADS, name: 'Quads', icon: 'body', color: '#F87171' },
  { id: MuscleGroup.HAMSTRINGS, name: 'Hamstrings', icon: 'body', color: '#A3E635' },
  { id: MuscleGroup.GLUTES, name: 'Glutes', icon: 'body', color: '#E879F9' },
  { id: MuscleGroup.CALVES, name: 'Calves', icon: 'body', color: '#38BDF8' },
  { id: MuscleGroup.TRAPS, name: 'Traps', icon: 'body', color: '#818CF8' },
  { id: MuscleGroup.LATS, name: 'Lats', icon: 'body', color: '#6366F1' },
  { id: MuscleGroup.LOWER_BACK, name: 'Lower Back', icon: 'body', color: '#FB7185' },
];

export const BODY_PART_FILTERS: BodyPartFilter[] = [
  { id: BodyPart.CHEST, name: 'Chest', icon: 'body', muscles: [MuscleGroup.CHEST] },
  { id: BodyPart.BACK, name: 'Back', icon: 'body', muscles: [MuscleGroup.BACK, MuscleGroup.LATS, MuscleGroup.TRAPS, MuscleGroup.LOWER_BACK] },
  { id: BodyPart.SHOULDERS, name: 'Shoulders', icon: 'body', muscles: [MuscleGroup.SHOULDERS] },
  { id: BodyPart.ARMS, name: 'Arms', icon: 'body', muscles: [MuscleGroup.BICEPS, MuscleGroup.TRICEPS, MuscleGroup.FOREARMS] },
  { id: BodyPart.CORE, name: 'Core', icon: 'body', muscles: [MuscleGroup.ABS, MuscleGroup.OBLIQUES, MuscleGroup.CORE] },
  { id: BodyPart.LEGS, name: 'Legs', icon: 'body', muscles: [MuscleGroup.QUADS, MuscleGroup.HAMSTRINGS, MuscleGroup.CALVES, MuscleGroup.HIP_FLEXORS, MuscleGroup.ADDUCTORS, MuscleGroup.ABDUCTORS] },
  { id: BodyPart.GLUTES, name: 'Glutes', icon: 'body', muscles: [MuscleGroup.GLUTES] },
  { id: BodyPart.FULL_BODY, name: 'Full Body', icon: 'body', muscles: [MuscleGroup.FULL_BODY] },
];

export const EQUIPMENT_FILTERS: EquipmentFilter[] = [
  { id: Equipment.BODYWEIGHT, name: 'Bodyweight', icon: 'person' },
  { id: Equipment.BARBELL, name: 'Barbell', icon: 'barbell' },
  { id: Equipment.DUMBBELL, name: 'Dumbbell', icon: 'fitness' },
  { id: Equipment.KETTLEBELL, name: 'Kettlebell', icon: 'fitness' },
  { id: Equipment.MACHINE, name: 'Machine', icon: 'settings' },
  { id: Equipment.CABLE, name: 'Cable', icon: 'git-network' },
  { id: Equipment.RESISTANCE_BAND, name: 'Band', icon: 'swap-horizontal' },
  { id: Equipment.PULL_UP_BAR, name: 'Pull-up Bar', icon: 'remove' },
  { id: Equipment.BENCH, name: 'Bench', icon: 'bed' },
];

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: ExerciseCategory.STRENGTH, name: 'Strength', icon: 'barbell', description: 'Build muscle and strength' },
  { id: ExerciseCategory.STRETCHING, name: 'Stretching', icon: 'body', description: 'Improve flexibility' },
  { id: ExerciseCategory.MOBILITY, name: 'Mobility', icon: 'walk', description: 'Enhance joint mobility' },
  { id: ExerciseCategory.REHAB, name: 'Rehab', icon: 'medkit', description: 'Recovery exercises' },
  { id: ExerciseCategory.CARDIO, name: 'Cardio', icon: 'heart', description: 'Cardiovascular health' },
  { id: ExerciseCategory.PLYOMETRIC, name: 'Plyometric', icon: 'flash', description: 'Explosive movements' },
  { id: ExerciseCategory.CALISTHENICS, name: 'Calisthenics', icon: 'body', description: 'Bodyweight training' },
  { id: ExerciseCategory.YOGA, name: 'Yoga', icon: 'leaf', description: 'Mind-body practice' },
];

export const PAIN_FOCUS_FILTERS: PainFocusFilter[] = [
  { id: PainFocus.LOWER_BACK, name: 'Lower Back', icon: 'body', description: 'Relieve lower back pain' },
  { id: PainFocus.UPPER_BACK, name: 'Upper Back', icon: 'body', description: 'Relieve upper back tension' },
  { id: PainFocus.NECK, name: 'Neck', icon: 'body', description: 'Ease neck stiffness' },
  { id: PainFocus.SHOULDERS, name: 'Shoulders', icon: 'body', description: 'Shoulder pain relief' },
  { id: PainFocus.KNEES, name: 'Knees', icon: 'body', description: 'Knee strengthening' },
  { id: PainFocus.HIPS, name: 'Hips', icon: 'body', description: 'Hip mobility and pain relief' },
];

export const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.BEGINNER, label: 'Beginner', color: '#4ADE80' },
  { value: DifficultyLevel.INTERMEDIATE, label: 'Intermediate', color: '#FBBF24' },
  { value: DifficultyLevel.ADVANCED, label: 'Advanced', color: '#FB923C' },
  { value: DifficultyLevel.EXPERT, label: 'Expert', color: '#F87171' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get display-ready media for an exercise based on user's gender preference.
 */
export function getExerciseMedia(
  exercise: ExerciseResponse | ExerciseDetailResponse,
  preferredGender: ExerciseGender = ExerciseGender.MALE
): ExerciseMedia {
  if ('media' in exercise && exercise.media) {
    return exercise.media;
  }

  const isFemale = preferredGender === ExerciseGender.FEMALE;

  const images = isFemale
    ? (exercise.images_female.length > 0 ? exercise.images_female : exercise.images_male)
    : (exercise.images_male.length > 0 ? exercise.images_male : exercise.images_female);

  const videos = isFemale
    ? (exercise.videos_female.length > 0 ? exercise.videos_female : exercise.videos_male)
    : (exercise.videos_male.length > 0 ? exercise.videos_male : exercise.videos_female);

  return {
    images,
    videos,
    thumbnail: exercise.thumbnail_url,
    gif: exercise.gif_url,
  };
}

/**
 * Get localized content based on language preference.
 */
export function getLocalizedContent<T>(
  content: T | null,
  contentDe: T | null,
  language: 'en' | 'de' = 'en'
): T | null {
  if (language === 'de' && contentDe) {
    return contentDe;
  }
  return content;
}

/**
 * Get difficulty color for UI display.
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const option = DIFFICULTY_OPTIONS.find(o => o.value === difficulty);
  return option?.color ?? '#9CA3AF';
}

/**
 * Format muscle group for display.
 */
export function formatMuscleGroup(muscle: MuscleGroup): string {
  return muscle
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format equipment for display.
 */
export function formatEquipment(equipment: Equipment): string {
  return equipment
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Check if exercise is user-created.
 */
export function isUserExercise(exercise: ExerciseSummary | UserExerciseResponse): exercise is UserExerciseResponse {
  return 'user_id' in exercise;
}
