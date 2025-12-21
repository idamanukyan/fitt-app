/**
 * SetTracker - Track individual sets with reps, weight, completion
 * Industrial design for workout logging
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

interface SetTrackerProps {
  setNumber: number;
  reps?: number;
  weight?: number;
  completed?: boolean;
  onRepsChange?: (reps: number) => void;
  onWeightChange?: (weight: number) => void;
  onCompletedChange?: (completed: boolean) => void;
  editable?: boolean;
  showWeight?: boolean;
}

export default function SetTracker({
  setNumber,
  reps = 0,
  weight = 0,
  completed = false,
  onRepsChange,
  onWeightChange,
  onCompletedChange,
  editable = true,
  showWeight = true,
}: SetTrackerProps) {
  const [localReps, setLocalReps] = useState(String(reps));
  const [localWeight, setLocalWeight] = useState(String(weight));

  const handleRepsChange = (value: string) => {
    setLocalReps(value);
    const numValue = parseInt(value) || 0;
    onRepsChange?.(numValue);
  };

  const handleWeightChange = (value: string) => {
    setLocalWeight(value);
    const numValue = parseFloat(value) || 0;
    onWeightChange?.(numValue);
  };

  const toggleCompleted = () => {
    onCompletedChange?.(!completed);
  };

  return (
    <View style={[styles.container, completed && styles.containerCompleted]}>
      {/* Set Number */}
      <View style={styles.setNumber}>
        <Text style={styles.setNumberText}>{setNumber}</Text>
      </View>

      {/* Reps Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>REPS</Text>
        {editable ? (
          <TextInput
            style={[styles.input, completed && styles.inputCompleted]}
            value={localReps}
            onChangeText={handleRepsChange}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.iron}
            editable={editable}
          />
        ) : (
          <View style={styles.inputDisplay}>
            <Text style={styles.inputDisplayText}>{reps}</Text>
          </View>
        )}
      </View>

      {/* Weight Input */}
      {showWeight && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>KG</Text>
          {editable ? (
            <TextInput
              style={[styles.input, completed && styles.inputCompleted]}
              value={localWeight}
              onChangeText={handleWeightChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.iron}
              editable={editable}
            />
          ) : (
            <View style={styles.inputDisplay}>
              <Text style={styles.inputDisplayText}>{weight}</Text>
            </View>
          )}
        </View>
      )}

      {/* Completion Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, completed && styles.checkboxCompleted]}
        onPress={toggleCompleted}
        disabled={!editable}
        activeOpacity={0.7}
      >
        {completed && (
          <Ionicons name="checkmark" size={20} color={theme.colors.black} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concrete,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    gap: theme.spacing.md,
  },
  containerCompleted: {
    backgroundColor: theme.colors.concreteDark,
    borderColor: theme.colors.techGreen,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.steel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.steel,
    letterSpacing: 1,
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.steelDark,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
  inputCompleted: {
    borderColor: theme.colors.techGreen,
    color: theme.colors.techGreen,
  },
  inputDisplay: {
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: theme.colors.iron,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
  },
  inputDisplayText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.white,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 2,
    borderColor: theme.colors.iron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.techGreen,
    borderColor: theme.colors.techGreen,
  },
});
