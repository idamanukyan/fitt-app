/**
 * MealCard - Display meal with foods and nutrition totals
 * High-tech architecture design with structural clarity
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MealWithTotals, MealType } from '../../types/nutrition.types';
import theme from '../../utils/theme';

interface MealCardProps {
  meal: MealWithTotals;
  onPress?: () => void;
  onDelete?: () => void;
}

const getMealIcon = (mealType: MealType): keyof typeof Ionicons.glyphMap => {
  switch (mealType) {
    case MealType.BREAKFAST:
      return 'sunny-outline';
    case MealType.LUNCH:
      return 'partly-sunny-outline';
    case MealType.DINNER:
      return 'moon-outline';
    case MealType.SNACK:
      return 'nutrition-outline';
  }
};

const getMealLabel = (mealType: MealType): string => {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
};

export default function MealCard({ meal, onPress, onDelete }: MealCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[theme.colors.concrete, theme.colors.concreteDark]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getMealIcon(meal.meal_type)}
                size={20}
                color={theme.colors.techCyan}
              />
            </View>
            <View>
              <Text style={styles.mealType}>{getMealLabel(meal.meal_type)}</Text>
              {meal.name && <Text style={styles.mealName}>{meal.name}</Text>}
            </View>
          </View>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.techRed} />
            </TouchableOpacity>
          )}
        </View>

        {/* Foods List */}
        {meal.meal_foods.length > 0 && (
          <View style={styles.foodsList}>
            {meal.meal_foods.map((mealFood, index) => (
              <View key={mealFood.id} style={styles.foodItem}>
                <View style={styles.foodBullet} />
                <Text style={styles.foodText} numberOfLines={1}>
                  {mealFood.food_item.name}
                  {mealFood.serving_amount !== 1 && (
                    <Text style={styles.servingText}>
                      {' '}
                      × {mealFood.serving_amount}
                    </Text>
                  )}
                </Text>
                <Text style={styles.foodCalories}>
                  {Math.round(mealFood.total_calories)} cal
                </Text>
              </View>
            ))}
          </View>
        )}

        {meal.meal_foods.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No foods logged yet</Text>
          </View>
        )}

        {/* Nutrition Totals */}
        {meal.meal_foods.length > 0 && (
          <View style={styles.totalsContainer}>
            <View style={styles.divider} />
            <View style={styles.totals}>
              <View style={styles.totalItem}>
                <Text style={styles.totalValue}>
                  {Math.round(meal.total_calories)}
                </Text>
                <Text style={styles.totalLabel}>Calories</Text>
              </View>

              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: theme.colors.techCyan }]}>
                  {Math.round(meal.total_protein)}g
                </Text>
                <Text style={styles.totalLabel}>Protein</Text>
              </View>

              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: theme.colors.techGreen }]}>
                  {Math.round(meal.total_carbs)}g
                </Text>
                <Text style={styles.totalLabel}>Carbs</Text>
              </View>

              <View style={styles.totalItem}>
                <Text style={[styles.totalValue, { color: theme.colors.techRed }]}>
                  {Math.round(meal.total_fat)}g
                </Text>
                <Text style={styles.totalLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {meal.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{meal.notes}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.iron,
  },
  gradient: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealType: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  mealName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.steel,
    marginTop: 2,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  foodsList: {
    marginBottom: theme.spacing.sm,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: theme.spacing.sm,
  },
  foodBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.techCyan,
  },
  foodText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.chrome,
  },
  servingText: {
    color: theme.colors.steelDark,
    fontWeight: '400',
  },
  foodCalories: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.steelDark,
    fontStyle: 'italic',
  },
  totalsContainer: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.iron,
    marginBottom: theme.spacing.sm,
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  notesContainer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  notesLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '400',
    color: theme.colors.steel,
    lineHeight: 20,
  },
});
