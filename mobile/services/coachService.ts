/**
 * Coach Service - API calls for coach functionality
 */
import apiClient from './api';
import {
  CoachProfile,
  CoachProfileUpdate,
  CoachClient,
  ClientAssignment,
  CoachWithProfile,
  UserProfile,
  Goal,
  Measurement,
} from '../types/api.types';

// Re-export types for convenience
export type { CoachProfile, CoachProfileUpdate, CoachClient, CoachWithProfile };

const COACH_BASE = '/api/coach';

// ============================================================================
// COACH PROFILE
// ============================================================================

export const getCoachProfile = async (): Promise<CoachProfile> => {
  const response = await apiClient.get(`${COACH_BASE}/profile`);
  return response.data;
};

export const createCoachProfile = async (data: CoachProfileUpdate): Promise<CoachProfile> => {
  const response = await apiClient.post(`${COACH_BASE}/profile`, data);
  return response.data;
};

export const updateCoachProfile = async (data: CoachProfileUpdate): Promise<CoachProfile> => {
  const response = await apiClient.put(`${COACH_BASE}/profile`, data);
  return response.data;
};

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export const getClients = async (): Promise<CoachClient[]> => {
  const response = await apiClient.get(`${COACH_BASE}/clients`);
  return response.data;
};

export const assignClient = async (clientId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`${COACH_BASE}/clients/assign`, {
    client_id: clientId,
  });
  return response.data;
};

export const unassignClient = async (clientId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`${COACH_BASE}/clients/unassign`, {
    client_id: clientId,
  });
  return response.data;
};

// ============================================================================
// CLIENT INVITATION TYPES
// ============================================================================

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | 'declined';

export interface InviteClientRequest {
  email: string;
  name?: string;
  message?: string;
}

export interface InvitationResponse {
  id: number;
  email: string;
  name: string | null;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  days_until_expiry: number;
  message: string;
}

export interface InvitationListItem {
  id: number;
  email: string;
  name: string | null;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  email_sent_at: string | null;
  resend_count: number;
}

export interface InvitationListResponse {
  invitations: InvitationListItem[];
  total: number;
  pending_count: number;
  accepted_count: number;
  expired_count: number;
}

export interface InvitationErrorResponse {
  detail: {
    message: string;
    code: string;
  } | string;
}

// Error codes from backend
export const InvitationErrorCodes = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  ALREADY_ACCEPTED: 'ALREADY_ACCEPTED',
  REVOKED: 'REVOKED',
  ALREADY_CLIENT: 'ALREADY_CLIENT',
  ALREADY_INVITED: 'ALREADY_INVITED',
  EMAIL_FAILED: 'EMAIL_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

// ============================================================================
// CLIENT INVITATION ENDPOINTS
// ============================================================================

/**
 * Send an invitation to a potential client
 *
 * Sends a real email with a secure invitation link.
 * Idempotent: re-inviting same email returns existing pending invitation.
 */
export const inviteClient = async (data: InviteClientRequest): Promise<InvitationResponse> => {
  const response = await apiClient.post(`${COACH_BASE}/clients/invite`, data);
  return response.data;
};

/**
 * Get all invitations sent by current coach
 *
 * @param status - Optional filter: 'pending', 'accepted', 'expired', 'revoked'
 */
export const getInvitations = async (status?: InvitationStatus): Promise<InvitationListResponse> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/invitations`, {
    params: status ? { status } : undefined,
  });
  return response.data;
};

/**
 * Get pending invitations only (convenience method)
 */
export const getPendingInvitations = async (): Promise<InvitationListItem[]> => {
  const response = await getInvitations('pending');
  return response.invitations;
};

/**
 * Revoke (cancel) a pending invitation
 *
 * The invitation link will no longer work.
 */
export const cancelInvitation = async (invitationId: number): Promise<{ message: string; invitation_id: number }> => {
  const response = await apiClient.delete(`${COACH_BASE}/clients/invitations/${invitationId}`);
  return response.data;
};

/**
 * Resend an invitation email
 *
 * Generates a new token and sends fresh email.
 * Max 3 resends, 30-minute cooldown between resends.
 */
export const resendInvitation = async (invitationId: number): Promise<InvitationResponse> => {
  const response = await apiClient.post(`${COACH_BASE}/clients/invitations/${invitationId}/resend`);
  return response.data;
};

/**
 * Parse invitation error from API response
 */
export const parseInvitationError = (error: any): { message: string; code?: string } => {
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return { message: detail };
    }
    if (typeof detail === 'object' && detail.message) {
      return { message: detail.message, code: detail.code };
    }
  }
  return { message: error?.message || 'An unexpected error occurred' };
};

// ============================================================================
// CLIENT DATA ACCESS
// ============================================================================

export const getClientProfile = async (clientId: number): Promise<UserProfile> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/profile`);
  return response.data;
};

export const getClientGoals = async (clientId: number): Promise<Goal[]> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/goals`);
  return response.data;
};

export const getClientMeasurements = async (
  clientId: number,
  limit: number = 30
): Promise<Measurement[]> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/measurements`, {
    params: { limit },
  });
  return response.data;
};

export interface ClientStats {
  total_measurements: number;
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  latest_weight: number | null;
  weight_change_30d: number | null;
}

export const getClientStats = async (clientId: number): Promise<ClientStats> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/stats`);
  return response.data;
};

// ============================================================================
// COACH DISCOVERY (PUBLIC)
// ============================================================================

export const discoverCoaches = async (): Promise<CoachWithProfile[]> => {
  const response = await apiClient.get(`${COACH_BASE}/discover`);
  return response.data;
};

export const getMyCoaches = async (): Promise<CoachWithProfile[]> => {
  const response = await apiClient.get(`${COACH_BASE}/my-coaches`);
  return response.data;
};
