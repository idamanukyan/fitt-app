/**
 * WorkoutCard - Brutalist workout display with neon hover
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';

interface WorkoutCardProps {
  title: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image?: any;
  onPress: () => void;
}

export default function WorkoutCard({
  title,
  duration,
  difficulty,
  image,
  onPress,
}: WorkoutCardProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Beginner':
        return theme.colors.lightGreen;
      case 'Intermediate':
        return theme.colors.lightGreen;
      case 'Advanced':
        return theme.colors.lightGreen;
      default:
        return theme.colors.lightGreen;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image or Gradient Background */}
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <LinearGradient
          colors={theme.gradients.neonPrimary}
          style={styles.gradientBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Overlay Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,15,11,0.9)']}
        style={styles.overlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={theme.colors.darkGray} />
            <Text style={styles.metaText}>{duration}</Text>
          </View>

          <View style={[styles.difficultyBadge, { borderColor: getDifficultyColor() }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
              {difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.oliveBlack,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    overflow: 'hidden',
    height: 160,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    fontWeight: '500',
  },
  difficultyBadge: {
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
