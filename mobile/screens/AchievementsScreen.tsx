/**
 * AchievementsScreen - Main achievements hub with stats and categories
 * High-tech architecture design
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import achievementService from '../services/achievementService';
import {
  UserAchievement,
  UserStats,
  AchievementCategory,
} from '../types/achievement.types';
import LevelCard from '../components/molecules/LevelCard';
import StreakCard from '../components/molecules/StreakCard';
import AchievementCard from '../components/molecules/AchievementCard';

type FilterStatus = 'all' | 'unlocked' | 'locked';

export default function AchievementsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [achievements, selectedCategory, selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stats, achievementsList] = await Promise.all([
        achievementService.getUserStats(),
        achievementService.getAchievements(),
      ]);
      setUserStats(stats);
      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...achievements];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = achievementService.filterAchievementsByCategory(filtered, selectedCategory);
    }

    // Filter by status
    filtered = achievementService.filterAchievementsByStatus(filtered, selectedStatus);

    setFilteredAchievements(filtered);
  };

  const categories = [
    { key: 'all', label: 'ALL', icon: 'grid' },
    { key: AchievementCategory.WORKOUT, label: 'WORKOUT', icon: 'barbell' },
    { key: AchievementCategory.NUTRITION, label: 'NUTRITION', icon: 'nutrition' },
    { key: AchievementCategory.CONSISTENCY, label: 'STREAK', icon: 'flame' },
    { key: AchievementCategory.SOCIAL, label: 'SOCIAL', icon: 'people' },
    { key: AchievementCategory.PROGRESS, label: 'PROGRESS', icon: 'trending-up' },
  ];

  const statusFilters = [
    { key: 'all', label: 'ALL' },
    { key: 'unlocked', label: 'UNLOCKED' },
    { key: 'locked', label: 'LOCKED' },
  ];

  if (isLoading && !userStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[theme.colors.black, theme.colors.concreteDark, theme.colors.concrete]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/LeaderboardScreen' as any)}
          style={styles.leaderboardButton}
        >
          <Ionicons name="trophy" size={24} color={theme.colors.techOrange} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techBlue}
            colors={[theme.colors.techBlue]}
          />
        }
      >
        {/* User Stats Cards */}
        {userStats && (
          <View style={styles.statsSection}>
            <LevelCard userLevel={userStats.level} />

            <View style={styles.statsRow}>
              <StreakCard streak={userStats.streak} />
            </View>

            {/* Achievements Summary */}
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={[theme.colors.concrete, theme.colors.concreteLight]}
                style={styles.summaryBackground}
              />
              <View style={styles.summaryContent}>
                <Ionicons name="ribbon" size={32} color={theme.colors.techGreen} />
                <View style={styles.summaryText}>
                  <Text style={styles.summaryValue}>
                    {userStats.unlocked_achievements} / {userStats.total_achievements}
                  </Text>
                  <Text style={styles.summaryLabel}>ACHIEVEMENTS UNLOCKED</Text>
                </View>
                <Text style={styles.summaryPercentage}>
                  {Math.round(userStats.achievements_percentage)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Tabs */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.key && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.key as any)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={
                    selectedCategory === category.key
                      ? theme.colors.black
                      : theme.colors.steel
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.key && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status Filter */}
        <View style={styles.statusFilterSection}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.statusFilterButton,
                selectedStatus === filter.key && styles.statusFilterActive,
              ]}
              onPress={() => setSelectedStatus(filter.key as FilterStatus)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === filter.key && styles.statusFilterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements Grid */}
        <View style={styles.achievementsSection}>
          {filteredAchievements.length > 0 ? (
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map((userAchievement) => (
                <AchievementCard
                  key={userAchievement.id}
                  userAchievement={userAchievement}
                  onPress={() =>
                    router.push({
                      pathname: '/screens/AchievementDetailScreen',
                      params: { achievementId: userAchievement.achievement.id },
                    } as any)
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={theme.colors.steelDark} />
              <Text style={styles.emptyText}>No achievements found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or start completing activities!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: theme.colors.black,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  leaderboardButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  statsSection: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  summaryCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  summaryBackground: {
    padding: theme.spacing.lg,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryText: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.techGreen,
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryScroll: {
    gap: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    backgroundColor: theme.colors.concreteDark,
  },
  categoryTabActive: {
    backgroundColor: theme.colors.techBlue,
    borderColor: theme.colors.techBlue,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTextActive: {
    color: theme.colors.black,
  },
  statusFilterSection: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statusFilterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    backgroundColor: theme.colors.concreteDark,
    alignItems: 'center',
  },
  statusFilterActive: {
    backgroundColor: theme.colors.techGreen,
    borderColor: theme.colors.techGreen,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusFilterTextActive: {
    color: theme.colors.black,
  },
  achievementsSection: {
    marginBottom: theme.spacing.xl,
  },
  achievementsGrid: {
    gap: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.steelDark,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});
