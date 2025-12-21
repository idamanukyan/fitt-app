/**
 * Supplement Types - TypeScript definitions for supplement system
 */

// Enums
export enum SupplementCategory {
  PROTEIN = 'protein',
  VITAMINS = 'vitamins',
  MINERALS = 'minerals',
  AMINO_ACIDS = 'amino_acids',
  PRE_WORKOUT = 'pre_workout',
  POST_WORKOUT = 'post_workout',
  CREATINE = 'creatine',
  BCAA = 'bcaa',
  OMEGA_3 = 'omega_3',
  MULTIVITAMIN = 'multivitamin',
  WEIGHT_LOSS = 'weight_loss',
  ENERGY = 'energy',
  RECOVERY = 'recovery',
  OTHER = 'other',
}

export enum IntakeFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  AS_NEEDED = 'as_needed',
  EVERY_OTHER_DAY = 'every_other_day',
}

export enum IntakeTiming {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  BEFORE_WORKOUT = 'before_workout',
  AFTER_WORKOUT = 'after_workout',
  WITH_MEAL = 'with_meal',
  BEFORE_BED = 'before_bed',
  ANY_TIME = 'any_time',
}

// Supplement Models
export interface Supplement {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: SupplementCategory;
  brand?: string;
  default_dosage?: number;
  dosage_unit?: string;
  serving_size?: string;
  benefits?: string; // JSON string
  side_effects?: string;
  instructions?: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fats_per_serving?: number;
  recommended_timing?: IntakeTiming;
  recommended_frequency?: IntakeFrequency;
  image_url?: string;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserSupplement {
  id: number;
  user_id: number;
  supplement_id: number;
  dosage?: number;
  dosage_unit?: string;
  frequency: IntakeFrequency;
  timing: IntakeTiming;
  specific_time?: string; // "HH:MM" format
  days_of_week?: string; // JSON string
  is_active: boolean;
  reminder_enabled: boolean;
  notes?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  total_stock?: number;
  remaining_stock?: number;
  low_stock_alert: boolean;
  created_at: string;
  updated_at?: string;
  supplement?: Supplement;
}

export interface SupplementIntake {
  id: number;
  user_id: number;
  user_supplement_id: number;
  taken_at: string;
  dosage_taken?: number;
  dosage_unit?: string;
  was_scheduled: boolean;
  skipped: boolean;
  skip_reason?: string;
  notes?: string;
  side_effects_noted?: string;
  created_at: string;
  user_supplement?: UserSupplement;
}

// Request Types
export interface CreateUserSupplementRequest {
  supplement_id: number;
  dosage?: number;
  dosage_unit?: string;
  frequency: IntakeFrequency;
  timing: IntakeTiming;
  specific_time?: string;
  days_of_week?: string;
  reminder_enabled?: boolean;
  notes?: string;
  purpose?: string;
  start_date?: string;
  end_date?: string;
  total_stock?: number;
  remaining_stock?: number;
  low_stock_alert?: boolean;
}

export interface UpdateUserSupplementRequest {
  dosage?: number;
  dosage_unit?: string;
  frequency?: IntakeFrequency;
  timing?: IntakeTiming;
  specific_time?: string;
  days_of_week?: string;
  is_active?: boolean;
  reminder_enabled?: boolean;
  notes?: string;
  purpose?: string;
  end_date?: string;
  total_stock?: number;
  remaining_stock?: number;
  low_stock_alert?: boolean;
}

export interface LogIntakeRequest {
  user_supplement_id: number;
  dosage_taken?: number;
  dosage_unit?: string;
  was_scheduled?: boolean;
  skipped?: boolean;
  skip_reason?: string;
  notes?: string;
  side_effects_noted?: string;
  taken_at?: string;
}

// Response Types
export interface SupplementListResponse {
  supplements: Supplement[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserSupplementListResponse {
  supplements: UserSupplement[];
  total: number;
}

export interface TodaysSupplementInfo {
  id: number;
  supplement: {
    id: number;
    name: string;
    category: string;
    image_url?: string;
  };
  dosage?: number;
  dosage_unit?: string;
  timing: string;
  specific_time?: string;
  notes?: string;
}

export interface TodaysSupplementsResponse {
  scheduled: TodaysSupplementInfo[];
  taken: TodaysSupplementInfo[];
  missed: TodaysSupplementInfo[];
  upcoming: TodaysSupplementInfo[];
}

export interface LowStockAlert {
  id: number;
  supplement_name: string;
  remaining_stock?: number;
  total_stock?: number;
}

export interface SupplementStatsResponse {
  total_supplements: number;
  active_supplements: number;
  compliance_rate: number;
  total_doses_this_week: number;
  doses_taken_this_week: number;
  doses_missed_this_week: number;
  low_stock_alerts: LowStockAlert[];
}

// Helper Functions
export const getCategoryLabel = (category: SupplementCategory): string => {
  const labels: Record<SupplementCategory, string> = {
    [SupplementCategory.PROTEIN]: 'Protein',
    [SupplementCategory.VITAMINS]: 'Vitamins',
    [SupplementCategory.MINERALS]: 'Minerals',
    [SupplementCategory.AMINO_ACIDS]: 'Amino Acids',
    [SupplementCategory.PRE_WORKOUT]: 'Pre-Workout',
    [SupplementCategory.POST_WORKOUT]: 'Post-Workout',
    [SupplementCategory.CREATINE]: 'Creatine',
    [SupplementCategory.BCAA]: 'BCAA',
    [SupplementCategory.OMEGA_3]: 'Omega-3',
    [SupplementCategory.MULTIVITAMIN]: 'Multivitamin',
    [SupplementCategory.WEIGHT_LOSS]: 'Weight Loss',
    [SupplementCategory.ENERGY]: 'Energy',
    [SupplementCategory.RECOVERY]: 'Recovery',
    [SupplementCategory.OTHER]: 'Other',
  };
  return labels[category];
};

export const getTimingLabel = (timing: IntakeTiming): string => {
  const labels: Record<IntakeTiming, string> = {
    [IntakeTiming.MORNING]: 'Morning',
    [IntakeTiming.AFTERNOON]: 'Afternoon',
    [IntakeTiming.EVENING]: 'Evening',
    [IntakeTiming.BEFORE_WORKOUT]: 'Before Workout',
    [IntakeTiming.AFTER_WORKOUT]: 'After Workout',
    [IntakeTiming.WITH_MEAL]: 'With Meal',
    [IntakeTiming.BEFORE_BED]: 'Before Bed',
    [IntakeTiming.ANY_TIME]: 'Any Time',
  };
  return labels[timing];
};

export const getFrequencyLabel = (frequency: IntakeFrequency): string => {
  const labels: Record<IntakeFrequency, string> = {
    [IntakeFrequency.DAILY]: 'Daily',
    [IntakeFrequency.WEEKLY]: 'Weekly',
    [IntakeFrequency.AS_NEEDED]: 'As Needed',
    [IntakeFrequency.EVERY_OTHER_DAY]: 'Every Other Day',
  };
  return labels[frequency];
};

export const getCategoryIcon = (category: SupplementCategory): string => {
  const icons: Record<SupplementCategory, string> = {
    [SupplementCategory.PROTEIN]: 'fitness-outline',
    [SupplementCategory.VITAMINS]: 'medical-outline',
    [SupplementCategory.MINERALS]: 'diamond-outline',
    [SupplementCategory.AMINO_ACIDS]: 'flask-outline',
    [SupplementCategory.PRE_WORKOUT]: 'flash-outline',
    [SupplementCategory.POST_WORKOUT]: 'checkmark-circle-outline',
    [SupplementCategory.CREATINE]: 'barbell-outline',
    [SupplementCategory.BCAA]: 'water-outline',
    [SupplementCategory.OMEGA_3]: 'fish-outline',
    [SupplementCategory.MULTIVITAMIN]: 'nutrition-outline',
    [SupplementCategory.WEIGHT_LOSS]: 'trending-down-outline',
    [SupplementCategory.ENERGY]: 'battery-charging-outline',
    [SupplementCategory.RECOVERY]: 'moon-outline',
    [SupplementCategory.OTHER]: 'ellipsis-horizontal-outline',
  };
  return icons[category];
};
