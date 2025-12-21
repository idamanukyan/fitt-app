/**
 * Coach Programs Screen - Manage training programs
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  clientCount: number;
  type: 'strength' | 'cardio' | 'hybrid' | 'custom';
}

const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Beginner Strength',
    description: '12-week progressive overload program for beginners',
    duration: '12 weeks',
    clientCount: 5,
    type: 'strength',
  },
  {
    id: '2',
    name: 'Fat Loss Intensive',
    description: 'High-intensity program combining cardio and resistance',
    duration: '8 weeks',
    clientCount: 8,
    type: 'hybrid',
  },
  {
    id: '3',
    name: 'Marathon Prep',
    description: 'Endurance building for marathon runners',
    duration: '16 weeks',
    clientCount: 3,
    type: 'cardio',
  },
];

const programTypeColors: Record<string, string> = {
  strength: '#4ADE80',
  cardio: '#F472B6',
  hybrid: '#FBBF24',
  custom: '#A78BFA',
};

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const [programs] = useState<Program[]>(mockPrograms);

  const renderProgramCard = ({ item }: { item: Program }) => (
    <TouchableOpacity style={styles.programCard} activeOpacity={0.7}>
      <View style={styles.programHeader}>
        <View
          style={[
            styles.programTypeBadge,
            { backgroundColor: `${programTypeColors[item.type]}20` },
          ]}
        >
          <Text
            style={[
              styles.programTypeText,
              { color: programTypeColors[item.type] },
            ]}
          >
            {item.type.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.programName}>{item.name}</Text>
      <Text style={styles.programDescription}>{item.description}</Text>

      <View style={styles.programFooter}>
        <View style={styles.programStat}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.programStatText}>{item.duration}</Text>
        </View>
        <View style={styles.programStat}>
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.programStatText}>
            {item.clientCount} {item.clientCount === 1 ? 'client' : 'clients'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="clipboard-outline" size={48} color="#6B7280" />
      </View>
      <Text style={styles.emptyTitle}>No Programs Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create training programs to assign to your clients
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Programs</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#4ADE80" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <LinearGradient
            colors={['rgba(74, 222, 128, 0.15)', 'rgba(74, 222, 128, 0.05)']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="add-circle" size={24} color="#4ADE80" />
            <Text style={styles.quickActionText}>Create Program</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.15)', 'rgba(167, 139, 250, 0.05)']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="copy" size={24} color="#A78BFA" />
            <Text style={[styles.quickActionText, { color: '#A78BFA' }]}>
              Use Template
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Programs List */}
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={renderProgramCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADE80',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  programCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  programTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  programTypeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  moreButton: {
    padding: 4,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  programDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 14,
    lineHeight: 20,
  },
  programFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  programStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  programStatText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
