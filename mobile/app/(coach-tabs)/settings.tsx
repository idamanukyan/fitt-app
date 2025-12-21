/**
 * Coach Settings Screen - Profile & app settings
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getCoachProfile, updateCoachProfile, CoachProfile } from '../../services/coachService';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  color?: string;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcceptingClients, setIsAcceptingClients] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getCoachProfile();
      setCoachProfile(profile);
      setIsAcceptingClients(profile.is_accepting_clients);
    } catch (err) {
      console.error('Failed to load coach profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAcceptingClients = async (value: boolean) => {
    setIsAcceptingClients(value);
    try {
      await updateCoachProfile({ is_accepting_clients: value });
    } catch (err) {
      console.error('Failed to update accepting clients:', err);
      setIsAcceptingClients(!value); // Revert on error
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const profileSettings: SettingItem[] = [
    {
      icon: 'person',
      label: 'Edit Profile',
      value: coachProfile?.specialization || 'Complete your profile',
      onPress: () => console.log('Navigate to edit profile'),
    },
    {
      icon: 'briefcase',
      label: 'Certifications',
      value: coachProfile?.certifications || 'Add certifications',
      onPress: () => {},
    },
    {
      icon: 'cash',
      label: 'Hourly Rate',
      value: coachProfile?.hourly_rate ? `$${coachProfile.hourly_rate}/hr` : 'Not set',
      onPress: () => {},
    },
    {
      icon: 'people',
      label: 'Max Clients',
      value: `${coachProfile?.max_clients || 10} clients`,
      onPress: () => {},
    },
  ];

  const availabilitySettings: SettingItem[] = [
    {
      icon: 'checkbox',
      label: 'Accepting New Clients',
      hasToggle: true,
      toggleValue: isAcceptingClients,
      onToggle: handleToggleAcceptingClients,
    },
    {
      icon: 'calendar',
      label: 'Availability Schedule',
      onPress: () => {},
    },
    {
      icon: 'location',
      label: 'Training Locations',
      value: 'Online, In-Person',
      onPress: () => {},
    },
  ];

  const appSettings: SettingItem[] = [
    {
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark',
      label: 'Privacy & Security',
      onPress: () => {},
    },
    {
      icon: 'help-circle',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: 'document-text',
      label: 'Terms of Service',
      onPress: () => {},
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.hasToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${item.color || '#4ADE80'}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.color || '#4ADE80'} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
      </View>
      {item.hasToggle ? (
        <Switch
          value={item.toggleValue}
          onValueChange={item.onToggle}
          trackColor={{ false: '#374151', true: 'rgba(74, 222, 128, 0.4)' }}
          thumbColor={item.toggleValue ? '#4ADE80' : '#9CA3AF'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || 'C'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.username || 'Coach'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#4ADE80" />
            <Text style={styles.roleText}>Coach</Text>
          </View>
        </View>
      </View>

      {/* Profile Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.settingsCard}>
          {profileSettings.map((item, index) => renderSettingItem(item, index))}
        </View>
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.settingsCard}>
          {availabilitySettings.map((item, index) => renderSettingItem(item, index))}
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingsCard}>
          {appSettings.map((item, index) => renderSettingItem(item, index))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#F87171" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.versionText}>HyperFit Coach v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4ADE80',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ADE80',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  settingValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F87171',
  },
  versionText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 24,
  },
});
