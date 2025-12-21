/**
 * AddSupplementScreen - Search and Add Supplements
 *
 * Features:
 * - Search supplements
 * - Suggested supplements
 * - Create custom supplement
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { SUGGESTED_SUPPLEMENTS } from '../contexts/SupplementsContext';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const colors = {
  background: '#0D0F0D',
  cardBg: '#151916',
  cardBgElevated: '#1A1D1A',
  primaryGreen: '#4ADE80',
  secondaryGreen: '#22C55E',
  greenMuted: 'rgba(74, 222, 128, 0.15)',
  greenBorder: 'rgba(74, 222, 128, 0.3)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
};

// ============================================================================
// SUPPLEMENT SUGGESTION CARD
// ============================================================================
interface SuggestionCardProps {
  name: string;
  icon: string;
  onPress: () => void;
}

function SuggestionCard({ name, icon, onPress }: SuggestionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.suggestionCard,
        pressed && styles.suggestionCardPressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: colors.greenMuted }}
    >
      <View style={styles.suggestionIcon}>
        <Text style={styles.suggestionEmoji}>{icon}</Text>
      </View>
      <Text style={styles.suggestionName}>{name}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

// ============================================================================
// ADD SUPPLEMENT SCREEN
// ============================================================================
export default function AddSupplementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter supplements based on search
  const filteredSupplements = useMemo(() => {
    if (!searchQuery.trim()) {
      return SUGGESTED_SUPPLEMENTS;
    }
    const query = searchQuery.toLowerCase();
    return SUGGESTED_SUPPLEMENTS.filter(
      sup => sup.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Navigate to configure with selected supplement
  const handleSelectSupplement = (supplement: typeof SUGGESTED_SUPPLEMENTS[0]) => {
    router.push({
      pathname: '/supplements/configure',
      params: {
        name: supplement.name,
        icon: supplement.icon,
        amount: supplement.defaultDosage.amount.toString(),
        unit: supplement.defaultDosage.unit,
        time: supplement.defaultTime,
      },
    });
  };

  // Navigate to configure for custom supplement
  const handleCreateCustom = () => {
    router.push({
      pathname: '/supplements/configure',
      params: {
        custom: 'true',
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Supplement</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search supplements..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Popular Supplements */}
        {!searchQuery && (
          <Text style={styles.sectionTitle}>POPULAR SUPPLEMENTS</Text>
        )}

        {searchQuery && filteredSupplements.length > 0 && (
          <Text style={styles.sectionTitle}>
            SEARCH RESULTS ({filteredSupplements.length})
          </Text>
        )}

        {filteredSupplements.map((supplement, index) => (
          <SuggestionCard
            key={index}
            name={supplement.name}
            icon={supplement.icon}
            onPress={() => handleSelectSupplement(supplement)}
          />
        ))}

        {searchQuery && filteredSupplements.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search" size={48} color={colors.textMuted} />
            <Text style={styles.noResultsText}>
              No supplements found for "{searchQuery}"
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search or create a custom supplement
            </Text>
          </View>
        )}

        {/* Create Custom */}
        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Can't find what you're looking for?</Text>
          <TouchableOpacity
            onPress={handleCreateCustom}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['transparent', 'transparent']}
              style={styles.customButton}
            >
              <Ionicons name="create-outline" size={20} color={colors.primaryGreen} />
              <Text style={styles.customButtonText}>Create Custom Supplement</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  suggestionCardPressed: {
    backgroundColor: colors.cardBgElevated,
    borderColor: colors.greenBorder,
  },
  suggestionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.greenMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  suggestionEmoji: {
    fontSize: 22,
  },
  suggestionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  customSection: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 16,
  },
  customLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    gap: 8,
  },
  customButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
});
