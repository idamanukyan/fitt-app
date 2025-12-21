/**
 * LogMealScreen - Food logging with search and camera scanning
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import FoodRow, { FoodItemData } from '../components/nutrition/FoodRow';
import MacroSummaryBar from '../components/nutrition/MacroSummaryBar';
import FoodCameraScanner from '../components/FoodCameraScanner';
import { DetectedFood } from '../services/aiFoodScanner';

// Theme
import theme from '../utils/theme';

// Services
import { createMeal, addFoodToMeal, createFoodItem } from '../services/nutritionService';
import { MealType } from '../types/nutrition.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// COMPREHENSIVE FOOD DATABASE
// ============================================================================
const foodDatabase: FoodItemData[] = [
  // Proteins
  { id: 1, name: 'Chicken Breast (grilled)', category: 'protein', serving: '100g', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, image: '🍗', isVerified: true },
  { id: 2, name: 'Salmon (baked)', category: 'protein', serving: '100g', calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, image: '🐟', isVerified: true },
  { id: 3, name: 'Eggs (whole)', category: 'protein', serving: '2 large', calories: 156, protein: 12, carbs: 1.2, fats: 10, fiber: 0, image: '🥚', isVerified: true },
  { id: 4, name: 'Beef Steak (lean)', category: 'protein', serving: '100g', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, image: '🥩', isVerified: true },
  { id: 5, name: 'Turkey Breast', category: 'protein', serving: '100g', calories: 135, protein: 30, carbs: 0, fats: 1, fiber: 0, image: '🦃', isVerified: true },
  { id: 6, name: 'Tuna (canned)', category: 'protein', serving: '100g', calories: 132, protein: 29, carbs: 0, fats: 1, fiber: 0, image: '🐟', isVerified: true },
  { id: 7, name: 'Shrimp', category: 'protein', serving: '100g', calories: 99, protein: 24, carbs: 0, fats: 0.3, fiber: 0, image: '🦐', isVerified: true },
  { id: 8, name: 'Tofu (firm)', category: 'protein', serving: '100g', calories: 144, protein: 17, carbs: 3, fats: 9, fiber: 2, image: '🧊', isVerified: true },
  { id: 9, name: 'Greek Yogurt (plain)', category: 'protein', serving: '170g', calories: 100, protein: 17, carbs: 6, fats: 0.7, fiber: 0, image: '🥛', isVerified: true },
  { id: 10, name: 'Cottage Cheese', category: 'protein', serving: '100g', calories: 98, protein: 11, carbs: 3, fats: 4, fiber: 0, image: '🧀', isVerified: true },

  // Carbs
  { id: 20, name: 'White Rice (cooked)', category: 'carbs', serving: '100g', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, image: '🍚', isVerified: true },
  { id: 21, name: 'Brown Rice (cooked)', category: 'carbs', serving: '100g', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, fiber: 1.8, image: '🍚', isVerified: true },
  { id: 22, name: 'Pasta (cooked)', category: 'carbs', serving: '100g', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, image: '🍝', isVerified: true },
  { id: 23, name: 'Sweet Potato', category: 'carbs', serving: '100g', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3, image: '🍠', isVerified: true },
  { id: 24, name: 'Oatmeal (dry)', category: 'carbs', serving: '40g', calories: 152, protein: 5.3, carbs: 27, fats: 2.7, fiber: 4, image: '🥣', isVerified: true },
  { id: 25, name: 'Quinoa (cooked)', category: 'carbs', serving: '100g', calories: 120, protein: 4.4, carbs: 21, fats: 1.9, fiber: 2.8, image: '🌾', isVerified: true },
  { id: 26, name: 'Bread (whole wheat)', category: 'carbs', serving: '1 slice', calories: 81, protein: 4, carbs: 14, fats: 1, fiber: 2, image: '🍞', isVerified: true },
  { id: 27, name: 'Potato (baked)', category: 'carbs', serving: '100g', calories: 93, protein: 2.5, carbs: 21, fats: 0.1, fiber: 2.2, image: '🥔', isVerified: true },
  { id: 28, name: 'Banana', category: 'carbs', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3.1, image: '🍌', isVerified: true },
  { id: 29, name: 'Apple', category: 'carbs', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4.4, image: '🍎', isVerified: true },

  // Fats
  { id: 40, name: 'Avocado', category: 'fats', serving: '1/2 fruit', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, image: '🥑', isVerified: true },
  { id: 41, name: 'Olive Oil', category: 'fats', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fats: 14, fiber: 0, image: '🫒', isVerified: true },
  { id: 42, name: 'Almonds', category: 'fats', serving: '28g', calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5, image: '🥜', isVerified: true },
  { id: 43, name: 'Peanut Butter', category: 'fats', serving: '2 tbsp', calories: 188, protein: 8, carbs: 6, fats: 16, fiber: 2, image: '🥜', isVerified: true },
  { id: 44, name: 'Walnuts', category: 'fats', serving: '28g', calories: 185, protein: 4.3, carbs: 4, fats: 18, fiber: 2, image: '🥜', isVerified: true },
  { id: 45, name: 'Cheese (cheddar)', category: 'fats', serving: '28g', calories: 113, protein: 7, carbs: 0.4, fats: 9, fiber: 0, image: '🧀', isVerified: true },
  { id: 46, name: 'Butter', category: 'fats', serving: '1 tbsp', calories: 102, protein: 0.1, carbs: 0, fats: 12, fiber: 0, image: '🧈', isVerified: true },

  // Vegetables
  { id: 60, name: 'Broccoli', category: 'vegetables', serving: '100g', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, image: '🥦', isVerified: true },
  { id: 61, name: 'Spinach', category: 'vegetables', serving: '100g', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, image: '🥬', isVerified: true },
  { id: 62, name: 'Mixed Salad', category: 'vegetables', serving: '100g', calories: 20, protein: 1.5, carbs: 3, fats: 0.2, fiber: 2, image: '🥗', isVerified: true },
  { id: 63, name: 'Carrots', category: 'vegetables', serving: '100g', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, image: '🥕', isVerified: true },
  { id: 64, name: 'Bell Peppers', category: 'vegetables', serving: '100g', calories: 31, protein: 1, carbs: 6, fats: 0.3, fiber: 2.1, image: '🫑', isVerified: true },
  { id: 65, name: 'Cucumber', category: 'vegetables', serving: '100g', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, fiber: 0.5, image: '🥒', isVerified: true },
  { id: 66, name: 'Tomatoes', category: 'vegetables', serving: '100g', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, image: '🍅', isVerified: true },
  { id: 67, name: 'Green Beans', category: 'vegetables', serving: '100g', calories: 31, protein: 1.8, carbs: 7, fats: 0.1, fiber: 3.4, image: '🫛', isVerified: true },
  { id: 68, name: 'Asparagus', category: 'vegetables', serving: '100g', calories: 20, protein: 2.2, carbs: 3.9, fats: 0.1, fiber: 2.1, image: '🌿', isVerified: true },

  // Supplements/Drinks
  { id: 80, name: 'Whey Protein Shake', category: 'supplements', serving: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 1, fiber: 0, image: '🥤', isVerified: true },
  { id: 81, name: 'Casein Protein', category: 'supplements', serving: '1 scoop', calories: 110, protein: 24, carbs: 2, fats: 0.5, fiber: 0, image: '🥤', isVerified: true },
  { id: 82, name: 'Mass Gainer', category: 'supplements', serving: '1 scoop', calories: 650, protein: 50, carbs: 85, fats: 10, fiber: 3, image: '🥤', isVerified: true },
  { id: 83, name: 'BCAA Drink', category: 'supplements', serving: '1 serving', calories: 10, protein: 0, carbs: 2, fats: 0, fiber: 0, image: '🥤', isVerified: true },

  // Common Meals
  { id: 100, name: 'Chicken & Rice Bowl', category: 'meals', serving: '1 bowl', calories: 450, protein: 40, carbs: 45, fats: 8, fiber: 2, image: '🍱', isVerified: true },
  { id: 101, name: 'Protein Smoothie', category: 'meals', serving: '1 large', calories: 350, protein: 30, carbs: 40, fats: 8, fiber: 5, image: '🥤', isVerified: true },
  { id: 102, name: 'Salmon Salad', category: 'meals', serving: '1 plate', calories: 380, protein: 35, carbs: 15, fats: 20, fiber: 6, image: '🥗', isVerified: true },
  { id: 103, name: 'Egg White Omelette', category: 'meals', serving: '3 eggs', calories: 180, protein: 24, carbs: 2, fats: 6, fiber: 0, image: '🍳', isVerified: true },
  { id: 104, name: 'Turkey Sandwich', category: 'meals', serving: '1 sandwich', calories: 380, protein: 28, carbs: 35, fats: 12, fiber: 4, image: '🥪', isVerified: true },
  { id: 105, name: 'Burrito Bowl', category: 'meals', serving: '1 bowl', calories: 550, protein: 35, carbs: 55, fats: 18, fiber: 8, image: '🌯', isVerified: true },
  { id: 106, name: 'Steak & Vegetables', category: 'meals', serving: '1 plate', calories: 420, protein: 42, carbs: 15, fats: 22, fiber: 5, image: '🥩', isVerified: true },
];

// Recent foods
const recentFoods: FoodItemData[] = [
  foodDatabase.find(f => f.id === 1)!,
  foodDatabase.find(f => f.id === 20)!,
  foodDatabase.find(f => f.id === 3)!,
  foodDatabase.find(f => f.id === 80)!,
  foodDatabase.find(f => f.id === 24)!,
  foodDatabase.find(f => f.id === 9)!,
];

// Filter types
type QuickFilter = 'high_protein' | 'low_carb' | 'low_fat' | null;

// Convert AI detected food
const convertDetectedFood = (detected: DetectedFood): FoodItemData => ({
  id: detected.id || Math.random().toString(36).substr(2, 9),
  name: detected.name,
  category: 'meals',
  serving: detected.quantity,
  calories: detected.calories,
  protein: detected.protein,
  carbs: detected.carbs,
  fats: detected.fats,
  fiber: detected.fiber,
  image: detected.icon,
  isVerified: false,
  confidence: detected.confidence,
});

export default function LogMealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedFoods, setSelectedFoods] = useState<FoodItemData[]>([]);
  const [activeTab, setActiveTab] = useState<'camera' | 'search' | 'recent'>('search');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItemData | null>(null);

  // Entry animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Smart search with protein-first ranking
  const getFilteredFoods = useCallback(() => {
    let results = [...foodDatabase];

    // Apply search query
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      results = results.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
      );

      // Protein-first ranking when searching "protein"
      if (query.includes('protein')) {
        results.sort((a, b) => b.protein - a.protein);
      }
    }

    // Apply quick filters
    if (activeFilter === 'high_protein') {
      results = results.filter(f => f.protein >= 15);
      results.sort((a, b) => b.protein - a.protein);
    } else if (activeFilter === 'low_carb') {
      results = results.filter(f => f.carbs < 10);
      results.sort((a, b) => a.carbs - b.carbs);
    } else if (activeFilter === 'low_fat') {
      results = results.filter(f => f.fats < 5);
      results.sort((a, b) => a.fats - b.fats);
    }

    return results.slice(0, 15);
  }, [searchQuery, activeFilter]);

  const filteredFoods = getFilteredFoods();

  // Add food
  const addFood = useCallback((food: FoodItemData) => {
    if (!selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods(prev => [...prev, food]);
    }
  }, [selectedFoods]);

  // Remove food
  const removeFood = useCallback((foodId: number | string) => {
    setSelectedFoods(prev => prev.filter(f => f.id !== foodId));
  }, []);

  // Handle AI scanned foods
  const handleScannedFoods = (foods: DetectedFood[]) => {
    const converted = foods.map(convertDetectedFood);
    setSelectedFoods(prev => {
      const newFoods = converted.filter(
        newFood => !prev.find(existing => existing.name === newFood.name)
      );
      return [...prev, ...newFoods];
    });
    setShowCamera(false);
  };

  // Long press to edit portion
  const handleLongPress = (food: FoodItemData) => {
    setEditingFood(food);
    setShowPortionModal(true);
  };

  // Calculate totals
  const totals = selectedFoods.reduce((acc, food) => ({
    calories: acc.calories + food.calories,
    protein: acc.protein + food.protein,
    carbs: acc.carbs + food.carbs,
    fats: acc.fats + food.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  // State for logging
  const [isLogging, setIsLogging] = useState(false);

  // Log meal to backend
  const logMeal = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('No foods selected', 'Please add at least one food item to log.');
      return;
    }

    setIsLogging(true);

    try {
      // Map meal type to backend enum
      const mealTypeMap: Record<string, MealType> = {
        breakfast: MealType.BREAKFAST,
        lunch: MealType.LUNCH,
        dinner: MealType.DINNER,
        snack: MealType.SNACK,
      };

      // Create the meal
      const meal = await createMeal({
        meal_type: mealTypeMap[selectedMeal],
        date: new Date().toISOString().split('T')[0],
        name: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });

      // Add each food to the meal
      for (const food of selectedFoods) {
        // First, try to create or find the food item in the database
        let foodId: number;

        if (typeof food.id === 'number' && food.id > 0 && food.id < 1000) {
          // This is a mock ID from our local database, we need to create it in the backend
          try {
            const createdFood = await createFoodItem({
              name: food.name,
              category: food.category,
              serving_size: parseFloat(food.serving.match(/\d+/)?.[0] || '100'),
              serving_unit: food.serving.includes('g') ? 'g' : food.serving.includes('ml') ? 'ml' : 'serving',
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fats,
              fiber: food.fiber || 0,
            });
            foodId = createdFood.id;
          } catch {
            // If creation fails (maybe already exists), use the local ID
            foodId = food.id as number;
          }
        } else {
          foodId = typeof food.id === 'number' ? food.id : 1;
        }

        // Add food to meal
        await addFoodToMeal(meal.id, {
          food_id: foodId,
          serving_amount: 1,
          total_calories: food.calories,
          total_protein: food.protein,
          total_carbs: food.carbs,
          total_fat: food.fats,
          total_fiber: food.fiber || 0,
        });
      }

      Alert.alert(
        'Meal Logged! ✓',
        `${selectedFoods.length} item(s) logged to ${selectedMeal}\n\n${totals.calories} cal • ${totals.protein}g protein`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error logging meal:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.detail || 'Failed to log meal. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLogging(false);
    }
  };

  // Toggle quick filter
  const toggleFilter = (filter: QuickFilter) => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={theme.gradients.background as any}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Log Meal</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Meal Type Selector */}
      <Animated.View style={[styles.mealSelector, { opacity: headerAnim }]}>
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
          <TouchableOpacity
            key={meal}
            style={[styles.mealButton, selectedMeal === meal && styles.mealButtonActive]}
            onPress={() => setSelectedMeal(meal)}
            activeOpacity={0.7}
          >
            <Text style={[styles.mealIcon]}>
              {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍎'}
            </Text>
            <Text style={[styles.mealButtonText, selectedMeal === meal && styles.mealButtonTextActive]}>
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons
            name="search"
            size={18}
            color={activeTab === 'search' ? theme.colors.techGreen : theme.colors.darkGray}
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'camera' && styles.tabActive]}
          onPress={() => setActiveTab('camera')}
        >
          <View style={styles.aiTabIcon}>
            <Ionicons
              name="sparkles"
              size={14}
              color={activeTab === 'camera' ? theme.colors.techGreen : theme.colors.darkGray}
            />
          </View>
          <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>
            AI Scan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.tabActive]}
          onPress={() => setActiveTab('recent')}
        >
          <Ionicons
            name="time"
            size={18}
            color={activeTab === 'recent' ? theme.colors.techGreen : theme.colors.darkGray}
          />
          <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: contentAnim }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: selectedFoods.length > 0 ? 220 : 100 }}
      >
        {/* Search Tab */}
        {activeTab === 'search' && (
          <View style={styles.searchSection}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={theme.colors.darkGray} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search foods..."
                placeholderTextColor={theme.colors.darkGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.darkGray} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Filters */}
            <View style={styles.filtersRow}>
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'high_protein' && styles.filterChipActive]}
                onPress={() => toggleFilter('high_protein')}
              >
                <Text style={[styles.filterChipText, activeFilter === 'high_protein' && styles.filterChipTextActive]}>
                  High Protein
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'low_carb' && styles.filterChipActive]}
                onPress={() => toggleFilter('low_carb')}
              >
                <Text style={[styles.filterChipText, activeFilter === 'low_carb' && styles.filterChipTextActive]}>
                  Low Carb
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'low_fat' && styles.filterChipActive]}
                onPress={() => toggleFilter('low_fat')}
              >
                <Text style={[styles.filterChipText, activeFilter === 'low_fat' && styles.filterChipTextActive]}>
                  Low Fat
                </Text>
              </TouchableOpacity>
            </View>

            {/* Results or Categories */}
            {searchQuery.length > 0 || activeFilter ? (
              filteredFoods.length > 0 ? (
                <View style={styles.searchResults}>
                  <Text style={styles.sectionTitle}>
                    {activeFilter ? `${activeFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Foods` : 'Results'}
                    <Text style={styles.resultCount}> ({filteredFoods.length})</Text>
                  </Text>
                  {filteredFoods.map((food, index) => (
                    <FoodRow
                      key={food.id}
                      food={food}
                      onAdd={addFood}
                      onRemove={removeFood}
                      onLongPress={handleLongPress}
                      isSelected={selectedFoods.some(f => f.id === food.id)}
                      animationDelay={index * 50}
                      showSwipeHint={index === 0}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="search" size={48} color={theme.colors.darkGray} />
                  </View>
                  <Text style={styles.emptyTitle}>No foods found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try a different search term or use AI Scan to identify your food
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyAction}
                    onPress={() => setActiveTab('camera')}
                  >
                    <Ionicons name="sparkles" size={18} color={theme.colors.techGreen} />
                    <Text style={styles.emptyActionText}>Try AI Scan</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoryGrid}>
                  {[
                    { key: 'protein', emoji: '🍗', label: 'Protein' },
                    { key: 'carbs', emoji: '🍚', label: 'Carbs' },
                    { key: 'fats', emoji: '🥑', label: 'Fats' },
                    { key: 'vegetables', emoji: '🥦', label: 'Veggies' },
                    { key: 'meals', emoji: '🍱', label: 'Meals' },
                    { key: 'supplements', emoji: '🥤', label: 'Supps' },
                  ].map(cat => (
                    <TouchableOpacity
                      key={cat.key}
                      style={styles.categoryCard}
                      onPress={() => setSearchQuery(cat.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={styles.categoryName}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quick Add Section */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quick Add</Text>
                {recentFoods.slice(0, 4).map((food, index) => (
                  <FoodRow
                    key={food.id}
                    food={food}
                    onAdd={addFood}
                    onLongPress={handleLongPress}
                    isSelected={selectedFoods.some(f => f.id === food.id)}
                    animationDelay={index * 50}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* AI Camera Tab */}
        {activeTab === 'camera' && (
          <View style={styles.cameraSection}>
            <View style={styles.cameraCard}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.02)']}
                style={styles.cameraCardGradient}
              >
                <View style={styles.aiIconLarge}>
                  <Ionicons name="sparkles" size={32} color={theme.colors.techGreen} />
                </View>
                <Text style={styles.cameraTitle}>AI Food Recognition</Text>
                <Text style={styles.cameraSubtitle}>
                  Point your camera at any meal and let AI identify the foods and estimate nutrition
                </Text>

                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => setShowCamera(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[theme.colors.techGreen, '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scanButtonGradient}
                  >
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.scanButtonText}>Open Camera</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.featuresGrid}>
                  {[
                    { icon: 'eye', text: 'Identifies multiple foods' },
                    { icon: 'nutrition', text: 'Estimates macros' },
                    { icon: 'barcode', text: 'Scans barcodes' },
                    { icon: 'checkmark-circle', text: 'Works with any meal' },
                  ].map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons
                        name={feature.icon as any}
                        size={16}
                        color={theme.colors.techGreen}
                      />
                      <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Recent Tab */}
        {activeTab === 'recent' && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recently Logged</Text>
            {recentFoods.map((food, index) => (
              <FoodRow
                key={food.id}
                food={food}
                onAdd={addFood}
                onRemove={removeFood}
                onLongPress={handleLongPress}
                isSelected={selectedFoods.some(f => f.id === food.id)}
                animationDelay={index * 50}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Frequent Foods</Text>
            {foodDatabase.slice(0, 5).map((food, index) => (
              <FoodRow
                key={food.id}
                food={food}
                onAdd={addFood}
                onLongPress={handleLongPress}
                isSelected={selectedFoods.some(f => f.id === food.id)}
                animationDelay={(index + recentFoods.length) * 50}
              />
            ))}
          </View>
        )}
      </Animated.ScrollView>

      {/* Macro Summary Bar */}
      <MacroSummaryBar
        totals={totals}
        selectedFoods={selectedFoods.map(f => ({ id: f.id, name: f.name, image: f.image }))}
        onRemoveFood={removeFood}
        onLog={logMeal}
        bottomInset={insets.bottom}
        isLogging={isLogging}
      />

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <FoodCameraScanner
          onClose={() => setShowCamera(false)}
          onFoodSelected={handleScannedFoods}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderRadius: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  mealSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  mealButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  mealIcon: {
    fontSize: 14,
  },
  mealButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.darkGray,
  },
  mealButtonTextActive: {
    color: theme.colors.techGreen,
    fontWeight: '600',
  },
  tabNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.concrete,
  },
  tabActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  aiTabIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.darkGray,
  },
  tabTextActive: {
    color: theme.colors.techGreen,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchSection: {},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.1)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.colors.white,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.techGreen,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.darkGray,
  },
  filterChipTextActive: {
    color: theme.colors.techGreen,
  },
  searchResults: {},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.steel,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  resultCount: {
    color: theme.colors.darkGray,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.concrete,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.techGreen,
  },
  categoriesSection: {},
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 52) / 3,
    backgroundColor: theme.colors.concrete,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.08)',
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.steel,
  },
  cameraSection: {
    paddingTop: 8,
  },
  cameraCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  cameraCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  aiIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.techGreenGlow,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 8,
  },
  cameraSubtitle: {
    fontSize: 14,
    color: theme.colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  scanButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    ...theme.shadows.techGreenGlow,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  featuresGrid: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: theme.colors.steel,
  },
  recentSection: {},
});
