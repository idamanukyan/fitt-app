/**
 * FoodCard - Display food item with nutrition info
 * High-tech architecture design with technical details
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FoodItem } from '../../types/nutrition.types';
import theme from '../../utils/theme';

interface FoodCardProps {
  food: FoodItem;
  onPress?: () => void;
  onAdd?: () => void;
  showMacros?: boolean;
  compact?: boolean;
}

export default function FoodCard({
  food,
  onPress,
  onAdd,
  showMacros = true,
  compact = false,
}: FoodCardProps) {
  const getCategoryIcon = (category: string | null): keyof typeof Ionicons.glyphMap => {
    if (!category) return 'nutrition-outline';
    switch (category.toLowerCase()) {
      case 'protein':
        return 'fish-outline';
      case 'carbs':
        return 'restaurant-outline';
      case 'fruits':
        return 'leaf-outline';
      case 'vegetables':
        return 'flower-outline';
      case 'dairy':
        return 'ice-cream-outline';
      case 'snacks':
        return 'fast-food-outline';
      case 'beverages':
        return 'cafe-outline';
      case 'fats':
        return 'water-outline';
      default:
        return 'nutrition-outline';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={styles.compactLeft}>
          <View style={styles.compactIconContainer}>
            <Ionicons
              name={getCategoryIcon(food.category)}
              size={16}
              color={theme.colors.techBlue}
            />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {food.name}
            </Text>
            {food.brand && (
              <Text style={styles.compactBrand} numberOfLines={1}>
                {food.brand}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.compactRight}>
          <Text style={styles.compactCalories}>{Math.round(food.calories)}</Text>
          <Text style={styles.compactCalLabel}>cal</Text>
        </View>

        {onAdd && (
          <TouchableOpacity
            style={styles.compactAddButton}
            onPress={onAdd}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add-circle" size={28} color={theme.colors.techGreen} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

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
                name={getCategoryIcon(food.category)}
                size={24}
                color={theme.colors.techBlue}
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{food.name}</Text>
              {food.brand && <Text style={styles.brand}>{food.brand}</Text>}
              {food.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{food.category}</Text>
                </View>
              )}
            </View>
          </View>

          {onAdd && (
            <TouchableOpacity style={styles.addButton} onPress={onAdd}>
              <Ionicons
                name="add-circle-outline"
                size={32}
                color={theme.colors.techGreen}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Serving Size */}
        <View style={styles.servingContainer}>
          <Text style={styles.servingLabel}>Serving Size:</Text>
          <Text style={styles.servingValue}>
            {food.serving_size} {food.serving_unit}
          </Text>
        </View>

        {/* Calories */}
        <View style={styles.caloriesContainer}>
          <Text style={styles.caloriesValue}>{Math.round(food.calories)}</Text>
          <Text style={styles.caloriesLabel}>Calories</Text>
        </View>

        {/* Macros */}
        {showMacros && (
          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: theme.colors.techCyan }]} />
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{Math.round(food.protein)}g</Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: theme.colors.techGreen }]} />
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{Math.round(food.carbs)}g</Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: theme.colors.techRed }]} />
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{Math.round(food.fat)}g</Text>
            </View>

            {food.fiber !== null && food.fiber > 0 && (
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: theme.colors.techOrange }]} />
                <Text style={styles.macroLabel}>Fiber</Text>
                <Text style={styles.macroValue}>{Math.round(food.fiber)}g</Text>
              </View>
            )}
          </View>
        )}

        {/* Verified Badge */}
        {food.is_verified === 1 && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.colors.techGreen} />
            <Text style={styles.verifiedText}>Verified</Text>
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
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brand: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.steel,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    padding: 4,
  },
  servingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
  },
  servingLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servingValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.white,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  caloriesValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  caloriesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.steel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.iron,
  },
  verifiedText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.techGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Compact Styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  compactLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  compactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.techBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 2,
  },
  compactBrand: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.steelDark,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactCalories: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  compactCalLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.steelDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactAddButton: {
    marginLeft: theme.spacing.xs,
  },
});
