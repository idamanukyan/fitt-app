/**
 * ConfigureSupplementScreen - Configure supplement dosage, timing, and reminders
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  getSupplementById,
  getUserSupplementById,
  addUserSupplement,
  updateUserSupplement,
  removeUserSupplement,
} from '../../storage/supplementStorage';
import {
  Supplement,
  UserSupplement,
  SupplementTiming,
  ScheduleType,
  SMART_DEFAULTS,
  TIMING_LABELS,
} from '../../types/supplements.types';
import { CATEGORY_ICONS } from '../../data/supplementCatalog';

const colors = {
  gradientStart: '#0F0F23',
  gradientMid: '#1A1A3E',
  gradientEnd: '#0D0D1A',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  primarySubtle: 'rgba(74, 222, 128, 0.15)',
  secondary: '#A78BFA',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  error: '#EF4444',
};

const UNITS = ['g', 'mg', 'mcg', 'ml', 'capsule', 'capsules', 'tablet', 'tablets', 'scoop', 'scoops', 'serving', 'servings'];
const DOSE_COUNTS = [1, 2, 3, 4, 5, 6];
const SCHEDULE_TYPES: ScheduleType[] = ['daily', 'weekly', 'custom'];
const TIMINGS: SupplementTiming[] = [
  'morning', 'afternoon', 'evening', 'before_workout', 'after_workout',
  'with_meal', 'before_bed', 'any_time'
];

export default function ConfigureSupplementScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    supplementId?: string;
    userSupplementId?: string;
    isEditing?: string;
  }>();

  const isEditing = params.isEditing === 'true';
  const supplementId = params.supplementId;
  const userSupplementId = params.userSupplementId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [existingUserSupplement, setExistingUserSupplement] = useState<UserSupplement | null>(null);

  // Form state
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('');
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [timing, setTiming] = useState<SupplementTiming>('morning');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (supplementId) {
        const supp = await getSupplementById(supplementId);
        if (supp) {
          setSupplement(supp);

          // Apply smart defaults if not editing
          if (!isEditing) {
            const defaults = SMART_DEFAULTS[supp.category] || {
              timing: supp.defaultTiming || 'morning',
              dosesPerDay: 1,
            };

            setDosage(String(supp.defaultDosage));
            setUnit(supp.defaultUnit);
            setTiming(defaults.timing);
            setDosesPerDay(defaults.dosesPerDay);

            // Set reminder time based on timing
            const now = new Date();
            switch (defaults.timing) {
              case 'morning':
                now.setHours(8, 0, 0, 0);
                break;
              case 'afternoon':
                now.setHours(14, 0, 0, 0);
                break;
              case 'evening':
                now.setHours(19, 0, 0, 0);
                break;
              case 'before_workout':
                now.setHours(17, 0, 0, 0);
                break;
              case 'after_workout':
                now.setHours(18, 30, 0, 0);
                break;
              case 'with_meal':
                now.setHours(12, 0, 0, 0);
                break;
              case 'before_bed':
                now.setHours(22, 0, 0, 0);
                break;
              default:
                now.setHours(9, 0, 0, 0);
            }
            setReminderTime(now);
          }
        }
      }

      if (isEditing && userSupplementId) {
        const userSupp = await getUserSupplementById(userSupplementId);
        if (userSupp) {
          setExistingUserSupplement(userSupp);
          setDosage(String(userSupp.dosage));
          setUnit(userSupp.unit);
          setDosesPerDay(userSupp.dosesPerDay);
          setTiming(userSupp.timing);
          setScheduleType(userSupp.scheduleType);
          setReminderEnabled(userSupp.reminderEnabled);
          if (userSupp.reminderTime) {
            const [hours, minutes] = userSupp.reminderTime.split(':').map(Number);
            const time = new Date();
            time.setHours(hours, minutes, 0, 0);
            setReminderTime(time);
          }
          setNotes(userSupp.notes || '');
        }
      }
    } catch (error) {
      console.error('Error loading supplement data:', error);
    } finally {
      setLoading(false);
    }
  }, [supplementId, userSupplementId, isEditing]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!supplement) return;

    const dosageNum = parseFloat(dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      Alert.alert(t('common.error'), 'Please enter a valid dosage');
      return;
    }

    setSaving(true);

    try {
      const supplementData = {
        supplementId: supplement.id,
        name: supplement.name,
        category: supplement.category,
        dosage: dosageNum,
        unit,
        dosesPerDay,
        timing,
        scheduleType,
        reminderEnabled,
        reminderTime: reminderEnabled ? formatTime(reminderTime) : undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing && existingUserSupplement) {
        await updateUserSupplement(existingUserSupplement.id, supplementData);
        Alert.alert(
          t('supplements.alerts.updated'),
          t('supplements.alerts.updatedMessage'),
          [{ text: t('common.done'), onPress: () => router.back() }]
        );
      } else {
        await addUserSupplement(supplementData);
        Alert.alert(
          t('supplements.alerts.added'),
          t('supplements.alerts.addedMessage', { name: supplement.name }),
          [{ text: t('common.done'), onPress: () => router.replace('/supplements/my-stack') }]
        );
      }
    } catch (error) {
      console.error('Error saving supplement:', error);
      Alert.alert(t('common.error'), 'Failed to save supplement');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    if (!existingUserSupplement) return;

    Alert.alert(
      t('supplements.configure.confirmRemove'),
      t('supplements.configure.confirmRemoveMessage', { name: supplement?.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeUserSupplement(existingUserSupplement.id);
              router.replace('/supplements/my-stack');
            } catch (error) {
              console.error('Error removing supplement:', error);
              Alert.alert(t('common.error'), 'Failed to remove supplement');
            }
          },
        },
      ]
    );
  };

  const getTimingLabel = (t_: SupplementTiming): string => {
    const labels = TIMING_LABELS[t_];
    return labels ? labels[i18n.language as 'en' | 'de'] || labels.en : t_;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd] as const}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!supplement) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd] as const}
          style={StyleSheet.absoluteFillObject}
        />
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Supplement not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd] as const}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('supplements.configureSupplement')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Supplement Header */}
        <View style={styles.supplementHeader}>
          <View style={[styles.supplementIcon, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons
              name={(CATEGORY_ICONS[supplement.category] || 'flask') as any}
              size={36}
              color={colors.primary}
            />
          </View>
          <View style={styles.supplementInfo}>
            <Text style={styles.supplementName}>{supplement.name}</Text>
            {supplement.brand && (
              <Text style={styles.supplementBrand}>{supplement.brand}</Text>
            )}
            {supplement.description && (
              <Text style={styles.supplementDesc}>{supplement.description}</Text>
            )}
          </View>
        </View>

        {/* Smart Defaults Hint */}
        {!isEditing && (
          <View style={styles.smartDefaultsHint}>
            <Ionicons name="sparkles" size={16} color={colors.secondary} />
            <Text style={styles.smartDefaultsText}>{t('supplements.configure.smartDefault')}</Text>
          </View>
        )}

        {/* Dosage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('supplements.configure.dosage')}</Text>

          <View style={styles.dosageRow}>
            <View style={styles.dosageInputContainer}>
              <Text style={styles.inputLabel}>{t('supplements.configure.dosageAmount')}</Text>
              <TextInput
                style={styles.dosageInput}
                value={dosage}
                onChangeText={setDosage}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.unitSelector}>
              <Text style={styles.inputLabel}>{t('supplements.configure.unit')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.unitChips}
              >
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
                      {t(`supplements.units.${u}` as any) || u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('supplements.configure.schedule')}</Text>

          {/* Schedule Type */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>{t('supplements.configure.scheduleType')}</Text>
            <View style={styles.scheduleTypeRow}>
              {SCHEDULE_TYPES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.scheduleTypeChip, scheduleType === s && styles.scheduleTypeActive]}
                  onPress={() => setScheduleType(s)}
                >
                  <Text style={[styles.scheduleTypeText, scheduleType === s && styles.scheduleTypeTextActive]}>
                    {t(`common.${s}` as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Doses Per Day */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>{t('supplements.configure.dosesPerDay')}</Text>
            <View style={styles.dosesRow}>
              {DOSE_COUNTS.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[styles.doseChip, dosesPerDay === count && styles.doseChipActive]}
                  onPress={() => setDosesPerDay(count)}
                >
                  <Text style={[styles.doseChipText, dosesPerDay === count && styles.doseChipTextActive]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timing */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>{t('supplements.configure.time')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timingChips}
            >
              {TIMINGS.map((t_) => (
                <TouchableOpacity
                  key={t_}
                  style={[styles.timingChip, timing === t_ && styles.timingChipActive]}
                  onPress={() => setTiming(t_)}
                >
                  <Text style={[styles.timingChipText, timing === t_ && styles.timingChipTextActive]}>
                    {getTimingLabel(t_)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('supplements.configure.reminders')}</Text>

          <View style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              <Text style={styles.reminderLabel}>{t('supplements.configure.pushNotifications')}</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.glassBorder, true: colors.primarySubtle }}
              thumbColor={reminderEnabled ? colors.primary : colors.textMuted}
              ios_backgroundColor={colors.glassBorder}
            />
          </View>

          {reminderEnabled && (
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.timePickerText}>
                {t('supplements.configure.reminderHint', { time: formatTime(reminderTime) })}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              textColor={colors.textPrimary}
            />
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.notes')}</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('supplements.configure.notesPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Remove Button (Edit mode only) */}
        {isEditing && (
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.removeButtonText}>{t('supplements.configure.removeFromStack')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark] as const}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator color="#0F0F23" />
            ) : (
              <>
                <Ionicons
                  name={isEditing ? 'checkmark-circle' : 'add-circle'}
                  size={22}
                  color="#0F0F23"
                />
                <Text style={styles.saveButtonText}>
                  {isEditing ? t('supplements.configure.saveChanges') : t('supplements.configure.addToStack')}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    marginTop: 16,
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 24,
    padding: 12,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  supplementIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplementInfo: {
    flex: 1,
    marginLeft: 16,
  },
  supplementName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  supplementBrand: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
  },
  supplementDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  smartDefaultsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  smartDefaultsText: {
    fontSize: 12,
    color: colors.secondary,
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  dosageRow: {
    gap: 16,
  },
  dosageInputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dosageInput: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  unitSelector: {},
  unitChips: {
    gap: 8,
    paddingVertical: 2,
  },
  unitChip: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unitChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  unitChipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  unitChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleTypeChip: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scheduleTypeActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  scheduleTypeText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  scheduleTypeTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dosesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  doseChip: {
    width: 44,
    height: 44,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  doseChipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  doseChipTextActive: {
    color: colors.primary,
  },
  timingChips: {
    gap: 8,
    paddingVertical: 2,
  },
  timingChip: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timingChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  timingChipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  timingChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  timePickerText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 14,
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.gradientStart,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F0F23',
  },
});
