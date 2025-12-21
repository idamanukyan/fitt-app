/**
 * ConfigureSupplementScreen - Configure/Edit Supplement
 *
 * Features:
 * - Dosage configuration
 * - Schedule settings (frequency, time)
 * - Reminder toggle
 * - Notes
 * - Delete option (for existing supplements)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Switch,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSupplements, Supplement, Dosage } from '../contexts/SupplementsContext';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const colors = {
  background: '#0D0F0D',
  cardBg: '#151916',
  cardBgElevated: '#1A1D1A',
  primaryGreen: '#4ADE80',
  secondaryGreen: '#22C55E',
  greenMuted: 'rgba(74, 222, 128, 0.15)',
  greenBorder: 'rgba(74, 222, 128, 0.3)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  error: '#F87171',
  errorMuted: 'rgba(248, 113, 113, 0.15)',
};

// ============================================================================
// UNIT OPTIONS
// ============================================================================
const UNIT_OPTIONS: Dosage['unit'][] = ['g', 'mg', 'ml', 'capsules', 'pills', 'scoops', 'tablets'];

const FREQUENCY_OPTIONS: { value: Supplement['frequency']; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

// ============================================================================
// CONFIGURE SUPPLEMENT SCREEN
// ============================================================================
export default function ConfigureSupplementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    icon?: string;
    amount?: string;
    unit?: string;
    time?: string;
    custom?: string;
  }>();

  const { supplements, addSupplement, updateSupplement, deleteSupplement } = useSupplements();

  // Determine if editing existing or creating new
  const isEditing = !!params.id;
  const existingSupplement = isEditing
    ? supplements.find(s => s.id === params.id)
    : null;

  // Form state
  const [name, setName] = useState(params.name || existingSupplement?.name || '');
  const [icon, setIcon] = useState(params.icon || existingSupplement?.icon || '💊');
  const [amount, setAmount] = useState(
    params.amount || existingSupplement?.dosage.amount.toString() || ''
  );
  const [unit, setUnit] = useState<Dosage['unit']>(
    (params.unit as Dosage['unit']) || existingSupplement?.dosage.unit || 'g'
  );
  const [frequency, setFrequency] = useState<Supplement['frequency']>(
    existingSupplement?.frequency || 'daily'
  );
  const [time, setTime] = useState(params.time || existingSupplement?.time || '08:00');
  const [dosesPerDay, setDosesPerDay] = useState(
    existingSupplement?.dosesPerDay?.toString() || '1'
  );
  const [reminders, setReminders] = useState(existingSupplement?.reminders ?? true);
  const [notes, setNotes] = useState(existingSupplement?.notes || '');

  // UI state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Title
  const screenTitle = isEditing
    ? `Edit ${existingSupplement?.name || 'Supplement'}`
    : params.custom
    ? 'Create Supplement'
    : `Configure ${params.name || 'Supplement'}`;

  // Parse time for picker
  const getTimeDate = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Handle time change
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a supplement name');
      return false;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid dosage amount');
      return false;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const supplementData = {
        name: name.trim(),
        icon,
        dosage: {
          amount: Number(amount),
          unit,
        },
        frequency,
        time,
        dosesPerDay: Number(dosesPerDay) || 1,
        reminders,
        notes: notes.trim(),
      };

      if (isEditing && params.id) {
        await updateSupplement(params.id, supplementData);
        Alert.alert('Saved', 'Supplement updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await addSupplement(supplementData);
        Alert.alert('Added', 'Supplement added to your list', [
          { text: 'OK', onPress: () => router.replace('/supplements/library') },
        ]);
      }
    } catch (error) {
      console.error('Failed to save supplement:', error);
      Alert.alert('Error', 'Failed to save supplement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!params.id) return;

    try {
      await deleteSupplement(params.id);
      setShowDeleteConfirm(false);
      Alert.alert('Deleted', 'Supplement removed from your list', [
        { text: 'OK', onPress: () => router.replace('/supplements/tracker') },
      ]);
    } catch (error) {
      console.error('Failed to delete supplement:', error);
      Alert.alert('Error', 'Failed to delete supplement. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {screenTitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon & Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPLEMENT</Text>
          <View style={styles.nameRow}>
            <TouchableOpacity style={styles.iconPicker}>
              <Text style={styles.iconEmoji}>{icon}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.nameInput}
              placeholder="Supplement name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Dosage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DOSAGE</Text>
          <View style={styles.dosageRow}>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <TouchableOpacity
              style={styles.unitButton}
              onPress={() => setShowUnitPicker(true)}
            >
              <Text style={styles.unitText}>{unit}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCHEDULE</Text>

          {/* Frequency */}
          <View style={styles.frequencyRow}>
            {FREQUENCY_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  frequency === option.value && styles.frequencyOptionActive,
                ]}
                onPress={() => setFrequency(option.value)}
              >
                {frequency === option.value ? (
                  <LinearGradient
                    colors={[colors.primaryGreen, colors.secondaryGreen]}
                    style={styles.frequencyGradient}
                  >
                    <Text style={styles.frequencyTextActive}>{option.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.frequencyText}>{option.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Time */}
          <TouchableOpacity
            style={styles.timeRow}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={22} color={colors.primaryGreen} />
              <Text style={styles.timeLabel}>Time</Text>
            </View>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{time}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Doses per day */}
          <View style={styles.dosesRow}>
            <View style={styles.dosesInfo}>
              <Ionicons name="repeat-outline" size={22} color={colors.primaryGreen} />
              <Text style={styles.dosesLabel}>Doses per day</Text>
            </View>
            <View style={styles.dosesCounter}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setDosesPerDay(Math.max(1, Number(dosesPerDay) - 1).toString())}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{dosesPerDay}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setDosesPerDay((Number(dosesPerDay) + 1).toString())}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REMINDERS</Text>
          <View style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.primaryGreen} />
              <View>
                <Text style={styles.reminderLabel}>Push Notifications</Text>
                <Text style={styles.reminderSubtext}>Get reminded at {time}</Text>
              </View>
            </View>
            <Switch
              value={reminders}
              onValueChange={setReminders}
              trackColor={{ false: colors.cardBgElevated, true: colors.greenMuted }}
              thumbColor={reminders ? colors.primaryGreen : colors.textMuted}
              ios_backgroundColor={colors.cardBgElevated}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTES</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes (e.g., take with food)"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Delete Button (for existing supplements) */}
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={styles.deleteButtonText}>Delete Supplement</Text>
          </TouchableOpacity>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primaryGreen, colors.secondaryGreen]}
            style={styles.saveButtonGradient}
          >
            <Ionicons
              name={saving ? 'hourglass-outline' : 'checkmark'}
              size={22}
              color={colors.background}
            />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Supplement'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={getTimeDate()}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor={colors.textPrimary}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Unit Picker Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showUnitPicker}
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Unit</Text>
              <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.unitList}>
              {UNIT_OPTIONS.map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitOption, unit === u && styles.unitOptionActive]}
                  onPress={() => {
                    setUnit(u);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text style={[styles.unitOptionText, unit === u && styles.unitOptionTextActive]}>
                    {u}
                  </Text>
                  {unit === u && (
                    <Ionicons name="checkmark" size={20} color={colors.primaryGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showDeleteConfirm}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="trash-outline" size={32} color={colors.error} />
            </View>
            <Text style={styles.confirmTitle}>Delete Supplement?</Text>
            <Text style={styles.confirmMessage}>
              This will remove "{existingSupplement?.name}" and all its intake history. This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPicker: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  iconEmoji: {
    fontSize: 28,
  },
  nameInput: {
    flex: 1,
    height: 56,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  dosageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountContainer: {
    flex: 1,
  },
  amountInput: {
    height: 56,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  frequencyOption: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  frequencyOptionActive: {
    borderColor: colors.greenBorder,
    backgroundColor: 'transparent',
  },
  frequencyGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  frequencyTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  dosesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  dosesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dosesLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dosesCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryGreen,
    minWidth: 24,
    textAlign: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reminderSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  notesInput: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.errorMuted,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.greenBorder,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.greenBorder,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  unitList: {
    maxHeight: 300,
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.greenBorder,
  },
  unitOptionActive: {
    backgroundColor: colors.greenMuted,
  },
  unitOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  unitOptionTextActive: {
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  confirmModal: {
    backgroundColor: colors.cardBg,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.errorMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.cardBgElevated,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
