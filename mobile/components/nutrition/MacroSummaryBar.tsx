/**
 * MacroSummaryBar - Reactive Bottom Summary with Animated Values
 *
 * Features:
 * - Animated value changes
 * - Color changes based on goal progress
 * - Green when protein goal met
 * - Warning color when carbs/fats exceed targets
 * - Sticky CTA button
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import theme from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface SelectedFood {
  id: number | string;
  name: string;
  image: string;
}

interface MacroSummaryBarProps {
  totals: MacroTotals;
  goals?: MacroGoals;
  selectedFoods: SelectedFood[];
  onRemoveFood: (foodId: number | string) => void;
  onLog: () => void;
  bottomInset?: number;
  isLogging?: boolean;
}

// Animated number component
const AnimatedNumber = ({
  value,
  suffix = '',
  style,
  isGoalMet,
  isExceeded,
}: {
  value: number;
  suffix?: string;
  style?: any;
  isGoalMet?: boolean;
  isExceeded?: boolean;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(value);
  const [display, setDisplay] = React.useState(value);

  useEffect(() => {
    const startValue = displayValue.current;
    displayValue.current = value;

    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: animValue }) => {
      const current = Math.round(startValue + (value - startValue) * animValue);
      setDisplay(current);
    });

    return () => animatedValue.removeListener(listener);
  }, [value]);

  const getColor = () => {
    if (isGoalMet) return theme.colors.techGreen;
    if (isExceeded) return theme.colors.techOrange;
    return theme.colors.white;
  };

  return (
    <Text style={[style, { color: getColor() }]}>
      {display}{suffix}
    </Text>
  );
};

// Circular progress indicator
const CircularProgress = ({
  progress,
  size = 40,
  strokeWidth = 3,
  color,
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  children?: React.ReactNode;
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: Math.min(progress, 1),
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: `${color}30`,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: progress > 0.25 ? color : 'transparent',
          borderBottomColor: progress > 0.5 ? color : 'transparent',
          borderLeftColor: progress > 0.75 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {children}
    </View>
  );
};

export default function MacroSummaryBar({
  totals,
  goals = { calories: 2200, protein: 150, carbs: 250, fats: 70 },
  selectedFoods,
  onRemoveFood,
  onLog,
  bottomInset = 0,
  isLogging = false,
}: MacroSummaryBarProps) {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (selectedFoods.length > 0) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedFoods.length]);

  // Calculate progress percentages
  const proteinProgress = totals.protein / goals.protein;
  const carbsProgress = totals.carbs / goals.carbs;
  const fatsProgress = totals.fats / goals.fats;
  const caloriesProgress = totals.calories / goals.calories;

  // Determine status colors
  const isProteinGoalMet = proteinProgress >= 1;
  const isCarbsExceeded = carbsProgress > 1;
  const isFatsExceeded = fatsProgress > 1;
  const isCaloriesExceeded = caloriesProgress > 1;

  if (selectedFoods.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          paddingBottom: bottomInset + 16,
        },
      ]}
    >
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
      <View style={styles.glowOverlay} />

      {/* Selected Foods Chips */}
      <View style={styles.selectedFoodsContainer}>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {selectedFoods.map((food, index) => (
            <Animated.View
              key={food.id}
              style={[
                styles.foodChip,
                {
                  transform: [{
                    scale: scaleAnim.interpolate({
                      inputRange: [0.9, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.chipEmoji}>{food.image}</Text>
              <TouchableOpacity
                style={styles.chipRemove}
                onPress={() => onRemoveFood(food.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={12} color={theme.colors.white} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.ScrollView>
      </View>

      {/* Macro Summary */}
      <View style={styles.macroSummary}>
        {/* Calories - Primary */}
        <View style={styles.macroItem}>
          <CircularProgress
            progress={caloriesProgress}
            size={44}
            color={isCaloriesExceeded ? theme.colors.techOrange : theme.colors.techBlue}
          >
            <Ionicons
              name="flame"
              size={18}
              color={isCaloriesExceeded ? theme.colors.techOrange : theme.colors.techBlue}
            />
          </CircularProgress>
          <View style={styles.macroValues}>
            <AnimatedNumber
              value={totals.calories}
              style={styles.macroValuePrimary}
              isExceeded={isCaloriesExceeded}
            />
            <Text style={styles.macroLabel}>/ {goals.calories}</Text>
          </View>
        </View>

        {/* Protein - Highlighted */}
        <View style={[styles.macroItem, styles.macroItemHighlight]}>
          <CircularProgress
            progress={proteinProgress}
            size={44}
            color={isProteinGoalMet ? theme.colors.techGreen : theme.colors.steel}
          >
            <Text style={[
              styles.macroIcon,
              isProteinGoalMet && { color: theme.colors.techGreen }
            ]}>
              P
            </Text>
          </CircularProgress>
          <View style={styles.macroValues}>
            <AnimatedNumber
              value={totals.protein}
              suffix="g"
              style={styles.macroValueProtein}
              isGoalMet={isProteinGoalMet}
            />
            <Text style={[
              styles.macroLabel,
              isProteinGoalMet && styles.macroLabelSuccess
            ]}>
              {isProteinGoalMet ? 'Goal met!' : `/ ${goals.protein}g`}
            </Text>
          </View>
        </View>

        {/* Carbs */}
        <View style={styles.macroItemSmall}>
          <AnimatedNumber
            value={totals.carbs}
            suffix="g"
            style={styles.macroValueSecondary}
            isExceeded={isCarbsExceeded}
          />
          <Text style={[
            styles.macroLabelSmall,
            isCarbsExceeded && styles.macroLabelWarning
          ]}>
            carbs
          </Text>
        </View>

        {/* Fats */}
        <View style={styles.macroItemSmall}>
          <AnimatedNumber
            value={totals.fats}
            suffix="g"
            style={styles.macroValueSecondary}
            isExceeded={isFatsExceeded}
          />
          <Text style={[
            styles.macroLabelSmall,
            isFatsExceeded && styles.macroLabelWarning
          ]}>
            fats
          </Text>
        </View>
      </View>

      {/* Log Button */}
      <TouchableOpacity
        style={[styles.logButton, isLogging && styles.logButtonDisabled]}
        onPress={onLog}
        activeOpacity={0.9}
        disabled={isLogging}
      >
        <LinearGradient
          colors={isLogging ? ['#4B5563', '#374151'] : [theme.colors.techGreen, '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logButtonGradient}
        >
          <Ionicons name={isLogging ? "hourglass" : "checkmark-circle"} size={22} color="#fff" />
          <Text style={styles.logButtonText}>
            {isLogging ? 'Logging...' : `Log ${selectedFoods.length} Item${selectedFoods.length !== 1 ? 's' : ''}`}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: theme.colors.techGreen,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  selectedFoodsContainer: {
    marginBottom: 12,
  },
  chipsContent: {
    paddingRight: 16,
    gap: 8,
  },
  foodChip: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.concrete,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176, 184, 193, 0.15)',
  },
  chipEmoji: {
    fontSize: 22,
  },
  chipRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.techRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroItemHighlight: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  macroItemSmall: {
    alignItems: 'center',
  },
  macroIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.steel,
  },
  macroValues: {
    alignItems: 'flex-start',
  },
  macroValuePrimary: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
  },
  macroValueProtein: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.techGreen,
  },
  macroValueSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.steel,
  },
  macroLabel: {
    fontSize: 10,
    color: theme.colors.darkGray,
  },
  macroLabelSuccess: {
    color: theme.colors.techGreen,
    fontWeight: '600',
  },
  macroLabelSmall: {
    fontSize: 10,
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  macroLabelWarning: {
    color: theme.colors.techOrange,
  },
  logButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.techGreenGlow,
  },
  logButtonDisabled: {
    opacity: 0.7,
  },
  logButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  logButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
