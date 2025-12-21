/**
 * DiscoverScreen - Global Exercise Library
 * Browse, search, and explore exercises from MuscleWiki-based library.
 *
 * Sections:
 * - Featured exercises carousel
 * - Popular exercises
 * - Browse by body part
 * - Search with filters
 * - Pain relief / Rehab exercises
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '../utils/theme';
import ExerciseCard from '../components/atoms/ExerciseCard';
import { useExerciseStore } from '../stores/exerciseStore';
import type { ExerciseSummary, BodyPart, PainFocus } from '../types/exercise.types';
import { BODY_PART_FILTERS, PAIN_FOCUS_FILTERS } from '../types/exercise.types';

// Body part quick access cards
const BODY_PARTS: { id: BodyPart; name: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { id: 'chest', name: 'Chest', icon: 'body-outline', color: theme.colors.techBlue },
  { id: 'back', name: 'Back', icon: 'body-outline', color: theme.colors.techCyan },
  { id: 'shoulders', name: 'Shoulders', icon: 'body-outline', color: theme.colors.techOrange },
  { id: 'arms', name: 'Arms', icon: 'fitness-outline', color: theme.colors.techGreen },
  { id: 'core', name: 'Core', icon: 'body-outline', color: theme.colors.neonPink },
  { id: 'legs', name: 'Legs', icon: 'walk-outline', color: theme.colors.neonPurple },
  { id: 'glutes', name: 'Glutes', icon: 'body-outline', color: theme.colors.neonOrange },
];

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Store state
  const {
    discoverSections,
    discoverLoading,
    discoverError,
    searchQuery,
    searchResults,
    searchLoading,
    isExerciseSaved,
    fetchDiscoverSections,
    search,
    clearSearch,
    fetchByBodyPart,
    fetchRehab,
    toggleSave,
    filteredExercises,
    filterLoading,
  } = useExerciseStore();

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Load discover sections
    fetchDiscoverSections();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDiscoverSections();
    setRefreshing(false);
  }, [fetchDiscoverSections]);

  const handleExercisePress = (exercise: ExerciseSummary) => {
    navigation.navigate('ExerciseDetail', {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    });
  };

  const handleSavePress = async (exerciseId: number) => {
    try {
      await toggleSave(exerciseId);
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleBodyPartPress = (bodyPart: BodyPart) => {
    fetchByBodyPart(bodyPart);
    navigation.navigate('ExerciseList', {
      title: bodyPart.toUpperCase(),
      type: 'body_part',
      value: bodyPart,
    });
  };

  const handleRehabPress = (painFocus: PainFocus) => {
    fetchRehab(painFocus);
    navigation.navigate('ExerciseList', {
      title: `${painFocus.replace(/_/g, ' ').toUpperCase()} RELIEF`,
      type: 'rehab',
      value: painFocus,
    });
  };

  const handleSeeAllPress = (sectionType: string, title: string) => {
    navigation.navigate('ExerciseList', {
      title,
      type: sectionType,
    });
  };

  const handleSearchChange = (text: string) => {
    search(text);
  };

  const renderExerciseSection = (
    title: string,
    exercises: ExerciseSummary[] | undefined,
    sectionKey: string,
    showSeeAll: boolean = true
  ) => {
    if (!exercises || exercises.length === 0) return null;

    return (
      <View style={styles.section} key={sectionKey}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {showSeeAll && (
            <TouchableOpacity
              onPress={() => handleSeeAllPress(sectionKey, title)}
              activeOpacity={0.8}
            >
              <Text style={styles.seeAllText}>SEE ALL</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {exercises.slice(0, 8).map((exercise) => (
            <View key={exercise.id} style={styles.horizontalCard}>
              <ExerciseCard
                exercise={exercise}
                onPress={() => handleExercisePress(exercise)}
                onSavePress={() => handleSavePress(exercise.id)}
                isSaved={isExerciseSaved(exercise.id)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBodyPartCard = (item: typeof BODY_PARTS[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.bodyPartCard, { borderColor: item.color }]}
      onPress={() => handleBodyPartPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.bodyPartIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.bodyPartName}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  const renderSearchResults = () => {
    if (!searchQuery) return null;

    return (
      <View style={styles.searchResults}>
        <Text style={styles.searchResultsTitle}>
          {searchLoading ? 'SEARCHING...' : `${searchResults.length} RESULTS`}
        </Text>
        {searchLoading ? (
          <ActivityIndicator color={theme.colors.techBlue} style={styles.loader} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ExerciseCard
                exercise={item}
                onPress={() => handleExercisePress(item)}
                onSavePress={() => handleSavePress(item.id)}
                isSaved={isExerciseSaved(item.id)}
                variant="compact"
              />
            )}
            contentContainerStyle={styles.searchList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No exercises found</Text>
            }
          />
        )}
      </View>
    );
  };

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
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>DISCOVER</Text>
            <Text style={styles.subtitle}>EXPLORE EXERCISE LIBRARY</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={theme.colors.steelDark} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={theme.colors.steelDark}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => setSearchVisible(true)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.steelDark} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results */}
          {searchQuery ? (
            renderSearchResults()
          ) : (
            <>
              {/* Loading State */}
              {discoverLoading && !refreshing && (
                <ActivityIndicator color={theme.colors.techBlue} style={styles.loader} />
              )}

              {/* Error State */}
              {discoverError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={32} color={theme.colors.techRed} />
                  <Text style={styles.errorText}>{discoverError}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchDiscoverSections}>
                    <Text style={styles.retryText}>RETRY</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Featured Section */}
              {discoverSections?.featured && discoverSections.featured.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>FEATURED</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                  >
                    {discoverSections.featured.map((exercise) => (
                      <View key={exercise.id} style={styles.featuredCard}>
                        <ExerciseCard
                          exercise={exercise}
                          onPress={() => handleExercisePress(exercise)}
                          onSavePress={() => handleSavePress(exercise.id)}
                          isSaved={isExerciseSaved(exercise.id)}
                          variant="featured"
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Body Parts Grid */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BROWSE BY BODY PART</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.bodyPartsRow}
                >
                  {BODY_PARTS.map(renderBodyPartCard)}
                </ScrollView>
              </View>

              {/* Popular Section */}
              {renderExerciseSection(
                'POPULAR EXERCISES',
                discoverSections?.popular,
                'popular'
              )}

              {/* Stretching Section */}
              {renderExerciseSection(
                'STRETCHING & MOBILITY',
                discoverSections?.stretching,
                'stretching'
              )}

              {/* Pain Relief Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PAIN RELIEF</Text>
                <Text style={styles.sectionSubtitle}>Targeted exercises for common pain areas</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.painReliefRow}
                >
                  {PAIN_FOCUS_FILTERS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.painCard}
                      onPress={() => handleRehabPress(item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.painIcon}>
                        <Ionicons name="medkit-outline" size={20} color={theme.colors.techGreen} />
                      </View>
                      <Text style={styles.painName}>{item.name.toUpperCase()}</Text>
                      <Text style={styles.painDesc} numberOfLines={2}>{item.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Back Pain Relief */}
              {renderExerciseSection(
                'BACK PAIN RELIEF',
                discoverSections?.back_pain_relief,
                'back_pain'
              )}

              {/* New Exercises */}
              {renderExerciseSection(
                'NEWLY ADDED',
                discoverSections?.new_exercises,
                'new'
              )}

              {/* CTA */}
              <View style={styles.ctaCard}>
                <View style={styles.ctaIconContainer}>
                  <Ionicons name="search" size={24} color={theme.colors.techBlue} />
                </View>
                <Text style={styles.ctaTitle}>CAN'T FIND WHAT YOU'RE LOOKING FOR?</Text>
                <Text style={styles.ctaText}>
                  Use the search bar above or browse by body part to find specific exercises
                </Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  activeOpacity={0.8}
                  onPress={() => setSearchVisible(true)}
                >
                  <LinearGradient
                    colors={theme.gradients.buttonPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButtonGradient}
                  >
                    <Text style={styles.ctaButtonText}>SEARCH EXERCISES</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
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
    paddingBottom: theme.spacing['4xl'],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Search
  searchContainer: {
    marginBottom: theme.spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
  },
  searchResults: {
    marginTop: theme.spacing.md,
  },
  searchResultsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steelDark,
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  searchList: {
    paddingBottom: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },

  // Sections
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },

  // Horizontal lists
  horizontalList: {
    paddingRight: theme.spacing.lg,
  },
  horizontalCard: {
    width: 200,
    marginRight: theme.spacing.md,
  },
  featuredList: {
    paddingRight: theme.spacing.lg,
  },
  featuredCard: {
    width: 280,
    marginRight: theme.spacing.md,
  },

  // Body Parts
  bodyPartsRow: {
    paddingRight: theme.spacing.lg,
  },
  bodyPartCard: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: 90,
    marginRight: theme.spacing.sm,
  },
  bodyPartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bodyPartName: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Pain Relief
  painReliefRow: {
    paddingRight: theme.spacing.lg,
  },
  painCard: {
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.techGreen + '40',
    padding: theme.spacing.md,
    width: 140,
    marginRight: theme.spacing.sm,
  },
  painIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.techGreen + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  painName: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  painDesc: {
    fontSize: 10,
    color: theme.colors.steelDark,
    lineHeight: 14,
  },

  // Loading & Error
  loader: {
    marginVertical: theme.spacing.xl,
  },
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.techRed,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
  },
  retryText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.techBlue,
    letterSpacing: 1,
  },

  // CTA
  ctaCard: {
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.techBlue + '20',
    borderWidth: 2,
    borderColor: theme.colors.techBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ctaTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  ctaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.steelDark,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  ctaButton: {
    width: '100%',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
