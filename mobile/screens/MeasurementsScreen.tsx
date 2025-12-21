/**
 * MeasurementsScreen - Production-Ready Measurements Tracking
 *
 * Features:
 * - Full Zustand store integration for state management
 * - Interactive calendar with real measurement data
 * - Day detail modal with trends and analytics
 * - Add/edit measurements with autofill
 * - Monthly summary and statistics
 * - Pull-to-refresh
 * - Modern, premium design
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMeasurementStore } from '../stores/measurementStore';
import { useSleepStore } from '../stores/sleepStore';
import { getDateFromMeasurement } from '../services/measurementService';
import type { MeasurementCreateData } from '../types/api.types';
import {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
} from '../design/tokens';
import {
  MeasurementsCalendar,
  DayDetailModal,
  AddMeasurementForm,
} from '../components/measurements';
import { AddSleepModal } from '../components/sleep/AddSleepModal';
import type { SleepCreateData } from '../types/sleep.types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MeasurementsScreen() {
  const insets = useSafeAreaInsets();

  // ========================================
  // ZUSTAND STORE
  // ========================================
  const {
    // Data
    measurements,
    calendarData,
    selectedDate,
    selectedMeasurement,

    // Current view state
    currentYear,
    currentMonth,

    // Loading states
    isLoading,
    isLoadingMonth,
    isSaving,
    isDeleting,

    // Error
    error,
    clearError,

    // Actions
    setCurrentMonth,
    setSelectedDate,

    // Data fetching
    fetchMeasurements,
    fetchMonthMeasurements,

    // CRUD
    upsertMeasurementByDate,
    deleteMeasurementByDate,

    // Computed
    getTrendsForDate,
    getMonthlySummary,
    getMonthComparison,
    getRecentMeasurements,
  } = useMeasurementStore();

  // ========================================
  // SLEEP STORE
  // ========================================
  const {
    getEntryForDate: getSleepEntryForDate,
    get7DayAverage: getSleep7DayAverage,
    getWeekComparison: getSleepWeekComparison,
    upsertEntryByDate: upsertSleepEntry,
    deleteEntryByDate: deleteSleepEntry,
    fetchEntries: fetchSleepEntries,
    isSaving: isSavingSleep,
    isDeleting: isDeletingSleep,
    selectedEntry: selectedSleepEntryFromStore,
  } = useSleepStore();

  // ========================================
  // MODAL STATES
  // ========================================
  const [showDayDetail, setShowDayDetail] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'add' | 'edit'>('add');
  const [refreshing, setRefreshing] = React.useState(false);

  // Sleep modal states
  const [showSleepModal, setShowSleepModal] = React.useState(false);
  const [sleepFormMode, setSleepFormMode] = React.useState<'add' | 'edit'>('add');

  // Web alert states
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<'measurement' | 'sleep' | null>(null);

  // ========================================
  // EFFECTS
  // ========================================

  // Initial data fetch
  useEffect(() => {
    fetchMeasurements();
  }, []);

  // Handle error display
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError]);

  // ========================================
  // COMPUTED DATA
  // ========================================

  // Get monthly statistics from store
  const monthlyStats = getMonthlySummary(currentYear, currentMonth);
  const monthComparison = getMonthComparison();
  const recentMeasurements = getRecentMeasurements(5);

  // Get trends for selected date
  const selectedTrends = selectedDate ? getTrendsForDate(selectedDate) : {
    weight_trend: null,
    weight_delta: null,
    weight_7day_avg: null,
    weight_30day_avg: null,
    body_fat_delta: null,
    weight_history: [],
    body_fat_history: [],
  };

  // Get sleep data for selected date
  const selectedSleepEntry = selectedDate ? getSleepEntryForDate(selectedDate) : null;
  const sleep7DayAvg = getSleep7DayAverage();
  const sleepWeekComparison = getSleepWeekComparison();
  const sleepTrendPercentage = sleepWeekComparison?.difference_percentage ?? null;

  // ========================================
  // HANDLERS
  // ========================================

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMeasurements(true);
    setRefreshing(false);
  }, [fetchMeasurements]);

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      setErrorMessage(message);
      setShowErrorModal(true);
    } else {
      Alert.alert('Error', message);
    }
  };

  const showSuccess = () => {
    if (Platform.OS === 'web') {
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } else {
      Alert.alert('Success', 'Measurement saved successfully');
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    const dayData = calendarData.get(date);

    if (dayData?.hasData) {
      // Show day detail modal for existing data
      setShowDayDetail(true);
    } else {
      // Open add form for new measurement
      setFormMode('add');
      setShowAddForm(true);
    }
  }, [setSelectedDate, calendarData]);

  // Handle month navigation
  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth(year, month);
  }, [setCurrentMonth]);

  // Handle edit from day detail modal
  const handleEditMeasurement = useCallback(() => {
    setShowDayDetail(false);
    setFormMode('edit');
    setShowAddForm(true);
  }, []);

  // Handle save measurement (create or update)
  const handleSaveMeasurement = useCallback(async (data: MeasurementCreateData) => {
    const dateStr = selectedDate || new Date().toISOString().split('T')[0];

    const result = await upsertMeasurementByDate(dateStr, data);

    if (result) {
      showSuccess();
      setShowAddForm(false);
      setSelectedDate(null);
    }
    // Error will be handled by the store's error state
  }, [selectedDate, upsertMeasurementByDate, setSelectedDate]);

  // Handle delete measurement - show confirmation
  const handleDeleteMeasurement = useCallback(() => {
    if (!selectedDate) return;
    // Close all modals first, then show confirmation after a brief delay
    setShowDayDetail(false);
    setShowAddForm(false);
    // Use setTimeout to ensure modals close before showing confirmation
    setTimeout(() => {
      setDeleteTarget('measurement');
      setShowDeleteConfirm(true);
    }, 100);
  }, [selectedDate]);

  // Handle closing modals
  const handleCloseDayDetail = useCallback(() => {
    setShowDayDetail(false);
    setSelectedDate(null);
  }, [setSelectedDate]);

  const handleCloseAddForm = useCallback(() => {
    setShowAddForm(false);
    if (!showDayDetail) {
      setSelectedDate(null);
    }
  }, [setSelectedDate, showDayDetail]);

  // Handle add button press
  const handleAddPress = useCallback(() => {
    setSelectedDate(null);
    setFormMode('add');
    setShowAddForm(true);
  }, [setSelectedDate]);

  // Handle sleep add/edit from day detail modal
  const handleAddSleep = useCallback(() => {
    setSleepFormMode('add');
    setShowSleepModal(true);
  }, []);

  const handleEditSleep = useCallback(() => {
    setSleepFormMode('edit');
    setShowSleepModal(true);
  }, []);

  // Handle save sleep entry
  const handleSaveSleep = useCallback(async (data: SleepCreateData) => {
    // Use the date from the modal's form data
    const dateStr = data.date;

    try {
      const result = await upsertSleepEntry(dateStr, data);

      // Always close modal after save attempt
      setShowSleepModal(false);

      if (result) {
        if (Platform.OS === 'web') {
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 2000);
        }
      } else {
        // Show error if save failed
        if (Platform.OS === 'web') {
          setErrorMessage('Failed to save sleep entry');
          setShowErrorModal(true);
        } else {
          Alert.alert('Error', 'Failed to save sleep entry');
        }
      }
    } catch (error) {
      setShowSleepModal(false);
      if (Platform.OS === 'web') {
        setErrorMessage('Failed to save sleep entry');
        setShowErrorModal(true);
      } else {
        Alert.alert('Error', 'Failed to save sleep entry');
      }
    }
  }, [upsertSleepEntry]);

  // Handle delete sleep entry - show confirmation
  const handleDeleteSleep = useCallback(() => {
    if (!selectedDate) return;
    // Close the sleep modal first
    setShowSleepModal(false);
    // Use setTimeout to ensure modal closes before showing confirmation
    setTimeout(() => {
      setDeleteTarget('sleep');
      setShowDeleteConfirm(true);
    }, 100);
  }, [selectedDate]);

  // Confirm delete action
  const handleConfirmDelete = useCallback(async () => {
    setShowDeleteConfirm(false);

    if (deleteTarget === 'sleep' && selectedDate) {
      const success = await deleteSleepEntry(selectedDate);
      if (success) {
        // Close day detail modal and refresh data
        setShowDayDetail(false);
        await fetchSleepEntries(true);
      }
    } else if (deleteTarget === 'measurement' && selectedDate) {
      const success = await deleteMeasurementByDate(selectedDate);
      if (success) {
        setShowDayDetail(false);
        setShowAddForm(false);
        setSelectedDate(null);
        // Refresh measurements data
        await fetchMeasurements(true);
      }
    }

    setDeleteTarget(null);
  }, [deleteTarget, selectedDate, deleteSleepEntry, deleteMeasurementByDate, setSelectedDate, fetchSleepEntries, fetchMeasurements]);

  // Cancel delete action
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  }, []);

  // Handle closing sleep modal
  const handleCloseSleepModal = useCallback(() => {
    setShowSleepModal(false);
  }, []);

  // ========================================
  // LOADING STATE
  // ========================================

  if (isLoading && measurements.length === 0) {
    return (
      <LinearGradient colors={gradients.background as unknown as string[]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading measurements...</Text>
      </LinearGradient>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <LinearGradient colors={gradients.background as unknown as string[]} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.title}>Measurements</Text>
          <Text style={styles.subtitle}>Track your body transformation</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.buttonPrimary as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={20} color={colors.textInverse} />
            <Text style={styles.addButtonText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing['3xl'] }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View>
          {/* Monthly Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>
                  {monthlyStats.total_entries} entries
                </Text>
              </View>
            </View>

            <View style={styles.summaryStats}>
              {monthlyStats.avg_weight !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {monthlyStats.avg_weight.toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>Avg Weight</Text>
                </View>
              )}
              {monthlyStats.weight_change !== null && (
                <View style={styles.statItem}>
                  <View style={styles.statChangeRow}>
                    <Ionicons
                      name={monthlyStats.weight_change < 0 ? 'trending-down' : monthlyStats.weight_change > 0 ? 'trending-up' : 'remove'}
                      size={16}
                      color={monthlyStats.weight_change < 0 ? colors.success : monthlyStats.weight_change > 0 ? colors.accent.orange : colors.textMuted}
                    />
                    <Text style={[
                      styles.statValue,
                      { color: monthlyStats.weight_change < 0 ? colors.success : monthlyStats.weight_change > 0 ? colors.accent.orange : colors.textMuted }
                    ]}>
                      {monthlyStats.weight_change > 0 ? '+' : ''}{monthlyStats.weight_change.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Month Change</Text>
                </View>
              )}
              {monthlyStats.min_weight !== null && monthlyStats.max_weight !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {monthlyStats.min_weight.toFixed(1)} - {monthlyStats.max_weight.toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>Range (kg)</Text>
                </View>
              )}
            </View>

            {monthlyStats.total_entries === 0 && (
              <View style={styles.noDataHint}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.noDataHintText}>
                  Tap any day on the calendar to add measurements
                </Text>
              </View>
            )}
          </View>

          {/* Calendar */}
          <MeasurementsCalendar
            calendarData={calendarData}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            onMonthChange={handleMonthChange}
            currentYear={currentYear}
            currentMonth={currentMonth}
            isLoading={isLoadingMonth}
          />

          {/* Quick Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.warning} />
              <Text style={styles.tipsTitle}>Tips for Accurate Tracking</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Measure at the same time each day, ideally in the morning</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Use the same scale and conditions for consistency</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Weekly averages are more reliable than daily fluctuations</Text>
              </View>
            </View>
          </View>

          {/* Recent Measurements List */}
          {recentMeasurements.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Entries</Text>
              {recentMeasurements.map((measurement) => {
                const dateStr = getDateFromMeasurement(measurement);
                const date = new Date(measurement.recorded_at);
                const displayDate = date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <TouchableOpacity
                    key={measurement.id}
                    style={styles.recentCard}
                    onPress={() => {
                      setSelectedDate(dateStr);
                      setShowDayDetail(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentLeft}>
                      <View style={styles.recentDateBadge}>
                        <Text style={styles.recentDay}>{date.getDate()}</Text>
                        <Text style={styles.recentMonth}>
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </View>
                      <View style={styles.recentInfo}>
                        <Text style={styles.recentDateText}>{displayDate}</Text>
                        {measurement.notes && (
                          <Text style={styles.recentNotes} numberOfLines={1}>
                            {measurement.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.recentRight}>
                      {measurement.weight && (
                        <View style={styles.recentStat}>
                          <Text style={styles.recentStatValue}>{measurement.weight}</Text>
                          <Text style={styles.recentStatUnit}>kg</Text>
                        </View>
                      )}
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={showDayDetail}
        onClose={handleCloseDayDetail}
        onEdit={handleEditMeasurement}
        onDelete={handleDeleteMeasurement}
        measurement={selectedMeasurement}
        trends={selectedTrends}
        monthComparison={monthComparison}
        isDeleting={isDeleting}
        // Sleep data props
        sleepEntry={selectedSleepEntry}
        sleep7DayAvg={sleep7DayAvg}
        sleepTrendVsLastWeek={sleepTrendPercentage}
        onEditSleep={handleEditSleep}
        onAddSleep={handleAddSleep}
      />

      {/* Add/Edit Measurement Form */}
      <AddMeasurementForm
        visible={showAddForm}
        onClose={handleCloseAddForm}
        onSave={handleSaveMeasurement}
        onDelete={formMode === 'edit' ? handleDeleteMeasurement : undefined}
        existingMeasurement={formMode === 'edit' ? selectedMeasurement : null}
        selectedDate={selectedDate || undefined}
        mode={formMode}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />

      {/* Add/Edit Sleep Modal */}
      <AddSleepModal
        visible={showSleepModal}
        onClose={handleCloseSleepModal}
        onSave={handleSaveSleep}
        onDelete={sleepFormMode === 'edit' ? handleDeleteSleep : undefined}
        existingEntry={sleepFormMode === 'edit' ? selectedSleepEntry : null}
        selectedDate={selectedDate || undefined}
        mode={sleepFormMode}
        isSaving={isSavingSleep}
        isDeleting={isDeletingSleep}
      />

      {/* Success Modal (Web) */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrap, { backgroundColor: colors.successBg }]}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            </View>
            <Text style={styles.alertTitle}>Success!</Text>
            <Text style={styles.alertMessage}>Measurement saved successfully</Text>
          </View>
        </View>
      </Modal>

      {/* Error Modal (Web) */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrap, { backgroundColor: colors.errorBg }]}>
              <Ionicons name="alert-circle" size={32} color={colors.error} />
            </View>
            <Text style={styles.alertTitle}>Error</Text>
            <Text style={styles.alertMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrap, { backgroundColor: colors.errorBg }]}>
              <Ionicons name="trash-outline" size={32} color={colors.error} />
            </View>
            <Text style={styles.alertTitle}>Delete Entry</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to delete this {deleteTarget === 'sleep' ? 'sleep' : 'measurement'} entry?
            </Text>
            <View style={styles.alertButtonRow}>
              <TouchableOpacity
                style={styles.alertButtonCancel}
                onPress={handleCancelDelete}
              >
                <Text style={styles.alertButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.alertButtonDelete}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.alertButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  addButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  addButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  summaryBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  summaryBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noDataHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  noDataHintText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },

  // Tips
  tipsCard: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Recent Section
  recentSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentDateBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recentDay: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  recentMonth: {
    fontSize: typography.size.xs,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  recentInfo: {
    flex: 1,
  },
  recentDateText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  recentNotes: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recentStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recentStatValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  recentStatUnit: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  // Alert Modals
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertBox: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    minWidth: 280,
    ...shadows.cardElevated,
  },
  alertIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  alertTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  alertMessage: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  alertButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radius.lg,
  },
  alertButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
  alertButtonRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  alertButtonCancel: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  alertButtonCancelText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
  },
  alertButtonDelete: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
});
