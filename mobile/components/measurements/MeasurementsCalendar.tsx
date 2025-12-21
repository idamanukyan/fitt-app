/**
 * MeasurementsCalendar - Production-Ready Calendar Component
 *
 * Features:
 * - Month view with selectable days
 * - Visual indicators for days with measurements
 * - Heatmap coloring based on progress (color-blind friendly)
 * - Today highlight
 * - Smooth slide animations
 * - Optimized rendering
 * - Accessibility support
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../design/tokens';
import type { CalendarDayData } from '../../stores/measurementStore';
import type { SleepCalendarDay } from '../../types/sleep.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate day size with fallback for web where dimensions may be unreliable
const calculateDaySize = () => {
  const width = SCREEN_WIDTH || 375; // Fallback to iPhone SE width
  const calculatedSize = (width - spacing.xl * 2 - spacing.xs * 12) / 7;
  // Ensure minimum size of 32px and maximum of 50px
  return Math.max(32, Math.min(50, calculatedSize));
};
const DAY_SIZE = calculateDaySize();

interface MeasurementsCalendarProps {
  calendarData: Map<string, CalendarDayData>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  currentYear: number;
  currentMonth: number;
  isLoading?: boolean;
  // Sleep integration
  sleepCalendarData?: Map<string, SleepCalendarDay>;
  showSleepIndicators?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Color-blind friendly palette
const CALENDAR_COLORS = {
  progress: '#22C55E', // Green - weight loss/improvement
  increase: '#F97316', // Orange - weight gain
  recorded: '#60A5FA', // Blue - neutral/recorded
  progressBg: 'rgba(34, 197, 94, 0.15)',
  increaseBg: 'rgba(249, 115, 22, 0.15)',
  recordedBg: 'rgba(96, 165, 250, 0.15)',
  // Sleep colors
  sleepOptimal: '#A78BFA', // Purple - optimal sleep
  sleepBorderline: '#FBBF24', // Amber - borderline sleep
  sleepInsufficient: '#EF4444', // Red - insufficient sleep
};

export const MeasurementsCalendar: React.FC<MeasurementsCalendarProps> = ({
  calendarData,
  selectedDate,
  onSelectDate,
  onMonthChange,
  currentYear,
  currentMonth,
  isLoading = false,
  sleepCalendarData,
  showSleepIndicators = true,
}) => {
  const today = useMemo(() => new Date(), []);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  }, []);

  const formatDate = useCallback((year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }, []);

  const isToday = useCallback((year: number, month: number, day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  }, [today]);

  const isFuture = useCallback((year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date > todayStart;
  }, [today]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const toValue = direction === 'prev' ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: toValue / 4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      if (currentMonth === 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else {
        newMonth = currentMonth - 1;
      }
    } else {
      if (currentMonth === 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      } else {
        newMonth = currentMonth + 1;
      }
    }

    onMonthChange(newYear, newMonth);
  }, [currentMonth, currentYear, onMonthChange, slideAnim]);

  const goToToday = useCallback(() => {
    onMonthChange(today.getFullYear(), today.getMonth());
  }, [today, onMonthChange]);

  const getDayStyle = useCallback((dayData: CalendarDayData | undefined) => {
    if (!dayData?.hasData) return null;

    switch (dayData.trend) {
      case 'down':
        return {
          color: CALENDAR_COLORS.progress,
          bgColor: CALENDAR_COLORS.progressBg,
        };
      case 'up':
        return {
          color: CALENDAR_COLORS.increase,
          bgColor: CALENDAR_COLORS.increaseBg,
        };
      default:
        return {
          color: CALENDAR_COLORS.recorded,
          bgColor: CALENDAR_COLORS.recordedBg,
        };
    }
  }, []);

  const getSleepIndicatorColor = useCallback((sleepData: SleepCalendarDay | undefined) => {
    if (!sleepData?.hasData) return null;

    switch (sleepData.status) {
      case 'optimal':
      case 'on_track':
        return CALENDAR_COLORS.sleepOptimal;
      case 'borderline':
        return CALENDAR_COLORS.sleepBorderline;
      case 'insufficient':
      case 'excessive':
        return CALENDAR_COLORS.sleepInsufficient;
      default:
        return CALENDAR_COLORS.sleepOptimal;
    }
  }, []);

  const renderCalendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: React.ReactElement[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentYear, currentMonth, day);
      const dayData = calendarData.get(dateStr);
      const sleepData = sleepCalendarData?.get(dateStr);
      const isTodayDate = isToday(currentYear, currentMonth, day);
      const isFutureDate = isFuture(currentYear, currentMonth, day);
      const isSelected = selectedDate === dateStr;
      const dayStyle = getDayStyle(dayData);
      const sleepColor = getSleepIndicatorColor(sleepData);

      const accessibilityLabel = `${MONTHS[currentMonth]} ${day}, ${currentYear}${
        dayData?.hasData ? `, measurement recorded${dayData.weight ? `, weight ${dayData.weight} kg` : ''}` : ''
      }${sleepData?.hasData ? `, sleep recorded` : ''}${isTodayDate ? ', today' : ''}`;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isTodayDate && styles.todayCell,
            isSelected && styles.selectedCell,
            isFutureDate && styles.futureCell,
            dayData?.hasData && dayStyle && { backgroundColor: dayStyle.bgColor },
          ]}
          onPress={() => !isFutureDate && onSelectDate(dateStr)}
          disabled={isFutureDate}
          activeOpacity={0.7}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected, disabled: isFutureDate }}
        >
          <Text
            style={[
              styles.dayText,
              isTodayDate && styles.todayText,
              isSelected && styles.selectedText,
              isFutureDate && styles.futureText,
            ]}
          >
            {day}
          </Text>

          {/* Indicators container */}
          <View style={styles.indicatorsContainer}>
            {/* Measurement indicator dot */}
            {dayData?.hasData && (
              <View
                style={[
                  styles.measurementIndicator,
                  { backgroundColor: dayStyle?.color || colors.primary },
                ]}
              />
            )}

            {/* Sleep indicator dot */}
            {showSleepIndicators && sleepData?.hasData && sleepColor && (
              <View
                style={[
                  styles.sleepIndicator,
                  { backgroundColor: sleepColor },
                ]}
              />
            )}
          </View>

          {/* Trend indicator for days with data */}
          {dayData?.hasData && dayData.trend && dayData.trend !== 'stable' && (
            <View style={styles.trendIndicator}>
              <Ionicons
                name={dayData.trend === 'down' ? 'trending-down' : 'trending-up'}
                size={10}
                color={dayStyle?.color || colors.textMuted}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  }, [
    currentYear,
    currentMonth,
    calendarData,
    calendarData.size, // Force re-render when Map size changes
    sleepCalendarData,
    sleepCalendarData?.size,
    selectedDate,
    getDaysInMonth,
    getFirstDayOfMonth,
    formatDate,
    isToday,
    isFuture,
    getDayStyle,
    getSleepIndicatorColor,
    onSelectDate,
    showSleepIndicators,
  ]);

  const isCurrentMonthToday = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthYearContainer}>
          <Text style={styles.monthText}>{MONTHS[currentMonth]}</Text>
          <Text style={styles.yearText}>{currentYear}</Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Today Button */}
      {!isCurrentMonthToday && (
        <TouchableOpacity
          style={styles.todayButton}
          onPress={goToToday}
          accessibilityLabel="Go to today"
          accessibilityRole="button"
        >
          <Ionicons name="today-outline" size={16} color={colors.primary} />
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <Animated.View
        style={[
          styles.daysGrid,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {renderCalendarDays}
      </Animated.View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CALENDAR_COLORS.progress }]} />
          <Text style={styles.legendText}>Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CALENDAR_COLORS.increase }]} />
          <Text style={styles.legendText}>Increase</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CALENDAR_COLORS.recorded }]} />
          <Text style={styles.legendText}>Recorded</Text>
        </View>
        {showSleepIndicators && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CALENDAR_COLORS.sleepOptimal }]} />
            <Text style={styles.legendText}>Sleep</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  yearText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Today Button
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  todayButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },

  // Loading
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
  },

  // Weekday Headers
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekdayText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
  },

  // Days Grid
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    position: 'relative',
  },
  todayCell: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedCell: {
    backgroundColor: colors.primary,
  },
  futureCell: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  todayText: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  selectedText: {
    color: colors.textInverse,
    fontWeight: typography.weight.bold,
  },
  futureText: {
    color: colors.textMuted,
  },

  // Indicators
  indicatorsContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  measurementIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sleepIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trendIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.xl,
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
});

export default MeasurementsCalendar;
