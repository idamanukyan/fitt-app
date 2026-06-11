/**
 * PersonalScreen - Profile Control Center
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";
import type { UserProfile } from "../types/api.types";
import theme from "../utils/theme";
import { changeLanguage, getSupportedLanguages, getCurrentLanguage } from "../src/i18n";
import logger from '../utils/logger';
import {
  ProfileHeader,
  StatsOverview,
  ProfileDetailsSection,
  BodyMetricsSection,
  PreferencesSection,
  SecuritySection,
  DataPrivacySection,
  AccountSection,
  LanguageModal,
  LogoutModal,
  EditProfileView,
  screenStyles as styles,
} from "../components/personal";
import type { GradientColors, EditData } from "../components/personal";

export default function PersonalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    full_name: "", height: "", weight: "", fitness_level: "", bio: "", gender: "",
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const supportedLanguages = getSupportedLanguages();

  useEffect(() => {
    let isMounted = true;
    let animation: Animated.CompositeAnimation | null = null;
    if (isAuthenticated) {
      const loadProfile = async () => {
        try {
          const profileData = await profileService.getProfile();
          if (isMounted) {
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
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      loadProfile();
      animation = Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true });
      animation.start();
    }
    return () => { isMounted = false; animation?.stop(); };
  }, [isAuthenticated]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('common.error'), 'Permission to access photos is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
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
      Alert.alert(t('common.success'), 'Profile updated successfully');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
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

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) performLogout();
    } else {
      Alert.alert(t('profile.logout.title'), t('profile.logout.message'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.logout.confirm'), style: 'destructive', onPress: performLogout },
      ]);
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

  if (isEditing) {
    return (
      <EditProfileView
        fadeAnim={fadeAnim}
        editData={editData}
        setEditData={setEditData}
        avatarUri={avatarUri}
        isSaving={isSaving}
        onPickImage={handlePickImage}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background as unknown as GradientColors} style={styles.backgroundGradient} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ProfileHeader
            user={user}
            profile={profile}
            avatarUri={avatarUri}
            onPickImage={handlePickImage}
            onEditPress={() => setIsEditing(true)}
            title={t('profile.title')}
          />
          {profile && <StatsOverview profile={profile} />}
          <ProfileDetailsSection profile={profile} userEmail={user?.email || ''} onEditPress={() => setIsEditing(true)} />
          <BodyMetricsSection profile={profile} onEditPress={() => setIsEditing(true)} />
          <PreferencesSection currentLanguageName={getCurrentLanguageName()} onLanguagePress={() => setShowLanguageModal(true)} />
          <SecuritySection />
          <DataPrivacySection />
          <AccountSection onLogout={handleLogout} />
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>HyperFit v1.0.0</Text>
            <Text style={styles.versionSubtext}>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</Text>
          </View>
        </Animated.View>
      </ScrollView>
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelectLanguage={handleLanguageChange}
        currentLang={currentLang}
        supportedLanguages={supportedLanguages}
        title={t('profile.language.select')}
      />
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={performLogout}
        isLoggingOut={isLoggingOut}
        title={t('profile.logout.title')}
        message={t('profile.logout.message')}
        cancelText={t('common.cancel')}
        confirmText={t('profile.logout.confirm')}
      />
    </View>
  );
}
