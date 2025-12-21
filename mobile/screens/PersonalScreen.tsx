/**
 * PersonalScreen - Neon-Brutalist Profile Screen
 * Unified design system matching Login/Register aesthetic
 */
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";
import type { UserProfile } from "../types/api.types";
import theme from "../utils/theme";
import NeonInput from "../components/atoms/NeonInput";
import { changeLanguage, getSupportedLanguages, getCurrentLanguage } from "../src/i18n";

export default function PersonalScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [editData, setEditData] = useState({
    full_name: "",
    height: "",
    weight: "",
    fitness_level: "",
  });
  const fadeAnim = useState(new Animated.Value(0))[0];
  const supportedLanguages = getSupportedLanguages();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setEditData({
        full_name: profileData.full_name || "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
        fitness_level: profileData.fitness_level || "",
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updateData: any = {
        full_name: editData.full_name || null,
        height: editData.height ? parseFloat(editData.height) : null,
        weight: editData.weight ? parseFloat(editData.weight) : null,
        fitness_level: editData.fitness_level || null,
      };

      const updatedProfile = await profileService.updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    // Use modal for web, Alert for native
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        'LOGOUT',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout,
          },
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <ActivityIndicator size="large" color={theme.colors.lightGreen} />
        <Text style={styles.loadingText}>LOADING PROFILE...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PROFILE</Text>
          </View>

          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={theme.colors.lightGreen} />
            </View>
            <Text style={styles.username}>{user?.username.toUpperCase()}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.is_premium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={16} color={theme.colors.black} />
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
          </View>

          {/* Profile Details */}
          {profile && (
            <>
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.darkGray} />
                  <Text style={styles.detailLabel}>FULL NAME</Text>
                </View>
                <Text style={styles.detailValue}>
                  {profile.full_name || 'NOT SET'}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="resize-outline" size={20} color={theme.colors.darkGray} />
                  <Text style={styles.detailLabel}>HEIGHT</Text>
                </View>
                <Text style={styles.detailValue}>
                  {profile.height ? `${profile.height} CM` : 'NOT SET'}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="scale-outline" size={20} color={theme.colors.darkGray} />
                  <Text style={styles.detailLabel}>WEIGHT</Text>
                </View>
                <Text style={styles.detailValue}>
                  {profile.weight ? `${profile.weight} KG` : 'NOT SET'}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="fitness-outline" size={20} color={theme.colors.darkGray} />
                  <Text style={styles.detailLabel}>FITNESS LEVEL</Text>
                </View>
                <Text style={styles.detailValue}>
                  {profile.fitness_level ? profile.fitness_level.toUpperCase() : 'NOT SET'}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="pulse-outline" size={20} color={theme.colors.darkGray} />
                  <Text style={styles.detailLabel}>ACTIVITY LEVEL</Text>
                </View>
                <Text style={styles.detailValue}>
                  {profile.activity_level ? profile.activity_level.toUpperCase() : 'NOT SET'}
                </Text>
              </View>
            </>
          )}

          {/* Action Buttons */}
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)} activeOpacity={0.8}>
            <LinearGradient
              colors={theme.gradients.buttonPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.black} />
              <Text style={styles.buttonText}>EDIT PROFILE</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Language Selector */}
          <TouchableOpacity style={styles.languageButton} onPress={() => setShowLanguageModal(true)} activeOpacity={0.8}>
            <View style={styles.languageButtonContent}>
              <Ionicons name="language-outline" size={20} color={theme.colors.lightGreen} />
              <View style={styles.languageInfo}>
                <Text style={styles.languageLabel}>LANGUAGE</Text>
                <Text style={styles.languageValue}>{getCurrentLanguageName()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.darkGray} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.logoutButtonContent}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={styles.logoutButtonText}>LOGOUT</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={theme.gradients.backgroundSubtle}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>EDIT PROFILE</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close" size={28} color={theme.colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                <NeonInput
                  label="FULL NAME"
                  value={editData.full_name}
                  onChangeText={(text) => setEditData({ ...editData, full_name: text })}
                  placeholder="Enter your name"
                  icon="person-outline"
                />

                <NeonInput
                  label="HEIGHT (CM)"
                  value={editData.height}
                  onChangeText={(text) => setEditData({ ...editData, height: text })}
                  placeholder="Enter height"
                  keyboardType="numeric"
                  icon="resize-outline"
                />

                <NeonInput
                  label="WEIGHT (KG)"
                  value={editData.weight}
                  onChangeText={(text) => setEditData({ ...editData, weight: text })}
                  placeholder="Enter weight"
                  keyboardType="numeric"
                  icon="scale-outline"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalButton}
                    onPress={() => setIsEditing(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelModalButtonText}>CANCEL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveModalButton}
                    onPress={handleSaveProfile}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={theme.gradients.buttonPrimary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveModalGradient}
                    >
                      <Text style={styles.saveModalButtonText}>SAVE</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal (for web) */}
      <Modal visible={showLogoutModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContainer}>
            <LinearGradient
              colors={theme.gradients.backgroundSubtle}
              style={styles.logoutModalGradient}
            >
              <View style={styles.logoutModalIcon}>
                <Ionicons name="log-out-outline" size={48} color={theme.colors.error} />
              </View>

              <Text style={styles.logoutModalTitle}>LOGOUT</Text>
              <Text style={styles.logoutModalMessage}>
                Are you sure you want to logout?
              </Text>

              <View style={styles.logoutModalActions}>
                <TouchableOpacity
                  style={styles.logoutCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.8}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.logoutCancelButtonText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutConfirmButton}
                  onPress={performLogout}
                  activeOpacity={0.8}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator color={theme.colors.white} size="small" />
                  ) : (
                    <Text style={styles.logoutConfirmButtonText}>LOGOUT</Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContainer}>
            <LinearGradient
              colors={theme.gradients.backgroundSubtle}
              style={styles.languageModalGradient}
            >
              <View style={styles.languageModalHeader}>
                <Ionicons name="language-outline" size={32} color={theme.colors.lightGreen} />
                <Text style={styles.languageModalTitle}>SELECT LANGUAGE</Text>
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
                    activeOpacity={0.8}
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
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.lightGreen} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.languageModalClose}
                onPress={() => setShowLanguageModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.languageModalCloseText}>CANCEL</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    padding: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.lightGreen,
    fontWeight: '700',
    letterSpacing: 2,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  userCard: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}40`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
    alignItems: 'center',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 2,
    borderColor: theme.colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  username: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
    marginBottom: theme.spacing.md,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.lightGreen,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  premiumText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detailCard: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}40`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.darkGray,
    letterSpacing: 1.5,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  editButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  logoutButton: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  logoutButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 15, 11, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    overflow: 'hidden',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 3,
  },
  modalScroll: {
    paddingBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.darkGray,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: theme.colors.darkGray,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  saveModalButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  saveModalGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  saveModalButtonText: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Logout Modal Styles
  logoutModalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
    overflow: 'hidden',
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoutModalGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  logoutModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.error}20`,
    borderWidth: 2,
    borderColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoutModalTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 3,
    marginBottom: theme.spacing.sm,
  },
  logoutModalMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.darkGray,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.darkGray,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    color: theme.colors.darkGray,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Language Button Styles
  languageButton: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}40`,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.darkGray,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  languageValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Language Modal Styles
  languageModalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.lightGreen,
    overflow: 'hidden',
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  languageModalGradient: {
    padding: theme.spacing.xl,
  },
  languageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  languageModalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
  },
  languageOptions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: `${theme.colors.lightGreen}30`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  languageOptionActive: {
    borderColor: theme.colors.lightGreen,
    backgroundColor: `${theme.colors.lightGreen}10`,
  },
  languageOptionContent: {
    flex: 1,
  },
  languageOptionName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 2,
  },
  languageOptionNameActive: {
    color: theme.colors.lightGreen,
  },
  languageOptionSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
  },
  languageModalClose: {
    backgroundColor: theme.colors.oliveBlack,
    borderWidth: 1,
    borderColor: theme.colors.darkGray,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  languageModalCloseText: {
    color: theme.colors.darkGray,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
