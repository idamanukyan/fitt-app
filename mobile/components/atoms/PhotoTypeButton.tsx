import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { PhotoType } from '../../types/progress.types';

interface PhotoTypeButtonProps {
  type: PhotoType;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function PhotoTypeButton({ type, label, isSelected, onPress }: PhotoTypeButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.buttonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
  },
  buttonSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
  },
  buttonTextSelected: {
    color: '#fff',
  },
});
