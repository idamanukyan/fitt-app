/**
 * Analytics Service - Mixpanel Integration
 *
 * Provides unified analytics tracking for the HyperFit app.
 * Tracks user actions, screen views, and custom events.
 */

import { Mixpanel } from 'mixpanel-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Replace with your Mixpanel project token
const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || 'YOUR_MIXPANEL_TOKEN';
const ANALYTICS_ENABLED_KEY = '@hyperfit_analytics_enabled';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  isPremium?: boolean;
  signupDate?: string;
  lastActiveDate?: string;
  totalWorkouts?: number;
  totalMeals?: number;
  preferredWorkoutType?: string;
  fitnessGoal?: string;
  [key: string]: any;
}

export interface EventProperties {
  [key: string]: any;
}

// ============================================================================
// EVENT NAMES - Standardized event naming
// ============================================================================

export const AnalyticsEvents = {
  // Authentication
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_SIGNUP: 'auth_signup',
  AUTH_PASSWORD_RESET: 'auth_password_reset',

  // Navigation / Screen Views
  SCREEN_VIEW: 'screen_view',

  // Workouts
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  WORKOUT_PAUSED: 'workout_paused',
  WORKOUT_CANCELLED: 'workout_cancelled',
  EXERCISE_COMPLETED: 'exercise_completed',
  SET_COMPLETED: 'set_completed',
  WORKOUT_CREATED: 'workout_created',
  WORKOUT_EDITED: 'workout_edited',
  WORKOUT_DELETED: 'workout_deleted',

  // Nutrition
  MEAL_LOGGED: 'meal_logged',
  MEAL_DELETED: 'meal_deleted',
  FOOD_SCANNED: 'food_scanned',
  FOOD_SEARCH: 'food_search',
  WATER_LOGGED: 'water_logged',
  NUTRITION_GOAL_SET: 'nutrition_goal_set',

  // Supplements
  SUPPLEMENT_ADDED: 'supplement_added',
  SUPPLEMENT_EDITED: 'supplement_edited',
  SUPPLEMENT_DELETED: 'supplement_deleted',
  SUPPLEMENT_INTAKE_LOGGED: 'supplement_intake_logged',
  SUPPLEMENT_REMINDER_SET: 'supplement_reminder_set',

  // Measurements
  MEASUREMENT_LOGGED: 'measurement_logged',
  PROGRESS_PHOTO_TAKEN: 'progress_photo_taken',
  PROGRESS_PHOTO_COMPARED: 'progress_photo_compared',

  // Goals
  GOAL_CREATED: 'goal_created',
  GOAL_COMPLETED: 'goal_completed',
  GOAL_UPDATED: 'goal_updated',

  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  ACHIEVEMENT_VIEWED: 'achievement_viewed',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',

  // AI / Chat
  AI_CHAT_MESSAGE_SENT: 'ai_chat_message_sent',
  AI_RECOMMENDATION_VIEWED: 'ai_recommendation_viewed',
  AI_RECOMMENDATION_APPLIED: 'ai_recommendation_applied',

  // Shop
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',

  // Settings
  SETTINGS_CHANGED: 'settings_changed',
  NOTIFICATION_TOGGLED: 'notification_toggled',
  THEME_CHANGED: 'theme_changed',

  // Engagement
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  PUSH_NOTIFICATION_RECEIVED: 'push_notification_received',
  PUSH_NOTIFICATION_TAPPED: 'push_notification_tapped',
  SHARE_CONTENT: 'share_content',
  RATE_APP_PROMPT: 'rate_app_prompt',
  RATE_APP_COMPLETED: 'rate_app_completed',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// ============================================================================
// ANALYTICS SERVICE CLASS
// ============================================================================

class AnalyticsService {
  private mixpanel: Mixpanel | null = null;
  private isInitialized = false;
  private isEnabled = true;
  private userId: string | null = null;
  private pendingEvents: Array<{ name: string; properties?: EventProperties }> = [];

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if analytics is enabled by user preference
      const enabledPref = await AsyncStorage.getItem(ANALYTICS_ENABLED_KEY);
      this.isEnabled = enabledPref !== 'false';

      if (!this.isEnabled) {
        console.log('Analytics disabled by user preference');
        return;
      }

      // Initialize Mixpanel
      this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
      await this.mixpanel.init();

      this.isInitialized = true;
      console.log('Analytics initialized successfully');

      // Flush any pending events
      this.flushPendingEvents();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Enable or disable analytics tracking
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(ANALYTICS_ENABLED_KEY, enabled.toString());

    if (enabled && !this.isInitialized) {
      await this.initialize();
    }

    if (this.mixpanel) {
      if (enabled) {
        this.mixpanel.optInTracking();
      } else {
        this.mixpanel.optOutTracking();
      }
    }
  }

  /**
   * Check if analytics is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Identify the current user
   */
  identify(userId: string, properties?: UserProperties): void {
    this.userId = userId;

    if (!this.isEnabled || !this.mixpanel) {
      return;
    }

    try {
      this.mixpanel.identify(userId);

      if (properties) {
        this.setUserProperties(properties);
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Set user properties (super properties that persist across events)
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isEnabled || !this.mixpanel) return;

    try {
      // Set people properties
      const peopleProps: Record<string, any> = {};

      if (properties.email) peopleProps['$email'] = properties.email;
      if (properties.name) peopleProps['$name'] = properties.name;

      // Add custom properties
      Object.entries(properties).forEach(([key, value]) => {
        if (!['email', 'name'].includes(key)) {
          peopleProps[key] = value;
        }
      });

      this.mixpanel.getPeople().set(peopleProps);

      // Also register as super properties for all future events
      this.mixpanel.registerSuperProperties({
        user_id: this.userId,
        is_premium: properties.isPremium || false,
        fitness_goal: properties.fitnessGoal,
      });
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Increment a user property (e.g., total_workouts)
   */
  incrementUserProperty(property: string, by: number = 1): void {
    if (!this.isEnabled || !this.mixpanel) return;

    try {
      this.mixpanel.getPeople().increment(property, by);
    } catch (error) {
      console.error('Failed to increment user property:', error);
    }
  }

  /**
   * Track an event
   */
  track(eventName: AnalyticsEventName | string, properties?: EventProperties): void {
    if (!this.isEnabled) return;

    const eventData = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    };

    if (!this.isInitialized || !this.mixpanel) {
      // Queue event for later
      this.pendingEvents.push(eventData);
      return;
    }

    try {
      this.mixpanel.track(eventName, eventData.properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track a screen view
   */
  trackScreenView(screenName: string, properties?: EventProperties): void {
    this.track(AnalyticsEvents.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track a button tap
   */
  trackButtonTap(buttonName: string, screenName: string, properties?: EventProperties): void {
    this.track('button_tap', {
      button_name: buttonName,
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track an error
   */
  trackError(error: Error | string, context?: string, properties?: EventProperties): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track(AnalyticsEvents.ERROR_OCCURRED, {
      error_message: errorMessage,
      error_stack: errorStack,
      context,
      ...properties,
    });
  }

  /**
   * Track timing (e.g., how long a workout took)
   */
  trackTiming(category: string, variable: string, durationMs: number, properties?: EventProperties): void {
    this.track('timing', {
      timing_category: category,
      timing_variable: variable,
      timing_value: durationMs,
      timing_value_seconds: Math.round(durationMs / 1000),
      ...properties,
    });
  }

  /**
   * Start a timed event (returns a function to end it)
   */
  startTimedEvent(eventName: string, properties?: EventProperties): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.track(eventName, {
        ...properties,
        duration_ms: duration,
        duration_seconds: Math.round(duration / 1000),
      });
    };
  }

  /**
   * Reset analytics (on logout)
   */
  reset(): void {
    this.userId = null;

    if (this.mixpanel) {
      try {
        this.mixpanel.reset();
      } catch (error) {
        console.error('Failed to reset analytics:', error);
      }
    }
  }

  /**
   * Flush pending events
   */
  private flushPendingEvents(): void {
    if (!this.mixpanel || this.pendingEvents.length === 0) return;

    this.pendingEvents.forEach(event => {
      try {
        this.mixpanel!.track(event.name, event.properties);
      } catch (error) {
        console.error('Failed to flush pending event:', error);
      }
    });

    this.pendingEvents = [];
  }

  /**
   * Force flush events to Mixpanel
   */
  flush(): void {
    if (this.mixpanel) {
      try {
        this.mixpanel.flush();
      } catch (error) {
        console.error('Failed to flush analytics:', error);
      }
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const analytics = new AnalyticsService();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const trackEvent = (eventName: AnalyticsEventName | string, properties?: EventProperties) => {
  analytics.track(eventName, properties);
};

export const trackScreen = (screenName: string, properties?: EventProperties) => {
  analytics.trackScreenView(screenName, properties);
};

export const identifyUser = (userId: string, properties?: UserProperties) => {
  analytics.identify(userId, properties);
};

export default analytics;
