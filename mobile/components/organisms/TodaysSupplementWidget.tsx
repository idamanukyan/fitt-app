/**
 * TodaysSupplementWidget - Dashboard widget for today's supplements
 * Shows scheduled doses and quick actions
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../../utils/theme';
import {
  TodaysSupplementsResponse,
  TodaysSupplementInfo,
  getTimingLabel,
} from '../../types/supplement';
import { supplementService } from '../../services/supplementService';

interface TodaysSupplementWidgetProps {
  onRefresh?: () => void;
}

export default function TodaysSupplementWidget({ onRefresh }: TodaysSupplementWidgetProps) {
  const router = useRouter();
  const [data, setData] = useState<TodaysSupplementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await supplementService.user.getTodaysSupplements();
      setData(response);
    } catch (error) {
      console.error('Error loading today\'s supplements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    onRefresh?.();
  };

  const handleMarkAsTaken = async (userSupplementId: number, dosage?: number) => {
    try {
      await supplementService.intake.markAsTaken(userSupplementId, dosage);
      await loadData();
      Alert.alert('Success', 'Supplement marked as taken');
    } catch (error) {
      console.error('Error marking supplement:', error);
      Alert.alert('Error', 'Failed to mark supplement as taken');
    }
  };

  const handleViewAll = () => {
    router.push('/my-supplements');
  };

  const handleAddSupplement = () => {
    router.push('/supplements');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.gradients.cardGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.techBlue} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  const scheduledCount = data?.scheduled.length || 0;
  const takenCount = data?.taken.length || 0;
  const upcomingCount = data?.upcoming.length || 0;
  const totalCount = scheduledCount + takenCount + upcomingCount;

  if (totalCount === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.gradients.cardGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="medkit" size={20} color={theme.colors.techBlue} />
              <Text style={styles.title}>TODAY'S SUPPLEMENTS</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh}>
              <Ionicons
                name="refresh"
                size={20}
                color={theme.colors.darkGray}
                style={refreshing ? styles.rotating : undefined}
              />
            </TouchableOpacity>
          </View>

          {/* Empty State */}
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={48} color={theme.colors.darkGray} />
            <Text style={styles.emptyText}>No supplements scheduled</Text>
            <TouchableOpacity
              style={styles.addButtonSmall}
              onPress={handleAddSupplement}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradients.buttonPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={16} color={theme.colors.white} />
                <Text style={styles.addButtonText}>ADD SUPPLEMENTS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const completionRate =
    totalCount > 0 ? Math.round((takenCount / (takenCount + scheduledCount)) * 100) : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.cardGlow}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="medkit" size={20} color={theme.colors.techBlue} />
            <Text style={styles.title}>TODAY'S SUPPLEMENTS</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons
              name="refresh"
              size={20}
              color={theme.colors.darkGray}
              style={refreshing ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {takenCount} of {takenCount + scheduledCount} completed
            </Text>
            <Text style={styles.progressPercent}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={theme.gradients.buttonPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${completionRate}%` }]}
            />
          </View>
        </View>

        {/* Scheduled Supplements */}
        {data && data.scheduled.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SCHEDULED NOW</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {data.scheduled.map((item) => (
                <SupplementDoseCard
                  key={item.id}
                  item={item}
                  onMarkAsTaken={() => handleMarkAsTaken(item.id, item.dosage)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Taken Supplements */}
        {data && data.taken.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMPLETED</Text>
            <View style={styles.takenList}>
              {data.taken.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.takenItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.techGreen} />
                  <Text style={styles.takenText} numberOfLines={1}>
                    {item.supplement.name}
                  </Text>
                </View>
              ))}
              {data.taken.length > 3 && (
                <Text style={styles.moreText}>+{data.taken.length - 3} more</Text>
              )}
            </View>
          </View>
        )}

        {/* Upcoming Supplements */}
        {data && data.upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPCOMING</Text>
            <View style={styles.upcomingList}>
              {data.upcoming.slice(0, 2).map((item) => (
                <View key={item.id} style={styles.upcomingItem}>
                  <Text style={styles.upcomingName} numberOfLines={1}>
                    {item.supplement.name}
                  </Text>
                  <Text style={styles.upcomingTime}>
                    {item.specific_time || getTimingLabel(item.timing as any)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* View All Button */}
        <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>VIEW ALL SUPPLEMENTS</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.techBlue} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

interface SupplementDoseCardProps {
  item: TodaysSupplementInfo;
  onMarkAsTaken: () => void;
}

function SupplementDoseCard({ item, onMarkAsTaken }: SupplementDoseCardProps) {
  return (
    <View style={styles.doseCard}>
      <View style={styles.doseHeader}>
        <Text style={styles.doseName} numberOfLines={2}>
          {item.supplement.name}
        </Text>
        <Text style={styles.doseTiming}>{getTimingLabel(item.timing as any)}</Text>
      </View>
      <View style={styles.doseBody}>
        <View style={styles.doseAmount}>
          <Ionicons name="flask" size={16} color={theme.colors.techBlue} />
          <Text style={styles.doseAmountText}>
            {item.dosage} {item.dosage_unit}
          </Text>
        </View>
        {item.specific_time && (
          <View style={styles.doseTime}>
            <Ionicons name="time" size={14} color={theme.colors.darkGray} />
            <Text style={styles.doseTimeText}>{item.specific_time}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.takeButton}
        onPress={onMarkAsTaken}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.takeButtonGradient}
        >
          <Ionicons name="checkmark" size={16} color={theme.colors.white} />
          <Text style={styles.takeButtonText}>TAKE</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
    ...theme.shadows.concrete,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  rotating: {
    // Add rotation animation in production
  },
  progressSection: {
    marginBottom: theme.spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  progressPercent: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    paddingRight: theme.spacing.lg,
  },
  doseCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    width: 180,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  doseHeader: {
    marginBottom: theme.spacing.sm,
  },
  doseName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 2,
    height: 36,
  },
  doseTiming: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    textTransform: 'uppercase',
  },
  doseBody: {
    marginBottom: theme.spacing.sm,
  },
  doseAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  doseAmountText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
  doseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doseTimeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
  },
  takeButton: {
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  takeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: 4,
  },
  takeButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  takenList: {
    gap: theme.spacing.xs,
  },
  takenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  takenText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.techGreen,
    flex: 1,
  },
  moreText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  upcomingList: {
    gap: theme.spacing.xs,
  },
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  upcomingName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    flex: 1,
  },
  upcomingTime: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginLeft: theme.spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(176, 184, 193, 0.15)',
    gap: theme.spacing.xs,
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addButtonSmall: {
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
});
