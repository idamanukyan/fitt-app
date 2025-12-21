/**
 * WeatherDisplay Component for HyperFit
 *
 * Production-ready weather display with:
 * - Dynamic weather icons using Ionicons
 * - Temperature display
 * - Loading, error, and permission states
 * - Retry functionality
 * - Animated temperature changes
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { WeatherIconType, WeatherError } from '../../services/weatherService';
import type { LocationPermissionStatus } from '../../hooks/useWeather';
import theme from '../../utils/theme';

// ============================================================================
// Types
// ============================================================================

interface WeatherDisplayProps {
  temperature: number | null;
  icon: WeatherIconType | null;
  description?: string;
  cityName?: string;
  isLoading: boolean;
  error: WeatherError | null;
  locationPermission: LocationPermissionStatus;
  onRetry?: () => void;
  onRequestPermission?: () => void;
  compact?: boolean;
}

// ============================================================================
// Weather Icon Mapping
// ============================================================================

const WEATHER_ICON_MAP: Record<WeatherIconType, keyof typeof Ionicons.glyphMap> = {
  'sunny': 'sunny',
  'partly-sunny': 'partly-sunny',
  'cloudy': 'cloud',
  'rainy': 'rainy',
  'thunderstorm': 'thunderstorm',
  'snow': 'snow',
  'moon': 'moon',
  'cloudy-night': 'cloudy-night',
};

const WEATHER_ICON_COLORS: Record<WeatherIconType, string> = {
  'sunny': '#FFD700',
  'partly-sunny': '#FFA500',
  'cloudy': '#A0AEC0',
  'rainy': '#63B3ED',
  'thunderstorm': '#9F7AEA',
  'snow': '#E2E8F0',
  'moon': '#F6E05E',
  'cloudy-night': '#718096',
};

// ============================================================================
// Component
// ============================================================================

export function WeatherDisplay({
  temperature,
  icon,
  description,
  cityName,
  isLoading,
  error,
  locationPermission,
  onRetry,
  onRequestPermission,
  compact = false,
}: WeatherDisplayProps): JSX.Element {
  // Animated value for temperature changes
  const tempAnim = useRef(new Animated.Value(1)).current;
  const prevTemp = useRef(temperature);

  // Animate on temperature change
  useEffect(() => {
    if (temperature !== null && prevTemp.current !== temperature) {
      Animated.sequence([
        Animated.timing(tempAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tempAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      prevTemp.current = temperature;
    }
  }, [temperature, tempAnim]);

  // ========================================
  // Render States
  // ========================================

  // Loading state
  if (isLoading && temperature === null) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <ActivityIndicator size="small" color={theme.colors.techCyan} />
        {!compact && <Text style={styles.loadingText}>LOADING...</Text>}
      </View>
    );
  }

  // Permission checking state
  if (locationPermission === 'checking') {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Ionicons name="location" size={compact ? 18 : 24} color={theme.colors.darkGray} />
        {!compact && <Text style={styles.permissionText}>CHECKING LOCATION...</Text>}
      </View>
    );
  }

  // Permission denied state
  if (locationPermission === 'denied') {
    return (
      <TouchableOpacity
        style={[styles.container, compact && styles.containerCompact]}
        onPress={onRequestPermission}
        activeOpacity={0.7}
      >
        <Ionicons name="location-outline" size={compact ? 18 : 24} color={theme.colors.techOrange} />
        {!compact && (
          <Text style={styles.permissionText}>
            ENABLE LOCATION
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Error state with retry
  if (error && !temperature) {
    return (
      <TouchableOpacity
        style={[styles.container, compact && styles.containerCompact]}
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <Ionicons
          name="cloud-offline-outline"
          size={compact ? 18 : 24}
          color={theme.colors.darkGray}
        />
        {!compact && (
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>WEATHER UNAVAILABLE</Text>
            <Text style={styles.retryText}>TAP TO RETRY</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Success state - show weather
  const weatherIcon = icon ? WEATHER_ICON_MAP[icon] : 'cloud';
  const iconColor = icon ? WEATHER_ICON_COLORS[icon] : theme.colors.darkGray;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Weather Icon */}
      <Ionicons name={weatherIcon} size={compact ? 20 : 28} color={iconColor} />

      {/* Temperature */}
      <Animated.Text
        style={[
          styles.temperature,
          compact && styles.temperatureCompact,
          { transform: [{ scale: tempAnim }] },
        ]}
      >
        {temperature !== null ? `${temperature}°` : '--°'}
      </Animated.Text>

      {/* Additional Info (non-compact only) */}
      {!compact && description && (
        <Text style={styles.description} numberOfLines={1}>
          {description.toUpperCase()}
        </Text>
      )}

      {/* Loading indicator while refreshing */}
      {isLoading && temperature !== null && (
        <ActivityIndicator
          size="small"
          color={theme.colors.techCyan}
          style={styles.refreshIndicator}
        />
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.glassEffect,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.steel}20`,
  },
  containerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  temperature: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  temperatureCompact: {
    fontSize: theme.typography.fontSize.md,
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 1,
    maxWidth: 80,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 1,
  },
  permissionText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techOrange,
    letterSpacing: 1,
  },
  errorContent: {
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 1,
  },
  retryText: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.techCyan,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  refreshIndicator: {
    marginLeft: 4,
  },
});

export default WeatherDisplay;
