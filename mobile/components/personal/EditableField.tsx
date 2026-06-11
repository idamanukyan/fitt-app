import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import type { EditableFieldProps } from './types';
import { styles } from './styles';

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  icon,
  suffix,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.editableField}>
      <Text style={styles.editableFieldLabel}>{label}</Text>
      <View style={[
        styles.editableFieldInput,
        focused && styles.editableFieldInputFocused,
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? theme.colors.lightGreen : theme.colors.darkGray}
            style={styles.editableFieldIcon}
          />
        )}
        <TextInput
          style={styles.editableFieldTextInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.darkGray}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix && (
          <Text style={styles.editableFieldSuffix}>{suffix}</Text>
        )}
      </View>
    </View>
  );
};
