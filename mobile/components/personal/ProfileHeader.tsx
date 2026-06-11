import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import type { UserProfile } from '../../types/api.types';
import { styles } from './styles';

interface ProfileHeaderProps {
  user: any;
  profile: UserProfile | null;
  avatarUri: string | null;
  onPickImage: () => void;
  onEditPress: () => void;
  title: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  profile,
  avatarUri,
  onPickImage,
  onEditPress,
  title,
}) => {
  return (
    <>
      {/* Header */}
      <View style={headerStyles.header}>
        <Text style={headerStyles.title}>{title}</Text>
        <TouchableOpacity
          style={headerStyles.editIconButton}
          onPress={onEditPress}
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
        onPickImage={onPickImage}
      />
    </>
  );
};

// Internal AvatarSection component
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

// Header-specific styles not shared with other components
import { StyleSheet } from 'react-native';

const headerStyles = StyleSheet.create({
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
});
