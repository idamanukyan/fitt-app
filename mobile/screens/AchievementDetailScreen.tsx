/**
 * AchievementDetailScreen - Individual achievement detail view
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import achievementService from '../services/achievementService';
import { UserAchievement, AchievementCategory } from '../types/achievement.types';

export default function AchievementDetailScreen() {
  const router = useRouter();
  const { achievementId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [userAchievement, setUserAchievement] = useState<UserAchievement | null>(null);
  const [relatedAchievements, setRelatedAchievements] = useState<UserAchievement[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    loadAchievement();
  }, [achievementId]);

  useEffect(() => {
    if (userAchievement) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [userAchievement]);

  const loadAchievement = async () => {
    setIsLoading(true);
    try {
      const achievements = await achievementService.getAchievements();
      const found = achievements.find(
        (a) => a.achievement.id === Number(achievementId)
      );

      if (found) {
        setUserAchievement(found);

        // Load related achievements (same category, exclude current)
        const related = achievements
          .filter(
            (a) =>
              a.achievement.category === found.achievement.category &&
              a.achievement.id !== found.achievement.id
          )
          .slice(0, 3);
        setRelatedAchievements(related);
      }
    } catch (error) {
      console.error('Error loading achievement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !userAchievement) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading achievement...</Text>
      </View>
    );
  }

  const { achievement, is_unlocked, current_progress, progress_percentage, unlocked_at } =
    userAchievement;

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
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[theme.colors.black, theme.colors.concreteDark, theme.colors.concrete]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACHIEVEMENT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Achievement Icon with Glow */}
        <Animated.View
          style={[
            styles.iconSection,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.iconGlow, { backgroundColor: categoryColor }]} />
          <View
            style={[
              styles.iconContainer,
              is_unlocked && { backgroundColor: categoryColor },
              !is_unlocked && styles.lockedIconBg,
            ]}
          >
            <Ionicons
              name={achievement.icon_name as any}
              size={80}
              color={is_unlocked ? theme.colors.black : theme.colors.steelDark}
            />
          </View>

          {/* Status Badge */}
          {is_unlocked ? (
            <View style={[styles.statusBadge, { backgroundColor: categoryColor }]}>
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.black} />
              <Text style={styles.statusText}>UNLOCKED</Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <Ionicons name="lock-closed" size={32} color={theme.colors.steelDark} />
              <Text style={[styles.statusText, styles.lockedText]}>LOCKED</Text>
            </View>
          )}
        </Animated.View>

        {/* Achievement Info */}
        <Animated.View style={[styles.infoSection, { opacity: fadeAnim }]}>
          <Text style={styles.achievementName}>{achievement.name.toUpperCase()}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { borderColor: categoryColor }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {achievement.category.toUpperCase()}
            </Text>
          </View>
        </Animated.View>

        {/* Progress Section */}
        <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[theme.colors.concrete, theme.colors.concreteLight]}
            style={styles.progressBackground}
          />

          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>PROGRESS</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress_percentage)}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
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

          {/* XP Reward */}
          <View style={styles.xpRewardSection}>
            <Ionicons name="star" size={24} color={theme.colors.techOrange} />
            <Text style={styles.xpRewardText}>{achievement.xp_reward} XP REWARD</Text>
          </View>

          {/* Unlocked Date */}
          {is_unlocked && unlocked_at && (
            <View style={styles.unlockedDateSection}>
              <Ionicons name="calendar" size={16} color={theme.colors.steel} />
              <Text style={styles.unlockedDateText}>
                Unlocked on {new Date(unlocked_at).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Motivation Message */}
          {!is_unlocked && (
            <View style={styles.motivationSection}>
              <Text style={styles.motivationText}>
                {achievement.target_value - current_progress} more to go! Keep pushing!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Related Achievements */}
        {relatedAchievements.length > 0 && (
          <Animated.View style={[styles.relatedSection, { opacity: fadeAnim }]}>
            <Text style={styles.relatedTitle}>RELATED ACHIEVEMENTS</Text>
            {relatedAchievements.map((related) => (
              <TouchableOpacity
                key={related.id}
                style={styles.relatedCard}
                onPress={() => router.push({
                  pathname: '/screens/AchievementDetailScreen',
                  params: { achievementId: related.achievement.id },
                } as any)}
              >
                <View style={styles.relatedIcon}>
                  <Ionicons
                    name={related.achievement.icon_name as any}
                    size={24}
                    color={related.is_unlocked ? theme.colors.techGreen : theme.colors.steelDark}
                  />
                </View>
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedName}>{related.achievement.name}</Text>
                  <Text style={styles.relatedProgress}>
                    {related.current_progress} / {related.achievement.target_value}
                  </Text>
                </View>
                {related.is_unlocked && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.techGreen} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
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
    fontSize: 20,
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
  iconSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  iconGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.2,
    blur: 50,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.iron,
    marginBottom: theme.spacing.lg,
  },
  lockedIconBg: {
    backgroundColor: theme.colors.concreteDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 2,
    borderColor: theme.colors.iron,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  lockedText: {
    color: theme.colors.steelDark,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  achievementName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.steel,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  categoryBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  progressSection: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
    marginBottom: theme.spacing.xl,
  },
  progressBackground: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  progressBarContainer: {
    gap: theme.spacing.sm,
  },
  progressBar: {
    height: 16,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.steel,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  xpRewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: theme.borderRadius.md,
  },
  xpRewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.techOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unlockedDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  unlockedDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.steel,
  },
  motivationSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.techGreen,
    textAlign: 'center',
  },
  relatedSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  relatedIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concreteDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  relatedInfo: {
    flex: 1,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  relatedProgress: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.steel,
  },
});
