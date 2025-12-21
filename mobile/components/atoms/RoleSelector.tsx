import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

export type UserRole = 'user' | 'coach';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SELECTOR_WIDTH = Math.min(SCREEN_WIDTH - 48, 400);
const BUTTON_WIDTH = (SELECTOR_WIDTH - 8) / 2;

export default function RoleSelector({
  selectedRole,
  onRoleChange,
}: RoleSelectorProps) {
  const slideAnim = useRef(new Animated.Value(selectedRole === 'user' ? 0 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide animation
    Animated.spring(slideAnim, {
      toValue: selectedRole === 'user' ? 0 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();

    // Glow pulse animation
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selectedRole]);

  const indicatorPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, BUTTON_WIDTH + 4],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>I am a</Text>

      <View style={styles.selectorContainer}>
        {/* Animated Indicator Background */}
        <Animated.View
          style={[
            styles.indicator,
            {
              left: indicatorPosition,
              width: BUTTON_WIDTH - 8,
            },
          ]}
        >
          <LinearGradient
            colors={
              selectedRole === 'user'
                ? theme.gradients.buttonSecondary
                : theme.gradients.buttonPrimary
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.indicatorGradient}
          >
            {/* Animated Glow */}
            <Animated.View
              style={[
                styles.indicatorGlow,
                {
                  shadowOpacity: glowOpacity,
                  shadowColor:
                    selectedRole === 'user'
                      ? theme.colors.lightGreen
                      : theme.colors.lightGreen,
                },
              ]}
            />
          </LinearGradient>
        </Animated.View>

        {/* User Button */}
        <TouchableOpacity
          style={[styles.roleButton]}
          onPress={() => onRoleChange('user')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={
              selectedRole === 'user'
                ? theme.colors.white
                : theme.colors.darkGray
            }
          />
          <Text
            style={[
              styles.roleText,
              selectedRole === 'user' && styles.roleTextActive,
            ]}
          >
            User
          </Text>
        </TouchableOpacity>

        {/* Coach Button */}
        <TouchableOpacity
          style={[styles.roleButton]}
          onPress={() => onRoleChange('coach')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="fitness-outline"
            size={20}
            color={
              selectedRole === 'coach'
                ? theme.colors.white
                : theme.colors.darkGray
            }
          />
          <Text
            style={[
              styles.roleText,
              selectedRole === 'coach' && styles.roleTextActive,
            ]}
          >
            Coach
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helperText}>
        {selectedRole === 'user'
          ? 'Connect with coaches and track your fitness journey'
          : 'Manage clients and guide their fitness transformation'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.oliveBlack,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    position: 'relative',
    height: 56,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
    position: 'relative',
  },
  indicatorGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    zIndex: 1,
  },
  roleText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.darkGray,
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  roleTextActive: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.darkGray,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
