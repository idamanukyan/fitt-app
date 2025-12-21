/**
 * SupplementCard Component
 *
 * Displays a supplement with tracking dots and log button
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Supplement, IntakeRecord } from '../../contexts/SupplementsContext';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const colors = {
  background: '#0D0F0D',
  cardBg: '#151916',
  cardBgElevated: '#1A1D1A',
  primaryGreen: '#4ADE80',
  secondaryGreen: '#22C55E',
  greenMuted: 'rgba(74, 222, 128, 0.15)',
  greenBorder: 'rgba(74, 222, 128, 0.3)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  dotEmpty: '#2A2D2A',
  dotFilled: '#4ADE80',
};

// ============================================================================
// TYPES
// ============================================================================
interface SupplementCardProps {
  supplement: Supplement;
  todayIntakes: IntakeRecord[];
  weekIntakes: { date: string; intakes: IntakeRecord[] }[];
  onPress: () => void;
  onLogIntake: () => void;
}

// ============================================================================
// TRACKING DOT COMPONENT
// ============================================================================
function TrackingDot({ filled, animated = false }: { filled: boolean; animated?: boolean }) {
  const scaleAnim = useRef(new Animated.Value(filled ? 1 : 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(filled ? 1 : 0.5)).current;

  useEffect(() => {
    if (animated && filled) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filled, animated]);

  return (
    <Animated.View
      style={[
        styles.trackingDot,
        filled && styles.trackingDotFilled,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      {filled && (
        <Ionicons name="checkmark" size={10} color={colors.background} />
      )}
    </Animated.View>
  );
}

// ============================================================================
// SUPPLEMENT CARD
// ============================================================================
export default function SupplementCard({
  supplement,
  todayIntakes,
  weekIntakes,
  onPress,
  onLogIntake,
}: SupplementCardProps) {
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Calculate status
  const takenToday = todayIntakes.length;
  const dosesNeeded = supplement.dosesPerDay || 1;
  const allTakenToday = takenToday >= dosesNeeded;
  const lastIntake = todayIntakes[todayIntakes.length - 1];

  // Format last intake time
  const formatIntakeTime = () => {
    if (!lastIntake?.timestamp) return null;
    const date = new Date(lastIntake.timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Get status text
  const getStatusText = () => {
    if (allTakenToday) {
      const time = formatIntakeTime();
      return time ? `Logged at ${time}` : `${takenToday} of ${dosesNeeded} taken`;
    }
    if (takenToday > 0) {
      return `${takenToday} of ${dosesNeeded} taken`;
    }
    return 'Not taken yet';
  };

  // Handle button press animation
  const handleButtonPressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: colors.greenMuted }}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{supplement.icon || '💊'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{supplement.name}</Text>
          <Text style={styles.dosage}>
            {supplement.dosage.amount}{supplement.dosage.unit} · {supplement.frequency === 'daily' ? 'Daily' : supplement.frequency} at {supplement.time}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      {/* Weekly Tracking Dots */}
      <View style={styles.trackingRow}>
        <Text style={styles.trackingLabel}>This week</Text>
        <View style={styles.dotsContainer}>
          {weekIntakes.slice(-5).map((day, index) => (
            <TrackingDot
              key={day.date}
              filled={day.intakes.length > 0}
              animated={index === weekIntakes.length - 1}
            />
          ))}
        </View>
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <View style={[
            styles.statusDot,
            allTakenToday ? styles.statusDotDone : styles.statusDotPending,
          ]} />
          <Text style={[
            styles.statusText,
            allTakenToday && styles.statusTextDone,
          ]}>
            {getStatusText()}
          </Text>
        </View>

        {!allTakenToday && (
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              onPress={onLogIntake}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.primaryGreen, colors.secondaryGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logButton}
              >
                <Ionicons name="add" size={16} color={colors.background} />
                <Text style={styles.logButtonText}>LOG INTAKE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {allTakenToday && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primaryGreen} />
            <Text style={styles.completedText}>Done</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardPressed: {
    backgroundColor: colors.cardBgElevated,
    borderColor: colors.greenBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dosage: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.greenBorder,
  },
  trackingLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  trackingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.dotEmpty,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingDotFilled: {
    backgroundColor: colors.dotFilled,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotPending: {
    backgroundColor: colors.textMuted,
  },
  statusDotDone: {
    backgroundColor: colors.primaryGreen,
  },
  statusText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statusTextDone: {
    color: colors.primaryGreen,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  logButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
});
