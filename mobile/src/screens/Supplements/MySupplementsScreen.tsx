/**
 * MySupplementsScreen - Track and log supplement intake
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import {
  getUserSupplements,
  getTodayProgress,
  getWeeklyDots,
  logIntake,
  undoIntake,
  getStackStats,
} from '../../storage/supplementStorage';
import { UserSupplement, WeeklyDot, TIMING_LABELS } from '../../types/supplements.types';
import { CATEGORY_ICONS } from '../../data/supplementCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#EF4444',
};

// Large Progress Ring Component
const LargeProgressRing: React.FC<{
  progress: number;
  taken: number;
  total: number;
  size?: number;
}> = ({ progress, taken, total, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="largeProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.glassBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#largeProgressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressPercentage}>{progress}%</Text>
        <Text style={styles.progressLabel}>{taken}/{total}</Text>
      </View>
    </View>
  );
};

// Weekly Dot Component
const WeekDot: React.FC<{ dot: WeeklyDot }> = ({ dot }) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (dot.status) {
      case 'complete': return colors.success;
      case 'partial': return colors.warning;
      case 'missed': return colors.error;
      default: return colors.glassBorder;
    }
  };

  const getDayLabel = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return t(`days.${days[dot.dayOfWeek]}`);
  };

  return (
    <View style={styles.weekDotContainer}>
      <Text style={[styles.weekDayLabel, dot.isToday && styles.weekDayLabelToday]}>
        {getDayLabel()}
      </Text>
      <View style={[
        styles.weekDot,
        { backgroundColor: getStatusColor() },
        dot.isToday && styles.weekDotToday,
      ]}>
        {dot.status === 'complete' && (
          <Ionicons name="checkmark" size={12} color="#0F0F23" />
        )}
        {dot.status === 'partial' && (
          <Text style={styles.weekDotPartial}>{dot.percentComplete}%</Text>
        )}
      </View>
    </View>
  );
};

// Supplement Card with Intake Logging
const SupplementIntakeCard: React.FC<{
  supplement: UserSupplement;
  todayTaken: number;
  onLogIntake: () => void;
  onUndo: () => void;
  onEdit: () => void;
}> = ({ supplement, todayTaken, onLogIntake, onUndo, onEdit }) => {
  const { t, i18n } = useTranslation();
  const isTaken = todayTaken >= supplement.dosesPerDay;
  const timingLabel = TIMING_LABELS[supplement.timing]?.[i18n.language as 'en' | 'de'] || supplement.timing;

  return (
    <View style={styles.intakeCard}>
      <TouchableOpacity style={styles.intakeCardContent} onPress={onEdit} activeOpacity={0.8}>
        <View style={[styles.intakeIconContainer, { backgroundColor: colors.primarySubtle }]}>
          <Ionicons
            name={(CATEGORY_ICONS[supplement.category] || 'flask') as any}
            size={24}
            color={colors.primary}
          />
        </View>

        <View style={styles.intakeInfo}>
          <Text style={styles.intakeName}>{supplement.name}</Text>
          <Text style={styles.intakeDosage}>
            {supplement.dosage} {supplement.unit} • {timingLabel}
          </Text>
          <View style={styles.intakeProgress}>
            <View style={styles.intakeProgressBar}>
              <View
                style={[
                  styles.intakeProgressFill,
                  { width: `${Math.min((todayTaken / supplement.dosesPerDay) * 100, 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.intakeProgressText}>
              {todayTaken}/{supplement.dosesPerDay}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.intakeActions}>
        {isTaken ? (
          <TouchableOpacity style={styles.undoButton} onPress={onUndo}>
            <Ionicons name="refresh" size={18} color={colors.textMuted} />
            <Text style={styles.undoText}>{t('supplements.tracking.undo')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.logButton} onPress={onLogIntake}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark] as const}
              style={styles.logButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color="#0F0F23" />
              <Text style={styles.logButtonText}>{t('supplements.tracking.logIntake')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {isTaken && (
        <View style={styles.takenBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.takenText}>{t('supplements.tracking.taken')}</Text>
        </View>
      )}
    </View>
  );
};

export default function MySupplementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userSupplements, setUserSupplements] = useState<UserSupplement[]>([]);
  const [todayProgress, setTodayProgress] = useState<Record<string, number>>({});
  const [weeklyDots, setWeeklyDots] = useState<WeeklyDot[]>([]);
  const [stackStats, setStackStats] = useState<{ totalDosesToday: number; takenDosesToday: number; streakDays: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [supplements, progress, dots, stats] = await Promise.all([
        getUserSupplements(),
        getTodayProgress(),
        getWeeklyDots(),
        getStackStats(),
      ]);

      setUserSupplements(supplements);
      setTodayProgress(progress);
      setWeeklyDots(dots);
      setStackStats(stats);
    } catch (error) {
      console.error('Error loading supplement data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleLogIntake = async (supplementId: string) => {
    try {
      await logIntake(supplementId);
      await loadData();
    } catch (error) {
      console.error('Error logging intake:', error);
      Alert.alert(t('common.error'), 'Failed to log intake');
    }
  };

  const handleUndoIntake = async (supplementId: string) => {
    try {
      await undoIntake(supplementId);
      await loadData();
    } catch (error) {
      console.error('Error undoing intake:', error);
      Alert.alert(t('common.error'), 'Failed to undo intake');
    }
  };

  const handleEditSupplement = (supplement: UserSupplement) => {
    router.push({
      pathname: '/supplements/configure-new',
      params: {
        supplementId: supplement.supplementId,
        userSupplementId: supplement.id,
        isEditing: 'true',
      },
    });
  };

  const handleAddSupplement = () => {
    router.push('/supplements/add-new');
  };

  const handleBrowseCatalog = () => {
    router.push('/supplements/library');
  };

  const progressPercent = stackStats
    ? stackStats.totalDosesToday > 0
      ? Math.round((stackStats.takenDosesToday / stackStats.totalDosesToday) * 100)
      : 0
    : 0;

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd] as const}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{t('supplements.mySupplements')}</Text>
            {stackStats && stackStats.streakDays > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color="#FBBF24" />
                <Text style={styles.streakText}>
                  {t('supplements.tracking.streakDays', { count: stackStats.streakDays })}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleBrowseCatalog} style={styles.catalogButton}>
            <Ionicons name="grid-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {userSupplements.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="flask-outline" size={64} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t('supplements.emptyStack')}</Text>
            <Text style={styles.emptySubtitle}>{t('supplements.emptyStackHint')}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleBrowseCatalog}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark] as const}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="add" size={20} color="#0F0F23" />
                <Text style={styles.emptyButtonText}>{t('supplements.browseCatalog')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Today's Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>{t('supplements.tracking.todayProgress')}</Text>
                <View style={styles.progressRingContainer}>
                  <LargeProgressRing
                    progress={progressPercent}
                    taken={stackStats?.takenDosesToday || 0}
                    total={stackStats?.totalDosesToday || 0}
                  />
                </View>
                {progressPercent === 100 ? (
                  <Text style={styles.progressComplete}>
                    {t('supplements.tracking.allDosesTaken')}
                  </Text>
                ) : (
                  <Text style={styles.progressRemaining}>
                    {t('supplements.tracking.dosesTaken', {
                      taken: stackStats?.takenDosesToday || 0,
                      total: stackStats?.totalDosesToday || 0,
                    })}
                  </Text>
                )}
              </View>
            </View>

            {/* Weekly Progress Dots */}
            <View style={styles.weeklySection}>
              <Text style={styles.sectionTitle}>{t('supplements.tracking.weeklyProgress')}</Text>
              <View style={styles.weekDotsContainer}>
                {weeklyDots.map((dot, index) => (
                  <WeekDot key={index} dot={dot} />
                ))}
              </View>
            </View>

            {/* Supplements List */}
            <View style={styles.supplementsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('supplements.myStack')}</Text>
                <Text style={styles.supplementCount}>
                  {userSupplements.length} {userSupplements.length === 1 ? 'supplement' : 'supplements'}
                </Text>
              </View>

              {userSupplements.map((supplement) => (
                <SupplementIntakeCard
                  key={supplement.id}
                  supplement={supplement}
                  todayTaken={todayProgress[supplement.id] || 0}
                  onLogIntake={() => handleLogIntake(supplement.id)}
                  onUndo={() => handleUndoIntake(supplement.id)}
                  onEdit={() => handleEditSupplement(supplement)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {userSupplements.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={handleAddSupplement}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark] as const}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#0F0F23" />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
  },
  catalogButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 20,
  },
  progressRingContainer: {
    marginBottom: 16,
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressComplete: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  progressRemaining: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  weeklySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  weekDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 16,
  },
  weekDotContainer: {
    alignItems: 'center',
    gap: 8,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  weekDayLabelToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  weekDotPartial: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0F0F23',
  },
  supplementsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplementCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  intakeCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  intakeCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  intakeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  intakeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  intakeDosage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  intakeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intakeProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  intakeProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  intakeProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  intakeActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  logButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F0F23',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  undoText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  takenBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  takenText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F0F23',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
