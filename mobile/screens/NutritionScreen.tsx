/**
 * NutritionScreen - Main nutrition tracking interface
 * High-tech architecture design with comprehensive tracking
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import NutritionRing from '../components/atoms/NutritionRing';
import MacroBar from '../components/atoms/MacroBar';
import WaterCup from '../components/atoms/WaterCup';
import MealCard from '../components/molecules/MealCard';
import { MACRO_COLORS, MealType } from '../types/nutrition.types';
import {
  getTodaySummary,
  logWater,
  deleteMeal,
  formatDate,
  mlFromWaterCups,
  waterCupsFromMl,
} from '../services/nutritionService';
import type { DailyNutritionSummary } from '../types/nutrition.types';

export default function NutritionScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date] = useState(new Date());

  const loadSummary = useCallback(async () => {
    try {
      const data = await getTodaySummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load nutrition summary:', error);
      Alert.alert('Error', 'Failed to load nutrition data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSummary();
  };

  const handleAddWater = async () => {
    try {
      await logWater({ amount_ml: 250 }); // Add 1 cup (250ml)
      loadSummary();
    } catch (error) {
      console.error('Failed to log water:', error);
      Alert.alert('Error', 'Failed to log water intake');
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal(mealId);
              loadSummary();
            } catch (error) {
              console.error('Failed to delete meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

  const handleAddMeal = (mealType: MealType) => {
    router.push({
      pathname: '/nutrition/add-meal',
      params: { mealType, date: formatDate(date) },
    } as any);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Loading nutrition data...</Text>
      </LinearGradient>
    );
  }

  if (!summary) {
    return (
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>Failed to load nutrition data</Text>
      </LinearGradient>
    );
  }

  const waterCups = waterCupsFromMl(summary.water.current);
  const waterGoalCups = waterCupsFromMl(summary.water.goal);

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techCyan}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nutrition</Text>
            <Text style={styles.subtitle}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/screens/NutritionGoalsScreen')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.techCyan} />
          </TouchableOpacity>
        </View>

        {/* Calorie Ring */}
        <View style={styles.ringContainer}>
          <NutritionRing
            current={summary.calories.current}
            goal={summary.calories.goal}
            size={200}
            strokeWidth={16}
            label="Daily Calories"
          />
        </View>

        {/* Macro Bars */}
        <View style={styles.macrosContainer}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>

          <MacroBar
            label="Protein"
            current={summary.protein.current}
            goal={summary.protein.goal}
            unit="g"
            color={MACRO_COLORS.protein}
            icon="💪"
          />

          <MacroBar
            label="Carbs"
            current={summary.carbs.current}
            goal={summary.carbs.goal}
            unit="g"
            color={MACRO_COLORS.carbs}
            icon="🌾"
          />

          <MacroBar
            label="Fat"
            current={summary.fat.current}
            goal={summary.fat.goal}
            unit="g"
            color={MACRO_COLORS.fat}
            icon="🥑"
          />

          <MacroBar
            label="Fiber"
            current={summary.fiber.current}
            goal={summary.fiber.goal}
            unit="g"
            color={theme.colors.techOrange}
            icon="🌿"
          />
        </View>

        {/* Water Intake */}
        <View style={styles.waterContainer}>
          <View style={styles.waterHeader}>
            <Text style={styles.sectionTitle}>Water Intake</Text>
            <Text style={styles.waterProgress}>
              {waterCups} / {waterGoalCups} cups
            </Text>
          </View>

          <View style={styles.waterCupsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.waterCupsRow}>
                {Array.from({ length: waterGoalCups }, (_, i) => (
                  <WaterCup
                    key={i}
                    filled={i < waterCups}
                    onPress={i >= waterCups ? handleAddWater : undefined}
                    size={50}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.addWaterButton} onPress={handleAddWater}>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.techCyan} />
            <Text style={styles.addWaterText}>Add 250ml</Text>
          </TouchableOpacity>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>

          {/* Breakfast */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionLeft}>
                <Ionicons name="sunny-outline" size={20} color={theme.colors.techCyan} />
                <Text style={styles.mealSectionTitle}>Breakfast</Text>
              </View>
              <TouchableOpacity
                style={styles.addMealButton}
                onPress={() => handleAddMeal(MealType.BREAKFAST)}
              >
                <Ionicons name="add-circle" size={24} color={theme.colors.techGreen} />
              </TouchableOpacity>
            </View>
            {summary.meals
              .filter((m) => m.meal_type === MealType.BREAKFAST)
              .map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
          </View>

          {/* Lunch */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionLeft}>
                <Ionicons name="partly-sunny-outline" size={20} color={theme.colors.techCyan} />
                <Text style={styles.mealSectionTitle}>Lunch</Text>
              </View>
              <TouchableOpacity
                style={styles.addMealButton}
                onPress={() => handleAddMeal(MealType.LUNCH)}
              >
                <Ionicons name="add-circle" size={24} color={theme.colors.techGreen} />
              </TouchableOpacity>
            </View>
            {summary.meals
              .filter((m) => m.meal_type === MealType.LUNCH)
              .map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
          </View>

          {/* Dinner */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionLeft}>
                <Ionicons name="moon-outline" size={20} color={theme.colors.techCyan} />
                <Text style={styles.mealSectionTitle}>Dinner</Text>
              </View>
              <TouchableOpacity
                style={styles.addMealButton}
                onPress={() => handleAddMeal(MealType.DINNER)}
              >
                <Ionicons name="add-circle" size={24} color={theme.colors.techGreen} />
              </TouchableOpacity>
            </View>
            {summary.meals
              .filter((m) => m.meal_type === MealType.DINNER)
              .map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
          </View>

          {/* Snacks */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionLeft}>
                <Ionicons name="nutrition-outline" size={20} color={theme.colors.techCyan} />
                <Text style={styles.mealSectionTitle}>Snacks</Text>
              </View>
              <TouchableOpacity
                style={styles.addMealButton}
                onPress={() => handleAddMeal(MealType.SNACK)}
              >
                <Ionicons name="add-circle" size={24} color={theme.colors.techGreen} />
              </TouchableOpacity>
            </View>
            {summary.meals
              .filter((m) => m.meal_type === MealType.SNACK)
              .map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.steel,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.techRed,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  macrosContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  waterContainer: {
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  waterProgress: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.techCyan,
    letterSpacing: -0.5,
  },
  waterCupsContainer: {
    marginBottom: theme.spacing.md,
  },
  waterCupsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addWaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
  },
  addWaterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.techCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealsContainer: {
    marginBottom: theme.spacing.xl,
  },
  mealSection: {
    marginBottom: theme.spacing.xl,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mealSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  mealSectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  addMealButton: {
    padding: 4,
  },
});
