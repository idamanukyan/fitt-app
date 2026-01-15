/**
 * Invitation Service for HyperFit
 *
 * Handles client-side invitation acceptance flow:
 * - Validate invitation tokens
 * - Get invitation details
 * - Accept invitations
 *
 * Note: Coach-side invitation sending is handled by coachService
 */

import apiClient from './api';

// ============================================================================
// TYPES
// ============================================================================

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface InvitationInfo {
  id: number;
  coach_id: number;
  coach_name: string;
  coach_email: string;
  coach_specialization?: string;
  coach_bio?: string;
  coach_avatar_url?: string;
  client_email: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  message?: string;
}

export interface InvitationValidation {
  valid: boolean;
  status: InvitationStatus;
  message: string;
  invitation?: InvitationInfo;
}

export interface AcceptInvitationResult {
  success: boolean;
  message: string;
  coach_id: number;
  coach_name: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Validate an invitation token
 * No authentication required
 */
export const validateInvitation = async (token: string): Promise<InvitationValidation> => {
  const response = await apiClient.get<InvitationValidation>('/api/invite/validate', {
    params: { token },
  });
  return response.data;
};

/**
 * Get invitation details by token
 * No authentication required
 */
export const getInvitationInfo = async (token: string): Promise<InvitationInfo> => {
  const response = await apiClient.get<InvitationInfo>(`/api/invite/info/${token}`);
  return response.data;
};

/**
 * Accept an invitation
 * Requires authentication - user must be logged in
 */
export const acceptInvitation = async (token: string): Promise<AcceptInvitationResult> => {
  const response = await apiClient.post<AcceptInvitationResult>('/api/invite/accept', { token });
  return response.data;
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Check if invitation is valid and not expired
 */
export const isInvitationValid = async (token: string): Promise<boolean> => {
  try {
    const result = await validateInvitation(token);
    return result.valid && result.status === 'pending';
  } catch (error) {
    return false;
  }
};

/**
 * Check if invitation has expired
 */
export const isInvitationExpired = (invitation: InvitationInfo): boolean => {
  const expiresAt = new Date(invitation.expires_at);
  return expiresAt < new Date();
};

/**
 * Get remaining time until expiration
 */
export const getExpirationTime = (invitation: InvitationInfo): {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
} => {
  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { expired: false, days, hours, minutes };
};

/**
 * Format expiration time as string
 */
export const formatExpirationTime = (invitation: InvitationInfo): string => {
  const { expired, days, hours, minutes } = getExpirationTime(invitation);

  if (expired) {
    return 'Expired';
  }

  if (days > 0) {
    return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
};

/**
 * Extract token from invitation URL
 */
export const extractTokenFromUrl = (url: string): string | null => {
  try {
    // Handle various URL formats
    // e.g., hyperfit://invite?token=xxx or https://hyperfit.com/invite?token=xxx
    const urlObj = new URL(url);
    return urlObj.searchParams.get('token');
  } catch {
    // Try to extract from simple query string
    const match = url.match(/[?&]token=([^&]+)/);
    return match ? match[1] : null;
  }
};

/**
 * Handle deep link invitation
 * Call this when app receives an invitation deep link
 */
export const handleInvitationDeepLink = async (
  url: string
): Promise<{ valid: boolean; invitation?: InvitationInfo; error?: string }> => {
  const token = extractTokenFromUrl(url);

  if (!token) {
    return { valid: false, error: 'Invalid invitation link' };
  }

  try {
    const validation = await validateInvitation(token);

    if (!validation.valid) {
      return { valid: false, error: validation.message };
    }

    const invitation = await getInvitationInfo(token);
    return { valid: true, invitation };
  } catch (error: any) {
    return { valid: false, error: error.message || 'Failed to validate invitation' };
  }
};

export default {
  validateInvitation,
  getInvitationInfo,
  acceptInvitation,
  isInvitationValid,
  isInvitationExpired,
  getExpirationTime,
  formatExpirationTime,
  extractTokenFromUrl,
  handleInvitationDeepLink,
};
