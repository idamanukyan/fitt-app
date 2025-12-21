/**
 * TrainingTabs - Modern Tab Navigation
 * Pill-style tabs matching Dashboard design system
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
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

export type TrainingTab = 'discover' | 'workouts' | 'history' | 'insights';

interface TabConfig {
  id: TrainingTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { id: 'discover', label: 'Discover', icon: 'compass-outline', iconActive: 'compass' },
  { id: 'workouts', label: 'Workouts', icon: 'barbell-outline', iconActive: 'barbell' },
  { id: 'history', label: 'History', icon: 'time-outline', iconActive: 'time' },
  { id: 'insights', label: 'Insights', icon: 'bulb-outline', iconActive: 'bulb' },
];

interface TrainingTabsProps {
  activeTab: TrainingTab;
  onTabChange: (tab: TrainingTab) => void;
}

export const TrainingTabs: React.FC<TrainingTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabWrapper}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.8}
          >
            {isActive ? (
              <LinearGradient
                colors={gradients.buttonPrimary as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabActive}
              >
                <Ionicons
                  name={tab.iconActive}
                  size={18}
                  color={colors.textInverse}
                />
                <Text style={styles.tabTextActive}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tab}>
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={colors.textMuted}
                />
                <Text style={styles.tabText}>{tab.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  tabWrapper: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  tabText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textMuted,
  },
  tabTextActive: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.textInverse,
  },
});

export default TrainingTabs;
