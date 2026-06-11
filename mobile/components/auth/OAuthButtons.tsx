/**
 * OAuthButtons
 *
 * Social sign-in buttons (Google, Apple, Facebook) with divider.
 * Handles OAuth prompt triggering and delegates token exchange to parent.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import {
  useGoogleAuth,
  useFacebookAuth,
  handleGoogleSignIn,
  handleFacebookSignIn,
  signInWithApple,
  isAppleSignInAvailable,
} from '../../services/oauthService';
import {
  colors,
  spacing,
  radius,
} from '../../design/tokens';

export interface OAuthButtonsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function OAuthButtons({ isLoading, setIsLoading, setError }: OAuthButtonsProps) {
  const router = useRouter();
  const { loginWithOAuth } = useAuth();

  // OAuth hooks
  const googleAuth = useGoogleAuth();
  const facebookAuth = useFacebookAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Check Apple Sign-In availability
  useEffect(() => {
    let isMounted = true;
    isAppleSignInAvailable().then((available) => {
      if (isMounted) setAppleAvailable(available);
    });
    return () => { isMounted = false; };
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    let isMounted = true;
    if (googleAuth.response?.type === 'success') {
      const { authentication } = googleAuth.response;
      if (authentication?.accessToken) {
        const doAuth = async () => {
          setError(null);
          setIsLoading(true);
          try {
            const userInfo = await handleGoogleSignIn(authentication.accessToken);
            if (isMounted) {
              await loginWithOAuth(userInfo);
              router.replace('/');
            }
          } catch (err: any) {
            if (isMounted) setError(err.message || 'Google sign-in failed');
          } finally {
            if (isMounted) setIsLoading(false);
          }
        };
        doAuth();
      }
    }
    return () => { isMounted = false; };
  }, [googleAuth.response]);

  // Handle Facebook Sign-In response
  useEffect(() => {
    let isMounted = true;
    if (facebookAuth.response?.type === 'success') {
      const { authentication } = facebookAuth.response;
      if (authentication?.accessToken) {
        const doAuth = async () => {
          setError(null);
          setIsLoading(true);
          try {
            const userInfo = await handleFacebookSignIn(authentication.accessToken);
            if (isMounted) {
              await loginWithOAuth(userInfo);
              router.replace('/');
            }
          } catch (err: any) {
            if (isMounted) setError(err.message || 'Facebook sign-in failed');
          } finally {
            if (isMounted) setIsLoading(false);
          }
        };
        doAuth();
      }
    }
    return () => { isMounted = false; };
  }, [facebookAuth.response]);

  // Apple authentication handler
  const handleAppleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const userInfo = await signInWithApple();
      await loginWithOAuth(userInfo);
      router.replace('/');
    } catch (err: any) {
      if (err.message !== 'Apple Sign-In was cancelled') {
        setError(err.message || 'Apple sign-in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login button press
  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setError(null);

    switch (provider) {
      case 'google':
        if (googleAuth.isReady) {
          await googleAuth.promptAsync();
        } else {
          setError('Google Sign-In is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env');
        }
        break;

      case 'apple':
        if (appleAvailable) {
          await handleAppleAuth();
        } else {
          setError('Apple Sign-In is only available on iOS 13+');
        }
        break;

      case 'facebook':
        if (facebookAuth.isReady) {
          await facebookAuth.promptAsync();
        } else {
          setError('Facebook Sign-In is not configured. Add EXPO_PUBLIC_FACEBOOK_APP_ID to .env');
        }
        break;
    }
  };

  return (
    <View style={styles.socialRow}>
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => handleSocialLogin('google')}
        disabled={isLoading}
        activeOpacity={0.75}
      >
        <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => handleSocialLogin('apple')}
        disabled={isLoading}
        activeOpacity={0.75}
      >
        <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => handleSocialLogin('facebook')}
        disabled={isLoading}
        activeOpacity={0.75}
      >
        <Ionicons name="logo-facebook" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
