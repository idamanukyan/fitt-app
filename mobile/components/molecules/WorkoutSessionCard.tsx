/**
 * WorkoutSessionCard - Past workout session card with stats
 * High-tech architecture design
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { WorkoutSessionSummary } from '../../types/workout.types';

interface WorkoutSessionCardProps {
  session: WorkoutSessionSummary;
  onPress: () => void;
}

export default function WorkoutSessionCard({ session, onPress }: WorkoutSessionCardProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatVolume = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${kg.toFixed(0)}kg`;
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={12}
        color={theme.colors.techOrange}
      />
    ));
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Background */}
      <LinearGradient
        colors={[theme.colors.concrete, theme.colors.concreteDark]}
        style={styles.background}
      />

      {/* Status Indicator */}
      <View
        style={[
          styles.statusBar,
          {
            backgroundColor: session.is_completed
              ? theme.colors.techGreen
              : theme.colors.techOrange,
          },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {session.title?.toUpperCase() || 'WORKOUT SESSION'}
          </Text>
          <View style={styles.dateRow}>
            <Text style={styles.date}>{formatDate(session.started_at)}</Text>
            <View style={styles.dot} />
            <Text style={styles.time}>{formatTime(session.started_at)}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: session.is_completed
                ? theme.colors.techGreen + '20'
                : theme.colors.techOrange + '20',
            },
          ]}
        >
          <Ionicons
            name={session.is_completed ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={
              session.is_completed ? theme.colors.techGreen : theme.colors.techOrange
            }
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Duration */}
        {session.duration_minutes && (
          <View style={styles.statCard}>
            <Ionicons name="timer-outline" size={18} color={theme.colors.techCyan} />
            <Text style={styles.statValue}>{session.duration_minutes}</Text>
            <Text style={styles.statLabel}>MIN</Text>
          </View>
        )}

        {/* Exercises */}
        <View style={styles.statCard}>
          <Ionicons name="barbell-outline" size={18} color={theme.colors.techBlue} />
          <Text style={styles.statValue}>{session.total_exercises}</Text>
          <Text style={styles.statLabel}>EXERCISES</Text>
        </View>

        {/* Volume */}
        <View style={styles.statCard}>
          <Ionicons name="fitness-outline" size={18} color={theme.colors.techGreen} />
          <Text style={styles.statValue}>{formatVolume(session.total_volume)}</Text>
          <Text style={styles.statLabel}>VOLUME</Text>
        </View>
      </View>

      {/* Rating */}
      {session.rating && (
        <View style={styles.ratingRow}>
          <View style={styles.stars}>{getRatingStars(session.rating)}</View>
        </View>
      )}

      {/* Border */}
      <View
        style={[
          styles.border,
          {
            borderColor: session.is_completed
              ? theme.colors.techGreen + '40'
              : theme.colors.iron + '40',
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  statusBar: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  date: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.iron,
  },
  time: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.steelDark,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    gap: 4,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 1,
  },
  ratingRow: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});
