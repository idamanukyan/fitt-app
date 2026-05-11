/**
 * RegisterScreen
 * Redesigned with design tokens — clean, minimal wellness-tech aesthetic.
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
import { colors, gradients, typography, spacing, radius, shadows } from '../design/tokens';

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
  const slideAnim = useRef(new Animated.Value(24)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
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
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
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

  // Validate email format
  const isValidEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Parse API error response into user-friendly message
  const parseApiError = (err: any): string => {
    const responseData = err?.response?.data;

    if (responseData?.detail) {
      if (Array.isArray(responseData.detail)) {
        const messages = responseData.detail.map((e: any) => {
          const field = e.loc?.[e.loc.length - 1] || 'field';
          const fieldName =
            field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
          if (e.type === 'value_error' || e.type === 'value_error.email') {
            if (field === 'email') return 'Please enter a valid email address';
            return `Invalid ${fieldName.toLowerCase()}`;
          }
          if (e.type === 'string_too_short') return `${fieldName} is too short`;
          if (e.type === 'string_too_long') return `${fieldName} is too long`;
          if (e.type === 'missing') return `${fieldName} is required`;
          return e.msg || `Invalid ${fieldName.toLowerCase()}`;
        });
        return messages[0];
      }
      if (typeof responseData.detail === 'string') {
        return responseData.detail;
      }
    }

    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    return err.message || 'Registration failed. Please try again.';
  };

  // Handle registration
  const handleRegister = async () => {
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setError(null);
    setIsLoading(true);

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    try {
      await register({ username, email, password, role: selectedRole });
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

  const handleGoogleAuth = async (accessToken: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const userInfo = await handleGoogleSignIn(accessToken);
      await loginWithOAuth(userInfo);
      router.replace('/(onboarding)');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async (accessToken: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const userInfo = await handleFacebookSignIn(accessToken);
      await loginWithOAuth(userInfo);
      router.replace('/(onboarding)');
    } catch (err: any) {
      setError(err.message || 'Facebook sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const userInfo = await signInWithApple();
      await loginWithOAuth(userInfo);
      router.replace('/(onboarding)');
    } catch (err: any) {
      if (err.message !== 'Apple Sign-In was cancelled') {
        setError(err.message || 'Apple sign-up failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={gradients.background}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Soft ambient glow blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing['3xl'],
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.inner,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* ── Back button ─────────────────────────────────────────────── */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <Animated.View
              style={[styles.header, { transform: [{ scale: logoScale }] }]}
            >
              <View style={styles.logoMark}>
                <Ionicons name="fitness" size={28} color={colors.primary} />
              </View>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Start your fitness transformation today
              </Text>
            </Animated.View>

            {/* ── Role toggle pills ────────────────────────────────────────── */}
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Joining as</Text>
              <View style={styles.rolePillTrack}>
                {/* Sliding indicator */}
                <View
                  style={[
                    styles.rolePillIndicator,
                    selectedRole === 'coach' && styles.rolePillIndicatorRight,
                  ]}
                />
                <TouchableOpacity
                  style={styles.rolePill}
                  onPress={() => setSelectedRole('user')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color={
                      selectedRole === 'user' ? colors.textInverse : colors.textMuted
                    }
                    style={styles.rolePillIcon}
                  />
                  <Text
                    style={[
                      styles.rolePillText,
                      selectedRole === 'user' && styles.rolePillTextActive,
                    ]}
                  >
                    Member
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rolePill}
                  onPress={() => setSelectedRole('coach')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="people-outline"
                    size={14}
                    color={
                      selectedRole === 'coach' ? colors.textInverse : colors.textMuted
                    }
                    style={styles.rolePillIcon}
                  />
                  <Text
                    style={[
                      styles.rolePillText,
                      selectedRole === 'coach' && styles.rolePillTextActive,
                    ]}
                  >
                    Coach
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.roleHint}>
                {selectedRole === 'coach'
                  ? 'You will manage programmes and train clients'
                  : 'Track workouts, log progress and hit your goals'}
              </Text>
            </View>

            {/* ── Form card ───────────────────────────────────────────────── */}
            <View style={styles.card}>
              {/* Error banner */}
              {error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              )}

              {/* Username */}
              <InputField
                icon="person-outline"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
                focused={focusedInput === 'username'}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              {/* Email */}
              <InputField
                ref={emailRef}
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                focused={focusedInput === 'email'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              {/* Password */}
              <InputField
                ref={passwordRef}
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                focused={focusedInput === 'password'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {/* Confirm password */}
              <InputField
                ref={confirmPasswordRef}
                icon="shield-checkmark-outline"
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                focused={focusedInput === 'confirmPassword'}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                last
              />

              {/* Terms checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxActive]}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Submit button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={gradients.buttonPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.textInverse} size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Create Account</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color={colors.textInverse}
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social buttons */}
              <View style={styles.socialRow}>
                <SocialButton
                  icon="logo-google"
                  onPress={() => handleSocialSignUp('google')}
                  disabled={isLoading}
                />
                <SocialButton
                  icon="logo-apple"
                  onPress={() => handleSocialSignUp('apple')}
                  disabled={isLoading}
                />
                <SocialButton
                  icon="logo-facebook"
                  onPress={() => handleSocialSignUp('facebook')}
                  disabled={isLoading}
                />
              </View>
            </View>

            {/* ── Login link ───────────────────────────────────────────────── */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.loginLink}> Sign in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Shared input field
interface InputFieldProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  focused: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIconPress?: () => void;
  last?: boolean;
}

const InputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      icon,
      placeholder,
      value,
      onChangeText,
      onFocus,
      onBlur,
      focused,
      secureTextEntry,
      autoCapitalize = 'sentences',
      autoCorrect = true,
      keyboardType = 'default',
      returnKeyType,
      onSubmitEditing,
      rightIcon,
      onRightIconPress,
      last = false,
    },
    ref
  ) => (
    <View style={[styles.inputContainer, last && styles.inputContainerLast]}>
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? colors.primary : colors.textMuted}
          style={styles.inputLeadIcon}
        />
        <TextInput
          ref={ref}
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputTrailIcon}>
            <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
);

