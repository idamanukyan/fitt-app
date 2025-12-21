/**
 * DashboardScreen - Neon-Brutalist User Dashboard
 * Unified design system matching Login/Register aesthetic
 *
 * Features:
 * - Dynamic date/time with locale support
 * - Real weather data from device location
 * - Dynamic greeting based on time of day
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { goalService } from "../services/goalService";
import { measurementService } from "../services/measurementService";
import type { UserStats, Goal, Measurement } from "../types/api.types";
import theme from "../utils/theme";

// Import new hooks and components
import { useDateTime } from "../hooks/useDateTime";
import { useWeather } from "../hooks/useWeather";
import { WeatherDisplay } from "../components/weather";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [latestMeasurement, setLatestMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Dynamic date/time hook
  const { date, greeting } = useDateTime();

  // Weather hook with geolocation
  const {
    weather,
    isLoading: weatherLoading,
    error: weatherError,
    locationPermission,
    retry: retryWeather,
    requestLocationPermission,
    refresh: refreshWeather,
  } = useWeather();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const [statsData, goalsData, measurementData] = await Promise.allSettled([
        userService.getUserStats(),
        goalService.getActiveGoals(),
        measurementService.getLatestMeasurement().catch(() => null),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (goalsData.status === 'fulfilled') {
        setActiveGoals(goalsData.value.slice(0, 3));
      }
      if (measurementData.status === 'fulfilled') {
        setLatestMeasurement(measurementData.value);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    refreshWeather();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.lightGreen} />
        <Text style={styles.loadingText}>LOADING DASHBOARD...</Text>
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
            tintColor={theme.colors.lightGreen}
            colors={[theme.colors.lightGreen]}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with Dynamic Date, Greeting, and Weather */}
          <View style={styles.header}>
            {/* Top Row: Date and Weather */}
            <View style={styles.headerTopRow}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{date.full.toUpperCase()}</Text>
              </View>
              <WeatherDisplay
                temperature={weather?.temperature ?? null}
                icon={weather?.icon ?? null}
                description={weather?.description}
                cityName={weather?.cityName}
                isLoading={weatherLoading}
                error={weatherError}
                locationPermission={locationPermission}
                onRetry={retryWeather}
                onRequestPermission={requestLocationPermission}
                compact
              />
            </View>

            {/* Greeting and Username */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greeting.toUpperCase()},</Text>
              <Text style={styles.title}>{user?.username.toUpperCase() || 'USER'}</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              LET'S CRUSH YOUR GOALS TODAY
            </Text>
          </View>

          {/* Stats Grid */}
          {stats && (
            <View style={styles.statsGrid}>
              <View style={styles.statCardCyan}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trophy-outline" size={24} color={theme.colors.neonCyan} />
                </View>
                <Text style={styles.statValue}>{stats.active_goals}</Text>
                <Text style={styles.statLabel}>ACTIVE GOALS</Text>
              </View>

              <View style={styles.statCardPink}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="fitness-outline" size={24} color={theme.colors.neonPink} />
                </View>
                <Text style={styles.statValue}>{stats.total_measurements}</Text>
                <Text style={styles.statLabel}>MEASUREMENTS</Text>
              </View>

              <View style={styles.statCardGreen}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.neonGreen} />
                </View>
                <Text style={styles.statValue}>{stats.completed_goals}</Text>
                <Text style={styles.statLabel}>COMPLETED</Text>
              </View>

              <View style={styles.statCardPurple}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color={theme.colors.neonPurple} />
                </View>
                <Text style={styles.statValue}>{stats.member_since_days}</Text>
                <Text style={styles.statLabel}>DAYS ACTIVE</Text>
              </View>
            </View>
          )}

          {/* Latest Measurement */}
          {latestMeasurement && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>LATEST MEASUREMENT</Text>
              <View style={styles.measurementRow}>
                {latestMeasurement.weight && (
                  <View style={styles.measurementItem}>
                    <Ionicons name="scale-outline" size={20} color={theme.colors.darkGray} />
                    <Text style={styles.measurementValue}>{latestMeasurement.weight}</Text>
                    <Text style={styles.measurementUnit}>KG</Text>
                  </View>
                )}
                {latestMeasurement.body_fat_percentage && (
                  <View style={styles.measurementItem}>
                    <Ionicons name="body-outline" size={20} color={theme.colors.darkGray} />
                    <Text style={styles.measurementValue}>{latestMeasurement.body_fat_percentage}</Text>
                    <Text style={styles.measurementUnit}>% BF</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timestamp}>
                {new Date(latestMeasurement.recorded_at).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>ACTIVE GOALS</Text>
              {activeGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title.toUpperCase()}</Text>
                    <Text style={styles.goalPercentage}>
                      {goal.progress_percentage.toFixed(0)}%
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <LinearGradient
                      colors={theme.gradients.neonPrimary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(goal.progress_percentage, 100)}%` },
                      ]}
                    />
                  </View>

                  {goal.current_value !== null && goal.target_value !== null && (
                    <View style={styles.goalValues}>
                      <Text style={styles.goalValueText}>
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Motivational Quote */}
          <View style={styles.quoteCard}>
            <View style={styles.quoteIconContainer}>
              <Ionicons name="flash" size={20} color={theme.colors.lightGreen} />
            </View>
            <Text style={styles.quote}>
              DISCIPLINE BEATS MOTIVATION EVERY TIME.
            </Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/discover')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.gradients.buttonPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="search-outline" size={20} color={theme.colors.black} />
              <Text style={styles.buttonText}>EXPLORE WORKOUTS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: theme.colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.lightGreen,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Header Styles
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techCyan,
    letterSpacing: 2,
  },
  greetingContainer: {
    marginBottom: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 2,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.lightGreen,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  statCardCyan: {
    width: '47%',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.neonCyan,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    shadowColor: theme.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statCardPink: {
    width: '47%',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.neonPink,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    shadowColor: theme.colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statCardGreen: {
    width: '47%',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.neonGreen,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    shadowColor: theme.colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statCardPurple: {
    width: '47%',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.neonPurple,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statIconContainer: {
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: theme.spacing.xs,
  },

  // Card Styles
  card: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}40`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  measurementValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.lightGreen,
  },
  measurementUnit: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    marginTop: theme.spacing.sm,
  },

  // Section Title
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },

  // Goal Card Styles
  goalCard: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}40`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  goalTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    flex: 1,
  },
  goalPercentage: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.lightGreen,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.oliveBlack,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
  },
  goalValues: {
    marginTop: theme.spacing.sm,
  },
  goalValueText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
    fontWeight: '600',
  },

  // Quote Card
  quoteCard: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}40`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quoteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.oliveBlack,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
  },
  quote: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: 1,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
  },

  // CTA Button
  ctaButton: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
