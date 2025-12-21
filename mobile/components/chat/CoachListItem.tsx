/**
 * CoachListItem - Coach thread preview in directory
 * Avatar with online ring, name, preview, timestamp, unread badge
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatTokens, Coach } from './chatTypes';

interface CoachListItemProps {
  coach: Coach;
  onPress: () => void;
}

export default function CoachListItem({ coach, onPress }: CoachListItemProps) {
  const formatTime = (date?: Date) => {
    if (!date) return '';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days >= 7) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (days >= 1) {
      return `${days}d`;
    } else if (hours >= 1) {
      return `${hours}h`;
    } else {
      return 'now';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar with online ring */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: coach.avatar }} style={styles.avatar} />
        {coach.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {coach.name}
            </Text>
            {coach.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={chatTokens.colors.primaryGreen} />
              </View>
            )}
          </View>
          <Text style={styles.timestamp}>{formatTime(coach.lastMessageTime)}</Text>
        </View>

        <Text style={styles.specialty}>{coach.specialty}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {coach.lastMessage}
          </Text>

          {coach.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {coach.unreadCount > 99 ? '99+' : coach.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color={chatTokens.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: chatTokens.colors.cardBg,
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: chatTokens.colors.greenMuted,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: chatTokens.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: chatTokens.colors.inputBg,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: chatTokens.colors.online,
    borderWidth: 2,
    borderColor: chatTokens.colors.cardBg,
  },
  content: {
    flex: 1,
    marginRight: chatTokens.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: chatTokens.spacing.sm,
  },
  name: {
    ...chatTokens.typography.h3,
    color: chatTokens.colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: chatTokens.spacing.xs,
  },
  timestamp: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.textMuted,
  },
  specialty: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.primaryGreen,
    marginBottom: chatTokens.spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    ...chatTokens.typography.caption,
    color: chatTokens.colors.textMuted,
    flex: 1,
    marginRight: chatTokens.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: chatTokens.colors.unreadBadge,
    borderRadius: chatTokens.borderRadius.full,
    paddingHorizontal: chatTokens.spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    ...chatTokens.typography.micro,
    color: chatTokens.colors.background,
    fontWeight: '700',
  },
});
