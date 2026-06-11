import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import type { SettingsRowProps } from './types';
import { styles } from './styles';

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  accentColor = theme.colors.lightGreen,
  destructive = false,
  disabled = false,
  rightElement,
}) => {
  const [pressed, setPressed] = useState(false);
  const color = destructive ? theme.colors.error : accentColor;

  return (
    <Pressable
      style={[
        styles.settingsRow,
        pressed && styles.settingsRowPressed,
        disabled && styles.settingsRowDisabled,
      ]}
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
    >
      <View style={[styles.settingsRowIcon, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.settingsRowContent}>
        <Text style={[
          styles.settingsRowLabel,
          destructive && { color: theme.colors.error }
        ]}>
          {label}
        </Text>
        {value && (
          <Text style={styles.settingsRowValue}>{value}</Text>
        )}
      </View>
      {rightElement}
      {showChevron && !rightElement && (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.darkGray} />
      )}
    </Pressable>
  );
};
