/**
 * SleepGoalModal - Sleep Goal Settings Modal
 *
 * Features:
 * - Set target sleep duration
 * - Set target bedtime/wake time
 * - Configure minimum acceptable hours
 * - Toggle bedtime reminders
 * - Animated bottom sheet
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {
  colors,
  typography,
  spacing,
  radius,
} from '../../design/tokens';
import type { SleepGoal } from '../../types/sleep.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Partial<SleepGoal>) => void;
  currentGoal: SleepGoal;
}

export const SleepGoalModal: React.FC<SleepGoalModalProps> = ({
  visible,
  onClose,
  onSave,
  currentGoal,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [targetHours, setTargetHours] = useState(currentGoal.target_hours);
  const [minHours, setMinHours] = useState(currentGoal.min_acceptable_hours);
  const [targetBedtime, setTargetBedtime] = useState(currentGoal.target_bedtime);
  const [targetWakeTime, setTargetWakeTime] = useState(currentGoal.target_wake_time);
  const [notificationsEnabled, setNotificationsEnabled] = useState(currentGoal.notifications_enabled);
  const [reminderMinutes, setReminderMinutes] = useState(currentGoal.bedtime_reminder_minutes);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTargetHours(currentGoal.target_hours);
      setMinHours(currentGoal.min_acceptable_hours);
      setTargetBedtime(currentGoal.target_bedtime);
      setTargetWakeTime(currentGoal.target_wake_time);
      setNotificationsEnabled(currentGoal.notifications_enabled);
      setReminderMinutes(currentGoal.bedtime_reminder_minutes);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(400);
      fadeAnim.setValue(0);
    }
  }, [visible, currentGoal, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleSave = () => {
    onSave({
      target_hours: targetHours,
      min_acceptable_hours: minHours,
      target_bedtime: targetBedtime,
      target_wake_time: targetWakeTime,
      notifications_enabled: notificationsEnabled,
      bedtime_reminder_minutes: reminderMinutes,
    });
    handleClose();
  };

  // Format hours for display
  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Parse time string to hour/minute
  const parseTime = (time: string): { hour: number; minute: number } => {
    const [h, m] = time.split(':').map(Number);
    return { hour: h || 0, minute: m || 0 };
  };

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    const { hour, minute } = parseTime(time);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  // Time adjustment
  const adjustTime = (time: string, direction: 'up' | 'down', field: 'hour' | 'minute'): string => {
    let { hour, minute } = parseTime(time);

    if (field === 'hour') {
      hour = direction === 'up' ? (hour + 1) % 24 : (hour - 1 + 24) % 24;
    } else {
      const step = 15;
      minute = direction === 'up'
        ? (minute + step) % 60
        : (minute - step + 60) % 60;
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={handleClose} />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Sleep Goal Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Target Hours */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Target Sleep Duration</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                How many hours of sleep do you want each night?
              </Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{formatHours(targetHours)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={10}
                  step={0.5}
                  value={targetHours}
                  onValueChange={setTargetHours}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.glassLight}
                  thumbTintColor={colors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>5h</Text>
                  <Text style={styles.sliderLabel}>10h</Text>
                </View>
              </View>
            </View>

            {/* Minimum Acceptable */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Minimum Acceptable</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                What's the minimum sleep you need to function well?
              </Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{formatHours(minHours)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={4}
                  maximumValue={targetHours - 0.5}
                  step={0.5}
                  value={minHours}
                  onValueChange={setMinHours}
                  minimumTrackTintColor={colors.warning}
                  maximumTrackTintColor={colors.glassLight}
                  thumbTintColor={colors.warning}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>4h</Text>
                  <Text style={styles.sliderLabel}>{formatHours(targetHours - 0.5)}</Text>
                </View>
              </View>
            </View>

            {/* Target Bedtime */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="moon" size={20} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Target Bedtime</Text>
              </View>
              <View style={styles.timePickerRow}>
                <View style={styles.timePicker}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setTargetBedtime(adjustTime(targetBedtime, 'up', 'hour'))}
                  >
                    <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{formatTimeDisplay(targetBedtime)}</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setTargetBedtime(adjustTime(targetBedtime, 'down', 'hour'))}
                  >
                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Target Wake Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sunny" size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Target Wake Time</Text>
              </View>
              <View style={styles.timePickerRow}>
                <View style={styles.timePicker}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setTargetWakeTime(adjustTime(targetWakeTime, 'up', 'hour'))}
                  >
                    <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{formatTimeDisplay(targetWakeTime)}</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setTargetWakeTime(adjustTime(targetWakeTime, 'down', 'hour'))}
                  >
                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notifications Toggle */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="notifications" size={20} color={colors.accent.blue} />
                  <View>
                    <Text style={styles.sectionTitle}>Bedtime Reminder</Text>
                    <Text style={styles.toggleSubtitle}>
                      Get notified {reminderMinutes} min before bedtime
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.toggle,
                  notificationsEnabled && styles.toggleActive,
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    notificationsEnabled && styles.toggleThumbActive,
                  ]} />
                </View>
              </TouchableOpacity>

              {notificationsEnabled && (
                <View style={styles.reminderOptions}>
                  {[15, 30, 45, 60].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      style={[
                        styles.reminderOption,
                        reminderMinutes === mins && styles.reminderOptionActive,
                      ]}
                      onPress={() => setReminderMinutes(mins)}
                    >
                      <Text style={[
                        styles.reminderOptionText,
                        reminderMinutes === mins && styles.reminderOptionTextActive,
                      ]}>
                        {mins} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={colors.textMuted} />
              <Text style={styles.infoText}>
                Adults typically need 7-9 hours of sleep. Consistent sleep times help regulate your circadian rhythm.
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  sliderContainer: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sliderValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timePicker: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    minWidth: 140,
  },
  timeButton: {
    padding: spacing.sm,
  },
  timeDisplay: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  toggleSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glassLight,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textInverse,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  reminderOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
  },
  reminderOptionActive: {
    backgroundColor: colors.primary,
  },
  reminderOptionText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  reminderOptionTextActive: {
    color: colors.textInverse,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.glassLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});

export default SleepGoalModal;
