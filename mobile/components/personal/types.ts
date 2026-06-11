import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

// Type helper for LinearGradient colors
export type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

export interface SectionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  accentColor?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  accentColor?: string;
  destructive?: boolean;
  disabled?: boolean;
  rightElement?: React.ReactNode;
}

export interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  icon?: keyof typeof Ionicons.glyphMap;
  suffix?: string;
}

export interface EditData {
  full_name: string;
  height: string;
  weight: string;
  fitness_level: string;
  bio: string;
  gender: string;
}
