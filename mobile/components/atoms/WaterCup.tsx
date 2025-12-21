/**
 * WaterCup - Animated water cup icon for hydration tracking
 * High-tech architecture design with fluid animation
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

interface WaterCupProps {
  filled: boolean;
  onPress?: () => void;
  size?: number;
}

export default function WaterCup({ filled, onPress, size = 60 }: WaterCupProps) {
  const cupHeight = size;
  const cupWidth = size * 0.7;

  return (
    <TouchableOpacity
      style={[styles.container, { width: cupWidth, height: cupHeight }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Cup Border */}
      <View
        style={[
          styles.cupBorder,
          {
            width: cupWidth,
            height: cupHeight,
            borderColor: filled ? theme.colors.techCyan : theme.colors.iron,
          },
        ]}
      >
        {/* Water Fill */}
        {filled && (
          <LinearGradient
            colors={[theme.colors.techCyan, theme.colors.techBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.waterFill}
          />
        )}

        {/* Icon Overlay */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={filled ? 'water' : 'water-outline'}
            size={size * 0.4}
            color={filled ? theme.colors.white : theme.colors.steelDark}
          />
        </View>
      </View>

      {/* Glow Effect when filled */}
      {filled && (
        <View
          style={[
            styles.glow,
            {
              width: cupWidth,
              height: cupHeight,
              shadowColor: theme.colors.techCyan,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.xs,
  },
  cupBorder: {
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.concreteDark,
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    opacity: 0.7,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
});
