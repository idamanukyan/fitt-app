/**
 * SleepScreen - Detailed Sleep Tracking View
 *
 * Features:
 * - Calendar view with sleep data indicators
 * - Monthly statistics and summaries
 * - Sleep history list
 * - Trends visualization
 * - Add/Edit sleep entries via modal
 * - Matches the design pattern of MeasurementsScreen
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../design/tokens';
import { useSleepStore } from '../stores/sleepStore';
import { AddSleepModal } from '../components/sleep/AddSleepModal';
import type { SleepEntry, SleepCreateData, SleepMonthlySummary } from '../types/sleep.types';
import {
  formatDuration,
  formatDurationShort,
  formatTimeDisplay,
  getSleepStatus,
  getSleepStatusInfo,
  SLEEP_THRESHOLDS,
} from '../utils/sleepCalculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  entry?: SleepEntry;
}

export const SleepScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const {
    entries,
    entriesByDate,
    calendarData,
    currentYear,
    currentMonth,
    selectedDate,
    selectedEntry,
    isLoading,
    isSaving,
    isDeleting,
    error,
    setCurrentMonth,
    setSelectedDate,
    fetchEntries,
    fetchMonthEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getMonthlySummary,
    get7DayAverage,
    getRecentEntries,
  } = useSleepStore();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // Get monthly summary
  const monthlySummary = useMemo(
    () => getMonthlySummary(currentYear, currentMonth),
    [currentYear, currentMonth, entries]
  );

  // Get recent entries for history
  const recentEntries = useMemo(() => getRecentEntries(10), [entries]);

  // Get 7-day average
  const sevenDayAvg = useMemo(() => get7DayAverage(), [entries]);

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      const month = currentMonth === 0 ? 11 : currentMonth - 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isFuture: false,
        entry: entriesByDate.get(dateStr),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      grid.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isFuture: date > today,
        entry: entriesByDate.get(dateStr),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - grid.length;
    for (let day = 1; day <= remainingDays; day++) {
      const year = currentMonth === 11 ? currentYear + 1 : currentYear;
      const month = currentMonth === 11 ? 0 : currentMonth + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isFuture: true,
        entry: entriesByDate.get(dateStr),
      });
    }

    return grid;
  }, [currentYear, currentMonth, entriesByDate]);

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newYear, newMonth);
  }, [currentYear, currentMonth, setCurrentMonth]);

  const handleNextMonth = useCallback(() => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newYear, newMonth);
  }, [currentYear, currentMonth, setCurrentMonth]);

  // Day tap handler
  const handleDayPress = useCallback((calendarDay: CalendarDay) => {
    if (calendarDay.isFuture) return;

    setSelectedDate(calendarDay.date);

    if (calendarDay.entry) {
      setModalMode('edit');
    } else {
      setModalMode('add');
    }
    setShowModal(true);
  }, [setSelectedDate]);

  // Add button handler
  const handleAddPress = useCallback(() => {
    // Default to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setModalMode('add');
    setShowModal(true);
  }, [setSelectedDate]);

  // Save handler
  const handleSave = useCallback(async (data: SleepCreateData) => {
    const targetDate = selectedDate || data.date;

    const result = await (modalMode === 'edit' && selectedEntry
      ? updateEntry(selectedEntry.id, data)
      : createEntry({ ...data, date: targetDate }));

    if (result) {
      setShowModal(false);
      setSelectedDate(null);
    }
  }, [selectedDate, selectedEntry, modalMode, createEntry, updateEntry, setSelectedDate]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (selectedEntry) {
      const success = await deleteEntry(selectedEntry.id);
      if (success) {
        setShowModal(false);
        setSelectedDate(null);
      }
    }
  }, [selectedEntry, deleteEntry, setSelectedDate]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntries(true);
    setRefreshing(false);
  }, [fetchEntries]);

  // Get status color for a duration
  const getStatusColor = useCallback((duration: number | undefined) => {
    if (!duration) return colors.textDisabled;
    return getSleepStatusInfo(duration).color;
  }, []);

  // Render calendar day
  const renderCalendarDay = (calendarDay: CalendarDay, index: number) => {
    const hasEntry = !!calendarDay.entry;
    const statusColor = hasEntry ? getStatusColor(calendarDay.entry?.duration_hours) : null;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          !calendarDay.isCurrentMonth && styles.calendarDayOtherMonth,
          calendarDay.isToday && styles.calendarDayToday,
          calendarDay.isFuture && styles.calendarDayFuture,
          selectedDate === calendarDay.date && styles.calendarDaySelected,
        ]}
        onPress={() => handleDayPress(calendarDay)}
        disabled={calendarDay.isFuture}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.calendarDayText,
            !calendarDay.isCurrentMonth && styles.calendarDayTextOtherMonth,
            calendarDay.isToday && styles.calendarDayTextToday,
            calendarDay.isFuture && styles.calendarDayTextFuture,
            selectedDate === calendarDay.date && styles.calendarDayTextSelected,
          ]}
        >
          {calendarDay.day}
        </Text>
        {hasEntry && (
          <View style={[styles.calendarDayIndicator, { backgroundColor: statusColor }]} />
        )}
      </TouchableOpacity>
    );
  };

  // Render history item
  const renderHistoryItem = (entry: SleepEntry) => {
    const statusInfo = getSleepStatusInfo(entry.duration_hours);
    const date = new Date(entry.date);
    const dayName = DAYS_OF_WEEK[date.getDay()];
    const monthName = MONTHS[date.getMonth()].slice(0, 3);

    return (
      <TouchableOpacity
        key={entry.id}
        style={styles.historyItem}
        onPress={() => {
          setSelectedDate(entry.date);
          setModalMode('edit');
          setShowModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.historyDate}>
          <Text style={styles.historyDay}>{date.getDate()}</Text>
          <Text style={styles.historyMonth}>{monthName}</Text>
          <Text style={styles.historyWeekday}>{dayName}</Text>
        </View>

        <View style={styles.historyContent}>
          <View style={styles.historyMain}>
            <Text style={[styles.historyDuration, { color: statusInfo.color }]}>
              {formatDuration(entry.duration_hours)}
            </Text>
            <View style={[styles.historyStatus, { backgroundColor: `${statusInfo.color}20` }]}>
              <Text style={[styles.historyStatusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.historyTimes}>
            <Text style={styles.historyTimeText}>
              {formatTimeDisplay(entry.bedtime)} - {formatTimeDisplay(entry.wake_time)}
            </Text>
            {entry.sleep_quality && (
              <Text style={styles.historyQuality}>Quality: {entry.sleep_quality}%</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  // Render stats card
  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>7-Day Avg</Text>
          <Text style={styles.statValue}>
            {sevenDayAvg ? `${sevenDayAvg.toFixed(1)}h` : '--'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>
            {monthlySummary.avg_duration_hours
              ? `${monthlySummary.avg_duration_hours.toFixed(1)}h`
              : '--'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Entries</Text>
          <Text style={styles.statValue}>{monthlySummary.total_entries}</Text>
        </View>
      </View>

      {monthlySummary.total_entries > 0 && (
        <View style={styles.statsBreakdown}>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.success }]} />
            <Text style={styles.breakdownText}>
              {monthlySummary.nights_optimal} optimal nights
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.breakdownText}>
              {monthlySummary.nights_excessive} excessive
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.error }]} />
            <Text style={styles.breakdownText}>
              {monthlySummary.nights_insufficient} insufficient
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={gradients.background as unknown as string[]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleep Tracking</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Ionicons name="add" size={24} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity style={styles.monthNavButton} onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.monthNavTitle}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity style={styles.monthNavButton} onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Stats Summary */}
          {renderStatsCard()}

          {/* Calendar */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              {DAYS_OF_WEEK.map((day) => (
                <View key={day} style={styles.calendarHeaderDay}>
                  <Text style={styles.calendarHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarGrid.map((day, index) => renderCalendarDay(day, index))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>7+ hours</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.legendText}>6-7 hours</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.legendText}>&lt; 6 hours</Text>
              </View>
            </View>
          </View>

          {/* History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Sleep</Text>

            {recentEntries.length > 0 ? (
              <View style={styles.historyList}>
                {recentEntries.map(renderHistoryItem)}
              </View>
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="moon-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyHistoryText}>No sleep data recorded yet</Text>
                <Text style={styles.emptyHistorySubtext}>
                  Tap the + button to log your first sleep entry
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>

      {/* Add/Edit Modal */}
      <AddSleepModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDate(null);
        }}
        onSave={handleSave}
        onDelete={modalMode === 'edit' ? handleDelete : undefined}
        existingEntry={selectedEntry}
        selectedDate={selectedDate || undefined}
        mode={modalMode}
        isSaving={isSaving}
        isDeleting={isDeleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  background: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },

  scrollView: {
    flex: 1,
  },

  // Month Navigation
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },

  // Stats Card
  statsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  statsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // Calendar
  calendarCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  calendarHeaderDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  calendarHeaderText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: colors.primaryBg,
    borderRadius: radius.full,
  },
  calendarDayFuture: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  calendarDayText: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  calendarDayTextOtherMonth: {
    color: colors.textMuted,
  },
  calendarDayTextToday: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  calendarDayTextFuture: {
    color: colors.textMuted,
  },
  calendarDayTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
  },
  calendarDayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // History
  historySection: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  historyDate: {
    width: 50,
    alignItems: 'center',
    marginRight: spacing.md,
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
  },
  historyDay: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  historyMonth: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  historyWeekday: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  historyContent: {
    flex: 1,
  },
  historyMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  historyDuration: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  historyStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  historyStatusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  historyTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyTimeText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  historyQuality: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyHistoryText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyHistorySubtext: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default SleepScreen;
