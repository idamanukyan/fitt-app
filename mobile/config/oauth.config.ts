/**
 * OAuth Configuration
 *
 * IMPORTANT: Before going live, you need to:
 *
 * 1. GOOGLE:
 *    - Go to https://console.cloud.google.com/
 *    - Create a new project or select existing
 *    - Enable Google Sign-In API
 *    - Create OAuth 2.0 credentials (Web, iOS, Android)
 *    - Add authorized redirect URIs
 *    - Copy Client IDs below
 *
 * 2. APPLE:
 *    - Go to https://developer.apple.com/
 *    - Register your App ID with Sign in with Apple capability
 *    - Create a Service ID for web sign-in
 *    - Configure domains and redirect URLs
 *
 * 3. FACEBOOK:
 *    - Go to https://developers.facebook.com/
 *    - Create a new app
 *    - Add Facebook Login product
 *    - Configure OAuth settings
 *    - Copy App ID and App Secret
 */

import Constants from 'expo-constants';

// Get the scheme from app.json for redirect URIs
const scheme = Constants.expoConfig?.scheme || 'hyperfit';

// Bundle identifier for native builds
const bundleId = Constants.expoConfig?.ios?.bundleIdentifier || 'com.hyperfit.app';

export const OAuthConfig = {
  // Google OAuth Configuration
  google: {
    // Web Client ID (for Expo Go and web)
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    // iOS Client ID (for standalone iOS app)
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    // Android Client ID (for standalone Android app)
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    // Scopes to request
    scopes: ['profile', 'email'],
  },

  // Apple OAuth Configuration
  apple: {
    // Service ID for web (only needed for web sign-in)
    serviceId: process.env.EXPO_PUBLIC_APPLE_SERVICE_ID || '',
    // Redirect URI for web
    redirectUri: `${scheme}://auth/apple/callback`,
  },

  // Facebook OAuth Configuration
  facebook: {
    appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
    // Scopes to request
    scopes: ['public_profile', 'email'],
  },

  // App scheme for redirects
  scheme,

  // Backend API endpoints for OAuth token exchange
  api: {
    googleAuth: '/api/auth/google',
    appleAuth: '/api/auth/apple',
    facebookAuth: '/api/auth/facebook',
  },
};

// Validation helper
export function validateOAuthConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!OAuthConfig.google.webClientId) {
    missing.push('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }
  if (!OAuthConfig.facebook.appId) {
    missing.push('EXPO_PUBLIC_FACEBOOK_APP_ID');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export default OAuthConfig;
