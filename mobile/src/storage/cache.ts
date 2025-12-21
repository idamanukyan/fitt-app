/**
 * Cache Helper - AsyncStorage-based caching with TTL
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const CACHE_PREFIX = '@hyperfit_cache_';

// TTL Constants (in milliseconds)
export const TTL = {
  // Exercise data
  SEARCH_RESULTS: 24 * 60 * 60 * 1000, // 24 hours
  EXERCISE_DETAIL: 7 * 24 * 60 * 60 * 1000, // 7 days
  EXERCISE_LIST: 24 * 60 * 60 * 1000, // 24 hours
  MUSCLE_LIST: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Training analytics
  ANALYTICS_SUMMARY: 15 * 60 * 1000, // 15 minutes
  ANALYTICS_TRENDS: 30 * 60 * 1000, // 30 minutes
  EXERCISE_ANALYTICS: 15 * 60 * 1000, // 15 minutes
  PERSONAL_RECORDS: 5 * 60 * 1000, // 5 minutes

  // User stats & gamification
  USER_STATS: 5 * 60 * 1000, // 5 minutes
  GAMIFICATION_STATE: 5 * 60 * 1000, // 5 minutes
  ACHIEVEMENTS: 10 * 60 * 1000, // 10 minutes
  CHALLENGES: 15 * 60 * 1000, // 15 minutes
  LEADERBOARD: 5 * 60 * 1000, // 5 minutes

  // Coach insights
  INSIGHTS: 4 * 60 * 60 * 1000, // 4 hours
  CORRELATIONS: 4 * 60 * 60 * 1000, // 4 hours
  RECOMMENDATIONS: 1 * 60 * 60 * 1000, // 1 hour

  // AI sessions
  AI_SESSION_CONFIG: 24 * 60 * 60 * 1000, // 24 hours
  AI_SESSION_HISTORY: 15 * 60 * 1000, // 15 minutes
};

/**
 * Get cached data if not expired
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - entry.timestamp > entry.ttl) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Save data to cache with TTL
 */
export async function saveToCache<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

/**
 * Remove specific cache entry
 */
export async function removeFromCache(key: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Cache remove error:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
}

/**
 * Generate cache key for search queries
 */
export function searchCacheKey(query: string, muscleId?: number): string {
  const normalized = query.toLowerCase().trim();
  return `search_${normalized}_${muscleId || 'all'}`;
}

/**
 * Generate cache key for exercise detail
 */
export function exerciseCacheKey(id: string | number): string {
  return `exercise_${id}`;
}

/**
 * Generate cache key for analytics summary
 */
export function analyticsCacheKey(period: '7d' | '30d' | '90d' | 'all'): string {
  return `analytics_summary_${period}`;
}

/**
 * Generate cache key for exercise analytics
 */
export function exerciseAnalyticsCacheKey(exerciseId: string): string {
  return `exercise_analytics_${exerciseId}`;
}

/**
 * Generate cache key for gamification state
 */
export function gamificationCacheKey(userId: string): string {
  return `gamification_${userId}`;
}

/**
 * Generate cache key for achievements
 */
export function achievementsCacheKey(userId: string): string {
  return `achievements_${userId}`;
}

/**
 * Generate cache key for challenges
 */
export function challengesCacheKey(userId: string, type?: string): string {
  return `challenges_${userId}_${type || 'all'}`;
}

/**
 * Generate cache key for coach insights
 */
export function insightsCacheKey(userId: string): string {
  return `insights_${userId}`;
}

/**
 * Generate cache key for correlations
 */
export function correlationsCacheKey(userId: string): string {
  return `correlations_${userId}`;
}

/**
 * Generate cache key for AI session history
 */
export function aiSessionHistoryCacheKey(userId: string): string {
  return `ai_sessions_${userId}`;
}

/**
 * Invalidate related cache entries when data changes
 */
export async function invalidateRelatedCaches(
  category: 'workout' | 'sleep' | 'measurement' | 'ai_session'
): Promise<void> {
  const keysToInvalidate: string[] = [];

  switch (category) {
    case 'workout':
      // Workout completion affects analytics, insights, gamification
      keysToInvalidate.push(
        'analytics_summary',
        'exercise_analytics',
        'insights',
        'correlations',
        'gamification',
        'achievements',
        'challenges'
      );
      break;
    case 'sleep':
      // Sleep data affects insights and correlations
      keysToInvalidate.push('insights', 'correlations');
      break;
    case 'measurement':
      // Measurements affect correlations
      keysToInvalidate.push('correlations', 'insights');
      break;
    case 'ai_session':
      // AI sessions affect analytics, form insights, gamification
      keysToInvalidate.push(
        'analytics_summary',
        'insights',
        'gamification',
        'ai_sessions'
      );
      break;
  }

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => {
      if (!k.startsWith(CACHE_PREFIX)) return false;
      const keyWithoutPrefix = k.replace(CACHE_PREFIX, '');
      return keysToInvalidate.some((pattern) => keyWithoutPrefix.startsWith(pattern));
    });

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('Cache invalidation error:', error);
  }
}

/**
 * Get cache stats for debugging
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalSize: number;
  categories: Record<string, number>;
}> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));

    const categories: Record<string, number> = {};
    let totalSize = 0;

    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        const category = key.replace(CACHE_PREFIX, '').split('_')[0];
        categories[category] = (categories[category] || 0) + 1;
      }
    }

    return {
      totalEntries: cacheKeys.length,
      totalSize,
      categories,
    };
  } catch (error) {
    console.warn('Cache stats error:', error);
    return { totalEntries: 0, totalSize: 0, categories: {} };
  }
}
