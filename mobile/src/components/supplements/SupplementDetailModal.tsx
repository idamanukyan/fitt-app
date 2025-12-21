/**
 * SupplementDetailModal - Premium Supplement Detail View
 * Matches the aesthetic of ExerciseDetailModal
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../../design/tokens';
import {
  Supplement,
  SupplementCategory,
  getCategoryLabel,
  getCategoryIcon,
  getTimingLabel,
  getFrequencyLabel,
} from '../../../types/supplement';
import { categoryColors } from '../../mock/supplementsMock';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive image height
const IMAGE_ASPECT_RATIO = 4 / 3;
const IMAGE_HEIGHT = Math.min(SCREEN_WIDTH * IMAGE_ASPECT_RATIO * 0.5, SCREEN_HEIGHT * 0.35);

interface SupplementDetailModalProps {
  visible: boolean;
  supplement: Supplement | null;
  onClose: () => void;
  onAddToStack: (supplement: Supplement) => void;
  onTrackNow: (supplement: Supplement) => void;
}

export const SupplementDetailModal: React.FC<SupplementDetailModalProps> = ({
  visible,
  supplement,
  onClose,
  onAddToStack,
  onTrackNow,
}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'benefits' | 'instructions' | 'nutrition'>('benefits');

  if (!supplement) return null;

  const categoryColor = categoryColors[supplement.category] || categoryColors[SupplementCategory.OTHER];
  const categoryIcon = getCategoryIcon(supplement.category);

  // Parse benefits from JSON string
  const benefits: string[] = supplement.benefits ? JSON.parse(supplement.benefits) : [];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F0F23', '#1A1A3E', '#0D0D1A'] as const}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Animated Header */}
        <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
          <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
          <View style={styles.stickyHeaderContent}>
            <TouchableOpacity onPress={onClose} style={styles.headerCloseButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stickyTitle} numberOfLines={1}>
              {supplement.name}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </Animated.View>

        {/* Floating Close Button */}
        <View style={[styles.floatingCloseContainer, { top: insets.top + spacing.md }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButtonFloat}
            activeOpacity={0.7}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <View style={styles.closeButtonBg}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Image Section */}
          <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
            {supplement.image_url ? (
              <Image
                source={{ uri: supplement.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.iconPlaceholder, { backgroundColor: categoryColor.bg }]}>
                <Ionicons
                  name={categoryIcon as any}
                  size={64}
                  color={categoryColor.icon}
                />
              </View>
            )}
            {/* Aesthetic overlay */}
            <View style={styles.aestheticOverlay} />
            {/* Vignette */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(0,0,0,0.4)']}
              locations={[0, 0.2, 0.8, 1]}
              style={styles.vignetteOverlay}
            />
            {/* Bottom gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(15,15,35,0.6)', colors.gradientStart]}
              locations={[0, 0.5, 1]}
              style={styles.bottomGradient}
            />

            {/* Popular badge */}
            {supplement.is_popular && (
              <View style={styles.popularBadge}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}

            {/* Category badge */}
            <View style={[styles.categoryBadgeLarge, { backgroundColor: categoryColor.bg }]}>
              <Ionicons name={categoryIcon as any} size={14} color={categoryColor.icon} />
              <Text style={[styles.categoryBadgeText, { color: categoryColor.text }]}>
                {getCategoryLabel(supplement.category)}
              </Text>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Title & Brand */}
            <Text style={styles.supplementName}>{supplement.name}</Text>
            {supplement.brand && (
              <Text style={styles.brandName}>by {supplement.brand}</Text>
            )}

            {/* Quick Info Pills */}
            <View style={styles.quickInfoRow}>
              {supplement.default_dosage && (
                <View style={styles.infoPill}>
                  <Ionicons name="flask-outline" size={14} color={colors.primary} />
                  <Text style={styles.infoPillText}>
                    {supplement.default_dosage} {supplement.dosage_unit}
                  </Text>
                </View>
              )}
              {supplement.recommended_timing && (
                <View style={styles.infoPill}>
                  <Ionicons name="time-outline" size={14} color={colors.secondary} />
                  <Text style={styles.infoPillText}>
                    {getTimingLabel(supplement.recommended_timing)}
                  </Text>
                </View>
              )}
              {supplement.recommended_frequency && (
                <View style={styles.infoPill}>
                  <Ionicons name="repeat-outline" size={14} color={colors.accent.blue} />
                  <Text style={styles.infoPillText}>
                    {getFrequencyLabel(supplement.recommended_frequency)}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {supplement.description && (
              <Text style={styles.description}>{supplement.description}</Text>
            )}

            {/* Tabs */}
            <View style={styles.tabRow}>
              {(['benefits', 'instructions', 'nutrition'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab === 'benefits' ? 'Benefits' : tab === 'instructions' ? 'How to Take' : 'Nutrition'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === 'benefits' && (
                <View style={styles.listContainer}>
                  {benefits.length > 0 ? (
                    benefits.map((benefit, index) => (
                      <View key={index} style={styles.listItem}>
                        <View style={styles.checkIcon}>
                          <Ionicons name="checkmark" size={14} color={colors.primary} />
                        </View>
                        <Text style={styles.listText}>{benefit}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No benefits listed</Text>
                  )}
                  {supplement.side_effects && (
                    <View style={styles.warningBox}>
                      <View style={styles.warningHeader}>
                        <Ionicons name="alert-circle" size={16} color={colors.warning} />
                        <Text style={styles.warningTitle}>Side Effects</Text>
                      </View>
                      <Text style={styles.warningText}>{supplement.side_effects}</Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'instructions' && (
                <View style={styles.listContainer}>
                  {supplement.instructions ? (
                    <View style={styles.instructionsCard}>
                      <Ionicons name="document-text-outline" size={24} color={colors.secondary} />
                      <Text style={styles.instructionsText}>{supplement.instructions}</Text>
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No instructions available</Text>
                  )}
                  {supplement.serving_size && (
                    <View style={styles.servingInfo}>
                      <Text style={styles.servingLabel}>Serving Size</Text>
                      <Text style={styles.servingValue}>{supplement.serving_size}</Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'nutrition' && (
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionCard}>
                    <Ionicons name="flame-outline" size={24} color={colors.accent.orange} />
                    <Text style={styles.nutritionValue}>
                      {supplement.calories_per_serving || 0}
                    </Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionCard}>
                    <Ionicons name="fitness-outline" size={24} color={colors.primary} />
                    <Text style={styles.nutritionValue}>
                      {supplement.protein_per_serving || 0}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionCard}>
                    <Ionicons name="flash-outline" size={24} color={colors.warning} />
                    <Text style={styles.nutritionValue}>
                      {supplement.carbs_per_serving || 0}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionCard}>
                    <Ionicons name="water-outline" size={24} color={colors.accent.blue} />
                    <Text style={styles.nutritionValue}>
                      {supplement.fats_per_serving || 0}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Fats</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Timing Recommendation */}
            {supplement.recommended_timing && (
              <View style={styles.timingSection}>
                <View style={styles.timingSectionHeader}>
                  <Ionicons name="time" size={18} color={colors.secondary} />
                  <Text style={styles.timingSectionTitle}>Best Time to Take</Text>
                </View>
                <Text style={styles.timingDescription}>
                  For optimal results, take this supplement{' '}
                  <Text style={styles.timingHighlight}>
                    {getTimingLabel(supplement.recommended_timing).toLowerCase()}
                  </Text>
                  .
                </Text>
              </View>
            )}

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="flask" size={24} color={categoryColor.icon} />
                <Text style={styles.statValue}>
                  {supplement.default_dosage || '-'}
                </Text>
                <Text style={styles.statLabel}>{supplement.dosage_unit || 'dosage'}</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color={colors.secondary} />
                <Text style={styles.statValue}>
                  {supplement.recommended_frequency ?
                    getFrequencyLabel(supplement.recommended_frequency).split(' ')[0] : '-'}
                </Text>
                <Text style={styles.statLabel}>frequency</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="nutrition" size={24} color={colors.accent.orange} />
                <Text style={styles.statValue}>{supplement.calories_per_serving || 0}</Text>
                <Text style={styles.statLabel}>calories</Text>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onAddToStack(supplement)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Add to Stack</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onTrackNow(supplement)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ADE80', '#22C55E'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
              <Text style={styles.primaryButtonText}>Track Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stickyTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingCloseContainer: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 999,
    elevation: 999,
  },
  closeButtonFloat: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // Image Section
  imageContainer: {
    position: 'relative',
    backgroundColor: '#0a0a14',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aestheticOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 30, 0.15)',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  popularText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.warning,
    letterSpacing: 0.5,
  },
  categoryBadgeLarge: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  categoryBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
  },

  // Content Section
  contentSection: {
    padding: spacing.xl,
  },
  supplementName: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  brandName: {
    fontSize: typography.size.base,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  quickInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  infoPillText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  description: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    lineHeight: typography.size.base * 1.6,
    marginBottom: spacing.xl,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.primarySubtle,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.semiBold,
  },
  tabContent: {
    marginBottom: spacing.xl,
  },

  // Benefits Tab
  listContainer: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  warningBox: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.warning,
  },
  warningText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Instructions Tab
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  instructionsText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  servingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  servingLabel: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  servingValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },

  // Nutrition Tab
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  nutritionCard: {
    width: '47%',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  nutritionLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Timing Section
  timingSection: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.secondarySubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  timingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timingSectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  timingDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timingHighlight: {
    color: colors.secondary,
    fontWeight: typography.weight.semiBold,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(15,15,35,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
  },
  secondaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.primary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  primaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});

export default SupplementDetailModal;
