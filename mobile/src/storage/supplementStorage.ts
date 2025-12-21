/**
 * Supplement Storage - AsyncStorage implementation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Supplement,
  UserSupplement,
  IntakeEntry,
  SupplementStack,
  DailyProgress,
  WeeklyDot,
  SupplementCategory,
  SupplementTiming,
  ScheduleType,
} from '../types/supplements.types';
import { SUPPLEMENT_CATALOG } from '../data/supplementCatalog';

const STORAGE_KEYS = {
  USER_SUPPLEMENTS: '@hyperfit_user_supplements',
  SUPPLEMENT_SETTINGS: '@hyperfit_supplement_settings',
  MOCK_DATA_SEEDED: '@hyperfit_supplements_mock_seeded',
};

// ============================================================================
// CATALOG OPERATIONS
// ============================================================================

export const getSupplements = async (): Promise<Supplement[]> => {
  return SUPPLEMENT_CATALOG;
};

export const getSupplementById = async (id: string): Promise<Supplement | null> => {
  return SUPPLEMENT_CATALOG.find(s => s.id === id) || null;
};

export const searchSupplements = async (query: string): Promise<Supplement[]> => {
  const lowerQuery = query.toLowerCase();
  return SUPPLEMENT_CATALOG.filter(
    s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.category.toLowerCase().includes(lowerQuery) ||
      s.brand?.toLowerCase().includes(lowerQuery)
  );
};

export const getSupplementsByCategory = async (category: string): Promise<Supplement[]> => {
  if (category === 'all') return SUPPLEMENT_CATALOG;
  return SUPPLEMENT_CATALOG.filter(s => s.category === category);
};

export const getPopularSupplements = async (): Promise<Supplement[]> => {
  return SUPPLEMENT_CATALOG.filter(s => s.isPopular);
};

// ============================================================================
// USER SUPPLEMENTS OPERATIONS
// ============================================================================

export const getUserSupplements = async (): Promise<UserSupplement[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SUPPLEMENTS);
    if (!data) return [];

    const supplements: UserSupplement[] = JSON.parse(data);

    // Enrich with supplement details
    return supplements.map(us => ({
      ...us,
      supplement: SUPPLEMENT_CATALOG.find(s => s.id === us.supplementId),
    }));
  } catch (error) {
    console.error('Error getting user supplements:', error);
    return [];
  }
};

export const getUserSupplementById = async (id: string): Promise<UserSupplement | null> => {
  const supplements = await getUserSupplements();
  return supplements.find(s => s.id === id) || null;
};

export const addUserSupplement = async (config: {
  supplementId: string;
  name: string;
  category: SupplementCategory;
  dosage: number;
  unit: string;
  dosesPerDay: number;
  timing: SupplementTiming;
  scheduleType: ScheduleType;
  customDays?: number[];
  reminderEnabled: boolean;
  reminderTime?: string;
  notes?: string;
}): Promise<UserSupplement> => {
  try {
    const supplements = await getUserSupplements();

    const newSupplement: UserSupplement = {
      id: `us_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      supplementId: config.supplementId,
      name: config.name,
      category: config.category,
      dosage: config.dosage,
      unit: config.unit,
      timing: config.timing,
      scheduleType: config.scheduleType,
      customDays: config.customDays,
      dosesPerDay: config.dosesPerDay,
      reminderEnabled: config.reminderEnabled,
      reminderTime: config.reminderTime,
      notes: config.notes,
      intakeLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove supplement reference before saving
    const toSave = [...supplements.map(({ supplement, ...rest }) => rest), {
      ...newSupplement,
    }];
    delete (toSave[toSave.length - 1] as any).supplement;

    await AsyncStorage.setItem(STORAGE_KEYS.USER_SUPPLEMENTS, JSON.stringify(toSave));

    return {
      ...newSupplement,
      supplement: SUPPLEMENT_CATALOG.find(s => s.id === config.supplementId),
    };
  } catch (error) {
    console.error('Error adding user supplement:', error);
    throw error;
  }
};

export const updateUserSupplement = async (
  id: string,
  updates: Partial<UserSupplement>
): Promise<UserSupplement | null> => {
  try {
    const supplements = await getUserSupplements();
    const index = supplements.findIndex(s => s.id === id);

    if (index === -1) return null;

    supplements[index] = {
      ...supplements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Remove supplement reference before saving
    const toSave = supplements.map(({ supplement, ...rest }) => rest);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SUPPLEMENTS, JSON.stringify(toSave));

    return supplements[index];
  } catch (error) {
    console.error('Error updating user supplement:', error);
    throw error;
  }
};

export const removeUserSupplement = async (id: string): Promise<boolean> => {
  try {
    const supplements = await getUserSupplements();
    const filtered = supplements.filter(s => s.id !== id);

    // Remove supplement reference before saving
    const toSave = filtered.map(({ supplement, ...rest }) => rest);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SUPPLEMENTS, JSON.stringify(toSave));

    return true;
  } catch (error) {
    console.error('Error removing user supplement:', error);
    return false;
  }
};

// ============================================================================
// INTAKE LOGGING
// ============================================================================

export const logIntake = async (
  userSupplementId: string,
  date?: string,
  notes?: string
): Promise<IntakeEntry | null> => {
  try {
    const supplements = await getUserSupplements();
    const index = supplements.findIndex(s => s.id === userSupplementId);

    if (index === -1) return null;

    const today = date || new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    // Count today's entries
    const todayEntries = supplements[index].intakeLog.filter(e => e.date === today && e.taken);
    const currentCount = todayEntries.length;

    // Add a new intake entry
    const entry: IntakeEntry = {
      id: `intake_${Date.now()}`,
      date: today,
      time: now,
      taken: true,
      notes,
    };

    supplements[index].intakeLog.push(entry);
    supplements[index].updatedAt = new Date().toISOString();

    // Remove supplement reference before saving
    const toSave = supplements.map(({ supplement, ...rest }) => rest);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SUPPLEMENTS, JSON.stringify(toSave));

    return entry;
  } catch (error) {
    console.error('Error logging intake:', error);
    return null;
  }
};

export const undoIntake = async (
  userSupplementId: string,
  date?: string
): Promise<boolean> => {
  try {
    const supplements = await getUserSupplements();
    const index = supplements.findIndex(s => s.id === userSupplementId);

    if (index === -1) return false;

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Remove the last taken entry for this date
    const entries = supplements[index].intakeLog;
    const lastTakenIndex = entries.map((e, i) => ({ ...e, idx: i }))
      .filter(e => e.date === targetDate && e.taken)
      .pop()?.idx;

    if (lastTakenIndex !== undefined) {
      entries.splice(lastTakenIndex, 1);
    }

    // Remove supplement reference before saving
    const toSave = supplements.map(({ supplement, ...rest }) => rest);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SUPPLEMENTS, JSON.stringify(toSave));

    return true;
  } catch (error) {
    console.error('Error undoing intake:', error);
    return false;
  }
};

// ============================================================================
// PROGRESS & ANALYTICS
// ============================================================================

export const getTodayProgress = async (): Promise<Record<string, number>> => {
  const supplements = await getUserSupplements();
  const today = new Date().toISOString().split('T')[0];

  const progress: Record<string, number> = {};

  supplements.forEach(s => {
    const todayEntries = s.intakeLog.filter(e => e.date === today && e.taken);
    progress[s.id] = todayEntries.length;
  });

  return progress;
};

export const getWeeklyDots = async (): Promise<WeeklyDot[]> => {
  const supplements = await getUserSupplements();
  const dots: WeeklyDot[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isToday = dateStr === todayStr;

    let totalDoses = 0;
    let takenDoses = 0;

    supplements.forEach(s => {
      const isScheduled =
        s.scheduleType === 'daily' ||
        (s.scheduleType === 'custom' && s.customDays?.includes(dayOfWeek));

      if (isScheduled) {
        totalDoses += s.dosesPerDay;
        const dayEntries = s.intakeLog.filter(e => e.date === dateStr && e.taken);
        takenDoses += Math.min(dayEntries.length, s.dosesPerDay);
      }
    });

    let status: WeeklyDot['status'] = 'missed';
    let percentComplete = 0;

    if (totalDoses > 0) {
      percentComplete = Math.round((takenDoses / totalDoses) * 100);
      if (percentComplete >= 100) {
        status = 'complete';
      } else if (percentComplete > 0) {
        status = 'partial';
      }
    } else {
      status = 'complete'; // No supplements scheduled
      percentComplete = 100;
    }

    dots.push({
      date: dateStr,
      dayOfWeek,
      status,
      isToday,
      percentComplete,
    });
  }

  return dots;
};

export const getStackStats = async (): Promise<{
  totalDosesToday: number;
  takenDosesToday: number;
  streakDays: number;
}> => {
  const supplements = await getUserSupplements();
  const today = new Date().toISOString().split('T')[0];
  const todayDayOfWeek = new Date().getDay();

  // Calculate today's progress
  let totalDosesToday = 0;
  let takenDosesToday = 0;

  supplements.forEach(s => {
    const isScheduled =
      s.scheduleType === 'daily' ||
      (s.scheduleType === 'custom' && s.customDays?.includes(todayDayOfWeek));

    if (isScheduled) {
      totalDosesToday += s.dosesPerDay;
      const todayEntries = s.intakeLog.filter(e => e.date === today && e.taken);
      takenDosesToday += Math.min(todayEntries.length, s.dosesPerDay);
    }
  });

  // Calculate streak
  let streakDays = 0;
  const checkDate = new Date();

  // Start from yesterday if today is not complete
  if (takenDosesToday < totalDosesToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();
    let dayComplete = true;
    let hasSupplements = false;

    for (const s of supplements) {
      const isScheduled =
        s.scheduleType === 'daily' ||
        (s.scheduleType === 'custom' && s.customDays?.includes(dayOfWeek));

      if (isScheduled) {
        hasSupplements = true;
        const dayEntries = s.intakeLog.filter(e => e.date === dateStr && e.taken);
        if (dayEntries.length < s.dosesPerDay) {
          dayComplete = false;
          break;
        }
      }
    }

    if (!hasSupplements) {
      // No supplements scheduled, count as complete
      checkDate.setDate(checkDate.getDate() - 1);
      if (streakDays > 365) break;
      continue;
    }

    if (!dayComplete) break;

    streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);

    if (streakDays > 365) break; // Safety limit
  }

  // Add today if complete
  if (totalDosesToday > 0 && takenDosesToday >= totalDosesToday) {
    streakDays++;
  }

  return {
    totalDosesToday,
    takenDosesToday,
    streakDays,
  };
};

export const getMonthlyHeatmap = async (): Promise<{ date: string; compliance: number }[]> => {
  const supplements = await getUserSupplements();
  const heatmap: { date: string; compliance: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    let total = 0;
    let taken = 0;

    supplements.forEach(s => {
      const isScheduled =
        s.scheduleType === 'daily' ||
        (s.scheduleType === 'custom' && s.customDays?.includes(dayOfWeek));

      if (isScheduled) {
        total += s.dosesPerDay;
        const dayEntries = s.intakeLog.filter(e => e.date === dateStr && e.taken);
        taken += Math.min(dayEntries.length, s.dosesPerDay);
      }
    });

    heatmap.push({
      date: dateStr,
      compliance: total > 0 ? Math.round((taken / total) * 100) : 100,
    });
  }

  return heatmap;
};

// ============================================================================
// MOCK DATA SEEDING
// ============================================================================

export const seedMockSupplementData = async (): Promise<boolean> => {
  try {
    // Check if already seeded
    const seeded = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_DATA_SEEDED);
    if (seeded === 'true') {
      return false;
    }

    // Generate intake logs for the past 14 days
    const generateIntakeLogs = (dosesPerDay: number, complianceRate: number = 0.85): IntakeEntry[] => {
      const logs: IntakeEntry[] = [];
      const today = new Date();

      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        for (let dose = 0; dose < dosesPerDay; dose++) {
          // Random compliance based on rate
          if (Math.random() < complianceRate) {
            const hour = 8 + dose * 4 + Math.floor(Math.random() * 2);
            const minute = Math.floor(Math.random() * 60);
            logs.push({
              id: `intake_${dateStr}_${dose}_${Math.random().toString(36).substr(2, 9)}`,
              date: dateStr,
              time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              taken: true,
            });
          }
        }
      }

      return logs;
    };

    const mockSupplements: Omit<UserSupplement, 'supplement'>[] = [
      {
        id: 'us_mock_1',
        supplementId: 'whey-protein-isolate',
        name: 'Whey Protein Isolate',
        category: 'protein',
        dosage: 30,
        unit: 'g',
        timing: 'after_workout',
        scheduleType: 'daily',
        dosesPerDay: 1,
        reminderEnabled: true,
        reminderTime: '18:00',
        notes: 'Post-workout shake',
        intakeLog: generateIntakeLogs(1, 0.9),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'us_mock_2',
        supplementId: 'creatine-monohydrate',
        name: 'Creatine Monohydrate',
        category: 'performance',
        dosage: 5,
        unit: 'g',
        timing: 'morning',
        scheduleType: 'daily',
        dosesPerDay: 1,
        reminderEnabled: true,
        reminderTime: '08:00',
        notes: 'With breakfast',
        intakeLog: generateIntakeLogs(1, 0.95),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'us_mock_3',
        supplementId: 'vitamin-d3',
        name: 'Vitamin D3',
        category: 'vitamin',
        dosage: 5000,
        unit: 'mcg',
        timing: 'morning',
        scheduleType: 'daily',
        dosesPerDay: 1,
        reminderEnabled: true,
        reminderTime: '08:00',
        intakeLog: generateIntakeLogs(1, 0.85),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'us_mock_4',
        supplementId: 'omega-3',
        name: 'Omega-3 Fish Oil',
        category: 'omega',
        dosage: 2,
        unit: 'capsule',
        timing: 'with_meal',
        scheduleType: 'daily',
        dosesPerDay: 2,
        reminderEnabled: false,
        intakeLog: generateIntakeLogs(2, 0.8),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'us_mock_5',
        supplementId: 'magnesium-glycinate',
        name: 'Magnesium Glycinate',
        category: 'mineral',
        dosage: 400,
        unit: 'mg',
        timing: 'before_bed',
        scheduleType: 'daily',
        dosesPerDay: 1,
        reminderEnabled: true,
        reminderTime: '21:30',
        notes: 'For better sleep',
        intakeLog: generateIntakeLogs(1, 0.88),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.USER_SUPPLEMENTS, JSON.stringify(mockSupplements));
    await AsyncStorage.setItem(STORAGE_KEYS.MOCK_DATA_SEEDED, 'true');

    console.log('[SupplementStorage] Mock data seeded successfully');
    return true;
  } catch (error) {
    console.error('[SupplementStorage] Error seeding mock data:', error);
    return false;
  }
};

export const clearMockData = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_SUPPLEMENTS);
  await AsyncStorage.removeItem(STORAGE_KEYS.MOCK_DATA_SEEDED);
};