// Social icon button
interface SocialButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
}

function SocialButton({ icon, onPress, disabled }: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={styles.socialBtn}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={20} color={colors.textPrimary} />
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const CONTAINER_MAX_WIDTH = 420;

const styles = StyleSheet.create({
  // Layout shells
  root: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: CONTAINER_MAX_WIDTH,
    paddingHorizontal: spacing.xl,
  },

  // Ambient blobs
  blobTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primaryGlow,
    opacity: 0.12,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    opacity: 0.07,
  },

  // Back button
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.primaryGlowSubtle,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Role toggle
  roleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  roleLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.textMuted,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  rolePillTrack: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.full,
    padding: 3,
    position: 'relative',
  },
  rolePillIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: '50%',
    bottom: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    // Override: keep indicator sized to half the track
    // This is handled by aligning pills to 50% each
  },
  rolePillIndicatorRight: {
    left: '50%',
    // Adjust for the 3px offset (indicator starts at left:3 initially)
    // Using percentage works fine since both pills are equal width
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    minWidth: 110,
    justifyContent: 'center',
    zIndex: 1,
  },
  rolePillIcon: {
    marginRight: spacing.xs,
  },
  rolePillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textMuted,
  },
  rolePillTextActive: {
    color: colors.textInverse,
  },
  roleHint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },

  // Form card
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing['2xl'],
    ...shadows.card,
    marginBottom: spacing.xl,
  },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.error,
    lineHeight: 18,
  },

  // Input fields
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputContainerLast: {
    marginBottom: spacing.lg,
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
  inputText: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    height: '100%',
  },
  inputTrailIcon: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },

  // Submit button
  submitButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.button,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  submitText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Social buttons
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
});
