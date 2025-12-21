/**
 * HyperFit Branded Logo
 * Minimal geometric dumbbell mark with neon accent
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import theme from '../../utils/theme';

interface HyperFitLogoProps {
  size?: number;
  glowing?: boolean;
}

export default function HyperFitLogo({ size = 80, glowing = true }: HyperFitLogoProps) {
  const scale = size / 80;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {glowing && (
        <View
          style={[
            styles.glow,
            {
              width: size * 1.4,
              height: size * 1.4,
              borderRadius: size * 0.7,
            },
          ]}
        />
      )}
      <Svg width={size} height={size} viewBox="0 0 80 80" style={styles.svg}>
        {/* Dumbbell bars */}
        <Rect
          x="10"
          y="38"
          width="60"
          height="4"
          fill={theme.colors.lightGreen}
        />

        {/* Left weight plates */}
        <Rect
          x="8"
          y="32"
          width="8"
          height="16"
          fill={theme.colors.darkGreen}
          opacity="0.8"
        />
        <Rect
          x="4"
          y="28"
          width="8"
          height="24"
          fill={theme.colors.lightGreen}
        />

        {/* Right weight plates */}
        <Rect
          x="64"
          y="32"
          width="8"
          height="16"
          fill={theme.colors.darkGreen}
          opacity="0.8"
        />
        <Rect
          x="68"
          y="28"
          width="8"
          height="24"
          fill={theme.colors.lightGreen}
        />

        {/* Center grip detail */}
        <Rect
          x="36"
          y="36"
          width="8"
          height="8"
          fill={theme.colors.black}
          stroke={theme.colors.lightGreen}
          strokeWidth="1"
        />

        {/* Neon accent dots */}
        <Circle
          cx="40"
          cy="40"
          r="2"
          fill={theme.colors.white}
          opacity="0.9"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    backgroundColor: theme.colors.lightGreen,
    opacity: 0.15,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  svg: {
    zIndex: 1,
  },
});
