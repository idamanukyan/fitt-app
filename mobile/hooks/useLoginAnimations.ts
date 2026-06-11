/**
 * useLoginAnimations
 *
 * Manages all Animated values and entry animations for the LoginScreen.
 */

import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export interface LoginAnimations {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  logoScale: Animated.Value;
  buttonScale: Animated.Value;
  forgotSectionHeight: Animated.Value;
  forgotSectionOpacity: Animated.Value;
  /** Plays the press-bounce on the sign-in button */
  animateButtonPress: () => void;
}

export function useLoginAnimations(): LoginAnimations {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const forgotSectionHeight = useRef(new Animated.Value(0)).current;
  const forgotSectionOpacity = useRef(new Animated.Value(0)).current;

  // Entry animations
  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    fadeAnim,
    slideAnim,
    logoScale,
    buttonScale,
    forgotSectionHeight,
    forgotSectionOpacity,
    animateButtonPress,
  };
}
