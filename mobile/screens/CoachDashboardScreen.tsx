/**
 * CoachDashboardScreen - Neon-Brutalist Coach Dashboard
 * Team management focus with Caribbean Green accent
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
import theme from "../utils/theme";
import ClientCard from "../components/molecules/ClientCard";
import ChartWidget from "../components/atoms/ChartWidget";

// Mock client data (will be replaced with API calls later)
const mockClients = [
  { id: 1, name: "John Doe", lastActive: "Active 2h ago", progress: 75 },
  { id: 2, name: "Jane Smith", lastActive: "Active 5h ago", progress: 62 },
  { id: 3, name: "Mike Johnson", lastActive: "Active 1d ago", progress: 88 },
  { id: 4, name: "Sarah Williams", lastActive: "Active 3h ago", progress: 45 },
  { id: 5, name: "David Brown", lastActive: "Active 6h ago", progress: 91 },
  { id: 6, name: "Emma Davis", lastActive: "Active 2d ago", progress: 58 },
];

export default function CoachDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Mock stats
  const stats = {
    totalClients: 28,
    activeToday: 14,
    sessionsThisWeek: 42,
    avgProgress: 87,
  };

  // Mock weekly sessions data
  const weeklySessionsData = [12, 15, 18, 14, 20, 16, 10];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Mock performance data
  const performanceData = [65, 70, 68, 75, 72, 80, 87];
  const performanceLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];

  useEffect(() => {
    if (isAuthenticated) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    // Fetch data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleClientPress = (clientId: number) => {
    // Navigate to client detail view
    console.log('Client pressed:', clientId);
  };

  const handleMessageAll = () => {
    router.push('/(tabs)/chat');
  };

  const handleAddClient = () => {
    console.log('Add client pressed');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>COACH DASHBOARD</Text>
            <Text style={styles.subtitle}>
              WELCOME BACK, {user?.username.toUpperCase() || 'COACH'}
            </Text>
          </View>

          {/* Overview Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[
              styles.statCard,
              {
                borderColor: theme.colors.neonCyan,
                shadowColor: theme.colors.neonCyan,
              }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people-outline" size={24} color={theme.colors.neonCyan} />
              </View>
              <Text style={styles.statValue}>{stats.totalClients}</Text>
              <Text style={styles.statLabel}>TOTAL CLIENTS</Text>
            </View>

            <View style={[
              styles.statCard,
              {
                borderColor: theme.colors.neonOrange,
                shadowColor: theme.colors.neonOrange,
              }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame-outline" size={24} color={theme.colors.neonOrange} />
              </View>
              <Text style={styles.statValue}>{stats.activeToday}</Text>
              <Text style={styles.statLabel}>ACTIVE TODAY</Text>
            </View>

            <View style={[
              styles.statCard,
              {
                borderColor: theme.colors.neonPink,
                shadowColor: theme.colors.neonPink,
              }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.neonPink} />
              </View>
              <Text style={styles.statValue}>{stats.sessionsThisWeek}</Text>
              <Text style={styles.statLabel}>SESSIONS THIS WEEK</Text>
            </View>

            <View style={[
              styles.statCard,
              {
                borderColor: theme.colors.neonGreen,
                shadowColor: theme.colors.neonGreen,
              }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up-outline" size={24} color={theme.colors.neonGreen} />
              </View>
              <Text style={styles.statValue}>{stats.avgProgress}%</Text>
              <Text style={styles.statLabel}>AVG PROGRESS</Text>
            </View>
          </View>

          {/* Client Grid */}
          <Text style={styles.sectionTitle}>YOUR CLIENTS</Text>
          <View style={styles.clientGrid}>
            {mockClients.map((client) => (
              <ClientCard
                key={client.id}
                clientName={client.name}
                lastActive={client.lastActive}
                progress={client.progress}
                onPress={() => handleClientPress(client.id)}
              />
            ))}
          </View>

          {/* Weekly Schedule Chart */}
          <ChartWidget
            title="SESSIONS THIS WEEK"
            data={weeklySessionsData}
            labels={weeklyLabels}
            type="bar"
            showValues={true}
          />

          {/* Performance Analytics */}
          <ChartWidget
            title="CLIENT PROGRESS TREND"
            data={performanceData}
            labels={performanceLabels}
            type="line"
            suffix="%"
          />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleMessageAll} activeOpacity={0.8}>
              <LinearGradient
                colors={theme.gradients.buttonPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.black} />
                <Text style={styles.actionButtonText}>MESSAGE ALL</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonOutline} onPress={handleAddClient} activeOpacity={0.8}>
              <View style={styles.actionButtonOutlineContent}>
                <Ionicons name="person-add-outline" size={20} color={theme.colors.lightGreen} />
                <Text style={styles.actionButtonTextOutline}>ADD CLIENT</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Motivational Quote */}
          <View style={styles.quoteCard}>
            <View style={styles.quoteIconContainer}>
              <Ionicons name="flash" size={20} color={theme.colors.lightGreen} />
            </View>
            <Text style={styles.quote}>
              GREAT COACHES INSPIRE GREATNESS IN OTHERS.
            </Text>
          </View>
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
  header: {
    marginBottom: theme.spacing['3xl'],
  },
  title: {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.lightGreen,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing['2xl'],
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionButtonOutline: {
    flex: 1,
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonOutlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButtonTextOutline: {
    color: theme.colors.lightGreen,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  quoteCard: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.lightGreenBorder,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quoteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkGreen,
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
});
