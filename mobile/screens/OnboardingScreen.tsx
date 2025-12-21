/**
 * OnboardingScreen - User profile and goal setup after registration
 *
 * Multi-step onboarding flow:
 * 1. Basic info (name, date of birth, gender)
 * 2. Body metrics (height, weight)
 * 3. Fitness level & goals
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  onboardingService,
  type GenderType,
  type FitnessLevelType,
  type GoalType,
} from '../services/onboardingService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const colors = {
  gradientStart: '#0F0F23',
  gradientMid: '#1A1A3E',
  gradientEnd: '#0D0D1A',
  cardBg: 'rgba(255, 255, 255, 0.03)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  primaryGlow: 'rgba(74, 222, 128, 0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBorderFocus: '#4ADE80',
  error: '#F87171',
};

const GENDERS: { value: GenderType; label: string; icon: string }[] = [
  { value: 'male', label: 'Male', icon: 'male' },
  { value: 'female', label: 'Female', icon: 'female' },
  { value: 'other', label: 'Other', icon: 'person' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: 'help-circle' },
];

const FITNESS_LEVELS: { value: FitnessLevelType; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to working out' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years experience' },
  { value: 'advanced', label: 'Advanced', description: '3+ years experience' },
];

const GOAL_TYPES: { value: GoalType; label: string; icon: string }[] = [
  { value: 'weight_loss', label: 'Lose Weight', icon: 'trending-down' },
  { value: 'muscle_gain', label: 'Build Muscle', icon: 'barbell' },
  { value: 'strength_gain', label: 'Get Stronger', icon: 'fitness' },
  { value: 'general_fitness', label: 'General Fitness', icon: 'heart' },
  { value: 'endurance', label: 'Improve Endurance', icon: 'bicycle' },
  { value: 'flexibility', label: 'Flexibility', icon: 'body' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  // Current step (0, 1, 2)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basic info
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<GenderType | null>(null);

  // Step 2: Body metrics
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Step 3: Fitness level & goals
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevelType | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(callback, 150);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    }
  };

  const handleComplete = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Save profile
      await onboardingService.saveProfile({
        full_name: fullName || undefined,
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : undefined,
        gender: gender || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        fitness_level: fitnessLevel || undefined,
      });

      // Save goals
      for (const goalType of selectedGoals) {
        const goalLabel = GOAL_TYPES.find((g) => g.value === goalType)?.label || goalType;
        await onboardingService.addGoal({
          goal_type: goalType,
          title: goalLabel,
        });
      }

      // Refresh user data
      await refreshUser();

      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/dashboard');
  };

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>LET'S GET TO KNOW YOU</Text>
      <Text style={styles.stepSubtitle}>Tell us a bit about yourself</Text>

      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <Text style={[styles.input, !dateOfBirth && styles.placeholderText]}>
            {dateOfBirth ? formatDate(dateOfBirth) : 'Select your birthday'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setDateOfBirth(selectedDate);
          }}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
        />
      )}

      {/* Gender */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.optionsGrid}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.optionCard, gender === g.value && styles.optionCardSelected]}
              onPress={() => setGender(g.value)}
            >
              <Ionicons
                name={g.icon as any}
                size={24}
                color={gender === g.value ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.optionLabel, gender === g.value && styles.optionLabelSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>YOUR BODY METRICS</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

      {/* Height */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Height (cm)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="resize-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your height"
            placeholderTextColor={colors.textMuted}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
          <Text style={styles.unitText}>cm</Text>
        </View>
      </View>

      {/* Weight */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Weight (kg)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="scale-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your weight"
            placeholderTextColor={colors.textMuted}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <Text style={styles.unitText}>kg</Text>
        </View>
      </View>

      <View style={styles.tipContainer}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.tipText}>
          Your metrics help us calculate calories, suggest workouts, and track your progress.
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>YOUR FITNESS JOURNEY</Text>
      <Text style={styles.stepSubtitle}>Select your fitness level and goals</Text>

      {/* Fitness Level */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Fitness Level</Text>
        <View style={styles.fitnessLevelContainer}>
          {FITNESS_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.fitnessCard, fitnessLevel === level.value && styles.fitnessCardSelected]}
              onPress={() => setFitnessLevel(level.value)}
            >
              <Text style={[styles.fitnessLabel, fitnessLevel === level.value && styles.fitnessLabelSelected]}>
                {level.label}
              </Text>
              <Text style={styles.fitnessDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goals */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>What are your goals?</Text>
        <Text style={styles.inputHint}>Select all that apply</Text>
        <View style={styles.goalsGrid}>
          {GOAL_TYPES.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[styles.goalCard, selectedGoals.includes(goal.value) && styles.goalCardSelected]}
              onPress={() => toggleGoal(goal.value)}
            >
              <Ionicons
                name={goal.icon as any}
                size={28}
                color={selectedGoals.includes(goal.value) ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.goalLabel, selectedGoals.includes(goal.value) && styles.goalLabelSelected]}>
                {goal.label}
              </Text>
              {selectedGoals.includes(goal.value) && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.gradientStart} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={styles.gradient}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {currentStep > 0 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}
            <View style={styles.progressContainer}>
              {[0, 1, 2].map((step) => (
                <View
                  key={step}
                  style={[styles.progressDot, step <= currentStep && styles.progressDotActive]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Welcome Message */}
          {currentStep === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="fitness" size={36} color={colors.primary} />
              </View>
              <Text style={styles.welcomeText}>Welcome, {user?.username || 'Athlete'}!</Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Step Content */}
          <Animated.View style={{ opacity: fadeAnim }}>
            {currentStep === 0 && renderStep0()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </Animated.View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleNext}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.gradientStart} size="small" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    {currentStep === 2 ? 'Get Started' : 'Continue'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.gradientStart} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inputBorder,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },

  // Welcome
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
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

  // Step Content
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  // Input
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    height: '100%',
  },
  placeholderText: {
    color: colors.textMuted,
  },
  unitText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 8,
  },

  // Options Grid (Gender)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: (width - 72) / 2,
    padding: 16,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    gap: 8,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: colors.primary,
  },

  // Tip
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Fitness Level
  fitnessLevelContainer: {
    gap: 12,
  },
  fitnessCard: {
    padding: 16,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
  },
  fitnessCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  fitnessLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fitnessLabelSelected: {
    color: colors.primary,
  },
  fitnessDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Goals Grid
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: (width - 72) / 2,
    padding: 16,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Continue Button
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueButtonText: {
    color: colors.gradientStart,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
