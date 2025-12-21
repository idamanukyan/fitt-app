/**
 * useDateTime Hook for HyperFit
 *
 * Production-ready date/time hook with:
 * - Auto-detection of current local date/time
 * - Locale formatting based on system settings
 * - Dynamic greeting based on time of day
 * - Timezone awareness
 * - Automatic updates at minute boundaries
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NativeModules, Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type Greeting =
  | 'Good morning'
  | 'Good afternoon'
  | 'Good evening'
  | 'Good night';

export interface FormattedDate {
  /** Full date: "Tuesday, December 9" */
  full: string;
  /** Short date: "Dec 9" */
  short: string;
  /** Weekday only: "Tuesday" */
  weekday: string;
  /** Month and day: "December 9" */
  monthDay: string;
  /** ISO format: "2025-12-09" */
  iso: string;
}

export interface FormattedTime {
  /** Time with locale format: "2:30 PM" or "14:30" */
  formatted: string;
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
  /** Time of day period */
  timeOfDay: TimeOfDay;
}

export interface UseDateTimeReturn {
  /** Current Date object */
  now: Date;
  /** Formatted date strings */
  date: FormattedDate;
  /** Formatted time information */
  time: FormattedTime;
  /** Dynamic greeting based on time of day */
  greeting: Greeting;
  /** User's timezone string */
  timezone: string;
  /** User's locale string */
  locale: string;
  /** Force refresh the current time */
  refresh: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the device's locale
 */
function getDeviceLocale(): string {
  try {
    // For iOS
    if (Platform.OS === 'ios') {
      const locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
      if (locale) return locale.replace('_', '-');
    }

    // For Android
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier;
      if (locale) return locale.replace('_', '-');
    }

    // Web fallback
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
  } catch {
    // Fallback to en-US if detection fails
  }

  return 'en-US';
}

/**
 * Get the device's timezone
 */
function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Determine time of day from hour
 */
function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get greeting based on time of day
 */
function getGreeting(timeOfDay: TimeOfDay): Greeting {
  switch (timeOfDay) {
    case 'morning':
      return 'Good morning';
    case 'afternoon':
      return 'Good afternoon';
    case 'evening':
      return 'Good evening';
    case 'night':
      return 'Good night';
  }
}

/**
 * Format date for different display purposes
 */
function formatDate(date: Date, locale: string): FormattedDate {
  const fullFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const shortFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  });

  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
  });

  const monthDayFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
  });

  // ISO format (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return {
    full: fullFormatter.format(date),
    short: shortFormatter.format(date),
    weekday: weekdayFormatter.format(date),
    monthDay: monthDayFormatter.format(date),
    iso: `${year}-${month}-${day}`,
  };
}

/**
 * Format time for display
 */
function formatTime(date: Date, locale: string): FormattedTime {
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeOfDay = getTimeOfDay(hour);

  return {
    formatted: timeFormatter.format(date),
    hour,
    minute,
    timeOfDay,
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDateTime(): UseDateTimeReturn {
  const [now, setNow] = useState(() => new Date());
  const locale = useMemo(() => getDeviceLocale(), []);
  const timezone = useMemo(() => getDeviceTimezone(), []);

  // ========================================
  // Refresh Function
  // ========================================

  const refresh = useCallback(() => {
    setNow(new Date());
  }, []);

  // ========================================
  // Auto-update at minute boundaries
  // ========================================

  useEffect(() => {
    // Calculate ms until next minute
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Set timeout for next minute
    const timeout = setTimeout(() => {
      setNow(new Date());
    }, msUntilNextMinute);

    // Also set an interval for subsequent updates (in case timeout drifts)
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [now]);

  // ========================================
  // Computed Values
  // ========================================

  const date = useMemo(() => formatDate(now, locale), [now, locale]);
  const time = useMemo(() => formatTime(now, locale), [now, locale]);
  const greeting = useMemo(() => getGreeting(time.timeOfDay), [time.timeOfDay]);

  // ========================================
  // Return
  // ========================================

  return {
    now,
    date,
    time,
    greeting,
    timezone,
    locale,
    refresh,
  };
}

// ============================================================================
// Additional Utility Hooks
// ============================================================================

/**
 * Hook that only returns the greeting (lightweight alternative)
 */
export function useGreeting(): Greeting {
  const [greeting, setGreeting] = useState<Greeting>(() => {
    const hour = new Date().getHours();
    return getGreeting(getTimeOfDay(hour));
  });

  useEffect(() => {
    const checkGreeting = () => {
      const hour = new Date().getHours();
      const newGreeting = getGreeting(getTimeOfDay(hour));
      setGreeting(newGreeting);
    };

    // Check every 5 minutes
    const interval = setInterval(checkGreeting, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return greeting;
}

/**
 * Hook that returns formatted current date string
 */
export function useFormattedDate(): string {
  const [formatted, setFormatted] = useState<string>(() => {
    const locale = getDeviceLocale();
    return formatDate(new Date(), locale).full;
  });

  useEffect(() => {
    const locale = getDeviceLocale();

    const checkDate = () => {
      setFormatted(formatDate(new Date(), locale).full);
    };

    // Check every minute
    const interval = setInterval(checkDate, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return formatted;
}

export default useDateTime;
