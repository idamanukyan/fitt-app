/**
 * AchievementCard - Display achievement with progress
 * High-tech architecture design
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { UserAchievement } from '../../types/achievement.types';

interface AchievementCardProps {
  userAchievement: UserAchievement;
  onPress: () => void;
}

export default function AchievementCard({ userAchievement, onPress }: AchievementCardProps) {
  const { achievement, is_unlocked, current_progress, progress_percentage } = userAchievement;

  const getCategoryColor = () => {
    switch (achievement.category) {
      case 'workout':
        return theme.colors.techBlue;
      case 'nutrition':
        return theme.colors.techGreen;
      case 'consistency':
        return theme.colors.techOrange;
      case 'social':
        return theme.colors.neonPurple;
      case 'progress':
        return theme.colors.techCyan;
      default:
        return theme.colors.steel;
    }
  };

  const categoryColor = achievement.color || getCategoryColor();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Background */}
      <LinearGradient
        colors={
          is_unlocked
            ? [theme.colors.concrete, theme.colors.concreteLight]
            : [theme.colors.concreteDark, theme.colors.black]
        }
        style={styles.background}
      />

      {/* Border Accent */}
      <View
        style={[
          styles.borderAccent,
          { backgroundColor: categoryColor },
          !is_unlocked && styles.lockedBorder,
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Icon Section */}
        <View style={styles.iconSection}>
          <View
            style={[
              styles.iconContainer,
              is_unlocked && { backgroundColor: categoryColor },
              !is_unlocked && styles.lockedIconBg,
            ]}
          >
            <Ionicons
              name={achievement.icon_name as any}
              size={32}
              color={is_unlocked ? theme.colors.black : theme.colors.steelDark}
            />
          </View>

          {/* Unlock Status Badge */}
          {is_unlocked ? (
            <View style={[styles.statusBadge, { backgroundColor: categoryColor }]}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.black} />
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <Ionicons name="lock-closed" size={16} color={theme.colors.steelDark} />
            </View>
          )}
        </View>

        {/* Achievement Info */}
        <View style={styles.infoSection}>
          <Text
            style={[styles.name, !is_unlocked && styles.lockedText]}
            numberOfLines={2}
          >
            {achievement.name.toUpperCase()}
          </Text>

          <Text
            style={[styles.description, !is_unlocked && styles.lockedText]}
            numberOfLines={2}
          >
            {achievement.description}
          </Text>

          {/* Progress Bar (only if locked) */}
          {!is_unlocked && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress_percentage}%`, backgroundColor: categoryColor },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {current_progress} / {achievement.target_value}
              </Text>
            </View>
          )}

          {/* XP Reward Badge */}
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={12} color={theme.colors.techOrange} />
            <Text style={[styles.xpText, !is_unlocked && styles.lockedText]}>
              {achievement.xp_reward} XP
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
    marginBottom: theme.spacing.md,
  },
  background: {
    padding: theme.spacing.md,
  },
  borderAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  lockedBorder: {
    opacity: 0.3,
  },
  content: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconSection: {
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.iron,
  },
  lockedIconBg: {
    backgroundColor: theme.colors.concreteDark,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.concreteDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.iron,
  },
  infoSection: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.steel,
    lineHeight: 16,
  },
  progressSection: {
    marginTop: 6,
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.techOrange,
    textTransform: 'uppercase',
  },
  lockedText: {
    opacity: 0.5,
  },
});
