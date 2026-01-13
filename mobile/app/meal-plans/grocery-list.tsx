/**
 * Grocery List Screen
 * Shows shopping list generated from meal plan
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
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';
import { mealPlanService, GroceryList, GroceryItem } from '../../services/mealPlanService';

export default function GroceryListScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroceryList();
  }, [planId]);

  const loadGroceryList = async () => {
    try {
      const list = await mealPlanService.getGroceryList(parseInt(planId));
      setGroceryList(list);
    } catch (error) {
      console.error('Failed to load grocery list:', error);
      Alert.alert('Error', 'Failed to load grocery list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleItem = async (itemId: number, currentStatus: boolean) => {
    try {
      await mealPlanService.toggleGroceryItem(itemId, !currentStatus);
      loadGroceryList();
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroceryList();
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      produce: 'leaf',
      meat: 'restaurant',
      dairy: 'water',
      grains: 'nutrition',
      frozen: 'snow',
      canned: 'cube',
      condiments: 'flask',
      beverages: 'beer',
      snacks: 'fast-food',
      bakery: 'pizza',
      other: 'basket',
    };
    return icons[category.toLowerCase()] || 'basket';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      produce: theme.colors.techGreen,
      meat: theme.colors.techRed,
      dairy: theme.colors.techBlue,
      grains: theme.colors.techOrange,
      frozen: theme.colors.techCyan,
      canned: theme.colors.techPurple,
      condiments: theme.colors.neonYellow,
      beverages: theme.colors.techBlue,
      snacks: theme.colors.neonOrange,
      bakery: theme.colors.techOrange,
      other: theme.colors.steel,
    };
    return colors[category.toLowerCase()] || theme.colors.steel;
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.gradients.background} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
      </LinearGradient>
    );
  }

  if (!groceryList) {
    return (
      <LinearGradient colors={theme.gradients.background} style={styles.loadingContainer}>
        <Text style={styles.errorText}>Grocery list not found</Text>
      </LinearGradient>
    );
  }

  const progress = mealPlanService.calculateGroceryProgress(groceryList);
  const categories = Object.keys(groceryList.items_by_category);

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techCyan}
          />
        }
      >
        {/* Progress Header */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{groceryList.name}</Text>
            <Text style={styles.progressCount}>
              {progress.purchasedItems}/{progress.totalItems}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress.progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress.progressPercent}% purchased
          </Text>
        </View>

        {/* Categories */}
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={20}
                color={getCategoryColor(category)}
              />
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text style={styles.categoryCount}>
                {groceryList.items_by_category[category].filter((i) => i.is_purchased).length}/
                {groceryList.items_by_category[category].length}
              </Text>
            </View>

            {groceryList.items_by_category[category].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, item.is_purchased && styles.itemRowPurchased]}
                onPress={() => handleToggleItem(item.id, item.is_purchased)}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.is_purchased && styles.checkboxChecked,
                  ]}
                >
                  {item.is_purchased && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, item.is_purchased && styles.itemNamePurchased]}
                  >
                    {item.name}
                  </Text>
                  {item.quantity > 1 && (
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit || 'units'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
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

  // Progress Card
  progressCard: {
    backgroundColor: theme.colors.concreteLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.techGreen,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.iron,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.techGreen,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.steelDark,
    marginTop: 8,
    textAlign: 'center',
  },

  // Category
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.iron,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  categoryCount: {
    fontSize: 14,
    color: theme.colors.steelDark,
  },

  // Item
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemRowPurchased: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.steelDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.techGreen,
    borderColor: theme.colors.techGreen,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: theme.colors.white,
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: theme.colors.steelDark,
  },
  itemQuantity: {
    fontSize: 13,
    color: theme.colors.steelDark,
    marginTop: 2,
  },
});
