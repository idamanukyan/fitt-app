/**
 * SupplementsOverviewScreen - Browse supplement catalog
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  getSupplements,
  getPopularSupplements,
  searchSupplements,
  getSupplementsByCategory,
  getStackStats,
  seedMockSupplementData,
} from '../../storage/supplementStorage';
import { Supplement, SupplementCategory, CATEGORY_LABELS } from '../../types/supplements.types';
import { CATEGORY_ICONS } from '../../data/supplementCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const colors = {
  gradientStart: '#0F0F23',
  gradientMid: '#1A1A3E',
  gradientEnd: '#0D0D1A',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  primarySubtle: 'rgba(74, 222, 128, 0.15)',
  secondary: '#A78BFA',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

const CATEGORIES: { key: string; icon: string }[] = [
  { key: 'all', icon: 'grid-outline' },
  { key: 'protein', icon: 'fitness-outline' },
  { key: 'performance', icon: 'flash-outline' },
  { key: 'vitamin', icon: 'sunny-outline' },
  { key: 'mineral', icon: 'diamond-outline' },
  { key: 'amino', icon: 'water-outline' },
  { key: 'omega', icon: 'fish-outline' },
  { key: 'preworkout', icon: 'rocket-outline' },
  { key: 'recovery', icon: 'moon-outline' },
  { key: 'other', icon: 'flask-outline' },
];

// Progress Ring Component - Simple version for web compatibility
const ProgressRing: React.FC<{ progress: number; size?: number }> = ({ progress, size = 48 }) => {
  return (
    <View style={{
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size / 2,
      borderWidth: 3,
      borderColor: colors.primary,
      backgroundColor: colors.glass,
    }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textPrimary }}>{progress}%</Text>
    </View>
  );
};

export default function SupplementsOverviewScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [popularSupplements, setPopularSupplements] = useState<Supplement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stackStats, setStackStats] = useState<{ totalDosesToday: number; takenDosesToday: number; streakDays: number } | null>(null);

  const loadData = async (category: string, query: string) => {
    try {
      const [allSupplements, popular, stats] = await Promise.all([
        category === 'all' ? getSupplements() : getSupplementsByCategory(category),
        getPopularSupplements(),
        getStackStats(),
      ]);

      if (query) {
        const filtered = await searchSupplements(query);
        setSupplements(filtered);
      } else {
        setSupplements(allSupplements);
      }
      setPopularSupplements(popular);
      setStackStats(stats);
    } catch (error) {
      console.error('Error loading supplements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Seed mock data on first load
    seedMockSupplementData().then(() => {
      loadData(selectedCategory, searchQuery);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      loadData(selectedCategory, searchQuery);
    }
  }, [selectedCategory, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedCategory, searchQuery);
  };

  const handleSupplementPress = (supplement: Supplement) => {
    router.push({
      pathname: '/supplements/configure-new',
      params: { supplementId: supplement.id },
    });
  };

  const handleMyStack = () => {
    router.push('/supplements/my-stack');
  };

  const handleAddNew = () => {
    router.push('/supplements/add-new');
  };

  const getCategoryLabel = (key: string): string => {
    if (key === 'all') return t('supplements.categories.all');
    const labels = CATEGORY_LABELS[key as SupplementCategory];
    return labels ? labels[i18n.language as 'en' | 'de'] || labels.en : key;
  };

  const todayProgress = stackStats
    ? stackStats.totalDosesToday > 0
      ? Math.round((stackStats.takenDosesToday / stackStats.totalDosesToday) * 100)
      : 0
    : 0;

  const renderCategoryChip = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const isActive = selectedCategory === item.key;
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(item.key)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon as any}
          size={16}
          color={isActive ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
          {getCategoryLabel(item.key)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSupplementCard = ({ item }: { item: Supplement }) => {
    if (viewMode === 'list') {
      return (
        <TouchableOpacity
          style={styles.listCard}
          onPress={() => handleSupplementPress(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.listIconContainer, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons
              name={(CATEGORY_ICONS[item.category] || 'flask') as any}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.listContent}>
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.listBrand}>{item.brand}</Text>
            <Text style={styles.listDosage}>
              {item.defaultDosage} {item.defaultUnit}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addIconButton}
            onPress={() => handleSupplementPress(item)}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => handleSupplementPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.gridImageContainer}>
          <View style={[styles.gridIconPlaceholder, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons
              name={(CATEGORY_ICONS[item.category] || 'flask') as any}
              size={32}
              color={colors.primary}
            />
          </View>
          {item.isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={10} color="#FBBF24" />
            </View>
          )}
        </View>
        <View style={styles.gridContent}>
          <Text style={styles.gridCategory}>{getCategoryLabel(item.category)}</Text>
          <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
          {item.brand && <Text style={styles.gridBrand}>{item.brand}</Text>}
          <View style={styles.gridFooter}>
            <Text style={styles.gridDosage}>
              {item.defaultDosage} {item.defaultUnit}
            </Text>
            <TouchableOpacity style={styles.gridAddButton}>
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPopularItem = ({ item }: { item: Supplement }) => (
    <TouchableOpacity
      style={styles.popularCard}
      onPress={() => handleSupplementPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.popularIcon, { backgroundColor: colors.primarySubtle }]}>
        <Ionicons
          name={(CATEGORY_ICONS[item.category] || 'flask') as any}
          size={28}
          color={colors.primary}
        />
      </View>
      <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.popularBrand}>{item.brand}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('supplements.title')}</Text>
            <Text style={styles.subtitle}>{t('supplements.subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.myStackButton} onPress={handleMyStack}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.myStackGradient}
            >
              <ProgressRing progress={todayProgress} size={36} />
              <View style={styles.myStackInfo}>
                <Text style={styles.myStackLabel}>{t('supplements.myStack')}</Text>
                {stackStats && stackStats.streakDays > 0 && (
                  <Text style={styles.myStackStreak}>
                    {t('supplements.tracking.streakDays', { count: stackStats.streakDays })}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#0F0F23" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('supplements.searchPlaceholder')}
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

        {/* Popular Section */}
        {selectedCategory === 'all' && searchQuery === '' && popularSupplements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star" size={18} color="#FBBF24" />
                <Text style={styles.sectionTitle}>{t('supplements.popular')}</Text>
              </View>
            </View>
            <FlatList
              data={popularSupplements}
              renderItem={renderPopularItem}
              keyExtractor={(item) => `popular-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularList}
            />
          </View>
        )}

        {/* View Toggle & Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {supplements.length} {t('supplements.allSupplements')}
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
            {supplements.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                {renderSupplementCard({ item })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {supplements.map((item) => (
              <View key={item.id}>{renderSupplementCard({ item })}</View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {supplements.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('supplements.noSupplements')}</Text>
            <Text style={styles.emptySubtitle}>{t('supplements.noSupplementsHint')}</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={handleAddNew}
        activeOpacity={0.9}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#0F0F23" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  myStackButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  myStackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  myStackInfo: {
    marginRight: 4,
  },
  myStackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F0F23',
  },
  myStackStreak: {
    fontSize: 10,
    color: 'rgba(15, 15, 35, 0.7)',
  },
  progressText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  categoriesScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  categoryChipTextActive: {
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  popularList: {
    gap: 12,
  },
  popularCard: {
    width: 140,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  popularIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  popularName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  popularBrand: {
    fontSize: 11,
    color: colors.textMuted,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  viewToggleActive: {
    backgroundColor: colors.primarySubtle,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
  },
  gridCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gridImageContainer: {
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'relative',
  },
  gridIconPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    padding: 12,
  },
  gridCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  gridBrand: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridDosage: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gridAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 8,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 16,
  },
  listIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  listBrand: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  listDosage: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addIconButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
