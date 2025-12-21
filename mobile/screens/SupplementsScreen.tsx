/**
 * SupplementsScreen - Browse supplement library
 * Accessible from Discover tab
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import SupplementCard from '../components/molecules/SupplementCard';
import {
  Supplement,
  SupplementCategory,
  getCategoryLabel,
  getCategoryIcon,
} from '../types/supplement';
import { supplementService } from '../services/supplementService';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: SupplementCategory.PROTEIN, label: 'Protein', icon: 'fitness-outline' },
  { key: SupplementCategory.VITAMINS, label: 'Vitamins', icon: 'medical-outline' },
  { key: SupplementCategory.PRE_WORKOUT, label: 'Pre-Workout', icon: 'flash-outline' },
  { key: SupplementCategory.CREATINE, label: 'Creatine', icon: 'barbell-outline' },
  { key: SupplementCategory.OMEGA_3, label: 'Omega-3', icon: 'fish-outline' },
];

export default function SupplementsScreen() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [filteredSupplements, setFilteredSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSupplements();
  }, []);

  useEffect(() => {
    filterSupplements();
  }, [supplements, searchQuery, selectedCategory]);

  const loadSupplements = async () => {
    try {
      setLoading(true);
      const response = await supplementService.library.getSupplements({ limit: 100 });
      setSupplements(response.supplements);
    } catch (error) {
      console.error('Error loading supplements:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSupplements();
    setRefreshing(false);
  };

  const filterSupplements = () => {
    let filtered = supplements;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.brand?.toLowerCase().includes(query)
      );
    }

    setFilteredSupplements(filtered);
  };

  const handleSupplementPress = (supplement: Supplement) => {
    // Navigate to detail screen
    router.push(`/supplements/${supplement.id}`);
  };

  const handleMySupplements = () => {
    router.push('/my-supplements');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>LOADING SUPPLEMENTS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techBlue}
            colors={[theme.colors.techBlue]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SUPPLEMENTS</Text>
          <Text style={styles.subtitle}>OPTIMIZE YOUR NUTRITION</Text>
        </View>

        {/* My Supplements Button */}
        <TouchableOpacity
          style={styles.mySupplementsButton}
          onPress={handleMySupplements}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.gradients.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mySupplementsGradient}
          >
            <Ionicons name="list" size={20} color={theme.colors.white} />
            <Text style={styles.mySupplementsText}>MY SUPPLEMENTS</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search supplements..."
            placeholderTextColor={theme.colors.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.darkGray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
              activeOpacity={0.7}
            >
              {selectedCategory === category.key ? (
                <LinearGradient
                  colors={theme.gradients.buttonPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryChipGradient}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={theme.colors.white}
                  />
                  <Text style={styles.categoryChipTextActive}>{category.label}</Text>
                </LinearGradient>
              ) : (
                <>
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={theme.colors.darkGray}
                  />
                  <Text style={styles.categoryChipText}>{category.label}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Count */}
        <Text style={styles.resultsText}>
          {filteredSupplements.length} {filteredSupplements.length === 1 ? 'Supplement' : 'Supplements'}
        </Text>

        {/* Supplements Grid */}
        <View style={styles.grid}>
          {filteredSupplements.map(supplement => (
            <SupplementCard
              key={supplement.id}
              supplement={supplement}
              onPress={() => handleSupplementPress(supplement)}
            />
          ))}
        </View>

        {filteredSupplements.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={64} color={theme.colors.darkGray} />
            <Text style={styles.emptyText}>No supplements found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Check back later for new supplements'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techBlue,
    fontWeight: '700',
    letterSpacing: 2,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 3,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 2,
  },
  mySupplementsButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.techBlueGlow,
  },
  mySupplementsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  mySupplementsText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concreteLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    fontWeight: '500',
  },
  categoriesScroll: {
    marginBottom: theme.spacing.lg,
  },
  categoriesContent: {
    paddingRight: theme.spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concreteLight,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  categoryChipActive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  categoryChipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  categoryChipTextActive: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
  },
  resultsText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
    textAlign: 'center',
  },
});
