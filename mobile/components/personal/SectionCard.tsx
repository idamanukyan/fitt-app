import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import type { SectionCardProps } from './types';
import { styles } from './styles';

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  children,
  accentColor = theme.colors.lightGreen,
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const animatedHeight = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    if (!collapsible) return;
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={toggleExpand}
        activeOpacity={collapsible ? 0.7 : 1}
        disabled={!collapsible}
      >
        <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}15` }]}>
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {collapsible && (
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.darkGray}
          />
        )}
      </TouchableOpacity>
      {(!collapsible || expanded) && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};
