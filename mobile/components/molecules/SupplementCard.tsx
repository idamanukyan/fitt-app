/**
 * SupplementCard - Reusable card component for displaying supplements
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import {
  Supplement,
  getCategoryLabel,
  getCategoryIcon,
} from '../../types/supplement';

interface SupplementCardProps {
  supplement: Supplement;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

export default function SupplementCard({
  supplement,
  onPress,
  variant = 'default',
}: SupplementCardProps) {
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactIconContainer}>
          <Ionicons
            name={getCategoryIcon(supplement.category) as any}
            size={20}
            color={theme.colors.techBlue}
          />
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {supplement.name}
          </Text>
          <Text style={styles.compactCategory} numberOfLines={1}>
            {getCategoryLabel(supplement.category)}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.darkGray}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={theme.gradients.cardGlow}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Image or Icon */}
        <View style={styles.imageContainer}>
          {supplement.image_url ? (
            <Image
              source={{ uri: supplement.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconPlaceholder}>
              <Ionicons
                name={getCategoryIcon(supplement.category) as any}
                size={32}
                color={theme.colors.techBlue}
              />
            </View>
          )}
          {supplement.is_popular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={12} color={theme.colors.techOrange} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(supplement.category)}
            </Text>
          </View>

          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {supplement.name}
          </Text>

          {/* Brand */}
          {supplement.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {supplement.brand}
            </Text>
          )}

          {/* Description */}
          {supplement.description && (
            <Text style={styles.description} numberOfLines={2}>
              {supplement.description}
            </Text>
          )}

          {/* Footer Info */}
          <View style={styles.footer}>
            {supplement.default_dosage && (
              <View style={styles.dosageInfo}>
                <Ionicons
                  name="medkit-outline"
                  size={14}
                  color={theme.colors.darkGray}
                />
                <Text style={styles.dosageText}>
                  {supplement.default_dosage} {supplement.dosage_unit}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionButton}>
          <Ionicons name="add-circle" size={24} color={theme.colors.techBlue} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default Card Styles
  card: {
    width: '48%',
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.concrete,
  },
  cardGradient: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
    borderRadius: theme.borderRadius.lg,
    minHeight: 220,
  },
  imageContainer: {
    width: '100%',
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.techOrange,
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.fontSize.md * 1.3,
  },
  brand: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    lineHeight: theme.typography.fontSize.xs * 1.5,
    marginBottom: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  dosageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dosageText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    fontWeight: '600',
  },
  actionButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },

  // Compact Card Styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concreteLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 2,
  },
  compactCategory: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
