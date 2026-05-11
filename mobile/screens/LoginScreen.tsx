/**
 * LoginScreen
 *
 * Clean, minimal wellness-tech aesthetic with neon-dark theme.
 * Uses design tokens from ../design/tokens for consistent styling.
 * Web-friendly: centered, max-width 420px container.
 * Forgot password uses inline expandable section instead of a Modal.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  useGoogleAuth,
  useFacebookAuth,
  handleGoogleSignIn,
  handleFacebookSignIn,
  signInWithApple,
  isAppleSignInAvailable,
} from '../services/oauthService';
import * as AuthSession from 'expo-auth-session';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../design/tokens';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginWithOAuth } = useAuth();

  // OAuth hooks
  const googleAuth = useGoogleAuth();
  const facebookAuth = useFacebookAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Check Apple Sign-In availability
  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Forgot password inline section state
  const [showForgotSection, setShowForgotSection] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const forgotSectionHeight = useRef(new Animated.Value(0)).current;
  const forgotSectionOpacity = useRef(new Animated.Value(0)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Refs
  const passwordRef = useRef<TextInput>(null);
  const forgotEmailRef = useRef<TextInput>(null);

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Toggle forgot password section with animation
  const toggleForgotSection = () => {
    if (showForgotSection) {
      Animated.parallel([
        Animated.timing(forgotSectionHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(forgotSectionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowForgotSection(false);
        setForgotSuccess(false);
        setForgotEmail('');
      });
    } else {
      setShowForgotSection(true);
      Animated.parallel([
        Animated.timing(forgotSectionHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(forgotSectionOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        forgotEmailRef.current?.focus();
      });
    }
  };

  // Helper to validate email format
  const isValidEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  // Helper to parse API error response into user-friendly message
  const parseApiError = (err: any): string => {
    const responseData = err?.response?.data;

    if (responseData?.detail) {
      if (Array.isArray(responseData.detail)) {
        const errorMessages = responseData.detail.map((e: any) => {
          const field = e.loc?.[e.loc.length - 1] || 'field';
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');

          if (e.type === 'value_error' || e.type === 'value_error.email') {
            if (field === 'email') return 'Please enter a valid email address';
            return `Invalid ${fieldName.toLowerCase()}`;
          }
          if (e.type === 'string_too_short') {
            return `${fieldName} is too short`;
          }
          if (e.type === 'missing') {
            return `${fieldName} is required`;
          }

          return e.msg || `Invalid ${fieldName.toLowerCase()}`;
        });
        return errorMessages[0];
      }

      if (typeof responseData.detail === 'string') {
        return responseData.detail;
      }
    }

    if (err?.response?.status === 401) {
      return 'Invalid email or password';
    }

    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    return err.message || 'Login failed. Please try again.';
  };

  // Handle login
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await login({ email, password });
      router.replace('/');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = (role: 'user' | 'coach' = 'user') => {
    if (role === 'coach') {
      setEmail('coach@test.com');
      setPassword('password123');
    } else {
      setEmail('user@test.com');
      setPassword('password123');
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      if (Platform.OS === 'web') {
        // On web, just show inline error state — alert is disruptive
        Alert.alert('Error', 'Please enter your email address');
      } else {
        Alert.alert('Error', 'Please enter your email address');
      }
      return;
    }

    if (!isValidEmail(forgotEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setForgotLoading(false);
    setForgotSuccess(true);

    // Auto collapse after 2.5 seconds
    setTimeout(() => {
      toggleForgotSection();
    }, 2500);
  };

  // Handle Google Sign-In response
  useEffect(() => {
    if (googleAuth.response?.type === 'success') {
      const { authentication } = googleAuth.response;
      if (authentication?.accessToken) {
        handleGoogleAuth(authentication.accessToken);
      }
    }
  }, [googleAuth.response]);

  // Handle Facebook Sign-In response
  useEffect(() => {
    if (facebookAuth.response?.type === 'success') {
      const { authentication } = facebookAuth.response;
      if (authentication?.accessToken) {
        handleFacebookAuth(authentication.accessToken);
      }
    }
  }, [facebookAuth.response]);

  // Google authentication handler
  const handleGoogleAuth = async (accessToken: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const userInfo = await handleGoogleSignIn(accessToken);
      await loginWithOAuth(userInfo);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook authentication handler
  const handleFacebookAuth = async (accessToken: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const userInfo = await handleFacebookSignIn(accessToken);
      await loginWithOAuth(userInfo);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Facebook sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={gradients.background}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
      />

      {/* Subtle ambient glow — top right */}
      <View style={styles.ambientGlowTopRight} />
      {/* Subtle ambient glow — bottom left */}
      <View style={styles.ambientGlowBottomLeft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing['3xl'],
              paddingBottom: insets.bottom + spacing['3xl'],
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Centered, max-width container for web */}
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.innerContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >

              {/* ── LOGO SECTION ─────────────────────────────────────────── */}
              <Animated.View
                style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}
              >
                <View style={styles.logoIconRing}>
                  <View style={styles.logoIconInner}>
                    <Ionicons name="fitness" size={30} color={colors.primary} />
                  </View>
                </View>
                <Text style={styles.logoText}>HyperFit</Text>
                <Text style={styles.tagline}>Elevate Your Performance</Text>
              </Animated.View>

              {/* ── CARD ─────────────────────────────────────────────────── */}
              <View style={styles.card}>

                {/* Card header */}
                <Text style={styles.cardTitle}>Welcome back</Text>
                <Text style={styles.cardSubtitle}>Sign in to continue your journey</Text>

                {/* Error banner */}
                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                    <Text style={styles.errorBannerText}>{error}</Text>
                  </View>
                )}

                {/* Email input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedInput === 'email' && styles.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={focusedInput === 'email' ? colors.primary : colors.textMuted}
                      style={styles.inputLeadIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        if (error) setError(null);
                      }}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </View>
                </View>

                {/* Password input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedInput === 'password' && styles.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={focusedInput === 'password' ? colors.primary : colors.textMuted}
                      style={styles.inputLeadIcon}
                    />
                    <TextInput
                      ref={passwordRef}
                      style={styles.textInput}
                      placeholder="••••••••"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        if (error) setError(null);
                      }}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(v => !v)}
                      style={styles.eyeToggle}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot password trigger */}
                <TouchableOpacity
                  style={styles.forgotTrigger}
                  onPress={toggleForgotSection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotTriggerText}>
                    {showForgotSection ? 'Cancel' : 'Forgot password?'}
                  </Text>
                  <Ionicons
                    name={showForgotSection ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.primary}
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>

                {/* Inline forgot password section */}
                {showForgotSection && (
                  <Animated.View
                    style={[
                      styles.forgotSection,
                      { opacity: forgotSectionOpacity },
                    ]}
                  >
                    {forgotSuccess ? (
                      <View style={styles.forgotSuccessRow}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Text style={styles.forgotSuccessText}>
                          Reset link sent! Check your inbox.
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.forgotHint}>
                          Enter your email and we'll send you a reset link.
                        </Text>
                        <View
                          style={[
                            styles.inputRow,
                            focusedInput === 'forgot' && styles.inputRowFocused,
                            { marginBottom: spacing.md },
                          ]}
                        >
                          <Ionicons
                            name="mail-outline"
                            size={18}
                            color={focusedInput === 'forgot' ? colors.primary : colors.textMuted}
                            style={styles.inputLeadIcon}
                          />
                          <TextInput
                            ref={forgotEmailRef}
                            style={styles.textInput}
                            placeholder="your@email.com"
                            placeholderTextColor={colors.inputPlaceholder}
                            value={forgotEmail}
                            onChangeText={setForgotEmail}
                            onFocus={() => setFocusedInput('forgot')}
                            onBlur={() => setFocusedInput(null)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="send"
                            onSubmitEditing={handleForgotPassword}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.forgotSendButton}
                          onPress={handleForgotPassword}
                          disabled={forgotLoading}
                          activeOpacity={0.85}
                        >
                          {forgotLoading ? (
                            <ActivityIndicator size="small" color={colors.gradientStart} />
                          ) : (
                            <Text style={styles.forgotSendButtonText}>Send Reset Link</Text>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </Animated.View>
                )}

                {/* Primary sign-in button */}
                <Animated.View style={[{ transform: [{ scale: buttonScale }] }, styles.loginButtonWrap]}>
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.88}
                    style={styles.loginButtonOuter}
                  >
                    <LinearGradient
                      colors={gradients.buttonPrimary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={colors.gradientStart} size="small" />
                      ) : (
                        <>
                          <Text style={styles.loginButtonText}>Sign In</Text>
                          <Ionicons name="arrow-forward" size={18} color={colors.gradientStart} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Demo account buttons */}
                <View style={styles.demoRow}>
                  <TouchableOpacity
                    style={[styles.demoChip, styles.demoChipUser]}
                    onPress={() => handleDemoLogin('user')}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="person-outline" size={14} color={colors.secondary} />
                    <Text style={[styles.demoChipText, { color: colors.secondary }]}>
                      Demo User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.demoChip, styles.demoChipCoach]}
                    onPress={() => handleDemoLogin('coach')}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="people-outline" size={14} color={colors.primary} />
                    <Text style={[styles.demoChipText, { color: colors.primary }]}>
                      Demo Coach
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social login */}
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
              </View>

              {/* ── REGISTER LINK ─────────────────────────────────────────── */}
              <View style={styles.registerRow}>
                <Text style={styles.registerPrompt}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.registerLink}> Sign Up</Text>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const MAX_WIDTH = 420;

