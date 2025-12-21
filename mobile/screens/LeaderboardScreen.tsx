/**
 * LeaderboardScreen - Top users by level and XP
 * High-tech architecture design with podium visualization
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../utils/theme';
import achievementService from '../services/achievementService';
import { LeaderboardEntry } from '../types/achievement.types';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadLeaderboard();
    loadCurrentUserId();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await achievementService.getLeaderboard(50);
      setLeaderboard(response.entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return theme.colors.techOrange; // Gold
      case 2:
        return theme.colors.steel; // Silver
      case 3:
        return theme.colors.techCyan; // Bronze
      default:
        return theme.colors.steelDark;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return 'person';
  };

  if (isLoading && leaderboard.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

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
        <Text style={styles.headerTitle}>LEADERBOARD</Text>
        <View style={{ width: 40 }} />
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
        {/* Podium - Top 3 */}
        {topThree.length >= 3 && (
          <Animated.View style={[styles.podiumSection, { opacity: fadeAnim }]}>
            <View style={styles.podiumContainer}>
              {/* 2nd Place */}
              <View style={[styles.podiumRank, styles.secondPlace]}>
                <View style={[styles.podiumIcon, { backgroundColor: theme.colors.steel }]}>
                  <Ionicons name="medal" size={32} color={theme.colors.black} />
                </View>
                <Text style={styles.podiumUsername} numberOfLines={1}>
                  {topThree[1].username}
                </Text>
                <Text style={styles.podiumLevel}>LVL {topThree[1].level}</Text>
                <Text style={styles.podiumXP}>{topThree[1].total_xp.toLocaleString()} XP</Text>
                <View style={[styles.podiumBar, styles.podiumBarSecond]} />
              </View>

              {/* 1st Place */}
              <View style={[styles.podiumRank, styles.firstPlace]}>
                <View style={[styles.podiumIcon, { backgroundColor: theme.colors.techOrange }]}>
                  <Ionicons name="trophy" size={40} color={theme.colors.black} />
                </View>
                <Text style={styles.podiumUsername} numberOfLines={1}>
                  {topThree[0].username}
                </Text>
                <Text style={styles.podiumLevel}>LVL {topThree[0].level}</Text>
                <Text style={styles.podiumXP}>{topThree[0].total_xp.toLocaleString()} XP</Text>
                <View style={[styles.podiumBar, styles.podiumBarFirst]} />
              </View>

              {/* 3rd Place */}
              <View style={[styles.podiumRank, styles.thirdPlace]}>
                <View style={[styles.podiumIcon, { backgroundColor: theme.colors.techCyan }]}>
                  <Ionicons name="ribbon" size={28} color={theme.colors.black} />
                </View>
                <Text style={styles.podiumUsername} numberOfLines={1}>
                  {topThree[2].username}
                </Text>
                <Text style={styles.podiumLevel}>LVL {topThree[2].level}</Text>
                <Text style={styles.podiumXP}>{topThree[2].total_xp.toLocaleString()} XP</Text>
                <View style={[styles.podiumBar, styles.podiumBarThird]} />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Rest of Leaderboard */}
        <Animated.View style={[styles.listSection, { opacity: fadeAnim }]}>
          {restOfList.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId;

            return (
              <View
                key={entry.user_id}
                style={[
                  styles.leaderboardCard,
                  isCurrentUser && styles.currentUserCard,
                ]}
              >
                {isCurrentUser && (
                  <LinearGradient
                    colors={[theme.colors.techBlue, theme.colors.techCyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.currentUserGradient}
                  />
                )}

                {/* Rank */}
                <View style={styles.rankBadge}>
                  <Text
                    style={[
                      styles.rankText,
                      isCurrentUser && styles.currentUserRankText,
                    ]}
                  >
                    #{entry.rank}
                  </Text>
                </View>

                {/* User Icon */}
                <View
                  style={[
                    styles.userIcon,
                    isCurrentUser && styles.currentUserIcon,
                  ]}
                >
                  <Ionicons
                    name={getRankIcon(entry.rank)}
                    size={24}
                    color={isCurrentUser ? theme.colors.black : getRankColor(entry.rank)}
                  />
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.username,
                      isCurrentUser && styles.currentUserUsername,
                    ]}
                    numberOfLines={1}
                  >
                    {entry.username}
                    {isCurrentUser && ' (YOU)'}
                  </Text>
                  <Text
                    style={[
                      styles.userStats,
                      isCurrentUser && styles.currentUserStats,
                    ]}
                  >
                    Level {entry.level} • {entry.total_xp.toLocaleString()} XP
                  </Text>
                </View>

                {/* Level Badge */}
                <View
                  style={[
                    styles.levelBadge,
                    isCurrentUser && styles.currentUserLevelBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelText,
                      isCurrentUser && styles.currentUserLevelText,
                    ]}
                  >
                    {entry.level}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {leaderboard.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={theme.colors.steelDark} />
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to climb the leaderboard!
            </Text>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  podiumSection: {
    marginBottom: theme.spacing.xl,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: 280,
  },
  podiumRank: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  firstPlace: {
    marginBottom: 40,
  },
  secondPlace: {
    marginBottom: 20,
  },
  thirdPlace: {
    marginBottom: 0,
  },
  podiumIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.black,
    marginBottom: 8,
  },
  podiumUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  podiumLevel: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  podiumXP: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.steel,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    marginTop: 8,
    borderWidth: 2,
    borderColor: theme.colors.iron,
  },
  podiumBarFirst: {
    height: 120,
    backgroundColor: theme.colors.techOrange,
  },
  podiumBarSecond: {
    height: 90,
    backgroundColor: theme.colors.steel,
  },
  podiumBarThird: {
    height: 60,
    backgroundColor: theme.colors.techCyan,
  },
  listSection: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: theme.colors.techBlue,
  },
  currentUserGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.concreteDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.steel,
  },
  currentUserRankText: {
    color: theme.colors.techBlue,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concreteDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  currentUserIcon: {
    backgroundColor: theme.colors.techBlue,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  currentUserUsername: {
    color: theme.colors.techBlue,
  },
  userStats: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.steel,
  },
  currentUserStats: {
    color: theme.colors.techCyan,
  },
  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  currentUserLevelBadge: {
    backgroundColor: theme.colors.techBlue,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.steel,
  },
  currentUserLevelText: {
    color: theme.colors.black,
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
