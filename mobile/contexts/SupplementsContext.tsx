/**
 * Supplements Context
 *
 * Manages supplement data, intake tracking, and notifications
 * Uses AsyncStorage for persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { trackEvent, AnalyticsEvents } from '../services/analyticsService';

// ============================================================================
// TYPES
// ============================================================================

export interface Dosage {
  amount: number;
  unit: 'g' | 'mg' | 'ml' | 'capsules' | 'pills' | 'scoops' | 'tablets';
}

export interface IntakeRecord {
  taken: boolean;
  timestamp?: string;
  dose?: number;
}

export interface Supplement {
  id: string;
  name: string;
  icon: string;
  dosage: Dosage;
  frequency: 'daily' | 'weekly' | 'custom';
  time: string; // "HH:MM" format
  dosesPerDay: number;
  reminders: boolean;
  notes: string;
  notificationId?: string;
  intakeHistory: Record<string, IntakeRecord[]>;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementsContextType {
  supplements: Supplement[];
  loading: boolean;
  addSupplement: (supplement: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt' | 'intakeHistory'>) => Promise<void>;
  updateSupplement: (id: string, updates: Partial<Supplement>) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;
  logIntake: (supplementId: string) => Promise<void>;
  getTodayIntakes: (supplementId: string) => IntakeRecord[];
  getWeekIntakes: (supplementId: string) => { date: string; intakes: IntakeRecord[] }[];
  refreshSupplements: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = '@hyperfit_supplements';

// Suggested supplements with default configurations
export const SUGGESTED_SUPPLEMENTS = [
  { name: 'Protein Powder', icon: '🥤', defaultDosage: { amount: 30, unit: 'g' as const }, defaultTime: '08:00' },
  { name: 'Creatine', icon: '💪', defaultDosage: { amount: 5, unit: 'g' as const }, defaultTime: '08:00' },
  { name: 'BCAA', icon: '⚡', defaultDosage: { amount: 10, unit: 'g' as const }, defaultTime: '07:00' },
  { name: 'Vitamin D3', icon: '☀️', defaultDosage: { amount: 5000, unit: 'mg' as const }, defaultTime: '09:00' },
  { name: 'Fish Oil', icon: '🐟', defaultDosage: { amount: 2, unit: 'capsules' as const }, defaultTime: '08:00' },
  { name: 'Multivitamin', icon: '💊', defaultDosage: { amount: 1, unit: 'tablets' as const }, defaultTime: '08:00' },
  { name: 'Magnesium', icon: '🌙', defaultDosage: { amount: 400, unit: 'mg' as const }, defaultTime: '21:00' },
  { name: 'Zinc', icon: '🛡️', defaultDosage: { amount: 30, unit: 'mg' as const }, defaultTime: '20:00' },
  { name: 'Pre-Workout', icon: '🔥', defaultDosage: { amount: 1, unit: 'scoops' as const }, defaultTime: '06:00' },
  { name: 'Caffeine', icon: '☕', defaultDosage: { amount: 200, unit: 'mg' as const }, defaultTime: '07:00' },
  { name: 'Ashwagandha', icon: '🌿', defaultDosage: { amount: 600, unit: 'mg' as const }, defaultTime: '21:00' },
  { name: 'Collagen', icon: '✨', defaultDosage: { amount: 10, unit: 'g' as const }, defaultTime: '08:00' },
];

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(getDateKey(date));
  }
  return days;
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

async function scheduleSupplementReminder(supplement: Supplement): Promise<string | null> {
  if (!supplement.reminders) return null;

  try {
    // Cancel existing notification if any
    if (supplement.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(supplement.notificationId);
    }

    const [hours, minutes] = supplement.time.split(':').map(Number);

    // Schedule daily notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${supplement.name}`,
        body: `Take ${supplement.dosage.amount}${supplement.dosage.unit} of ${supplement.name}`,
        sound: true,
        data: { supplementId: supplement.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

async function cancelSupplementReminder(notificationId?: string): Promise<void> {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const SupplementsContext = createContext<SupplementsContextType | undefined>(undefined);

export function SupplementsProvider({ children }: { children: ReactNode }) {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);

  // Load supplements from storage
  const loadSupplements = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSupplements(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load supplements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save supplements to storage
  const saveSupplements = useCallback(async (data: Supplement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save supplements:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadSupplements();
  }, [loadSupplements]);

  // Request notification permissions
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  // Add supplement
  const addSupplement = useCallback(async (
    supplementData: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt' | 'intakeHistory'>
  ) => {
    const now = new Date().toISOString();
    const newSupplement: Supplement = {
      ...supplementData,
      id: generateId(),
      intakeHistory: {},
      createdAt: now,
      updatedAt: now,
    };

    // Schedule notification if reminders enabled
    if (newSupplement.reminders) {
      const notificationId = await scheduleSupplementReminder(newSupplement);
      if (notificationId) {
        newSupplement.notificationId = notificationId;
      }
    }

    const updated = [...supplements, newSupplement];
    setSupplements(updated);
    await saveSupplements(updated);

    // Track analytics
    trackEvent(AnalyticsEvents.SUPPLEMENT_ADDED, {
      supplement_name: newSupplement.name,
      dosage_amount: newSupplement.dosage.amount,
      dosage_unit: newSupplement.dosage.unit,
      frequency: newSupplement.frequency,
      reminders_enabled: newSupplement.reminders,
    });
  }, [supplements, saveSupplements]);

  // Update supplement
  const updateSupplement = useCallback(async (id: string, updates: Partial<Supplement>) => {
    const updated = supplements.map(sup => {
      if (sup.id === id) {
        return { ...sup, ...updates, updatedAt: new Date().toISOString() };
      }
      return sup;
    });

    // Handle notification updates
    const supplement = updated.find(s => s.id === id);
    if (supplement) {
      if (updates.reminders !== undefined || updates.time !== undefined) {
        await cancelSupplementReminder(supplement.notificationId);
        if (supplement.reminders) {
          const notificationId = await scheduleSupplementReminder(supplement);
          if (notificationId) {
            const idx = updated.findIndex(s => s.id === id);
            updated[idx] = { ...updated[idx], notificationId };
          }
        }
      }
    }

    setSupplements(updated);
    await saveSupplements(updated);

    // Track analytics (reuse supplement variable from above)
    if (supplement) {
      trackEvent(AnalyticsEvents.SUPPLEMENT_EDITED, {
        supplement_id: id,
        supplement_name: supplement.name,
        updated_fields: Object.keys(updates),
      });
    }
  }, [supplements, saveSupplements]);

  // Delete supplement
  const deleteSupplement = useCallback(async (id: string) => {
    const supplement = supplements.find(s => s.id === id);
    if (supplement?.notificationId) {
      await cancelSupplementReminder(supplement.notificationId);
    }

    // Track analytics before deletion
    if (supplement) {
      trackEvent(AnalyticsEvents.SUPPLEMENT_DELETED, {
        supplement_id: id,
        supplement_name: supplement.name,
      });
    }

    const updated = supplements.filter(sup => sup.id !== id);
    setSupplements(updated);
    await saveSupplements(updated);
  }, [supplements, saveSupplements]);

  // Log intake
  const logIntake = useCallback(async (supplementId: string) => {
    const todayKey = getTodayKey();
    const timestamp = new Date().toISOString();

    const updated = supplements.map(sup => {
      if (sup.id === supplementId) {
        const todayIntakes = sup.intakeHistory[todayKey] || [];
        return {
          ...sup,
          intakeHistory: {
            ...sup.intakeHistory,
            [todayKey]: [
              ...todayIntakes,
              { taken: true, timestamp, dose: sup.dosage.amount },
            ],
          },
          updatedAt: timestamp,
        };
      }
      return sup;
    });

    setSupplements(updated);
    await saveSupplements(updated);

    // Track analytics
    const supplement = supplements.find(s => s.id === supplementId);
    if (supplement) {
      const todayIntakes = updated.find(s => s.id === supplementId)?.intakeHistory[todayKey] || [];
      trackEvent(AnalyticsEvents.SUPPLEMENT_INTAKE_LOGGED, {
        supplement_id: supplementId,
        supplement_name: supplement.name,
        dosage_amount: supplement.dosage.amount,
        dosage_unit: supplement.dosage.unit,
        intake_number: todayIntakes.length,
        doses_per_day: supplement.dosesPerDay,
      });
    }
  }, [supplements, saveSupplements]);

  // Get today's intakes for a supplement
  const getTodayIntakes = useCallback((supplementId: string): IntakeRecord[] => {
    const supplement = supplements.find(s => s.id === supplementId);
    if (!supplement) return [];
    return supplement.intakeHistory[getTodayKey()] || [];
  }, [supplements]);

  // Get week intakes for tracking dots
  const getWeekIntakes = useCallback((supplementId: string) => {
    const supplement = supplements.find(s => s.id === supplementId);
    if (!supplement) return [];

    return getLast7Days().map(date => ({
      date,
      intakes: supplement.intakeHistory[date] || [],
    }));
  }, [supplements]);

  // Refresh
  const refreshSupplements = useCallback(async () => {
    setLoading(true);
    await loadSupplements();
  }, [loadSupplements]);

  return (
    <SupplementsContext.Provider
      value={{
        supplements,
        loading,
        addSupplement,
        updateSupplement,
        deleteSupplement,
        logIntake,
        getTodayIntakes,
        getWeekIntakes,
        refreshSupplements,
      }}
    >
      {children}
    </SupplementsContext.Provider>
  );
}

export function useSupplements() {
  const context = useContext(SupplementsContext);
  if (!context) {
    throw new Error('useSupplements must be used within a SupplementsProvider');
  }
  return context;
}

export default SupplementsContext;
