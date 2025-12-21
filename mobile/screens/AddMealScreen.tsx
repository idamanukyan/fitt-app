/**
 * AddMealScreen - Add/edit meals with food search
 * High-tech architecture design with search functionality
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import FoodCard from '../components/molecules/FoodCard';
import { MealType, FoodItem } from '../types/nutrition.types';
import {
  searchFoodItems,
  createMeal,
  addFoodToMeal,
} from '../services/nutritionService';

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mealType = (params.mealType as MealType) || MealType.BREAKFAST;
  const date = (params.date as string) || new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [mealName, setMealName] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Array<{ food: FoodItem; servings: number }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setSearching(true);
    try {
      const results = await searchFoodItems(searchQuery);
      setSearchResults(results.results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFood = (food: FoodItem) => {
    const existing = selectedFoods.find((item) => item.food.id === food.id);
    if (existing) {
      Alert.alert('Already Added', 'This food is already in your meal');
      return;
    }
    setSelectedFoods([...selectedFoods, { food, servings: 1 }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFood = (foodId: number) => {
    setSelectedFoods(selectedFoods.filter((item) => item.food.id !== foodId));
  };

  const handleUpdateServings = (foodId: number, servings: number) => {
    if (servings <= 0) {
      handleRemoveFood(foodId);
      return;
    }
    setSelectedFoods(
      selectedFoods.map((item) =>
        item.food.id === foodId ? { ...item, servings } : item
      )
    );
  };

  const handleSave = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('No Foods', 'Please add at least one food to the meal');
      return;
    }

    setSaving(true);
    try {
      // Create meal
      const meal = await createMeal({
        meal_type: mealType,
        name: mealName || undefined,
        date,
        foods: selectedFoods.map((item) => ({
          food_id: item.food.id,
          serving_amount: item.servings,
        })),
      });

      Alert.alert('Success', 'Meal logged successfully');
      router.back();
    } catch (error) {
      console.error('Failed to save meal:', error);
      Alert.alert('Error', 'Failed to save meal');
    } finally {
      setSaving(false);
    }
  };

  const getMealTypeLabel = (type: MealType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const totalCalories = selectedFoods.reduce(
    (sum, item) => sum + item.food.calories * item.servings,
    0
  );

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.techCyan} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Add {getMealTypeLabel(mealType)}</Text>
          <Text style={styles.subtitle}>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || selectedFoods.length === 0}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.techGreen} />
          ) : (
            <Ionicons name="checkmark" size={24} color={theme.colors.techGreen} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Meal Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.sectionLabel}>Meal Name (Optional)</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g., Post-Workout Breakfast"
            placeholderTextColor={theme.colors.steelDark}
            value={mealName}
            onChangeText={setMealName}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.sectionLabel}>Search Foods</Text>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.steelDark} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or brand..."
              placeholderTextColor={theme.colors.steelDark}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.steelDark} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {searching && (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color={theme.colors.techCyan} />
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        )}

        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchResults.length} Results
            </Text>
            {searchResults.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAdd={() => handleAddFood(food)}
                compact
              />
            ))}
          </View>
        )}

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <View style={styles.selectedContainer}>
            <View style={styles.selectedHeader}>
              <Text style={styles.sectionLabel}>Selected Foods</Text>
              <View style={styles.totalCaloriesContainer}>
                <Text style={styles.totalCaloriesValue}>
                  {Math.round(totalCalories)}
                </Text>
                <Text style={styles.totalCaloriesLabel}>cal</Text>
              </View>
            </View>

            {selectedFoods.map((item) => (
              <View key={item.food.id} style={styles.selectedFoodItem}>
                <View style={styles.selectedFoodInfo}>
                  <Text style={styles.selectedFoodName} numberOfLines={1}>
                    {item.food.name}
                  </Text>
                  <Text style={styles.selectedFoodCalories}>
                    {Math.round(item.food.calories * item.servings)} cal
                  </Text>
                </View>

                <View style={styles.servingsControl}>
                  <TouchableOpacity
                    style={styles.servingsButton}
                    onPress={() => handleUpdateServings(item.food.id, item.servings - 0.5)}
                  >
                    <Ionicons name="remove" size={16} color={theme.colors.white} />
                  </TouchableOpacity>

                  <Text style={styles.servingsValue}>
                    {item.servings} {item.food.serving_unit}
                  </Text>

                  <TouchableOpacity
                    style={styles.servingsButton}
                    onPress={() => handleUpdateServings(item.food.id, item.servings + 0.5)}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFood(item.food.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.techRed} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {selectedFoods.length === 0 && !searching && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={theme.colors.steelDark} />
            <Text style={styles.emptyText}>Search and add foods to your meal</Text>
            <Text style={styles.emptySubtext}>
              Start typing to search our database of foods
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  nameContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  nameInput: {
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    color: theme.colors.white,
  },
  searchContainer: {
    marginBottom: theme.spacing.xl,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    color: theme.colors.white,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  searchingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    marginTop: theme.spacing.sm,
  },
  resultsContainer: {
    marginBottom: theme.spacing.xl,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  selectedContainer: {
    marginBottom: theme.spacing.xl,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  totalCaloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalCaloriesValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.techCyan,
    letterSpacing: -0.5,
  },
  totalCaloriesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  selectedFoodInfo: {
    flex: 1,
  },
  selectedFoodName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  selectedFoodCalories: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  servingsButton: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
    minWidth: 60,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.steel,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.steelDark,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
