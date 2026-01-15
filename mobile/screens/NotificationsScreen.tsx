/**
 * NotificationsScreen - User notifications center
 * Displays all notifications with read/unread states and actions
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/api.types';

type FilterType = 'all' | 'unread';

const NOTIFICATION_ICONS: Record<string, string> = {
  achievement: 'trophy',
  workout_reminder: 'barbell',
  meal_reminder: 'nutrition',
  supplement_reminder: 'medical',
  coach_message: 'chatbubble',
  goal_progress: 'trending-up',
  streak: 'flame',
  system: 'information-circle',
  promotion: 'gift',
};

const NOTIFICATION_COLORS: Record<string, string> = {
  achievement: '#f59e0b',
  workout_reminder: '#3b82f6',
  meal_reminder: '#22c55e',
  supplement_reminder: '#8b5cf6',
  coach_message: '#06b6d4',
  goal_progress: '#ec4899',
  streak: '#ef4444',
  system: '#6b7280',
  promotion: '#f97316',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    loadData();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        filter === 'unread'
          ? notificationService.getUnreadNotifications()
          : notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(Array.isArray(notifs) ? notifs : (notifs as any).notifications || []);
      setUnreadCount(typeof count === 'number' ? count : (count as any).count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = filter === 'unread'
        ? await notificationService.getUnreadNotifications()
        : await notificationService.getNotifications();
      setNotifications(Array.isArray(notifs) ? notifs : (notifs as any).notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;

    try {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Mark All as Read',
      'Mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await notificationService.markAllAsRead();
              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
              setUnreadCount(0);
            } catch (error) {
              Alert.alert('Error', 'Failed to mark all as read');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (notification: Notification) => {
    Alert.alert(
      'Delete Notification',
      'Remove this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notification.id);
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
              if (!notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read first
    handleMarkAsRead(notification);

    // Navigate based on notification type
    const data = notification.data || {};
    switch (notification.type) {
      case 'achievement':
        if (data.achievement_id) {
          router.push(`/achievements/${data.achievement_id}` as any);
        } else {
          router.push('/achievements' as any);
        }
        break;
      case 'workout_reminder':
        router.push('/training' as any);
        break;
      case 'meal_reminder':
        router.push('/nutrition' as any);
        break;
      case 'coach_message':
        router.push('/chat' as any);
        break;
      case 'goal_progress':
        router.push('/goals' as any);
        break;
      default:
        // Just mark as read, no navigation
        break;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = (notification: Notification) => {
    const icon = NOTIFICATION_ICONS[notification.type] || 'notifications';
    const color = NOTIFICATION_COLORS[notification.type] || theme.colors.techBlue;

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          !notification.is_read && styles.unreadCard,
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleDelete(notification)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(notification.created_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(notification)}
        >
          <Ionicons name="close" size={18} color={theme.colors.white40} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.black, theme.colors.concreteDark, theme.colors.concrete]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
          <Ionicons name="checkmark-done" size={24} color={theme.colors.techBlue} />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.techBlue}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color={theme.colors.white20} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {notifications.map(renderNotification)}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  loadingText: {
    color: theme.colors.white60,
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
  },
  badge: {
    backgroundColor: theme.colors.techOrange,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white,
  },
  markAllButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.techBlue + '30',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white60,
  },
  activeFilterText: {
    color: theme.colors.techBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.glass,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.white10,
  },
  unreadCard: {
    borderColor: theme.colors.techBlue + '50',
    backgroundColor: theme.colors.techBlue + '10',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.techBlue,
  },
  notificationMessage: {
    fontSize: 13,
    color: theme.colors.white60,
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: theme.colors.white40,
    marginTop: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.white60,
    marginTop: 8,
    textAlign: 'center',
  },
});
