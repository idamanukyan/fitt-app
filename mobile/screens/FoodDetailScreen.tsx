/**
 * FoodDetailScreen - Full nutrition facts display
 * High-tech architecture design with detailed nutrition label
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import { FoodItem } from '../types/nutrition.types';
import { getFoodItem } from '../services/nutritionService';

export default function FoodDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const foodId = parseInt(params.foodId as string);

  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFood();
  }, []);

  const loadFood = async () => {
    try {
      const data = await getFoodItem(foodId);
      setFood(data);
    } catch (error) {
      console.error('Failed to load food:', error);
      Alert.alert('Error', 'Failed to load food details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.gradients.background} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techCyan} />
      </LinearGradient>
    );
  }

  if (!food) {
    return null;
  }

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.techCyan} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Facts</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Food Info */}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          {food.brand && <Text style={styles.foodBrand}>{food.brand}</Text>}
        </View>

        {/* Nutrition Label */}
        <View style={styles.nutritionLabel}>
          <Text style={styles.labelTitle}>Nutrition Facts</Text>
          <View style={styles.servingContainer}>
            <Text style={styles.servingText}>Serving Size</Text>
            <Text style={styles.servingValue}>
              {food.serving_size} {food.serving_unit}
            </Text>
          </View>

          <View style={styles.thickDivider} />

          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesLabel}>Calories</Text>
            <Text style={styles.caloriesValue}>{Math.round(food.calories)}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.dvLabel}>% Daily Value *</Text>

          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>
              <Text style={styles.bold}>Total Fat</Text> {Math.round(food.fat)}g
            </Text>
          </View>

          {food.saturated_fat !== null && (
            <View style={[styles.nutrientRow, styles.indent]}>
              <Text style={styles.nutrientLabel}>Saturated Fat {Math.round(food.saturated_fat)}g</Text>
            </View>
          )}

          {food.trans_fat !== null && (
            <View style={[styles.nutrientRow, styles.indent]}>
              <Text style={styles.nutrientLabel}>Trans Fat {Math.round(food.trans_fat)}g</Text>
            </View>
          )}

          <View style={styles.divider} />

          {food.cholesterol !== null && (
            <>
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>
                  <Text style={styles.bold}>Cholesterol</Text> {Math.round(food.cholesterol)}mg
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {food.sodium !== null && (
            <>
              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>
                  <Text style={styles.bold}>Sodium</Text> {Math.round(food.sodium)}mg
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>
              <Text style={styles.bold}>Total Carbohydrate</Text> {Math.round(food.carbs)}g
            </Text>
          </View>

          {food.fiber !== null && (
            <View style={[styles.nutrientRow, styles.indent]}>
              <Text style={styles.nutrientLabel}>Dietary Fiber {Math.round(food.fiber)}g</Text>
            </View>
          )}

          {food.sugar !== null && (
            <View style={[styles.nutrientRow, styles.indent]}>
              <Text style={styles.nutrientLabel}>Total Sugars {Math.round(food.sugar)}g</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>
              <Text style={styles.bold}>Protein</Text> {Math.round(food.protein)}g
            </Text>
          </View>

          <View style={styles.thickDivider} />

          <Text style={styles.footnote}>
            * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes
            to a daily diet. 2,000 calories a day is used for general nutrition advice.
          </Text>
        </View>

        {food.is_verified === 1 && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.techGreen} />
            <Text style={styles.verifiedText}>Verified Data</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  foodInfo: {
    marginBottom: theme.spacing.xl,
  },
  foodName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.sm,
  },
  foodBrand: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.steel,
  },
  nutritionLabel: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.black,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  labelTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  servingContainer: {
    marginBottom: theme.spacing.sm,
  },
  servingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  servingValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
  },
  thickDivider: {
    height: 8,
    backgroundColor: theme.colors.black,
    marginVertical: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.black,
    marginVertical: theme.spacing.xs,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  caloriesLabel: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.black,
  },
  caloriesValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.black,
  },
  dvLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.black,
    textAlign: 'right',
    marginVertical: theme.spacing.xs,
  },
  nutrientRow: {
    paddingVertical: theme.spacing.xs,
  },
  indent: {
    paddingLeft: theme.spacing.lg,
  },
  nutrientLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '400',
    color: theme.colors.black,
  },
  bold: {
    fontWeight: '700',
  },
  footnote: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '400',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
    lineHeight: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.concrete,
    borderWidth: 1,
    borderColor: theme.colors.techGreen,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  verifiedText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.techGreen,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
