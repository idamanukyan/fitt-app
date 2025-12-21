/**
 * CategoryChips - Horizontal scrollable category filter
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
import { colors, typography, spacing, radius } from '../../../design/tokens';
import { MUSCLE_CATEGORIES, ExerciseCategory } from '../../types/exercise';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: ExerciseCategory) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {MUSCLE_CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category)}
            activeOpacity={0.7}
          >
            {isActive ? (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.chipActive}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={colors.textInverse}
                />
                <Text style={styles.chipTextActive}>{category.name}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chip}>
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.chipText}>{category.name}</Text>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  chipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  chipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});

export default CategoryChips;
