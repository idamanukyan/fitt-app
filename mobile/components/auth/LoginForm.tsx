/**
 * LoginForm
 *
 * Email/password form with validation, forgot-password inline section,
 * primary sign-in button, and demo-account chips.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Validate email format */
const isValidEmail = (emailStr: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
};

/** Parse API error response into user-friendly message */
export const parseApiError = (err: any): string => {
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

// ── Props ────────────────────────────────────────────────────────────────────

export interface LoginFormProps {
  /** Called with {email, password} to perform login */
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  /** Animated button scale from useLoginAnimations */
  buttonScale: Animated.Value;
  /** Fires the button press bounce */
  animateButtonPress: () => void;
  /** Forgot-password animation values */
  forgotSectionOpacity: Animated.Value;
}

// ── Component ────────────────────────────────────────────────────────────────

export function LoginForm({
  onLogin,
  isLoading,
  error,
  setError,
  buttonScale,
  animateButtonPress,
  forgotSectionOpacity,
}: LoginFormProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Forgot password state
  const [showForgotSection, setShowForgotSection] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Refs
  const passwordRef = useRef<TextInput>(null);
  const forgotEmailRef = useRef<TextInput>(null);

  // Toggle forgot password section with animation
  const toggleForgotSection = () => {
    if (showForgotSection) {
      Animated.timing(forgotSectionOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setShowForgotSection(false);
        setForgotSuccess(false);
        setForgotEmail('');
      });
    } else {
      setShowForgotSection(true);
      Animated.timing(forgotSectionOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        forgotEmailRef.current?.focus();
      });
    }
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
    animateButtonPress();
    await onLogin({ email, password });
  };

  // Demo login
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
      Alert.alert('Error', 'Please enter your email address');
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

  return (
    <>
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
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Error banner
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

  // Inputs
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

  // Forgot password
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

  // Primary login button
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

  // Demo chips
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
});
