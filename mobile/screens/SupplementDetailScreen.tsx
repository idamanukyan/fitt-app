/**
 * SupplementDetailScreen - View supplement details and add to schedule
 * Accessible from SupplementsScreen or MySupplementsScreen
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import {
  Supplement,
  UserSupplement,
  IntakeFrequency,
  IntakeTiming,
  getCategoryLabel,
  getCategoryIcon,
  getTimingLabel,
  getFrequencyLabel,
} from '../types/supplement';
import { supplementService } from '../services/supplementService';

const FREQUENCY_OPTIONS = [
  { key: IntakeFrequency.DAILY, label: 'Daily' },
  { key: IntakeFrequency.EVERY_OTHER_DAY, label: 'Every Other Day' },
  { key: IntakeFrequency.WEEKLY, label: 'Weekly' },
  { key: IntakeFrequency.AS_NEEDED, label: 'As Needed' },
];

const TIMING_OPTIONS = [
  { key: IntakeTiming.MORNING, label: 'Morning', icon: 'sunny-outline' },
  { key: IntakeTiming.AFTERNOON, label: 'Afternoon', icon: 'partly-sunny-outline' },
  { key: IntakeTiming.EVENING, label: 'Evening', icon: 'moon-outline' },
  { key: IntakeTiming.BEFORE_WORKOUT, label: 'Before Workout', icon: 'barbell-outline' },
  { key: IntakeTiming.AFTER_WORKOUT, label: 'After Workout', icon: 'checkmark-circle-outline' },
  { key: IntakeTiming.WITH_MEAL, label: 'With Meal', icon: 'restaurant-outline' },
  { key: IntakeTiming.BEFORE_BED, label: 'Before Bed', icon: 'bed-outline' },
  { key: IntakeTiming.ANY_TIME, label: 'Any Time', icon: 'time-outline' },
];

export default function SupplementDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const supplementId = parseInt(params.id as string);

  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [userSupplement, setUserSupplement] = useState<UserSupplement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);

  // Form state
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('');
  const [frequency, setFrequency] = useState<IntakeFrequency>(IntakeFrequency.DAILY);
  const [timing, setTiming] = useState<IntakeTiming>(IntakeTiming.MORNING);
  const [totalStock, setTotalStock] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSupplement();
  }, []);

  const loadSupplement = async () => {
    try {
      setLoading(true);
      const data = await supplementService.library.getSupplement(supplementId);
      setSupplement(data);

      // Set default values
      setDosage(data.default_dosage?.toString() || '');
      setDosageUnit(data.dosage_unit || 'mg');
      setFrequency(data.recommended_frequency || IntakeFrequency.DAILY);
      setTiming(data.recommended_timing || IntakeTiming.MORNING);

      // Check if user already has this supplement
      try {
        const userSupplements = await supplementService.user.getMySupplements(true);
        const existing = userSupplements.find(us => us.supplement_id === supplementId);
        if (existing) {
          setUserSupplement(existing);
          setIsAddMode(false);
          // Load existing values
          setDosage(existing.dosage?.toString() || '');
          setDosageUnit(existing.dosage_unit || 'mg');
          setFrequency(existing.frequency);
          setTiming(existing.timing);
          setTotalStock(existing.total_stock?.toString() || '');
          setReminderEnabled(existing.reminder_enabled);
          setNotes(existing.notes || '');
        }
      } catch (error) {
        // User doesn't have this supplement yet
      }
    } catch (error) {
      console.error('Error loading supplement:', error);
      Alert.alert('Error', 'Failed to load supplement details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dosage || !dosageUnit) {
      Alert.alert('Validation Error', 'Please enter dosage and unit');
      return;
    }

    try {
      setSaving(true);
      const data = {
        supplement_id: supplementId,
        dosage: parseFloat(dosage),
        dosage_unit: dosageUnit,
        frequency,
        timing,
        reminder_enabled: reminderEnabled,
        notes: notes || undefined,
        total_stock: totalStock ? parseInt(totalStock) : undefined,
        remaining_stock: totalStock ? parseInt(totalStock) : undefined,
        low_stock_alert: !!totalStock,
      };

      if (isAddMode) {
        await supplementService.user.addSupplement(data);
        Alert.alert('Success', 'Supplement added to your schedule', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else if (userSupplement) {
        await supplementService.user.updateSupplement(userSupplement.id, data);
        Alert.alert('Success', 'Supplement schedule updated', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error saving supplement:', error);
      Alert.alert('Error', 'Failed to save supplement');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!userSupplement) return;

    Alert.alert(
      'Remove Supplement',
      'Are you sure you want to remove this supplement from your schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await supplementService.user.removeSupplement(userSupplement.id);
              Alert.alert('Success', 'Supplement removed from schedule', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Error removing supplement:', error);
              Alert.alert('Error', 'Failed to remove supplement');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>LOADING SUPPLEMENT...</Text>
      </View>
    );
  }

  if (!supplement) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <Text style={styles.errorText}>Supplement not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Image */}
        <View style={styles.imageHeader}>
          {supplement.image_url ? (
            <Image source={{ uri: supplement.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.iconPlaceholder}>
              <Ionicons
                name={getCategoryIcon(supplement.category) as any}
                size={80}
                color={theme.colors.techBlue}
              />
            </View>
          )}
          {supplement.is_popular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={16} color={theme.colors.techOrange} />
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryLabel(supplement.category)}</Text>
          </View>
          <Text style={styles.name}>{supplement.name}</Text>
          {supplement.brand && <Text style={styles.brand}>{supplement.brand}</Text>}
          {supplement.description && (
            <Text style={styles.description}>{supplement.description}</Text>
          )}
        </View>

        {/* Details Grid */}
        {(supplement.calories_per_serving ||
          supplement.protein_per_serving ||
          supplement.serving_size) && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>NUTRITIONAL INFO</Text>
            <View style={styles.detailsGrid}>
              {supplement.serving_size && (
                <View style={styles.detailItem}>
                  <Ionicons name="scale-outline" size={20} color={theme.colors.techBlue} />
                  <Text style={styles.detailLabel}>Serving</Text>
                  <Text style={styles.detailValue}>{supplement.serving_size}</Text>
                </View>
              )}
              {supplement.calories_per_serving && (
                <View style={styles.detailItem}>
                  <Ionicons name="flame-outline" size={20} color={theme.colors.techOrange} />
                  <Text style={styles.detailLabel}>Calories</Text>
                  <Text style={styles.detailValue}>{supplement.calories_per_serving}</Text>
                </View>
              )}
              {supplement.protein_per_serving && (
                <View style={styles.detailItem}>
                  <Ionicons name="fitness-outline" size={20} color={theme.colors.techGreen} />
                  <Text style={styles.detailLabel}>Protein</Text>
                  <Text style={styles.detailValue}>{supplement.protein_per_serving}g</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Benefits */}
        {supplement.benefits && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>BENEFITS</Text>
            <Text style={styles.detailText}>{supplement.benefits}</Text>
          </View>
        )}

        {/* Instructions */}
        {supplement.instructions && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
            <Text style={styles.detailText}>{supplement.instructions}</Text>
          </View>
        )}

        {/* Schedule Configuration */}
        <View style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>
            {isAddMode ? 'ADD TO SCHEDULE' : 'UPDATE SCHEDULE'}
          </Text>

          {/* Dosage */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Dosage</Text>
            <View style={styles.dosageRow}>
              <TextInput
                style={[styles.input, styles.dosageInput]}
                placeholder="Amount"
                placeholderTextColor={theme.colors.darkGray}
                value={dosage}
                onChangeText={setDosage}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.unitInput]}
                placeholder="Unit (mg, g, ml)"
                placeholderTextColor={theme.colors.darkGray}
                value={dosageUnit}
                onChangeText={setDosageUnit}
              />
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.optionsRow}>
              {FREQUENCY_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionChip,
                    frequency === option.key && styles.optionChipActive,
                  ]}
                  onPress={() => setFrequency(option.key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      frequency === option.key && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timing */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Timing</Text>
            <View style={styles.optionsGrid}>
              {TIMING_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.timingChip,
                    timing === option.key && styles.timingChipActive,
                  ]}
                  onPress={() => setTiming(option.key)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      timing === option.key ? theme.colors.white : theme.colors.darkGray
                    }
                  />
                  <Text
                    style={[
                      styles.timingText,
                      timing === option.key && styles.timingTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stock Tracking */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Stock (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Number of servings"
              placeholderTextColor={theme.colors.darkGray}
              value={totalStock}
              onChangeText={setTotalStock}
              keyboardType="number-pad"
            />
          </View>

          {/* Reminder Toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setReminderEnabled(!reminderEnabled)}
            activeOpacity={0.7}
          >
            <View style={styles.toggleInfo}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.colors.techBlue}
              />
              <Text style={styles.toggleLabel}>Enable Reminders</Text>
            </View>
            <View
              style={[
                styles.toggle,
                reminderEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  reminderEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this supplement..."
              placeholderTextColor={theme.colors.darkGray}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.white} />
                <Text style={styles.saveButtonText}>
                  {isAddMode ? 'ADD TO SCHEDULE' : 'UPDATE SCHEDULE'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!isAddMode && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.techOrange} />
            <Text style={styles.removeButtonText}>REMOVE FROM SCHEDULE</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingBottom: theme.spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techBlue,
    fontWeight: '700',
    letterSpacing: 2,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: '600',
  },
  imageHeader: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.techOrange,
    gap: theme.spacing.xs,
  },
  popularText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.techOrange,
    letterSpacing: 1,
  },
  infoSection: {
    padding: theme.spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    marginBottom: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.fontSize['3xl'] * 1.2,
  },
  brand: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.steelDark,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.darkGray,
    lineHeight: theme.typography.fontSize.md * 1.5,
  },
  detailsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.concreteLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  scheduleCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.concreteLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: '700',
    marginTop: 2,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    lineHeight: theme.typography.fontSize.sm * 1.6,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.2)',
  },
  dosageRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dosageInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.2)',
  },
  optionChipActive: {
    backgroundColor: theme.colors.techBlue,
    borderColor: theme.colors.techBlue,
  },
  optionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  optionTextActive: {
    color: theme.colors.white,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.2)',
    minWidth: '47%',
  },
  timingChipActive: {
    backgroundColor: theme.colors.techBlue,
    borderColor: theme.colors.techBlue,
  },
  timingText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  timingTextActive: {
    color: theme.colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  toggleLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.techBlue,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.darkGray,
  },
  toggleThumbActive: {
    backgroundColor: theme.colors.white,
    alignSelf: 'flex-end',
  },
  saveButton: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.techBlueGlow,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  removeButtonText: {
    color: theme.colors.techOrange,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
