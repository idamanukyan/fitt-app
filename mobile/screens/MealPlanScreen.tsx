/**
 * MealPlanScreen - AI-Generated Meal Plan Interface
 * High-tech architecture design with weekly planning
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
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import {
  mealPlanService,
  MealPlan,
  MealPlanSummary,
  MealPlanMeal,
  MealPlanDay,
  DietaryPreference,
  GenerateMealPlanRequest,
  formatDateForApi,
  getMealTypeDisplay,
  getMealTypeIcon,
  getDietaryPreferenceDisplay,
} from '../services/mealPlanService';

// Dietary preference options
const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'none', label: 'No Restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'high_protein', label: 'High Protein' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'dairy_free', label: 'Dairy Free' },
];

export default function MealPlanScreen() {
  const router = useRouter();
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [allPlans, setAllPlans] = useState<MealPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Generation form state
  const [targetCalories, setTargetCalories] = useState('2000');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('none');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [includeSnacks, setIncludeSnacks] = useState(true);
  const [days, setDays] = useState(7);

  const loadData = useCallback(async () => {
    try {
      const [active, plans] = await Promise.all([
        mealPlanService.getActiveMealPlan(),
        mealPlanService.getMealPlans(),
      ]);
      setActivePlan(active);
      setAllPlans(plans.meal_plans);
    } catch (error) {
      console.error('Failed to load meal plans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const request: GenerateMealPlanRequest = {
        start_date: formatDateForApi(new Date()),
        days,
        target_calories: parseInt(targetCalories) || 2000,
        dietary_preference: dietaryPreference,
        meals_per_day: mealsPerDay,
        include_snacks: includeSnacks,
      };

      const result = await mealPlanService.generateMealPlan(request);
      setShowGenerateModal(false);

      // Activate the new plan
      await mealPlanService.activateMealPlan(result.meal_plan.id);

      Alert.alert(
        'Meal Plan Generated!',
        `Your ${days}-day meal plan is ready. Generated using ${result.ai_provider}.`,
        [{ text: 'View Plan', onPress: loadData }]
      );
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate meal plan. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteMeal = async (mealId: number) => {
    try {
      await mealPlanService.completeMeal(mealId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark meal as completed');
    }
  };

  const handleSkipMeal = async (mealId: number) => {
    try {
      await mealPlanService.skipMeal(mealId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to skip meal');
    }
  };

  const renderMealCard = (meal: MealPlanMeal) => {
    const totalTime = (meal.prep_time_minutes || 0) + (meal.cook_time_minutes || 0);

    return (
      <View
        key={meal.id}
        style={[
          styles.mealCard,
          meal.is_completed && styles.mealCardCompleted,
          meal.is_skipped && styles.mealCardSkipped,
        ]}
      >
        <View style={styles.mealHeader}>
          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealTypeIcon}>{getMealTypeIcon(meal.meal_type)}</Text>
            <Text style={styles.mealType}>{getMealTypeDisplay(meal.meal_type)}</Text>
          </View>
          {meal.is_completed && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.techGreen} />
              <Text style={styles.statusText}>Done</Text>
            </View>
          )}
          {meal.is_skipped && (
            <View style={[styles.statusBadge, styles.skippedBadge]}>
              <Ionicons name="close-circle" size={16} color={theme.colors.steelDark} />
              <Text style={[styles.statusText, styles.skippedText]}>Skipped</Text>
            </View>
          )}
        </View>

        <Text style={styles.mealName}>{meal.name}</Text>
        {meal.description && (
          <Text style={styles.mealDescription}>{meal.description}</Text>
        )}

        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(meal.calories)}</Text>
            <Text style={styles.macroLabel}>Cal</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(meal.protein)}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(meal.carbs)}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{Math.round(meal.fat)}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {totalTime > 0 && (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.steelDark} />
            <Text style={styles.timeText}>{totalTime} min</Text>
          </View>
        )}

        {!meal.is_completed && !meal.is_skipped && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteMeal(meal.id)}
            >
              <Ionicons name="checkmark" size={18} color={theme.colors.white} />
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSkipMeal(meal.id)}
            >
              <Ionicons name="close" size={18} color={theme.colors.steelDark} />
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderDayTabs = () => {
    if (!activePlan) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabs}
        contentContainerStyle={styles.dayTabsContent}
      >
        {activePlan.days.map((day, index) => (
          <TouchableOpacity
            key={day.id}
            style={[styles.dayTab, selectedDayIndex === index && styles.dayTabActive]}
            onPress={() => setSelectedDayIndex(index)}
          >
            <Text
              style={[styles.dayTabName, selectedDayIndex === index && styles.dayTabNameActive]}
            >
              {day.day_name.slice(0, 3)}
            </Text>
            <Text
              style={[styles.dayTabDate, selectedDayIndex === index && styles.dayTabDateActive]}
            >
              {new Date(day.day_date).getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderGenerateModal = () => (
    <Modal
      visible={showGenerateModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowGenerateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate Meal Plan</Text>
            <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.steel} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Daily Calories Target</Text>
            <TextInput
              style={styles.input}
              value={targetCalories}
              onChangeText={setTargetCalories}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor={theme.colors.steelDark}
            />

            <Text style={styles.inputLabel}>Dietary Preference</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
              {DIETARY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    dietaryPreference === option.value && styles.optionChipActive,
                  ]}
                  onPress={() => setDietaryPreference(option.value)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      dietaryPreference === option.value && styles.optionChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Days</Text>
            <View style={styles.daysSelector}>
              {[3, 5, 7, 14].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayOption, days === d && styles.dayOptionActive]}
                  onPress={() => setDays(d)}
                >
                  <Text style={[styles.dayOptionText, days === d && styles.dayOptionTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Meals per Day</Text>
            <View style={styles.daysSelector}>
              {[2, 3, 4, 5].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.dayOption, mealsPerDay === m && styles.dayOptionActive]}
                  onPress={() => setMealsPerDay(m)}
                >
                  <Text style={[styles.dayOptionText, mealsPerDay === m && styles.dayOptionTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.snackToggle}
              onPress={() => setIncludeSnacks(!includeSnacks)}
            >
              <Ionicons
                name={includeSnacks ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.techBlue}
              />
              <Text style={styles.snackToggleText}>Include snacks</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleGeneratePlan}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={theme.colors.white} />
                <Text style={styles.generateButtonText}>Generate with AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.gradients.background} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading meal plans...</Text>
      </LinearGradient>
    );
  }

  const currentDay = activePlan?.days[selectedDayIndex];

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
            <Text style={styles.title}>Meal Plans</Text>
            <Text style={styles.subtitle}>AI-Powered Nutrition Planning</Text>
          </View>
          <TouchableOpacity
            style={styles.generateHeaderButton}
            onPress={() => setShowGenerateModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Active Plan */}
        {activePlan ? (
          <View style={styles.activePlanSection}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{activePlan.name}</Text>
                <Text style={styles.planMeta}>
                  {getDietaryPreferenceDisplay(activePlan.dietary_preference)} •{' '}
                  {activePlan.target_calories} cal/day
                </Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Active</Text>
              </View>
            </View>

            {/* Progress */}
            {(() => {
              const progress = mealPlanService.calculateProgress(activePlan);
              return (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${progress.progressPercent}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.completedMeals} of {progress.totalMeals} meals completed
                  </Text>
                </View>
              );
            })()}

            {/* Day Tabs */}
            {renderDayTabs()}

            {/* Day Summary */}
            {currentDay && (
              <View style={styles.daySummary}>
                <Text style={styles.daySummaryTitle}>{currentDay.day_name}</Text>
                <View style={styles.daySummaryMacros}>
                  <Text style={styles.daySummaryMacro}>
                    {Math.round(currentDay.total_calories)} cal
                  </Text>
                  <Text style={styles.daySummaryMacro}>
                    {Math.round(currentDay.total_protein)}g protein
                  </Text>
                </View>
              </View>
            )}

            {/* Meals */}
            <View style={styles.mealsSection}>
              {currentDay?.meals.map(renderMealCard)}
            </View>
          </View>
        ) : (
          /* No Active Plan */
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={theme.colors.steelDark} />
            <Text style={styles.emptyStateTitle}>No Active Meal Plan</Text>
            <Text style={styles.emptyStateText}>
              Generate a personalized meal plan with AI based on your nutrition goals
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowGenerateModal(true)}
            >
              <Ionicons name="sparkles" size={20} color={theme.colors.white} />
              <Text style={styles.createButtonText}>Generate Meal Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Past Plans */}
        {allPlans.length > 0 && (
          <View style={styles.pastPlansSection}>
            <Text style={styles.sectionTitle}>Past Plans</Text>
            {allPlans
              .filter((p) => p.status !== 'active')
              .slice(0, 5)
              .map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.pastPlanCard}
                  onPress={() => {
                    // Navigate to plan detail or activate
                  }}
                >
                  <View>
                    <Text style={styles.pastPlanName}>{plan.name}</Text>
                    <Text style={styles.pastPlanMeta}>
                      {plan.days_count} days • {plan.total_meals} meals •{' '}
                      {Math.round(plan.avg_daily_calories)} cal/day
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.steelDark} />
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>

      {renderGenerateModal()}
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
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.steel,
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.steelDark,
    marginTop: 4,
  },
  generateHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.techBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Active Plan
  activePlanSection: {
    paddingHorizontal: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
  },
  planMeta: {
    fontSize: 14,
    color: theme.colors.steelDark,
    marginTop: 4,
  },
  planBadge: {
    backgroundColor: theme.colors.techGreen + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    color: theme.colors.techGreen,
    fontSize: 12,
    fontWeight: '600',
  },

  // Progress
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.concreteLight,
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
  },

  // Day Tabs
  dayTabs: {
    marginBottom: 16,
  },
  dayTabsContent: {
    paddingRight: 20,
  },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.concreteLight,
  },
  dayTabActive: {
    backgroundColor: theme.colors.techBlue,
  },
  dayTabName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.steelDark,
  },
  dayTabNameActive: {
    color: theme.colors.white,
  },
  dayTabDate: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.steel,
    marginTop: 4,
  },
  dayTabDateActive: {
    color: theme.colors.white,
  },

  // Day Summary
  daySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  daySummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  daySummaryMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  daySummaryMacro: {
    fontSize: 14,
    color: theme.colors.steelDark,
  },

  // Meals
  mealsSection: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: theme.colors.concreteLight,
    borderRadius: 16,
    padding: 16,
  },
  mealCardCompleted: {
    opacity: 0.7,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.techGreen,
  },
  mealCardSkipped: {
    opacity: 0.5,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeIcon: {
    fontSize: 18,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.techBlue,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skippedBadge: {},
  statusText: {
    fontSize: 12,
    color: theme.colors.techGreen,
    fontWeight: '500',
  },
  skippedText: {
    color: theme.colors.steelDark,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: theme.colors.steelDark,
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
    marginTop: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  macroLabel: {
    fontSize: 11,
    color: theme.colors.steelDark,
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    backgroundColor: theme.colors.iron,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.steelDark,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.techGreen,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  skipButtonText: {
    color: theme.colors.steelDark,
    fontWeight: '500',
    fontSize: 14,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.steelDark,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.techBlue,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  createButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 16,
  },

  // Past Plans
  pastPlansSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 16,
  },
  pastPlanCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.concreteLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  pastPlanName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.white,
  },
  pastPlanMeta: {
    fontSize: 13,
    color: theme.colors.steelDark,
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.concrete,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.steel,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.concreteLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.white,
  },
  optionsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.concreteLight,
    marginRight: 8,
  },
  optionChipActive: {
    backgroundColor: theme.colors.techBlue,
  },
  optionChipText: {
    fontSize: 14,
    color: theme.colors.steel,
  },
  optionChipTextActive: {
    color: theme.colors.white,
  },
  daysSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  dayOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.concreteLight,
    alignItems: 'center',
  },
  dayOptionActive: {
    backgroundColor: theme.colors.techBlue,
  },
  dayOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.steel,
  },
  dayOptionTextActive: {
    color: theme.colors.white,
  },
  snackToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  snackToggleText: {
    fontSize: 16,
    color: theme.colors.white,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.techBlue,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
