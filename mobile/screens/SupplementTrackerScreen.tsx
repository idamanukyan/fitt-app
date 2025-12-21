/**
 * SupplementTrackerScreen - Personal Supplements Tracker
 *
 * Features:
 * - List of user's supplements with tracking
 * - Weekly tracking dots
 * - Quick log intake
 * - Add/Edit supplements
 * - Local storage persistence
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useSupplements } from '../contexts/SupplementsContext';
import SupplementCard from '../components/supplements/SupplementCard';

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
};

// ============================================================================
// EMPTY STATE
// ============================================================================
function EmptyState({ onAddPress }: { onAddPress: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>💊</Text>
      </View>
      <Text style={styles.emptyTitle}>No Supplements Yet</Text>
      <Text style={styles.emptySubtitle}>
        Track your supplements and never miss a dose. Add your first supplement to get started.
      </Text>
      <TouchableOpacity onPress={onAddPress} activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.primaryGreen, colors.secondaryGreen]}
          style={styles.emptyButton}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.emptyButtonText}>Add Supplement</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// SUPPLEMENT TRACKER SCREEN
// ============================================================================
export default function SupplementTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    supplements,
    loading,
    logIntake,
    getTodayIntakes,
    getWeekIntakes,
    refreshSupplements,
  } = useSupplements();

  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSupplements();
    setRefreshing(false);
  }, [refreshSupplements]);

  // Handle log intake with haptic feedback
  const handleLogIntake = useCallback(async (supplementId: string, supplementName: string) => {
    try {
      await logIntake(supplementId);
      // Show success feedback
      Alert.alert(
        'Logged!',
        `${supplementName} intake recorded`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Failed to log intake:', error);
      Alert.alert('Error', 'Failed to log intake. Please try again.');
    }
  }, [logIntake]);

  // Navigate to add supplement
  const navigateToAdd = () => {
    router.push('/supplements/add');
  };

  // Navigate to edit supplement
  const navigateToEdit = (supplementId: string) => {
    router.push(`/supplements/configure?id=${supplementId}`);
  };

  // Calculate today's stats
  const todayStats = supplements.reduce(
    (acc, sup) => {
      const intakes = getTodayIntakes(sup.id);
      const dosesNeeded = sup.dosesPerDay || 1;
      acc.total += dosesNeeded;
      acc.taken += Math.min(intakes.length, dosesNeeded);
      return acc;
    },
    { total: 0, taken: 0 }
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplements</Text>
        <TouchableOpacity
          onPress={navigateToAdd}
          style={styles.addButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
      </View>

      {/* Today's Progress Card */}
      {supplements.length > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressValue}>
              {todayStats.taken}/{todayStats.total} doses taken
            </Text>
          </View>
          <View style={styles.progressRing}>
            <View style={[
              styles.progressRingInner,
              {
                borderColor: todayStats.total > 0 && todayStats.taken >= todayStats.total
                  ? colors.primaryGreen
                  : colors.textMuted,
              },
            ]}>
              <Text style={styles.progressPercent}>
                {todayStats.total > 0
                  ? Math.round((todayStats.taken / todayStats.total) * 100)
                  : 0}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primaryGreen}
            colors={[colors.primaryGreen]}
          />
        }
      >
        {supplements.length === 0 && !loading ? (
          <EmptyState onAddPress={navigateToAdd} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>MY SUPPLEMENTS</Text>
            {supplements.map((supplement) => (
              <SupplementCard
                key={supplement.id}
                supplement={supplement}
                todayIntakes={getTodayIntakes(supplement.id)}
                weekIntakes={getWeekIntakes(supplement.id)}
                onPress={() => navigateToEdit(supplement.id)}
                onLogIntake={() => handleLogIntake(supplement.id, supplement.name)}
              />
            ))}
          </>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      {/* Floating Add Button (when not empty) */}
      {supplements.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={navigateToAdd}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primaryGreen, colors.secondaryGreen]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={colors.background} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.greenMuted,
    borderRadius: 20,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressRing: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.greenMuted,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
