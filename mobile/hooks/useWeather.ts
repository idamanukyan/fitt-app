/**
 * useWeather Hook for HyperFit
 *
 * Production-ready weather hook with:
 * - Geolocation integration
 * - Loading, error, and retry states
 * - Permission handling
 * - Automatic refresh
 * - Background/foreground awareness
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Location from 'expo-location';
import {
  weatherService,
  type WeatherData,
  type WeatherError,
  type Coordinates,
} from '../services/weatherService';

// ============================================================================
// Types
// ============================================================================

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'checking';

export interface UseWeatherState {
  weather: WeatherData | null;
  isLoading: boolean;
  error: WeatherError | null;
  locationPermission: LocationPermissionStatus;
  lastUpdated: Date | null;
}

export interface UseWeatherActions {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
}

export type UseWeatherReturn = UseWeatherState & UseWeatherActions;

// ============================================================================
// Constants
// ============================================================================

const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const LOCATION_TIMEOUT = 15000; // 15 seconds

// ============================================================================
// Hook Implementation
// ============================================================================

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WeatherError | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>('checking');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMounted = useRef(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentCoords = useRef<Coordinates | null>(null);

  // ========================================
  // Location Permission
  // ========================================

  const checkLocationPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const permissionStatus: LocationPermissionStatus =
        status === 'granted' ? 'granted' :
        status === 'denied' ? 'denied' : 'undetermined';

      if (isMounted.current) {
        setLocationPermission(permissionStatus);
      }
      return permissionStatus;
    } catch {
      if (isMounted.current) {
        setLocationPermission('denied');
      }
      return 'denied';
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLocationPermission('checking');
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';

      if (isMounted.current) {
        setLocationPermission(granted ? 'granted' : 'denied');
      }

      return granted;
    } catch {
      if (isMounted.current) {
        setLocationPermission('denied');
      }
      return false;
    }
  }, []);

  // ========================================
  // Get Current Location
  // ========================================

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_TIMEOUT,
      });

      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      currentCoords.current = coords;
      return coords;
    } catch {
      // Try last known location as fallback
      try {
        const lastLocation = await Location.getLastKnownPositionAsync();
        if (lastLocation) {
          const coords: Coordinates = {
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
          };
          currentCoords.current = coords;
          return coords;
        }
      } catch {
        // Ignore fallback errors
      }
      return null;
    }
  }, []);

  // ========================================
  // Fetch Weather
  // ========================================

  const fetchWeather = useCallback(async (forceRefresh = false): Promise<void> => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check permission first
      console.log('[useWeather] Checking location permission...');
      const permission = await checkLocationPermission();
      console.log('[useWeather] Permission status:', permission);

      if (permission !== 'granted') {
        throw {
          code: 'INVALID_LOCATION' as const,
          message: 'Location permission not granted',
          retryable: false,
        };
      }

      // Get coordinates
      console.log('[useWeather] Getting current location...');
      const coords = await getCurrentLocation();
      console.log('[useWeather] Coordinates:', coords);

      if (!coords) {
        throw {
          code: 'INVALID_LOCATION' as const,
          message: 'Unable to get current location',
          retryable: true,
        };
      }

      // Fetch weather
      console.log('[useWeather] Fetching weather for:', coords.latitude, coords.longitude);
      const data = await weatherService.getWeather(coords, forceRefresh);
      console.log('[useWeather] Weather data received:', data.temperature, '°C in', data.cityName);

      if (isMounted.current) {
        setWeather(data);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('[useWeather] Error:', err);
      if (isMounted.current) {
        const weatherError = err as WeatherError;
        setError(weatherError);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [checkLocationPermission, getCurrentLocation]);

  // ========================================
  // Refresh & Retry
  // ========================================

  const refresh = useCallback(async (): Promise<void> => {
    await fetchWeather(true);
  }, [fetchWeather]);

  const retry = useCallback(async (): Promise<void> => {
    // If permission denied, request it first
    if (locationPermission === 'denied') {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }
    await fetchWeather(true);
  }, [fetchWeather, locationPermission, requestLocationPermission]);

  // ========================================
  // Auto Refresh Timer
  // ========================================

  const setupAutoRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    refreshTimer.current = setTimeout(() => {
      if (isMounted.current && locationPermission === 'granted') {
        fetchWeather(false);
        setupAutoRefresh();
      }
    }, AUTO_REFRESH_INTERVAL);
  }, [fetchWeather, locationPermission]);

  // ========================================
  // App State Handler (background/foreground)
  // ========================================

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && locationPermission === 'granted') {
        // Refresh when app comes to foreground
        const now = Date.now();
        const lastUpdate = lastUpdated?.getTime() || 0;

        // Only refresh if last update was > 10 minutes ago
        if (now - lastUpdate > 10 * 60 * 1000) {
          fetchWeather(false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [fetchWeather, lastUpdated, locationPermission]);

  // ========================================
  // Initial Fetch & Cleanup
  // ========================================

  useEffect(() => {
    isMounted.current = true;

    // Initial fetch
    fetchWeather(false);
    setupAutoRefresh();

    return () => {
      isMounted.current = false;
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  // ========================================
  // Return
  // ========================================

  return {
    weather,
    isLoading,
    error,
    locationPermission,
    lastUpdated,
    refresh,
    retry,
    requestLocationPermission,
  };
}

export default useWeather;
