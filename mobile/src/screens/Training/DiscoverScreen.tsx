/**
 * DiscoverScreen - Exercise discovery with API integration
 * Matches dashboard design system
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
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
} from '../../../design/tokens';
import { Exercise, ExerciseCategory, MUSCLE_CATEGORIES } from '../../types/exercise';
import {
  searchExercises,
  getExercisesByCategory,
  getFeaturedExercises,
} from '../../services/exerciseService';
import { ExerciseListCard } from '../../components/training/ExerciseListCard';
import { CategoryChips } from '../../components/training/CategoryChips';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>(
    MUSCLE_CATEGORIES[0]
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load exercises when category changes
  useEffect(() => {
    if (!searchQuery) {
      loadExercises();
    }
  }, [selectedCategory]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim()) {
      searchTimeout.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
    } else {
      loadExercises();
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const result =
        selectedCategory.id === 'all'
          ? await getFeaturedExercises()
          : await getExercisesByCategory(selectedCategory.name);

      setExercises(result.exercises);
      setIsMockData(result.isMock);
      setFromCache(result.fromCache);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await searchExercises(query);
      setExercises(result.exercises);
      setIsMockData(result.isMock);
      setFromCache(result.fromCache);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  }, [selectedCategory]);

  const handleCategorySelect = (category: ExerciseCategory) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleExercisePress = (exercise: Exercise) => {
    router.push({
      pathname: '/workout/exercise/[id]',
      params: { id: exercise.id },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Discover</Text>
              <Text style={styles.subtitle}>Find your perfect exercise</Text>
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.filterButtonGradient}
              >
                <Ionicons name="options" size={20} color={colors.textInverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Chips */}
          <CategoryChips
            selectedCategory={selectedCategory.id}
            onSelectCategory={handleCategorySelect}
          />

          {/* Data Source Indicator */}
          {(isMockData || fromCache) && (
            <View style={styles.dataIndicator}>
              <Ionicons
                name={isMockData ? 'cloud-offline' : 'download'}
                size={14}
                color={isMockData ? colors.warning : colors.info}
              />
              <Text
                style={[
                  styles.dataIndicatorText,
                  { color: isMockData ? colors.warning : colors.info },
                ]}
              >
                {isMockData ? 'Using offline data' : 'From cache'}
              </Text>
            </View>
          )}

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Results (${exercises.length})`
                : selectedCategory.id === 'all'
                ? 'Featured Exercises'
                : `${selectedCategory.name} Exercises`}
            </Text>
          </View>

          {/* Exercise List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading exercises...</Text>
            </View>
          ) : exercises.length > 0 ? (
            <View style={styles.exerciseList}>
              {exercises.map((exercise) => (
                <ExerciseListCard
                  key={exercise.id}
                  exercise={exercise}
                  onPress={() => handleExercisePress(exercise)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or category
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientStart,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  filterButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  filterButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  dataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  dataIndicatorText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  exerciseList: {
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
