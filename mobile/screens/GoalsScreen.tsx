import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/goalService';
import type { Goal, GoalCreateData } from '../types/api.types';

export default function GoalsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newGoal, setNewGoal] = useState<any>({
    goal_type: 'weight_loss',
    title: '',
    description: '',
    target_value: '',
    starting_value: '',
    unit: 'kg',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
    }
  }, [isAuthenticated]);

  const fetchGoals = async () => {
    try {
      const data = await goalService.getGoals(0, 50);
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  const handleAddGoal = async () => {
    if (!newGoal.title) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const data: GoalCreateData = {
        goal_type: newGoal.goal_type,
        title: newGoal.title,
        description: newGoal.description || undefined,
        target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : undefined,
        starting_value: newGoal.starting_value ? parseFloat(newGoal.starting_value) : undefined,
        unit: newGoal.unit || undefined,
      };

      await goalService.createGoal(data);
      setIsAddingNew(false);
      setNewGoal({
        goal_type: 'weight_loss',
        title: '',
        description: '',
        target_value: '',
        starting_value: '',
        unit: 'kg',
      });
      fetchGoals();
      Alert.alert('Success', 'Goal created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const handleCompleteGoal = async (goalId: number) => {
    Alert.alert(
      'Complete Goal',
      'Mark this goal as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await goalService.completeGoal(goalId);
              fetchGoals();
              Alert.alert('Success', 'Goal marked as completed!');
            } catch (error) {
              Alert.alert('Error', 'Failed to complete goal');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingNew(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
        }
      >
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Tap + Add to create your first goal</Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalType}>
                    {goal.goal_type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                {goal.is_completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Done</Text>
                  </View>
                )}
                {!goal.is_completed && !goal.is_active && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveText}>Inactive</Text>
                  </View>
                )}
              </View>

              {goal.description && (
                <Text style={styles.description}>{goal.description}</Text>
              )}

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(goal.progress_percentage, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {goal.progress_percentage.toFixed(0)}%
                </Text>
              </View>

              {goal.current_value !== null && goal.target_value !== null && (
                <View style={styles.valuesRow}>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Current</Text>
                    <Text style={styles.valueText}>
                      {goal.current_value} {goal.unit}
                    </Text>
                  </View>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Target</Text>
                    <Text style={styles.valueText}>
                      {goal.target_value} {goal.unit}
                    </Text>
                  </View>
                  {goal.starting_value !== null && (
                    <View style={styles.valueItem}>
                      <Text style={styles.valueLabel}>Starting</Text>
                      <Text style={styles.valueText}>
                        {goal.starting_value} {goal.unit}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {goal.is_active && !goal.is_completed && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteGoal(goal.id)}
                >
                  <Text style={styles.completeButtonText}>Mark as Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={isAddingNew} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Goal</Text>

              <Text style={styles.inputLabel}>Goal Title *</Text>
              <TextInput
                style={styles.input}
                value={newGoal.title}
                onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
                placeholder="e.g., Lose 10kg"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
                placeholder="Describe your goal"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Starting Value</Text>
              <TextInput
                style={styles.input}
                value={newGoal.starting_value}
                onChangeText={(text) => setNewGoal({ ...newGoal, starting_value: text })}
                placeholder="e.g., 80"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Target Value</Text>
              <TextInput
                style={styles.input}
                value={newGoal.target_value}
                onChangeText={(text) => setNewGoal({ ...newGoal, target_value: text })}
                placeholder="e.g., 70"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Unit</Text>
              <TextInput
                style={styles.input}
                value={newGoal.unit}
                onChangeText={(text) => setNewGoal({ ...newGoal, unit: text })}
                placeholder="e.g., kg, lbs, cm"
                placeholderTextColor="#666"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsAddingNew(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddGoal}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  goalType: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  progressText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  valueItem: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 50,
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#0d0d0d',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
