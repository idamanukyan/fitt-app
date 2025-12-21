/**
 * Coach Analytics Screen - Business & client analytics
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const stats: StatCardData[] = [
  {
    title: 'Active Clients',
    value: '12',
    change: '+2 this month',
    changeType: 'positive',
    icon: 'people',
    color: '#4ADE80',
  },
  {
    title: 'Sessions This Week',
    value: '24',
    change: '+8 from last week',
    changeType: 'positive',
    icon: 'calendar',
    color: '#F472B6',
  },
  {
    title: 'Avg. Client Progress',
    value: '87%',
    change: 'Goals on track',
    changeType: 'positive',
    icon: 'trending-up',
    color: '#FBBF24',
  },
  {
    title: 'Messages',
    value: '156',
    change: 'This month',
    changeType: 'neutral',
    icon: 'chatbubble',
    color: '#A78BFA',
  },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();

  const renderStatCard = (stat: StatCardData, index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
        <Ionicons name={stat.icon} size={22} color={stat.color} />
      </View>
      <Text style={styles.statTitle}>{stat.title}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
      <View style={styles.changeRow}>
        {stat.changeType === 'positive' && (
          <Ionicons name="arrow-up" size={12} color="#4ADE80" />
        )}
        {stat.changeType === 'negative' && (
          <Ionicons name="arrow-down" size={12} color="#F87171" />
        )}
        <Text
          style={[
            styles.changeText,
            stat.changeType === 'positive' && { color: '#4ADE80' },
            stat.changeType === 'negative' && { color: '#F87171' },
          ]}
        >
          {stat.change}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your coaching performance</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => renderStatCard(stat, index))}
      </View>

      {/* Quick Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Insights</Text>

        <View style={styles.insightCard}>
          <LinearGradient
            colors={['rgba(74, 222, 128, 0.1)', 'rgba(74, 222, 128, 0.02)']}
            style={styles.insightGradient}
          >
            <View style={styles.insightIcon}>
              <Ionicons name="star" size={24} color="#4ADE80" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Top Performer</Text>
              <Text style={styles.insightText}>
                Sarah Johnson achieved 95% of her goals this month
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.insightCard}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.02)']}
            style={styles.insightGradient}
          >
            <View style={styles.insightIcon}>
              <Ionicons name="alert-circle" size={24} color="#FBBF24" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Attention Needed</Text>
              <Text style={styles.insightText}>
                3 clients haven't logged workouts in 5+ days
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.insightCard}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.1)', 'rgba(167, 139, 250, 0.02)']}
            style={styles.insightGradient}
          >
            <View style={styles.insightIcon}>
              <Ionicons name="trophy" size={24} color="#A78BFA" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Milestone Reached</Text>
              <Text style={styles.insightText}>
                You've trained 100+ sessions this quarter!
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Client Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Activity</Text>

        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Workouts Completed (7d)</Text>
            <Text style={styles.activityValue}>47</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '78%' }]} />
          </View>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Check-ins Submitted</Text>
            <Text style={styles.activityValue}>36</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%', backgroundColor: '#F472B6' }]} />
          </View>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <Text style={styles.activityLabel}>Measurements Logged</Text>
            <Text style={styles.activityValue}>28</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '45%', backgroundColor: '#FBBF24' }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  insightCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
});
