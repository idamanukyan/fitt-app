/**
 * PersonalScreen - Profile Control Center
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Platform,
  TextInput,
  Image,
  Pressable,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";
import type { UserProfile } from "../types/api.types";
import theme from "../utils/theme";
import type { ColorValue } from 'react-native';
import { changeLanguage, getSupportedLanguages, getCurrentLanguage } from "../src/i18n";

// Type helper for LinearGradient colors
type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

// ============================================================================
// TYPES
// ============================================================================
interface SectionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  accentColor?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface SettingsRowProps {
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

interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  icon?: keyof typeof Ionicons.glyphMap;
  suffix?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const SectionCard: React.FC<SectionCardProps> = ({
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

const SettingsRow: React.FC<SettingsRowProps> = ({
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

const EditableField: React.FC<EditableFieldProps> = ({
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

// ============================================================================
// AVATAR COMPONENT
// ============================================================================
const AvatarSection: React.FC<{
  user: any;
  profile: UserProfile | null;
  avatarUri: string | null;
  onPickImage: () => void;
}> = ({ user, profile, avatarUri, onPickImage }) => {
  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return profile.full_name.substring(0, 2).toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getStatusBadge = () => {
    if (user?.role === 'admin') return { label: 'ADMIN', color: theme.colors.neonPurple };
    if (user?.role === 'coach') return { label: 'COACH', color: theme.colors.neonCyan };
    if (user?.is_premium) return { label: 'PRO', color: theme.colors.lightGreen };
    return { label: 'ACTIVE', color: theme.colors.techBlue };
  };

  const status = getStatusBadge();

  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={onPickImage}
        activeOpacity={0.8}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={[theme.colors.concrete, theme.colors.concreteDark]}
            style={styles.avatarPlaceholder}
          >
            <Text style={styles.avatarInitials}>{getInitials()}</Text>
          </LinearGradient>
        )}
        <View style={styles.avatarEditBadge}>
          <Ionicons name="camera" size={14} color={theme.colors.white} />
        </View>
        <View style={styles.avatarGlow} />
      </TouchableOpacity>

      <View style={styles.avatarInfo}>
        <Text style={styles.avatarName}>
          {profile?.full_name || user?.username || 'User'}
        </Text>
        <Text style={styles.avatarEmail}>{user?.email}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20`, borderColor: status.color }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PersonalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, refreshUser } = useAuth();

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    full_name: "",
    height: "",
    weight: "",
    fitness_level: "",
    bio: "",
    gender: "",
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const supportedLanguages = getSupportedLanguages();

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticated]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const fetchProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setAvatarUri(profileData.avatar_url || null);
      setEditData({
        full_name: profileData.full_name || "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
        fitness_level: profileData.fitness_level || "",
        bio: profileData.bio || "",
        gender: profileData.gender || "",
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t('common.error'),
        'Permission to access photos is required.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      // In production, upload to server here
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updateData: Record<string, string | number | undefined> = {};
      if (editData.full_name) updateData.full_name = editData.full_name;
      if (editData.height) updateData.height = parseFloat(editData.height);
      if (editData.weight) updateData.weight = parseFloat(editData.weight);
      if (editData.fitness_level) updateData.fitness_level = editData.fitness_level;
      if (editData.bio) updateData.bio = editData.bio;
      if (editData.gender) updateData.gender = editData.gender;
      if (avatarUri) updateData.avatar_url = avatarUri;

      const updatedProfile = await profileService.updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);

      if (Platform.OS === 'web') {
        Alert.alert(t('common.success'), 'Profile updated successfully');
      } else {
        Alert.alert(t('common.success'), 'Profile updated successfully');
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (profile) {
      setEditData({
        full_name: profile.full_name || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        fitness_level: profile.fitness_level || "",
        bio: profile.bio || "",
        gender: profile.gender || "",
      });
      setAvatarUri(profile.avatar_url || null);
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        t('profile.logout.title'),
        t('profile.logout.message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('profile.logout.confirm'), style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    setCurrentLang(langCode);
    setShowLanguageModal(false);
  };

  const getCurrentLanguageName = () => {
    const lang = supportedLanguages.find(l => l.code === currentLang);
    return lang ? lang.nativeName : 'English';
  };

  // ============================================================================
  // FITNESS LEVEL OPTIONS
  // ============================================================================
  const fitnessLevels = [
    { value: 'beginner', label: t('profile.fitnessLevels.beginner') },
    { value: 'intermediate', label: t('profile.fitnessLevels.intermediate') },
    { value: 'advanced', label: t('profile.fitnessLevels.advanced') },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background as unknown as GradientColors} style={styles.backgroundGradient} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.lightGreen} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  // ============================================================================
  // EDIT MODE RENDER
  // ============================================================================
  if (isEditing) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.background as unknown as GradientColors} style={styles.backgroundGradient} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Edit Header */}
            <View style={styles.editHeader}>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.editHeaderButton}>
                <Ionicons name="close" size={24} color={theme.colors.darkGray} />
              </TouchableOpacity>
              <Text style={styles.editHeaderTitle}>{t('profile.actions.editProfile')}</Text>
              <TouchableOpacity
                onPress={handleSaveProfile}
                style={styles.editHeaderButton}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={theme.colors.lightGreen} />
                ) : (
                  <Ionicons name="checkmark" size={24} color={theme.colors.lightGreen} />
                )}
              </TouchableOpacity>
            </View>

            {/* Avatar Edit */}
            <View style={styles.editAvatarSection}>
              <TouchableOpacity onPress={handlePickImage} style={styles.editAvatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.editAvatarImage} />
                ) : (
                  <View style={styles.editAvatarPlaceholder}>
                    <Ionicons name="person" size={40} color={theme.colors.darkGray} />
                  </View>
                )}
                <View style={styles.editAvatarOverlay}>
                  <Ionicons name="camera" size={20} color={theme.colors.white} />
                  <Text style={styles.editAvatarText}>Change</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Edit Fields */}
            <SectionCard title="Personal Information" icon="person-outline">
              <EditableField
                label="Full Name"
                value={editData.full_name}
                onChangeText={(text) => setEditData({ ...editData, full_name: text })}
                placeholder="Enter your name"
                icon="person-outline"
              />

              <EditableField
                label="Bio"
                value={editData.bio}
                onChangeText={(text) => setEditData({ ...editData, bio: text })}
                placeholder="Tell us about yourself"
                icon="document-text-outline"
              />

              <View style={styles.editableField}>
                <Text style={styles.editableFieldLabel}>Gender</Text>
                <View style={styles.optionButtonsRow}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        editData.gender === option.value && styles.optionButtonActive,
                      ]}
                      onPress={() => setEditData({ ...editData, gender: option.value })}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        editData.gender === option.value && styles.optionButtonTextActive,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </SectionCard>

            <SectionCard title="Body Metrics" icon="body-outline" accentColor={theme.colors.neonCyan}>
              <EditableField
                label="Height"
                value={editData.height}
                onChangeText={(text) => setEditData({ ...editData, height: text })}
                placeholder="175"
                keyboardType="numeric"
                icon="resize-outline"
                suffix="cm"
              />

              <EditableField
                label="Weight"
                value={editData.weight}
                onChangeText={(text) => setEditData({ ...editData, weight: text })}
                placeholder="70"
                keyboardType="numeric"
                icon="scale-outline"
                suffix="kg"
              />

              <View style={styles.editableField}>
                <Text style={styles.editableFieldLabel}>Fitness Level</Text>
                <View style={styles.optionButtonsRow}>
                  {fitnessLevels.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.optionButton,
                        editData.fitness_level === level.value && styles.optionButtonActive,
                      ]}
                      onPress={() => setEditData({ ...editData, fitness_level: level.value })}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        editData.fitness_level === level.value && styles.optionButtonTextActive,
                      ]}>
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </SectionCard>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.gradients.buttonPrimary as unknown as GradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.colors.black} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.black} />
                    <Text style={styles.saveButtonText}>{t('profile.edit.saveChanges')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background as unknown as GradientColors} style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={22} color={theme.colors.lightGreen} />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <AvatarSection
            user={user}
            profile={profile}
            avatarUri={avatarUri}
            onPickImage={handlePickImage}
          />

          {/* Quick Stats */}
          {profile && (
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  {profile.height ? `${profile.height}` : '—'}
                </Text>
                <Text style={styles.quickStatLabel}>Height (cm)</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  {profile.weight ? `${profile.weight}` : '—'}
                </Text>
                <Text style={styles.quickStatLabel}>Weight (kg)</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  {profile.fitness_level ? profile.fitness_level.charAt(0).toUpperCase() : '—'}
                </Text>
                <Text style={styles.quickStatLabel}>Level</Text>
              </View>
            </View>
          )}

          {/* Profile Details Section */}
          <SectionCard title={t('profile.sections.details')} icon="person-outline">
            <SettingsRow
              icon="person"
              label={t('profile.fields.fullName')}
              value={profile?.full_name || t('common.notSet', 'Not set')}
              onPress={() => setIsEditing(true)}
            />
            <SettingsRow
              icon="mail"
              label={t('profile.fields.email')}
              value={user?.email || ''}
              showChevron={false}
            />
            {profile?.bio && (
              <SettingsRow
                icon="document-text"
                label="Bio"
                value={profile.bio.length > 30 ? `${profile.bio.substring(0, 30)}...` : profile.bio}
                onPress={() => setIsEditing(true)}
              />
            )}
          </SectionCard>

          {/* Body Metrics Section */}
          <SectionCard title={t('profile.sections.metrics')} icon="body-outline" accentColor={theme.colors.neonCyan}>
            <SettingsRow
              icon="resize-outline"
              label={t('profile.fields.height')}
              value={profile?.height ? `${profile.height} cm` : t('common.notSet', 'Not set')}
              onPress={() => setIsEditing(true)}
              accentColor={theme.colors.neonCyan}
            />
            <SettingsRow
              icon="scale-outline"
              label={t('profile.fields.weight')}
              value={profile?.weight ? `${profile.weight} kg` : t('common.notSet', 'Not set')}
              onPress={() => setIsEditing(true)}
              accentColor={theme.colors.neonCyan}
            />
            <SettingsRow
              icon="fitness-outline"
              label={t('profile.fields.fitnessLevel')}
              value={profile?.fitness_level ? t(`profile.fitnessLevels.${profile.fitness_level}`) : t('common.notSet', 'Not set')}
              onPress={() => setIsEditing(true)}
              accentColor={theme.colors.neonCyan}
            />
          </SectionCard>

          {/* Preferences Section */}
          <SectionCard title={t('profile.sections.preferences')} icon="settings-outline" accentColor={theme.colors.neonOrange}>
            <SettingsRow
              icon="language-outline"
              label={t('profile.language.title')}
              value={getCurrentLanguageName()}
              onPress={() => setShowLanguageModal(true)}
              accentColor={theme.colors.neonOrange}
            />
            <SettingsRow
              icon="notifications-outline"
              label={t('profile.notifications', 'Notifications')}
              value={t('common.enabled', 'Enabled')}
              onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
              accentColor={theme.colors.neonOrange}
            />
            <SettingsRow
              icon="moon-outline"
              label={t('profile.theme', 'Theme')}
              value={t('profile.themeDark', 'Dark')}
              showChevron={false}
              accentColor={theme.colors.neonOrange}
            />
          </SectionCard>

          {/* Security Section (Future-Ready) */}
          <SectionCard title={t('profile.sections.security')} icon="shield-outline" accentColor={theme.colors.neonPurple}>
            <SettingsRow
              icon="key-outline"
              label={t('profile.actions.changePassword')}
              onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
              accentColor={theme.colors.neonPurple}
            />
            <SettingsRow
              icon="finger-print-outline"
              label={t('profile.actions.twoFactor')}
              value={t('common.off', 'Off')}
              onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
              accentColor={theme.colors.neonPurple}
            />
            <SettingsRow
              icon="phone-portrait-outline"
              label={t('profile.connectedDevices', 'Connected Devices')}
              value={t('profile.oneDevice', '1 device')}
              onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
              accentColor={theme.colors.neonPurple}
            />
          </SectionCard>

          {/* Data & Privacy Section (Future-Ready) */}
          <SectionCard title={t('profile.sections.dataPrivacy')} icon="lock-closed-outline" accentColor={theme.colors.techBlue}>
            <SettingsRow
              icon="download-outline"
              label={t('profile.actions.exportData')}
              onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
              accentColor={theme.colors.techBlue}
            />
            <SettingsRow
              icon="analytics-outline"
              label={t('profile.usageAnalytics', 'Usage Analytics')}
              value={t('common.enabled', 'Enabled')}
              onPress={() => Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.message'))}
              accentColor={theme.colors.techBlue}
            />
          </SectionCard>

          {/* Logout */}
          <SectionCard title={t('profile.sections.account')} icon="log-out-outline" accentColor={theme.colors.error}>
            <SettingsRow
              icon="log-out-outline"
              label={t('profile.actions.logout')}
              onPress={handleLogout}
              destructive
              showChevron={false}
            />
          </SectionCard>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>HyperFit v1.0.0</Text>
            <Text style={styles.versionSubtext}>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={theme.gradients.backgroundSubtle as unknown as GradientColors}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderIcon}>
                  <Ionicons name="language" size={24} color={theme.colors.lightGreen} />
                </View>
                <Text style={styles.modalTitle}>{t('profile.language.select')}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.darkGray} />
                </TouchableOpacity>
              </View>

              <View style={styles.languageOptions}>
                {supportedLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      currentLang === lang.code && styles.languageOptionActive,
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.languageOptionContent}>
                      <Text style={[
                        styles.languageOptionName,
                        currentLang === lang.code && styles.languageOptionNameActive,
                      ]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.languageOptionSubtext}>{lang.name}</Text>
                    </View>
                    {currentLang === lang.code && (
                      <View style={styles.languageCheckmark}>
                        <Ionicons name="checkmark" size={18} color={theme.colors.black} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContainer}>
            <LinearGradient
              colors={theme.gradients.backgroundSubtle as unknown as GradientColors}
              style={styles.logoutModalGradient}
            >
              <View style={styles.logoutModalIcon}>
                <Ionicons name="log-out-outline" size={40} color={theme.colors.error} />
              </View>

              <Text style={styles.logoutModalTitle}>{t('profile.logout.title')}</Text>
              <Text style={styles.logoutModalMessage}>
                {t('profile.logout.message')}
              </Text>

              <View style={styles.logoutModalActions}>
                <TouchableOpacity
                  style={styles.logoutCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutCancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutConfirmButton}
                  onPress={performLogout}
                  disabled={isLoggingOut}
                  activeOpacity={0.8}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator color={theme.colors.white} size="small" />
                  ) : (
                    <Text style={styles.logoutConfirmButtonText}>{t('profile.logout.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.colors.darkGray,
    letterSpacing: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  editIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${theme.colors.lightGreen}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}30`,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.lightGreen,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.lightGreen,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.lightGreen,
    letterSpacing: 2,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.black,
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: `${theme.colors.lightGreen}10`,
    zIndex: -1,
  },
  avatarInfo: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  avatarEmail: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.concrete,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}20`,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: theme.colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: `${theme.colors.darkGray}40`,
    marginHorizontal: 16,
  },

  // Section Card
  sectionCard: {
    backgroundColor: theme.colors.concrete,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}15`,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingBottom: 8,
  },

  // Settings Row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsRowPressed: {
    backgroundColor: `${theme.colors.white}05`,
  },
  settingsRowDisabled: {
    opacity: 0.5,
  },
  settingsRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRowContent: {
    flex: 1,
  },
  settingsRowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.white,
  },
  settingsRowValue: {
    fontSize: 13,
    color: theme.colors.darkGray,
    marginTop: 2,
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.darkGray,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 11,
    color: `${theme.colors.darkGray}80`,
  },

  // Edit Mode
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  editHeaderButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatarWrapper: {
    position: 'relative',
  },
  editAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.concrete,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.darkGray,
    borderStyle: 'dashed',
  },
  editAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 12,
    color: theme.colors.white,
    marginTop: 4,
  },

  // Editable Field
  editableField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editableFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.darkGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editableFieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.concreteDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.darkGray}40`,
    paddingHorizontal: 14,
    height: 50,
  },
  editableFieldInputFocused: {
    borderColor: theme.colors.lightGreen,
    backgroundColor: `${theme.colors.lightGreen}08`,
  },
  editableFieldIcon: {
    marginRight: 10,
  },
  editableFieldTextInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.white,
  },
  editableFieldSuffix: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginLeft: 8,
  },

  // Option Buttons
  optionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.concreteDark,
    borderWidth: 1,
    borderColor: `${theme.colors.darkGray}40`,
  },
  optionButtonActive: {
    backgroundColor: `${theme.colors.lightGreen}20`,
    borderColor: theme.colors.lightGreen,
  },
  optionButtonText: {
    fontSize: 13,
    color: theme.colors.darkGray,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: theme.colors.lightGreen,
  },

  // Save/Cancel Buttons
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.black,
    letterSpacing: 0.5,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    color: theme.colors.darkGray,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}30`,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${theme.colors.lightGreen}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Language Options
  languageOptions: {
    gap: 10,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.concreteDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: theme.colors.lightGreen,
    backgroundColor: `${theme.colors.lightGreen}10`,
  },
  languageOptionContent: {
    flex: 1,
  },
  languageOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  languageOptionNameActive: {
    color: theme.colors.lightGreen,
  },
  languageOptionSubtext: {
    fontSize: 13,
    color: theme.colors.darkGray,
    marginTop: 2,
  },
  languageCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logout Modal
  logoutModalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.error}40`,
  },
  logoutModalGradient: {
    padding: 28,
    alignItems: 'center',
  },
  logoutModalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${theme.colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 14,
    color: theme.colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.concreteDark,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.darkGray}40`,
  },
  logoutCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.darkGray,
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
