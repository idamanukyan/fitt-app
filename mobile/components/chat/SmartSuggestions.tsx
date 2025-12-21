/**
 * SmartSuggestions - Tappable suggestion cards after AI responses
 * Includes macros summary and meal logging actions
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { chatTokens, SmartSuggestion, MacrosSummary } from './chatTypes';

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  macrosSummary?: MacrosSummary;
  onSuggestionPress: (suggestion: SmartSuggestion) => void;
}

export default function SmartSuggestions({
  suggestions,
  macrosSummary,
  onSuggestionPress,
}: SmartSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <View style={styles.container}>
      {/* Suggestion Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsScroll}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionCard}
            onPress={() => onSuggestionPress(suggestion)}
            activeOpacity={0.7}
          >
            {suggestion.icon && (
              <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
            )}
            <Text style={styles.suggestionLabel}>{suggestion.label}</Text>

            {suggestion.macros && (
              <View style={styles.miniMacros}>
                <Text style={styles.miniMacroText}>
                  {suggestion.macros.calories} kcal
                </Text>
              </View>
            )}

            <View style={styles.addIndicator}>
              <Text style={styles.addIndicatorText}>+ Add</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Macros Summary Card */}
      {macrosSummary && (
        <View style={styles.macrosSummaryCard}>
          <View style={styles.macrosSummaryHeader}>
            <Text style={styles.macrosSummaryTitle}>Total if logged</Text>
            <TouchableOpacity style={styles.logAllButton}>
              <Text style={styles.logAllButtonText}>Log All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{macrosSummary.calories}</Text>
              <Text style={styles.macroLabel}>kcal</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, styles.proteinValue]}>
                {macrosSummary.protein}g
              </Text>
              <Text style={styles.macroLabel}>protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, styles.carbsValue]}>
                {macrosSummary.carbs}g
              </Text>
              <Text style={styles.macroLabel}>carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, styles.fatsValue]}>
                {macrosSummary.fats}g
              </Text>
              <Text style={styles.macroLabel}>fats</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.sm,
  },
  suggestionsScroll: {
    paddingRight: chatTokens.spacing.lg,
    gap: chatTokens.spacing.sm,
  },
  suggestionCard: {
    backgroundColor: chatTokens.colors.cardBg,
    borderWidth: 1,
    borderColor: chatTokens.colors.greenBorder,
    borderRadius: chatTokens.borderRadius.md,
    paddingHorizontal: chatTokens.spacing.md,
    paddingVertical: chatTokens.spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 24,
    marginBottom: chatTokens.spacing.xs,
  },
  suggestionLabel: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.textPrimary,
    textAlign: 'center',
    marginBottom: chatTokens.spacing.xs,
  },
  miniMacros: {
    backgroundColor: chatTokens.colors.greenMuted,
    paddingHorizontal: chatTokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: chatTokens.borderRadius.full,
    marginBottom: chatTokens.spacing.sm,
  },
  miniMacroText: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.primaryGreen,
  },
  addIndicator: {
    backgroundColor: chatTokens.colors.primaryGreen,
    paddingHorizontal: chatTokens.spacing.md,
    paddingVertical: chatTokens.spacing.xs,
    borderRadius: chatTokens.borderRadius.full,
  },
  addIndicatorText: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.background,
    fontWeight: '600',
  },

  // Macros Summary
  macrosSummaryCard: {
    backgroundColor: chatTokens.colors.cardBg,
    borderWidth: 1,
    borderColor: chatTokens.colors.greenBorder,
    borderRadius: chatTokens.borderRadius.md,
    padding: chatTokens.spacing.md,
    marginTop: chatTokens.spacing.md,
    marginRight: chatTokens.spacing.lg,
  },
  macrosSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: chatTokens.spacing.md,
  },
  macrosSummaryTitle: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.textSecondary,
  },
  logAllButton: {
    backgroundColor: chatTokens.colors.primaryGreen,
    paddingHorizontal: chatTokens.spacing.md,
    paddingVertical: chatTokens.spacing.xs,
    borderRadius: chatTokens.borderRadius.full,
  },
  logAllButtonText: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.background,
    fontWeight: '600',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    ...chatTokens.typography.h3,
    color: chatTokens.colors.textPrimary,
  },
  macroLabel: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.textMuted,
    marginTop: 2,
  },
  proteinValue: {
    color: '#F87171', // Red for protein
  },
  carbsValue: {
    color: '#60A5FA', // Blue for carbs
  },
  fatsValue: {
    color: '#FBBF24', // Yellow for fats
  },
  macroDivider: {
    width: 1,
    height: 30,
    backgroundColor: chatTokens.colors.greenMuted,
  },
});
