/** LoginScreen -- shell layout with extracted LoginForm, OAuthButtons, and animations. */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLoginAnimations } from '../hooks/useLoginAnimations';
import { LoginForm, OAuthButtons, parseApiError } from '../components/auth';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../design/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  // Shared loading / error state (consumed by both LoginForm and OAuthButtons)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const {
    fadeAnim,
    slideAnim,
    logoScale,
    buttonScale,
    forgotSectionOpacity,
    animateButtonPress,
  } = useLoginAnimations();

  // Handle login (called by LoginForm)
  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await login(credentials);
      router.replace('/');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
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

      <View style={styles.ambientGlowTopRight} />
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

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Welcome back</Text>
                <Text style={styles.cardSubtitle}>Sign in to continue your journey</Text>

                <LoginForm
                  onLogin={handleLogin}
                  isLoading={isLoading}
                  error={error}
                  setError={setError}
                  buttonScale={buttonScale}
                  animateButtonPress={animateButtonPress}
                  forgotSectionOpacity={forgotSectionOpacity}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <OAuthButtons
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setError={setError}
                />
              </View>

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

const MAX_WIDTH = 420;

const styles = StyleSheet.create({
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
  container: {
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  innerContent: {
    flex: 1,
  },
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
