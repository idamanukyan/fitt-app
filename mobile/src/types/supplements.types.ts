/**
 * Supplements Data Models
 */

export type SupplementCategory = 'protein' | 'vitamin' | 'mineral' | 'performance' | 'amino' | 'omega' | 'preworkout' | 'recovery' | 'other';

export type DosageUnit = 'g' | 'mg' | 'mcg' | 'ml' | 'capsule' | 'tablet' | 'scoop' | 'serving';

export type ScheduleType = 'daily' | 'weekly' | 'custom';

export type IntakeTiming = 'morning' | 'afternoon' | 'evening' | 'before_workout' | 'after_workout' | 'with_meal' | 'before_bed' | 'any_time';

export type SupplementTiming = IntakeTiming;

export interface Supplement {
  id: string;
  name: string;
  category: SupplementCategory;
  defaultUnit: DosageUnit;
  defaultDosage: number;
  defaultTiming: IntakeTiming;
  image?: string;
  brand?: string;
  description?: string;
  benefits?: string[];
  isPopular?: boolean;
}

export interface IntakeEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM
  taken: boolean;
  skipped?: boolean;
  skipReason?: string;
  notes?: string;
}

export interface UserSupplement {
  id: string;
  supplementId: string;
  name: string;
  category: SupplementCategory;
  supplement?: Supplement;
  dosage: number;
  unit: string;
  timing: SupplementTiming;
  scheduleType: ScheduleType;
  customDays?: number[]; // 0-6 for Sunday-Saturday
  dosesPerDay: number;
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM
  notes?: string;
  intakeLog: IntakeEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplementStack {
  supplements: UserSupplement[];
  streakDays: number;
  lastIntakeDate?: string;
  totalDosesToday: number;
  takenDosesToday: number;
  weeklyCompliance: number;
  monthlyCompliance: number;
}

export interface DailyProgress {
  date: string;
  totalDoses: number;
  takenDoses: number;
  percentage: number;
}

export interface WeeklyDot {
  date: string;
  dayOfWeek: number;
  status: 'complete' | 'partial' | 'missed' | 'future';
  isToday: boolean;
  percentComplete: number;
}

// Smart defaults by category
export const SMART_DEFAULTS: Record<SupplementCategory, { timing: SupplementTiming; dosesPerDay: number }> = {
  protein: { timing: 'after_workout', dosesPerDay: 1 },
  vitamin: { timing: 'morning', dosesPerDay: 1 },
  mineral: { timing: 'evening', dosesPerDay: 1 },
  performance: { timing: 'before_workout', dosesPerDay: 1 },
  amino: { timing: 'before_workout', dosesPerDay: 2 },
  omega: { timing: 'with_meal', dosesPerDay: 1 },
  preworkout: { timing: 'before_workout', dosesPerDay: 1 },
  recovery: { timing: 'before_bed', dosesPerDay: 1 },
  other: { timing: 'any_time', dosesPerDay: 1 },
};

// Timing labels for display
export const TIMING_LABELS: Record<IntakeTiming, { en: string; de: string }> = {
  morning: { en: 'Morning', de: 'Morgens' },
  afternoon: { en: 'Afternoon', de: 'Nachmittags' },
  evening: { en: 'Evening', de: 'Abends' },
  before_workout: { en: 'Before Workout', de: 'Vor dem Training' },
  after_workout: { en: 'After Workout', de: 'Nach dem Training' },
  with_meal: { en: 'With Meal', de: 'Zur Mahlzeit' },
  before_bed: { en: 'Before Bed', de: 'Vor dem Schlafen' },
  any_time: { en: 'Any Time', de: 'Jederzeit' },
};

export const CATEGORY_LABELS: Record<SupplementCategory, { en: string; de: string }> = {
  protein: { en: 'Protein', de: 'Protein' },
  vitamin: { en: 'Vitamins', de: 'Vitamine' },
  mineral: { en: 'Minerals', de: 'Mineralien' },
  performance: { en: 'Performance', de: 'Leistung' },
  amino: { en: 'Amino Acids', de: 'Aminosäuren' },
  omega: { en: 'Omega', de: 'Omega' },
  preworkout: { en: 'Pre-Workout', de: 'Pre-Workout' },
  recovery: { en: 'Recovery', de: 'Erholung' },
  other: { en: 'Other', de: 'Sonstiges' },
};
