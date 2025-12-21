/**
 * SupplementsScreen - Premium Supplements Library
 * Redesigned with the same aesthetic as the Training module
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  gradients,
} from '../../design/tokens';
import {
  Supplement,
  SupplementCategory,
  getCategoryLabel,
  getCategoryIcon,
} from '../../types/supplement';
import { mockSupplements, categoryColors } from '../mock/supplementsMock';
import { PremiumSupplementCard } from '../components/supplements/PremiumSupplementCard';
import { SupplementDetailModal } from '../components/supplements/SupplementDetailModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Categories for filter
const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: SupplementCategory.PROTEIN, label: 'Protein', icon: 'fitness-outline' },
  { key: SupplementCategory.CREATINE, label: 'Creatine', icon: 'barbell-outline' },
  { key: SupplementCategory.VITAMINS, label: 'Vitamins', icon: 'medical-outline' },
  { key: SupplementCategory.PRE_WORKOUT, label: 'Pre-Workout', icon: 'flash-outline' },
  { key: SupplementCategory.OMEGA_3, label: 'Omega-3', icon: 'fish-outline' },
  { key: SupplementCategory.BCAA, label: 'BCAA', icon: 'water-outline' },
  { key: SupplementCategory.RECOVERY, label: 'Recovery', icon: 'moon-outline' },
];

export default function PremiumSupplementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter supplements
  const filteredSupplements = mockSupplements.filter((supplement) => {
    const matchesCategory = selectedCategory === 'all' || supplement.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplement.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplement.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get popular supplements
  const popularSupplements = mockSupplements.filter((s) => s.is_popular);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleSupplementPress = (supplement: Supplement) => {
    setSelectedSupplement(supplement);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSupplement(null);
  };

  const handleAddToStack = (supplement: Supplement) => {
    // Navigate to add supplement flow
    handleCloseModal();
    router.push(`/supplements/add?id=${supplement.id}`);
  };

  const handleTrackNow = (supplement: Supplement) => {
    // Navigate to track supplement
    handleCloseModal();
    router.push(`/supplements/tracker`);
  };

  const handleMySupplements = () => {
    router.push('/supplements/tracker');
  };

  const renderCategoryChip = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const isActive = selectedCategory === item.key;
    const categoryColor = item.key !== 'all'
      ? categoryColors[item.key as SupplementCategory]
      : { bg: colors.primarySubtle, text: colors.primary, icon: colors.primary };

    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isActive && { backgroundColor: categoryColor.bg, borderColor: categoryColor.text },
        ]}
        onPress={() => setSelectedCategory(item.key)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon as any}
          size={16}
          color={isActive ? categoryColor.icon : colors.textMuted}
        />
        <Text
          style={[
            styles.categoryChipText,
            isActive && { color: categoryColor.text },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeaturedSupplement = ({ item }: { item: Supplement }) => (
    <PremiumSupplementCard
      supplement={item}
      onPress={() => handleSupplementPress(item)}
      variant="featured"
    />
  );

  const renderSupplementCard = ({ item }: { item: Supplement }) => (
    <PremiumSupplementCard
      supplement={item}
      onPress={() => handleSupplementPress(item)}
      variant={viewMode}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A3E', '#0D0D1A'] as const}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Supplements</Text>
            <Text style={styles.subtitle}>Optimize your nutrition</Text>
          </View>
          <TouchableOpacity
            style={styles.myStackButton}
            onPress={handleMySupplements}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ADE80', '#22C55E'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.myStackGradient}
            >
              <Ionicons name="layers-outline" size={18} color={colors.textInverse} />
              <Text style={styles.myStackText}>My Stack</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search supplements..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesScroll}
        />

        {/* Popular Supplements Section (only when no filter/search) */}
        {selectedCategory === 'all' && searchQuery === '' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star" size={18} color={colors.warning} />
                <Text style={styles.sectionTitle}>Popular</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={popularSupplements}
              renderItem={renderFeaturedSupplement}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContent}
            />
          </View>
        )}

        {/* View Mode Toggle & Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredSupplements.length} {filteredSupplements.length === 1 ? 'Supplement' : 'Supplements'}
          </Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === 'grid' ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Supplements Grid/List */}
        {viewMode === 'grid' ? (
          <View style={styles.grid}>
            {filteredSupplements.map((supplement) => (
              <PremiumSupplementCard
                key={supplement.id}
                supplement={supplement}
                onPress={() => handleSupplementPress(supplement)}
                variant="grid"
              />
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredSupplements.map((supplement) => (
              <PremiumSupplementCard
                key={supplement.id}
                supplement={supplement}
                onPress={() => handleSupplementPress(supplement)}
                variant="list"
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {filteredSupplements.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="flask-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No supplements found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Check back later for new supplements'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Supplement Detail Modal */}
      <SupplementDetailModal
        visible={modalVisible}
        supplement={selectedSupplement}
        onClose={handleCloseModal}
        onAddToStack={handleAddToStack}
        onTrackNow={handleTrackNow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  myStackButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.primaryGlowSubtle,
  },
  myStackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  myStackText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },

  // Categories
  categoriesScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.xl,
  },
  categoriesContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  featuredContent: {
    paddingRight: spacing.xl,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultsText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    padding: 2,
  },
  viewToggleButton: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  viewToggleActive: {
    backgroundColor: colors.primarySubtle,
  },

  // Grid/List
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  list: {
    gap: spacing.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
