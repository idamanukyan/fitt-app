/**
 * Coach Clients Screen - Full Client Management Dashboard
 * Features: Invite flow, filtering, search, navigation, skeleton loading
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  getClients,
  inviteClient,
  getInvitations,
  parseInvitationError,
  InvitationErrorCodes,
  type InviteClientRequest,
  type InvitationResponse,
  type InvitationListItem,
} from '../../services/coachService';
import type { CoachClient } from '../../services/coachService';
import { mockClients, mockClientStats } from '../../data/mockData';

// ============================================================================
// TYPES
// ============================================================================
type FilterType = 'all' | 'active' | 'inactive';
type ClientStatus = 'active' | 'inactive' | 'invited';

interface ExtendedClient extends CoachClient {
  progress?: number;
  lastActive?: string;
  streak?: number;
  totalWorkouts?: number;
  status?: ClientStatus;
}

interface InviteFormData {
  email: string;
  name: string;
  message: string;
}

interface InviteFormErrors {
  email?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_COUNT = 5;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// ============================================================================
// SKELETON COMPONENT
// ============================================================================
const ClientSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.clientCard, { opacity }]}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, styles.skeletonBg]} />
      </View>
      <View style={styles.clientInfo}>
        <View style={[styles.skeletonText, { width: '60%', height: 16 }]} />
        <View style={[styles.skeletonText, { width: '80%', height: 12, marginTop: 6 }]} />
        <View style={[styles.skeletonText, { width: '40%', height: 10, marginTop: 6 }]} />
        <View style={[styles.skeletonBar, { marginTop: 8 }]} />
      </View>
    </Animated.View>
  );
};

// ============================================================================
// INVITE CLIENT MODAL
// ============================================================================
interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const InviteClientModal = ({ visible, onClose, onSuccess }: InviteModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    name: '',
    message: '',
  });
  const [errors, setErrors] = useState<InviteFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const resetForm = () => {
    setFormData({ email: '', name: '', message: '' });
    setErrors({});
    setSubmitStatus('idle');
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: InviteFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('clients.invite.emailRequired');
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = t('clients.invite.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (code?: string): string => {
    switch (code) {
      case InvitationErrorCodes.ALREADY_CLIENT:
        return t('clients.invite.errors.alreadyClient');
      case InvitationErrorCodes.ALREADY_INVITED:
        return t('clients.invite.errors.alreadyInvited');
      case InvitationErrorCodes.RATE_LIMITED:
        return t('clients.invite.errors.rateLimited');
      case InvitationErrorCodes.EMAIL_FAILED:
        return t('clients.invite.errors.emailFailed');
      default:
        return t('clients.invite.errorMessage');
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const request: InviteClientRequest = {
        email: formData.email.trim(),
        name: formData.name.trim() || undefined,
        message: formData.message.trim() || undefined,
      };

      await inviteClient(request);
      setSubmitStatus('success');

      // Auto-close after success
      setTimeout(() => {
        onSuccess(formData.email);
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      setSubmitStatus('error');

      // Parse error for specific message
      const parsedError = parseInvitationError(error);
      setErrorMessage(getErrorMessage(parsedError.code) || parsedError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleClose} />

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1A1A2E', '#16162A']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="person-add" size={24} color="#4ADE80" />
              </View>
              <Text style={styles.modalTitle}>{t('clients.invite.modalTitle')}</Text>
              <Text style={styles.modalSubtitle}>{t('clients.invite.modalSubtitle')}</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Success State */}
            {submitStatus === 'success' && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
                </View>
                <Text style={styles.successTitle}>{t('clients.invite.success')}</Text>
                <Text style={styles.successMessage}>
                  {t('clients.invite.successMessage', { email: formData.email })}
                </Text>
              </View>
            )}

            {/* Form */}
            {submitStatus !== 'success' && (
              <>
                {/* Email Field */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>{t('clients.invite.email')} *</Text>
                  <View style={[
                    styles.fieldInput,
                    errors.email && styles.fieldInputError,
                  ]}>
                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                    <TextInput
                      style={styles.fieldTextInput}
                      placeholder={t('clients.invite.emailPlaceholder')}
                      placeholderTextColor="#4B5563"
                      value={formData.email}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, email: text }));
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.fieldError}>{errors.email}</Text>
                  )}
                </View>

                {/* Name Field */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>{t('clients.invite.name')}</Text>
                  <View style={styles.fieldInput}>
                    <Ionicons name="person-outline" size={20} color="#6B7280" />
                    <TextInput
                      style={styles.fieldTextInput}
                      placeholder={t('clients.invite.namePlaceholder')}
                      placeholderTextColor="#4B5563"
                      value={formData.name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    />
                  </View>
                </View>

                {/* Message Field */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>{t('clients.invite.message')}</Text>
                  <View style={[styles.fieldInput, styles.fieldInputMultiline]}>
                    <TextInput
                      style={[styles.fieldTextInput, styles.fieldTextInputMultiline]}
                      placeholder={t('clients.invite.messagePlaceholder')}
                      placeholderTextColor="#4B5563"
                      value={formData.message}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* Error State */}
                {submitStatus === 'error' && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={20} color="#F87171" />
                    <Text style={styles.errorBannerText}>
                      {errorMessage || t('clients.invite.errorMessage')}
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isSubmitting ? ['#374151', '#374151'] : ['#4ADE80', '#22C55E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="#0F0F23" />
                        <Text style={styles.submitButtonText}>{t('clients.invite.send')}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
interface StatCardProps {
  value: number;
  label: string;
  color?: string;
  isActive: boolean;
  onPress: () => void;
}

const StatCard = ({ value, label, color = '#FFFFFF', isActive, onPress }: StatCardProps) => (
  <Pressable
    style={({ pressed }) => [
      styles.statCard,
      isActive && styles.statCardActive,
      pressed && styles.statCardPressed,
    ]}
    onPress={onPress}
  >
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statLabel, isActive && styles.statLabelActive]}>{label}</Text>
    {isActive && <View style={[styles.statIndicator, { backgroundColor: color }]} />}
  </Pressable>
);

// ============================================================================
// CLIENT CARD COMPONENT
// ============================================================================
interface ClientCardProps {
  client: ExtendedClient;
  onPress: () => void;
}

const ClientCard = ({ client, onPress }: ClientCardProps) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const displayName = client.profile?.full_name || client.username;
  const initials = getInitials(displayName);
  const avatarUrl = client.profile?.avatar_url;
  const fitnessLevel = client.profile?.fitness_level;
  const progress = client.progress || 0;
  const isInvited = client.status === 'invited';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getStatusColor = () => {
    if (isInvited) return '#FBBF24';
    return client.is_active ? '#4ADE80' : '#6B7280';
  };

  const getLevelBadgeStyle = () => {
    switch (fitnessLevel) {
      case 'advanced':
        return styles.levelBadgeAdvanced;
      case 'beginner':
        return styles.levelBadgeBeginner;
      default:
        return {};
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.clientCard,
          pressed && styles.clientCardPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, isInvited && styles.avatarInvited]}>
              <Text style={[styles.avatarText, isInvited && styles.avatarTextInvited]}>
                {isInvited ? '?' : initials}
              </Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        </View>

        <View style={styles.clientInfo}>
          <View style={styles.clientNameRow}>
            <Text style={styles.clientName} numberOfLines={1}>
              {displayName}
            </Text>
            {fitnessLevel && !isInvited && (
              <View style={[styles.levelBadge, getLevelBadgeStyle()]}>
                <Text style={styles.levelBadgeText}>
                  {t(`clients.fitnessLevel.${fitnessLevel}`).charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isInvited && (
              <View style={styles.invitedBadge}>
                <Text style={styles.invitedBadgeText}>{t('clients.status.invited')}</Text>
              </View>
            )}
          </View>

          <Text style={styles.clientEmail} numberOfLines={1}>{client.email}</Text>

          {client.lastActive && !isInvited && (
            <Text style={styles.clientLastActive}>
              {client.is_active ? t('clients.card.lastActive', { time: client.lastActive }) : client.lastActive}
            </Text>
          )}

          {/* Progress bar */}
          {progress > 0 && !isInvited && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
        </View>

        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ClientsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State
  const [clients, setClients] = useState<ExtendedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Convert invitation to ExtendedClient for display
  const invitationToClient = (invitation: InvitationListItem): ExtendedClient => ({
    id: -invitation.id, // Negative ID to avoid conflicts with real clients
    username: invitation.name || invitation.email.split('@')[0],
    email: invitation.email,
    is_active: false,
    assigned_at: invitation.created_at,
    status: 'invited',
  });

  // Load clients and pending invitations
  const loadClients = useCallback(async () => {
    try {
      setError(null);

      // Fetch both clients and pending invitations in parallel
      const [clientsData, invitationsData] = await Promise.all([
        getClients().catch(() => null),
        getInvitations('pending').catch(() => null),
      ]);

      const realClients: ExtendedClient[] = clientsData || [];
      const pendingInvitations: ExtendedClient[] = invitationsData?.invitations
        ? invitationsData.invitations.map(invitationToClient)
        : [];

      if (realClients.length === 0 && pendingInvitations.length === 0) {
        // Use mock data for demo
        setClients(mockClients as ExtendedClient[]);
        setUseMockData(true);
      } else {
        // Combine real clients with pending invitations
        setClients([...pendingInvitations, ...realClients]);
        setUseMockData(false);
      }
    } catch (err: any) {
      console.error('Failed to load clients, using mock data:', err);
      setClients(mockClients as ExtendedClient[]);
      setUseMockData(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Filtered and searched clients
  const filteredClients = useMemo(() => {
    let result = clients;

    // Apply status filter
    if (activeFilter === 'active') {
      result = result.filter(c => c.is_active && c.status !== 'invited');
    } else if (activeFilter === 'inactive') {
      result = result.filter(c => !c.is_active || c.status === 'invited');
    }

    // Apply search
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        c =>
          c.username.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.profile?.full_name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [clients, activeFilter, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.is_active && c.status !== 'invited').length,
    inactive: clients.filter(c => !c.is_active || c.status === 'invited').length,
  }), [clients]);

  // Handlers
  const onRefresh = () => {
    setIsRefreshing(true);
    loadClients();
  };

  const handleClientPress = (clientId: number) => {
    // Navigate to client detail - placeholder route
    router.push(`/(coach-tabs)/client/${clientId}` as any);
  };

  const handleInviteSuccess = (email: string) => {
    // Add invited client to list immediately for responsive UX
    const newInvitedClient: ExtendedClient = {
      id: -Date.now(), // Negative ID to avoid conflicts
      username: email.split('@')[0],
      email,
      is_active: false,
      assigned_at: new Date().toISOString(),
      status: 'invited',
    };
    setClients(prev => [newInvitedClient, ...prev]);

    // Reload in background to get accurate server state
    loadClients();
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  // Empty state renderer
  const renderEmptyState = () => {
    const hasFilters = activeFilter !== 'all' || debouncedSearch.trim();

    if (hasFilters) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={48} color="#6B7280" />
          </View>
          <Text style={styles.emptyTitle}>{t('clients.emptyFiltered.title')}</Text>
          <Text style={styles.emptySubtitle}>{t('clients.emptyFiltered.subtitle')}</Text>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>{t('clients.emptyFiltered.clearFilters')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="people-outline" size={48} color="#6B7280" />
        </View>
        <Text style={styles.emptyTitle}>{t('clients.empty.title')}</Text>
        <Text style={styles.emptySubtitle}>{t('clients.empty.subtitle')}</Text>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setShowInviteModal(true)}
        >
          <LinearGradient
            colors={['#4ADE80', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.inviteButtonGradient}
          >
            <Ionicons name="person-add" size={18} color="#0F0F23" />
            <Text style={styles.inviteButtonText}>{t('clients.empty.inviteCta')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('clients.title')}</Text>
        </View>
        <View style={styles.searchContainer}>
          <View style={[styles.skeletonBg, { flex: 1, height: 48, borderRadius: 12 }]} />
        </View>
        <View style={styles.statsRow}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.statCard, styles.skeletonBg]} />
          ))}
        </View>
        <View style={styles.listContent}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ClientSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t('clients.title')}</Text>
          {useMockData && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>{t('clients.demo')}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowInviteModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={22} color="#4ADE80" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, searchQuery && styles.searchContainerActive]}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('clients.search.placeholder')}
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Summary - Clickable Filters */}
      <View style={styles.statsRow}>
        <StatCard
          value={stats.total}
          label={t('clients.stats.total')}
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <StatCard
          value={stats.active}
          label={t('clients.stats.active')}
          color="#4ADE80"
          isActive={activeFilter === 'active'}
          onPress={() => setActiveFilter('active')}
        />
        <StatCard
          value={stats.inactive}
          label={t('clients.stats.inactive')}
          color="#FBBF24"
          isActive={activeFilter === 'inactive'}
          onPress={() => setActiveFilter('inactive')}
        />
      </View>

      {/* Error State */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#F87171" />
          <Text style={styles.errorText}>{t('clients.error.loadFailed')}</Text>
          <TouchableOpacity onPress={loadClients} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('clients.error.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onPress={() => handleClientPress(item.id)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            filteredClients.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#4ADE80"
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Invite Modal */}
      <InviteClientModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  demoBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FBBF24',
    letterSpacing: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchContainerActive: {
    borderColor: 'rgba(74, 222, 128, 0.4)',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  statCardPressed: {
    opacity: 0.8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statLabelActive: {
    color: '#9CA3AF',
  },
  statIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Client Card
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  clientCardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInvited: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ADE80',
  },
  avatarTextInvited: {
    color: '#FBBF24',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0F0F23',
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  levelBadgeAdvanced: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  levelBadgeBeginner: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ADE80',
  },
  invitedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  invitedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FBBF24',
  },
  clientEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  clientLastActive: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4ADE80',
    width: 32,
  },
  chevronContainer: {
    paddingLeft: 8,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inviteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F0F23',
  },
  clearFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 15,
    color: '#F87171',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderRadius: 8,
  },
  retryText: {
    color: '#F87171',
    fontWeight: '600',
  },

  // Skeleton
  skeletonBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skeletonText: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
  },
  skeletonBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    width: '70%',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  modalHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  fieldInputError: {
    borderColor: '#F87171',
    backgroundColor: 'rgba(248, 113, 113, 0.05)',
  },
  fieldInputMultiline: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  fieldTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  fieldTextInputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: 12,
    color: '#F87171',
    marginTop: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#F87171',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F0F23',
  },

  // Success State
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4ADE80',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
