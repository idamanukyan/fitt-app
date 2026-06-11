import React from 'react';
import { View, Text } from 'react-native';
import type { UserProfile } from '../../types/api.types';
import { styles } from './styles';

interface StatsOverviewProps {
  profile: UserProfile;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ profile }) => {
  return (
    <View style={styles.quickStats}>
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatValue}>
          {profile.height ? `${profile.height}` : '\u2014'}
        </Text>
        <Text style={styles.quickStatLabel}>Height (cm)</Text>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatValue}>
          {profile.weight ? `${profile.weight}` : '\u2014'}
        </Text>
        <Text style={styles.quickStatLabel}>Weight (kg)</Text>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatValue}>
          {profile.fitness_level ? profile.fitness_level.charAt(0).toUpperCase() : '\u2014'}
        </Text>
        <Text style={styles.quickStatLabel}>Level</Text>
      </View>
    </View>
  );
};
