/**
 * RegisterScreen
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
  ScrollView,
  StatusBar,
  ActivityIndicator,
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

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const colors = {
  // Gradient colors
  gradientStart: '#0F0F23',
  gradientMid: '#1A1A3E',
  gradientEnd: '#0D0D1A',

  // Card colors
  cardBg: 'rgba(255, 255, 255, 0.03)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  // Primary accent (electric green for fitness brand)
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  primaryGlow: 'rgba(74, 222, 128, 0.3)',

  // Secondary accent (purple for tech feel)
  secondary: '#A78BFA',
  secondaryDark: '#7C3AED',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  // Input colors
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBorderFocus: '#4ADE80',
  inputPlaceholder: 'rgba(255, 255, 255, 0.4)',

  // States
  error: '#F87171',
  success: '#4ADE80',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, loginWithOAuth } = useAuth();

  // OAuth hooks
  const googleAuth = useGoogleAuth();
  const facebookAuth = useFacebookAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Check Apple Sign-In availability
  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'coach'>('user');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Refs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
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

  // Helper to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper to parse API error response into user-friendly message
  const parseApiError = (err: any): string => {
    // Check for axios error with response data
    const responseData = err?.response?.data;

    if (responseData?.detail) {
      // Handle array of validation errors (Pydantic format)
      if (Array.isArray(responseData.detail)) {
        const errorMessages = responseData.detail.map((e: any) => {
          const field = e.loc?.[e.loc.length - 1] || 'field';
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');

          // Map common error types to friendly messages
          if (e.type === 'value_error' || e.type === 'value_error.email') {
            if (field === 'email') return 'Please enter a valid email address';
            return `Invalid ${fieldName.toLowerCase()}`;
          }
          if (e.type === 'string_too_short') {
            return `${fieldName} is too short`;
          }
          if (e.type === 'string_too_long') {
            return `${fieldName} is too long`;
          }
          if (e.type === 'missing') {
            return `${fieldName} is required`;
          }

          // Use message if available
          return e.msg || `Invalid ${fieldName.toLowerCase()}`;
        });
        return errorMessages[0]; // Return first error
      }

      // Handle string detail
      if (typeof responseData.detail === 'string') {
        return responseData.detail;
      }
    }

    // Handle network errors
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    // Default fallback
    return err.message || 'Registration failed. Please try again.';
  };

  // Handle registration
  const handleRegister = async () => {
    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await register({ username, email, password, role: selectedRole });
      // Route based on role - coaches go to coach onboarding
      if (selectedRole === 'coach') {
        router.replace('/(coach-onboarding)');
      } else {
        router.replace('/(onboarding)');
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
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
      router.replace('/(onboarding)');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
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
      router.replace('/(onboarding)');
    } catch (err) {
      setError(err.message || 'Facebook sign-up failed');
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
      router.replace('/(onboarding)');
    } catch (err) {
      if (err.message !== 'Apple Sign-In was cancelled') {
        setError(err.message || 'Apple sign-up failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social sign up button press
  const handleSocialSignUp = async (provider: 'google' | 'apple' | 'facebook') => {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Background */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <View style={styles.logoIcon}>
                <Ionicons name="fitness" size={36} color={colors.primary} />
              </View>
              <Text style={styles.logoText}>Join HyperFit</Text>
              <Text style={styles.tagline}>Start your fitness transformation</Text>
            </Animated.View>

            {/* Role Selector */}
            <View style={styles.roleSelectorContainer}>
              <Text style={styles.roleSelectorLabel}>I want to join as:</Text>
              <View style={styles.roleButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'user' && styles.roleButtonActive,
                  ]}
                  onPress={() => setSelectedRole('user')}
                >
                  <View style={[
                    styles.roleIconContainer,
                    selectedRole === 'user' && styles.roleIconContainerActive,
                  ]}>
                    <Ionicons
                      name="person"
                      size={24}
                      color={selectedRole === 'user' ? colors.gradientStart : colors.textMuted}
                    />
                  </View>
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === 'user' && styles.roleButtonTextActive,
                  ]}>
                    User
                  </Text>
                  <Text style={styles.roleDescription}>
                    Track workouts & progress
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'coach' && styles.roleButtonActive,
                  ]}
                  onPress={() => setSelectedRole('coach')}
                >
                  <View style={[
                    styles.roleIconContainer,
                    selectedRole === 'coach' && styles.roleIconContainerActive,
                  ]}>
                    <Ionicons
                      name="people"
                      size={24}
                      color={selectedRole === 'coach' ? colors.gradientStart : colors.textMuted}
                    />
                  </View>
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === 'coach' && styles.roleButtonTextActive,
                  ]}>
                    Coach
                  </Text>
                  <Text style={styles.roleDescription}>
                    Manage & train clients
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Card */}
            <View style={styles.card}>
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'username' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedInput === 'username' ? colors.primary : colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedInput === 'email' ? colors.primary : colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={email}
                    onChangeText={setEmail}
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

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedInput === 'password' ? colors.primary : colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'confirmPassword' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={focusedInput === 'confirmPassword' ? colors.primary : colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={14} color={colors.gradientStart} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.gradientStart} size="small" />
                    ) : (
                      <>
                        <Text style={styles.registerButtonText}>Create Account</Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.gradientStart} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Sign Up */}
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp('google')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp('apple')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp('facebook')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-facebook" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primaryGlow,
    opacity: 0.15,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    opacity: 0.08,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Role Selector
  roleSelectorContainer: {
    marginBottom: 20,
  },
  roleSelectorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconContainerActive: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  roleButtonTextActive: {
    color: colors.textPrimary,
  },
  roleDescription: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },

  // Input
  inputContainer: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: colors.inputBorderFocus,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },

  // Register Button
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    color: colors.gradientStart,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.inputBorder,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginHorizontal: 16,
  },

  // Social
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
