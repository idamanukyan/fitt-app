/**
 * Meal Plan Detail Screen
 * Shows detailed view of a specific meal plan
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import {
  mealPlanService,
  MealPlan,
  getMealTypeDisplay,
  getMealTypeIcon,
  getDietaryPreferenceDisplay,
} from '../../services/mealPlanService';

export default function MealPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealPlan();
  }, [id]);

  const loadMealPlan = async () => {
    try {
      const plan = await mealPlanService.getMealPlan(parseInt(id));
      setMealPlan(plan);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
      Alert.alert('Error', 'Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!mealPlan) return;
    try {
      await mealPlanService.activateMealPlan(mealPlan.id);
      Alert.alert('Success', 'Meal plan activated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to activate meal plan');
    }
  };

  const handleDelete = async () => {
    if (!mealPlan) return;
    Alert.alert('Delete Plan', 'Are you sure you want to delete this meal plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await mealPlanService.deleteMealPlan(mealPlan.id);
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete meal plan');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.gradients.background} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
      </LinearGradient>
    );
  }

  if (!mealPlan) {
    return (
      <LinearGradient colors={theme.gradients.background} style={styles.loadingContainer}>
        <Text style={styles.errorText}>Meal plan not found</Text>
      </LinearGradient>
    );
  }

  const progress = mealPlanService.calculateProgress(mealPlan);

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <Text style={styles.planName}>{mealPlan.name}</Text>
          <Text style={styles.planMeta}>
            {getDietaryPreferenceDisplay(mealPlan.dietary_preference)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mealPlan.target_calories}</Text>
              <Text style={styles.statLabel}>Cal/day</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mealPlan.days.length}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.totalMeals}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progress.completedMeals} completed, {progress.skippedMeals} skipped
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {mealPlan.status !== 'active' && (
            <TouchableOpacity style={styles.activateButton} onPress={handleActivate}>
              <Ionicons name="play" size={20} color={theme.colors.white} />
              <Text style={styles.activateButtonText}>Activate</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.groceryButton}
            onPress={() => router.push(`/meal-plans/grocery-list?planId=${mealPlan.id}`)}
          >
            <Ionicons name="cart-outline" size={20} color={theme.colors.techBlue} />
            <Text style={styles.groceryButtonText}>Grocery List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.techRed} />
          </TouchableOpacity>
        </View>

        {/* Days */}
        {mealPlan.days.map((day) => (
          <View key={day.id} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.day_name}</Text>
              <Text style={styles.dayDate}>
                {new Date(day.day_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.dayMacros}>
              {Math.round(day.total_calories)} cal | {Math.round(day.total_protein)}g protein
            </Text>

            {day.meals.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <Text style={styles.mealIcon}>{getMealTypeIcon(meal.meal_type)}</Text>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>{getMealTypeDisplay(meal.meal_type)}</Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <Text style={styles.mealCalories}>{Math.round(meal.calories)} cal</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.steel,
    fontSize: 16,
  },

  // Header Card
  headerCard: {
    backgroundColor: theme.colors.concreteLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
  },
  planMeta: {
    fontSize: 14,
    color: theme.colors.techBlue,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.steelDark,
    marginTop: 4,
  },
  progressSection: {
    marginTop: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.iron,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.techGreen,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.steelDark,
    marginTop: 8,
    textAlign: 'center',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  activateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.techGreen,
    paddingVertical: 14,
    borderRadius: 12,
  },
  activateButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  groceryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.concreteLight,
    paddingVertical: 14,
    borderRadius: 12,
  },
  groceryButtonText: {
    color: theme.colors.techBlue,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.concreteLight,
    borderRadius: 12,
  },

  // Day Cards
  dayCard: {
    backgroundColor: theme.colors.concreteLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  dayDate: {
    fontSize: 14,
    color: theme.colors.steelDark,
  },
  dayMacros: {
    fontSize: 13,
    color: theme.colors.steelDark,
    marginTop: 4,
    marginBottom: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 11,
    color: theme.colors.techBlue,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  mealName: {
    fontSize: 14,
    color: theme.colors.white,
    marginTop: 2,
  },
  mealCalories: {
    fontSize: 14,
    color: theme.colors.steelDark,
    fontWeight: '500',
  },
});
