/**
 * InvitationAcceptScreen - Handle coach invitation acceptance
 * Displays invitation details and allows user to accept/decline
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../utils/theme';
import invitationService, {
  InvitationInfo,
  InvitationValidation,
} from '../services/invitationService';

export default function InvitationAcceptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [validation, setValidation] = useState<InvitationValidation | null>(null);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (token) {
      loadInvitation();
    } else {
      setError('Invalid invitation link');
      setIsLoading(false);
    }
  }, [token]);

  const loadInvitation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validationResult = await invitationService.validateInvitation(token);
      setValidation(validationResult);

      if (validationResult.valid && validationResult.invitation) {
        setInvitation(validationResult.invitation);
      } else if (validationResult.valid) {
        const info = await invitationService.getInvitationInfo(token);
        setInvitation(info);
      } else {
        setError(validationResult.message);
      }
    } catch (err: any) {
      console.error('Failed to load invitation:', err);
      setError(err.response?.data?.detail || 'Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    try {
      const result = await invitationService.acceptInvitation(token);

      Alert.alert(
        'Success!',
        `You are now connected with ${result.coach_name}`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/dashboard' as any),
          },
        ]
      );
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to accept invitation';
      Alert.alert('Error', message);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Invitation',
      'Are you sure you want to decline this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderExpiration = () => {
    if (!invitation) return null;

    const { expired, days, hours, minutes } = invitationService.getExpirationTime(invitation);

    if (expired) {
      return (
        <View style={styles.expirationBadge}>
          <Ionicons name="time" size={14} color="#ef4444" />
          <Text style={[styles.expirationText, { color: '#ef4444' }]}>Expired</Text>
        </View>
      );
    }

    let text = '';
    if (days > 0) {
      text = `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      text = `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
      text = `${minutes} minute${minutes > 1 ? 's' : ''} left`;
    }

    return (
      <View style={styles.expirationBadge}>
        <Ionicons name="time" size={14} color="#f59e0b" />
        <Text style={styles.expirationText}>{text}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[theme.colors.black, theme.colors.concreteDark]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={theme.colors.techBlue} />
        <Text style={styles.loadingText}>Loading invitation...</Text>
      </View>
    );
  }

  if (error || !invitation) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.black, theme.colors.concreteDark]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="close-circle" size={64} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Invalid Invitation</Text>
          <Text style={styles.errorMessage}>
            {error || 'This invitation link is invalid or has expired.'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isExpired = invitationService.isInvitationExpired(invitation);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.black, theme.colors.concreteDark, theme.colors.concrete]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Coach Avatar */}
        <View style={styles.avatarContainer}>
          {invitation.coach_avatar_url ? (
            <Image source={{ uri: invitation.coach_avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {invitation.coach_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.coachBadge}>
            <Ionicons name="fitness" size={16} color={theme.colors.white} />
          </View>
        </View>

        {/* Invitation Title */}
        <Text style={styles.title}>Coach Invitation</Text>

        {/* Coach Info */}
        <View style={styles.coachCard}>
          <Text style={styles.coachName}>{invitation.coach_name}</Text>
          {invitation.coach_specialization && (
            <Text style={styles.coachSpecialization}>
              {invitation.coach_specialization}
            </Text>
          )}
          <Text style={styles.coachEmail}>{invitation.coach_email}</Text>

          {invitation.coach_bio && (
            <Text style={styles.coachBio} numberOfLines={3}>
              "{invitation.coach_bio}"
            </Text>
          )}

          {invitation.message && (
            <View style={styles.messageContainer}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.colors.techBlue} />
              <Text style={styles.personalMessage}>{invitation.message}</Text>
            </View>
          )}

          {renderExpiration()}
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          By accepting this invitation, {invitation.coach_name} will become your coach
          and gain access to view your fitness progress, workouts, and goals.
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isExpired ? (
            <View style={styles.expiredMessage}>
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.expiredText}>
                This invitation has expired. Please ask your coach to send a new one.
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAccept}
                disabled={isAccepting}
              >
                <LinearGradient
                  colors={[theme.colors.techBlue, '#2563eb']}
                  style={styles.acceptGradient}
                >
                  {isAccepting ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.white} />
                      <Text style={styles.acceptText}>Accept Invitation</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={handleDecline}
                disabled={isAccepting}
              >
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.white60,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.glass,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.techBlue,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.techBlue + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.techBlue,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.techBlue,
  },
  coachBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.techBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.black,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white60,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  coachCard: {
    width: '100%',
    backgroundColor: theme.colors.glass,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.white10,
  },
  coachName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  coachSpecialization: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.techBlue,
    marginBottom: 4,
  },
  coachEmail: {
    fontSize: 13,
    color: theme.colors.white60,
    marginBottom: 16,
  },
  coachBio: {
    fontSize: 14,
    color: theme.colors.white60,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.techBlue + '15',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  personalMessage: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.white,
    lineHeight: 18,
  },
  expirationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.white10,
    borderRadius: 20,
  },
  expirationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.white40,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  acceptButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  declineButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  declineText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white60,
  },
  expiredMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ef444420',
    padding: 16,
    borderRadius: 12,
  },
  expiredText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
    lineHeight: 20,
  },
});
