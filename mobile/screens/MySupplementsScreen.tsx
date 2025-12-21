/**
 * MySupplementsScreen - User's active supplement schedule
 * Accessible from SupplementsScreen or Dashboard
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import SupplementCard from '../components/molecules/SupplementCard';
import {
  UserSupplement,
  TodaysSupplementsResponse,
  SupplementStatsResponse,
  getTimingLabel,
  getFrequencyLabel,
} from '../types/supplement';
import { supplementService } from '../services/supplementService';

export default function MySupplementsScreen() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<UserSupplement[]>([]);
  const [todaysSchedule, setTodaysSchedule] = useState<TodaysSupplementsResponse | null>(null);
  const [stats, setStats] = useState<SupplementStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supplementsData, todayData, statsData] = await Promise.all([
        supplementService.user.getMySupplements(true),
        supplementService.user.getTodaysSupplements(),
        supplementService.intake.getStats(7),
      ]);
      setSupplements(supplementsData);
      setTodaysSchedule(todayData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading supplements:', error);
      Alert.alert('Error', 'Failed to load supplements');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAsTaken = async (userSupplementId: number, dosage?: number) => {
    try {
      await supplementService.intake.markAsTaken(userSupplementId, dosage);
      await loadData(); // Reload to update UI
      Alert.alert('Success', 'Supplement marked as taken');
    } catch (error) {
      console.error('Error marking supplement:', error);
      Alert.alert('Error', 'Failed to mark supplement as taken');
    }
  };

  const handleMarkAsSkipped = async (userSupplementId: number) => {
    try {
      await supplementService.intake.markAsSkipped(userSupplementId, 'User skipped');
      await loadData();
      Alert.alert('Success', 'Supplement marked as skipped');
    } catch (error) {
      console.error('Error marking supplement:', error);
      Alert.alert('Error', 'Failed to mark supplement as skipped');
    }
  };

  const handleSupplementPress = (supplement: UserSupplement) => {
    router.push(`/supplements/${supplement.supplement_id}`);
  };

  const handleAddSupplement = () => {
    router.push('/supplements');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>LOADING YOUR SUPPLEMENTS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techBlue}
            colors={[theme.colors.techBlue]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MY SUPPLEMENTS</Text>
          <Text style={styles.subtitle}>TRACK YOUR NUTRITION</Text>
        </View>

        {/* Stats Card */}
        {stats && (
          <View style={styles.statsCard}>
            <LinearGradient
              colors={theme.gradients.cardGlow}
              style={styles.statsGradient}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.active_supplements}</Text>
                  <Text style={styles.statLabel}>ACTIVE</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(stats.compliance_rate)}%</Text>
                  <Text style={styles.statLabel}>COMPLIANCE</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.doses_taken_this_week}</Text>
                  <Text style={styles.statLabel}>THIS WEEK</Text>
                </View>
              </View>

              {stats.low_stock_alerts.length > 0 && (
                <View style={styles.alertContainer}>
                  <Ionicons name="warning" size={16} color={theme.colors.techOrange} />
                  <Text style={styles.alertText}>
                    {stats.low_stock_alerts.length} supplement{stats.low_stock_alerts.length > 1 ? 's' : ''} low on stock
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'today' && styles.tabActive]}
            onPress={() => setActiveTab('today')}
            activeOpacity={0.7}
          >
            {activeTab === 'today' ? (
              <LinearGradient
                colors={theme.gradients.buttonPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <Text style={styles.tabTextActive}>TODAY</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>TODAY</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
          >
            {activeTab === 'all' ? (
              <LinearGradient
                colors={theme.gradients.buttonPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <Text style={styles.tabTextActive}>ALL SUPPLEMENTS</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>ALL SUPPLEMENTS</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Today's Schedule */}
        {activeTab === 'today' && todaysSchedule && (
          <View style={styles.todayContent}>
            {/* Scheduled Doses */}
            {todaysSchedule.scheduled.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SCHEDULED</Text>
                {todaysSchedule.scheduled.map((item) => (
                  <View key={item.id} style={styles.doseCard}>
                    <View style={styles.doseInfo}>
                      <Text style={styles.doseName}>{item.supplement.name}</Text>
                      <Text style={styles.doseDetails}>
                        {item.dosage} {item.dosage_unit} • {getTimingLabel(item.timing as any)}
                      </Text>
                      {item.specific_time && (
                        <Text style={styles.doseTime}>{item.specific_time}</Text>
                      )}
                    </View>
                    <View style={styles.doseActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMarkAsTaken(item.id, item.dosage)}
                      >
                        <Ionicons name="checkmark-circle" size={32} color={theme.colors.techGreen} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMarkAsSkipped(item.id)}
                      >
                        <Ionicons name="close-circle" size={32} color={theme.colors.techOrange} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Taken Doses */}
            {todaysSchedule.taken.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>COMPLETED</Text>
                {todaysSchedule.taken.map((item) => (
                  <View key={item.id} style={styles.doseCardCompleted}>
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.techGreen} />
                    <View style={styles.doseInfo}>
                      <Text style={styles.doseNameCompleted}>{item.supplement.name}</Text>
                      <Text style={styles.doseDetails}>
                        {item.dosage} {item.dosage_unit} • {getTimingLabel(item.timing as any)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Upcoming Doses */}
            {todaysSchedule.upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>UPCOMING</Text>
                {todaysSchedule.upcoming.map((item) => (
                  <View key={item.id} style={styles.doseCardUpcoming}>
                    <Ionicons name="time-outline" size={20} color={theme.colors.darkGray} />
                    <View style={styles.doseInfo}>
                      <Text style={styles.doseNameUpcoming}>{item.supplement.name}</Text>
                      <Text style={styles.doseDetails}>
                        {item.dosage} {item.dosage_unit} • {getTimingLabel(item.timing as any)}
                      </Text>
                      {item.specific_time && (
                        <Text style={styles.doseTime}>{item.specific_time}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {todaysSchedule.scheduled.length === 0 &&
              todaysSchedule.taken.length === 0 &&
              todaysSchedule.upcoming.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color={theme.colors.darkGray} />
                  <Text style={styles.emptyText}>No supplements scheduled for today</Text>
                  <Text style={styles.emptySubtext}>Add supplements to your schedule to track your intake</Text>
                </View>
              )}
          </View>
        )}

        {/* All Supplements */}
        {activeTab === 'all' && (
          <View style={styles.allContent}>
            {supplements.length > 0 ? (
              supplements.map((userSupplement) => (
                <View key={userSupplement.id} style={styles.supplementItem}>
                  {userSupplement.supplement && (
                    <SupplementCard
                      supplement={userSupplement.supplement}
                      onPress={() => handleSupplementPress(userSupplement)}
                      variant="compact"
                    />
                  )}
                  <View style={styles.supplementMeta}>
                    <Text style={styles.supplementSchedule}>
                      {getFrequencyLabel(userSupplement.frequency)} • {getTimingLabel(userSupplement.timing)}
                    </Text>
                    {userSupplement.remaining_stock !== undefined && userSupplement.total_stock && (
                      <Text style={styles.supplementStock}>
                        Stock: {userSupplement.remaining_stock}/{userSupplement.total_stock}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="flask-outline" size={64} color={theme.colors.darkGray} />
                <Text style={styles.emptyText}>No supplements added yet</Text>
                <Text style={styles.emptySubtext}>Browse the supplement library to get started</Text>
              </View>
            )}
          </View>
        )}

        {/* Add Supplement Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSupplement}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color={theme.colors.white} />
            <Text style={styles.addButtonText}>ADD SUPPLEMENT</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    padding: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 3,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 2,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.concrete,
  },
  statsGradient: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
    borderRadius: theme.borderRadius.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(176, 184, 193, 0.2)',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(176, 184, 193, 0.15)',
    gap: theme.spacing.sm,
  },
  alertText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techOrange,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.concreteLight,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  tabActive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  tabGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tabText: {
    paddingVertical: theme.spacing.md,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 1,
  },
  tabTextActive: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  todayContent: {
    marginBottom: theme.spacing.lg,
  },
  allContent: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
  },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.concreteLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  doseCardCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    gap: theme.spacing.md,
  },
  doseCardUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(176, 184, 193, 0.05)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.1)',
    gap: theme.spacing.md,
  },
  doseInfo: {
    flex: 1,
  },
  doseName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  doseNameCompleted: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.techGreen,
  },
  doseNameUpcoming: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  doseDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
    fontWeight: '500',
  },
  doseTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.techBlue,
    fontWeight: '600',
    marginTop: 2,
  },
  doseActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  supplementItem: {
    marginBottom: theme.spacing.md,
  },
  supplementMeta: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  supplementSchedule: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    fontWeight: '600',
    marginBottom: 2,
  },
  supplementStock: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.steelDark,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: theme.spacing.lg,
    ...theme.shadows.techBlueGlow,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});
