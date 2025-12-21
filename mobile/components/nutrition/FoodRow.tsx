/**
 * FoodRow - Premium Food Item Component with Swipe Gestures
 *
 * Features:
 * - Swipe right to add, swipe left to remove
 * - Long press to edit portion size
 * - Smart badges (High Protein, Lean, Best for Breakfast)
 * - Confidence indicator (verified vs estimated)
 * - Smooth animations on add/remove
 */
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

export interface FoodItemData {
  id: number | string;
  name: string;
  category: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  image: string;
  isVerified?: boolean;
  confidence?: number;
}

interface FoodRowProps {
  food: FoodItemData;
  onAdd: (food: FoodItemData) => void;
  onRemove?: (foodId: number | string) => void;
  onLongPress?: (food: FoodItemData) => void;
  isSelected?: boolean;
  showSwipeHint?: boolean;
  animationDelay?: number;
}

// Smart badge logic
const getBadges = (food: FoodItemData): { label: string; color: string }[] => {
  const badges: { label: string; color: string }[] = [];

  // High Protein badge (protein > 20g per serving)
  if (food.protein >= 20) {
    badges.push({ label: 'High Protein', color: theme.colors.techGreen });
  }

  // Lean badge (high protein, low fat ratio)
  if (food.protein > 15 && food.fats < 5) {
    badges.push({ label: 'Lean', color: theme.colors.techCyan });
  }

  // Low Carb badge
  if (food.carbs < 5 && food.calories > 50) {
    badges.push({ label: 'Low Carb', color: theme.colors.techBlue });
  }

  // Best for Breakfast
  if (['Oatmeal', 'Eggs', 'Greek Yogurt', 'Banana'].some(b => food.name.includes(b))) {
    badges.push({ label: 'Best for Breakfast', color: theme.colors.techOrange });
  }

  return badges.slice(0, 2); // Max 2 badges
};

export default function FoodRow({
  food,
  onAdd,
  onRemove,
  onLongPress,
  isSelected = false,
  showSwipeHint = false,
  animationDelay = 0,
}: FoodRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const badges = getBadges(food);

  // Entry animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit swipe distance
        const clampedX = Math.max(-120, Math.min(120, gestureState.dx));
        translateX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();

        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - Add
          Vibration.vibrate(50);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          animateAdd();
          onAdd(food);
        } else if (gestureState.dx < -SWIPE_THRESHOLD && onRemove) {
          // Swipe left - Remove
          Vibration.vibrate([0, 50, 30, 50]);
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onRemove(food.id);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const animateAdd = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    animateAdd();
    onAdd(food);
  };

  const handleLongPress = () => {
    Vibration.vibrate(100);
    onLongPress?.(food);
  };

  // Background action indicators
  const addOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const removeOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={styles.actionsContainer}>
        {/* Add action (swipe right) */}
        <Animated.View style={[styles.actionLeft, { opacity: addOpacity }]}>
          <LinearGradient
            colors={[theme.colors.techGreen, '#059669']}
            style={styles.actionGradient}
          >
            <Ionicons name="add-circle" size={28} color="#fff" />
            <Text style={styles.actionText}>Add</Text>
          </LinearGradient>
        </Animated.View>

        {/* Remove action (swipe left) */}
        {onRemove && (
          <Animated.View style={[styles.actionRight, { opacity: removeOpacity }]}>
            <LinearGradient
              colors={[theme.colors.techRed, '#DC2626']}
              style={styles.actionGradient}
            >
              <Ionicons name="trash" size={28} color="#fff" />
              <Text style={styles.actionText}>Remove</Text>
            </LinearGradient>
          </Animated.View>
        )}
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.rowContainer,
          isSelected && styles.rowSelected,
          {
            transform: [{ translateX }, { scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.rowContent}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.9}
        >
          {/* Food Emoji */}
          <View style={styles.emojiContainer}>
            <Text style={styles.foodEmoji}>{food.image}</Text>
          </View>

          {/* Food Info */}
          <View style={styles.foodInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.foodName} numberOfLines={1}>
                {food.name}
              </Text>
              {/* Verification indicator */}
              <Ionicons
                name={food.isVerified !== false ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={food.isVerified !== false ? theme.colors.techGreen : theme.colors.darkGray}
                style={styles.verifiedIcon}
              />
            </View>
            <Text style={styles.foodServing}>{food.serving}</Text>

            {/* Smart Badges */}
            {badges.length > 0 && (
              <View style={styles.badgesRow}>
                {badges.map((badge, index) => (
                  <View
                    key={index}
                    style={[styles.badge, { backgroundColor: `${badge.color}20` }]}
                  >
                    <Text style={[styles.badgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confidence indicator for AI scanned foods */}
            {food.confidence !== undefined && (
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${food.confidence * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(food.confidence * 100)}% match
                </Text>
              </View>
            )}
          </View>

          {/* Macros - Calories & Protein dominant */}
          <View style={styles.macrosContainer}>
            <View style={styles.primaryMacros}>
              <Text style={styles.caloriesValue}>{food.calories}</Text>
              <Text style={styles.caloriesLabel}>cal</Text>
            </View>
            <View style={styles.proteinHighlight}>
              <Text style={styles.proteinValue}>{food.protein}g</Text>
              <Text style={styles.proteinLabel}>protein</Text>
            </View>
            <View style={styles.secondaryMacros}>
              <Text style={styles.secondaryMacroText}>
                C: {food.carbs}g • F: {food.fats}g
              </Text>
            </View>
          </View>

          {/* Add button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handlePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LinearGradient
              colors={[theme.colors.techGreen, '#059669']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Swipe hint */}
        {showSwipeHint && (
          <Animated.View style={styles.swipeHint}>
            <Ionicons name="swap-horizontal" size={16} color={theme.colors.darkGray} />
            <Text style={styles.swipeHintText}>Swipe to add/remove</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 10,
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionLeft: {
    width: 100,
    height: '100%',
  },
  actionRight: {
    width: 100,
    height: '100%',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  rowContainer: {
    backgroundColor: theme.colors.concrete,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.1)',
    overflow: 'hidden',
  },
  rowSelected: {
    borderColor: theme.colors.techGreen,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodEmoji: {
    fontSize: 28,
  },
  foodInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  foodServing: {
    fontSize: 12,
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  confidenceBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    maxWidth: 60,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: theme.colors.techGreen,
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: theme.colors.techGreen,
    fontWeight: '500',
  },
  macrosContainer: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  primaryMacros: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  caloriesValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
  },
  caloriesLabel: {
    fontSize: 11,
    color: theme.colors.darkGray,
  },
  proteinHighlight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 2,
  },
  proteinValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.techGreen,
  },
  proteinLabel: {
    fontSize: 10,
    color: theme.colors.techGreen,
    opacity: 0.8,
  },
  secondaryMacros: {
    marginTop: 4,
  },
  secondaryMacroText: {
    fontSize: 10,
    color: theme.colors.darkGray,
    opacity: 0.7,
  },
  addButton: {
    marginLeft: 4,
  },
  addButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  swipeHintText: {
    fontSize: 10,
    color: theme.colors.darkGray,
  },
});
