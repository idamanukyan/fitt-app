/**
 * AddMeasurementForm - Production-Ready Form Component
 *
 * Features:
 * - Date picker for selecting measurement date
 * - Full autofill support in edit mode
 * - Controlled inputs with validation
 * - All measurement fields including advanced metrics
 * - Loading states and error handling
 * - Smooth animations
 * - Accessibility support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../design/tokens';
import type { Measurement, MeasurementCreateData } from '../../types/api.types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddMeasurementFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: MeasurementCreateData) => Promise<void>;
  onDelete?: () => Promise<void>;
  existingMeasurement?: Measurement | null;
  selectedDate?: string;
  mode: 'add' | 'edit';
  isSaving?: boolean;
  isDeleting?: boolean;
}

interface InputFieldConfig {
  key: keyof FormData;
  label: string;
  placeholder: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: 'primary' | 'body' | 'advanced';
}

interface FormData {
  weight: string;
  body_fat_percentage: string;
  muscle_mass: string;
  chest: string;
  waist: string;
  hips: string;
  left_arm: string;
  right_arm: string;
  left_thigh: string;
  right_thigh: string;
  left_calf: string;
  right_calf: string;
  neck: string;
  shoulders: string;
  water_percentage: string;
  visceral_fat: string;
  resting_metabolic_rate: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  weight: '',
  body_fat_percentage: '',
  muscle_mass: '',
  chest: '',
  waist: '',
  hips: '',
  left_arm: '',
  right_arm: '',
  left_thigh: '',
  right_thigh: '',
  left_calf: '',
  right_calf: '',
  neck: '',
  shoulders: '',
  water_percentage: '',
  visceral_fat: '',
  resting_metabolic_rate: '',
  notes: '',
};

const INPUT_FIELDS: InputFieldConfig[] = [
  // Primary metrics
  { key: 'weight', label: 'Weight', placeholder: '0.0', unit: 'kg', icon: 'scale-outline', category: 'primary' },
  { key: 'body_fat_percentage', label: 'Body Fat', placeholder: '0.0', unit: '%', icon: 'fitness-outline', category: 'primary' },
  { key: 'muscle_mass', label: 'Muscle Mass', placeholder: '0.0', unit: 'kg', icon: 'barbell-outline', category: 'primary' },
  // Body measurements
  { key: 'chest', label: 'Chest', placeholder: '0.0', unit: 'cm', icon: 'body-outline', category: 'body' },
  { key: 'waist', label: 'Waist', placeholder: '0.0', unit: 'cm', icon: 'ellipse-outline', category: 'body' },
  { key: 'hips', label: 'Hips', placeholder: '0.0', unit: 'cm', icon: 'ellipse-outline', category: 'body' },
  { key: 'shoulders', label: 'Shoulders', placeholder: '0.0', unit: 'cm', icon: 'accessibility-outline', category: 'body' },
  { key: 'neck', label: 'Neck', placeholder: '0.0', unit: 'cm', icon: 'man-outline', category: 'body' },
  { key: 'left_arm', label: 'Left Arm', placeholder: '0.0', unit: 'cm', icon: 'barbell-outline', category: 'body' },
  { key: 'right_arm', label: 'Right Arm', placeholder: '0.0', unit: 'cm', icon: 'barbell-outline', category: 'body' },
  { key: 'left_thigh', label: 'Left Thigh', placeholder: '0.0', unit: 'cm', icon: 'walk-outline', category: 'body' },
  { key: 'right_thigh', label: 'Right Thigh', placeholder: '0.0', unit: 'cm', icon: 'walk-outline', category: 'body' },
  { key: 'left_calf', label: 'Left Calf', placeholder: '0.0', unit: 'cm', icon: 'footsteps-outline', category: 'body' },
  { key: 'right_calf', label: 'Right Calf', placeholder: '0.0', unit: 'cm', icon: 'footsteps-outline', category: 'body' },
  // Advanced metrics
  { key: 'water_percentage', label: 'Water %', placeholder: '0.0', unit: '%', icon: 'water-outline', category: 'advanced' },
  { key: 'visceral_fat', label: 'Visceral Fat', placeholder: '0', unit: 'level', icon: 'analytics-outline', category: 'advanced' },
  { key: 'resting_metabolic_rate', label: 'RMR', placeholder: '0', unit: 'kcal', icon: 'flame-outline', category: 'advanced' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AddMeasurementForm: React.FC<AddMeasurementFormProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  existingMeasurement,
  selectedDate,
  mode,
  isSaving = false,
  isDeleting = false,
}) => {
  const today = new Date();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Form state
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [expandedSections, setExpandedSections] = useState({
    primary: true,
    body: false,
    advanced: false,
  });

  // Convert Measurement to FormData for autofill
  const measurementToFormData = useCallback((m: Measurement): FormData => {
    return {
      weight: m.weight?.toString() || '',
      body_fat_percentage: m.body_fat_percentage?.toString() || '',
      muscle_mass: m.muscle_mass?.toString() || '',
      chest: m.chest?.toString() || '',
      waist: m.waist?.toString() || '',
      hips: m.hips?.toString() || '',
      left_arm: m.left_arm?.toString() || '',
      right_arm: m.right_arm?.toString() || '',
      left_thigh: m.left_thigh?.toString() || '',
      right_thigh: m.right_thigh?.toString() || '',
      left_calf: m.left_calf?.toString() || '',
      right_calf: m.right_calf?.toString() || '',
      neck: m.neck?.toString() || '',
      shoulders: m.shoulders?.toString() || '',
      water_percentage: m.water_percentage?.toString() || '',
      visceral_fat: m.visceral_fat?.toString() || '',
      resting_metabolic_rate: m.resting_metabolic_rate?.toString() || '',
      notes: m.notes || '',
    };
  }, []);

  // Initialize form data when modal opens
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && existingMeasurement) {
        // AUTOFILL: Populate all fields from existing measurement
        setFormData(measurementToFormData(existingMeasurement));
        const date = new Date(existingMeasurement.recorded_at);
        setSelectedDay(date.getDate());
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());

        // Auto-expand sections that have data
        const hasBodyData = existingMeasurement.chest || existingMeasurement.waist ||
          existingMeasurement.hips || existingMeasurement.left_arm || existingMeasurement.right_arm;
        const hasAdvancedData = existingMeasurement.water_percentage ||
          existingMeasurement.visceral_fat || existingMeasurement.resting_metabolic_rate;

        setExpandedSections({
          primary: true,
          body: !!hasBodyData,
          advanced: !!hasAdvancedData,
        });
      } else if (selectedDate) {
        // New measurement for selected date
        const date = new Date(selectedDate);
        setSelectedDay(date.getDate());
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());
        setFormData(EMPTY_FORM);
        setExpandedSections({ primary: true, body: false, advanced: false });
      } else {
        // New measurement for today
        setSelectedDay(today.getDate());
        setSelectedMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
        setFormData(EMPTY_FORM);
        setExpandedSections({ primary: true, body: false, advanced: false });
      }
      setErrors({});
    }
  }, [visible, mode, existingMeasurement, selectedDate, measurementToFormData]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropAnim, slideAnim]);

  const formatDate = useCallback((day: number, month: number, year: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }, []);

  const formatDisplayDate = useCallback((day: number, month: number, year: number) => {
    return `${MONTHS[month]} ${day}, ${year}`;
  }, []);

  const isFutureDate = useCallback((day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date > todayStart;
  }, [today]);

  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const handleInputChange = useCallback((key: keyof FormData, value: string) => {
    if (key === 'notes') {
      setFormData(prev => ({ ...prev, notes: value }));
      return;
    }

    // Allow empty value or valid numbers
    if (value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [key]: value }));
      // Clear error if exists
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    // At least one measurement should be provided
    const hasAnyMeasurement = INPUT_FIELDS.some(
      field => formData[field.key] !== '' && formData[field.key] !== '.'
    );

    if (!hasAnyMeasurement) {
      newErrors.general = 'Please enter at least one measurement';
    }

    // Validate date is not in the future
    if (isFutureDate(selectedDay, selectedMonth, selectedYear)) {
      newErrors.date = 'Cannot add measurements for future dates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedDay, selectedMonth, selectedYear, isFutureDate]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    const data: MeasurementCreateData = {
      recorded_at: `${formatDate(selectedDay, selectedMonth, selectedYear)}T12:00:00.000Z`,
    };

    // Convert form data to API format
    INPUT_FIELDS.forEach(field => {
      const value = formData[field.key];
      if (value && value !== '.' && value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          (data as any)[field.key] = numValue;
        }
      }
    });

    if (formData.notes.trim()) {
      data.notes = formData.notes.trim();
    }

    await onSave(data);
  }, [validateForm, formData, selectedDay, selectedMonth, selectedYear, formatDate, onSave]);

  const handleDelete = useCallback(async () => {
    if (onDelete) {
      await onDelete();
    }
  }, [onDelete]);

  const toggleSection = useCallback((section: 'primary' | 'body' | 'advanced') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const renderDatePicker = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Month Selector */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionLabel}>Month</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateOptionsScroll}
              >
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.dateOption,
                      selectedMonth === index && styles.dateOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedMonth(index);
                      const maxDays = getDaysInMonth(selectedYear, index);
                      if (selectedDay > maxDays) {
                        setSelectedDay(maxDays);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedMonth === index && styles.dateOptionTextSelected,
                      ]}
                    >
                      {month.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Selector */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionLabel}>Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateOptionsScroll}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dateOption,
                      selectedYear === year && styles.dateOptionSelected,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedYear === year && styles.dateOptionTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Selector */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionLabel}>Day</Text>
              <View style={styles.daysGrid}>
                {days.map((day) => {
                  const isFuture = isFutureDate(day, selectedMonth, selectedYear);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayOption,
                        selectedDay === day && styles.dayOptionSelected,
                        isFuture && styles.dayOptionDisabled,
                      ]}
                      onPress={() => !isFuture && setSelectedDay(day)}
                      disabled={isFuture}
                    >
                      <Text
                        style={[
                          styles.dayOptionText,
                          selectedDay === day && styles.dayOptionTextSelected,
                          isFuture && styles.dayOptionTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.dateConfirmButton}
              onPress={() => setShowDatePicker(false)}
            >
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dateConfirmGradient}
              >
                <Text style={styles.dateConfirmText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderInputField = useCallback((config: InputFieldConfig) => {
    const value = formData[config.key];

    return (
      <View key={config.key} style={styles.inputField}>
        <View style={styles.inputLabelRow}>
          <Ionicons name={config.icon} size={16} color={colors.textMuted} />
          <Text style={styles.inputLabel}>{config.label}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => handleInputChange(config.key, text)}
            placeholder={config.placeholder}
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="decimal-pad"
            accessibilityLabel={`${config.label} input`}
          />
          <Text style={styles.inputUnit}>{config.unit}</Text>
        </View>
      </View>
    );
  }, [formData, handleInputChange]);

  const renderSection = useCallback((
    title: string,
    category: 'primary' | 'body' | 'advanced',
    isOptional: boolean = false
  ) => {
    const fields = INPUT_FIELDS.filter(f => f.category === category);
    const isExpanded = expandedSections[category];

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(category)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {isOptional && <Text style={styles.sectionSubtitle}>Optional</Text>}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.inputGrid}>
            {fields.map(renderInputField)}
          </View>
        )}
      </View>
    );
  }, [expandedSections, toggleSection, renderInputField]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
      >
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
          <LinearGradient
            colors={gradients.background as unknown as string[]}
            style={styles.gradient}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'edit' ? 'Edit Measurement' : 'Add Measurement'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Date Selector */}
            <TouchableOpacity
              style={[styles.dateSelector, mode === 'edit' && styles.dateSelectorDisabled]}
              onPress={() => mode === 'add' && setShowDatePicker(true)}
              disabled={mode === 'edit'}
            >
              <View style={styles.dateSelectorContent}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.dateSelectorText}>
                  {formatDisplayDate(selectedDay, selectedMonth, selectedYear)}
                </Text>
              </View>
              {mode === 'add' && (
                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
              )}
            </TouchableOpacity>

            {errors.date && (
              <Text style={styles.errorText}>{errors.date}</Text>
            )}

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Primary Measurements */}
              {renderSection('Primary Measurements', 'primary')}

              {/* Body Measurements */}
              {renderSection('Body Measurements', 'body', true)}

              {/* Advanced Metrics */}
              {renderSection('Advanced Metrics', 'advanced', true)}

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={formData.notes}
                  onChangeText={(text) => handleInputChange('notes', text)}
                  placeholder="Add any notes about this measurement..."
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  accessibilityLabel="Notes input"
                />
              </View>

              {/* Error Message */}
              {errors.general && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.general}</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              {mode === 'edit' && onDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.cancelButton, mode === 'edit' && styles.cancelButtonNarrow]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isSaving}
              >
                <LinearGradient
                  colors={gradients.buttonPrimary as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={colors.textInverse} />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color={colors.textInverse} />
                      <Text style={styles.saveButtonText}>
                        {mode === 'edit' ? 'Update' : 'Save'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {renderDatePicker()}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  backdropTouch: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.glassLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date Selector
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  dateSelectorDisabled: {
    opacity: 0.7,
    borderColor: colors.glassBorder,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateSelectorText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },

  // Input Grid
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  inputField: {
    width: '47%',
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  inputUnit: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  // Notes
  notesInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    minHeight: 80,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: colors.error,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonNarrow: {
    flex: 0.7,
  },
  cancelButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1.5,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },

  // Date Picker Modal
  datePickerOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  datePickerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateSectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  dateOptionsScroll: {
    paddingVertical: spacing.xs,
  },
  dateOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.glassLight,
  },
  dateOptionSelected: {
    backgroundColor: colors.primary,
  },
  dateOptionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  dateOptionTextSelected: {
    color: colors.textInverse,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dayOption: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOptionSelected: {
    backgroundColor: colors.primary,
  },
  dayOptionDisabled: {
    opacity: 0.3,
  },
  dayOptionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  dayOptionTextSelected: {
    color: colors.textInverse,
  },
  dayOptionTextDisabled: {
    color: colors.textDisabled,
  },
  dateConfirmButton: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  dateConfirmGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateConfirmText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
});

export default AddMeasurementForm;
