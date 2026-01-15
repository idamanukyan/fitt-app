/**
 * AdminDashboardScreen - Admin management dashboard
 * Features user management, stats, and system overview
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
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../utils/theme';
import adminService, {
  AdminUser,
  AdminStats,
  UserRole,
  UserListParams,
} from '../services/adminService';

type TabType = 'overview' | 'users' | 'coaches' | 'admins';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Data state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') {
      loadUsers();
    }
  }, [activeTab, currentPage, roleFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const statsData = await adminService.getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      Alert.alert('Error', 'Failed to load admin statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const params: UserListParams = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
      };

      if (activeTab === 'coaches') {
        params.role = 'coach';
      } else if (activeTab === 'admins') {
        params.role = 'admin';
      } else if (roleFilter) {
        params.role = roleFilter;
      }

      const result = await adminService.getUsers(params);
      setUsers(result.users);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    loadUsers();
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (activeTab !== 'overview') {
      await loadUsers();
    }
    setRefreshing(false);
  };

  const handleToggleUserActive = async (user: AdminUser) => {
    try {
      const updatedUser = await adminService.toggleUserActive(user.id, !user.is_active);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleUpdateRole = async (user: AdminUser, newRole: UserRole) => {
    Alert.alert(
      'Change Role',
      `Change ${user.full_name || user.email}'s role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const updatedUser = await adminService.updateUserRole(user.id, newRole);
              setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
              await loadData(); // Refresh stats
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (user: AdminUser) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${user.full_name || user.email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              setUsers(prev => prev.filter(u => u.id !== user.id));
              await loadData(); // Refresh stats
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const renderStatCard = (label: string, value: number, icon: string, color: string) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderUserItem = (user: AdminUser) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>
            {(user.full_name || user.email)[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.full_name || 'No Name'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '30' }]}>
              <Text style={[styles.roleBadgeText, { color: getRoleColor(user.role) }]}>
                {user.role.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: user.is_active ? '#22c55e30' : '#ef444430' }]}>
              <Text style={[styles.statusBadgeText, { color: user.is_active ? '#22c55e' : '#ef4444' }]}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleUserActive(user)}
        >
          <Ionicons
            name={user.is_active ? 'pause-circle' : 'play-circle'}
            size={24}
            color={user.is_active ? '#f59e0b' : '#22c55e'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Change Role',
              'Select new role',
              [
                { text: 'User', onPress: () => handleUpdateRole(user, 'user') },
                { text: 'Coach', onPress: () => handleUpdateRole(user, 'coach') },
                { text: 'Admin', onPress: () => handleUpdateRole(user, 'admin') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.techBlue} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(user)}
        >
          <Ionicons name="trash" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'coach': return '#8b5cf6';
      case 'user': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'analytics' },
    { key: 'users', label: 'Users', icon: 'people' },
    { key: 'coaches', label: 'Coaches', icon: 'fitness' },
    { key: 'admins', label: 'Admins', icon: 'shield' },
  ];

  if (isLoading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
        <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={theme.colors.techBlue} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as TabType)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? theme.colors.techBlue : theme.colors.white60}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
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
        {activeTab === 'overview' && stats && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Stats Grid */}
            <Text style={styles.sectionTitle}>USER STATISTICS</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Total Users', stats.total_users, 'people', theme.colors.techBlue)}
              {renderStatCard('Active', stats.active_users, 'checkmark-circle', '#22c55e')}
              {renderStatCard('Inactive', stats.inactive_users, 'close-circle', '#ef4444')}
              {renderStatCard('New Today', stats.new_users_today, 'add-circle', '#f59e0b')}
            </View>

            <Text style={styles.sectionTitle}>USERS BY ROLE</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Users', stats.users_by_role.user, 'person', '#3b82f6')}
              {renderStatCard('Coaches', stats.users_by_role.coach, 'fitness', '#8b5cf6')}
              {renderStatCard('Admins', stats.users_by_role.admin, 'shield', '#ef4444')}
              {renderStatCard('This Week', stats.new_users_this_week, 'calendar', '#06b6d4')}
            </View>

            <Text style={styles.sectionTitle}>GROWTH</Text>
            <View style={styles.growthCard}>
              <View style={styles.growthItem}>
                <Text style={styles.growthValue}>{stats.new_users_this_week}</Text>
                <Text style={styles.growthLabel}>This Week</Text>
              </View>
              <View style={styles.growthDivider} />
              <View style={styles.growthItem}>
                <Text style={styles.growthValue}>{stats.new_users_this_month}</Text>
                <Text style={styles.growthLabel}>This Month</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {activeTab !== 'overview' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.white60} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor={theme.colors.white40}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.white60} />
                </TouchableOpacity>
              )}
            </View>

            {/* User List */}
            <View style={styles.userList}>
              {users.map(renderUserItem)}
            </View>

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.colors.white} />
                </TouchableOpacity>
                <Text style={styles.pageText}>
                  Page {currentPage} of {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                  onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.techBlue,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white60,
  },
  activeTabText: {
    color: theme.colors.techBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white60,
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.glass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.white60,
    marginTop: 4,
  },
  growthCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.glass,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  growthItem: {
    flex: 1,
    alignItems: 'center',
  },
  growthValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  growthLabel: {
    fontSize: 12,
    color: theme.colors.white60,
    marginTop: 4,
  },
  growthDivider: {
    width: 1,
    backgroundColor: theme.colors.white20,
    marginHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: theme.colors.white,
    fontSize: 16,
  },
  userList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.white10,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.techBlue + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.white60,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: 14,
    color: theme.colors.white60,
  },
});
