/**
 * Coach Onboarding Screen - Profile setup for new coaches
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createCoachProfile } from '../../services/coachService';

const colors = {
  gradientStart: '#0F0F23',
  gradientMid: '#1A1A3E',
  gradientEnd: '#0D0D1A',
  cardBg: 'rgba(255, 255, 255, 0.03)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  primaryGlow: 'rgba(74, 222, 128, 0.3)',
  secondary: '#A78BFA',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBorderFocus: '#4ADE80',
  error: '#F87171',
};

export default function CoachOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form state
  const [specialization, setSpecialization] = useState('');
  const [certifications, setCertifications] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [maxClients, setMaxClients] = useState('10');

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!specialization.trim()) {
      setError('Please enter your specialization');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await createCoachProfile({
        specialization: specialization.trim(),
        certifications: certifications.trim() || undefined,
        years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        bio: bio.trim() || undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        phone_number: phoneNumber.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        max_clients: maxClients ? parseInt(maxClients) : 10,
        is_accepting_clients: true,
      });

      router.replace('/(coach-tabs)/clients');
    } catch (err: any) {
      console.error('Failed to create coach profile:', err);
      setError(err?.response?.data?.detail || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later from settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.replace('/(coach-tabs)/clients'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="people" size={36} color={colors.primary} />
            </View>
            <Text style={styles.title}>Set Up Your Coach Profile</Text>
            <Text style={styles.subtitle}>
              Help clients find you by completing your professional profile
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Specialization */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialization *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'specialization' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Strength Training, Weight Loss, HIIT"
                  placeholderTextColor={colors.textMuted}
                  value={specialization}
                  onChangeText={setSpecialization}
                  onFocus={() => setFocusedInput('specialization')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Certifications */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Certifications</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'certifications' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="e.g., NASM-CPT, ACE, CSCS"
                  placeholderTextColor={colors.textMuted}
                  value={certifications}
                  onChangeText={setCertifications}
                  onFocus={() => setFocusedInput('certifications')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Years of Experience & Hourly Rate */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Years Experience</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'years' && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={yearsOfExperience}
                    onChangeText={setYearsOfExperience}
                    onFocus={() => setFocusedInput('years')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Hourly Rate ($)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'rate' && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    onFocus={() => setFocusedInput('rate')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Max Clients */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Maximum Clients</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'maxClients' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  placeholderTextColor={colors.textMuted}
                  value={maxClients}
                  onChangeText={setMaxClients}
                  onFocus={() => setFocusedInput('maxClients')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <View
                style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                  focusedInput === 'bio' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell clients about yourself, your training philosophy, and experience..."
                  placeholderTextColor={colors.textMuted}
                  value={bio}
                  onChangeText={setBio}
                  onFocus={() => setFocusedInput('bio')}
                  onBlur={() => setFocusedInput(null)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'phone' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.textMuted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Website URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website URL</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'website' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={colors.textMuted}
                  value={websiteUrl}
                  onChangeText={setWebsiteUrl}
                  onFocus={() => setFocusedInput('website')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.gradientStart} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Complete Setup</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.gradientStart} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: colors.inputBorderFocus,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  textAreaWrapper: {
    height: 100,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    height: 76,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    color: colors.gradientStart,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
