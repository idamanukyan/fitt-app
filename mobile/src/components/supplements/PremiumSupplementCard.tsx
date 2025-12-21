/**
 * PremiumSupplementCard - Premium aesthetic supplement card
 * Matches the design system used in ExerciseDetailModal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../../../design/tokens';
import {
  Supplement,
  SupplementCategory,
  getCategoryLabel,
  getCategoryIcon,
  getTimingLabel,
} from '../../../types/supplement';
import { categoryColors } from '../../mock/supplementsMock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2;

interface PremiumSupplementCardProps {
  supplement: Supplement;
  onPress: () => void;
  variant?: 'grid' | 'list' | 'featured';
}

export const PremiumSupplementCard: React.FC<PremiumSupplementCardProps> = ({
  supplement,
  onPress,
  variant = 'grid',
}) => {
  const categoryColor = categoryColors[supplement.category] || categoryColors[SupplementCategory.OTHER];
  const categoryIcon = getCategoryIcon(supplement.category);

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.featuredImageContainer}>
          {supplement.image_url ? (
            <Image
              source={{ uri: supplement.image_url }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.featuredIconPlaceholder, { backgroundColor: categoryColor.bg }]}>
              <Ionicons
                name={categoryIcon as any}
                size={48}
                color={categoryColor.icon}
              />
            </View>
          )}
          {/* Aesthetic overlay */}
          <View style={styles.imageOverlay} />
          <LinearGradient
            colors={['transparent', 'rgba(15,15,35,0.9)']}
            style={styles.featuredGradient}
          />
          {/* Popular badge */}
          {supplement.is_popular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={10} color={colors.warning} />
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          )}
        </View>
        <View style={styles.featuredContent}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
            <Text style={[styles.categoryText, { color: categoryColor.text }]}>
              {getCategoryLabel(supplement.category)}
            </Text>
          </View>
          <Text style={styles.featuredName} numberOfLines={1}>
            {supplement.name}
          </Text>
          {supplement.brand && (
            <Text style={styles.brandText}>{supplement.brand}</Text>
          )}
          <View style={styles.featuredFooter}>
            <View style={styles.dosageRow}>
              <Ionicons name="flask-outline" size={14} color={colors.textMuted} />
              <Text style={styles.dosageText}>
                {supplement.default_dosage} {supplement.dosage_unit}
              </Text>
            </View>
            <View style={styles.addButton}>
              <Ionicons name="add" size={18} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.listImageContainer}>
          {supplement.image_url ? (
            <Image
              source={{ uri: supplement.image_url }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listIconPlaceholder, { backgroundColor: categoryColor.bg }]}>
              <Ionicons
                name={categoryIcon as any}
                size={24}
                color={categoryColor.icon}
              />
            </View>
          )}
          <View style={styles.listImageOverlay} />
        </View>
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <View style={[styles.categoryBadgeSmall, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.categoryTextSmall, { color: categoryColor.text }]}>
                {getCategoryLabel(supplement.category)}
              </Text>
            </View>
            {supplement.is_popular && (
              <Ionicons name="star" size={12} color={colors.warning} />
            )}
          </View>
          <Text style={styles.listName} numberOfLines={1}>
            {supplement.name}
          </Text>
          <Text style={styles.listBrand} numberOfLines={1}>
            {supplement.brand || 'Generic'}
          </Text>
          <View style={styles.listFooter}>
            <Text style={styles.listDosage}>
              {supplement.default_dosage} {supplement.dosage_unit}
            </Text>
            {supplement.recommended_timing && (
              <View style={styles.timingBadge}>
                <Ionicons name="time-outline" size={10} color={colors.textMuted} />
                <Text style={styles.timingText}>
                  {getTimingLabel(supplement.recommended_timing)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.listAction}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  }

  // Grid variant (default)
  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.gridImageContainer}>
        {supplement.image_url ? (
          <Image
            source={{ uri: supplement.image_url }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.gridIconPlaceholder, { backgroundColor: categoryColor.bg }]}>
            <Ionicons
              name={categoryIcon as any}
              size={32}
              color={categoryColor.icon}
            />
          </View>
        )}
        {/* Aesthetic muted overlay */}
        <View style={styles.imageOverlay} />
        {/* Vignette */}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.3)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Popular badge */}
        {supplement.is_popular && (
          <View style={styles.gridPopularBadge}>
            <Ionicons name="star" size={8} color={colors.warning} />
          </View>
        )}
      </View>
      <View style={styles.gridContent}>
        <View style={[styles.categoryBadgeSmall, { backgroundColor: categoryColor.bg }]}>
          <Text style={[styles.categoryTextSmall, { color: categoryColor.text }]}>
            {getCategoryLabel(supplement.category)}
          </Text>
        </View>
        <Text style={styles.gridName} numberOfLines={2}>
          {supplement.name}
        </Text>
        {supplement.brand && (
          <Text style={styles.gridBrand} numberOfLines={1}>
            {supplement.brand}
          </Text>
        )}
        <View style={styles.gridFooter}>
          <Text style={styles.gridDosage}>
            {supplement.default_dosage} {supplement.dosage_unit}
          </Text>
          <TouchableOpacity style={styles.gridAddButton} activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card Styles
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  gridImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#0a0a14',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridIconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 30, 0.2)',
  },
  gridPopularBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  gridContent: {
    padding: spacing.md,
  },
  gridName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    lineHeight: typography.size.sm * 1.3,
  },
  gridBrand: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  gridDosage: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  gridAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List Card Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  listImageContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#0a0a14',
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listIconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 30, 0.15)',
  },
  listContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  listName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  listBrand: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  listDosage: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timingText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  listAction: {
    marginLeft: spacing.sm,
  },

  // Featured Card Styles
  featuredCard: {
    width: SCREEN_WIDTH * 0.7,
    marginRight: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    ...shadows.md,
  },
  featuredImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#0a0a14',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredIconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  popularText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.warning,
    letterSpacing: 0.5,
  },
  featuredContent: {
    padding: spacing.lg,
  },
  featuredName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  brandText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dosageText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },

  // Shared Styles
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryBadgeSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  categoryTextSmall: {
    fontSize: 9,
    fontWeight: typography.weight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default PremiumSupplementCard;
