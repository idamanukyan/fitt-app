/**
 * AddSleepModal - Production-Ready Sleep Entry Form
 *
 * Features:
 * - Add and edit sleep entries
 * - Time pickers for bedtime and wake time
 * - Auto-duration calculation
 * - Optional quality score slider
 * - Notes field
 * - Matches design system of AddMeasurementForm
 * - Loading states and error handling
 * - Smooth animations
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
import Slider from '@react-native-community/slider';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../design/tokens';
import type { SleepEntry, SleepCreateData } from '../../types/sleep.types';
import {
  calculateSleepDuration,
  formatDuration,
  getSleepStatusInfo,
  createBedtimeISO,
  createWakeTimeISO,
} from '../../utils/sleepCalculations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddSleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: SleepCreateData) => Promise<void>;
  onDelete?: () => Promise<void>;
  existingEntry?: SleepEntry | null;
  selectedDate?: string;
  mode: 'add' | 'edit';
  isSaving?: boolean;
  isDeleting?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export const AddSleepModal: React.FC<AddSleepModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  existingEntry,
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

  // Time picker state
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  // Form state
  const [bedtimeHour, setBedtimeHour] = useState(23);
  const [bedtimeMinute, setBedtimeMinute] = useState(0);
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [showQualitySlider, setShowQualitySlider] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculated duration
  const [duration, setDuration] = useState(8);

  // Calculate duration whenever times change
  useEffect(() => {
    const dateStr = formatDate(selectedDay, selectedMonth, selectedYear);
    const bedtime = createBedtimeISO(dateStr, bedtimeHour, bedtimeMinute);
    const wakeTime = createWakeTimeISO(dateStr, bedtimeHour, wakeHour, wakeMinute);
    const hours = calculateSleepDuration(bedtime, wakeTime);
    setDuration(hours);
  }, [bedtimeHour, bedtimeMinute, wakeHour, wakeMinute, selectedDay, selectedMonth, selectedYear]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && existingEntry) {
        // Populate from existing entry
        const bedtime = new Date(existingEntry.bedtime);
        const wakeTime = new Date(existingEntry.wake_time);
        const entryDate = new Date(existingEntry.date);

        setSelectedDay(entryDate.getDate());
        setSelectedMonth(entryDate.getMonth());
        setSelectedYear(entryDate.getFullYear());
        setBedtimeHour(bedtime.getHours());
        setBedtimeMinute(Math.floor(bedtime.getMinutes() / 15) * 15);
        setWakeHour(wakeTime.getHours());
        setWakeMinute(Math.floor(wakeTime.getMinutes() / 15) * 15);
        setSleepQuality(existingEntry.sleep_quality || null);
        setShowQualitySlider(existingEntry.sleep_quality !== undefined);
        setNotes(existingEntry.notes || '');
      } else if (selectedDate) {
        // New entry for selected date
        const date = new Date(selectedDate);
        setSelectedDay(date.getDate());
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());
        resetTimeDefaults();
      } else {
        // New entry for today (actually yesterday's sleep)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setSelectedDay(yesterday.getDate());
        setSelectedMonth(yesterday.getMonth());
        setSelectedYear(yesterday.getFullYear());
        resetTimeDefaults();
      }
      setErrors({});
    }
  }, [visible, mode, existingEntry, selectedDate]);

  const resetTimeDefaults = () => {
    setBedtimeHour(23);
    setBedtimeMinute(0);
    setWakeHour(7);
    setWakeMinute(0);
    setSleepQuality(null);
    setShowQualitySlider(false);
    setNotes('');
  };

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

  const formatTime = useCallback((hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }, []);

  const formatTime24 = useCallback((hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }, []);

  const isFutureDate = useCallback((day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date > todayStart;
  }, [today]);

  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Check duration is reasonable (0.5 - 16 hours)
    if (duration < 0.5) {
      newErrors.duration = 'Sleep duration seems too short';
    }
    if (duration > 16) {
      newErrors.duration = 'Sleep duration seems too long';
    }

    // Check date is not in future
    if (isFutureDate(selectedDay, selectedMonth, selectedYear)) {
      newErrors.date = 'Cannot log sleep for future dates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [duration, selectedDay, selectedMonth, selectedYear, isFutureDate]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    const dateStr = formatDate(selectedDay, selectedMonth, selectedYear);

    const data: SleepCreateData = {
      date: dateStr,
      bedtime: formatTime24(bedtimeHour, bedtimeMinute),
      wake_time: formatTime24(wakeHour, wakeMinute),
      sleep_quality: sleepQuality ?? undefined,
      notes: notes.trim() || undefined,
    };

    await onSave(data);
  }, [
    validateForm,
    formatDate,
    formatTime24,
    selectedDay,
    selectedMonth,
    selectedYear,
    bedtimeHour,
    bedtimeMinute,
    wakeHour,
    wakeMinute,
    sleepQuality,
    notes,
    onSave,
  ]);

  const handleDelete = useCallback(async () => {
    if (onDelete) {
      await onDelete();
    }
  }, [onDelete]);

  // Get status info for duration display
  const statusInfo = getSleepStatusInfo(duration);

  const renderDatePicker = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const years = Array.from({ length: 3 }, (_, i) => today.getFullYear() - i);

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Month Selector */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSectionLabel}>Month</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerOptionsScroll}
              >
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerOption,
                      selectedMonth === index && styles.pickerOptionSelected,
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
                        styles.pickerOptionText,
                        selectedMonth === index && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {month.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Selector */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSectionLabel}>Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerOptionsScroll}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerOption,
                      selectedYear === year && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        selectedYear === year && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Selector */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSectionLabel}>Day</Text>
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

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowDatePicker(false)}
            >
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTimePicker = (
    visible: boolean,
    onClose: () => void,
    title: string,
    hour: number,
    minute: number,
    onHourChange: (h: number) => void,
    onMinuteChange: (m: number) => void
  ) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Hour Selector */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSectionLabel}>Hour</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerOptionsScroll}
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.timeOption,
                      hour === h && styles.pickerOptionSelected,
                    ]}
                    onPress={() => onHourChange(h)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        hour === h && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {h.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minute Selector */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerSectionLabel}>Minute</Text>
              <View style={styles.minuteGrid}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.minuteOption,
                      minute === m && styles.pickerOptionSelected,
                    ]}
                    onPress={() => onMinuteChange(m)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        minute === m && styles.pickerOptionTextSelected,
                      ]}
                    >
                      :{m.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.timePreview}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.timePreviewText}>
                {formatTime(hour, minute)}
              </Text>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
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
                {mode === 'edit' ? 'Edit Sleep' : 'Log Sleep'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Date Selector */}
              <TouchableOpacity
                style={[styles.selector, mode === 'edit' && styles.selectorDisabled]}
                onPress={() => mode === 'add' && setShowDatePicker(true)}
                disabled={mode === 'edit'}
              >
                <View style={styles.selectorContent}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <View style={styles.selectorTextContainer}>
                    <Text style={styles.selectorLabel}>Night of</Text>
                    <Text style={styles.selectorValue}>
                      {formatDisplayDate(selectedDay, selectedMonth, selectedYear)}
                    </Text>
                  </View>
                </View>
                {mode === 'add' && (
                  <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                )}
              </TouchableOpacity>

              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

              {/* Time Selectors */}
              <View style={styles.timeRow}>
                {/* Bedtime */}
                <TouchableOpacity
                  style={[styles.timeSelector, { flex: 1 }]}
                  onPress={() => setShowBedtimePicker(true)}
                >
                  <View style={styles.timeSelectorIcon}>
                    <Ionicons name="moon-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.timeSelectorContent}>
                    <Text style={styles.timeSelectorLabel}>Bedtime</Text>
                    <Text style={styles.timeSelectorValue}>
                      {formatTime(bedtimeHour, bedtimeMinute)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Arrow */}
                <View style={styles.timeArrow}>
                  <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
                </View>

                {/* Wake Time */}
                <TouchableOpacity
                  style={[styles.timeSelector, { flex: 1 }]}
                  onPress={() => setShowWakeTimePicker(true)}
                >
                  <View style={styles.timeSelectorIcon}>
                    <Ionicons name="sunny-outline" size={20} color={colors.warning} />
                  </View>
                  <View style={styles.timeSelectorContent}>
                    <Text style={styles.timeSelectorLabel}>Wake Time</Text>
                    <Text style={styles.timeSelectorValue}>
                      {formatTime(wakeHour, wakeMinute)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Duration Display */}
              <View style={[styles.durationCard, { borderColor: statusInfo.color }]}>
                <View style={styles.durationHeader}>
                  <Ionicons
                    name={statusInfo.icon as any}
                    size={24}
                    color={statusInfo.color}
                  />
                  <Text style={styles.durationLabel}>Sleep Duration</Text>
                </View>
                <Text style={[styles.durationValue, { color: statusInfo.color }]}>
                  {formatDuration(duration)}
                </Text>
                <Text style={styles.durationStatus}>{statusInfo.label}</Text>
                {errors.duration && (
                  <Text style={styles.durationError}>{errors.duration}</Text>
                )}
              </View>

              {/* Quality Score */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.qualityToggle}
                  onPress={() => {
                    setShowQualitySlider(!showQualitySlider);
                    if (!showQualitySlider && sleepQuality === null) {
                      setSleepQuality(70);
                    }
                  }}
                >
                  <View style={styles.qualityToggleLeft}>
                    <Ionicons name="star-outline" size={20} color={colors.primary} />
                    <Text style={styles.qualityToggleText}>Rate Sleep Quality</Text>
                  </View>
                  <Text style={styles.qualityToggleSubtext}>
                    {showQualitySlider ? 'Hide' : 'Optional'}
                  </Text>
                </TouchableOpacity>

                {showQualitySlider && (
                  <View style={styles.qualitySliderContainer}>
                    <View style={styles.qualityLabels}>
                      <Text style={styles.qualityLabelLeft}>Poor</Text>
                      <Text style={styles.qualityValue}>{sleepQuality}</Text>
                      <Text style={styles.qualityLabelRight}>Great</Text>
                    </View>
                    <Slider
                      style={styles.qualitySlider}
                      minimumValue={1}
                      maximumValue={100}
                      step={1}
                      value={sleepQuality || 70}
                      onValueChange={(value) => setSleepQuality(Math.round(value))}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.glassBorder}
                      thumbTintColor={colors.primary}
                    />
                  </View>
                )}
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How did you sleep? Any factors affecting sleep..."
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
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
          {renderTimePicker(
            showBedtimePicker,
            () => setShowBedtimePicker(false),
            'Select Bedtime',
            bedtimeHour,
            bedtimeMinute,
            setBedtimeHour,
            setBedtimeMinute
          )}
          {renderTimePicker(
            showWakeTimePicker,
            () => setShowWakeTimePicker(false),
            'Select Wake Time',
            wakeHour,
            wakeMinute,
            setWakeHour,
            setWakeMinute
          )}
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
    maxHeight: SCREEN_HEIGHT * 0.85,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },

  // Selectors
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  selectorDisabled: {
    opacity: 0.7,
    borderColor: colors.glassBorder,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectorTextContainer: {
    gap: 2,
  },
  selectorLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  selectorValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },

  // Time Row
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  timeSelectorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSelectorContent: {
    flex: 1,
  },
  timeSelectorLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  timeSelectorValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  timeArrow: {
    paddingHorizontal: spacing.xs,
  },

  // Duration Card
  durationCard: {
    backgroundColor: colors.glass,
    borderWidth: 2,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  durationLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  durationValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
  },
  durationStatus: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  durationError: {
    fontSize: typography.size.sm,
    color: colors.error,
    marginTop: spacing.sm,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },

  // Quality
  qualityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  qualityToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qualityToggleText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  qualityToggleSubtext: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  qualitySliderContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  qualityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  qualityLabelLeft: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  qualityValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  qualityLabelRight: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  qualitySlider: {
    width: '100%',
    height: 40,
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
  errorText: {
    fontSize: typography.size.sm,
    color: colors.error,
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

  // Pickers
  pickerOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  pickerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  pickerSection: {
    marginBottom: spacing.lg,
  },
  pickerSectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pickerOptionsScroll: {
    paddingVertical: spacing.xs,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.glassLight,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  pickerOptionTextSelected: {
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
  timeOption: {
    width: 48,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
  },
  minuteGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  minuteOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
  },
  timePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  timePreviewText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  confirmButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.textInverse,
  },
});

export default AddSleepModal;
