/**
 * OAuth Service
 *
 * Handles Google, Apple, and Facebook authentication
 * Uses Expo's authentication libraries for cross-platform support
 */

import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { OAuthConfig } from '../config/oauth.config';
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse } from '../types/api.types';

// Required for web browser redirect
WebBrowser.maybeCompleteAuthSession();

// OAuth Provider Types
export type OAuthProvider = 'google' | 'apple' | 'facebook';

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: OAuthProvider;
}

// =============================================================================
// GOOGLE AUTHENTICATION
// =============================================================================

/**
 * Hook for Google Sign-In
 * Must be used within a React component
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: OAuthConfig.google.webClientId,
    iosClientId: OAuthConfig.google.iosClientId,
    androidClientId: OAuthConfig.google.androidClientId,
    scopes: OAuthConfig.google.scopes,
  });

  return {
    request,
    response,
    promptAsync,
    isReady: !!request,
  };
}

/**
 * Exchange Google auth code/token for user info
 */
export async function handleGoogleSignIn(
  accessToken: string
): Promise<OAuthUserInfo> {
  // Fetch user info from Google
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  const data = await response.json();

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    provider: 'google',
  };
}

// =============================================================================
// APPLE AUTHENTICATION
// =============================================================================

/**
 * Check if Apple Sign-In is available (iOS 13+ only)
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  return await AppleAuthentication.isAvailableAsync();
}

/**
 * Perform Apple Sign-In
 */
export async function signInWithApple(): Promise<OAuthUserInfo> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Apple only provides name/email on first sign-in
    // Store it locally for subsequent logins
    if (credential.email) {
      await AsyncStorage.setItem(
        `apple_user_${credential.user}`,
        JSON.stringify({
          email: credential.email,
          fullName: credential.fullName,
        })
      );
    }

    // Try to get stored user info
    const storedData = await AsyncStorage.getItem(`apple_user_${credential.user}`);
    const userData = storedData ? JSON.parse(storedData) : {};

    const fullName = credential.fullName
      ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
      : userData.fullName
        ? `${userData.fullName.givenName || ''} ${userData.fullName.familyName || ''}`.trim()
        : 'Apple User';

    return {
      id: credential.user,
      email: credential.email || userData.email || `${credential.user}@privaterelay.appleid.com`,
      name: fullName || 'Apple User',
      provider: 'apple',
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple Sign-In was cancelled');
    }
    throw error;
  }
}

// =============================================================================
// FACEBOOK AUTHENTICATION
// =============================================================================

/**
 * Hook for Facebook Sign-In
 * Must be used within a React component
 */
export function useFacebookAuth() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: OAuthConfig.facebook.appId,
    scopes: OAuthConfig.facebook.scopes,
  });

  return {
    request,
    response,
    promptAsync,
    isReady: !!request,
  };
}

/**
 * Exchange Facebook auth token for user info
 */
export async function handleFacebookSignIn(
  accessToken: string
): Promise<OAuthUserInfo> {
  // Fetch user info from Facebook
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Facebook user info');
  }

  const data = await response.json();

  return {
    id: data.id,
    email: data.email || `${data.id}@facebook.com`,
    name: data.name,
    picture: data.picture?.data?.url,
    provider: 'facebook',
  };
}

// =============================================================================
// BACKEND INTEGRATION
// =============================================================================

/**
 * Send OAuth user info to backend for authentication/registration
 * The backend should:
 * 1. Check if user exists by provider ID or email
 * 2. Create new user if not exists
 * 3. Return JWT token and user data
 */
export async function authenticateWithBackend(
  userInfo: OAuthUserInfo,
  idToken?: string
): Promise<AuthResponse> {
  const endpoint = OAuthConfig.api[`${userInfo.provider}Auth` as keyof typeof OAuthConfig.api];

  try {
    const response = await apiClient.post<AuthResponse>(endpoint, {
      provider_id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      id_token: idToken,
    });

    // Store auth data
    await AsyncStorage.setItem('auth_token', response.data.access_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));

    return response.data;
  } catch (error: any) {
    // If backend is not available, create local session for demo
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.warn('Backend not available, creating local session');
      return createLocalOAuthSession(userInfo);
    }
    throw error;
  }
}

/**
 * Create a local session when backend is unavailable (demo mode)
 */
async function createLocalOAuthSession(userInfo: OAuthUserInfo): Promise<AuthResponse> {
  const demoResponse: AuthResponse = {
    access_token: `oauth_${userInfo.provider}_${Date.now()}`,
    user: {
      id: parseInt(userInfo.id.substring(0, 8), 16) || Date.now(),
      email: userInfo.email,
      username: userInfo.name,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  await AsyncStorage.setItem('auth_token', demoResponse.access_token);
  await AsyncStorage.setItem('user_data', JSON.stringify(demoResponse.user));
  await AsyncStorage.setItem('oauth_provider', userInfo.provider);

  return demoResponse;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the current OAuth provider if user signed in with OAuth
 */
export async function getOAuthProvider(): Promise<OAuthProvider | null> {
  const provider = await AsyncStorage.getItem('oauth_provider');
  return provider as OAuthProvider | null;
}

/**
 * Clear OAuth session data
 */
export async function clearOAuthSession(): Promise<void> {
  await AsyncStorage.removeItem('oauth_provider');
}

export default {
  useGoogleAuth,
  handleGoogleSignIn,
  isAppleSignInAvailable,
  signInWithApple,
  useFacebookAuth,
  handleFacebookSignIn,
  authenticateWithBackend,
  getOAuthProvider,
  clearOAuthSession,
};
