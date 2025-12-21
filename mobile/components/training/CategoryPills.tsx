/**
 * CategoryPills - Modern Pill-Style Category Filter
 * Matches Dashboard design system
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  typography,
  spacing,
  radius,
  gradients,
} from '../../design/tokens';
import { CATEGORY_FILTERS, CategoryFilter } from '../../types/training.types';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categories?: CategoryFilter[];
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = CATEGORY_FILTERS,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
            activeOpacity={0.7}
          >
            {isSelected ? (
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.pillActive}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={colors.textInverse}
                />
                <Text style={styles.pillTextActive}>{category.name}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.pill}>
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={category.color}
                />
                <Text style={styles.pillText}>{category.name}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.full,
  },
  pillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  pillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  pillTextActive: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});

export default CategoryPills;
