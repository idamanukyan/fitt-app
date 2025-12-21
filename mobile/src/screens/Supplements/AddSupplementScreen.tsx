/**
 * AddSupplementScreen - Browse and search supplements to add
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
  Dimensions,
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

export default function AddSupplementScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [popularSupplements, setPopularSupplements] = useState<Supplement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [allSupplements, popular] = await Promise.all([
        selectedCategory === 'all' ? getSupplements() : getSupplementsByCategory(selectedCategory),
        getPopularSupplements(),
      ]);

      if (searchQuery) {
        const filtered = await searchSupplements(searchQuery);
        setSupplements(filtered);
      } else {
        setSupplements(allSupplements);
      }
      setPopularSupplements(popular);
    } catch (error) {
      console.error('Error loading supplements:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSupplementPress = (supplement: Supplement) => {
    router.push({
      pathname: '/supplements/configure-new',
      params: { supplementId: supplement.id },
    });
  };

  const getCategoryLabel = (key: string): string => {
    if (key === 'all') return t('supplements.categories.all');
    const labels = CATEGORY_LABELS[key as SupplementCategory];
    return labels ? labels[i18n.language as 'en' | 'de'] || labels.en : key;
  };

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
      <View style={styles.popularAddButton}>
        <Ionicons name="add" size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderSupplementItem = ({ item }: { item: Supplement }) => (
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
        <Text style={styles.listMeta}>
          {item.brand} • {item.defaultDosage} {item.defaultUnit}
        </Text>
        {item.benefits && item.benefits.length > 0 && (
          <View style={styles.benefitsRow}>
            {item.benefits.slice(0, 2).map((benefit, index) => (
              <View key={index} style={styles.benefitChip}>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSupplementPress(item)}
      >
        <Ionicons name="add-circle" size={32} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd] as const}
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
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd] as const}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('supplements.addSupplement')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('supplements.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            returnKeyType="search"
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
              <Ionicons name="star" size={18} color="#FBBF24" />
              <Text style={styles.sectionTitle}>{t('supplements.popular')}</Text>
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

        {/* All Supplements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? t('common.search') : t('supplements.allSupplements')}
            </Text>
            <Text style={styles.resultCount}>{supplements.length}</Text>
          </View>

          {supplements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('supplements.noSupplements')}</Text>
              <Text style={styles.emptySubtitle}>{t('supplements.noSupplementsHint')}</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {supplements.map((item) => (
                <View key={item.id}>{renderSupplementItem({ item })}</View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  resultCount: {
    fontSize: 14,
    color: colors.textMuted,
    backgroundColor: colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  popularList: {
    gap: 12,
  },
  popularCard: {
    width: 130,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
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
  popularAddButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
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
    width: 52,
    height: 52,
    borderRadius: 14,
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
    marginBottom: 4,
  },
  listMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  benefitChip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  benefitText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  addButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
});
