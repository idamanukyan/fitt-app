/**
 * Analytics Context
 *
 * Provides analytics functionality throughout the app via React Context.
 * Automatically tracks screen views and provides hooks for event tracking.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePathname, useSegments } from 'expo-router';
import analytics, {
  AnalyticsEvents,
  UserProperties,
  EventProperties,
  AnalyticsEventName,
} from '../services/analyticsService';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyticsContextType {
  isInitialized: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
  track: (eventName: AnalyticsEventName | string, properties?: EventProperties) => void;
  trackScreen: (screenName: string, properties?: EventProperties) => void;
  trackButtonTap: (buttonName: string, properties?: EventProperties) => void;
  trackError: (error: Error | string, context?: string) => void;
  identify: (userId: string, properties?: UserProperties) => void;
  reset: () => void;
  startTimedEvent: (eventName: string, properties?: EventProperties) => () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabledState] = useState(true);
  const pathname = usePathname();
  const segments = useSegments();

  // Initialize analytics on mount
  useEffect(() => {
    const init = async () => {
      await analytics.initialize();
      setIsInitialized(true);
      setIsEnabledState(analytics.getEnabled());

      // Track app opened
      analytics.track(AnalyticsEvents.APP_OPENED, {
        source: 'cold_start',
      });
    };

    init();
  }, []);

  // Track app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        analytics.track(AnalyticsEvents.APP_OPENED, {
          source: 'from_background',
        });
      } else if (nextAppState === 'background') {
        analytics.track(AnalyticsEvents.APP_BACKGROUNDED);
        analytics.flush();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Auto-track screen views when pathname changes
  useEffect(() => {
    if (!isInitialized || !pathname) return;

    // Convert pathname to readable screen name
    const screenName = getScreenNameFromPath(pathname, segments);
    analytics.trackScreenView(screenName, {
      path: pathname,
      segments: segments.join('/'),
    });
  }, [pathname, segments, isInitialized]);

  // Set enabled state
  const setEnabled = useCallback(async (enabled: boolean) => {
    await analytics.setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  // Track event
  const track = useCallback((eventName: AnalyticsEventName | string, properties?: EventProperties) => {
    analytics.track(eventName, properties);
  }, []);

  // Track screen view
  const trackScreen = useCallback((screenName: string, properties?: EventProperties) => {
    analytics.trackScreenView(screenName, properties);
  }, []);

  // Track button tap with current screen context
  const trackButtonTap = useCallback((buttonName: string, properties?: EventProperties) => {
    const screenName = getScreenNameFromPath(pathname, segments);
    analytics.trackButtonTap(buttonName, screenName, properties);
  }, [pathname, segments]);

  // Track error
  const trackError = useCallback((error: Error | string, context?: string) => {
    analytics.trackError(error, context);
  }, []);

  // Identify user
  const identify = useCallback((userId: string, properties?: UserProperties) => {
    analytics.identify(userId, properties);
  }, []);

  // Reset on logout
  const reset = useCallback(() => {
    analytics.reset();
  }, []);

  // Start timed event
  const startTimedEvent = useCallback((eventName: string, properties?: EventProperties) => {
    return analytics.startTimedEvent(eventName, properties);
  }, []);

  const value: AnalyticsContextType = {
    isInitialized,
    isEnabled,
    setEnabled,
    track,
    trackScreen,
    trackButtonTap,
    trackError,
    identify,
    reset,
    startTimedEvent,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Main analytics hook
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

/**
 * Hook for tracking a specific event type
 */
export function useTrackEvent(eventName: AnalyticsEventName | string) {
  const { track } = useAnalytics();
  return useCallback((properties?: EventProperties) => {
    track(eventName, properties);
  }, [track, eventName]);
}

/**
 * Hook for tracking screen time
 */
export function useTrackScreenTime(screenName: string) {
  const { startTimedEvent } = useAnalytics();

  useEffect(() => {
    const endTimer = startTimedEvent('screen_time', { screen_name: screenName });
    return () => {
      endTimer();
    };
  }, [screenName, startTimedEvent]);
}

/**
 * Hook for tracking component mount/unmount
 */
export function useTrackMount(componentName: string, properties?: EventProperties) {
  const { track } = useAnalytics();

  useEffect(() => {
    track('component_mounted', { component_name: componentName, ...properties });
    return () => {
      track('component_unmounted', { component_name: componentName, ...properties });
    };
  }, [componentName, track]);
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert pathname and segments to a readable screen name
 */
function getScreenNameFromPath(pathname: string, segments: string[]): string {
  if (!pathname || pathname === '/') {
    return 'Home';
  }

  // Remove leading slash and split
  const parts = pathname.replace(/^\//, '').split('/');

  // Handle dynamic segments [id]
  const cleanParts = parts.map(part => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return 'Detail';
    }
    return part;
  });

  // Convert to title case and join
  const screenName = cleanParts
    .filter(part => !part.startsWith('(') && !part.endsWith(')')) // Remove route groups
    .map(part => {
      // Convert kebab-case to Title Case
      return part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    })
    .join(' > ');

  return screenName || 'Unknown';
}

// ============================================================================
// TRACKING COMPONENTS
// ============================================================================

/**
 * Component that tracks when it becomes visible
 */
interface TrackVisibleProps {
  eventName: string;
  properties?: EventProperties;
  children: ReactNode;
}

export function TrackVisible({ eventName, properties, children }: TrackVisibleProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    track(eventName, properties);
  }, [eventName, properties, track]);

  return <>{children}</>;
}

export default AnalyticsContext;