const styles = StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  ambientGlowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primaryGlow,
    opacity: 0.18,
  },
  ambientGlowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.secondaryGlow,
    opacity: 0.12,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  // ── Centered container (web-friendly max-width) ───────────────────────────
  container: {
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  innerContent: {
    flex: 1,
  },

  // ── Logo section ──────────────────────────────────────────────────────────
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoIconRing: {
    width: 76,
    height: 76,
    borderRadius: radius['2xl'],
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.primarySubtle,
    ...shadows.primaryGlowSubtle,
  },
  logoIconInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  tagline: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
    ...shadows.cardElevated,
  },
  cardTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },

  // ── Error banner ──────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.error,
    fontWeight: typography.weight.medium,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.textMuted,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  inputRowFocused: {
    borderColor: colors.inputBorderFocus,
    backgroundColor: colors.primarySubtle,
  },
  inputLeadIcon: {
    marginRight: spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeToggle: {
    padding: spacing.xs,
  },

  // ── Forgot password ───────────────────────────────────────────────────────
  forgotTrigger: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  forgotTriggerText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  forgotSection: {
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  forgotHint: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  forgotSendButton: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotSendButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  forgotSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  forgotSuccessText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.success,
    flex: 1,
  },

  // ── Primary login button ──────────────────────────────────────────────────
  loginButtonWrap: {
    marginBottom: spacing.lg,
  },
  loginButtonOuter: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loginButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.gradientStart,
    letterSpacing: typography.letterSpacing.wide,
  },

  // ── Demo chips ────────────────────────────────────────────────────────────
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  demoChipUser: {
    backgroundColor: colors.secondarySubtle,
    borderColor: 'rgba(167, 139, 250, 0.25)',
  },
  demoChipCoach: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryBorder,
  },
  demoChipText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    letterSpacing: typography.letterSpacing.normal,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    letterSpacing: typography.letterSpacing.wide,
  },

  // ── Social row ────────────────────────────────────────────────────────────
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

  // ── Register link ─────────────────────────────────────────────────────────
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  registerPrompt: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
});
