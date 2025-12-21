/**
 * Weather Service for HyperFit
 *
 * Production-ready weather API integration with:
 * - OpenWeatherMap API support
 * - Type-safe response mapping
 * - Error handling (network issues, rate limits)
 * - Provider abstraction for easy API switching
 * - Response caching support
 */

// ============================================================================
// Types
// ============================================================================

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: WeatherIconType;
  condition: WeatherCondition;
  windSpeed: number;
  cityName: string;
  timestamp: number;
}

export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog'
  | 'haze'
  | 'dust'
  | 'smoke'
  | 'unknown';

export type WeatherIconType =
  | 'sunny'
  | 'partly-sunny'
  | 'cloudy'
  | 'rainy'
  | 'thunderstorm'
  | 'snow'
  | 'moon'
  | 'cloudy-night';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WeatherError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'RATE_LIMIT' | 'INVALID_LOCATION' | 'API_KEY_MISSING';
  message: string;
  retryable: boolean;
}

// OpenWeatherMap API Response Types
interface OWMWeatherResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { sunrise: number; sunset: number; country: string };
  name: string;
  cod: number;
}

// ============================================================================
// Weather Icon Mapping
// ============================================================================

const OWM_ICON_MAP: Record<string, WeatherIconType> = {
  '01d': 'sunny',
  '01n': 'moon',
  '02d': 'partly-sunny',
  '02n': 'cloudy-night',
  '03d': 'cloudy',
  '03n': 'cloudy',
  '04d': 'cloudy',
  '04n': 'cloudy',
  '09d': 'rainy',
  '09n': 'rainy',
  '10d': 'rainy',
  '10n': 'rainy',
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'cloudy',
  '50n': 'cloudy',
};

const CONDITION_MAP: Record<string, WeatherCondition> = {
  'Clear': 'clear',
  'Clouds': 'clouds',
  'Rain': 'rain',
  'Drizzle': 'drizzle',
  'Thunderstorm': 'thunderstorm',
  'Snow': 'snow',
  'Mist': 'mist',
  'Fog': 'fog',
  'Haze': 'haze',
  'Dust': 'dust',
  'Smoke': 'smoke',
  'Sand': 'dust',
  'Ash': 'dust',
  'Squall': 'rain',
  'Tornado': 'thunderstorm',
};

// ============================================================================
// Weather Provider Interface (for easy API switching)
// ============================================================================

interface WeatherProvider {
  fetchWeather(coords: Coordinates): Promise<WeatherData>;
}

// ============================================================================
// OpenWeatherMap Provider
// ============================================================================

class OpenWeatherMapProvider implements WeatherProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchWeather(coords: Coordinates): Promise<WeatherData> {
    const url = `${this.baseUrl}/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        throw createWeatherError('API_ERROR', 'Invalid API key');
      }
      if (response.status === 429) {
        throw createWeatherError('RATE_LIMIT', 'API rate limit exceeded');
      }
      throw createWeatherError('API_ERROR', `Weather API error: ${response.status}`);
    }

    const data: OWMWeatherResponse = await response.json();
    return this.mapResponse(data);
  }

  private mapResponse(data: OWMWeatherResponse): WeatherData {
    const weather = data.weather[0];
    const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: weather.description,
      icon: OWM_ICON_MAP[weather.icon] || (isNight ? 'moon' : 'sunny'),
      condition: CONDITION_MAP[weather.main] || 'unknown',
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      cityName: data.name,
      timestamp: Date.now(),
    };
  }
}

// ============================================================================
// Error Helper
// ============================================================================

function createWeatherError(
  code: WeatherError['code'],
  message: string
): WeatherError {
  const retryable = code === 'NETWORK_ERROR' || code === 'RATE_LIMIT';
  return { code, message, retryable };
}

// ============================================================================
// Cache Manager
// ============================================================================

const CACHE_KEY = 'hyperfit_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  data: WeatherData;
  expiresAt: number;
  coords: Coordinates;
}

function getCachedWeather(coords: Coordinates): WeatherData | null {
  try {
    if (typeof localStorage === 'undefined') return null;

    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedWeather = JSON.parse(cached);

    // Check if expired
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if location changed significantly (> 10km)
    const distance = calculateDistance(coords, parsed.coords);
    if (distance > 10) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedWeather(data: WeatherData, coords: Coordinates): void {
  try {
    if (typeof localStorage === 'undefined') return;

    const cached: CachedWeather = {
      data,
      expiresAt: Date.now() + CACHE_DURATION,
      coords,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Silently fail if storage is unavailable
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================================================
// Weather Service
// ============================================================================

class WeatherService {
  private provider: WeatherProvider | null = null;

  initialize(apiKey: string): void {
    if (!apiKey) {
      console.warn('[WeatherService] No API key provided');
      return;
    }
    this.provider = new OpenWeatherMapProvider(apiKey);
  }

  async getWeather(coords: Coordinates, forceRefresh = false): Promise<WeatherData> {
    // Clear cache if force refresh
    if (forceRefresh) {
      console.log('[WeatherService] Force refresh - clearing cache');
      this.clearCache();
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getCachedWeather(coords);
      if (cached) {
        console.log('[WeatherService] Returning cached weather:', cached.temperature, '°C');
        return cached;
      }
    }

    if (!this.provider) {
      throw createWeatherError('API_KEY_MISSING', 'Weather API key not configured');
    }

    try {
      console.log('[WeatherService] Fetching fresh weather data...');
      const data = await this.provider.fetchWeather(coords);
      console.log('[WeatherService] Fresh data:', data.temperature, '°C in', data.cityName);
      setCachedWeather(data, coords);
      return data;
    } catch (error) {
      console.error('[WeatherService] Fetch error:', error);
      if ((error as WeatherError).code) {
        throw error;
      }
      throw createWeatherError('NETWORK_ERROR', 'Failed to fetch weather data');
    }
  }

  clearCache(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch {
      // Silently fail
    }
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const weatherService = new WeatherService();

// Initialize with API key
// Note: In Expo, environment variables are embedded at build time
const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '3808d7082b97493cdddf610ae3dc00cf';
console.log('[WeatherService] Initializing with API key:', apiKey ? 'present' : 'missing');
weatherService.initialize(apiKey);

export default weatherService;
